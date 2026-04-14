const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['guidance', 'bug', 'change-request', 'general'],
      default: 'general',
    },
    status: {
      type: String,
      enum: ['open', 'in-progress', 'resolved'],
      default: 'open',
    },
    adminResponse: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
