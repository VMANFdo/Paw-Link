const pool = require('../config/db')
const { sendSuccess, sendError } = require('../utils/responseHelper')

/** reportController.js — Animal Post Report Submissions */

/**
 * POST /api/reports
 * Allows a logged-in user to report an animal post.
 * Prevents: self-reporting, duplicate reports.
 */
const createReport = async (req, res, next) => {
  try {
    const reporterId = req.user.id
    const { animal_id, reason, details } = req.body

    // 1. Validate required fields
    if (!animal_id || !reason) {
      return sendError(res, 'Animal ID and reason are required', 400)
    }

    const validReasons = ['fake_post', 'animal_already_adopted', 'animal_is_missing', 'other']
    if (!validReasons.includes(reason)) {
      return sendError(res, 'Invalid report reason', 400)
    }

    if (reason === 'other' && (!details || !details.trim())) {
      return sendError(res, 'Please provide details when selecting "Other"', 400)
    }

    // 2. Check animal exists and get the poster
    const [animals] = await pool.query('SELECT id, posted_by FROM animals WHERE id = ?', [animal_id])
    if (animals.length === 0) {
      return sendError(res, 'Animal post not found', 404)
    }

    // 3. Prevent self-reporting
    if (animals[0].posted_by === reporterId) {
      return sendError(res, 'You cannot report your own post', 403)
    }

    // 4. Prevent duplicate reports from the same user on the same post
    const [existing] = await pool.query(
      'SELECT id FROM reports WHERE reporter_id = ? AND animal_id = ? AND status = "pending"',
      [reporterId, animal_id]
    )
    if (existing.length > 0) {
      return sendError(res, 'You have already submitted a report for this post', 409)
    }

    // 5. Insert the report
    await pool.query(
      'INSERT INTO reports (reporter_id, animal_id, reason, details, status) VALUES (?, ?, ?, ?, "pending")',
      [reporterId, animal_id, reason, details?.trim() || null]
    )

    sendSuccess(res, {}, 'Report submitted successfully. Our team will review it shortly.', 201)
  } catch (err) {
    next(err)
  }
}

module.exports = { createReport }
