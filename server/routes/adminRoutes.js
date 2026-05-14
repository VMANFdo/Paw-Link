const express          = require('express')
const router           = express.Router()
const adminController  = require('../controllers/adminController')
const authMiddleware   = require('../middleware/authMiddleware')
const roleMiddleware   = require('../middleware/roleMiddleware')

// ALL admin routes require login AND admin role
router.use(authMiddleware, roleMiddleware('admin'))

/** Admin Routes — Base: /api/admin */

router.get('/stats',             adminController.getStats)
router.get('/users',             adminController.getUsers)
router.post('/users',            adminController.createUser)
router.patch('/users/:id/status', adminController.updateUserStatus)
router.get('/animals',           adminController.getAnimals)
router.delete('/animals/:id',    adminController.deleteAnimal)
router.get('/reports',           adminController.getReports)
router.get('/organizations',      adminController.getOrganizations)
router.post('/organizations',     adminController.createOrganization)
router.patch('/organizations/:id', adminController.updateOrgStatus)

module.exports = router
