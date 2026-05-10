const express            = require('express')
const router             = express.Router()
const adoptionController = require('../controllers/adoptionController')
const authMiddleware     = require('../middleware/authMiddleware')

/** Adoption Routes — Base: /api/adoptions */

// Submit a new adoption request
router.post('/',                    authMiddleware, adoptionController.create)

// Get requests sent by the logged-in user
router.get('/my',                   authMiddleware, adoptionController.getMine)

// Get requests received for animals I posted
router.get('/received',             authMiddleware, adoptionController.getReceived)

// Check if the logged-in user already applied for a specific animal
router.get('/check/:animalId',      authMiddleware, adoptionController.checkMine)

// Approve or reject a request (poster only, enforced in controller)
router.patch('/:id',                authMiddleware, adoptionController.updateStatus)

// Cancel my own pending request
router.delete('/:id',               authMiddleware, adoptionController.cancel)

module.exports = router
