const mongoose = require('mongoose');

const requirementsSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      unique: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vision:          { type: String, trim: true },
    targetAudience:  { type: String, trim: true },
    goals:           [{ type: String }],
    designPreferences: {
      style:              { type: String },
      colorPreference:    { type: String },
      referenceWebsites:  [{ type: String }],
    },
    features:        [{ type: String }],
    files:           [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
    additionalNotes: { type: String, trim: true },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'acknowledged'],
      default: 'draft',
    },
    submittedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Requirements', requirementsSchema);
