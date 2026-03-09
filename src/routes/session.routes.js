const express = require('express');
const { body } = require('express-validator');
const {
  createSession,
  getSessions,
  getSessionById,
  updateSession,
  deleteSession,
} = require('../controllers/session.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All session routes require authentication
router.use(protect);

const sessionRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Session title is required.')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters.'),
  body('type')
    .notEmpty().withMessage('Session type is required.')
    .isIn(['Strength', 'Cardio', 'Flexibility', 'HIIT', 'Balance', 'Other'])
    .withMessage('Invalid type. Allowed values: Strength, Cardio, Flexibility, HIIT, Balance, Other.'),
  body('duration')
    .notEmpty().withMessage('Duration is required.')
    .isInt({ min: 1 }).withMessage('Duration must be a positive integer (in minutes).'),
  body('caloriesBurned')
    .optional()
    .isInt({ min: 0 }).withMessage('Calories burned must be a non-negative integer.'),
  body('notes')
    .optional()
    .isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters.'),
  body('date')
    .optional()
    .isISO8601().withMessage('Date must be a valid ISO 8601 date (e.g. 2026-03-04T10:00:00Z).'),
];

router.post('/', sessionRules, createSession);
router.get('/', getSessions);
router.get('/:id', getSessionById);
router.put('/:id', updateSession);
router.delete('/:id', deleteSession);

module.exports = router;
