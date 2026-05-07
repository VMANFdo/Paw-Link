const express          = require('express')
const router           = express.Router()
const rescueController = require('../controllers/rescueController')
const authMiddleware   = require('../middleware/authMiddleware')
const roleMiddleware   = require('../middleware/roleMiddleware')

/** Rescue Routes — Base: /api/rescues */

router.post('/',               authMiddleware, rescueController.create)
router.get('/',                rescueController.getAll)
router.get('/my',              authMiddleware, rescueController.getMine)
router.patch('/:id/status',    authMiddleware, roleMiddleware(['organization', 'admin']), rescueController.updateStatus)

module.exports = router
