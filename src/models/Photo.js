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
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      default: null,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    takenAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Photo', photoSchema);
