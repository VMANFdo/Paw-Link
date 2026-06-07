const pool = require('../config/db')
const { sendSuccess, sendError } = require('../utils/responseHelper')

/** userController.js — User Profile Management */

const attachOrganizationState = async (user) => {
  if (!user || user.role !== 'organization') return user

  const [orgs] = await pool.query(
    'SELECT status, profile_complete, is_permanently_banned, rejection_reason, appeal_message, appeal_document_url FROM organizations WHERE user_id = ?',
    [user.id]
  )

  if (orgs.length === 0) return user

  return {
    ...user,
    org_status: orgs[0].status,
    org_profile_complete: orgs[0].profile_complete,
    org_is_permanently_banned: orgs[0].is_permanently_banned,
    org_rejection_reason: orgs[0].rejection_reason,
    org_appeal_message: orgs[0].appeal_message,
    org_appeal_document_url: orgs[0].appeal_document_url
  }
}

const getMyProfile = async (req, res, next) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, email, role, profile_picture, bio, phone, created_at FROM users WHERE id = ?',
      [req.user.id]
    )
    if (!users.length) return sendError(res, 'User not found', 404)
    const user = await attachOrganizationState(users[0])
    sendSuccess(res, { user })
  } catch (err) { next(err) }
}

const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, phone } = req.body

    // Guard against empty name — don't allow wiping the name field
    if (!name || name.trim() === '') {
      return sendError(res, 'Name cannot be empty', 400)
    }

    let query = 'UPDATE users SET name = ?, bio = ?, phone = ? WHERE id = ?'
    let params = [name.trim(), bio || null, phone || null, req.user.id]

    if (req.file) {
      const profilePicPath = `/uploads/${req.file.filename}`
      query = 'UPDATE users SET name = ?, bio = ?, phone = ?, profile_picture = ? WHERE id = ?'
      params = [name.trim(), bio || null, phone || null, profilePicPath, req.user.id]
    }

    await pool.query(query, params)

    // Return updated user so frontend can refresh without an extra request
    const [users] = await pool.query(
      'SELECT id, name, email, role, profile_picture, bio, phone, created_at FROM users WHERE id = ?',
      [req.user.id]
    )
    const user = await attachOrganizationState(users[0])
    sendSuccess(res, { user }, 'Profile updated')
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

const getStats = async (req, res, next) => {
  try {
    const userId = req.user.id

    // Count posts
    const [posts] = await pool.query('SELECT COUNT(*) AS count FROM animals WHERE posted_by = ?', [userId])
    
    // Count sent requests
    const [sent] = await pool.query('SELECT COUNT(*) AS count FROM adoption_requests WHERE requester_id = ?', [userId])
    
    // Count received requests (requests for animals posted by this user)
    const [received] = await pool.query(`
      SELECT COUNT(*) AS count 
      FROM adoption_requests ar
      JOIN animals a ON ar.animal_id = a.id
      WHERE a.posted_by = ?
    `, [userId])

    sendSuccess(res, {
      totalPosts: posts[0].count,
      requestsSent: sent[0].count,
      requestsReceived: received[0].count
    })
  } catch (err) { next(err) }
}

const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id

    // 1. Count unread messages received by this user
    const [unreadMessages] = await pool.query(
      'SELECT COUNT(*) AS count FROM messages WHERE receiver_id = ? AND is_read = 0',
      [userId]
    )

    // 2. Count pending adoption requests for animals posted by this user
    const [pendingRequests] = await pool.query(`
      SELECT COUNT(*) AS count 
      FROM adoption_requests ar
      JOIN animals a ON ar.animal_id = a.id
      WHERE a.posted_by = ? AND ar.status = 'pending'
    `, [userId])

    sendSuccess(res, {
      unreadMessages: unreadMessages[0].count,
      pendingRequests: pendingRequests[0].count,
      totalUnread: unreadMessages[0].count + pendingRequests[0].count
    })
  } catch (err) { next(err) }
}

module.exports = { getMyProfile, updateProfile, getPublicProfile, getStats, getUnreadCount }
