const pool = require('../config/db')
const { sendSuccess, sendError } = require('../utils/responseHelper')

/** rescueController.js — Rescue Request Logic */

const create = async (req, res, next) => {
  try {
    const { animal_id, notes } = req.body
    const [result] = await pool.query(
      'INSERT INTO rescue_requests (animal_id, reported_by, notes) VALUES (?, ?, ?)',
      [animal_id, req.user.id, notes]
    )
    // Also mark the animal as pending rescue
    await pool.query("UPDATE animals SET status = 'pending' WHERE id = ?", [animal_id])
    sendSuccess(res, { id: result.insertId }, 'Rescue request submitted', 201)
  } catch (err) { next(err) }
}

const getAll = async (req, res, next) => {
  try {
    const [requests] = await pool.query(`
      SELECT rr.*, a.type, a.breed, a.latitude, a.longitude, a.rescue_urgency,
        u.name AS reporter_name,
        (SELECT image_url FROM animal_images WHERE animal_id = a.id LIMIT 1) AS thumbnail
      FROM rescue_requests rr
      JOIN animals a ON rr.animal_id = a.id
      JOIN users u ON rr.reported_by = u.id
      ORDER BY a.rescue_urgency DESC, rr.created_at DESC
    `)
    sendSuccess(res, { requests })
  } catch (err) { next(err) }
}

const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body
    const validStatuses = ['pending', 'in_progress', 'resolved']
    if (!validStatuses.includes(status)) {
      return sendError(res, `Status must be: ${validStatuses.join(', ')}`)
    }
    await pool.query('UPDATE rescue_requests SET status = ? WHERE id = ?', [status, req.params.id])
    sendSuccess(res, {}, 'Rescue status updated')
  } catch (err) { next(err) }
}

const getMine = async (req, res, next) => {
  try {
    const [requests] = await pool.query(`
      SELECT rr.*, a.type, a.breed, a.status AS animal_status,
        (SELECT image_url FROM animal_images WHERE animal_id = a.id LIMIT 1) AS thumbnail
      FROM rescue_requests rr
      JOIN animals a ON rr.animal_id = a.id
      WHERE rr.reported_by = ?
      ORDER BY rr.created_at DESC
    `, [req.user.id])
    sendSuccess(res, { requests })
  } catch (err) { next(err) }
}

module.exports = { create, getAll, updateStatus, getMine }
