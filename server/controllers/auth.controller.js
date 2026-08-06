const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const { asyncHandler, ApiError } = require('../middleware/error.middleware');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !name.trim()) throw new ApiError(400, 'Name is required');
  if (!email || !EMAIL_RE.test(email)) throw new ApiError(400, 'A valid email is required');
  if (!password || password.length < 6) throw new ApiError(400, 'Password must be at least 6 characters');

  const existing = userModel.findByEmail(email.toLowerCase());
  if (existing) throw new ApiError(409, 'An account with that email already exists');

  const passwordHash = await bcrypt.hash(password, 10);
  const user = userModel.create({ name: name.trim(), email: email.toLowerCase(), passwordHash });
  const token = signToken(user);

  res.status(201).json({ token, user });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, 'Email and password are required');

  const record = userModel.findByEmail(email.toLowerCase());
  if (!record) throw new ApiError(401, 'Invalid email or password');

  const passwordMatches = await bcrypt.compare(password, record.password_hash);
  if (!passwordMatches) throw new ApiError(401, 'Invalid email or password');

  const user = { id: record.id, name: record.name, email: record.email, role: record.role };
  const token = signToken(user);

  res.json({ token, user });
});

const me = asyncHandler(async (req, res) => {
  const user = userModel.findById(req.user.id);
  if (!user) throw new ApiError(404, 'User not found');
  res.json({ user });
});

module.exports = { signup, login, me };
