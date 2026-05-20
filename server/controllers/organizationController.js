const pool = require('../config/db')
const { sendSuccess, sendError } = require('../utils/responseHelper')

/**
 * organizationController.js — Organization Profile & Approval Logic
 */

// POST /api/organizations/setup — Initial profile creation for newly registered orgs
const createProfile = async (req, res, next) => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const {
      name, description, contact_number, address,
      latitude, longitude, city, website, max_capacity,
      animal_types // Array of types: ['dog', 'cat']
    } = req.body

    // 1. Check if org already exists and is complete
    const [existing] = await connection.query('SELECT id, profile_complete FROM organizations WHERE user_id = ?', [req.user.id])
    if (existing.length > 0 && existing[0].profile_complete === 1) {
      await connection.rollback()
      return sendError(res, 'Organization profile already exists for this user', 400)
    }

    let orgId
    if (existing.length > 0) {
      // 2. Update existing minimal row
      orgId = existing[0].id
      await connection.query(
        `UPDATE organizations SET 
          name = ?, 
          description = ?, 
          contact_number = ?, 
          address = ?, 
          latitude = ?, 
          longitude = ?, 
          city = ?,
          website = ?, 
          max_capacity = ?, 
          status = 'pending',
          profile_complete = 1
         WHERE id = ?`,
        [name, description, contact_number, address, latitude, longitude, city, website, max_capacity || 0, orgId]
      )
    } else {
      // 2. Insert new record (fallback)
      const [result] = await connection.query(
        `INSERT INTO organizations 
          (user_id, name, description, contact_number, address, latitude, longitude, city, website, max_capacity, status, profile_complete)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 1)`,
        [req.user.id, name, description, contact_number, address, latitude, longitude, city, website, max_capacity || 0]
      )
      orgId = result.insertId
    }

    // 3. Handle animal types (if provided)
    if (animal_types && Array.isArray(animal_types) && animal_types.length > 0) {
      const typeValues = animal_types.map(type => [orgId, type])
      await connection.query(
        'INSERT INTO organization_animal_types (organization_id, animal_type) VALUES ?',
        [typeValues]
      )
    }

    // 4. Handle documents (if uploaded via multer)
    if (req.files && req.files.length > 0) {
      const docValues = req.files.map(file => [orgId, `/uploads/${file.filename}`, file.fieldname || 'document'])
      await connection.query(
        'INSERT INTO organization_documents (organization_id, document_url, document_type) VALUES ?',
        [docValues]
      )
    }

    await connection.commit()
    sendSuccess(res, { id: orgId }, 'Organization setup submitted for approval', 201)
  } catch (err) {
    await connection.rollback()
    next(err)
  } finally {
    connection.release()
  }
}

// GET /api/organizations/me — Get own org profile (private)
const getMyProfile = async (req, res, next) => {
  try {
    const [orgs] = await pool.query(
      `SELECT o.*, 
        (SELECT JSON_ARRAYAGG(animal_type) FROM organization_animal_types WHERE organization_id = o.id) AS animal_types
       FROM organizations o 
       WHERE o.user_id = ?`,
      [req.user.id]
    )

    if (orgs.length === 0) return sendError(res, 'Organization profile not found', 404)

    // Fetch documents
    const [docs] = await pool.query('SELECT * FROM organization_documents WHERE organization_id = ?', [orgs[0].id])
    
    sendSuccess(res, { organization: { ...orgs[0], documents: docs } })
  } catch (err) { next(err) }
}

// PUT /api/organizations/me — Update profile details
const updateProfile = async (req, res, next) => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const {
      name, description, contact_number, address,
      latitude, longitude, city, website, max_capacity,
      animal_types
    } = req.body

    const [orgs] = await connection.query('SELECT id FROM organizations WHERE user_id = ?', [req.user.id])
    if (orgs.length === 0) {
      await connection.rollback()
      return sendError(res, 'Organization profile not found', 404)
    }
    const orgId = orgs[0].id

    // Update main record
    await connection.query(
      `UPDATE organizations 
       SET name=?, description=?, contact_number=?, address=?, latitude=?, longitude=?, city=?, website=?, max_capacity=?
       WHERE id=?`,
      [name, description, contact_number, address, latitude, longitude, city, website, max_capacity, orgId]
    )

    // Sync animal types (delete all and re-insert)
    if (animal_types && Array.isArray(animal_types)) {
      await connection.query('DELETE FROM organization_animal_types WHERE organization_id = ?', [orgId])
      if (animal_types.length > 0) {
        const typeValues = animal_types.map(type => [orgId, type])
        await connection.query(
          'INSERT INTO organization_animal_types (organization_id, animal_type) VALUES ?',
          [typeValues]
        )
      }
    }

    await connection.commit()
    sendSuccess(res, {}, 'Organization profile updated')
  } catch (err) {
    await connection.rollback()
    next(err)
  } finally {
    connection.release()
  }
}

