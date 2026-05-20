const fs = require('fs')
const path = require('path')
const pool = require('../config/db')
const { sendSuccess, sendError } = require('../utils/responseHelper')
const { updateOccupancy } = require('../utils/capacityHelper')

const DEBUG_LOG_PATH = path.join(__dirname, '..', '..', '.cursor', 'debug-a525ee.log')
/** NDJSON line for debug mode (session a525ee); never log secrets/PII */
const debugAgentFileLog = (entry) => {
  try {
    const line = JSON.stringify({ sessionId: 'a525ee', timestamp: Date.now(), ...entry }) + '\n'
    fs.appendFileSync(DEBUG_LOG_PATH, line)
  } catch (_) {}
}

const LEGACY_MEDICAL_CONFIG = {
  vaccinated: { type: 'Vaccination', description: 'Vaccination completed' },
  checkup: { type: 'General Checkup', description: 'General health checkup completed' },
  surgery: { type: 'Surgery', description: 'Surgery (Neutering/Spaying/Other) completed' }
}

const LEGACY_MEDICAL_TYPES = new Set(Object.values(LEGACY_MEDICAL_CONFIG).map(cfg => cfg.type))

const parseJsonArray = (value) => {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (typeof value !== 'string') return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch (_) {
    return []
  }
}

const parseBooleanLike = (value) => value === true || value === 'true' || value === 1 || value === '1'

const normalizeMedicalRecordEntry = (entry, fallbackDate = null) => {
  if (typeof entry === 'string') {
    const type = entry.trim()
    if (!type) return null
    return {
      record_type: type,
      description: `${type} completed`,
      record_date: fallbackDate
    }
  }

  if (!entry || typeof entry !== 'object') return null

  const record_type = String(entry.record_type || entry.type || '').trim()
  if (!record_type) return null

  return {
    record_type,
    description: String(entry.description || `${record_type} completed`),
    record_date: entry.record_date || entry.recordDate || fallbackDate
  }
}

const collectRequestedMedicalRecords = (body) => {
  const currentDate = new Date().toISOString().slice(0, 10)
  const hasLegacyFlags = ['vaccinated', 'checkup', 'surgery'].some(flag => body[flag] !== undefined)

  const structuredRecordsRaw =
    body.medical_records ??
    body.medicalRecords ??
    body.certifications ??
    body.medical_record_types ??
    body.medicalRecordTypes

  const structuredRecords = parseJsonArray(structuredRecordsRaw)
  const normalizedStructured = structuredRecords
    .map(entry => normalizeMedicalRecordEntry(entry, currentDate))
    .filter(Boolean)

  if (normalizedStructured.length > 0) {
    const dedupMap = new Map()
    normalizedStructured.forEach(record => dedupMap.set(record.record_type, record))

    Object.entries(LEGACY_MEDICAL_CONFIG).forEach(([flag, cfg]) => {
      if (parseBooleanLike(body[flag])) {
        dedupMap.set(cfg.type, {
          record_type: cfg.type,
          description: cfg.description,
          record_date: currentDate
        })
      }
    })

    return { mode: 'structured', records: Array.from(dedupMap.values()) }
  }

  if (!hasLegacyFlags) return { mode: 'none', records: [] }

  const legacyRecords = Object.entries(LEGACY_MEDICAL_CONFIG)
    .filter(([flag]) => parseBooleanLike(body[flag]))
    .map(([, cfg]) => ({
      record_type: cfg.type,
      description: cfg.description,
      record_date: currentDate
    }))

  return { mode: 'legacy', records: legacyRecords }
}

