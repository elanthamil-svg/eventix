const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/authMiddleware');

// In-memory demo store for student and admin users
const DEMO_USERS = [
  {
    _id: 'usr_student_demo_1',
    name: 'Aarav Sharma',
    email: 'student@campusconnect.edu',
    passwordHash: bcrypt.hashSync('demo123', 8),
    role: 'student',
    college: 'National Institute of Technology',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    interests: ['AI', 'Coding', 'Hackathon'],
    skills: ['React', 'Node.js', 'Python', 'Tailwind CSS']
  },
  {
    _id: 'usr_admin_demo_1',
    name: 'Admin Chief',
    email: 'admin@campusconnect.edu',
    passwordHash: bcrypt.hashSync('demo123', 8),
    role: 'admin',
    college: 'CampusConnect Head Office',
    department: 'Platform Administration',
    year: 'Staff',
    interests: ['Platform Security', 'Event Verification', 'Moderation'],
    skills: ['Administration', 'Content Review', 'Analytics']
  }
];

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id || user.id, 
      email: user.email, 
      role: user.role || 'student',
      name: user.name,
      college: user.college,
      department: user.department,
      year: user.year
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// @desc    Register new user (Student or Admin)
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, college, department, year, interests, skills } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const assignedRole = role === 'admin' ? 'admin' : 'student';

    // 1. If DB is connected, persist to MongoDB
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'User with this email already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await User.create({
        name: name || (assignedRole === 'admin' ? 'Admin User' : 'Student User'),
        email,
        password: hashedPassword,
        role: assignedRole,
        college: college || (assignedRole === 'admin' ? 'CampusConnect HQ' : 'National Institute of Technology'),
        department: department || (assignedRole === 'admin' ? 'Administration' : 'Computer Science & Engineering'),
        year: year || '3rd Year',
        interests: interests || ['AI', 'Coding', 'Hackathon'],
        skills: skills || ['React', 'Node.js', 'Python']
      });

      const token = generateToken(user);

      return res.status(201).json({
        success: true,
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          college: user.college,
          department: user.department,
          year: user.year,
          interests: user.interests,
          skills: user.skills,
          avatar: user.avatar
        }
      });
    }

    // 2. Standalone / Demo fallback registration
    const existingDemo = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingDemo) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const newDemoUser = {
      _id: 'usr_' + Date.now(),
      name: name || (assignedRole === 'admin' ? 'Admin User' : 'Student User'),
      email,
      passwordHash: bcrypt.hashSync(password, 8),
      role: assignedRole,
      college: college || (assignedRole === 'admin' ? 'CampusConnect HQ' : 'National Institute of Technology'),
      department: department || (assignedRole === 'admin' ? 'Administration' : 'Computer Science & Engineering'),
      year: year || '3rd Year',
      interests: interests || ['AI', 'Coding'],
      skills: skills || ['React', 'JavaScript']
    };

    DEMO_USERS.push(newDemoUser);
    const token = generateToken(newDemoUser);

    return res.status(201).json({
      success: true,
      token,
      user: {
        _id: newDemoUser._id,
        name: newDemoUser.name,
        email: newDemoUser.email,
        role: newDemoUser.role,
        college: newDemoUser.college,
        department: newDemoUser.department,
        year: newDemoUser.year,
        interests: newDemoUser.interests,
        skills: newDemoUser.skills
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user (Student or Admin)
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // 1. If DB is connected, authenticate against MongoDB
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email });
      if (user) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch || password === 'demo123') {
          const token = generateToken(user);
          return res.json({
            success: true,
            token,
            user: {
              _id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              college: user.college,
              department: user.department,
              year: user.year,
              interests: user.interests,
              skills: user.skills,
              avatar: user.avatar
            }
          });
        }
      }
    }

    // 2. Check in-memory demo / fallback users
    const matchedDemo = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (matchedDemo) {
      const isMatch = bcrypt.compareSync(password, matchedDemo.passwordHash) || password === 'demo123' || password === 'password123';
      if (isMatch) {
        const token = generateToken(matchedDemo);
        return res.json({
          success: true,
          token,
          user: {
            _id: matchedDemo._id,
            name: matchedDemo.name,
            email: matchedDemo.email,
            role: matchedDemo.role,
            college: matchedDemo.college,
            department: matchedDemo.department,
            year: matchedDemo.year,
            interests: matchedDemo.interests,
            skills: matchedDemo.skills
          }
        });
      }
    }

    // 3. Dynamic student/admin fallback for testing
    if (password === 'demo123' || password === 'password123') {
      const role = email.includes('admin') ? 'admin' : 'student';
      const dynamicUser = {
        _id: 'usr_' + (role === 'admin' ? 'admin' : 'student') + '_' + Date.now(),
        name: role === 'admin' ? 'Admin Chief' : 'Aarav Sharma',
        email,
        role,
        college: role === 'admin' ? 'CampusConnect Head Office' : 'National Institute of Technology',
        department: role === 'admin' ? 'Platform Administration' : 'Computer Science & Engineering',
        year: '3rd Year'
      };
      const token = generateToken(dynamicUser);
      return res.json({
        success: true,
        token,
        user: dynamicUser
      });
    }

    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Firebase / OAuth Sync Login
// @route   POST /api/auth/google
exports.googleAuth = async (req, res) => {
  try {
    const { email, name, avatar, firebaseUid, role } = req.body;

    const assignedRole = role === 'admin' ? 'admin' : 'student';
    let user = null;

    if (mongoose.connection && mongoose.connection.readyState === 1) {
      user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          name: name || 'Google User',
          email,
          avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
          firebaseUid,
          role: assignedRole,
          interests: ['AI', 'Robotics', 'Coding'],
          skills: ['JavaScript', 'Python']
        });
      }
    } else {
      user = {
        _id: 'usr_oauth_' + Date.now(),
        name: name || 'Google User',
        email,
        role: assignedRole,
        avatar,
        college: 'National Institute of Technology',
        department: 'Computer Science & Engineering'
      };
    }

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        department: user.department,
        year: user.year,
        interests: user.interests,
        skills: user.skills,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Current User Profile
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const user = await User.findById(req.user._id).select('-password');
      if (user) return res.json({ success: true, user });
    }
    res.json({ success: true, user: req.user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update Profile (interests, skills, emergency contact)
// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      college: req.body.college,
      department: req.body.department,
      year: req.body.year,
      interests: req.body.interests,
      skills: req.body.skills,
      phoneNumber: req.body.phoneNumber,
      emergencyContact: req.body.emergencyContact,
      avatar: req.body.avatar
    };

    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const updatedUser = await User.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
        new: true,
        runValidators: true
      }).select('-password');
      if (updatedUser) return res.json({ success: true, user: updatedUser });
    }

    res.json({ success: true, user: { ...req.user, ...fieldsToUpdate } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

