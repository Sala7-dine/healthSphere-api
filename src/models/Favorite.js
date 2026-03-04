const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    exerciseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise',
      required: [true, 'Exercise ID is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Ensure uniqueness: an exercise can only be favorited once
favoriteSchema.index({ exerciseId: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
