const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, 'Photo URL is required'],
      trim: true,
    },
    caption: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { _id: false }
);

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Session title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    type: {
      type: String,
      required: [true, 'Session type is required'],
      enum: {
        values: ['Strength', 'Cardio', 'Flexibility', 'HIIT', 'Balance', 'Other'],
        message: 'Invalid type. Allowed: Strength, Cardio, Flexibility, HIIT, Balance, Other',
      },
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 minute'],
    },
    caloriesBurned: {
      type: Number,
      min: [0, 'Calories burned cannot be negative'],
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: null,
    },
    exercises: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exercise',
      },
    ],
    photos: [photoSchema],
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Session', sessionSchema);
