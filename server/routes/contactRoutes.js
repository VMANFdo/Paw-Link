const express  = require('express')
const { body } = require('express-validator')
const router   = express.Router()
const upload   = require('../config/multer')

const contactController = require('../controllers/contactController')
const authMiddleware = require('../middleware/authMiddleware')
const validate       = require('../middleware/validate')

/**
 * Contact Routes
 * Base: /api/contact
 */

// POST /api/contact/feedback - Submit feedback or problem report
router.post('/feedback', authMiddleware, upload.single('screenshot'), [
  body('feedback_type')
    .isIn(['general', 'bug_report', 'feature_request', 'compliment'])
    .withMessage('Invalid feedback type'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('category').optional().trim(),
], validate, contactController.submitFeedback)

// POST /api/contact/rating - Submit a rating (stars)
router.post('/rating', authMiddleware, [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('feedback_id').optional().isInt().withMessage('Invalid feedback ID'),
], validate, contactController.submitRating)

// GET /api/contact/stats - Get feedback statistics (public)
router.get('/stats', contactController.getFeedbackStats)

// GET /api/contact/ratings - Get all ratings (public)
router.get('/ratings', contactController.getAllRatings)

module.exports = router