const jwt = require('jsonwebtoken')

/**
 * middleware/authMiddleware.js — JWT Verification
 *
 * WHY: Protected routes need to verify that the request
 * comes from a valid, logged-in user. This middleware:
 *  1. Reads the Authorization header ("Bearer <token>")
 *  2. Verifies the JWT signature using our secret key
 *  3. Attaches the decoded user payload to req.user
 *  4. If invalid/missing, returns 401 Unauthorized
 *
 * Usage in routes:
 *   router.post('/animals', authMiddleware, animalController.create)
 */

const authMiddleware = (req, res, next) => {
  try {
    // 1. Extract the token from the header
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      })
    }

    const token = authHeader.split(' ')[1]  // "Bearer <token>" → "<token>"

    // 2. Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // 3. Attach user info to the request object
    // (decoded contains: { id, email, role, iat, exp })
    req.user = decoded

    next()  // Pass control to the next middleware/controller

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.',
      })
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid token.',
    })
  }
}

module.exports = authMiddleware
