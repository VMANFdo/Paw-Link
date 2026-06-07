const express = require('express')
const router = express.Router()
const organizationController = require('../controllers/organizationController')
const authMiddleware = require('../middleware/authMiddleware')
const orgMiddleware = require('../middleware/orgMiddleware')
const upload = require('../config/multer')

/**
 * Organization Routes
 */

// Public routes
router.get('/',    organizationController.getAllApproved)
router.get('/:id(\\d+)', organizationController.getPublicProfile)

// Protected routes (Auth required)
router.use(authMiddleware)

// Setup profile (role must be organization, status can be anything initial)
router.post('/setup', upload.array('documents', 5), organizationController.createProfile)

// Status gate for operational features
router.use(orgMiddleware)

router.get('/me',       organizationController.getMyProfile)
router.put('/me',       upload.single('logo'), organizationController.updateProfile)
router.get('/me/stats', organizationController.getMyStats)
router.patch('/me/capacity', organizationController.updateCapacity)

module.exports = router
