const mongoose = require('mongoose');
const Exercise = require('../models/Exercise');

const VALID_CATEGORIES = ['Strength', 'Cardio', 'Flexibility', 'Balance', 'HIIT', 'Other'];
const VALID_DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

// @desc    Get all exercises
// @route   GET /api/exercises
const getAllExercises = async (req, res, next) => {
  try {
    const { category, difficulty, page = 1, limit = 20 } = req.query;

    // Validate query params
    if (category && !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category "${category}". Allowed values: ${VALID_CATEGORIES.join(', ')}.`,
      });
    }

    if (difficulty && !VALID_DIFFICULTIES.includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: `Invalid difficulty "${difficulty}". Allowed values: ${VALID_DIFFICULTIES.join(', ')}.`,
      });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({ success: false, message: '"page" must be a positive integer.' });
    }
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({ success: false, message: '"limit" must be an integer between 1 and 100.' });
    }

    const filter = {};
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    const skip = (pageNum - 1) * limitNum;

    const [exercises, total] = await Promise.all([
      Exercise.find(filter).skip(skip).limit(limitNum).lean(),
      Exercise.countDocuments(filter),
    ]);

    if (total === 0) {
      const filterDesc = [category && `category "${category}"`, difficulty && `difficulty "${difficulty}"`]
        .filter(Boolean)
        .join(' and ');
      return res.status(200).json({
        success: true,
        total: 0,
        page: pageNum,
        pages: 0,
        message: filterDesc
          ? `No exercises found with ${filterDesc}.`
          : 'No exercises found. You can add one with POST /api/exercises.',
        data: [],
      });
    }

    if (exercises.length === 0) {
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
      data: exercises,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single exercise by ID
// @route   GET /api/exercises/:id
const getExerciseById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `"${id}" is not a valid exercise ID. Please provide a valid MongoDB ObjectId.`,
      });
    }

    const exercise = await Exercise.findById(id).lean();

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: `No exercise found with ID "${id}".`,
      });
    }

    res.status(200).json({ success: true, data: exercise });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new exercise
// @route   POST /api/exercises
const createExercise = async (req, res, next) => {
  try {
    const { name, category, difficulty, description, duration } = req.body;

    // Manual required-field check for clearer messages
    const missing = [];
    if (!name) missing.push('name');
    if (!category) missing.push('category');
    if (!difficulty) missing.push('difficulty');
    if (!description) missing.push('description');
    if (duration === undefined || duration === null) missing.push('duration');

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required field(s): ${missing.join(', ')}.`,
      });
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category "${category}". Allowed values: ${VALID_CATEGORIES.join(', ')}.`,
      });
    }

    if (!VALID_DIFFICULTIES.includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: `Invalid difficulty "${difficulty}". Allowed values: ${VALID_DIFFICULTIES.join(', ')}.`,
      });
    }

    if (typeof duration !== 'number' || duration < 1) {
      return res.status(400).json({
        success: false,
        message: '"duration" must be a positive number (in minutes).',
      });
    }

    const exercise = await Exercise.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Exercise created successfully.',
      data: exercise,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an exercise
// @route   PUT /api/exercises/:id
const updateExercise = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `"${id}" is not a valid exercise ID. Please provide a valid MongoDB ObjectId.`,
      });
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Request body is empty. Please provide at least one field to update.',
      });
    }

    const { category, difficulty } = req.body;

    if (category && !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category "${category}". Allowed values: ${VALID_CATEGORIES.join(', ')}.`,
      });
    }

    if (difficulty && !VALID_DIFFICULTIES.includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: `Invalid difficulty "${difficulty}". Allowed values: ${VALID_DIFFICULTIES.join(', ')}.`,
      });
    }

    const exercise = await Exercise.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: `No exercise found with ID "${id}".`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Exercise updated successfully.',
      data: exercise,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an exercise
// @route   DELETE /api/exercises/:id
const deleteExercise = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `"${id}" is not a valid exercise ID. Please provide a valid MongoDB ObjectId.`,
      });
    }

    const exercise = await Exercise.findByIdAndDelete(id);

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: `No exercise found with ID "${id}". It may have already been deleted.`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Exercise "${exercise.name}" has been deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
};
