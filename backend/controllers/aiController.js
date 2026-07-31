const geminiService = require('../services/geminiService');
const Event = require('../models/Event');

// @desc    Get AI personalized event recommendations for student
// @route   POST /api/ai/recommend  (interests[] sent in body)
// @route   GET  /api/ai/recommend  (fallback)
exports.getRecommendations = async (req, res) => {
  try {
    // Accept interests from request body (POST) or query (GET)
    const interests = req.body?.interests || req.query?.interests || [];
    const department = req.body?.department || req.query?.department || 'Computer Science';
    const year = req.body?.year || req.query?.year || '3rd Year';
    const skills = req.body?.skills || [];

    const userProfile = {
      department,
      year,
      interests: Array.isArray(interests) ? interests : [interests],
      skills: Array.isArray(skills) ? skills : [skills]
    };

    // Try fetching real events from DB
    let events = [];
    try {
      events = await Event.find({ status: 'approved' }).limit(20);
    } catch (_dbErr) {
      // MongoDB not running — use built-in seed events
    }

    // Always fall back to built-in mock events if DB is empty
    if (!events || events.length === 0) {
      events = SEED_EVENTS;
    }

    // Run Gemini recommendation engine
    const recommendations = await geminiService.recommendEvents(userProfile, events);

    // Enrich with full event data
    const enriched = recommendations.map(rec => {
      const found = events.find(e =>
        (e._id || e.id)?.toString() === rec.eventId?.toString()
      );
      return { ...rec, event: found || null };
    }).filter(r => r.event !== null);

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    console.error('AI Recommend error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Calculate AI Travel Safety Score for event
// @route   POST /api/ai/safety-score
exports.getTravelSafetyScore = async (req, res) => {
  try {
    const { distanceKm, travelTimeMins, eventEndTime, currentTime, weather, transportAvailable } = req.body;

    const safetyReport = await geminiService.calculateTravelSafetyScore({
      distanceKm: Number(distanceKm) || 35,
      travelTimeMins: Number(travelTimeMins) || 45,
      eventEndTime: eventEndTime || '08:30 PM',
      currentTime: currentTime || '06:00 PM',
      weather: weather || 'Clear sky, 25°C',
      transportAvailable: transportAvailable !== false
    });

    res.json({ success: true, data: safetyReport });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get AI Accommodation Recommendations for long distance events
// @route   POST /api/ai/accommodations
exports.getAccommodationRecommendations = async (req, res) => {
  try {
    const { eventId, userBudget, distanceKm } = req.body;

    let accommodationsList = [];
    if (eventId) {
      try {
        const Accommodation = require('../models/Accommodation');
        accommodationsList = await Accommodation.find({ event: eventId });
      } catch (_e) {}
    }

    if (!accommodationsList || accommodationsList.length === 0) {
      accommodationsList = [
        {
          id: 'acc_1',
          name: 'CampusNest Student Living',
          type: 'Hostel',
          image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=800',
          pricePerNight: 850,
          rating: 4.8,
          safetyScore: 95,
          distanceKm: 2.1,
          address: 'College Road, Near Main Gate',
          amenities: ['24/7 Security', 'Free Wi-Fi', 'Biometric Lock', 'Meals Included'],
          contactPhone: '+91 98765 11223'
        },
        {
          id: 'acc_2',
          name: 'Scholar Stays Deluxe PG',
          type: 'Student PG',
          image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=800',
          pricePerNight: 1200,
          rating: 4.6,
          safetyScore: 91,
          distanceKm: 3.5,
          address: 'Tech Park Avenue',
          amenities: ['CCTV Monitored', 'Washing Machine', 'Power Backup', 'Study Desk'],
          contactPhone: '+91 98765 44556'
        },
        {
          id: 'acc_3',
          name: 'Greenwood Executive Hotel',
          type: 'Hotel',
          image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800',
          pricePerNight: 1800,
          rating: 4.7,
          safetyScore: 94,
          distanceKm: 1.8,
          address: 'Station Road Square',
          amenities: ['AC Rooms', 'Room Service', 'Safe Parking', 'Complimentary Breakfast'],
          contactPhone: '+91 98765 77889'
        }
      ];
    }

    const ranked = await geminiService.rankAccommodations(accommodationsList, userBudget || 1500);

    res.json({
      success: true,
      distanceKm: distanceKm || 120,
      thresholdExceeded: (distanceKm || 120) >= 100,
      count: ranked.length,
      data: ranked
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Built-in seed events used when MongoDB is offline
const SEED_EVENTS = [
  {
    _id: 'evt_111',
    title: 'Culturix 2026: National Inter-College Cultural Extravaganza',
    description: 'A grand stage for dance, drama, music, literary arts, and fine arts competitions across 300+ colleges.',
    category: 'Cultural',
    tags: ['Cultural', 'Dance', 'Music', 'Drama', 'Fine Arts', 'Literary'],
    collegeName: 'Amrita Vishwa Vidyapeetham',
    venue: 'Amritapuri Campus Amphitheatre',
    eventDate: '2026-11-05T09:00:00.000Z',
    entryFee: 300,
    prizePool: '₹5,00,000',
    status: 'approved'
  },
  {
    _id: 'evt_112',
    title: 'StartupPulse India 2026: National Student Entrepreneurship Summit',
    description: 'Pitch your startup idea to a panel of VCs, angel investors, and serial entrepreneurs.',
    category: 'Entrepreneurship',
    tags: ['Entrepreneurship', 'Startup', 'Business', 'Pitch', 'Venture Capital'],
    collegeName: 'IIM Ahmedabad',
    venue: 'Louis Kahn Plaza',
    eventDate: '2026-11-12T09:00:00.000Z',
    entryFee: 500,
    prizePool: '₹10,00,000',
    status: 'approved'
  },
  {
    _id: 'evt_113',
    title: 'AstroHack 2026: Space Technology & Satellite Innovation Challenge',
    description: 'Build cubesat payloads, orbital trajectory simulators, and satellite data analytics tools.',
    category: 'Space Technology',
    tags: ['Space Technology', 'Aerospace', 'Python', 'Robotics', 'Data Science', 'AI'],
    collegeName: 'IIST Trivandrum',
    venue: 'IIST Campus, Space Tech Lab',
    eventDate: '2026-11-20T10:00:00.000Z',
    entryFee: 0,
    prizePool: '₹3,00,000',
    status: 'approved'
  },
  {
    _id: 'evt_114',
    title: 'ImmerseFest 2026: AR/VR & Extended Reality Hackathon',
    description: 'Design and build immersive XR experiences — virtual labs, AR navigation overlays, VR training simulations.',
    category: 'AR/VR',
    tags: ['AR/VR', 'Game Development', 'Unity', 'XR', 'UI/UX Design'],
    collegeName: 'Manipal Institute of Technology',
    venue: 'XR Innovation Hub',
    eventDate: '2026-12-03T10:00:00.000Z',
    entryFee: 200,
    prizePool: '₹1,60,000',
    status: 'approved'
  },
  {
    _id: 'evt_115',
    title: 'FinTech Cup 2026: National Finance & Banking Technology Challenge',
    description: 'Build next-gen solutions for digital payments, open banking APIs, fraud detection with ML, decentralized finance.',
    category: 'Finance & FinTech',
    tags: ['Finance & FinTech', 'Blockchain & Web3', 'Machine Learning', 'Python', 'Data Science'],
    collegeName: 'IIM Bangalore',
    venue: 'Innovation Center',
    eventDate: '2026-12-10T09:30:00.000Z',
    entryFee: 300,
    prizePool: '₹4,00,000',
    status: 'approved'
  },
  {
    _id: 'evt_116',
    title: 'PixelFrame 2026: National College Photography & Short Film Contest',
    description: 'Compete in mobile photography, DSLR landscape, street photography, and 3-minute short film categories.',
    category: 'Photography & Film',
    tags: ['Photography & Film', 'Creative Arts', 'Cultural', 'Design'],
    collegeName: 'Symbiosis Institute of Design',
    venue: 'Symbiosis Knowledge Village',
    eventDate: '2026-12-18T09:00:00.000Z',
    entryFee: 100,
    prizePool: '₹60,000',
    status: 'approved'
  },
  {
    _id: 'evt_117',
    title: 'GreenHack 2026: Climate Tech & Sustainable Innovation Hackathon',
    description: 'Build tech solutions for carbon tracking, smart energy grids, precision agriculture, and climate modeling.',
    category: 'Environment & Sustainability',
    tags: ['Environment & Sustainability', 'Data Science', 'IoT & Embedded', 'Python', 'AI'],
    collegeName: 'IIT Kharagpur',
    venue: 'Tech Pavilion',
    eventDate: '2026-08-30T09:00:00.000Z',
    entryFee: 0,
    prizePool: '₹2,50,000',
    status: 'approved'
  },
  {
    _id: 'evt_118',
    title: 'SocialTech Summit 2026: AI for Social Good & Rural Innovation',
    description: 'Solve real-world problems in healthcare access, education equity, rural livelihood, and disaster response using AI.',
    category: 'Social Innovation',
    tags: ['Social Innovation', 'AI', 'Machine Learning', 'Python', 'Web Development'],
    collegeName: 'Tata Institute of Social Sciences',
    venue: 'TISS Main Campus',
    eventDate: '2026-09-08T10:00:00.000Z',
    entryFee: 0,
    prizePool: '₹1,50,000',
    status: 'approved'
  },
  {
    _id: 'evt_119',
    title: 'SportsTech Invitational 2026: Wearable & Performance Analytics Challenge',
    description: 'Engineer wearable sports sensors, AI performance analytics dashboards, and injury prediction models.',
    category: 'Sports Technology',
    tags: ['Sports Technology', 'IoT & Embedded', 'Machine Learning', 'Data Science', 'Python'],
    collegeName: 'JSS Academy of Technical Education',
    venue: 'Sports Science Center',
    eventDate: '2026-09-20T09:00:00.000Z',
    entryFee: 150,
    prizePool: '₹90,000',
    status: 'approved'
  },
  {
    _id: 'evt_120',
    title: 'MelodyX 2026: National College Music & Composition Contest',
    description: 'Compete in solo vocals, band performance, electronic music production, and film score composition.',
    category: 'Music & Performing Arts',
    tags: ['Music & Performing Arts', 'Cultural', 'Creative Arts'],
    collegeName: 'KM Music Conservatory',
    venue: 'AR Rahman Music Hall',
    eventDate: '2026-10-30T10:00:00.000Z',
    entryFee: 200,
    prizePool: '₹1,00,000',
    status: 'approved'
  },
  {
    _id: 'evt_121',
    title: 'BlockchainX India 2026: Web3 & DeFi Innovation Hackathon',
    description: 'Build decentralized apps, NFT platforms, DAOs, DeFi protocols, and smart contract systems on Ethereum & Polygon.',
    category: 'Blockchain & Web3',
    tags: ['Blockchain & Web3', 'Web Development', 'Coding', 'Finance & FinTech', 'Hackathon'],
    collegeName: 'NMIMS Mumbai',
    venue: 'Innovation Hub',
    eventDate: '2026-11-01T10:00:00.000Z',
    entryFee: 250,
    prizePool: '₹3,50,000',
    status: 'approved'
  },
  {
    _id: 'evt_122',
    title: 'MedHack 2026: Digital Health & Medical Device Innovation Sprint',
    description: 'Design next-generation telemedicine platforms, AI diagnostics for rare diseases, and affordable medical tech.',
    category: 'Biomedical & Health Tech',
    tags: ['Biomedical & Health Tech', 'AI', 'Machine Learning', 'Data Science', 'IoT & Embedded'],
    collegeName: 'Christian Medical College',
    venue: 'Simulation Center',
    eventDate: '2026-11-28T09:00:00.000Z',
    entryFee: 100,
    prizePool: '₹1,80,000',
    status: 'approved'
  },
  {
    _id: 'evt_101',
    title: 'HackNova 2026: 36-Hour AI & Web3 Hackathon',
    description: 'Join 500+ top student coders across India for a high-stakes AI and Web3 hackathon with live mentoring and venture capital pitch sessions.',
    category: 'Hackathon',
    tags: ['AI', 'Artificial Intelligence', 'Coding', 'Hackathon', 'Web3', 'Python', 'Machine Learning'],
    collegeName: 'IIT Madras',
    venue: 'CLT Auditorium & Computing Hub',
    eventDate: '2026-08-15T09:00:00.000Z',
    entryFee: 0,
    prizePool: '₹2,50,000',
    status: 'approved'
  },
  {
    _id: 'evt_102',
    title: 'RoboQuest 2.0: Drone & Combat Championship',
    description: 'Compete in obstacle navigation, autonomous line follower, and arena combat robotics challenges.',
    category: 'Robotics',
    tags: ['Robotics', 'Robotics & Drones', 'Hardware', 'IoT', 'Autonomous', 'Drone'],
    collegeName: 'NIT Trichy',
    venue: 'Robotics Center',
    eventDate: '2026-08-22T10:00:00.000Z',
    entryFee: 250,
    prizePool: '₹1,00,000',
    status: 'approved'
  },
  {
    _id: 'evt_103',
    title: 'DesignX National UI/UX & Product Design Summit',
    description: 'Immerse in interactive Figma design sprints, design systems workshops, and feedback sessions with Product Designers.',
    category: 'Design',
    tags: ['Design', 'UI/UX Design', 'Figma', 'Product Design', 'User Research'],
    collegeName: 'NIFT Bangalore',
    venue: 'Design Innovation Lab',
    eventDate: '2026-09-05T09:30:00.000Z',
    entryFee: 150,
    prizePool: '₹75,000',
    status: 'approved'
  },
  {
    _id: 'evt_104',
    title: 'CodeSprint 2026: Speed Algorithmic Contest',
    description: 'Fast-paced ICPC style competitive programming clash. Solve 8 complex algorithmic problems under pressure.',
    category: 'Coding',
    tags: ['Coding', 'Competitive Coding', 'Algorithms', 'C++', 'Data Structures'],
    collegeName: 'BITS Pilani',
    venue: 'IPC Lab',
    eventDate: '2026-09-12T14:00:00.000Z',
    entryFee: 0,
    prizePool: '₹1,50,000',
    status: 'approved'
  },
  {
    _id: 'evt_105',
    title: 'CyberShield 2026: National Cyber Security CTF',
    description: 'Capture The Flag cybersecurity contest featuring real-world vulnerability exploitation, network forensics, reverse engineering, and ethical hacking challenges.',
    category: 'Cyber Security',
    tags: ['Cyber Security', 'CTF', 'Hacking', 'Forensics', 'Networking', 'Python'],
    collegeName: 'VIT Vellore',
    venue: 'Cyber Lab & Anna Auditorium',
    eventDate: '2026-09-18T09:00:00.000Z',
    entryFee: 100,
    prizePool: '₹80,000',
    status: 'approved'
  },
  {
    _id: 'evt_106',
    title: 'CloudFest India 2026: AWS & GCP Developer Summit',
    description: 'Hands-on cloud architecture hackathon with workshops on serverless pipelines, DevOps automation, and cloud-native AI deployment at scale.',
    category: 'Cloud Computing',
    tags: ['Cloud Computing', 'AWS', 'GCP', 'DevOps', 'Serverless', 'Docker'],
    collegeName: 'SRMIST Chennai',
    venue: 'Tech Park Auditorium',
    eventDate: '2026-09-25T10:00:00.000Z',
    entryFee: 200,
    prizePool: '₹1,20,000',
    status: 'approved'
  },
  {
    _id: 'evt_107',
    title: 'DataCon 2026: Big Data & ML Research Symposium',
    description: 'Present your machine learning research papers, explore big data analytics pipelines, and connect with AI research labs across Asia.',
    category: 'Data Science',
    tags: ['Data Science', 'Machine Learning', 'Deep Learning', 'Python', 'Big Data', 'Artificial Intelligence'],
    collegeName: 'IISc Bangalore',
    venue: 'JN Tata Auditorium',
    eventDate: '2026-10-02T09:00:00.000Z',
    entryFee: 0,
    prizePool: '₹1,80,000',
    status: 'approved'
  },
  {
    _id: 'evt_108',
    title: 'GameCraft 3D: Unreal & Unity 48-Hour Game Jam',
    description: 'Build immersive 3D games from scratch using Unreal Engine 5 or Unity. Theme revealed live at kickoff!',
    category: 'Game Development',
    tags: ['Game Development', 'Unity', 'Unreal', 'C++', 'UI/UX Design', '3D Design'],
    collegeName: 'IIIT Hyderabad',
    venue: 'Gaming Studio',
    eventDate: '2026-10-10T11:00:00.000Z',
    entryFee: 150,
    prizePool: '₹1,30,000',
    status: 'approved'
  },
  {
    _id: 'evt_109',
    title: 'IoT-X 2026: Smart Hardware & Embedded Expo',
    description: 'Design smart city IoT nodes, wearable tech, micro-drone controllers, and edge AI hardware prototypes.',
    category: 'IoT & Embedded',
    tags: ['IoT & Embedded', 'Hardware', 'Robotics', 'Arduino', 'ROS', 'C++'],
    collegeName: 'IIT Bombay',
    venue: 'Victor Menezes Convention Centre',
    eventDate: '2026-10-18T10:00:00.000Z',
    entryFee: 0,
    prizePool: '₹2,00,000',
    status: 'approved'
  },
  {
    _id: 'evt_110',
    title: 'BioTech Hacks: AI in Healthcare & Diagnostics',
    description: 'Interdisciplinary hackathon combining AI medical image classification, computational genomics, and health tech hardware innovation.',
    category: 'AI & Healthcare',
    tags: ['Artificial Intelligence', 'Machine Learning', 'Python', 'Biomedical', 'Data Science'],
    collegeName: 'IIT Delhi & AIIMS',
    venue: 'Bharti School of Telecom',
    eventDate: '2026-10-24T09:30:00.000Z',
    entryFee: 200,
    prizePool: '₹2,20,000',
    status: 'approved'
  }
];
