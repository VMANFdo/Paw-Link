const pool = require('../config/db')
const bcrypt = require('bcryptjs')
const { sendSuccess, sendError } = require('../utils/responseHelper')

/** adminController.js — Admin Management */

const getStats = async (req, res, next) => {
  try {
    const [[{ users }]]      = await pool.query('SELECT COUNT(*) AS users FROM users')
    const [[{ animals }]]    = await pool.query('SELECT COUNT(*) AS animals FROM animals')
    const [[{ adoptions }]]  = await pool.query('SELECT COUNT(*) AS adoptions FROM adoption_requests WHERE status = "approved"')
    const [[{ rescues }]]    = await pool.query('SELECT COUNT(*) AS rescues FROM rescue_requests WHERE status = "in_progress"')
    sendSuccess(res, { stats: { users, animals, adoptions, activeRescues: rescues } })
  } catch (err) { next(err) }
}

const getUsers = async (req, res, next) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, email, role, is_active, created_at FROM users ORDER BY created_at DESC'
    )
    sendSuccess(res, { users })
  } catch (err) { next(err) }
}

const updateUserStatus = async (req, res, next) => {
  try {
    const { is_active } = req.body
    await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [is_active, req.params.id])
    sendSuccess(res, {}, `User ${is_active ? 'activated' : 'banned'}`)
  } catch (err) { next(err) }
}

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body

    // 1. Basic validation
    if (!name || !email || !password || !role) {
      return sendError(res, 'All fields are required', 400)
    }

    // 2. Check if email exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email])
    if (existing.length > 0) {
      return sendError(res, 'Email already exists', 409)
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // 4. Insert user
    await pool.query(
      'INSERT INTO users (name, email, password, role, is_active) VALUES (?, ?, ?, ?, 1)',
      [name, email, hashedPassword, role]
    )

    sendSuccess(res, {}, 'User created successfully', 201)
  } catch (err) { next(err) }
}

const getAnimals = async (req, res, next) => {
  try {
    const [animals] = await pool.query(`
      SELECT a.*, u.name AS poster_name FROM animals a
      JOIN users u ON a.posted_by = u.id
      ORDER BY a.created_at DESC
    `)
    sendSuccess(res, { animals })
  } catch (err) { next(err) }
}

const deleteAnimal = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM animals WHERE id = ?', [req.params.id])
    sendSuccess(res, {}, 'Animal post removed')
  } catch (err) { next(err) }
}

const getReports = async (req, res, next) => {
  try {
    const [reports] = await pool.query(`
      SELECT r.*, u.name AS reporter_name FROM reports r
      JOIN users u ON r.reporter_id = u.id
      ORDER BY r.created_at DESC
    `)
    sendSuccess(res, { reports })
  } catch (err) { next(err) }
}

const getOrganizations = async (req, res, next) => {
  try {
    const [orgs] = await pool.query(`
      SELECT o.*, u.email, 
        (SELECT JSON_ARRAYAGG(document_url) FROM organization_documents WHERE organization_id = o.id) AS documents
      FROM organizations o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `)
    sendSuccess(res, { organizations: orgs })
  } catch (err) { next(err) }
}

const updateOrgStatus = async (req, res, next) => {
  try {
    const { status, rejection_reason, verified } = req.body
    const validStatuses = ['pending', 'approved', 'rejected', 'more_docs_needed']
    
    if (status && !validStatuses.includes(status)) {
      return sendError(res, 'Invalid status')
    }

    const updates = []
    const params = []

    if (status) { updates.push('status = ?'); params.push(status) }
    if (rejection_reason !== undefined) { updates.push('rejection_reason = ?'); params.push(rejection_reason) }
    if (verified !== undefined) { updates.push('verified = ?'); params.push(verified) }

    if (updates.length === 0) return sendError(res, 'No updates provided')

    params.push(req.params.id)
    await pool.query(`UPDATE organizations SET ${updates.join(', ')} WHERE id = ?`, params)

    sendSuccess(res, {}, 'Organization updated successfully')
  } catch (err) { next(err) }
}

module.exports = { 
  getStats, 
  getUsers, 
  updateUserStatus, 
  createUser, 
  getAnimals, 
  deleteAnimal, 
  getReports,
  getOrganizations,
  updateOrgStatus
}
