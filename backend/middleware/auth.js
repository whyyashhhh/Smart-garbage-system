const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
    try {
        if (!JWT_SECRET) {
            return res.status(500).json({
                success: false,
                message: 'Server configuration error: JWT_SECRET is not set.'
            });
        }

        // Get token from Authorization header
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided. Please login first.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.id;
        req.email = decoded.email;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token. Please login again.'
        });
    }
};

module.exports = authMiddleware;
