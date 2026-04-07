const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Signup Route
router.post('/signup', async (req, res) => {
    try {
        if (!JWT_SECRET) {
            return res.status(500).json({
                success: false,
                message: 'Server configuration error: JWT_SECRET is not set.'
            });
        }

        const name = req.body?.name?.trim();
        const email = req.body?.email?.trim().toLowerCase();
        const password = req.body?.password;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and password'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Create new user
        const user = new User({ name, email, password });
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'Signup successful!',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        if (error.name === 'ValidationError') {
            const firstError = Object.values(error.errors)[0]?.message || 'Invalid signup data';
            return res.status(400).json({
                success: false,
                message: firstError
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error during signup. Please try again.'
        });
    }
});

// Admin Login Route
router.post('/admin/login', async (req, res) => {
    try {
        if (!JWT_SECRET) {
            return res.status(500).json({
                success: false,
                message: 'Server configuration error: JWT_SECRET is not set.'
            });
        }

        const email = req.body?.email?.trim().toLowerCase();
        const password = req.body?.password;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user and select password field
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if user is admin
        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Admin login successful!',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error during admin login: ' + error.message
        });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    try {
        if (!JWT_SECRET) {
            return res.status(500).json({
                success: false,
                message: 'Server configuration error: JWT_SECRET is not set.'
            });
        }

        const email = req.body?.email?.trim().toLowerCase();
        const password = req.body?.password;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user and select password field
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Login successful!',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error during login: ' + error.message
        });
    }
});

module.exports = router;
