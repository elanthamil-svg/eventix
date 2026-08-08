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

// @desc    Chat with AI about a specific event
// @route   POST /api/ai/chat
exports.chatWithEventAI = async (req, res) => {
  try {
    const { eventId, message, history } = req.body;
    
    let event = null;
    try {
      const Event = require('../models/Event');
      event = await Event.findById(eventId);
    } catch (_e) {}
    
    if (!event) {
      event = SEED_EVENTS.find(e => (e._id || e.id)?.toString() === eventId?.toString());
    }

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const reply = await geminiService.eventChatbot(event, message, history);
    res.json({ success: true, reply });
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
  },
  {
    _id: 'evt_123',
    title: 'Tathva 2026: South India\'s Premier National Techno-Management Fest',
    description: 'Hosted by NIT Calicut, Tathva features AI Hackathons, Transporter Robot Wars, Cloud Computing Workshops, Autonomous Racing, and Paper Presentations across 50+ engineering colleges.',
    category: 'Hackathon',
    tags: ['Hackathon', 'AI', 'Robotics', 'Cloud Computing', 'Coding', 'South India', 'Kerala'],
    collegeName: 'National Institute of Technology Calicut (NITC)',
    venue: 'NIT Calicut OAT & Main Campus Complex',
    eventDate: '2026-10-16T09:00:00.000Z',
    entryFee: 0,
    prizePool: '₹7,50,000',
    status: 'approved'
  },
  {
    _id: 'evt_124',
    title: 'Kurukshetra 2026: UNESCO Patronized International Tech Fest',
    description: 'Anna University\'s battle of brains — featuring Speed Coding, AI Innovation Arena, Autonomous Racing, and Guest Keynotes from top global tech pioneers.',
    category: 'Coding',
    tags: ['Coding', 'Algorithms', 'AI', 'UNESCO', 'Anna University', 'South India', 'Tamil Nadu'],
    collegeName: 'College of Engineering Guindy, Anna University',
    venue: 'Vivekananda Auditorium & CEG Campus',
    eventDate: '2026-09-28T09:00:00.000Z',
    entryFee: 200,
    prizePool: '₹12,00,000',
    status: 'approved'
  },
  {
    _id: 'evt_125',
    title: 'Kriya 2026: Global Student Engineering & Tech Summit',
    description: 'Organised by PSG Tech Students Union, Kriya brings 40+ engineering challenges, IoT Edge Computing Hackathons, EV Powertrain Design, and Industrial Automation events.',
    category: 'IoT & Embedded',
    tags: ['IoT & Embedded', 'Hardware', 'Robotics', 'EV Tech', 'PSG Tech', 'South India', 'Coimbatore'],
    collegeName: 'PSG College of Technology',
    venue: 'PSG Tech Quadrangle & Assembly Hall',
    eventDate: '2026-10-09T09:30:00.000Z',
    entryFee: 250,
    prizePool: '₹6,00,000',
    status: 'approved'
  },
  {
    _id: 'evt_126',
    title: 'Invente 6.0: National Level Tech Symposium & Hackathon',
    description: 'SSN\'s premier tech fest with Web Dev Sprints, AI Model Showcases, Cyber CTF Battles, and Bio-Tech Paper Presentations.',
    category: 'Web Development',
    tags: ['Web Development', 'AI', 'Cyber Security', 'SSN', 'South India', 'Chennai'],
    collegeName: 'SSN College of Engineering',
    venue: 'SSN Auditorium & CSE Block',
    eventDate: '2026-11-14T09:00:00.000Z',
    entryFee: 150,
    prizePool: '₹4,00,000',
    status: 'approved'
  },
  {
    _id: 'evt_127',
    title: 'Felicity 2026: IIIT Hyderabad Annual Techno-Cultural Festival',
    description: 'Featuring Threads Competitive Programming, AI LLM Hackathon, GameDev Jams, and Pro Night Music Performances.',
    category: 'AI & Healthcare',
    tags: ['AI', 'Coding', 'Machine Learning', 'Game Development', 'IIIT Hyderabad', 'South India', 'Telangana'],
    collegeName: 'IIIT Hyderabad',
    venue: 'Felicity Ground & Nilgiri Block',
    eventDate: '2026-10-23T10:00:00.000Z',
    entryFee: 0,
    prizePool: '₹8,00,000',
    status: 'approved'
  },
  {
    _id: 'evt_128',
    title: 'Atmos 2026: BITS Pilani Hyderabad Techno-Management Fest',
    description: 'High-octane Drone Racing League, Quadcopter Autonomous Challenges, Algorithmic Trading Arena, and AI Prompt Engineering Sprints.',
    category: 'Robotics',
    tags: ['Robotics', 'Drones', 'Finance & FinTech', 'AI', 'BITS Pilani', 'South India', 'Hyderabad'],
    collegeName: 'BITS Pilani Hyderabad Campus',
    venue: 'BITS Auditorium & Tech Lawns',
    eventDate: '2026-11-06T09:30:00.000Z',
    entryFee: 200,
    prizePool: '₹5,00,000',
    status: 'approved'
  },
  {
    _id: 'evt_129',
    title: 'Incident 2026: National Beachside Techno-Cultural Extravaganza',
    description: 'NITK Surathkal\'s iconic beachside fest featuring Coastal Hackathons, Battle of the Bands, Fine Arts, and Pro Nights right on the Arabian Sea coast.',
    category: 'Cultural',
    tags: ['Cultural', 'Music & Performing Arts', 'Beachside Fest', 'NITK Surathkal', 'South India', 'Karnataka'],
    collegeName: 'NITK Surathkal',
    venue: 'NITK Beach Pavilion & OAT',
    eventDate: '2026-12-05T09:00:00.000Z',
    entryFee: 300,
    prizePool: '₹4,50,000',
    status: 'approved'
  },
  {
    _id: 'evt_130',
    title: '8th Mile 2026: RVCE Inter-Collegiate Smart Tech Festival',
    description: 'RVCE Bengaluru\'s flagship event focused on Smart City IoT Nodes, EV Battery Prototypes, CleanTech Solutions, and Speed Hackathons.',
    category: 'Hackathon',
    tags: ['Hackathon', 'IoT & Embedded', 'CleanTech', 'RVCE', 'South India', 'Bengaluru'],
    collegeName: 'RV College of Engineering (RVCE)',
    venue: 'RVCE Main Auditorium & Tech Park',
    eventDate: '2026-11-22T09:00:00.000Z',
    entryFee: 100,
    prizePool: '₹5,50,000',
    status: 'approved'
  },
  {
    _id: 'evt_131',
    title: 'Kuruksastra 2026: National Cultural & Design Festival',
    description: 'SASTRA University\'s grand cultural spectacle bringing together classical music, dance, short film, digital art, and UI/UX design challenges.',
    category: 'Cultural',
    tags: ['Cultural', 'Design', 'UI/UX', 'Music & Performing Arts', 'SASTRA', 'South India', 'Thanjavur'],
    collegeName: 'SASTRA Deemed University',
    venue: 'SASTRA Campus Auditorium',
    eventDate: '2026-10-04T09:30:00.000Z',
    entryFee: 200,
    prizePool: '₹3,50,000',
    status: 'approved'
  },
  {
    _id: 'evt_132',
    title: 'Dhwani 2026: Premier Technical & Cultural Carnival',
    description: 'College of Engineering Trivandrum\'s signature fest with Choreonite, Short Film Contest, Algorithmic Coding Marathons, and Pro Nights in Kerala\'s capital.',
    category: 'Cultural',
    tags: ['Cultural', 'Photography & Film', 'Coding', 'CET Trivandrum', 'South India', 'Kerala'],
    collegeName: 'College of Engineering Trivandrum (CET)',
    venue: 'CET Amphitheatre & PG Block',
    eventDate: '2026-11-26T09:00:00.000Z',
    entryFee: 150,
    prizePool: '₹4,00,000',
    status: 'approved'
  }
];

