const express  = require('express')
const { body } = require('express-validator')
const router   = express.Router()

const authController = require('../controllers/authController')
const authMiddleware = require('../middleware/authMiddleware')
const validate       = require('../middleware/validate')

/**
 * Auth Routes
 * Base: /api/auth
 */

// POST /api/auth/register
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').optional().isIn(['person', 'organization']).withMessage('Invalid role'),
], validate, authController.register)

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], validate, authController.login)

// GET /api/auth/me  (protected)
router.get('/me', authMiddleware, authController.getMe)

module.exports = router
