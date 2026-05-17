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
    const [[{ pendingOrgs }]] = await pool.query('SELECT COUNT(*) AS pendingOrgs FROM organizations WHERE status = "pending"')
    sendSuccess(res, { stats: { users, animals, adoptions, activeRescues: rescues, pendingOrgs } })
  } catch (err) { next(err) }
}

const getUsers = async (req, res, next) => {
  try {
    const [users] = await pool.query(
      "SELECT id, name, email, role, is_active, is_permanently_banned, ban_reason, appeal_message, appeal_document_url, created_at FROM users WHERE role != 'organization' ORDER BY created_at DESC"
    )
    sendSuccess(res, { users })
  } catch (err) { next(err) }
}

const updateUserStatus = async (req, res, next) => {
  try {
    const { is_active, ban_reason, permanent_ban } = req.body
    
    if (permanent_ban) {
      await pool.query(
        'UPDATE users SET is_permanently_banned = 1, ban_reason = ?, appeal_message = NULL, appeal_document_url = NULL WHERE id = ?', 
        ['Appeal Rejected - Permanent Ban', req.params.id]
      )
      return sendSuccess(res, {}, 'User permanently banned')
    }
    
    if (is_active) {
      // Unbanning: clear ban reason and appeal fields
      await pool.query(
        'UPDATE users SET is_active = ?, ban_reason = NULL, appeal_message = NULL, appeal_document_url = NULL WHERE id = ?', 
        [is_active, req.params.id]
      )
    } else {
      // Banning
      await pool.query(
        'UPDATE users SET is_active = ?, ban_reason = ? WHERE id = ?', 
        [is_active, ban_reason || null, req.params.id]
      )
    }
    
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
      SELECT o.*, u.email
      FROM organizations o
      JOIN users u ON o.user_id = u.id
      ORDER BY 
        CASE 
          WHEN o.status = 'pending' THEN 1 
          WHEN o.status = 'more_docs_needed' THEN 2 
          ELSE 3 
        END ASC, 
        o.created_at DESC
    `)

    if (orgs.length > 0) {
      const orgIds = orgs.map(o => o.id)
      const [docs] = await pool.query(
        'SELECT organization_id, document_url FROM organization_documents WHERE organization_id IN (?)',
        [orgIds]
      )

      orgs.forEach(o => {
        o.documents = docs
          .filter(d => d.organization_id === o.id)
          .map(d => d.document_url)
      })
    }

    sendSuccess(res, { organizations: orgs })
  } catch (err) { next(err) }
}

const updateOrgStatus = async (req, res, next) => {
  try {
    const { status, rejection_reason, verified, permanent_ban } = req.body
    const validStatuses = ['pending', 'approved', 'rejected', 'more_docs_needed']
    
    if (status && !validStatuses.includes(status)) {
      return sendError(res, 'Invalid status')
    }

    const updates = []
    const params = []

    if (permanent_ban) {
      updates.push('is_permanently_banned = 1')
      updates.push('rejection_reason = ?')
      params.push('Appeal Rejected - Permanent Ban')
      updates.push('appeal_message = NULL')
      updates.push('appeal_document_url = NULL')
    }

    if (status) { 
      updates.push('status = ?')
      params.push(status)
      if (status === 'approved') {
        updates.push('rejection_reason = NULL')
        updates.push('appeal_message = NULL')
        updates.push('appeal_document_url = NULL')
      }
    }
    if (rejection_reason !== undefined) { updates.push('rejection_reason = ?'); params.push(rejection_reason) }
    if (verified !== undefined) { updates.push('verified = ?'); params.push(verified) }

    if (updates.length === 0) return sendError(res, 'No updates provided')

    params.push(req.params.id)
    await pool.query(`UPDATE organizations SET ${updates.join(', ')} WHERE id = ?`, params)

    sendSuccess(res, {}, 'Organization updated successfully')
  } catch (err) { next(err) }
}

const createOrganization = async (req, res, next) => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const { name, email, password, shelter_name, contact_number, address, latitude, longitude, max_capacity } = req.body

    // 1. Create User
    const hashedPassword = await bcrypt.hash(password, 12)
    const [userResult] = await connection.query(
      'INSERT INTO users (name, email, password, role, is_active) VALUES (?, ?, ?, ?, 1)',
      [name, email, hashedPassword, 'organization']
    )
    const userId = userResult.insertId

    // 2. Create Organization Profile (Automatically Approved and completed)
    await connection.query(
      `INSERT INTO organizations 
        (user_id, name, contact_number, address, latitude, longitude, max_capacity, status, verified, profile_complete)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'approved', 1, 1)`,
      [userId, shelter_name, contact_number, address, latitude, longitude, max_capacity || 0]
    )

    await connection.commit()
    sendSuccess(res, {}, 'Shelter created successfully', 201)
  } catch (err) {
    await connection.rollback()
    next(err)
  } finally {
    connection.release()
  }
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
  updateOrgStatus,
  createOrganization
}
