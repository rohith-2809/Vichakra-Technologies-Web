const bcrypt       = require('bcryptjs');
const path         = require('path');
const fs           = require('fs');
const axios        = require('axios');
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
  const allowed = ['name', 'email', 'company', 'phone', 'industry', 'isActive', 'avatar'];
  const update  = Object.fromEntries(
    Object.entries(req.body).filter(([k]) => allowed.includes(k))
  );
  // Check email uniqueness if updating email
  if (update.email) {
    const existing = await User.findOne({ email: update.email, _id: { $ne: req.params.id } });
    if (existing) return res.status(400).json({ error: 'Email already in use' });
  }
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

exports.deleteClient = async (req, res) => {
  const client = await User.findOne({ _id: req.params.id, role: 'client' });
  if (!client) return res.status(404).json({ error: 'Client not found' });

  // Cascade-delete all client data
  const clientProjects = await Project.find({ client: client._id }).select('_id');
  const projectIds = clientProjects.map(p => p._id);

  await Promise.all([
    Project.deleteMany({ client: client._id }),
    FileModel.deleteMany({ uploadedBy: client._id }),
    Message.deleteMany({ sender: client._id }),
    Feedback.deleteMany({ client: client._id }),
    SupportTicket.deleteMany({ client: client._id }),
    Requirements.deleteMany({ client: client._id }),
    StatusUpdate.deleteMany({ project: { $in: projectIds } }),
  ]);

  await client.deleteOne();
  res.json({ message: 'Client permanently deleted' });
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

// ── AI Email Generator ─────────────────────────────────────────────────────────
// AI writes ONLY the content (JSON). We assemble the premium HTML here.
const buildEmailHtml = exports.buildEmailHtml = ({ eyebrow, headline, body, ctaText, ctaUrl, note }) => {
  const PORTAL = 'https://www.vichakratechnologies.com/login';
  const link   = ctaUrl || PORTAL;
  const noteHtml = note
    ? `<div style="border-top:1px solid #f1f5f9;padding-top:20px;margin-top:8px">
         <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif;color:#94a3b8;font-size:13px;line-height:1.7">${note}</p>
       </div>`
    : '';

  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.12)">
  <!-- HEADER -->
  <div style="background:linear-gradient(135deg,#0f172a 0%,#134e4a 100%);padding:36px 40px 28px;text-align:center">
    <div style="display:inline-block;background:rgba(15,118,110,0.25);border:1px solid rgba(20,184,166,0.3);border-radius:10px;padding:8px 20px;margin-bottom:16px">
      <p style="margin:0;color:#5eead4;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif">Vichakra Technologies</p>
    </div>
    <div style="width:48px;height:3px;background:linear-gradient(90deg,#0f766e,#14b8a6);margin:0 auto"></div>
  </div>
  <!-- BODY -->
  <div style="padding:48px 40px 40px">
    <p style="margin:0 0 10px;color:#0f766e;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase">${eyebrow}</p>
    <h1 style="margin:0 0 20px;color:#0f172a;font-size:26px;font-weight:800;line-height:1.3">${headline}</h1>
    <div style="color:#475569;font-size:15px;line-height:1.85;margin-bottom:32px">${body.replace(/\n/g, '<br/>')}</div>
    <div style="text-align:center;margin-bottom:32px">
      <a href="${link}" style="display:inline-block;background:linear-gradient(135deg,#0f766e,#0d9488);color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:16px 40px;border-radius:10px;letter-spacing:0.3px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif">${ctaText} →</a>
    </div>
    ${noteHtml}
  </div>
  <!-- FOOTER -->
  <div style="background:#0f172a;padding:32px 40px;text-align:center">
    <p style="margin:0 0 4px;color:#ffffff;font-size:15px;font-weight:700;letter-spacing:0.5px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif">Vichakra Technologies</p>
    <p style="margin:0 0 16px;color:#64748b;font-size:12px;letter-spacing:0.3px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif">Crafting Digital Excellence</p>
    <div style="width:40px;height:2px;background:linear-gradient(90deg,#0f766e,#14b8a6);margin:0 auto 16px"></div>
    <p style="margin:0 0 6px;color:#475569;font-size:11px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif">© 2026 Vichakra Technologies. All rights reserved.</p>
    <p style="margin:0 0 4px;font-size:11px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif"><a href="https://www.vichakratechnologies.com" style="color:#14b8a6;text-decoration:none">www.vichakratechnologies.com</a></p>
    <p style="margin:0;font-size:11px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif"><a href="mailto:info@vichakratechnologies.com" style="color:#0f766e;text-decoration:none">info@vichakratechnologies.com</a></p>
  </div>
</div>`;
};

exports.generateEmailWithGrok = async (req, res) => {
  const { prompt } = req.body;
  if (!prompt?.trim()) return res.status(400).json({ error: 'prompt is required' });

  let response;
  try {
    response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        max_tokens: 350,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You are a professional email copywriter for Vichakra Technologies, a software development agency. ' +
              'Given a prompt, return ONLY a JSON object with these exact keys:\n' +
              '- eyebrow: short 2-4 word category label (e.g. "Project Update", "Welcome Aboard")\n' +
              '- headline: punchy, bold headline sentence (max 10 words)\n' +
              '- body: 2-3 short engaging paragraphs separated by \\n (plain text, no HTML)\n' +
              '- ctaText: action button label (3-5 words, no arrow)\n' +
              '- ctaUrl: leave empty string ""\n' +
              '- note: optional 1 sentence footer note, or empty string ""\n' +
              'Keep tone confident, warm, and professional. No fluff.',
          },
          { role: 'user', content: prompt.trim() },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );
  } catch (err) {
    const message = err.response?.data?.error?.message || err.message || 'AI error';
    console.error('Groq API error:', err.response?.status, err.response?.data || err.message);
    return res.status(502).json({ error: `AI: ${message}` });
  }

  let content;
  try {
    content = JSON.parse(response.data.choices?.[0]?.message?.content || '{}');
  } catch {
    return res.status(500).json({ error: 'AI returned invalid content' });
  }

  const { eyebrow, headline, body, ctaText, ctaUrl, note } = content;
  if (!headline || !body) return res.status(500).json({ error: 'AI returned incomplete content' });

  const html = buildEmailHtml({
    eyebrow:  eyebrow  || 'Message',
    headline: headline,
    body:     body,
    ctaText:  ctaText  || 'View in Portal',
    ctaUrl:   ctaUrl   || '',
    note:     note     || 'Reply to this email if you have any questions — we\'re always here.',
  });

  res.json({ html });
};


