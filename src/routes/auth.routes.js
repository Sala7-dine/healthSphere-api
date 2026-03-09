const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const registerRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters.')
    .isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters.'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.'),
  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  body('age')
    .optional()
    .isInt({ min: 10, max: 120 }).withMessage('Age must be between 10 and 120.'),
  body('weight')
    .optional()
    .isFloat({ min: 20, max: 300 }).withMessage('Weight must be between 20 and 300 kg.'),
  body('height')
    .optional()
    .isFloat({ min: 50, max: 250 }).withMessage('Height must be between 50 and 250 cm.'),
];

const loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.'),
  body('password')
    .notEmpty().withMessage('Password is required.'),
];

router.post('/register', registerRules, register);
router.post('/login', loginRules, login);
router.get('/me', protect, getMe);

module.exports = router;
