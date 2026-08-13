const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Event description is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Hackathon', 'Workshop', 'Symposium', 'Coding', 'AI', 'Robotics', 'Design', 'Cultural', 'Sports', 'Other'],
    default: 'Hackathon'
  },
  tags: [{
    type: String
  }],
  poster: {
    type: String,
    required: [true, 'Poster image URL is required'],
    default: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200'
  },
  collegeName: {
    type: String,
    required: [true, 'College name is required']
  },
  venue: {
    type: String,
    required: [true, 'Venue location is required']
  },
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    lat: { type: Number, default: 12.9716 },
    lng: { type: Number, default: 77.5946 },
    googleMapUrl: { type: String, default: '' }
  },
  eventDate: {
    type: Date,
    required: [true, 'Event start date is required']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    default: '09:00 AM'
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    default: '06:00 PM'
  },
  registrationDeadline: {
    type: Date,
    required: [true, 'Registration deadline is required']
  },
  registrationLink: {
    type: String,
    default: ''
  },
  contactPerson: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true }
  },
  entryFee: {
    type: Number,
    default: 0 // 0 means Free
  },
  prizePool: {
    type: String,
    default: '₹50,000'
  },
  brochure: {
    type: String,
    default: ''
  },
  gallery: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved' // Default to approved for quick demo friendliness
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organizerName: {
    type: String,
    default: 'CampusConnect Team'
  },
  featured: {
    type: Boolean,
    default: false
  },
  viewsCount: {
    type: Number,
    default: 0
  },
  nirfRank: {
    type: Number,
    default: null  // NIRF 2025 Engineering rank (1-100). null = not ranked
  },
  nirfScore: {
    type: Number,
    default: null  // NIRF score out of 100
  }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
