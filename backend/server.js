const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');

const app = express();
const isVercel = Boolean(process.env.VERCEL);
const NODE_ENV = (process.env.NODE_ENV || 'development').trim().toLowerCase();
const isProduction = NODE_ENV === 'production';
const uploadDir = process.env.UPLOAD_DIR || (isVercel ? '/tmp/uploads' : path.join(__dirname, 'uploads'));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(uploadDir));

// Database Connection
const mongoUriFromEnv =
    process.env.MONGODB_URI ||
    process.env.MONGODB_URL ||
    process.env.MONGO_URI ||
    process.env.MONGODB ||
    process.env.DATABASE_URL ||
    '';

const normalizeMongoUri = (uri) => {
    const raw = (uri || '').trim();
    if (!raw) {
        return '';
    }

    // Add common Atlas params if missing to reduce connection compatibility issues.
    if (raw.startsWith('mongodb+srv://')) {
        const hasQuery = raw.includes('?');
        if (!hasQuery) {
            return `${raw}?retryWrites=true&w=majority`;
        }

        const hasRetryWrites = /[?&]retryWrites=/.test(raw);
        const hasWriteConcern = /[?&]w=/.test(raw);
        let updated = raw;

        if (!hasRetryWrites) {
            updated += '&retryWrites=true';
        }
        if (!hasWriteConcern) {
            updated += '&w=majority';
        }

        return updated;
    }

    return raw;
};

const MONGODB_URI = normalizeMongoUri(mongoUriFromEnv || (!isVercel ? 'mongodb://localhost:27017/smart-garbage-reporting' : ''));
const JWT_SECRET = (process.env.JWT_SECRET || '').trim();
let lastMongoError = null;

const getMongoTroubleshootingHints = (errorMessage = '') => {
    const message = errorMessage.toLowerCase();
    const hints = [];

    if (!MONGODB_URI) {
        hints.push('Set MONGODB_URI in backend/.env (or your deployment environment variables).');
        return hints;
    }

    if (message.includes('bad auth') || message.includes('authentication failed')) {
        hints.push('Check Atlas database username/password in MONGODB_URI. URL-encode special characters in the password.');
    }

    if (message.includes('enotfound') || message.includes('querysrv')) {
        hints.push('Check your Atlas cluster hostname in MONGODB_URI and verify DNS/network access from your machine/server.');
    }

    if (message.includes('server selection timed out')) {
        hints.push('Whitelist your current IP in Atlas Network Access and ensure your internet/firewall allows MongoDB connections.');
    }

    if (message.includes('econnrefused')) {
        hints.push('Local MongoDB is not reachable. Start MongoDB service or switch MONGODB_URI to Atlas.');
    }

    if (hints.length === 0) {
        hints.push('Verify MONGODB_URI format, Atlas Network Access IP whitelist, and database user permissions.');
    }

    return hints;
};

const getMissingEnvVars = () => {
    const missing = [];
    if (!MONGODB_URI) {
        missing.push('MONGODB_URI');
    }
    if (!JWT_SECRET) {
        missing.push('JWT_SECRET');
    }
    return missing;
};

let cached = global.mongoose;
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    if (!MONGODB_URI) {
        lastMongoError = new Error('MONGODB_URI is not set');
        throw new Error('MONGODB_URI is not set');
    }

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose
            .connect(MONGODB_URI, {
                serverSelectionTimeoutMS: 20000,
                socketTimeoutMS: 45000,
                maxPoolSize: 10,
                family: 4
            })
            .then((mongooseInstance) => {
                lastMongoError = null;
                return mongooseInstance;
            })
            .catch((error) => {
                cached.promise = null;
                lastMongoError = error;
                throw error;
            });
    }

    cached.conn = await cached.promise;
    return cached.conn;
};

connectDB()
    .then(() => {
        console.log('✅ Connected to MongoDB');
    })
    .catch((error) => {
        console.error('❌ MongoDB connection error:', error.message);
        const hints = getMongoTroubleshootingHints(error.message);
        hints.forEach((hint) => console.error(`   - ${hint}`));
        console.warn('⚠️  Server will continue running; database-backed routes may return 503 until MongoDB is reachable.');
    });

// Health check route (kept before DB-gated /api middleware)
app.get('/api/health', (req, res) => {
    const state = mongoose.connection.readyState;
    const dbStatus = state === 1 ? 'connected' : 'disconnected';
    const missingEnvVars = getMissingEnvVars();

    res.json({
        success: true,
        message: 'Server is running',
        database: dbStatus,
        missingEnvVars,
        mongoConfigured: Boolean(MONGODB_URI),
        mongoLastError: lastMongoError?.message || null
    });
});

app.use('/api', async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        const hints = getMongoTroubleshootingHints(error.message);
        const response = {
            success: false,
            message: 'Database connection unavailable.',
            hints
        };

        if (!isProduction) {
            response.reason = error.message;
        }

        res.status(503).json(response);
    }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/auth', authRoutes);
app.use('/reports', reportRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Server error'
    });
});

// Start server (local/dev)
if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
