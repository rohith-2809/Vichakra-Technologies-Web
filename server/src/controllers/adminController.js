const bcrypt       = require('bcryptjs');
const path         = require('path');
const fs           = require('fs');
const User         = require('../models/User');
const Project      = require('../models/Project');
const FileModel    = require('../models/File');
const StatusUpdate = require('../models/StatusUpdate');
const Requirements = require('../models/Requirements');
const Feedback     = require('../models/Feedback');
const SupportTicket = require('../models/SupportTicket');
const sendEmail    = require('../utils/mailer');
const Message      = require('../models/Message');

// ── Dashboard stats ───────────────────────────────────────────────────────────
exports.getStats = async (_req, res) => {
  const [totalClients, activeProjects, openTickets, totalFiles] = await Promise.all([
    User.countDocuments({ role: 'client', isActive: true }),
    Project.countDocuments({ status: 'active' }),
    SupportTicket.countDocuments({ status: 'open' }),
    FileModel.countDocuments(),
  ]);
  const recentProjects = await Project.find()
    .sort({ updatedAt: -1 })
    .limit(5)
    .populate('client', 'name company');
  res.json({ totalClients, activeProjects, openTickets, totalFiles, recentProjects });
};

// ── Clients ───────────────────────────────────────────────────────────────────
exports.getClients = async (_req, res) => {
  const clients = await User.find({ role: 'client' }).sort({ createdAt: -1 });
  res.json({ clients });
};

exports.getClient = async (req, res) => {
  const client = await User.findOne({ _id: req.params.id, role: 'client' });
  if (!client) return res.status(404).json({ error: 'Client not found' });
  const projects = await Project.find({ client: client._id });
  res.json({ client, projects });
};

exports.createClient = async (req, res) => {
  const { name, email, password, company, phone, industry } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email, and password are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' });
  }
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ error: 'Email already in use' });

  const user = await User.create({ name, email, password, company, phone, industry, role: 'client' });
  res.status(201).json({
    message: 'Client created',
    client: { _id: user._id, name: user.name, email: user.email, company: user.company },
    tempPassword: password, // dev only — remove before production
  });
};

exports.updateClient = async (req, res) => {
  const allowed = ['name', 'company', 'phone', 'industry', 'isActive', 'avatar'];
  const update  = Object.fromEntries(
    Object.entries(req.body).filter(([k]) => allowed.includes(k))
  );
  const client = await User.findOneAndUpdate(
    { _id: req.params.id, role: 'client' },
    update,
    { new: true, runValidators: true }
  );
  if (!client) return res.status(404).json({ error: 'Client not found' });
  res.json({ client });
};

exports.deactivateClient = async (req, res) => {
  const activeProjects = await Project.countDocuments({
    client: req.params.id,
    status: 'active',
  });
  if (activeProjects > 0) {
    return res.status(400).json({
      error: `Client has ${activeProjects} active project(s). Reassign or close them first.`,
    });
  }
  await User.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ message: 'Client deactivated' });
};

// ── Projects ──────────────────────────────────────────────────────────────────
exports.getProjects = async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.client) filter.client = req.query.client;
  const projects = await Project.find(filter)
    .sort({ updatedAt: -1 })
    .populate('client', 'name company email');
  res.json({ projects });
};

exports.getProject = async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('client', 'name company email phone')
    .populate('attachments');
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json({ project });
};

exports.createProject = async (req, res) => {
  const { title, description, client, startDate, endDate, notes } = req.body;
  if (!title || !client) {
    return res.status(400).json({ error: 'title and client are required' });
  }
  const project = await Project.create({ title, description, client, startDate, endDate, notes });
  res.status(201).json({ project });
};

exports.updateProject = async (req, res) => {
  const allowed = ['title', 'description', 'status', 'milestones', 'demoLinks', 'notes', 'startDate', 'endDate'];
  const update  = Object.fromEntries(
    Object.entries(req.body).filter(([k]) => allowed.includes(k))
  );
  const project = await Project.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json({ project });
};

