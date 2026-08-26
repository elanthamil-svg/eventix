const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'campusconnect_super_secret_jwt_key_2026';

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      
      let user = null;
      if (mongoose.connection && mongoose.connection.readyState === 1) {
        try {
          user = await User.findById(decoded.id || decoded._id).select('-password');
        } catch (dbErr) {
          user = null;
        }
      }

      req.user = user || {
        _id: decoded.id || decoded._id || 'usr_' + (decoded.role || 'student'),
        name: decoded.name || (decoded.role === 'admin' ? 'Admin Chief' : 'Aarav Sharma'),
        email: decoded.email || (decoded.role === 'admin' ? 'admin@campusconnect.edu' : 'student@campusconnect.edu'),
        role: decoded.role || 'student',
        college: decoded.college || 'National Institute of Technology',
        department: decoded.department || 'Computer Science & Engineering',
        year: decoded.year || '3rd Year',
        interests: decoded.interests || ['AI', 'Coding', 'Hackathon'],
        skills: decoded.skills || ['React', 'Node.js', 'Python']
      };

      return next();
    } catch (error) {
      console.error('Auth verification failed:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, invalid or expired token' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect, JWT_SECRET };

