const express           = require('express')
const router            = express.Router()
const shelterController = require('../controllers/shelterController')
const authMiddleware    = require('../middleware/authMiddleware')
const roleMiddleware    = require('../middleware/roleMiddleware')

/** 
 * Shelter Routes — Base: /api/shelters 
 * Only accessible by 'shelter' and 'admin' roles.
 */

router.use(authMiddleware)
router.use(roleMiddleware(['organization', 'admin']))

router.get('/me',      shelterController.getMyShelter)
router.put('/me',      shelterController.updateShelter)
router.get('/animals', shelterController.getAssignedAnimals)

module.exports = router
