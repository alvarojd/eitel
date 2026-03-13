const { sql } = require('@vercel/postgres');
const bcrypt = require('bcryptjs');

async function checkDb() {
  try {
    console.log('Checking database connection...');
    const result = await sql`SELECT NOW()`;
    console.log('Connection successful:', result.rows[0]);

    console.log('Checking for users table...');
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE  table_schema = 'public'
        AND    table_name   = 'users'
      );
    `;
    console.log('Users table exists:', tableCheck.rows[0].exists);

    if (tableCheck.rows[0].exists) {
        const userCount = await sql`SELECT count(*) FROM users`;
        console.log('User count:', userCount.rows[0].count);
        
        const adminCheck = await sql`SELECT username, role FROM users WHERE username = 'admin'`;
        console.log('Admin user found:', adminCheck.rows.length > 0);
        if (adminCheck.rows.length > 0) {
            console.log('Admin role:', adminCheck.rows[0].role);
        }
    }

  } catch (error) {
    console.error('Database check failed:', error);
  }
}

checkDb();
