const pool = require('../config/db')
const { sendSuccess, sendError } = require('../utils/responseHelper')

/** messageController.js — REST-based Messaging */

// POST /api/messages — Send a message
const send = async (req, res, next) => {
  try {
    const { receiver_id, subject, body } = req.body
    if (receiver_id === req.user.id) {
      return sendError(res, 'You cannot message yourself')
    }
    const [result] = await pool.query(
      'INSERT INTO messages (sender_id, receiver_id, subject, body) VALUES (?, ?, ?, ?)',
      [req.user.id, receiver_id, subject, body]
    )
    sendSuccess(res, { id: result.insertId }, 'Message sent', 201)
  } catch (err) { next(err) }
}

// GET /api/messages/inbox
const getInbox = async (req, res, next) => {
  try {
    const [messages] = await pool.query(`
      SELECT m.*, u.name AS sender_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.receiver_id = ?
      ORDER BY m.created_at DESC
    `, [req.user.id])
    sendSuccess(res, { messages })
  } catch (err) { next(err) }
}

// GET /api/messages/sent
const getSent = async (req, res, next) => {
  try {
    const [messages] = await pool.query(`
      SELECT m.*, u.name AS receiver_name
      FROM messages m
      JOIN users u ON m.receiver_id = u.id
      WHERE m.sender_id = ?
      ORDER BY m.created_at DESC
    `, [req.user.id])
    sendSuccess(res, { messages })
  } catch (err) { next(err) }
}

// GET /api/messages/:userId — Conversation thread
const getThread = async (req, res, next) => {
  try {
    const [messages] = await pool.query(`
      SELECT m.*, u.name AS sender_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE (m.sender_id = ? AND m.receiver_id = ?)
         OR (m.sender_id = ? AND m.receiver_id = ?)
      ORDER BY m.created_at ASC
    `, [req.user.id, req.params.userId, req.params.userId, req.user.id])

    // Mark messages as read
    await pool.query(
      'UPDATE messages SET is_read = 1 WHERE receiver_id = ? AND sender_id = ? AND is_read = 0',
      [req.user.id, req.params.userId]
    )

    sendSuccess(res, { messages })
  } catch (err) { next(err) }
}

module.exports = { send, getInbox, getSent, getThread }
