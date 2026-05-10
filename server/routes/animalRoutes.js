const express        = require('express')
const router         = express.Router()
const animalController = require('../controllers/animalController')
const authMiddleware = require('../middleware/authMiddleware')
const upload         = require('../config/multer')

/**
 * Animal Routes
 * Base: /api/animals
 */

// 1. Static/Fixed Paths (MUST come before param paths like :id)
router.get('/stats', animalController.getPublicStats)
router.get('/cities', animalController.getCities)
router.get('/my', authMiddleware, animalController.getMine)
router.get('/', animalController.getAll)

// 2. Param Paths
router.get('/:id', animalController.getById)

// 3. Actions / Mutations
router.post('/', authMiddleware, upload.array('images', 5), animalController.create)
router.put('/:id', authMiddleware, animalController.update)
router.delete('/:id', authMiddleware, animalController.remove)
router.patch('/:id/status', authMiddleware, animalController.updateStatus)

module.exports = router