exports.deleteProject = async (req, res) => {
  await Project.findByIdAndUpdate(req.params.id, { isDeleted: true });
  res.json({ message: 'Project archived' });
};

exports.getProjectRequirements = async (req, res) => {
  const reqs = await Requirements.findOne({ project: req.params.id })
    .populate('files')
    .populate('client', 'name company');
  res.json({ requirements: reqs || null });
};

// ── Files ─────────────────────────────────────────────────────────────────────
exports.uploadFile = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const { project, isPublic } = req.body;
  const file = await FileModel.create({
    filename:     req.file.filename,
    originalName: req.file.originalname,
    mimetype:     req.file.mimetype,
    size:         req.file.size,
    path:         req.file.path,
    uploadedBy:   req.user._id,
    project:      project || undefined,
    isPublic:     isPublic === 'true',
  });
  // Attach to project if specified
  if (project) {
    await Project.findByIdAndUpdate(project, { $push: { attachments: file._id } });
  }
  res.status(201).json({ file });
};

exports.getFiles = async (req, res) => {
  const filter = {};
  if (req.query.project) filter.project = req.query.project;
  const files = await FileModel.find(filter)
    .sort({ createdAt: -1 })
    .populate('uploadedBy', 'name')
    .populate('project', 'title');
  res.json({ files });
};

exports.updateFile = async (req, res) => {
  const { isPublic, project } = req.body;
  const update = {};
  if (isPublic !== undefined) update.isPublic = isPublic;
  if (project  !== undefined) update.project  = project;
  const file = await FileModel.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!file) return res.status(404).json({ error: 'File not found' });
  res.json({ file });
};

exports.deleteFile = async (req, res) => {
  const file = await FileModel.findById(req.params.id);
  if (!file) return res.status(404).json({ error: 'File not found' });
  // Remove from disk
  if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
  // Remove from project attachments
  if (file.project) {
    await Project.findByIdAndUpdate(file.project, { $pull: { attachments: file._id } });
  }
  await file.deleteOne();
  res.json({ message: 'File deleted' });
};

// ── Status updates ────────────────────────────────────────────────────────────
exports.getStatusUpdates = async (_req, res) => {
  const updates = await StatusUpdate.find()
    .sort({ createdAt: -1 })
    .populate('project', 'title')
    .populate('createdBy', 'name');
  res.json({ updates });
};

exports.createStatusUpdate = async (req, res) => {
  const { title, message, type, project } = req.body;
  if (!title || !message) {
    return res.status(400).json({ error: 'title and message are required' });
  }
  const update = await StatusUpdate.create({
    title, message, type, project: project || null, createdBy: req.user._id,
  });
  res.status(201).json({ update });
};

exports.deleteStatusUpdate = async (req, res) => {
  await StatusUpdate.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
};

// ── Feedback ──────────────────────────────────────────────────────────────────
exports.getAllFeedback = async (_req, res) => {
  const feedback = await Feedback.find()
    .sort({ createdAt: -1 })
    .populate('client', 'name company')
    .populate('project', 'title');
  res.json({ feedback });
};

exports.updateFeedback = async (req, res) => {
  const { isPublic } = req.body;
  const fb = await Feedback.findByIdAndUpdate(req.params.id, { isPublic }, { new: true });
  if (!fb) return res.status(404).json({ error: 'Feedback not found' });
  res.json({ feedback: fb });
};

// ── Support tickets ───────────────────────────────────────────────────────────
exports.getAllTickets = async (_req, res) => {
  const tickets = await SupportTicket.find()
    .sort({ createdAt: -1 })
    .populate('client', 'name company email')
    .populate('project', 'title');
  res.json({ tickets });
};

