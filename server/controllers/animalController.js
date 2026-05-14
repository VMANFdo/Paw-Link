const pool = require('../config/db')
const { sendSuccess, sendError } = require('../utils/responseHelper')
const { updateOccupancy } = require('../utils/capacityHelper')

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
      LEFT JOIN organizations o ON a.organization_id = o.id
      WHERE (a.organization_id IS NULL OR o.status = 'approved')
    `
    const params = []

    if (type)    { query += ' AND a.type = ?';             params.push(type) }
    if (urgency) { query += ' AND a.rescue_urgency = ?';   params.push(urgency) }
    if (req.query.city) { query += ' AND a.city LIKE ?';   params.push(`%${req.query.city}%`) }

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
      SELECT a.*, a.city, u.name AS poster_name, u.email AS poster_email, u.phone AS poster_phone,
             o.name AS org_name, o.logo_url AS org_logo, o.verified AS org_verified
      FROM animals a
      JOIN users u ON a.posted_by = u.id
      LEFT JOIN organizations o ON a.organization_id = o.id
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
    if (req.user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Admins are not allowed to post animals' })
    }

    let {
      type, breed, age, gender, health_condition,
      rescue_urgency, latitude, longitude, city, description,
    } = req.body

    let organizationId = null

    // Logic for Organizations
    if (req.user.role === 'organization') {
      const [orgs] = await pool.query(
        'SELECT id, latitude, longitude FROM organizations WHERE user_id = ? AND status = "approved"',
        [req.user.id]
      )

      if (orgs.length === 0) {
        return sendError(res, 'Approved organization profile not found', 403)
      }

      organizationId = orgs[0].id
      // Auto-fill location from organization profile
      latitude = orgs[0].latitude
      longitude = orgs[0].longitude
    }

    const [result] = await pool.query(
      `INSERT INTO animals
        (type, breed, age, gender, health_condition, rescue_urgency, latitude, longitude, city, description, posted_by, organization_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [type, breed, age, gender, health_condition, rescue_urgency, latitude, longitude, city, description, req.user.id, organizationId]
    )

    const animalId = result.insertId

    // Save uploaded image paths
    if (req.files && req.files.length > 0) {
      const imageValues = req.files.map(file => [animalId, `/uploads/${file.filename}`])
      await pool.query('INSERT INTO animal_images (animal_id, image_url) VALUES ?', [imageValues])
    }

    // Increment occupancy if posted by an org
    if (organizationId) {
      await updateOccupancy(organizationId, 1)
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

// GET /api/animals/cities — Get all unique cities
const getCities = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT DISTINCT city 
      FROM animals 
      WHERE city IS NOT NULL AND city != '' 
      ORDER BY city ASC
    `)
    const cities = rows.map(r => r.city)
    sendSuccess(res, { cities })
  } catch (err) {
    next(err)
  }
}

const getPublicStats = async (req, res, next) => {
  try {
    const [users] = await pool.query('SELECT COUNT(*) AS count FROM users')
    const [available] = await pool.query("SELECT COUNT(*) AS count FROM animals WHERE status = 'available'")
    const [orgs] = await pool.query("SELECT COUNT(*) AS count FROM users WHERE role = 'organization'")
    const [saved] = await pool.query("SELECT COUNT(*) AS count FROM animals WHERE status IN ('adopted', 'rescued')")

    sendSuccess(res, {
      activeUsers: users[0].count,
      needShelter: available[0].count,
      organizations: orgs[0].count,
      livesSaved: saved[0].count
    })
  } catch (err) { next(err) }
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  updateStatus,
  getMine,
  getCities,
  getPublicStats
}
