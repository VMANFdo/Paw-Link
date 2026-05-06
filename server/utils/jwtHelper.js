const jwt = require('jsonwebtoken')

/**
 * utils/jwtHelper.js — JWT Token Utilities
 *
 * WHY: Centralising token logic means if we ever change
 * the signing algorithm or expiry, we change it in ONE place.
 */

/**
 * Generate a signed JWT token
 * @param {object} payload - Data to encode (e.g., { id, email, role })
 * @returns {string} Signed JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  })
}

/**
 * Verify a JWT token (used in tests / utility calls)
 * @param {string} token
 * @returns {object} Decoded payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET)
}

module.exports = { generateToken, verifyToken }
