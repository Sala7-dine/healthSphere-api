const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const Session = require('../models/Session');

// @desc    Create a new session
// @route   POST /api/sessions
// @access  Private
const createSession = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array().map((e) => e.msg).join(' | '),
      });
    }

    const { title, type, duration, caloriesBurned, notes, exercises, photos, date } = req.body;

    const session = await Session.create({
      user: req.user._id,
      title,
      type,
      duration,
      caloriesBurned,
      notes,
      exercises,
      photos,
      date,
    });

    res.status(201).json({
      success: true,
      message: 'Session recorded successfully.',
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all sessions for the authenticated user
// @route   GET /api/sessions
// @access  Private
const getSessions = async (req, res, next) => {
  try {
    const { type, page = 1, limit = 20, from, to } = req.query;

    const VALID_TYPES = ['Strength', 'Cardio', 'Flexibility', 'HIIT', 'Balance', 'Other'];

    if (type && !VALID_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid type "${type}". Allowed values: ${VALID_TYPES.join(', ')}.`,
      });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({ success: false, message: '"page" must be a positive integer.' });
    }
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({ success: false, message: '"limit" must be between 1 and 100.' });
    }

    const filter = { user: req.user._id };
    if (type) filter.type = type;

    if (from || to) {
      filter.date = {};
      if (from) {
        const fromDate = new Date(from);
        if (isNaN(fromDate)) {
          return res.status(400).json({ success: false, message: '"from" must be a valid date (ISO 8601).' });
        }
        filter.date.$gte = fromDate;
      }
      if (to) {
        const toDate = new Date(to);
        if (isNaN(toDate)) {
          return res.status(400).json({ success: false, message: '"to" must be a valid date (ISO 8601).' });
        }
        filter.date.$lte = toDate;
      }
    }

    const skip = (pageNum - 1) * limitNum;

    const [sessions, total] = await Promise.all([
      Session.find(filter)
        .populate('exercises', 'name category difficulty duration')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Session.countDocuments(filter),
    ]);

    if (total === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        page: pageNum,
        pages: 0,
        message: 'No sessions found. Start your first session with POST /api/sessions.',
        data: [],
      });
    }

    if (sessions.length === 0) {
      return res.status(200).json({
        success: true,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        message: `Page ${pageNum} is out of range. There are only ${Math.ceil(total / limitNum)} page(s) available.`,
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single session by ID
// @route   GET /api/sessions/:id
// @access  Private
const getSessionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `"${id}" is not a valid session ID.`,
      });
    }

    const session = await Session.findOne({ _id: id, user: req.user._id })
      .populate('exercises', 'name category difficulty duration')
      .lean();

    if (!session) {
      return res.status(404).json({
        success: false,
        message: `No session found with ID "${id}".`,
      });
    }

    res.status(200).json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a session
// @route   PUT /api/sessions/:id
// @access  Private
const updateSession = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `"${id}" is not a valid session ID.`,
      });
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Request body is empty. Please provide at least one field to update.',
      });
    }

    const session = await Session.findOneAndUpdate(
      { _id: id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        message: `No session found with ID "${id}".`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Session updated successfully.',
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a session
// @route   DELETE /api/sessions/:id
// @access  Private
const deleteSession = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `"${id}" is not a valid session ID.`,
      });
    }

    const session = await Session.findOneAndDelete({ _id: id, user: req.user._id });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: `No session found with ID "${id}". It may have already been deleted.`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Session "${session.title}" has been deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createSession, getSessions, getSessionById, updateSession, deleteSession };
