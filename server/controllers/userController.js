const pool = require('../config/db')
const { sendSuccess, sendError } = require('../utils/responseHelper')

/** userController.js — User Profile Management */

const getMyProfile = async (req, res, next) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, email, role, profile_picture, bio, phone, created_at FROM users WHERE id = ?',
      [req.user.id]
    )
    if (!users.length) return sendError(res, 'User not found', 404)
    sendSuccess(res, { user: users[0] })
  } catch (err) { next(err) }
}

const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, phone } = req.body
    await pool.query(
      'UPDATE users SET name = ?, bio = ?, phone = ? WHERE id = ?',
      [name, bio, phone, req.user.id]
    )
    sendSuccess(res, {}, 'Profile updated')
  } catch (err) { next(err) }
}

const getPublicProfile = async (req, res, next) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, role, profile_picture, bio, created_at FROM users WHERE id = ?',
      [req.params.id]
    )
    if (!users.length) return sendError(res, 'User not found', 404)
    sendSuccess(res, { user: users[0] })
  } catch (err) { next(err) }
}

module.exports = { getMyProfile, updateProfile, getPublicProfile }
