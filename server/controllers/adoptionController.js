const pool = require('../config/db')
const { sendSuccess, sendError } = require('../utils/responseHelper')

/** adoptionController.js — Adoption Request Logic */

// POST /api/adoptions
const create = async (req, res, next) => {
  try {
    const { animal_id, message } = req.body
    const [result] = await pool.query(
      'INSERT INTO adoption_requests (animal_id, requester_id, message) VALUES (?, ?, ?)',
      [animal_id, req.user.id, message]
    )
    sendSuccess(res, { id: result.insertId }, 'Adoption request submitted', 201)
  } catch (err) { next(err) }
}

// GET /api/adoptions/my
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

// GET /api/adoptions/received
const getReceived = async (req, res, next) => {
  try {
    const [requests] = await pool.query(`
      SELECT ar.*, a.type, a.breed, u.name AS requester_name, u.email AS requester_email
      FROM adoption_requests ar
      JOIN animals a ON ar.animal_id = a.id
      JOIN users u ON ar.requester_id = u.id
      WHERE a.posted_by = ?
      ORDER BY ar.created_at DESC
    `, [req.user.id])
    sendSuccess(res, { requests })
  } catch (err) { next(err) }
}

// PATCH /api/adoptions/:id
const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body
    const validStatuses = ['approved', 'rejected', 'pending']
    if (!validStatuses.includes(status)) {
      return sendError(res, `Status must be: ${validStatuses.join(', ')}`)
    }
    await pool.query('UPDATE adoption_requests SET status = ? WHERE id = ?', [status, req.params.id])
    sendSuccess(res, {}, `Adoption request ${status}`)
  } catch (err) { next(err) }
}

module.exports = { create, getMine, getReceived, updateStatus }
