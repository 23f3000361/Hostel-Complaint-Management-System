const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');

// Temporary In-Memory Database for Complaints
let complaints = [
  { id: 1, studentId: 1, title: 'Leaky Faucet', category: 'Plumbing', status: 'Pending', createdAt: new Date() },
  { id: 2, studentId: 2, title: 'Broken Light', category: 'Electrical', status: 'In Progress', createdAt: new Date() }
];

// @route   GET /api/complaints
// @desc    Get all complaints (Admin/Staff) OR get my complaints (Student)
// @access  Private
router.get('/', verifyToken, (req, res) => {
  if (req.user.role === 'admin' || req.user.role === 'staff') {
    // Admins and staff see everything
    return res.json(complaints);
  } else {
    // Students only see their own
    const myComplaints = complaints.filter(c => c.studentId === req.user.id);
    return res.json(myComplaints);
  }
});

// @route   POST /api/complaints
// @desc    Create a new complaint
// @access  Private (Students only)
router.post('/', verifyToken, requireRole(['student']), (req, res) => {
  const { title, description, category, roomNumber } = req.body;
  
  if (!title || !category) {
    return res.status(400).json({ message: 'Title and category are required.' });
  }

  const newComplaint = {
    id: complaints.length + 1,
    studentId: req.user.id,
    title,
    description,
    category,
    roomNumber,
    status: 'Pending',
    createdAt: new Date()
  };

  complaints.push(newComplaint);
  res.status(201).json({ message: 'Complaint submitted successfully', complaint: newComplaint });
});

// @route   PATCH /api/complaints/:id/status
// @desc    Update complaint status
// @access  Private (Admin/Staff only)
router.patch('/:id/status', verifyToken, requireRole(['admin', 'staff']), (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // e.g., 'In Progress', 'Resolved'

  const complaint = complaints.find(c => c.id === parseInt(id));

  if (!complaint) {
    return res.status(404).json({ message: 'Complaint not found.' });
  }

  if (!['Pending', 'In Progress', 'Resolved'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status update.' });
  }

  complaint.status = status;
  complaint.updatedAt = new Date();

  res.json({ message: 'Status updated successfully', complaint });
});

module.exports = router;
