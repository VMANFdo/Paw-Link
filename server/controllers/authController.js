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
    const { name, email, password, role = 'person', phone } = req.body

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
      'INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role, phone]
    )

    // If role is organization, create a minimal organization row
    if (role === 'organization') {
      await pool.query(
        'INSERT INTO organizations (user_id, name, status, profile_complete) VALUES (?, ?, "pending", 0)',
        [result.insertId, name]
      )
    }

    // 4. Generate JWT token
    const token = generateToken({ id: result.insertId, email, role })

    // 5. Return token + basic user info (never return the password)
    const userResponse = { id: result.insertId, name, email, role }
    if (role === 'organization') {
      userResponse.org_status = 'pending'
      userResponse.org_profile_complete = 0
    }

    sendSuccess(res, {
      token,
      user: userResponse,
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
      'SELECT id, name, email, password, role, is_active, is_permanently_banned, ban_reason, appeal_message, appeal_document_url FROM users WHERE email = ?', [email]
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

    // 5. If organization, fetch org status
    if (user.role === 'organization') {
      const [orgs] = await pool.query('SELECT status, profile_complete, is_permanently_banned, rejection_reason, appeal_message, appeal_document_url FROM organizations WHERE user_id = ?', [user.id])
      if (orgs.length > 0) {
        userWithoutPassword.org_status = orgs[0].status
        userWithoutPassword.org_profile_complete = orgs[0].profile_complete
        userWithoutPassword.org_is_permanently_banned = orgs[0].is_permanently_banned
        userWithoutPassword.org_rejection_reason = orgs[0].rejection_reason
        userWithoutPassword.org_appeal_message = orgs[0].appeal_message
        userWithoutPassword.org_appeal_document_url = orgs[0].appeal_document_url
      }
    }

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
      'SELECT id, name, email, role, profile_picture, is_active, is_permanently_banned, ban_reason, appeal_message, appeal_document_url, created_at FROM users WHERE id = ?',
      [req.user.id]
    )
    if (users.length === 0) {
      return sendError(res, 'User not found', 404)
    }

    const user = users[0]

    // If organization, join org data
    if (user.role === 'organization') {
      const [orgs] = await pool.query('SELECT status, profile_complete, is_permanently_banned, rejection_reason, appeal_message, appeal_document_url FROM organizations WHERE user_id = ?', [user.id])
      if (orgs.length > 0) {
        user.org_status = orgs[0].status
        user.org_profile_complete = orgs[0].profile_complete
        user.org_is_permanently_banned = orgs[0].is_permanently_banned
        user.org_rejection_reason = orgs[0].rejection_reason
        user.org_appeal_message = orgs[0].appeal_message
        user.org_appeal_document_url = orgs[0].appeal_document_url
      }
    }

    sendSuccess(res, { user })
  } catch (err) {
    next(err)
  }
}

const submitAppeal = async (req, res, next) => {
  try {
    const { message } = req.body
    const documentUrl = req.file ? `/uploads/${req.file.filename}` : null
    
    if (!message) return sendError(res, 'Appeal message is required')

    if (req.user.role === 'organization') {
      await pool.query(
        'UPDATE organizations SET appeal_message = ?, appeal_document_url = ?, status = "pending" WHERE user_id = ?', 
        [message, documentUrl, req.user.id]
      )
    } else {
      await pool.query(
        'UPDATE users SET appeal_message = ?, appeal_document_url = ? WHERE id = ?', 
        [message, documentUrl, req.user.id]
      )
    }

    sendSuccess(res, {}, 'Appeal submitted successfully')
  } catch (err) { next(err) }
}

module.exports = { register, login, getMe, submitAppeal }
