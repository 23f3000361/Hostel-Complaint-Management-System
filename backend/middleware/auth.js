const jwt = require('jsonwebtoken');

// Secret key for JWT (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_change_me';

// Mock function to verify token and extract user info
// In a real app, you would verify the JWT signature here.
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(403).json({ message: 'No token provided. Access denied.' });
  }

  const token = authHeader.split(' ')[1]; // Format: "Bearer <token>"
  
  try {
    // For demonstration, we'll assume a decoded token looks like: { id: 1, role: 'student' }
    // const decoded = jwt.verify(token, JWT_SECRET);
    
    // TEMPORARY MOCK DECODED USER (Remove when actual auth is implemented)
    const decoded = { id: 1, role: req.headers['x-mock-role'] || 'student' }; 

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized. Invalid token.' });
  }
};

// Middleware for Role-Based Access Control
const requireRole = (rolesArray) => {
  return (req, res, next) => {
    if (!req.user || !rolesArray.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Requires one of the following roles: ${rolesArray.join(', ')}` 
      });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  requireRole
};
