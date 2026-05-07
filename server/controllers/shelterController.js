const pool = require('../config/db')
const { sendSuccess, sendError } = require('../utils/responseHelper')

/** shelterController.js — Shelter/Rescue Organization Logic */

// GET /api/shelters/me
const getMyShelter = async (req, res, next) => {
  try {
    const [shelters] = await pool.query(
      'SELECT * FROM shelters WHERE user_id = ?',
      [req.user.id]
    )
    if (!shelters.length) return sendError(res, 'Shelter profile not found', 404)
    sendSuccess(res, { shelter: shelters[0] })
  } catch (err) { next(err) }
}

// PUT /api/shelters/me
const updateShelter = async (req, res, next) => {
  try {
    const { org_name, address, latitude, longitude, website } = req.body
    await pool.query(
      `UPDATE shelters 
       SET org_name = ?, address = ?, latitude = ?, longitude = ?, website = ? 
       WHERE user_id = ?`,
      [org_name, address, latitude, longitude, website, req.user.id]
    )
    sendSuccess(res, {}, 'Shelter profile updated')
  } catch (err) { next(err) }
}

// GET /api/shelters/animals
const getAssignedAnimals = async (req, res, next) => {
  try {
    // First get the shelter ID for this user
    const [shelters] = await pool.query('SELECT id FROM shelters WHERE user_id = ?', [req.user.id])
    if (!shelters.length) return sendError(res, 'Shelter profile not found', 404)
    
    const shelterId = shelters[0].id

    const [animals] = await pool.query(`
      SELECT a.*, 
        (SELECT image_url FROM animal_images WHERE animal_id = a.id LIMIT 1) AS thumbnail
      FROM animals a
      WHERE a.shelter_id = ?
      ORDER BY a.updated_at DESC
    `, [shelterId])

    sendSuccess(res, { animals })
  } catch (err) { next(err) }
}

module.exports = { getMyShelter, updateShelter, getAssignedAnimals }
