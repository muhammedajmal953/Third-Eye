const mongoose = require('mongoose');

// Define OTP Schema
const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 // OTPs expire after 5 minutes (300 seconds)
    }
});

const otpModel = mongoose.model('OTP', otpSchema);

module.exports = otpModel;
