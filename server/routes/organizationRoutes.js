const express = require('express')
const router = express.Router()
const organizationController = require('../controllers/organizationController')
const authMiddleware = require('../middleware/authMiddleware')
const orgMiddleware = require('../middleware/orgMiddleware')
const multer = require('multer')
const path = require('path')

// Configure multer for doc/logo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})
const upload = multer({ storage })

/**
 * Organization Routes
 */

// Public routes
router.get('/',    organizationController.getAllApproved)
router.get('/:id', organizationController.getPublicProfile)

// Protected routes (Auth required)
router.use(authMiddleware)

// Setup profile (role must be organization, status can be anything initial)
router.post('/setup', upload.array('documents', 5), organizationController.createProfile)

// Status gate for operational features
router.use(orgMiddleware)

router.get('/me',       organizationController.getMyProfile)
router.put('/me',       organizationController.updateProfile)
router.get('/me/stats', organizationController.getMyStats)
router.patch('/me/capacity', organizationController.updateCapacity)

module.exports = router
