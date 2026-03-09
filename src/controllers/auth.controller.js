const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// Generate a signed JWT
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public

const register = async (req, res, next) => {
  try {
    // express-validator errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors
          .array()
          .map((e) => e.msg)
          .join(' | '),
      });
    }

    const { name, email, password, age, weight, height } = req.body;

    // Check for duplicate email
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `An account with email "${email}" already exists. Please login or use a different email.`,
      });
    }

    const user = await User.create({ name, email, password, age, weight, height });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        weight: user.weight,
        height: user.height,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors
          .array()
          .map((e) => e.msg)
          .join(' | '),
      });
    }

    const { email, password } = req.body;

    // Fetch user with password (select: false on schema)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        weight: user.weight,
        height: user.height,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current authenticated user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
};

module.exports = { register, login, getMe };
