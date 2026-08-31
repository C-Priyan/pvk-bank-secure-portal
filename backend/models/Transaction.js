const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 1 },
    status: { 
        type: String, 
        enum: ['Pending_OTP', 'Completed', 'Flagged', 'Blocked'], 
        default: 'Pending_OTP' 
    },
    fraudReason: { type: String, default: null }, 
    
    otpCode: { type: String }, 
    otpExpiresAt: { type: Date } 
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);