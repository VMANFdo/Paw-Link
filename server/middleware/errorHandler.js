/**
 * middleware/errorHandler.js — Global Error Handler
 *
 * WHY: Without a central error handler, errors bubble up and
 * crash the server or return ugly HTML error pages.
 * This middleware catches ALL errors thrown anywhere in the app
 * and returns a consistent JSON response.
 *
 * IMPORTANT: Express identifies a global error handler by the
 * fact that it has FOUR parameters: (err, req, res, next).
 * It must be registered LAST in app.js, after all routes.
 */

const errorHandler = (err, req, res, next) => {
  // Log the error for server-side debugging
  console.error(`[ERROR] ${req.method} ${req.url} →`, err.message)

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: `File too large. Maximum size is ${process.env.MAX_FILE_SIZE_MB || 5}MB.`,
    })
  }

  // Multer file type error
  if (err.message && err.message.includes('Only image files')) {
    return res.status(400).json({
      success: false,
      message: err.message,
    })
  }

  // MySQL duplicate entry (unique constraint violated)
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      message: 'A record with this value already exists.',
    })
  }

  // Default: Internal Server Error
  const statusCode = err.statusCode || 500
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    // Only show stack trace in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

module.exports = errorHandler
