const pool = require('../server/config/db')

async function checkData() {
  try {
    const [rows] = await pool.query('SELECT id, breed, city FROM animals')
    console.log('Animal Data:', rows)
    process.exit(0)
  } catch (err) {
    console.error('Error:', err)
    process.exit(1)
  }
}

checkData()
