const pool = require('../config/db')
const { sendSuccess, sendError } = require('../utils/responseHelper')
const { updateOccupancy } = require('../utils/capacityHelper')

/**
 * handoverController.js — Animal Handover Logic
 */

// POST /api/handovers — User submits a request to a shelter
const createRequest = async (req, res, next) => {
  try {
    const { organization_id, animal_id, description, pickup_address, animal_type } = req.body

    if (!organization_id || !description) {
      return sendError(res, 'Organization ID and description are required')
    }

    // 1. Verify organization is approved and has capacity
    const [orgs] = await pool.query(
      'SELECT status, max_capacity, current_occupancy FROM organizations WHERE id = ?',
      [organization_id]
    )

    if (orgs.length === 0 || orgs[0].status !== 'approved') {
      return sendError(res, 'Shelter not found or not accepting requests', 404)
    }

    if (orgs[0].current_occupancy >= orgs[0].max_capacity) {
      return sendError(res, 'This shelter is currently at maximum capacity', 400)
    }

    // 2. Create the request
    const [result] = await pool.query(
      `INSERT INTO handover_requests 
        (user_id, organization_id, animal_id, description, pickup_address, animal_type, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [req.user.id, organization_id, animal_id || null, description, pickup_address, animal_type]
    )

    sendSuccess(res, { id: result.insertId }, 'Handover request sent successfully', 201)
  } catch (err) { next(err) }
}

// GET /api/handovers/my — User views their own requests
const getMyRequests = async (req, res, next) => {
  try {
    const [requests] = await pool.query(
      `SELECT hr.*, o.name AS organization_name, o.logo_url AS organization_logo
       FROM handover_requests hr
       JOIN organizations o ON hr.organization_id = o.id
       WHERE hr.user_id = ?
       ORDER BY hr.created_at DESC`,
      [req.user.id]
    )

    sendSuccess(res, { requests })
  } catch (err) { next(err) }
}

// GET /api/handovers/received — Organization views incoming requests
const getReceived = async (req, res, next) => {
  try {
    // First get org ID from user ID
    const [orgs] = await pool.query('SELECT id FROM organizations WHERE user_id = ?', [req.user.id])
    if (orgs.length === 0) return sendError(res, 'Organization profile not found', 404)
    const orgId = orgs[0].id

    const [requests] = await pool.query(
      `SELECT hr.*, u.name AS requester_name, u.email AS requester_email
       FROM handover_requests hr
       JOIN users u ON hr.user_id = u.id
       WHERE hr.organization_id = ?
       ORDER BY hr.created_at DESC`,
      [orgId]
    )

    sendSuccess(res, { requests })
  } catch (err) { next(err) }
}

// PATCH /api/handovers/:id/status — Organization accepts or rejects
const updateStatus = async (req, res, next) => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const { status, org_notes } = req.body
    if (!['accepted', 'rejected', 'completed'].includes(status)) {
      return sendError(res, 'Invalid status')
    }

    // 1. Verify org ownership
    const [orgs] = await connection.query('SELECT id FROM organizations WHERE user_id = ?', [req.user.id])
    if (orgs.length === 0) {
      await connection.rollback()
      return sendError(res, 'Organization profile not found', 404)
    }
    const orgId = orgs[0].id

    const [requests] = await connection.query(
      'SELECT status FROM handover_requests WHERE id = ? AND organization_id = ?',
      [req.params.id, orgId]
    )

    if (requests.length === 0) {
      await connection.rollback()
      return sendError(res, 'Handover request not found', 404)
    }

    const oldStatus = requests[0].status

    // 2. Update status
    await connection.query(
      'UPDATE handover_requests SET status = ?, org_notes = ? WHERE id = ?',
      [status, org_notes, req.params.id]
    )

    // 3. Logic triggers
    if (status === 'accepted' && oldStatus !== 'accepted') {
      // Increment capacity
      await connection.query(
        'UPDATE organizations SET current_occupancy = current_occupancy + 1 WHERE id = ?',
        [orgId]
      )
    } else if (oldStatus === 'accepted' && (status === 'rejected' || status === 'completed')) {
      // This is less common but handles reversals
      // Actually 'completed' usually keeps the animal there, so occupancy stays.
      // If 'rejected' after being 'accepted' (reversal), decrement.
      if (status === 'rejected') {
        await connection.query(
          'UPDATE organizations SET current_occupancy = GREATEST(0, current_occupancy - 1) WHERE id = ?',
          [orgId]
        )
      }
    }

    await connection.commit()
    sendSuccess(res, {}, `Request marked as ${status}`)
  } catch (err) {
    await connection.rollback()
    next(err)
  } finally {
    connection.release()
  }
}

module.exports = {
  createRequest,
  getMyRequests,
  getReceived,
  updateStatus
}