exports.respondToTicket = async (req, res) => {
  const { adminResponse, status } = req.body;
  const ticket = await SupportTicket.findByIdAndUpdate(
    req.params.id,
    { adminResponse, status: status || 'resolved' },
    { new: true }
  ).populate('client', 'name email');

  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  // Send email if there is an admin response
  if (adminResponse && ticket.client && ticket.client.email) {
    try {
      await sendEmail({
        email: ticket.client.email,
        subject: `Response to your support ticket: ${ticket.subject}`,
        message: `Hello ${ticket.client.name},\n\nWe have responded to your ticket.\n\nResponse:\n${adminResponse}\n\nBest regards,\nVichakra Support`,
        html: `
          <p>Hello ${ticket.client.name},</p>
          <p>We have responded to your ticket: <strong>${ticket.subject}</strong></p>
          <hr />
          <p><strong>Response:</strong></p>
          <p>${adminResponse.replace(/\n/g, '<br/>')}</p>
          <hr />
          <p>Best regards,<br/>Vichakra Support</p>
        `,
      });
    } catch (err) {
      console.error('Error sending support ticket response email:', err);
      // We don't fail the request if the email fails, just log it.
    }
  }

  res.json({ ticket });
};

// ── Admin Messaging ───────────────────────────────────────────────────────────
exports.getAllProjectMessages = async (req, res) => {
  // Get all project threads with unread count, sorted by latest message
  const projects = await Project.find({})
    .select('title client')
    .populate('client', 'name email')
    .lean();

  const threads = await Promise.all(
    projects.map(async (proj) => {
      const lastMsg = await Message.findOne({ project: proj._id })
        .sort({ createdAt: -1 })
        .populate('sender', 'name')
        .lean();
      const unread = await Message.countDocuments({
        project: proj._id,
        senderRole: 'client',
        isRead: false,
      });
      return { project: proj, lastMessage: lastMsg, unreadCount: unread };
    })
  );

  // Sort: threads with messages first, then by latest message date
  threads.sort((a, b) => {
    if (!a.lastMessage && !b.lastMessage) return 0;
    if (!a.lastMessage) return 1;
    if (!b.lastMessage) return -1;
    return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
  });

  res.json({ threads });
};

exports.getProjectMessages = async (req, res) => {
  const { projectId } = req.params;

  const messages = await Message.find({ project: projectId })
    .sort({ createdAt: 1 })
    .populate('sender', 'name role avatar')
    .lean();

  // Mark client messages as read when admin views them
  await Message.updateMany(
    { project: projectId, senderRole: 'client', isRead: false },
    { isRead: true }
  );

  res.json({ messages });
};

exports.sendAdminMessage = async (req, res) => {
  const { projectId, content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Content is required' });

  const project = await Project.findById(projectId);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const msg = await Message.create({
    project: projectId,
    sender: req.user._id,
    senderRole: 'admin',
    content: content.trim(),
  });
  const populated = await msg.populate('sender', 'name role avatar');
  res.status(201).json({ message: populated });
};

// ── Email Composer ─────────────────────────────────────────────────────────────
exports.getClientsForEmail = async (req, res) => {
  const clients = await User.find({ role: 'client', isActive: true })
    .select('name email company')
    .sort({ name: 1 })
    .lean();
  res.json({ clients });
};

exports.sendEmailToClient = async (req, res) => {
  const { to, subject, htmlBody } = req.body;

  if (!to || !subject || !htmlBody) {
    return res.status(400).json({ error: 'to, subject, and htmlBody are required' });
  }

  // Validate recipients are real clients
  const emails = Array.isArray(to) ? to : [to];
  const clients = await User.find({ email: { $in: emails }, role: 'client' }).select('name email').lean();

  if (clients.length === 0) {
    return res.status(404).json({ error: 'No valid client emails found' });
  }

  const results = await Promise.allSettled(
    clients.map(client =>
      sendEmail({
        email: client.email,
        subject,
        message: subject,
        html: htmlBody,
      })
    )
  );

  const failed = results.filter(r => r.status === 'rejected').length;
  const sent   = results.filter(r => r.status === 'fulfilled').length;

  res.json({
    message: `Email sent to ${sent} client(s)${failed > 0 ? `, ${failed} failed` : ''}`,
    sent,
    failed,
  });
};


