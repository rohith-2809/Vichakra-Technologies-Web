const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcryptjs');
const { validationResult } = require('express-validator');
const User    = require('../models/User');
const crypto  = require('crypto');
const sendEmail = require('../utils/mailer');

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
  secure:   true, // Required for sameSite: 'none'
  sameSite: 'none',
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

  // Send Welcome Email if this is their first login
  if (user.isFirstLogin && !user.welcomeEmailSent) {
    try {
      const welcomeMessage = `Welcome to Vichakra Technologies, ${user.name}!`;
      await sendEmail({
        email: user.email,
        subject: 'Welcome to Vichakra Technologies!',
        message: welcomeMessage,
        html: `
        <div style="font-family: 'Inter', Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 40px 20px; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #0f172a; margin: 0;">Vichakra Technologies</h2>
          </div>
          <div style="background-color: #ffffff; padding: 40px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
            <h1 style="color: #0f172a; font-size: 24px; font-weight: 700; margin-top: 0;">Welcome, ${user.name}!</h1>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">We are absolutely thrilled to partner with you. Your account has been successfully activated.</p>
            
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">To get started, please log in to your portal and complete the project requirements questionnaire. This will help our team understand your exact vision and brand identity.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL || 'https://www.vichakratechnologies.com'}/portal" style="display: inline-block; background-color: #0f766e; color: #ffffff; text-decoration: none; font-weight: 600; padding: 14px 28px; border-radius: 8px;">Access Your Portal</a>
            </div>

            <p style="color: #64748b; font-size: 14px; margin-bottom: 0;">If you have any questions, our support team is always here to help.</p>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #94a3b8; font-size: 12px;">&copy; ${new Date().getFullYear()} Vichakra Technologies. All rights reserved.</p>
          </div>
        </div>
        `,
      });
      user.welcomeEmailSent = true;
      await user.save({ validateBeforeSave: false });
    } catch (err) {
      console.error('Welcome email sending failed:', err);
      // Fail silently, don't block login
    }
  }

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

// ── Forgot Password (OTP) ───────────────────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user || !user.isActive) {
    // For security, do not reveal if the user exists, but here we keep the original behavior
    return res.status(404).json({ error: 'There is no user with that email' });
  }

  // Get reset OTP (6 digits)
  const otp = user.getResetOtp();

  await user.save({ validateBeforeSave: false });

  const message = `Your password reset code is: ${otp}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset OTP - Vichakra Technologies',
      message,
      html: `
      <div style="font-family: 'Inter', Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 40px 20px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #0f172a; margin: 0;">Vichakra Technologies</h2>
        </div>
        <div style="background-color: #ffffff; padding: 40px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <h1 style="color: #0f172a; font-size: 24px; font-weight: 700; margin-top: 0;">Password Reset</h1>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">You requested to reset your password. Please use the following 6-digit code to proceed. This code will expire in 10 minutes.</p>
          
          <div style="background-color: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 12px; padding: 24px; text-align: center; margin: 30px 0;">
            <span style="font-family: monospace; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #0f766e;">${otp}</span>
          </div>

          <p style="color: #64748b; font-size: 14px; margin-bottom: 0;">If you did not request this, please ignore this email or contact support.</p>
        </div>
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #94a3b8; font-size: 12px;">&copy; ${new Date().getFullYear()} Vichakra Technologies. All rights reserved.</p>
        </div>
      </div>
      `,
    });

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('Email sending failed:', err);
    user.resetOtp = undefined;
    user.resetOtpExpire = undefined;

    await user.save({ validateBeforeSave: false });

    if (err.code === 'EAUTH') {
      return res.status(500).json({ error: 'Email service configuration error. If using Gmail, please use an App Password instead of your regular password in the .env file.' });
    }

    return res.status(500).json({ error: 'Email could not be sent due to a server error.' });
  }
};

// ── Reset Password (OTP) ────────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  const { email, otp, password } = req.body;

  if (!email || !otp || !password) {
    return res.status(400).json({ error: 'Email, OTP, and new password are required' });
  }

  // Hash the provided OTP to compare with DB
  const resetOtp = crypto
    .createHash('sha256')
    .update(otp)
    .digest('hex');

  const user = await User.findOne({
    email,
    resetOtp,
    resetOtpExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ error: 'Invalid or expired OTP' });
  }

  // Set new password
  user.password = password;
  user.resetOtp = undefined;
  user.resetOtpExpire = undefined;
  await user.save();

  res.status(200).json({ message: 'Password reset successful. You can now login.' });
};
