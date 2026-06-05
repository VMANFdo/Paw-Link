const express          = require('express')
const router           = express.Router()
const reportController = require('../controllers/reportController')
const authMiddleware   = require('../middleware/authMiddleware')

/** Report Routes — Base: /api/reports */

// POST /api/reports — Authenticated users only
router.post('/', authMiddleware, reportController.createReport)

module.exports = router
