const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../models/User');
const Event = require('../models/Event');
const Accommodation = require('../models/Accommodation');

const sampleEvents = [
  {
    title: 'HackNova 2026: 36-Hour AI & Web3 Hackathon',
    description: 'Join over 500+ student developers in India\'s premier collegiate hackathon. Build groundbreaking solutions using AI, Generative Models, Web3, and Smart Cities.',
    category: 'Hackathon',
    tags: ['AI', 'Coding', 'Hackathon', 'Web3', 'Python'],
    poster: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1200',
    collegeName: 'IIT Madras',
    venue: 'CLT Auditorium & Central Computing Center',
    location: {
      address: 'IIT P.O., Chennai, Tamil Nadu 600036',
      city: 'Chennai',
      lat: 12.9915,
      lng: 80.2337,
      googleMapUrl: 'https://maps.google.com/?q=12.9915,80.2337'
    },
    eventDate: new Date('2026-08-15'),
    startTime: '09:00 AM',
    endTime: '09:00 PM',
    registrationDeadline: new Date('2026-08-10'),
    registrationLink: 'https://campusconnect.edu/register/hacknova',
    contactPerson: {
      name: 'Rohan Sharma (Lead Organizer)',
      phone: '+91 98765 43210',
      email: 'organizer@iitm.ac.in'
    },
    entryFee: 0,
    prizePool: '₹2,50,000',
    gallery: [
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=800'
    ],
    status: 'approved',
    featured: true,
    viewsCount: 1420
  },
  {
    title: 'RoboQuest 2.0: Autonomous Drone & Bot Championship',
    description: 'Compete in obstacle navigation, autonomous line follower, and arena combat robotics challenges. Test your hardware and mechatronic design skills.',
    category: 'Robotics',
    tags: ['Robotics', 'Hardware', 'IoT', 'Autonomous'],
    poster: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1200',
    collegeName: 'NIT Trichy',
    venue: 'Robotics Center, Mechanical Complex',
    location: {
      address: 'Tanjore Main Road, Tiruchirappalli, Tamil Nadu 620015',
      city: 'Tiruchirappalli',
      lat: 10.7601,
      lng: 78.8147,
      googleMapUrl: 'https://maps.google.com/?q=10.7601,78.8147'
    },
    eventDate: new Date('2026-08-22'),
    startTime: '10:00 AM',
    endTime: '06:00 PM',
    registrationDeadline: new Date('2026-08-18'),
    registrationLink: 'https://nitt.edu/roboquest',
    contactPerson: {
      name: 'Anita Verma (Tech Head)',
      phone: '+91 98123 45678',
      email: 'anita@nitt.edu'
    },
    entryFee: 250,
    prizePool: '₹1,00,000',
    gallery: [
      'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&q=80&w=800'
    ],
    status: 'approved',
    featured: true,
    viewsCount: 980
  },
  {
    title: 'DesignX National UI/UX & Product Design Summit',
    description: 'Immerse in interactive Figma design sprints, design systems workshops, and feedback sessions with top Product Designers from leading tech companies.',
    category: 'Design',
    tags: ['Design', 'UI/UX', 'Figma', 'Product Design'],
    poster: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&q=80&w=1200',
    collegeName: 'NIFT Bangalore',
    venue: 'Design Innovation Lab',
    location: {
      address: '27th Main Rd, Sector 1, HSR Layout, Bengaluru 560102',
      city: 'Bengaluru',
      lat: 12.9116,
      lng: 77.6534,
      googleMapUrl: 'https://maps.google.com/?q=12.9116,77.6534'
    },
    eventDate: new Date('2026-09-05'),
    startTime: '09:30 AM',
    endTime: '05:30 PM',
    registrationDeadline: new Date('2026-08-30'),
    registrationLink: 'https://designx.nift.ac.in',
    contactPerson: {
      name: 'Karthik Raja',
      phone: '+91 97788 99001',
      email: 'karthik@nift.ac.in'
    },
    entryFee: 150,
    prizePool: '₹75,000',
    gallery: [
      'https://images.unsplash.com/photo-1542744094-3a3172720249?auto=format&fit=crop&q=80&w=800'
    ],
    status: 'approved',
    featured: false,
    viewsCount: 760
  },
  {
    title: 'CodeSprint 2026: Speed Algorithmic Contest',
    description: 'Fast-paced ICPC style competitive programming clash. Solve 8 complex algorithmic problems under pressure and rank on the national leaderboard.',
    category: 'Coding',
    tags: ['Coding', 'Algorithms', 'C++', 'Data Structures'],
    poster: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1200',
    collegeName: 'BITS Pilani',
    venue: 'IPC Lab & Online Arena',
    location: {
      address: 'Vidya Vihar Campus, Pilani, Rajasthan 333031',
      city: 'Pilani',
      lat: 28.3639,
      lng: 75.5869,
      googleMapUrl: 'https://maps.google.com/?q=28.3639,75.5869'
    },
    eventDate: new Date('2026-09-12'),
    startTime: '02:00 PM',
    endTime: '07:00 PM',
    registrationDeadline: new Date('2026-09-10'),
    registrationLink: 'https://bits-pilani.ac.in/codesprint',
    contactPerson: {
      name: 'Dr. Suresh Kumar',
      phone: '+91 94433 22110',
      email: 'suresh@pilani.bits-pilani.ac.in'
    },
    entryFee: 0,
    prizePool: '₹1,50,000',
    gallery: [],
    status: 'approved',
    featured: true,
    viewsCount: 1120
  }
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/campusconnect';
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected for Seeding...');

    await User.deleteMany();
    await Event.deleteMany();
    await Accommodation.deleteMany();

    const hashedPassword = await bcrypt.hash('demo123', 10);

    const users = await User.create([
      {
        name: 'Aarav Sharma',
        email: 'student@campusconnect.edu',
        password: hashedPassword,
        role: 'student',
        college: 'National Institute of Technology',
        department: 'Computer Science & Engineering',
        year: '3rd Year',
        interests: ['AI', 'Coding', 'Hackathon'],
        skills: ['React', 'Node.js', 'Python', 'Tailwind CSS']
      },
      {
        name: 'Priya Sundaram',
        email: 'organizer@campusconnect.edu',
        password: hashedPassword,
        role: 'organizer',
        college: 'IIT Madras',
        department: 'Information Technology'
      },
      {
        name: 'Admin Chief',
        email: 'admin@campusconnect.edu',
        password: hashedPassword,
        role: 'admin',
        college: 'CampusConnect Head Office'
      }
    ]);

    const organizerId = users[1]._id;

    const createdEvents = await Event.create(
      sampleEvents.map(e => ({ ...e, organizer: organizerId }))
    );

    await Accommodation.create([
      {
        event: createdEvents[0]._id,
        name: 'Greenwood Youth Hostel',
        type: 'Hostel',
        image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=800',
        pricePerNight: 750,
        rating: 4.8,
        safetyScore: 96,
        distanceKm: 1.5,
        address: 'Adyar Gate Road, Chennai',
        amenities: ['CCTV Security', 'Free Wi-Fi', 'Breakfast', '24/7 Desk'],
        contactPhone: '+91 98765 11111'
      },
      {
        event: createdEvents[0]._id,
        name: 'Metro Stay Student Suites',
        type: 'Student PG',
        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=800',
        pricePerNight: 1100,
        rating: 4.6,
        safetyScore: 92,
        distanceKm: 3.2,
        address: 'Velachery Main Rd, Chennai',
        amenities: ['Air Conditioned', 'Biometric Entry', 'Laundry', 'Meals'],
        contactPhone: '+91 98765 22222'
      }
    ]);

    console.log('Database successfully seeded with demo users, events, and accommodations!');
    if (require.main === module) {
      process.exit();
    }
  } catch (err) {
    console.error('Seeding error:', err.message);
    if (require.main === module) {
      process.exit(1);
    }
  }
};

if (require.main === module) {
  seedDB();
}

module.exports = seedDB;
