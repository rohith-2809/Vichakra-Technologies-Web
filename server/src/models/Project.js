const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  dueDate:   { type: Date },
  completed: { type: Boolean, default: false },
});

const demoLinkSchema = new mongoose.Schema({
  label: { type: String, required: true },
  url:   { type: String, required: true },
});

const projectSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'in-review', 'delivered', 'closed'],
      default: 'draft',
    },
    milestones:  [milestoneSchema],
    demoLinks:   [demoLinkSchema],
    attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
    notes:       { type: String }, // internal admin notes
    startDate:   { type: Date },
    endDate:     { type: Date },
    isDeleted:   { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Exclude soft-deleted projects from all queries by default
projectSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});

module.exports = mongoose.model('Project', projectSchema);
