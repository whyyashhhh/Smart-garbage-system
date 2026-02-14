const express = require('express');
const multer = require('multer');
const path = require('path');
const Report = require('../models/Report');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const adminAuthMiddleware = require('../middleware/adminAuth');
const { sendReportResolvedEmail, sendNewReportNotification } = require('../services/emailService');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Generate unique filename with timestamp
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        // Only accept image files
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Create a new report
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const { garbageType, description, latitude, longitude } = req.body;

        // Validate required fields
        if (!garbageType || !description || latitude === undefined || longitude === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Create report object
        const reportData = {
            userId: req.userId,
            garbageType,
            description,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude)
        };

        // Add image path if file was uploaded
        if (req.file) {
            reportData.image = req.file.filename;
        }

        // Save report to database
        const report = new Report(reportData);
        await report.save();

        // Send email notification to admin
        try {
            const user = await User.findById(req.userId);
            await sendNewReportNotification(report, user);
        } catch (emailError) {
            console.error('Email notification failed:', emailError.message);
            // Don't fail the request if email fails
        }

        res.status(201).json({
            success: true,
            message: 'Report submitted successfully!',
            report
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating report: ' + error.message
        });
    }
});

// Get all reports for current user
router.get('/user', authMiddleware, async (req, res) => {
    try {
        const reports = await Report.find({ userId: req.userId }).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: reports.length,
            reports
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching reports: ' + error.message
        });
    }
});

// Get all reports (public)
router.get('/all', async (req, res) => {
    try {
        // Get nearby reports within 5km radius (optional)
        const { latitude, longitude } = req.query;

        let query = {};

        if (latitude && longitude) {
            const lat = parseFloat(latitude);
            const lng = parseFloat(longitude);
            // Simple distance filter (roughly 5km)
            query = {
                latitude: { $gte: lat - 0.05, $lte: lat + 0.05 },
                longitude: { $gte: lng - 0.05, $lte: lng + 0.05 }
            };
        }

        const reports = await Report.find(query)
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: reports.length,
            reports
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching reports: ' + error.message
        });
    }
});

// Get single report by ID
router.get('/:id', async (req, res) => {
    try {
        const report = await Report.findById(req.params.id)
            .populate('userId', 'name email');

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        res.json({
            success: true,
            report
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching report: ' + error.message
        });
    }
});

// Update report status
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;

        // Find report and verify ownership
        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        if (report.userId.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this report'
            });
        }

        // Update status
        if (status) {
            report.status = status;
        }

        await report.save();

        res.json({
            success: true,
            message: 'Report updated successfully!',
            report
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating report: ' + error.message
        });
    }
});

// Delete report
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        if (report.userId.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this report'
            });
        }

        await Report.deleteOne({ _id: req.params.id });

        res.json({
            success: true,
            message: 'Report deleted successfully!'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting report: ' + error.message
        });
    }
});

// ============ ADMIN ROUTES ============

// Get all reports for admin dashboard
router.get('/admin/all', adminAuthMiddleware, async (req, res) => {
    try {
        const { status } = req.query;
        
        let query = {};
        if (status && status !== 'All') {
            query.status = status;
        }

        const reports = await Report.find(query)
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        // Get statistics  
        const totalReports = await Report.countDocuments();
        const pendingReports = await Report.countDocuments({ status: 'Pending' });
        const resolvedReports = await Report.countDocuments({ status: 'Resolved' });

        res.json({
            success: true,
            count: reports.length,
            reports,
            statistics: {
                total: totalReports,
                pending: pendingReports,
                resolved: resolvedReports
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching reports: ' + error.message
        });
    }
});

// Admin: Resolve a report and send email
router.put('/admin/resolve/:id', adminAuthMiddleware, async (req, res) => {
    try {
        const report = await Report.findById(req.params.id).populate('userId', 'name email');

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        // Update status to Resolved
        report.status = 'Resolved';
        await report.save();

        // Send email notification
        try {
            const emailResult = await sendReportResolvedEmail(report, report.userId);
            console.log('Email sent:', emailResult);
        } catch (emailError) {
            console.error('Email failed but report resolved:', emailError);
        }

        res.json({
            success: true,
            message: 'Report resolved and notification sent!',
            report
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error resolving report: ' + error.message
        });
    }
});

// Admin: Delete any report
router.delete('/admin/:id', adminAuthMiddleware, async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);

         if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        await Report.deleteOne({ _id: req.params.id });

        res.json({
            success: true,
            message: 'Report deleted successfully!'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting report: ' + error.message
        });
    }
});

module.exports = router;
