const pool = require('../config/db')
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

module.exports = { getStats, getUsers, updateUserStatus, getAnimals, deleteAnimal, getReports }
