const Project      = require('../models/Project');
const StatusUpdate = require('../models/StatusUpdate');
const Requirements = require('../models/Requirements');
const FileModel    = require('../models/File');
const Feedback     = require('../models/Feedback');
const SupportTicket = require('../models/SupportTicket');
const User         = require('../models/User');
const Message      = require('../models/Message');

// ── Projects & status ─────────────────────────────────────────────────────────
exports.getMyProjects = async (req, res) => {
  const projects = await Project.find({ client: req.user._id })
    .sort({ updatedAt: -1 })
    .populate('attachments')
    .lean();
    
  for (let p of projects) {
    const reqs = await Requirements.findOne({ project: p._id }).select('status');
    p.requirementsStatus = reqs ? reqs.status : 'none';
  }

  res.json({ projects });
};

exports.getStatusUpdates = async (req, res) => {
  // Returns global updates + updates for this client's projects
  const myProjects = await Project.find({ client: req.user._id }).select('_id');
  const projectIds = myProjects.map((p) => p._id);

  const updates = await StatusUpdate.find({
    $or: [{ project: null }, { project: { $in: projectIds } }],
  })
    .sort({ createdAt: -1 })
    .populate('project', 'title');
  res.json({ updates });
};

exports.completeOnboarding = async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { isFirstLogin: false });
  res.json({ message: 'Onboarding complete' });
};

// ── Requirements ──────────────────────────────────────────────────────────────
exports.getRequirements = async (req, res) => {
  // Security: ensure project belongs to this client
  const project = await Project.findOne({ _id: req.params.projectId, client: req.user._id });
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const reqs = await Requirements.findOne({ project: project._id }).populate('files');
  res.json({ requirements: reqs || null });
};

exports.saveRequirements = async (req, res) => {
  const { project, projectType, vision, targetAudience, competitors, goals, brandValues, deliverables, designPreferences, features, integrations, additionalNotes } = req.body;

  // Security: ensure project belongs to this client
  const proj = await Project.findOne({ _id: project, client: req.user._id });
  if (!proj) return res.status(404).json({ error: 'Project not found' });

  // Check if already submitted (locked)
  const existing = await Requirements.findOne({ project });
  if (existing && existing.status === 'submitted') {
    return res.status(400).json({ error: 'Requirements already submitted. Contact support to request changes.' });
  }

  const reqs = await Requirements.findOneAndUpdate(
    { project },
    { project, client: req.user._id, projectType, vision, targetAudience, competitors, goals, brandValues, deliverables, designPreferences, features, integrations, additionalNotes },
    { upsert: true, new: true, runValidators: true }
  );
  res.json({ requirements: reqs });
};

exports.updateRequirements = async (req, res) => {
  const reqs = await Requirements.findOne({ _id: req.params.id, client: req.user._id });
  if (!reqs) return res.status(404).json({ error: 'Not found' });
  if (reqs.status === 'submitted') {
    return res.status(400).json({ error: 'Already submitted. Contact support to request changes.' });
  }

  const { status, ...rest } = req.body;

  // Allow submitting
  if (status === 'submitted') {
    reqs.status = 'submitted';
    reqs.submittedAt = new Date();
  }
  Object.assign(reqs, rest);
  await reqs.save();
  res.json({ requirements: reqs });
};

exports.uploadRequirementFiles = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }
  const reqs = await Requirements.findOne({ _id: req.params.id, client: req.user._id });
  if (!reqs) return res.status(404).json({ error: 'Requirements not found' });
  if (reqs.status === 'submitted') {
    return res.status(400).json({ error: 'Requirements already submitted.' });
  }

  const savedFiles = await Promise.all(
    req.files.map((f) =>
      FileModel.create({
        filename:     f.filename,
        originalName: f.originalname,
        mimetype:     f.mimetype,
        size:         f.size,
        path:         f.path,
        uploadedBy:   req.user._id,
        project:      reqs.project,
        isPublic:     false,
      })
    )
  );

  reqs.files.push(...savedFiles.map((f) => f._id));
  await reqs.save();
  res.json({ files: savedFiles });
};

