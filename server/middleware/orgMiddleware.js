const pool = require('../config/db')
const { sendError } = require('../utils/responseHelper')

/**
 * orgMiddleware.js — Approval Gate
 * 
 * WHY: Only organizations that have been reviewed and approved 
 * by an admin should be allowed to:
 *  - Post animals
 *  - Receive handovers
 *  - Appear in public listings
 * 
 * This middleware blocks any 'organization' user whose status 
 * is not 'approved'.
 */

const orgMiddleware = async (req, res, next) => {
  try {
    // 1. Ensure user is logged in (authMiddleware should run before this)
    if (!req.user) {
      return sendError(res, 'Authentication required', 401)
    }

    // 2. If not an organization, allow to pass (let roleMiddleware handle role checks)
    // However, if they ARE an organization, we MUST check status.
    if (req.user.role !== 'organization') {
      return next()
    }

    // 3. Check status in organizations table
    const [orgs] = await pool.query(
      'SELECT status FROM organizations WHERE user_id = ?',
      [req.user.id]
    )

    if (orgs.length === 0) {
      return sendError(res, 'Organization profile not found. Please complete setup.', 403)
    }

    const status = orgs[0].status

    if (status === 'pending') {
      return sendError(res, 'Your organization is awaiting admin approval.', 403)
    }

    if (status === 'rejected') {
      return sendError(res, 'Your organization application was rejected.', 403)
    }

    if (status === 'more_docs_needed') {
      return sendError(res, 'Admin has requested more documents for your organization.', 403)
    }

    if (status === 'approved') {
      // Attach org ID to request for convenience in controllers
      const [details] = await pool.query('SELECT id FROM organizations WHERE user_id = ?', [req.user.id])
      req.organizationId = details[0].id
      return next()
    }

    return sendError(res, 'Unauthorized organization status', 403)

  } catch (err) {
    next(err)
  }
}

module.exports = orgMiddleware
