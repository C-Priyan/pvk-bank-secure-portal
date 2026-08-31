const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', required: true },
    actionTaken: { type: String, enum: ['Approved', 'Rejected'], required: true },
    justification: { type: String, required: true } 
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);