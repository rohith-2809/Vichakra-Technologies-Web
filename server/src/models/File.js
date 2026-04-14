const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
    filename:     { type: String, required: true },
    originalName: { type: String, required: true },
    mimetype:     { type: String, required: true },
    size:         { type: Number, required: true },
    path:         { type: String, required: true },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
    isPublic: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('File', fileSchema);
