const bcrypt  = require('bcryptjs')
const pool    = require('../config/db')
const { generateToken } = require('../utils/jwtHelper')
const { sendSuccess, sendError } = require('../utils/responseHelper')

/**
 * authController.js — Authentication Business Logic
 *
 * WHY controllers:
 *  Controllers handle HTTP request/response logic.
 *  They read from req, call services/models, and write to res.
 *  Keeping this separate from routes keeps route files clean.
 */

// ─────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'user' } = req.body

    // 1. Check if email already exists
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ?', [email]
    )
    if (existing.length > 0) {
      return sendError(res, 'Email already registered. Please login.', 409)
    }

    // 2. Hash the password (saltRounds = 12)
    const hashedPassword = await bcrypt.hash(password, 12)

    // 3. Insert new user
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    )

    // 4. Generate JWT token
    const token = generateToken({ id: result.insertId, email, role })

    // 5. Return token + basic user info (never return the password)
    sendSuccess(res, {
      token,
      user: { id: result.insertId, name, email, role },
    }, 'Registration successful', 201)

  } catch (err) {
    next(err) // Pass to global error handler
  }
}

// ─────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    // 1. Find user by email
    const [users] = await pool.query(
      'SELECT id, name, email, password, role FROM users WHERE email = ?', [email]
    )
    if (users.length === 0) {
      return sendError(res, 'Invalid email or password', 401)
    }

    const user = users[0]

    // 2. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return sendError(res, 'Invalid email or password', 401)
    }

    // 3. Generate JWT
    const token = generateToken({ id: user.id, email: user.email, role: user.role })

    // 4. Return token + user (exclude password)
    const { password: _pw, ...userWithoutPassword } = user
    sendSuccess(res, { token, user: userWithoutPassword }, 'Login successful')

  } catch (err) {
    next(err)
  }
}

// ─────────────────────────────────────────
// GET /api/auth/me
// ─────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    // req.user is set by authMiddleware (contains id, email, role)
    const [users] = await pool.query(
      'SELECT id, name, email, role, profile_picture, created_at FROM users WHERE id = ?',
      [req.user.id]
    )
    if (users.length === 0) {
      return sendError(res, 'User not found', 404)
    }

    sendSuccess(res, { user: users[0] })
  } catch (err) {
    next(err)
  }
}

module.exports = { register, login, getMe }
