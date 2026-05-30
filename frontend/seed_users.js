const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const pool = new Pool({
  connectionString: 'postgresql://dormfix:dormfix@localhost:5432/dormfix'
});

async function seed() {
  const passwordHash = await bcrypt.hash('password123', 12);
  const vcPasswordHash = await bcrypt.hash('vc@12345', 12);
  
  const users = [
    {
      user_id: uuidv4(),
      name: 'Vice Chancellor',
      email: 'vicechancellor@tezu.ac.in',
      password_hash: vcPasswordHash,
      role: 'admin',
      hostel_id: null
    },
    {
      user_id: uuidv4(),
      name: 'Warden Sapphire',
      email: 'warden_01@tezu.ac.in',
      password_hash: passwordHash,
      role: 'warden',
      hostel_id: 'H001'
    },
    {
      user_id: uuidv4(),
      name: 'Student One',
      email: 'student_01@tezu.ac.in',
      password_hash: passwordHash,
      role: 'student',
      hostel_id: 'H001'
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

  console.log('Users seeded');
  pool.end();
}

seed().catch(console.error);
