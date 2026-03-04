const express = require('express');
const router = express.Router();
const {
  getAllFavorites,
  addFavorite,
  removeFavorite,
} = require('../controllers/favorite.controller');

router.get('/', getAllFavorites);
router.post('/', addFavorite);
router.delete('/:id', removeFavorite);

module.exports = router;
