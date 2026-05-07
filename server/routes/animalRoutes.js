const express        = require('express')
const router         = express.Router()
const animalController = require('../controllers/animalController')
const authMiddleware = require('../middleware/authMiddleware')
const upload         = require('../config/multer')

/**
 * Animal Routes
 * Base: /api/animals
 */

// GET /api/animals         — Public: list all (with filters)
router.get('/', animalController.getAll)

// GET /api/animals/my      — Private: list user's own posts
router.get('/my', authMiddleware, animalController.getMine)

// GET /api/animals/:id     — Public: single animal
router.get('/:id', animalController.getById)

// POST /api/animals        — Private: create post + up to 5 images
router.post('/', authMiddleware, upload.array('images', 5), animalController.create)

// PUT /api/animals/:id     — Private: update post
router.put('/:id', authMiddleware, animalController.update)

// DELETE /api/animals/:id  — Private: delete post
router.delete('/:id', authMiddleware, animalController.remove)

// PATCH /api/animals/:id/status — Private: update status only
router.patch('/:id/status', authMiddleware, animalController.updateStatus)

module.exports = router
