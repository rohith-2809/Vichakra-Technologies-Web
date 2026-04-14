const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false, // never returned in queries by default
    },
    role: {
      type: String,
      enum: ['admin', 'client'],
      default: 'client',
    },
    company: { type: String, trim: true },
    phone:   { type: String, trim: true },
    industry: { type: String, trim: true },
    avatar:  { type: String },
    isFirstLogin: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare plain password with stored hash
userSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', userSchema);
