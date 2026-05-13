const mysql = require('mysql2/promise');
require('dotenv').config({ path: './server/.env' });

async function checkDB() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'pawlink_db',
    });

    try {
        const [orgs] = await pool.query('SELECT id, name, status FROM organizations');
        console.log('Organizations:', orgs);

        const [users] = await pool.query('SELECT id, email, role FROM users WHERE role = "organization"');
        console.log('Organization Users:', users);

        const [animals] = await pool.query('SELECT id, type, organization_id FROM animals');
        console.log('Animals:', animals);

    } catch (err) {
        console.error('Error checking DB:', err);
    } finally {
        await pool.end();
    }
}

checkDB();
