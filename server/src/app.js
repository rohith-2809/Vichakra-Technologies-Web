require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express    = require('express');
const cors       = require('cors');
const morgan     = require('morgan');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser  = require('cookie-parser');
const path       = require('path');
const connectDB  = require('./config/db');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Database ────────────────────────────────────────────────────────────────
connectDB().then(() => {
  const autoSeedAdmins = require('./utils/autoSeed');
  autoSeedAdmins();
});

// ── Security middleware ─────────────────────────────────────────────────────
app.use(helmet());
app.use(mongoSanitize());
app.use(cookieParser());

// Auth rate limiter (applied per-route in routes/auth.js for /login)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/login', authLimiter);

// ── CORS ────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [process.env.CLIENT_URL, 'http://localhost:5173'].filter(Boolean),
  credentials: true,
}));

// ── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Logging ──────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ── Static files (uploaded assets) ───────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api', require('./routes/index'));

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  // Mongoose validation error — return 400 with human-readable messages
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: messages[0], details: messages });
  }
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(400).json({ error: `${field} already in use` });
  }
  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  // Multer file size / type errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large. Maximum size is 10 MB' });
  }
  if (err.message?.includes('not allowed')) {
    return res.status(400).json({ error: err.message });
  }

  console.error(err.stack);
  const status  = err.statusCode || 500;
  const message = err.message    || 'Internal server error';
  res.status(status).json({ error: message });
});

// ── Keep Alive (for Render) ──────────────────────────────────────────────────
const axios = require('axios');
setInterval(() => {
  const url = process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL.replace('www.', 'api.') // Basic heuristic for API URL
    : `http://localhost:${PORT}`;
  
  axios.get(`${url}/api/health`)
    .then(() => console.log('Keep-alive ping successful'))
    .catch((err) => console.error('Keep-alive ping failed:', err.message));
}, 10 * 60 * 1000); // 10 minutes

// ── Start ──────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
