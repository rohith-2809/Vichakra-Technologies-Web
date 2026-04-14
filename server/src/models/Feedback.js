const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating:        { type: Number, min: 1, max: 5, required: true },
    communication: { type: Number, min: 1, max: 5, required: true },
    quality:       { type: Number, min: 1, max: 5, required: true },
    timeliness:    { type: Number, min: 1, max: 5, required: true },
    comments:      { type: String, trim: true },
    isPublic:      { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Feedback', feedbackSchema);
