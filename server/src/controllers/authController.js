const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcryptjs');
const { validationResult } = require('express-validator');
const User    = require('../models/User');

// ── Token helpers ─────────────────────────────────────────────────────────────
const signAccess = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });

const signRefresh = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days
};

// ── Login ─────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.isActive) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const match = await user.comparePassword(password);
  if (!match) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const accessToken  = signAccess(user._id);
  const refreshToken = signRefresh(user._id);

  // Store hashed refresh token in DB
  user.refreshToken = await bcrypt.hash(refreshToken, 10);
  await user.save({ validateBeforeSave: false });

  // Set httpOnly cookie
  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

  res.json({
    accessToken,
    user: {
      _id:          user._id,
      name:         user.name,
      email:        user.email,
      role:         user.role,
      company:      user.company,
      isFirstLogin: user.isFirstLogin,
      avatar:       user.avatar,
    },
  });
};

// ── Refresh ───────────────────────────────────────────────────────────────────
exports.refresh = async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(401).json({ error: 'No refresh token' });

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || !user.isActive || !user.refreshToken) {
    return res.status(401).json({ error: 'Session expired' });
  }

  const valid = await bcrypt.compare(token, user.refreshToken);
  if (!valid) return res.status(401).json({ error: 'Invalid refresh token' });

  // Rotate tokens
  const newAccess  = signAccess(user._id);
  const newRefresh = signRefresh(user._id);

  user.refreshToken = await bcrypt.hash(newRefresh, 10);
  await user.save({ validateBeforeSave: false });

  res.cookie('refreshToken', newRefresh, COOKIE_OPTIONS);
  res.json({ accessToken: newAccess });
};

// ── Logout ────────────────────────────────────────────────────────────────────
exports.logout = async (req, res) => {
  const user = await User.findById(req.user._id).select('+refreshToken');
  if (user) {
    user.refreshToken = undefined;
    await user.save({ validateBeforeSave: false });
  }
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out' });
};

// ── Get current user ──────────────────────────────────────────────────────────
exports.getMe = (req, res) => {
  res.json({ user: req.user });
};
