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
    projectType:     { type: String, trim: true },
    vision:          { type: String, trim: true },
    targetAudience:  { type: String, trim: true },
    competitors:     [{ type: String }],
    goals:           [{ type: String }],
    brandValues:     [{ type: String }],
    deliverables:    [{ type: String }],
    designPreferences: {
      style:                { type: String },
      colorPreference:      { type: String },
      typographyPreference: { type: String },
      referenceWebsites:    [{ type: String }],
    },
    features:        [{ type: String }],
    integrations:    [{ type: String }],
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
