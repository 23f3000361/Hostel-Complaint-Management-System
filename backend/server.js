const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies

// Import Routes
const complaintRoutes = require('./routes/complaints');
// const authRoutes = require('./routes/auth'); // To be added later

// Use Routes
app.use('/api/complaints', complaintRoutes);
// app.use('/api/auth', authRoutes);

// Basic health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Backend is running smoothly!' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
