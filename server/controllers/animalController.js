const pool = require('../config/db')
const { sendSuccess, sendError } = require('../utils/responseHelper')

/**
 * animalController.js — Animal Post CRUD
 */

// GET /api/animals — List all (with optional filters)
const getAll = async (req, res, next) => {
  try {
    const { type, status, urgency, lat, lng, radius } = req.query

    let query = `
      SELECT a.*, a.city, u.name AS poster_name,
        (SELECT image_url FROM animal_images WHERE animal_id = a.id LIMIT 1) AS thumbnail
      FROM animals a
      JOIN users u ON a.posted_by = u.id
      WHERE 1=1
    `
    const params = []

    if (type)    { query += ' AND a.type = ?';             params.push(type) }
    if (urgency) { query += ' AND a.rescue_urgency = ?';   params.push(urgency) }

    // Status filter:
    // - If a specific status is requested (e.g. admin view), honour it.
    // - If no status is given (public browse), only show 'available' and 'pending'.
    //   Adopted/rescued animals are hidden from the public browse list.
    if (status) {
      query += ' AND a.status = ?'
      params.push(status)
    } else {
      query += " AND a.status IN ('available', 'pending')"
    }

    // Haversine formula for geo radius search
    if (lat && lng && radius) {
      query += `
        AND (
          6371 * ACOS(
            COS(RADIANS(?)) * COS(RADIANS(a.latitude)) *
            COS(RADIANS(a.longitude) - RADIANS(?)) +
            SIN(RADIANS(?)) * SIN(RADIANS(a.latitude))
          )
        ) <= ?
      `
      params.push(lat, lng, lat, radius)
    }

    query += ' ORDER BY a.created_at DESC'

    const [animals] = await pool.query(query, params)
    sendSuccess(res, { animals, count: animals.length })
  } catch (err) {
    next(err)
  }
}

// GET /api/animals/:id — Single animal with images
const getById = async (req, res, next) => {
  try {
    const [animals] = await pool.query(`
      SELECT a.*, a.city, u.name AS poster_name, u.email AS poster_email, u.phone AS poster_phone
      FROM animals a
      JOIN users u ON a.posted_by = u.id
      WHERE a.id = ?
    `, [req.params.id])

    if (animals.length === 0) return sendError(res, 'Animal not found', 404)

    // Fetch all images for this animal
    const [images] = await pool.query(
      'SELECT image_url FROM animal_images WHERE animal_id = ?',
      [req.params.id]
    )

    sendSuccess(res, { animal: { ...animals[0], images } })
  } catch (err) {
    next(err)
  }
}

// POST /api/animals — Create new post
const create = async (req, res, next) => {
  try {
    const {
      type, breed, age, gender, health_condition,
      rescue_urgency, latitude, longitude, city, description,
    } = req.body

    const [result] = await pool.query(
      `INSERT INTO animals
        (type, breed, age, gender, health_condition, rescue_urgency, latitude, longitude, city, description, posted_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [type, breed, age, gender, health_condition, rescue_urgency, latitude, longitude, city, description, req.user.id]
    )

    const animalId = result.insertId

    // Save uploaded image paths to animal_images table
    if (req.files && req.files.length > 0) {
      const imageValues = req.files.map(file => [animalId, `/uploads/${file.filename}`])
      await pool.query('INSERT INTO animal_images (animal_id, image_url) VALUES ?', [imageValues])
    }

    sendSuccess(res, { id: animalId }, 'Animal post created successfully', 201)
  } catch (err) {
    next(err)
  }
}

// PUT /api/animals/:id — Update post (owner only)
const update = async (req, res, next) => {
  try {
    const [animals] = await pool.query('SELECT posted_by FROM animals WHERE id = ?', [req.params.id])
    if (animals.length === 0) return sendError(res, 'Animal not found', 404)
    if (animals[0].posted_by !== req.user.id && req.user.role !== 'admin') {
      return sendError(res, 'Not authorised to edit this post', 403)
    }

    const { type, breed, age, gender, health_condition, rescue_urgency, city, description } = req.body
    await pool.query(
      `UPDATE animals SET type=?, breed=?, age=?, gender=?, health_condition=?, rescue_urgency=?, city=?, description=? WHERE id=?`,
      [type, breed, age, gender, health_condition, rescue_urgency, city, description, req.params.id]
    )

    sendSuccess(res, {}, 'Animal updated successfully')
  } catch (err) {
    next(err)
  }
}

// DELETE /api/animals/:id
const remove = async (req, res, next) => {
  try {
    const [animals] = await pool.query('SELECT posted_by FROM animals WHERE id = ?', [req.params.id])
    if (animals.length === 0) return sendError(res, 'Animal not found', 404)
    if (animals[0].posted_by !== req.user.id && req.user.role !== 'admin') {
      return sendError(res, 'Not authorised to delete this post', 403)
    }

    await pool.query('DELETE FROM animals WHERE id = ?', [req.params.id])
    sendSuccess(res, {}, 'Animal post deleted')
  } catch (err) {
    next(err)
  }
}

// PATCH /api/animals/:id/status
const updateStatus = async (req, res, next) => {
  try {
    const validStatuses = ['available', 'adopted', 'rescued', 'pending']
    if (!validStatuses.includes(req.body.status)) {
      return sendError(res, `Status must be one of: ${validStatuses.join(', ')}`)
    }

    await pool.query('UPDATE animals SET status = ? WHERE id = ?', [req.body.status, req.params.id])
    sendSuccess(res, {}, 'Status updated')
  } catch (err) {
    next(err)
  }
}

// GET /api/animals/my — Get animals posted by the logged-in user
const getMine = async (req, res, next) => {
  try {
    const [animals] = await pool.query(`
      SELECT a.*, a.city,
        (SELECT image_url FROM animal_images WHERE animal_id = a.id LIMIT 1) AS thumbnail
      FROM animals a
      WHERE a.posted_by = ?
      ORDER BY a.created_at DESC
    `, [req.user.id])

    sendSuccess(res, { animals, count: animals.length })
  } catch (err) {
    next(err)
  }
}

module.exports = { getAll, getById, create, update, remove, updateStatus, getMine }
