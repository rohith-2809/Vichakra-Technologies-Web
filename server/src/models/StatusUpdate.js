const mongoose = require('mongoose');

const statusUpdateSchema = new mongoose.Schema(
  {
    title:   { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['info', 'success', 'warning'],
      default: 'info',
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null, // null = global update for all clients
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('StatusUpdate', statusUpdateSchema);
