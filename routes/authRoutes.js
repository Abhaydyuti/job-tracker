const express    = require('express');
const router     = express.Router();
const { body }   = require('express-validator');
const authController  = require('../controllers/authController');
const { isGuest, isLoggedIn } = require('../middleware/authMiddleware');

// ── Validation Rules ───────────────────────────────────────

const signupValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ max: 100 }).withMessage('Name must be under 100 characters.'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please enter a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters.')
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please enter a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.')
];

// ── Auth Routes ────────────────────────────────────────────

// isGuest middleware: redirect to dashboard if already logged in
router.get('/signup',  isGuest, authController.getSignup);
router.post('/signup', isGuest, signupValidation, authController.postSignup);

router.get('/login',   isGuest, authController.getLogin);
router.post('/login',  isGuest, loginValidation,  authController.postLogin);

router.post('/logout', isLoggedIn, authController.postLogout);

module.exports = router;