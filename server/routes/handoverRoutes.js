const express = require('express')
const router = express.Router()
const handoverController = require('../controllers/handoverController')
const authMiddleware = require('../middleware/authMiddleware')
const orgMiddleware = require('../middleware/orgMiddleware')

/**
 * Handover Routes
 */

router.use(authMiddleware)

// User routes (Submit handovers)
router.post('/',   handoverController.createRequest)
router.get('/my', handoverController.getMyRequests)

// Organization routes (Review handovers)
router.use(orgMiddleware)
router.get('/received',    handoverController.getReceived)
router.patch('/:id/status', handoverController.updateStatus)

module.exports = router
