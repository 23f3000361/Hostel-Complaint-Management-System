const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_change_me';

// Temporary In-Memory Database for Users
let users = [
  // Default admin user
  { id: 1, name: 'Admin User', email: 'admin@dormfix.com', password: 'password123', role: 'admin' },
  // Default student user
  { id: 2, name: 'Student One', email: 'student@dormfix.com', password: 'password123', role: 'student', roomNumber: '101' }
];

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', (req, res) => {
  const { name, email, password, role, roomNumber } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please enter all required fields.' });
  }

  // Check if user exists
  const userExists = users.find(u => u.email === email);
  if (userExists) {
    return res.status(400).json({ message: 'User already exists.' });
  }

  const newUser = {
    id: users.length + 1,
    name,
    email,
    password, // In a real app, hash this with bcrypt!
    role: role || 'student',
    roomNumber: role === 'student' ? roomNumber : null
  };

  users.push(newUser);

  // Create token
  const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '1h' });

  res.status(201).json({
    message: 'User registered successfully',
    token,
    user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
  });
});

// @route   POST /api/auth/login
// @desc    Login user and get token
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter all fields.' });
  }

  // Find user
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials.' });
  }

  // Validate password
  if (password !== user.password) {
    return res.status(400).json({ message: 'Invalid credentials.' });
  }

  // Create token
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

  res.json({
    message: 'Logged in successfully',
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
});

module.exports = router;
