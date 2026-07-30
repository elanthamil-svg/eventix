const mongoose = require('mongoose');

const accommodationSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Hostel', 'Hotel', 'Student PG', 'Guest House'],
    default: 'Student PG'
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=800'
  },
  pricePerNight: {
    type: Number,
    required: true
  },
  rating: {
    type: Number,
    default: 4.5
  },
  safetyScore: {
    type: Number,
    default: 90
  },
  distanceKm: {
    type: Number,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  amenities: [{
    type: String
  }],
  contactPhone: {
    type: String,
    default: '+91 98765 43210'
  },
  mapUrl: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Accommodation', accommodationSchema);
