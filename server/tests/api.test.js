const request    = require('supertest');
const mongoose   = require('mongoose');
const app        = require('../src/app'); // your Express app export
const User       = require('../src/models/User');
const Project    = require('../src/models/Project');
const Requirements = require('../src/models/Requirements');
const Message    = require('../src/models/Message');

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
let adminToken, clientToken;
let clientUser, adminUser, project;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_TEST_URI || 'mongodb://127.0.0.1:27017/vichakra_test');

  // Create admin
  adminUser = await User.create({ name: 'Admin', email: 'admin@test.com', password: 'Admin@123', role: 'admin' });
  // Create client
  clientUser = await User.create({ name: 'Test Client', email: 'client@test.com', password: 'Client@123', role: 'client' });

  // Login admin
  const ar = await request(app).post('/api/auth/login').send({ email: 'admin@test.com', password: 'Admin@123' });
  adminToken = ar.body.accessToken;

  // Login client
  const cr = await request(app).post('/api/auth/login').send({ email: 'client@test.com', password: 'Client@123' });
  clientToken = cr.body.accessToken;

  // Create project for client
  project = await Project.create({ title: 'Test Project', client: clientUser._id, status: 'active' });
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. Auth Tests
// ─────────────────────────────────────────────────────────────────────────────
describe('Auth', () => {
  test('POST /api/auth/login — success with valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'client@test.com', password: 'Client@123' });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.role).toBe('client');
  });

  test('POST /api/auth/login — fails with wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'client@test.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  test('POST /api/auth/forgotpassword — sends OTP for existing email', async () => {
    const res = await request(app).post('/api/auth/forgotpassword').send({ email: 'client@test.com' });
    expect(res.status).toBe(200);
    expect(res.body.message).toBeDefined();
  });

  test('POST /api/auth/forgotpassword — returns 404 for unknown email', async () => {
    const res = await request(app).post('/api/auth/forgotpassword').send({ email: 'nobody@test.com' });
    expect(res.status).toBe(404);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Portal — Requirements Tests
// ─────────────────────────────────────────────────────────────────────────────
describe('Portal Requirements', () => {
  test('GET /api/portal/requirements/:id — returns null for new project', async () => {
    const res = await request(app)
      .get(`/api/portal/requirements/${project._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(200);
    expect(res.body.requirements).toBeNull();
  });

  test('POST /api/portal/requirements — saves a draft', async () => {
    const res = await request(app)
      .post('/api/portal/requirements')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        project: project._id,
        projectType: 'Web Application',
        vision: 'An e-commerce platform for selling handmade goods online.',
        targetAudience: 'Artists and craft sellers',
        deliverables: ['Web Development', 'E-Commerce'],
      });
    expect(res.status).toBe(200);
    expect(res.body.requirements.projectType).toBe('Web Application');
    expect(res.body.requirements.status).toBe('draft');
  });

  test('POST /api/portal/requirements — rejects if project not owned by client', async () => {
    const otherProject = await Project.create({ title: 'Other', client: adminUser._id, status: 'active' });
    const res = await request(app)
      .post('/api/portal/requirements')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ project: otherProject._id, vision: 'Hacking in.' });
    expect(res.status).toBe(404);
  });

  test('PATCH /api/portal/requirements/:id — submits requirements', async () => {
    const reqs = await Requirements.findOne({ project: project._id });
    const res = await request(app)
      .patch(`/api/portal/requirements/${reqs._id}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ status: 'submitted' });
    expect(res.status).toBe(200);
    expect(res.body.requirements.status).toBe('submitted');
  });

  test('POST /api/portal/requirements — rejects save on submitted requirements', async () => {
    const res = await request(app)
      .post('/api/portal/requirements')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ project: project._id, vision: 'Trying to edit after submit.' });
    expect(res.status).toBe(400);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Messaging Tests
// ─────────────────────────────────────────────────────────────────────────────
describe('Portal Messaging', () => {
  test('POST /api/portal/messages — client sends a message', async () => {
    const res = await request(app)
      .post('/api/portal/messages')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ projectId: project._id, content: 'Hello, I have a question about the timeline.' });
    expect(res.status).toBe(201);
    expect(res.body.message.senderRole).toBe('client');
  });

  test('GET /api/portal/messages/:projectId — client fetches messages', async () => {
    const res = await request(app)
      .get(`/api/portal/messages/${project._id}`)
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.messages)).toBe(true);
    expect(res.body.messages.length).toBeGreaterThan(0);
  });

  test('POST /api/admin/messages — admin replies', async () => {
    const res = await request(app)
      .post('/api/admin/messages')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ projectId: project._id, content: 'Hi! The timeline is 6 weeks.' });
    expect(res.status).toBe(201);
    expect(res.body.message.senderRole).toBe('admin');
  });

  test('GET /api/portal/messages/unread — returns unread count', async () => {
    const res = await request(app)
      .get('/api/portal/messages/unread')
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(200);
    expect(typeof res.body.count).toBe('number');
  });

  test('POST /api/portal/messages — rejects empty content', async () => {
    const res = await request(app)
      .post('/api/portal/messages')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ projectId: project._id, content: '   ' });
    expect(res.status).toBe(400);
  });

  test('GET /api/admin/messages — admin lists all threads', async () => {
    const res = await request(app)
      .get('/api/admin/messages')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.threads)).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Email Composer Tests
// ─────────────────────────────────────────────────────────────────────────────
describe('Admin Email Composer', () => {
  test('GET /api/admin/email/clients — returns active clients', async () => {
    const res = await request(app)
      .get('/api/admin/email/clients')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.clients)).toBe(true);
    expect(res.body.clients.some(c => c.email === 'client@test.com')).toBe(true);
  });

  test('POST /api/admin/email/send — rejects missing fields', async () => {
    const res = await request(app)
      .post('/api/admin/email/send')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ to: 'client@test.com' }); // missing subject and htmlBody
    expect(res.status).toBe(400);
  });

  test('POST /api/admin/email/send — rejects non-client emails', async () => {
    const res = await request(app)
      .post('/api/admin/email/send')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ to: 'random@unknown.com', subject: 'Test', htmlBody: '<p>Hi</p>' });
    expect(res.status).toBe(404);
  });

  test('GET /api/admin/email/clients — blocked for non-admin', async () => {
    const res = await request(app)
      .get('/api/admin/email/clients')
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.status).toBe(403);
  });
});
