const express           = require('express')
const router            = express.Router()
const adoptionController = require('../controllers/adoptionController')
const authMiddleware    = require('../middleware/authMiddleware')

/** Adoption Routes — Base: /api/adoptions */

router.post('/',          authMiddleware, adoptionController.create)
router.get('/my',         authMiddleware, adoptionController.getMine)
router.get('/received',   authMiddleware, adoptionController.getReceived)
router.patch('/:id',      authMiddleware, adoptionController.updateStatus)

module.exports = router
