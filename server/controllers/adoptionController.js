const pool = require('../config/db')
const { sendSuccess, sendError } = require('../utils/responseHelper')

/** adoptionController.js — Adoption Request Logic */

// ─────────────────────────────────────────
// POST /api/adoptions — Submit a new request
// ─────────────────────────────────────────
const create = async (req, res, next) => {
  try {
    const { animal_id, message } = req.body

    // Prevent owner from adopting their own animal
    const [animalRows] = await pool.query('SELECT posted_by, status FROM animals WHERE id = ?', [animal_id])
    if (!animalRows.length) return sendError(res, 'Animal not found', 404)
    if (animalRows[0].posted_by === req.user.id) return sendError(res, 'You cannot adopt your own post', 400)
    if (animalRows[0].status !== 'available') return sendError(res, 'This animal is no longer available', 400)

    const [result] = await pool.query(
      'INSERT INTO adoption_requests (animal_id, requester_id, message) VALUES (?, ?, ?)',
      [animal_id, req.user.id, message]
    )
    sendSuccess(res, { id: result.insertId }, 'Adoption request submitted', 201)
  } catch (err) {
    // Handle duplicate request (unique constraint violation)
    if (err.code === 'ER_DUP_ENTRY') {
      return sendError(res, 'You have already sent an adoption request for this animal', 409)
    }
    next(err)
  }
}

// ─────────────────────────────────────────
// GET /api/adoptions/my — Requests sent by me
// ─────────────────────────────────────────
const getMine = async (req, res, next) => {
  try {
    const [requests] = await pool.query(`
      SELECT ar.*, a.type, a.breed, a.status AS animal_status,
        (SELECT image_url FROM animal_images WHERE animal_id = a.id LIMIT 1) AS thumbnail
      FROM adoption_requests ar
      JOIN animals a ON ar.animal_id = a.id
      WHERE ar.requester_id = ?
      ORDER BY ar.created_at DESC
    `, [req.user.id])
    sendSuccess(res, { requests })
  } catch (err) { next(err) }
}

// ─────────────────────────────────────────
// GET /api/adoptions/received — Requests for my animal posts
// ─────────────────────────────────────────
const getReceived = async (req, res, next) => {
  try {
    const [requests] = await pool.query(`
      SELECT ar.*, a.type, a.breed, u.name AS requester_name, u.email AS requester_email,
        (SELECT image_url FROM animal_images WHERE animal_id = a.id LIMIT 1) AS thumbnail
      FROM adoption_requests ar
      JOIN animals a ON ar.animal_id = a.id
      JOIN users u ON ar.requester_id = u.id
      WHERE a.posted_by = ?
      ORDER BY ar.created_at DESC
    `, [req.user.id])
    sendSuccess(res, { requests })
  } catch (err) { next(err) }
}

// ─────────────────────────────────────────
// GET /api/adoptions/check/:animalId
// Check if logged-in user already applied for this animal
// ─────────────────────────────────────────
const checkMine = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, status FROM adoption_requests WHERE animal_id = ? AND requester_id = ?',
      [req.params.animalId, req.user.id]
    )
    sendSuccess(res, { existing: rows[0] || null })
  } catch (err) { next(err) }
}

// ─────────────────────────────────────────
// PATCH /api/adoptions/:id — Approve or reject (owner only)
// ─────────────────────────────────────────
const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body
    const validStatuses = ['approved', 'rejected', 'pending']
    if (!validStatuses.includes(status)) {
      return sendError(res, `Status must be one of: ${validStatuses.join(', ')}`)
    }

    // FIX 1: Ownership guard — only the animal's poster can approve/reject
    const [ownerRows] = await pool.query(`
      SELECT ar.id, ar.animal_id
      FROM adoption_requests ar
      JOIN animals a ON ar.animal_id = a.id
      WHERE ar.id = ? AND a.posted_by = ?
    `, [req.params.id, req.user.id])

    if (!ownerRows.length) {
      return sendError(res, 'Not authorised to update this request', 403)
    }

    const animalId = ownerRows[0].animal_id

    // Update the request status
    await pool.query('UPDATE adoption_requests SET status = ? WHERE id = ?', [status, req.params.id])

    // FIX 2: Auto-cascade when approved
    if (status === 'approved') {
      // Mark the animal as adopted
      await pool.query('UPDATE animals SET status = ? WHERE id = ?', ['adopted', animalId])

      // Auto-reject all other pending requests for this animal
      await pool.query(
        'UPDATE adoption_requests SET status = ? WHERE animal_id = ? AND id != ? AND status = ?',
        ['rejected', animalId, req.params.id, 'pending']
      )
    }

    sendSuccess(res, {}, `Adoption request ${status}`)
  } catch (err) { next(err) }
}

// ─────────────────────────────────────────
// DELETE /api/adoptions/:id — Cancel my own pending request
// ─────────────────────────────────────────
const cancel = async (req, res, next) => {
  try {
    // Verify the request belongs to this user
    const [rows] = await pool.query(
      'SELECT id, status FROM adoption_requests WHERE id = ? AND requester_id = ?',
      [req.params.id, req.user.id]
    )
    if (!rows.length) return sendError(res, 'Request not found or not yours', 404)

    // FIX 3: Only pending requests can be cancelled
    if (rows[0].status !== 'pending') {
      return sendError(res, `Cannot cancel a request that is already ${rows[0].status}`, 400)
    }

    await pool.query('DELETE FROM adoption_requests WHERE id = ?', [req.params.id])
    sendSuccess(res, {}, 'Adoption request cancelled')
  } catch (err) { next(err) }
}

module.exports = { create, getMine, getReceived, checkMine, updateStatus, cancel }
