const express           = require('express')
const router            = express.Router()
const messageController = require('../controllers/messageController')
const authMiddleware    = require('../middleware/authMiddleware')

/** Message Routes — Base: /api/messages */

router.post('/',          authMiddleware, messageController.send)
router.get('/inbox',      authMiddleware, messageController.getInbox)
router.get('/sent',       authMiddleware, messageController.getSent)
router.get('/:userId',    authMiddleware, messageController.getThread)

module.exports = router