exports.deleteRequirementFile = async (req, res) => {
  const reqs = await Requirements.findOne({ _id: req.params.id, client: req.user._id });
  if (!reqs) return res.status(404).json({ error: 'Requirements not found' });
  if (reqs.status === 'submitted') {
    return res.status(400).json({ error: 'Requirements already submitted.' });
  }

  // Remove file reference from reqs
  reqs.files = reqs.files.filter(fId => fId.toString() !== req.params.fileId);
  await reqs.save();

  // Find the file model
  const file = await FileModel.findOne({ _id: req.params.fileId, uploadedBy: req.user._id });
  if (file) {
    const fs = require('fs');
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    await FileModel.findByIdAndDelete(req.params.fileId);
  }

  res.json({ message: 'File removed successfully' });
};

// ── Files (public files visible to client) ────────────────────────────────────
exports.getProjectFiles = async (req, res) => {
  // Security: ensure project belongs to this client
  const project = await Project.findOne({ _id: req.params.projectId, client: req.user._id });
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const files = await FileModel.find({ project: project._id, isPublic: true })
    .sort({ createdAt: -1 })
    .populate('uploadedBy', 'name');
  res.json({ files });
};

// ── Feedback ──────────────────────────────────────────────────────────────────
exports.getFeedback = async (req, res) => {
  const fb = await Feedback.findOne({ project: req.params.projectId, client: req.user._id });
  res.json({ feedback: fb || null });
};

exports.submitFeedback = async (req, res) => {
  const { project, rating, communication, quality, timeliness, comments } = req.body;

  // Only allow feedback on delivered or closed projects
  const proj = await Project.findOne({ _id: project, client: req.user._id });
  if (!proj) return res.status(404).json({ error: 'Project not found' });
  if (!['delivered', 'closed'].includes(proj.status)) {
    return res.status(400).json({ error: 'Feedback can only be submitted after project delivery.' });
  }

  const existing = await Feedback.findOne({ project, client: req.user._id });
  if (existing) return res.status(400).json({ error: 'You have already submitted feedback for this project.' });

  const fb = await Feedback.create({ project, client: req.user._id, rating, communication, quality, timeliness, comments });
  res.status(201).json({ feedback: fb });
};

// ── Support tickets ───────────────────────────────────────────────────────────
exports.getMyTickets = async (req, res) => {
  const tickets = await SupportTicket.find({ client: req.user._id })
    .sort({ createdAt: -1 })
    .populate('project', 'title');
  res.json({ tickets });
};

exports.createTicket = async (req, res) => {
  const { project, subject, message, category } = req.body;
  if (!subject || !message) {
    return res.status(400).json({ error: 'subject and message are required' });
  }
  const ticket = await SupportTicket.create({
    client: req.user._id, project: project || null, subject, message, category,
  });
  res.status(201).json({ ticket });
};

// ── Messages ──────────────────────────────────────────────────────────────────
exports.getMessages = async (req, res) => {
  const { projectId } = req.params;

  // Ensure this project belongs to this client
  const project = await Project.findOne({ _id: projectId, client: req.user._id });
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const messages = await Message.find({ project: projectId })
    .sort({ createdAt: 1 })
    .populate('sender', 'name role avatar')
    .lean();

  // Mark all admin messages as read
  await Message.updateMany(
    { project: projectId, senderRole: 'admin', isRead: false },
    { isRead: true }
  );

  res.json({ messages });
};

exports.sendMessage = async (req, res) => {
  const { projectId, content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Content is required' });

  const project = await Project.findOne({ _id: projectId, client: req.user._id });
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const msg = await Message.create({
    project: projectId,
    sender: req.user._id,
    senderRole: 'client',
    content: content.trim(),
  });
  const populated = await msg.populate('sender', 'name role avatar');
  res.status(201).json({ message: populated });
};

exports.getUnreadCount = async (req, res) => {
  // Get all projects for this client
  const projects = await Project.find({ client: req.user._id }).select('_id').lean();
  const projectIds = projects.map(p => p._id);

  const count = await Message.countDocuments({
    project: { $in: projectIds },
    senderRole: 'admin',
    isRead: false,
  });

  res.json({ count });
};

