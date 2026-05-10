const multer = require('multer')
const path   = require('path')
const fs     = require('fs')
require('dotenv').config()

/**
 * config/multer.js — File Upload Configuration
 *
 * WHY Multer:
 *  Multer is Express middleware for handling multipart/form-data
 *  (the encoding type used for file uploads in HTML forms).
 *
 * This config:
 *  1. Saves files to ./uploads/ on disk (not in memory)
 *  2. Gives each file a unique timestamped name
 *  3. Only allows image files (jpg, jpeg, png, webp)
 *  4. Limits file size to MAX_FILE_SIZE_MB (default 5MB)
 */

// Ensure the uploads folder exists
const uploadDir = process.env.UPLOAD_PATH || './uploads'
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// 1. Storage — where and how to store the file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    // e.g., "animal-1715000000000-123456789.jpg"
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `file-${uniqueSuffix}${ext}`)
  },
})

// 2. File filter — only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/
  const extOk  = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimeOk = allowedTypes.test(file.mimetype)

  if (extOk && mimeOk) {
    cb(null, true)   // Accept file
  } else {
    cb(new Error('Only image files (jpg, jpeg, png, webp) are allowed'), false)
  }
}

// 3. Max file size
const maxSizeMB = parseInt(process.env.MAX_FILE_SIZE_MB) || 5
const limits    = { fileSize: maxSizeMB * 1024 * 1024 }

// Export the configured multer instance
const upload = multer({ storage, fileFilter, limits })

module.exports = upload
