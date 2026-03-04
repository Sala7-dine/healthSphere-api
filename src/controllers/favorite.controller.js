const mongoose = require('mongoose');
const Favorite = require('../models/Favorite');
const Exercise = require('../models/Exercise');

// @desc    Get all favorites (populated with exercise data)
// @route   GET /api/favorites
const getAllFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find().populate('exerciseId').lean();

    if (favorites.length === 0) {
      return res.status(200).json({
        success: true,
        total: 0,
        message: 'You have no favorites yet. Add one with POST /api/favorites.',
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      total: favorites.length,
      data: favorites,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add an exercise to favorites
// @route   POST /api/favorites
const addFavorite = async (req, res, next) => {
  try {
    const { exerciseId } = req.body;

    if (!exerciseId) {
      return res.status(400).json({
        success: false,
        message: '"exerciseId" is required in the request body.',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(exerciseId)) {
      return res.status(400).json({
        success: false,
        message: `"${exerciseId}" is not a valid exercise ID. Please provide a valid MongoDB ObjectId.`,
      });
    }

    // Check if exercise exists
    const exercise = await Exercise.findById(exerciseId);
    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: `No exercise found with ID "${exerciseId}". Cannot add a non-existent exercise to favorites.`,
      });
    }

    const favorite = await Favorite.create({ exerciseId });

    res.status(201).json({
      success: true,
      message: `Exercise "${exercise.name}" has been added to your favorites.`,
      data: favorite,
    });
  } catch (error) {
    // Duplicate key error (already favorited)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This exercise is already in your favorites.',
      });
    }
    next(error);
  }
};

// @desc    Remove a favorite by ID
// @route   DELETE /api/favorites/:id
const removeFavorite = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `"${id}" is not a valid favorite ID. Please provide a valid MongoDB ObjectId.`,
      });
    }

    const favorite = await Favorite.findByIdAndDelete(id).populate('exerciseId');

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: `No favorite found with ID "${id}". It may have already been removed.`,
      });
    }

    const exerciseName = favorite.exerciseId?.name || 'Unknown exercise';
    res.status(200).json({
      success: true,
      message: `"${exerciseName}" has been removed from your favorites.`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllFavorites,
  addFavorite,
  removeFavorite,
};
