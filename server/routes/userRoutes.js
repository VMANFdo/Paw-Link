const express         = require('express')
const router          = express.Router()
const userController  = require('../controllers/userController')
const authMiddleware  = require('../middleware/authMiddleware')

/** User Routes — Base: /api/users */

router.get('/profile',      authMiddleware, userController.getMyProfile)
router.put('/profile',      authMiddleware, userController.updateProfile)
router.get('/stats',        authMiddleware, userController.getStats)
router.get('/notifications/count', authMiddleware, userController.getUnreadCount)
router.get('/:id',          userController.getPublicProfile)

module.exports = router
