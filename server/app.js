const express = require('express')
const cors    = require('cors')
const path    = require('path')
require('dotenv').config()

// Import route files
const authRoutes     = require('./routes/authRoutes')
const animalRoutes   = require('./routes/animalRoutes')
const adoptionRoutes = require('./routes/adoptionRoutes')
const rescueRoutes   = require('./routes/rescueRoutes')
const messageRoutes  = require('./routes/messageRoutes')
const userRoutes     = require('./routes/userRoutes')
const adminRoutes    = require('./routes/adminRoutes')
const shelterRoutes  = require('./routes/shelterRoutes')
const organizationRoutes = require('./routes/organizationRoutes')
const handoverRoutes = require('./routes/handoverRoutes')

// Import global error handler (must be last)
const errorHandler = require('./middleware/errorHandler')

/**
 * app.js — Express Application Setup
 *
 * WHY separate from server.js:
 *  app.js defines what the app does (middleware, routes).
 *  server.js starts the HTTP server.
 *  This separation makes testing easier — you can import
 *  the app without starting the server.
 */

const app = express()

// ─────────────────────────────────────────
// 1. CORS — Allow frontend to call this API
// ─────────────────────────────────────────
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL        // Restrict in production
    : 'http://localhost:3000',         // Allow Vite dev server
  credentials: true,
}))

// ─────────────────────────────────────────
// 2. Body Parsers
// ─────────────────────────────────────────
app.use(express.json())                         // Parse JSON bodies
app.use(express.urlencoded({ extended: true })) // Parse form data

// ─────────────────────────────────────────
// 3. Static Files — Serve uploaded images
// ─────────────────────────────────────────
// A file uploaded to ./uploads/animal-xxx.jpg will be
// accessible at: http://localhost:5000/uploads/animal-xxx.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// ─────────────────────────────────────────
// 4. API Routes
// ─────────────────────────────────────────
app.use('/api/auth',      authRoutes)
app.use('/api/animals',   animalRoutes)
app.use('/api/adoptions', adoptionRoutes)
app.use('/api/rescues',   rescueRoutes)
app.use('/api/messages',  messageRoutes)
app.use('/api/users',     userRoutes)
app.use('/api/admin',     adminRoutes)
app.use('/api/shelters',  shelterRoutes)
app.use('/api/organizations', organizationRoutes)
app.use('/api/handovers',     handoverRoutes)

// ─────────────────────────────────────────
// 5. Health Check Route
// ─────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'PawLink API is running 🐾', timestamp: new Date() })
})

// ─────────────────────────────────────────
// 6. 404 Handler — Unknown Routes
// ─────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found` })
})

// ─────────────────────────────────────────
// 7. Global Error Handler (MUST be last)
// ─────────────────────────────────────────
app.use(errorHandler)

module.exports = app
