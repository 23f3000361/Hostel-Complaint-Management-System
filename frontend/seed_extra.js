const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const pool = new Pool({
  connectionString: 'postgresql://dormfix:dormfix@localhost:5432/dormfix'
});

async function seed() {
  const passwordHash = await bcrypt.hash('password123', 12);

  const users = [
    {
      user_id: uuidv4(),
      name: 'DSW Officer',
      email: 'dsw@tezu.ac.in',
      password_hash: passwordHash,
      role: 'admin',
      hostel_id: null
    },
    {
      user_id: uuidv4(),
      name: 'Dept Head Engineering',
      email: 'dept_eng@tezu.ac.in',
      password_hash: passwordHash,
      role: 'maintenance',
      hostel_id: null
    },
    {
      user_id: uuidv4(),
      name: 'Dept Head Plumbing',
      email: 'dept_plumb@tezu.ac.in',
      password_hash: passwordHash,
      role: 'maintenance',
      hostel_id: null
    }
  ];

  for (const u of users) {
    await pool.query(
      `INSERT INTO users (user_id, name, email, password_hash, role, hostel_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING`,
      [u.user_id, u.name, u.email, u.password_hash, u.role, u.hostel_id]
    );
  }

  console.log('DSW + Department Head accounts seeded');
  pool.end();
}

seed().catch(console.error);
