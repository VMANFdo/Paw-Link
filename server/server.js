require('dotenv').config()
const app = require('./app')

/**
 * server.js — HTTP Server Entry Point
 *
 * WHY separate from app.js:
 *  This file's only job is to start the HTTP server.
 *  app.js is the Express app definition — it can be imported
 *  in tests without actually starting a server.
 */

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║   🐾  PawLink API Server Running     ║
  ║   Port    : http://localhost:${PORT}   ║
  ║   Env     : ${process.env.NODE_ENV || 'development'}              ║
  ║   Health  : /api/health             ║
  ╚══════════════════════════════════════╝
  `)
})
// Server bump for reload
