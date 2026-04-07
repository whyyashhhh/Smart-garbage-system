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
    process.env.DATABASE_URL ||
    '';

const MONGODB_URI = (mongoUriFromEnv || (!isVercel ? 'mongodb://localhost:27017/smart-garbage-reporting' : '')).trim();
const JWT_SECRET = (process.env.JWT_SECRET || '').trim();

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
        throw new Error('MONGODB_URI is not set');
    }

    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose
            .connect(MONGODB_URI, {
                serverSelectionTimeoutMS: 10000,
                family: 4
            })
            .then((mongooseInstance) => mongooseInstance)
            .catch((error) => {
                cached.promise = null;
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
        if (!isVercel) {
            process.exit(1);
        }
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
        missingEnvVars
    });
});

app.use('/api', async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        res.status(503).json({
            success: false,
            message: 'Database connection unavailable. Verify MONGODB_URI and MongoDB Atlas network access.'
        });
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
