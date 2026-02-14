const mongoose = require('mongoose');

// Define Report schema with garbage types
const reportSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    garbageType: {
        type: String,
        enum: ['Plastic', 'Wet Waste', 'Medical Waste', 'Overflowing Bin', 'Illegal Dumping'],
        required: [true, 'Please specify garbage type']
    },
    description: {
        type: String,
        required: [true, 'Please provide description'],
        maxlength: 500
    },
    image: {
        type: String // Store image filename/path
    },
    latitude: {
        type: Number,
        required: [true, 'Latitude is required']
    },
    longitude: {
        type: Number,
        required: [true, 'Longitude is required']
    },
    status: {
        type: String,
        enum: ['Pending', 'Resolved'],
        default: 'Pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Report', reportSchema);
