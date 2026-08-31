const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import Models
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const AuditLog = require('./models/AuditLog');

const app = express();
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/secure_tx_db')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err.message));

// ==========================================
// FRAUD DETECTION & TRANSACTION ROUTES
// ==========================================

// 1. Initiate Transfer (Evaluates Rules)
app.post('/api/transfer', async (req, res) => {
    try {
        const { senderId, receiverId, amount } = req.body;

        // Rule 1: The Velocity Check (Max 3 transactions in 5 minutes)
        const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
        const recentTxs = await Transaction.countDocuments({ 
            senderId, 
            createdAt: { $gte: fiveMinsAgo } 
        });

        if (recentTxs >= 3) {
            const blockedTx = await Transaction.create({
                senderId, receiverId, amount, status: 'Blocked', fraudReason: 'Velocity Check Failed: Spam detected'
            });
            return res.status(403).json({ message: 'Transaction blocked due to suspicious activity.', transaction: blockedTx });
        }

        // Rule 2: The Threshold Check (High Value)
        if (amount > 50000) {
            const flaggedTx = await Transaction.create({
                senderId, receiverId, amount, status: 'Flagged', fraudReason: 'High Value Threshold Exceeded'
            });
            return res.status(202).json({ message: 'Transaction flagged for manual review.', transaction: flaggedTx });
        }

        // Rule 3: Standard Transaction (Requires OTP)
        const otpCode = Math.floor(1000 + Math.random() * 9000).toString(); // Generate 4-digit OTP
        const pendingTx = await Transaction.create({
            senderId, receiverId, amount, status: 'Pending_OTP', otpCode, otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000)
        });

        // In a real app, you would SMS/Email this OTP. For the hackathon, we return it to easily test.
        res.status(200).json({ message: 'OTP required to proceed.', transactionId: pendingTx._id, mockOTP: otpCode });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Verify OTP
app.post('/api/verify-otp', async (req, res) => {
    try {
        const { transactionId, otpCode } = req.body;
        const transaction = await Transaction.findById(transactionId);

        if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
        if (transaction.status !== 'Pending_OTP') return res.status(400).json({ error: 'Transaction not in pending state' });
        
        if (transaction.otpCode === otpCode && new Date() < transaction.otpExpiresAt) {
            transaction.status = 'Completed';
            await transaction.save();
            // Note: Actual balance deduction logic would go here
            return res.status(200).json({ message: 'Transaction completed successfully.', transaction });
        } else {
            return res.status(401).json({ error: 'Invalid or expired OTP' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// ADMIN OVERSIGHT ROUTES
// ==========================================

// 3. Get Flagged Transactions
app.get('/api/admin/flagged', async (req, res) => {
    try {
        const flaggedTxs = await Transaction.find({ status: 'Flagged' }).populate('senderId', 'username').populate('receiverId', 'username');
        res.status(200).json(flaggedTxs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. Resolve Flagged Transactions
app.post('/api/admin/resolve', async (req, res) => {
    try {
        const { transactionId, adminId, action, justification } = req.body; 
        // action should be 'Approved' or 'Rejected'

        const transaction = await Transaction.findById(transactionId);
        if (!transaction) return res.status(404).json({ error: 'Transaction not found' });

        transaction.status = action === 'Approved' ? 'Completed' : 'Blocked';
        await transaction.save();

        const auditLog = await AuditLog.create({
            adminId,
            transactionId,
            actionTaken: action,
            justification
        });

        res.status(200).json({ message: `Transaction ${action.toLowerCase()} successfully.`, auditLog });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));