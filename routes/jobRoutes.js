const express    = require('express');
const router     = express.Router();
const { body }   = require('express-validator');
const jobController  = require('../controllers/jobController');
const { isLoggedIn } = require('../middleware/authMiddleware');

// ── Validation Rules ───────────────────────────────────────

const jobValidation = [
  body('company_name')
    .trim()
    .notEmpty().withMessage('Company name is required.')
    .isLength({ max: 150 }).withMessage('Company name too long.'),

  body('role')
    .trim()
    .notEmpty().withMessage('Role / Job title is required.')
    .isLength({ max: 150 }).withMessage('Role too long.'),

  body('status')
    .trim()
    .notEmpty().withMessage('Status is required.')
    .isIn(['Applied', 'Interviewing', 'Offer', 'Rejected'])
    .withMessage('Invalid status value.'),

  body('applied_date')
    .optional({ checkFalsy: true })
    .isDate().withMessage('Applied date must be a valid date.'),

  body('interview_date')
    .optional({ checkFalsy: true })
    .isDate().withMessage('Interview date must be a valid date.'),

  body('link')
    .optional({ checkFalsy: true })
    .isURL().withMessage('Job link must be a valid URL (include https://).'),

  body('notes')
    .optional()
    .trim()
];

// ── Job Routes (all protected) ─────────────────────────────

router.get('/dashboard',       isLoggedIn, jobController.getDashboard);
router.get('/jobs',            isLoggedIn, jobController.getJobs);
router.get('/jobs/new',        isLoggedIn, jobController.getNewJob);
router.post('/jobs',           isLoggedIn, jobValidation, jobController.postNewJob);
router.get('/jobs/:id/edit',   isLoggedIn, jobController.getEditJob);
router.put('/jobs/:id',        isLoggedIn, jobValidation, jobController.putEditJob);
router.delete('/jobs/:id',     isLoggedIn, jobController.deleteJob);

module.exports = router;