const enrichAnimalsWithMedical = async (animals, connection = pool) => {
  if (!animals || animals.length === 0) return animals || []

  const animalIds = animals.map(animal => animal.id)
  const [medicalRows] = await connection.query(
    `SELECT id, animal_id, record_type, description, DATE_FORMAT(record_date, '%Y-%m-%d') AS record_date, recorded_by
     FROM medical_records
     WHERE animal_id IN (?)`,
    [animalIds]
  )

  const recordsByAnimalId = new Map()
  medicalRows.forEach(record => {
    if (!recordsByAnimalId.has(record.animal_id)) {
      recordsByAnimalId.set(record.animal_id, [])
    }
    recordsByAnimalId.get(record.animal_id).push({
      id: record.id,
      record_type: record.record_type,
      description: record.description,
      record_date: record.record_date,
      recorded_by: record.recorded_by
    })
  })

  return animals.map(animal => {
    const medical_records = recordsByAnimalId.get(animal.id) || []
    const medical_record_types = medical_records.map(record => record.record_type)
    return {
      ...animal,
      medical_records,
      medical_record_types,
      has_medical_records: medical_record_types.length > 0
    }
  })
}

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
    const enrichedAnimals = await enrichAnimalsWithMedical(animals)
    sendSuccess(res, { animals: enrichedAnimals, count: enrichedAnimals.length })
  } catch (err) {
    next(err)
  }
}

