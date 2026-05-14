const pool = require('./server/config/db');

async function migrate() {
  try {
    console.log('Adding is_permanently_banned to users...');
    await pool.query('ALTER TABLE users ADD COLUMN is_permanently_banned BOOLEAN DEFAULT FALSE');
    console.log('Added to users.');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('Column already exists in users.');
    } else {
      console.error(err);
    }
  }

  try {
    console.log('Adding is_permanently_banned to organizations...');
    await pool.query('ALTER TABLE organizations ADD COLUMN is_permanently_banned BOOLEAN DEFAULT FALSE');
    console.log('Added to organizations.');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('Column already exists in organizations.');
    } else {
      console.error(err);
    }
  }
  
  process.exit(0);
}

migrate();
