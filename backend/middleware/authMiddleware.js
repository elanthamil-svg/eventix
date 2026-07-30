const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'campusconnect_super_secret_jwt_key_2026';

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        // Fallback for mock user tokens during demo mode
        req.user = {
          _id: decoded.id || 'demo_user_123',
          name: decoded.name || 'Demo Student',
          email: decoded.email || 'student@campusconnect.edu',
          role: decoded.role || 'student',
          college: decoded.college || 'National Institute of Technology',
          department: decoded.department || 'Computer Science & Engineering',
          interests: ['AI', 'Coding', 'Hackathon'],
          skills: ['React', 'Node.js', 'Python']
        };
      }
      return next();
    } catch (error) {
      console.error('Auth verification failed:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect, JWT_SECRET };
