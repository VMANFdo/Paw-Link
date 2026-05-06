/**
 * utils/responseHelper.js — Standardised API Response Helpers
 *
 * WHY: Every API endpoint should return the same JSON shape.
 * This makes it much easier for the frontend to handle responses
 * predictably, without checking different field names each time.
 *
 * Standard response shape:
 * {
 *   "success": true | false,
 *   "message": "Human readable message",
 *   "data":    { ... }   (on success)
 *   "errors":  [ ... ]   (on failure, optional)
 * }
 */

/**
 * Send a success response
 * @param {object} res     - Express response object
 * @param {object} data    - Payload to return
 * @param {string} message - Human-readable success message
 * @param {number} status  - HTTP status code (default 200)
 */
const sendSuccess = (res, data = {}, message = 'Success', status = 200) => {
  res.status(status).json({
    success: true,
    message,
    data,
  })
}

/**
 * Send an error response
 * @param {object} res     - Express response object
 * @param {string} message - Human-readable error message
 * @param {number} status  - HTTP status code (default 400)
 * @param {Array}  errors  - Optional array of detailed errors
 */
const sendError = (res, message = 'An error occurred', status = 400, errors = []) => {
  res.status(status).json({
    success: false,
    message,
    ...(errors.length > 0 && { errors }),
  })
}

module.exports = { sendSuccess, sendError }