// GET /api/organizations — List all approved orgs (public)
const getAllApproved = async (req, res, next) => {
  try {
    const { animal_type, city } = req.query
    let query = `
      SELECT o.id, o.name, o.logo_url, o.address, o.city, o.latitude, o.longitude, o.max_capacity, o.current_occupancy, o.verified
      FROM organizations o
      WHERE o.status = 'approved'
    `
    const params = []

    if (animal_type) {
      query += ' AND o.id IN (SELECT organization_id FROM organization_animal_types WHERE animal_type = ?)'
      params.push(animal_type)
    }

    if (city) {
      query += ' AND o.address LIKE ?'
      params.push(`%${city}%`)
    }

    const [orgs] = await pool.query(query, params)

    // Fetch types for these orgs and attach them
    if (orgs.length > 0) {
      const orgIds = orgs.map(o => o.id)
      const [types] = await pool.query(
        'SELECT organization_id, animal_type FROM organization_animal_types WHERE organization_id IN (?)',
        [orgIds]
      )
      
      orgs.forEach(o => {
        o.animal_types = types
          .filter(t => t.organization_id === o.id)
          .map(t => t.animal_type)
      })
    }

    sendSuccess(res, { organizations: orgs })
  } catch (err) { next(err) }
}

// GET /api/organizations/:id — Public detailed profile
const getPublicProfile = async (req, res, next) => {
  try {
    const [orgs] = await pool.query(
      `SELECT id, name, description, contact_number, logo_url, address, city, latitude, longitude, website, max_capacity, current_occupancy, verified
       FROM organizations
       WHERE id = ? AND status = 'approved'`,
      [req.params.id]
    )

    if (orgs.length === 0) return sendError(res, 'Organization not found or not approved', 404)

    // Fetch animal types
    const [types] = await pool.query(
      'SELECT animal_type FROM organization_animal_types WHERE organization_id = ?',
      [req.params.id]
    )
    orgs[0].animal_types = types.map(t => t.animal_type)

    // Fetch gallery
    const [gallery] = await pool.query('SELECT image_url, caption FROM organization_gallery WHERE organization_id = ?', [req.params.id])
    
    // Fetch animals posted by this org
    const [animals] = await pool.query(
      `SELECT a.*, COALESCE(NULLIF(a.city, ''), o.city) AS city,
        (SELECT image_url FROM animal_images WHERE animal_id = a.id LIMIT 1) AS thumbnail
       FROM animals a
       LEFT JOIN organizations o ON a.organization_id = o.id
       WHERE a.organization_id = ? AND a.status = 'available'
       ORDER BY a.created_at DESC`,
      [req.params.id]
    )

    sendSuccess(res, { organization: { ...orgs[0], gallery, animals } })
  } catch (err) { next(err) }
}

// GET /api/organizations/me/stats — Stats for org dashboard
const getMyStats = async (req, res, next) => {
  try {
    const [orgs] = await pool.query('SELECT id, max_capacity, current_occupancy FROM organizations WHERE user_id = ?', [req.user.id])
    if (orgs.length === 0) return sendError(res, 'Organization profile not found', 404)
    const orgId = orgs[0].id

    const [animalsCount] = await pool.query('SELECT COUNT(*) AS count FROM animals WHERE organization_id = ?', [orgId])
    const [pendingHandovers] = await pool.query("SELECT COUNT(*) AS count FROM handover_requests WHERE organization_id = ? AND status = 'pending'", [orgId])
    const [adoptionsCount] = await pool.query(
      "SELECT COUNT(*) AS count FROM adoption_requests ar JOIN animals a ON ar.animal_id = a.id WHERE a.organization_id = ? AND ar.status = 'approved'",
      [orgId]
    )

    sendSuccess(res, {
      totalAnimals: animalsCount[0].count,
      pendingHandovers: pendingHandovers[0].count,
      totalAdoptions: adoptionsCount[0].count,
      capacity: {
        total: orgs[0].max_capacity,
        current: orgs[0].current_occupancy,
        available: Math.max(0, orgs[0].max_capacity - orgs[0].current_occupancy)
      }
    })
  } catch (err) { next(err) }
}

// PATCH /api/organizations/me/capacity — Manual capacity override
const updateCapacity = async (req, res, next) => {
  try {
    const { current_occupancy } = req.body
    if (current_occupancy === undefined) return sendError(res, 'current_occupancy is required')

    await pool.query(
      'UPDATE organizations SET current_occupancy = ? WHERE user_id = ?',
      [current_occupancy, req.user.id]
    )

    sendSuccess(res, {}, 'Occupancy updated')
  } catch (err) { next(err) }
}

module.exports = {
  createProfile,
  getMyProfile,
  updateProfile,
  getAllApproved,
  getPublicProfile,
  getMyStats,
  updateCapacity
}
