const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const pool = new Pool({
  connectionString: 'postgresql://dormfix:dormfix@localhost:5432/dormfix'
});

const wardens = [
  // 01. Nilachal Men's Hostel (H001)
  { name: "Dr. Kusum Kumar Bania", tezuId: "kusum", hostelId: "H001" },
  { name: "Mr. Binanda Khungur Narzary", tezuId: "binanda", hostelId: "H001" },
  // 02. Kanchanjungha Men's Hostel (H002)
  { name: "Dr. Rupak Mukhopadhyay", tezuId: "mrupak", hostelId: "H002" },
  { name: "Dr. Md. Rahat Mehboob", tezuId: "rahat", hostelId: "H002" },
  // 03. Charaideo Men's Hostel (H003)
  { name: "Dr. Hitesh Sharma", tezuId: "hitesh", hostelId: "H003" },
  { name: "Dr. Rajinder Singh", tezuId: "badotra", hostelId: "H003" },
  // 04. Patkai Men's Hostel (H004)
  { name: "Dr. Nabin Sarmah", tezuId: "nabin", hostelId: "H004" },
  { name: "Dr. Sushen Kirtania", tezuId: "sushen", hostelId: "H004" },
  // 05. Saraighat C. V. Raman Men's Hostel (H005)
  { name: "Dr. Anushabda", tezuId: "anush", hostelId: "H005" },
  { name: "Dr. Tapas Medhi", tezuId: "tmedhi", hostelId: "H005" },
  // 06. Bardoichila Women's Hostel (H006)
  { name: "Ms. Prerana Banik", tezuId: "banikpb", hostelId: "H006" },
  { name: "Ms. Namami Sharma", tezuId: "namamis", hostelId: "H006" },
  // 07. Subansiri Women's Hostel (H007)
  { name: "Ms. Priyanka Kakoty", tezuId: "priyankak", hostelId: "H007" },
  { name: "Ms. Karabi Bharadwaj", tezuId: "karabi", hostelId: "H007" },
  // 08. Pobitora Madam Curie Women's Hostel (H008)
  { name: "Dr. Sanghamitra Nath", tezuId: "s.nath", hostelId: "H008" },
  { name: "Ms. Angel H Syiem", tezuId: "angelsy", hostelId: "H008" },
  // 09. Pragjyotika Women's Hostel (H009)
  { name: "Dr. Junali Deka", tezuId: "junalid", hostelId: "H009" },
  { name: "Ms. Pamidi Hagjer", tezuId: "pamidi", hostelId: "H009" },
  // 10. Kopili Women's Hostel (H010)
  { name: "Ms. Barnali Chowdhury", tezuId: "barnali", hostelId: "H010" },
  { name: "Dr. Shobhanjana Kalita", tezuId: "kalitas", hostelId: "H010" },
  // 11. Dhansiri Women's Hostel (H011)
  { name: "Dr. Nayanmoni Gogoi", tezuId: "nayanmoni", hostelId: "H011" },
  { name: "Dr. Santa Kalita", tezuId: "santa", hostelId: "H011" },
  // 12. New Women's Hostel (H012)
  { name: "Ms. Ananya Bonjyotsna", tezuId: "ananyab", hostelId: "H012" },
  { name: "Dr. Farah Hussain", tezuId: "farah", hostelId: "H012" },
  // 13. Transit Mens' Hostel-1 (H014)
  { name: "Dr. Rajib Haloi", tezuId: "rhaloi", hostelId: "H014" },
  { name: "Dr. Nishant R. S. Hulle", tezuId: "nishant", hostelId: "H014" },
  // 14. Transit Women's Hostel(2) (H013)
  { name: "Ms. Madhumita Acharjee", tezuId: "madhuap", hostelId: "H013" },
  { name: "Dr. Moon Moon Devi", tezuId: "devimm", hostelId: "H013" },
  // 15. Transit Mens' Hostel -2 (H015)
  { name: "Dr. Dibyakanta Seth", tezuId: "dibya05", hostelId: "H015" },
  { name: "Mr. Polash Protim Dutta", tezuId: "polashd", hostelId: "H015" }
];

const dswOfficials = [
  { name: "Dr. Manabendra Mandal", tezuId: "adsw14", role: "admin" },
  { name: "Dr. Juri Gogoi Konwar", tezuId: "jgkon", role: "admin" },
  { name: "Prof. D. Deka", tezuId: "dsw", role: "admin" }
];

async function seed() {
  const passwordHash = await bcrypt.hash('password123', 12);

  // 1. Ensure all 15 hostels exist in DB with correct names
  const hostels = [
    { id: 'H001', name: "Nilachal Men's Hostel" },
    { id: 'H002', name: "Kanchanjungha Men's Hostel" },
    { id: 'H003', name: "Charaideo Men's Hostel" },
    { id: 'H004', name: "Patkai Men's Hostel" },
    { id: 'H005', name: "Saraighat C. V. Raman Men's Hostel" },
    { id: 'H006', name: "Bardoichila Women's Hostel" },
    { id: 'H007', name: "Subansiri Women's Hostel" },
    { id: 'H008', name: "Pobitora Madam Curie Women's Hostel" },
    { id: 'H009', name: "Pragjyotika Women's Hostel" },
    { id: 'H010', name: "Kopili Women's Hostel" },
    { id: 'H011', name: "Dhansiri Women's Hostel" },
    { id: 'H012', name: "New Women's Hostel" },
    { id: 'H013', name: "Transit Women's Hostel(2)" },
    { id: 'H014', name: "Transit Mens' Hostel-1" },
    { id: 'H015', name: "Transit Mens' Hostel -2" }
  ];

  for (const h of hostels) {
    await pool.query(`
      INSERT INTO hostels (hostel_id, hostel_name, location)
      VALUES ($1, $2, 'Tezpur University Campus')
      ON CONFLICT (hostel_id) DO UPDATE SET hostel_name = EXCLUDED.hostel_name
    `, [h.id, h.name]);
  }
  console.log('Ensured all 15 hostels exist with correct names.');

  // 2. Insert Wardens
  for (const w of wardens) {
    const email = `${w.tezuId}@tezu.ac.in`;
    await pool.query(`
      INSERT INTO users (user_id, name, email, password_hash, role, hostel_id)
      VALUES ($1, $2, $3, $4, 'warden', $5)
      ON CONFLICT (email) DO UPDATE 
      SET name = EXCLUDED.name, hostel_id = EXCLUDED.hostel_id
    `, [uuidv4(), w.name, email, passwordHash, w.hostelId]);
  }
  console.log(`Seeded/Updated ${wardens.length} Wardens.`);

  // 3. Insert DSW Officials
  for (const d of dswOfficials) {
    const email = `${d.tezuId}@tezu.ac.in`;
    await pool.query(`
      INSERT INTO users (user_id, name, email, password_hash, role, hostel_id)
      VALUES ($1, $2, $3, $4, $5, null)
      ON CONFLICT (email) DO UPDATE
      SET name = EXCLUDED.name
    `, [uuidv4(), d.name, email, passwordHash, d.role]);
  }
  console.log(`Seeded/Updated ${dswOfficials.length} DSW Officials.`);

  pool.end();
}

seed().catch(console.error);