// GET /api/animals/:id — Single animal with images
const getById = async (req, res, next) => {
  try {
    // #region agent log
    fetch('http://127.0.0.1:7443/ingest/910aaeb4-255d-413a-9ba8-809144c93304',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a525ee'},body:JSON.stringify({sessionId:'a525ee',runId:'pre-fix',hypothesisId:'H2',location:'animalController.js:getById:start',message:'getById called',data:{animalId:req.params.id},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    const [animals] = await pool.query(`
      SELECT a.*, a.city, u.name AS poster_name, u.email AS poster_email, u.phone AS poster_phone,
             o.name AS org_name, o.logo_url AS org_logo, o.verified AS org_verified,
             ad.requester_id AS adopter_id, au.name AS adopter_name
      FROM animals a
      JOIN users u ON a.posted_by = u.id
      LEFT JOIN organizations o ON a.organization_id = o.id
      LEFT JOIN adoption_requests ad ON ad.animal_id = a.id AND ad.status = 'approved'
      LEFT JOIN users au ON ad.requester_id = au.id
      WHERE a.id = ?
    `, [req.params.id])

    if (animals.length === 0) return sendError(res, 'Animal not found', 404)

    // Fetch all images for this animal
    const [images] = await pool.query(
      'SELECT image_url FROM animal_images WHERE animal_id = ?',
      [req.params.id]
    )

    // Fetch all medical records for this animal
    const [records] = await pool.query(
      `SELECT id, record_type, description, DATE_FORMAT(record_date, '%Y-%m-%d') AS record_date, recorded_by
       FROM medical_records
       WHERE animal_id = ?
       ORDER BY record_date DESC, id DESC`,
      [req.params.id]
    )
    // #region agent log
    fetch('http://127.0.0.1:7443/ingest/910aaeb4-255d-413a-9ba8-809144c93304',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a525ee'},body:JSON.stringify({sessionId:'a525ee',runId:'pre-fix',hypothesisId:'H2',location:'animalController.js:getById:records',message:'medical records fetched for animal',data:{animalId:req.params.id,recordCount:records.length,recordTypes:records.map(r=>r.record_type)},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    const medical_record_types = records.map(r => r.record_type)

    let rowPlain
    try {
      rowPlain = JSON.parse(JSON.stringify(animals[0]))
    } catch (_) {
      rowPlain = { ...animals[0] }
    }
    let recordsPlain
    try {
      recordsPlain = JSON.parse(JSON.stringify(records))
    } catch (_) {
      recordsPlain = records.map(r => ({ ...r }))
    }

    const animalDto = {
      ...rowPlain,
      images,
      medical_records: recordsPlain,
      medical_record_types,
      has_medical_records: medical_record_types.length > 0
    }

    // #region agent log
    debugAgentFileLog({
      runId: 'pre-fix',
      hypothesisId: 'H2',
      location: 'animalController.js:getById:outbound',
      message: 'outgoing animal DTO keys and medical counts',
      data: {
        animalId: req.params.id,
        recordCount: recordsPlain.length,
        recordTypes: medical_record_types,
        dtoKeys: Object.keys(animalDto),
        hasMedicalRecordsKey: Object.prototype.hasOwnProperty.call(animalDto, 'medical_records')
      }
    })
    // #endregion

    sendSuccess(res, { animal: animalDto })
  } catch (err) {
    next(err)
  }
}

// POST /api/animals — Create new post
const create = async (req, res, next) => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    if (req.user.role === 'admin') {
      await connection.rollback()
      return res.status(403).json({ success: false, message: 'Admins are not allowed to post animals' })
    }

    let {
      type, breed, age, gender, health_condition,
      rescue_urgency, latitude, longitude, city, description,
    } = req.body

    let organizationId = null

    // Logic for Organizations
    if (req.user.role === 'organization') {
      const [orgs] = await connection.query(
        'SELECT id, latitude, longitude FROM organizations WHERE user_id = ? AND status = "approved"',
        [req.user.id]
      )

      if (orgs.length === 0) {
        await connection.rollback()
        return sendError(res, 'Approved organization profile not found', 403)
      }

      organizationId = orgs[0].id
      // Auto-fill location from organization profile
      latitude = orgs[0].latitude
      longitude = orgs[0].longitude
    }

    const [result] = await connection.query(
      `INSERT INTO animals
        (type, breed, age, gender, health_condition, rescue_urgency, latitude, longitude, city, description, posted_by, organization_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [type, breed, age, gender, health_condition, rescue_urgency, latitude, longitude, city, description, req.user.id, organizationId]
    )

    const animalId = result.insertId

    // Save uploaded image paths
    if (req.files && req.files.length > 0) {
      const imageValues = req.files.map(file => [animalId, `/uploads/${file.filename}`])
      await connection.query('INSERT INTO animal_images (animal_id, image_url) VALUES ?', [imageValues])
    }

    const requestedMedical = collectRequestedMedicalRecords(req.body)
    // #region agent log
    fetch('http://127.0.0.1:7443/ingest/910aaeb4-255d-413a-9ba8-809144c93304',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a525ee'},body:JSON.stringify({sessionId:'a525ee',runId:'pre-fix',hypothesisId:'H1',location:'animalController.js:create:requestedMedical',message:'parsed medical records during create',data:{animalId,requestedMode:requestedMedical.mode,requestedCount:requestedMedical.records.length,requestedTypes:requestedMedical.records.map(r=>r.record_type)},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (requestedMedical.records.length > 0) {
      const values = requestedMedical.records.map(record => [
        animalId,
        req.user.id,
        record.record_type,
        record.description,
        record.record_date
      ])
      await connection.query(
        'INSERT INTO medical_records (animal_id, recorded_by, record_type, description, record_date) VALUES ?',
        [values]
      )
      // #region agent log
      fetch('http://127.0.0.1:7443/ingest/910aaeb4-255d-413a-9ba8-809144c93304',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a525ee'},body:JSON.stringify({sessionId:'a525ee',runId:'pre-fix',hypothesisId:'H1',location:'animalController.js:create:insertedMedical',message:'inserted medical records during create',data:{animalId,insertedCount:values.length},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
    }

    await connection.commit()

    // Increment occupancy after commit to avoid partial DB writes.
    if (organizationId) {
      await updateOccupancy(organizationId, 1)
    }

    sendSuccess(res, { id: animalId }, 'Animal post created successfully', 201)
  } catch (err) {
    await connection.rollback()
    next(err)
  } finally {
    connection.release()
  }
}

// PUT /api/animals/:id — Update post (owner only)
const update = async (req, res, next) => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const [animals] = await connection.query('SELECT posted_by FROM animals WHERE id = ?', [req.params.id])
    if (animals.length === 0) {
      await connection.rollback()
      return sendError(res, 'Animal not found', 404)
    }
    if (animals[0].posted_by !== req.user.id && req.user.role !== 'admin') {
      await connection.rollback()
      return sendError(res, 'Not authorised to edit this post', 403)
    }

    const { type, breed, age, gender, health_condition, rescue_urgency, city, description } = req.body
    await connection.query(
      `UPDATE animals SET type=?, breed=?, age=?, gender=?, health_condition=?, rescue_urgency=?, city=?, description=? WHERE id=?`,
      [type, breed, age, gender, health_condition, rescue_urgency, city, description, req.params.id]
    )

    const requestedMedical = collectRequestedMedicalRecords(req.body)
    // #region agent log
    fetch('http://127.0.0.1:7443/ingest/910aaeb4-255d-413a-9ba8-809144c93304',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a525ee'},body:JSON.stringify({sessionId:'a525ee',runId:'pre-fix',hypothesisId:'H1',location:'animalController.js:update:requestedMedical',message:'parsed medical records during update',data:{animalId:req.params.id,requestedMode:requestedMedical.mode,requestedCount:requestedMedical.records.length,requestedTypes:requestedMedical.records.map(r=>r.record_type),bodyFlags:{vaccinated:req.body.vaccinated,checkup:req.body.checkup,surgery:req.body.surgery}},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (requestedMedical.mode !== 'none') {
      const [existingRecords] = await connection.query(
        'SELECT id, record_type FROM medical_records WHERE animal_id = ?',
        [req.params.id]
      )
      // #region agent log
      fetch('http://127.0.0.1:7443/ingest/910aaeb4-255d-413a-9ba8-809144c93304',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a525ee'},body:JSON.stringify({sessionId:'a525ee',runId:'pre-fix',hypothesisId:'H1',location:'animalController.js:update:existingMedical',message:'existing medical records before update sync',data:{animalId:req.params.id,existingCount:existingRecords.length,existingTypes:existingRecords.map(r=>r.record_type)},timestamp:Date.now()})}).catch(()=>{});
      // #endregion

      if (requestedMedical.mode === 'structured') {
        await connection.query('DELETE FROM medical_records WHERE animal_id = ?', [req.params.id])
        if (requestedMedical.records.length > 0) {
          const values = requestedMedical.records.map(record => [
            req.params.id,
            req.user.id,
            record.record_type,
            record.description,
            record.record_date
          ])
          await connection.query(
            'INSERT INTO medical_records (animal_id, recorded_by, record_type, description, record_date) VALUES ?',
            [values]
          )
        }
      } else {
        const desiredTypes = new Set(requestedMedical.records.map(record => record.record_type))
        const existingLegacyTypes = new Set(
          existingRecords.filter(record => LEGACY_MEDICAL_TYPES.has(record.record_type)).map(record => record.record_type)
        )

        const typesToDelete = Array.from(existingLegacyTypes).filter(type => !desiredTypes.has(type))
        if (typesToDelete.length > 0) {
          await connection.query(
            'DELETE FROM medical_records WHERE animal_id = ? AND record_type IN (?)',
            [req.params.id, typesToDelete]
          )
        }

        const typesToInsert = requestedMedical.records.filter(record => !existingLegacyTypes.has(record.record_type))
        if (typesToInsert.length > 0) {
          const values = typesToInsert.map(record => [
            req.params.id,
            req.user.id,
            record.record_type,
            record.description,
            record.record_date
          ])
          await connection.query(
            'INSERT INTO medical_records (animal_id, recorded_by, record_type, description, record_date) VALUES ?',
            [values]
          )
        }
      }
    }

    await connection.commit()
    sendSuccess(res, {}, 'Animal updated successfully')
  } catch (err) {
    await connection.rollback()
    next(err)
  } finally {
    connection.release()
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

    const [animals] = await pool.query('SELECT posted_by FROM animals WHERE id = ?', [req.params.id])
    if (animals.length === 0) return sendError(res, 'Animal not found', 404)
    if (animals[0].posted_by !== req.user.id && req.user.role !== 'admin') {
      return sendError(res, 'Not authorised to update status', 403)
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

    const enrichedAnimals = await enrichAnimalsWithMedical(animals)
    sendSuccess(res, { animals: enrichedAnimals, count: enrichedAnimals.length })
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
