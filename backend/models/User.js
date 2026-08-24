const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return !this.firebaseUid; // Required if not using Firebase OAuth exclusively
    }
  },
  role: {
    type: String,
    enum: ['student', 'organizer', 'admin'],
    default: 'student'
  },
  firebaseUid: {
    type: String,
    default: null
  },
  college: {
    type: String,
    default: 'National Institute of Technology'
  },
  department: {
    type: String,
    default: 'Computer Science & Engineering'
  },
  year: {
    type: String,
    enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate'],
    default: '3rd Year'
  },
  interests: [{
    type: String
  }],
  skills: [{
    type: String
  }],
  phoneNumber: {
    type: String,
    default: ''
  },
  emergencyContact: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    relation: { type: String, default: '' }
  },
  avatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
  },
  // Admin professional profile (only relevant when role === 'admin')
  adminProfile: {
    title: { type: String, default: '' },              // e.g. "Platform Administrator"
    organisation: { type: String, default: '' },       // e.g. "Eventix HQ"
    bio: { type: String, default: '' },
    website: { type: String, default: '' },
    officialPhone: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    twitter: { type: String, default: '' },
    expertise: [{ type: String }],                     // e.g. ["Event Management", "AI"]
    location: { type: String, default: '' },           // e.g. "Chennai, Tamil Nadu"
    yearsOfExperience: { type: Number, default: 0 },
    totalEventsManaged: { type: Number, default: 0 },
    profileVisible: { type: Boolean, default: true }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
