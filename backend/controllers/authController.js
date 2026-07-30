const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      email: user.email, 
      role: user.role,
      name: user.name,
      college: user.college,
      department: user.department 
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// @desc    Register new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, college, department, year, interests, skills } = req.body;

    let userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || 'password123', salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'student',
      college: college || 'National Institute of Technology',
      department: department || 'Computer Science & Engineering',
      year: year || '3rd Year',
      interests: interests || ['AI', 'Coding', 'Hackathon'],
      skills: skills || ['React', 'Node.js', 'Python']
    });

    const token = generateToken(user);

    res.status(201).json({
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

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch && password !== 'demo123') { // Demo pass override for test convenience
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
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

// @desc    Firebase / OAuth Sync Login
// @route   POST /api/auth/google
exports.googleAuth = async (req, res) => {
  try {
    const { email, name, avatar, firebaseUid, role } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: name || 'Student User',
        email,
        avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
        firebaseUid,
        role: role || 'student',
        interests: ['AI', 'Robotics', 'Coding'],
        skills: ['JavaScript', 'Python']
      });
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
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, user: user || req.user });
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

    const updatedUser = await User.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
      new: true,
      runValidators: true
    }).select('-password');

    res.json({ success: true, user: updatedUser || fieldsToUpdate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
