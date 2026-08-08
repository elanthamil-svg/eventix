import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cc_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Fallback seed events for offline / instant evaluation
export const MOCK_EVENTS = [
  {
    _id: 'evt_111',
    title: 'Culturix 2026: National Inter-College Cultural Extravaganza',
    description: 'A grand stage for dance, drama, music, literary arts, and fine arts competitions across 300+ colleges. India\'s biggest student cultural carnival with celebrity guest appearances.',
    category: 'Cultural',
    tags: ['Cultural', 'Dance', 'Music', 'Drama', 'Fine Arts', 'Literary'],
    poster: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=1200',
    collegeName: 'Amrita Vishwa Vidyapeetham',
    venue: 'Amritapuri Campus Amphitheatre & Lawns',
    location: {
      address: 'Ettimadai, Coimbatore, Tamil Nadu 641112',
      city: 'Coimbatore',
      lat: 10.9026,
      lng: 76.9032,
      googleMapUrl: 'https://maps.google.com/?q=10.9026,76.9032'
    },
    eventDate: '2026-11-05T09:00:00.000Z',
    startTime: '09:00 AM',
    endTime: '10:00 PM',
    registrationDeadline: '2026-10-28T23:59:59.000Z',
    registrationLink: 'https://amrita.edu/culturix',
    contactPerson: {
      name: 'Meera Krishnan (Cultural Secretary)',
      phone: '+91 98421 33456',
      email: 'culturix@amrita.edu'
    },
    entryFee: 300,
    prizePool: '₹5,00,000',
    gallery: [
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&q=80&w=800'
    ],
    status: 'approved',
    featured: true,
    viewsCount: 2100
  },
  {
    _id: 'evt_112',
    title: 'StartupPulse India 2026: National Student Entrepreneurship Summit',
    description: 'Pitch your startup idea to a panel of VCs, angel investors, and serial entrepreneurs. Workshops on product-market fit, funding strategy, MVP development and scaling.',
    category: 'Entrepreneurship',
    tags: ['Entrepreneurship', 'Startup', 'Business', 'Pitch', 'Venture Capital', 'Innovation'],
    poster: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=1200',
    collegeName: 'IIM Ahmedabad',
    venue: 'Louis Kahn Plaza & Seminar Halls',
    location: {
      address: 'Vastrapur, Ahmedabad, Gujarat 380015',
      city: 'Ahmedabad',
      lat: 23.0290,
      lng: 72.5285,
      googleMapUrl: 'https://maps.google.com/?q=23.0290,72.5285'
    },
    eventDate: '2026-11-12T09:00:00.000Z',
    startTime: '09:00 AM',
    endTime: '07:00 PM',
    registrationDeadline: '2026-11-05T23:59:59.000Z',
    registrationLink: 'https://iima.ac.in/startuppulse',
    contactPerson: {
      name: 'Rahul Garg (E-Cell Head)',
      phone: '+91 99090 22334',
      email: 'startuppulse@iima.ac.in'
    },
    entryFee: 500,
    prizePool: '₹10,00,000',
    gallery: [],
    status: 'approved',
    featured: true,
    viewsCount: 1870
  },
  {
    _id: 'evt_113',
    title: 'AstroHack 2026: Space Technology & Satellite Innovation Challenge',
    description: 'Build cubesat payloads, orbital trajectory simulators, and satellite data analytics tools. Partner event with ISRO and IIST. Open to all engineering branches.',
    category: 'Space Technology',
    tags: ['Space Technology', 'Aerospace', 'Python', 'Robotics', 'Data Science', 'AI'],
    poster: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?auto=format&fit=crop&q=80&w=1200',
    collegeName: 'IIST Trivandrum',
    venue: 'IIST Campus, Space Tech Lab',
    location: {
      address: 'Valiamala, Thiruvananthapuram, Kerala 695547',
      city: 'Thiruvananthapuram',
      lat: 8.5241,
      lng: 76.9366,
      googleMapUrl: 'https://maps.google.com/?q=8.5241,76.9366'
    },
    eventDate: '2026-11-20T10:00:00.000Z',
    startTime: '10:00 AM',
    endTime: '06:00 PM',
    registrationDeadline: '2026-11-15T23:59:59.000Z',
    registrationLink: 'https://iist.ac.in/astrohack',
    contactPerson: {
      name: 'Dr. Vishnu Nair',
      phone: '+91 98470 55678',
      email: 'astrohack@iist.ac.in'
    },
    entryFee: 0,
    prizePool: '₹3,00,000',
    gallery: [],
    status: 'approved',
    featured: true,
    viewsCount: 1340
  },
  {
    _id: 'evt_114',
    title: 'ImmerseFest 2026: AR/VR & Extended Reality Hackathon',
    description: 'Design and build immersive XR experiences — virtual labs, AR navigation overlays, VR training simulations. Use Unity XR Toolkit, WebXR, Meta Quest Dev Kit.',
    category: 'AR/VR',
    tags: ['AR/VR', 'Game Development', 'Unity', 'XR', 'UI/UX Design', '3D Design'],
    poster: 'https://images.unsplash.com/photo-1617802690658-1173a812650d?auto=format&fit=crop&q=80&w=1200',
    collegeName: 'Manipal Institute of Technology',
    venue: 'XR Innovation Hub, Block 5',
    location: {
      address: 'Manipal, Udupi, Karnataka 576104',
      city: 'Manipal',
      lat: 13.3528,
      lng: 74.7919,
      googleMapUrl: 'https://maps.google.com/?q=13.3528,74.7919'
    },
    eventDate: '2026-12-03T10:00:00.000Z',
    startTime: '10:00 AM',
    endTime: '08:00 PM',
    registrationDeadline: '2026-11-28T23:59:59.000Z',
    registrationLink: 'https://manipal.edu/immersefest',
    contactPerson: {
      name: 'Aditya Kamath',
      phone: '+91 99160 44232',
      email: 'xrfest@manipal.edu'
    },
    entryFee: 200,
    prizePool: '₹1,60,000',
    gallery: [],
    status: 'approved',
    featured: false,
    viewsCount: 920
  },
  {
    _id: 'evt_115',
    title: 'FinTech Cup 2026: National Finance & Banking Technology Challenge',
    description: 'Build next-gen solutions for digital payments, open banking APIs, fraud detection with ML, decentralized finance, and financial inclusion. Mentors from RBI, SEBI-accredited firms.',
    category: 'Finance & FinTech',
    tags: ['Finance & FinTech', 'Blockchain & Web3', 'Machine Learning', 'Python', 'Data Science', 'AI'],
    poster: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1200',
    collegeName: 'IIM Bangalore',
    venue: 'NSR Road Campus, Innovation Center',
    location: {
      address: 'Bannerghatta Road, Bengaluru 560076',
      city: 'Bengaluru',
      lat: 12.9077,
      lng: 77.6079,
      googleMapUrl: 'https://maps.google.com/?q=12.9077,77.6079'
    },
    eventDate: '2026-12-10T09:30:00.000Z',
    startTime: '09:30 AM',
    endTime: '06:00 PM',
    registrationDeadline: '2026-12-05T23:59:59.000Z',
    registrationLink: 'https://iimb.ac.in/fintechcup',
    contactPerson: {
      name: 'Smitha Rao (Finance Cell)',
      phone: '+91 98800 12345',
      email: 'fintechcup@iimb.ac.in'
    },
    entryFee: 300,
    prizePool: '₹4,00,000',
    gallery: [],
    status: 'approved',
    featured: false,
    viewsCount: 1050
  },
  {
    _id: 'evt_116',
    title: 'PixelFrame 2026: National College Photography & Short Film Contest',
    description: 'Compete in mobile photography, DSLR landscape, street photography, and 3-minute short film categories. Guest jury includes National Award winning filmmakers.',
    category: 'Photography & Film',
    tags: ['Photography & Film', 'Creative Arts', 'Cultural', 'Design'],
    poster: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&q=80&w=1200',
    collegeName: 'Symbiosis Institute of Design',
    venue: 'Symbiosis Knowledge Village, Pune',
    location: {
      address: 'Lavale, Pune, Maharashtra 412115',
      city: 'Pune',
      lat: 18.5726,
      lng: 73.7215,
      googleMapUrl: 'https://maps.google.com/?q=18.5726,73.7215'
    },
    eventDate: '2026-12-18T09:00:00.000Z',
    startTime: '09:00 AM',
    endTime: '05:00 PM',
    registrationDeadline: '2026-12-10T23:59:59.000Z',
    registrationLink: 'https://symbiosis.ac.in/pixelframe',
    contactPerson: {
      name: 'Tanvi Desai',
      phone: '+91 97304 56789',
      email: 'pixelframe@symbiosis.ac.in'
    },
    entryFee: 100,
    prizePool: '₹60,000',
    gallery: [],
    status: 'approved',
    featured: false,
    viewsCount: 680
  },
  {
    _id: 'evt_117',
    title: 'GreenHack 2026: Climate Tech & Sustainable Innovation Hackathon',
    description: 'Build tech solutions for carbon tracking, smart energy grids, precision agriculture, ocean plastic cleanup, and climate modeling with open satellite data.',
    category: 'Environment & Sustainability',
    tags: ['Environment & Sustainability', 'Data Science', 'IoT & Embedded', 'Python', 'AI', 'Machine Learning'],
    poster: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1200',
    collegeName: 'IIT Kharagpur',
    venue: 'Gymkhana Ground & Tech Pavilion',
    location: {
      address: 'IIT Campus, Kharagpur, West Bengal 721302',
      city: 'Kharagpur',
      lat: 22.3149,
      lng: 87.3105,
      googleMapUrl: 'https://maps.google.com/?q=22.3149,87.3105'
    },
    eventDate: '2026-08-30T09:00:00.000Z',
    startTime: '09:00 AM',
    endTime: '06:00 PM',
    registrationDeadline: '2026-08-25T23:59:59.000Z',
    registrationLink: 'https://iitkgp.ac.in/greenhack',
    contactPerson: {
      name: 'Prof. Sandip Banerjee',
      phone: '+91 97320 11223',
      email: 'greenhack@iitkgp.ac.in'
    },
    entryFee: 0,
    prizePool: '₹2,50,000',
    gallery: [],
    status: 'approved',
    featured: true,
    viewsCount: 1390
  },
  {
    _id: 'evt_118',
    title: 'SocialTech Summit 2026: AI for Social Good & Rural Innovation',
    description: 'Solve real-world problems in healthcare access, education equity, rural livelihood, and disaster response using AI, mobile tech, and community-driven design.',
    category: 'Social Innovation',
    tags: ['Social Innovation', 'AI', 'Machine Learning', 'Python', 'Web Development', 'IoT & Embedded'],
    poster: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80&w=1200',
    collegeName: 'Tata Institute of Social Sciences',
    venue: 'TISS Mumbai Main Campus',
    location: {
      address: 'Sion-Trombay Road, Deonar, Mumbai 400088',
      city: 'Mumbai',
      lat: 19.0425,
      lng: 72.8879,
      googleMapUrl: 'https://maps.google.com/?q=19.0425,72.8879'
    },
    eventDate: '2026-09-08T10:00:00.000Z',
    startTime: '10:00 AM',
    endTime: '05:00 PM',
    registrationDeadline: '2026-09-03T23:59:59.000Z',
    registrationLink: 'https://tiss.edu/socialtech',
    contactPerson: {
      name: 'Gayatri Rao',
      phone: '+91 98209 44512',
      email: 'socialtech@tiss.edu'
    },
    entryFee: 0,
    prizePool: '₹1,50,000',
    gallery: [],
    status: 'approved',
    featured: false,
    viewsCount: 830
  },
  {
    _id: 'evt_119',
    title: 'SportsTech Invitational 2026: Wearable & Performance Analytics Challenge',
    description: 'Engineer wearable sports sensors, AI performance analytics dashboards, injury prediction models, and athlete monitoring systems for India\'s professional sports leagues.',
    category: 'Sports Technology',
    tags: ['Sports Technology', 'IoT & Embedded', 'Machine Learning', 'Data Science', 'Python', 'Hardware'],
    poster: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=1200',
    collegeName: 'JSS Academy of Technical Education',
    venue: 'Sports Science Center & Indoor Stadium',
    location: {
      address: 'Uttarahalli Road, Bengaluru, Karnataka 560060',
      city: 'Bengaluru',
      lat: 12.9010,
      lng: 77.5487,
      googleMapUrl: 'https://maps.google.com/?q=12.9010,77.5487'
    },
    eventDate: '2026-09-20T09:00:00.000Z',
    startTime: '09:00 AM',
    endTime: '07:00 PM',
    registrationDeadline: '2026-09-15T23:59:59.000Z',
    registrationLink: 'https://jssate.edu.in/sportstech',
    contactPerson: {
      name: 'Coach Ravi Shankar',
      phone: '+91 98440 77881',
      email: 'sportstech@jssate.edu.in'
    },
    entryFee: 150,
    prizePool: '₹90,000',
    gallery: [],
    status: 'approved',
    featured: false,
    viewsCount: 720
  },
  {
    _id: 'evt_120',
    title: 'MelodyX 2026: National College Music & Composition Contest',
    description: 'Compete in solo vocals, band performance, electronic music production, and film score composition. Professional recording studio sessions for top 3 winners.',
    category: 'Music & Performing Arts',
    tags: ['Music & Performing Arts', 'Cultural', 'Creative Arts'],
    poster: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=1200',
    collegeName: 'KM Music Conservatory',
    venue: 'AR Rahman\'s Music Hall, Chennai',
    location: {
      address: 'Old Mahabalipuram Road, Chennai, Tamil Nadu 600097',
      city: 'Chennai',
      lat: 12.9038,
      lng: 80.2272,
      googleMapUrl: 'https://maps.google.com/?q=12.9038,80.2272'
    },
    eventDate: '2026-10-30T10:00:00.000Z',
    startTime: '10:00 AM',
    endTime: '09:00 PM',
    registrationDeadline: '2026-10-22T23:59:59.000Z',
    registrationLink: 'https://kmmc.in/melodyx',
    contactPerson: {
      name: 'Lakshmi Subramaniam',
      phone: '+91 98402 66123',
      email: 'melodyx@kmmc.in'
    },
    entryFee: 200,
    prizePool: '₹1,00,000',
    gallery: [],
    status: 'approved',
    featured: false,
    viewsCount: 870
  },
  {
    _id: 'evt_121',
    title: 'BlockchainX India 2026: Web3 & DeFi Innovation Hackathon',
    description: 'Build decentralized apps, NFT platforms, DAOs, DeFi protocols, and smart contract systems on Ethereum, Solana, and Polygon. Prize pool funded by leading crypto VCs.',
    category: 'Blockchain & Web3',
    tags: ['Blockchain & Web3', 'Web Development', 'Coding', 'Finance & FinTech', 'Hackathon'],
    poster: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?auto=format&fit=crop&q=80&w=1200',
    collegeName: 'NMIMS Mumbai',
    venue: 'Vile Parle West Campus, Innovation Hub',
    location: {
      address: 'Vile Parle West, Mumbai, Maharashtra 400056',
      city: 'Mumbai',
      lat: 19.1057,
      lng: 72.8468,
      googleMapUrl: 'https://maps.google.com/?q=19.1057,72.8468'
    },
    eventDate: '2026-11-01T10:00:00.000Z',
    startTime: '10:00 AM',
    endTime: '08:00 PM',
    registrationDeadline: '2026-10-27T23:59:59.000Z',
    registrationLink: 'https://nmims.edu/blockchainx',
    contactPerson: {
      name: 'Ayush Gupta (Blockchain Club)',
      phone: '+91 99200 11456',
      email: 'blockchainx@nmims.edu'
    },
    entryFee: 250,
    prizePool: '₹3,50,000',
    gallery: [],
    status: 'approved',
    featured: true,
    viewsCount: 1200
  },
  {
    _id: 'evt_122',
    title: 'MedHack 2026: Digital Health & Medical Device Innovation Sprint',
    description: 'Design next-generation telemedicine platforms, AI diagnostics for rare diseases, affordable prosthetics, and hospital management AI systems with clinical advisor mentorship.',
    category: 'Biomedical & Health Tech',
    tags: ['Biomedical & Health Tech', 'AI', 'Machine Learning', 'Data Science', 'IoT & Embedded', 'Python'],
    poster: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&q=80&w=1200',
    collegeName: 'Christian Medical College',
    venue: 'CMC Hospital Simulation Center',
    location: {
      address: 'Ida Scudder Road, Vellore, Tamil Nadu 632004',
      city: 'Vellore',
      lat: 12.9202,
      lng: 79.1325,
      googleMapUrl: 'https://maps.google.com/?q=12.9202,79.1325'
    },
    eventDate: '2026-11-28T09:00:00.000Z',
    startTime: '09:00 AM',
    endTime: '06:00 PM',
    registrationDeadline: '2026-11-22T23:59:59.000Z',
    registrationLink: 'https://cmch-vellore.edu/medhack',
    contactPerson: {
      name: 'Dr. Preethi Samuel',
      phone: '+91 97905 88123',
      email: 'medhack@cmch-vellore.edu'
    },
    entryFee: 100,
    prizePool: '₹1,80,000',
    gallery: [],
    status: 'approved',
    featured: false,
    viewsCount: 960
  },
  {
    _id: 'evt_101',
    title: 'HackNova 2026: 36-Hour AI & Web3 Hackathon',
    description: 'Join 500+ top student coders across India for a high-stakes AI and Web3 hackathon with live mentoring and venture capital pitch sessions.',
    category: 'Hackathon',
    tags: ['AI', 'Coding', 'Hackathon', 'Web3', 'Python'],
    poster: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1200',
    collegeName: 'IIT Madras',
    venue: 'CLT Auditorium & Computing Hub',
    location: {
      address: 'IIT Campus, Chennai, Tamil Nadu 600036',
      city: 'Chennai',
      lat: 12.9915,
      lng: 80.2337,
      googleMapUrl: 'https://maps.google.com/?q=12.9915,80.2337'
    },
    eventDate: '2026-08-15T09:00:00.000Z',
    startTime: '09:00 AM',
    endTime: '09:00 PM',
    registrationDeadline: '2026-08-10T23:59:59.000Z',
    registrationLink: 'https://iitm.ac.in/hacknova',
    contactPerson: {
      name: 'Rohan Sharma (Lead Organizer)',
      phone: '+91 98765 43210',
      email: 'hacknova@iitm.ac.in'
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
    _id: 'evt_102',
    title: 'RoboQuest 2.0: Drone & Combat Championship',
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
    eventDate: '2026-08-22T10:00:00.000Z',
    startTime: '10:00 AM',
    endTime: '06:00 PM',
    registrationDeadline: '2026-08-18T23:59:59.000Z',
    registrationLink: 'https://nitt.edu/roboquest',
    contactPerson: {
      name: 'Anita Verma',
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
    _id: 'evt_103',
    title: 'DesignX National UI/UX & Product Design Summit',
    description: 'Immerse in interactive Figma design sprints, design systems workshops, and feedback sessions with top Product Designers from leading tech companies.',
    category: 'Design',
    tags: ['Design', 'UI/UX', 'Figma', 'Product Design'],
    poster: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&q=80&w=1200',
    collegeName: 'NIFT Bangalore',
    venue: 'Design Innovation Lab',
    location: {
      address: 'HSR Layout, Bengaluru 560102',
      city: 'Bengaluru',
      lat: 12.9116,
      lng: 77.6534,
      googleMapUrl: 'https://maps.google.com/?q=12.9116,77.6534'
    },
    eventDate: '2026-09-05T09:30:00.000Z',
    startTime: '09:30 AM',
    endTime: '05:30 PM',
    registrationDeadline: '2026-08-30T23:59:59.000Z',
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
    _id: 'evt_104',
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
    eventDate: '2026-09-12T14:00:00.000Z',
    startTime: '02:00 PM',
    endTime: '07:00 PM',
    registrationDeadline: '2026-09-10T23:59:59.000Z',
    registrationLink: 'https://bits-pilani.ac.in/codesprint',
    contactPerson: {
      name: 'Dr. Suresh Kumar',
      phone: '+91 94433 22110',
      email: 'suresh@bits-pilani.ac.in'
    },
    entryFee: 0,
    prizePool: '₹1,50,000',
    gallery: [],
    status: 'approved',
    featured: true,
    viewsCount: 1120
  },
  {
    _id: 'evt_105',
    title: 'CyberShield 2026: National Cyber Security CTF',
    description: 'Capture The Flag cybersecurity contest featuring real-world vulnerability exploitation, network forensics, reverse engineering, and ethical hacking challenges.',
    category: 'Cyber Security',
    tags: ['Cyber Security', 'CTF', 'Hacking', 'Forensics', 'Networking', 'Python'],
    poster: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1200',
    collegeName: 'VIT Vellore',
    venue: 'Cyber Lab & Anna Auditorium',
    location: {
      address: 'Katpadi-Tiruvalam Road, Vellore, Tamil Nadu 632014',
      city: 'Vellore',
      lat: 12.9692,
      lng: 79.1559,
      googleMapUrl: 'https://maps.google.com/?q=12.9692,79.1559'
    },
    eventDate: '2026-09-18T09:00:00.000Z',
    startTime: '09:00 AM',
    endTime: '09:00 PM',
    registrationDeadline: '2026-09-15T23:59:59.000Z',
    registrationLink: 'https://vit.ac.in/cybershield',
    contactPerson: {
      name: 'Dr. Ramesh Kumar',
      phone: '+91 94111 22334',
      email: 'cybershield@vit.ac.in'
    },
    entryFee: 100,
    prizePool: '₹80,000',
    gallery: [
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800'
    ],
    status: 'approved',
    featured: true,
    viewsCount: 890
  },
  {
    _id: 'evt_106',
    title: 'CloudFest India 2026: AWS & GCP Developer Summit',
    description: 'Hands-on cloud architecture hackathon with workshops on serverless pipelines, DevOps automation, and cloud-native AI deployment at scale.',
    category: 'Cloud Computing',
    tags: ['Cloud Computing', 'AWS', 'GCP', 'DevOps', 'Serverless', 'Docker'],
    poster: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200',
    collegeName: 'SRMIST Chennai',
    venue: 'Tech Park Auditorium & Innovation Tower',
    location: {
      address: 'Kattankulathur, Chengalpattu, Tamil Nadu 603203',
      city: 'Chennai',
      lat: 12.8231,
      lng: 80.0442,
      googleMapUrl: 'https://maps.google.com/?q=12.8231,80.0442'
    },
    eventDate: '2026-09-25T10:00:00.000Z',
    startTime: '10:00 AM',
    endTime: '06:00 PM',
    registrationDeadline: '2026-09-22T23:59:59.000Z',
    registrationLink: 'https://srmist.edu.in/cloudfest',
    contactPerson: {
      name: 'Priya Sundaram',
      phone: '+91 98844 55667',
      email: 'cloudfest@srmist.edu.in'
    },
    entryFee: 200,
    prizePool: '₹1,20,000',
    gallery: [],
    status: 'approved',
    featured: false,
    viewsCount: 1040
  },
  {
    _id: 'evt_107',
    title: 'DataCon 2026: Big Data & ML Research Symposium',
    description: 'Present your machine learning research papers, explore big data analytics pipelines, and connect with AI research labs across Asia.',
    category: 'Data Science',
    tags: ['Data Science', 'Machine Learning', 'Deep Learning', 'Python', 'Big Data'],
    poster: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200',
    collegeName: 'IISc Bangalore',
    venue: 'JN Tata Auditorium',
    location: {
      address: 'CV Raman Road, Bengaluru, Karnataka 560012',
      city: 'Bengaluru',
      lat: 13.0184,
      lng: 77.5694,
      googleMapUrl: 'https://maps.google.com/?q=13.0184,77.5694'
    },
    eventDate: '2026-10-02T09:00:00.000Z',
    startTime: '09:00 AM',
    endTime: '05:00 PM',
    registrationDeadline: '2026-09-28T23:59:59.000Z',
    registrationLink: 'https://iisc.ac.in/datacon',
    contactPerson: {
      name: 'Prof. Arvind Menon',
      phone: '+91 98450 12345',
      email: 'datacon@iisc.ac.in'
    },
    entryFee: 0,
    prizePool: '₹1,80,000',
    gallery: [],
    status: 'approved',
    featured: true,
    viewsCount: 1650
  },
  {
    _id: 'evt_108',
    title: 'GameCraft 3D: Unreal & Unity 48-Hour Game Jam',
    description: 'Build immersive 3D games from scratch using Unreal Engine 5 or Unity. Theme revealed live at kickoff!',
    category: 'Game Development',
    tags: ['Game Development', 'Unity', 'Unreal', 'C++', 'UI/UX Design', '3D Design'],
    poster: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1200',
    collegeName: 'IIIT Hyderabad',
    venue: 'Gaming Studio & Kohli Center',
    location: {
      address: 'Gachibowli, Hyderabad, Telangana 500032',
      city: 'Hyderabad',
      lat: 17.4451,
      lng: 78.3489,
      googleMapUrl: 'https://maps.google.com/?q=17.4451,78.3489'
    },
    eventDate: '2026-10-10T11:00:00.000Z',
    startTime: '11:00 AM',
    endTime: '08:00 PM',
    registrationDeadline: '2026-10-08T23:59:59.000Z',
    registrationLink: 'https://iiit.ac.in/gamecraft',
    contactPerson: {
      name: 'Siddharth Rao',
      phone: '+91 97000 88990',
      email: 'gamecraft@iiit.ac.in'
    },
    entryFee: 150,
    prizePool: '₹1,30,000',
    gallery: [],
    status: 'approved',
    featured: false,
    viewsCount: 810
  },
  {
    _id: 'evt_109',
    title: 'IoT-X 2026: Smart Hardware & Embedded Expo',
    description: 'Design smart city IoT nodes, wearable tech, micro-drone controllers, and edge AI hardware prototypes.',
    category: 'IoT & Embedded',
    tags: ['IoT', 'Hardware', 'Robotics', 'Arduino', 'ROS', 'C++'],
    poster: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200',
    collegeName: 'IIT Bombay',
    venue: 'Victor Menezes Convention Centre',
    location: {
      address: 'Powai, Mumbai, Maharashtra 400076',
      city: 'Mumbai',
      lat: 19.1334,
      lng: 72.9133,
      googleMapUrl: 'https://maps.google.com/?q=19.1334,72.9133'
    },
    eventDate: '2026-10-18T10:00:00.000Z',
    startTime: '10:00 AM',
    endTime: '06:00 PM',
    registrationDeadline: '2026-10-14T23:59:59.000Z',
    registrationLink: 'https://iitb.ac.in/iotx',
    contactPerson: {
      name: 'Neha Joshi',
      phone: '+91 98200 33445',
      email: 'iotx@iitb.ac.in'
    },
    entryFee: 0,
    prizePool: '₹2,00,000',
    gallery: [],
    status: 'approved',
    featured: true,
    viewsCount: 1290
  },
  {
    _id: 'evt_110',
    title: 'BioTech Hacks: AI in Healthcare & Diagnostics',
    description: 'Interdisciplinary hackathon combining AI medical image classification, computational genomics, and health tech hardware innovation.',
    category: 'AI & Healthcare',
    tags: ['Artificial Intelligence', 'Machine Learning', 'Python', 'Biomedical', 'Data Science'],
    poster: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1200',
    collegeName: 'IIT Delhi & AIIMS',
    venue: 'Bharti School of Telecom & AIIMS Auditorium',
    location: {
      address: 'Hauz Khas, New Delhi 110016',
      city: 'New Delhi',
      lat: 28.545,
      lng: 77.1926,
      googleMapUrl: 'https://maps.google.com/?q=28.545,77.1926'
    },
    eventDate: '2026-10-24T09:30:00.000Z',
    startTime: '09:30 AM',
    endTime: '07:30 PM',
    registrationDeadline: '2026-10-20T23:59:59.000Z',
    registrationLink: 'https://iitd.ac.in/biotechhacks',
    contactPerson: {
      name: 'Dr. Ananya Roy',
      phone: '+91 98111 66778',
      email: 'biotechhacks@iitd.ac.in'
    },
    entryFee: 200,
    prizePool: '₹2,20,000',
    gallery: [],
    status: 'approved',
    featured: true,
    viewsCount: 1510
  },
  {
    _id: 'evt_123',
    title: 'Tathva 2026: South India\'s Premier National Techno-Management Fest',
    description: 'Hosted by NIT Calicut, Tathva features AI Hackathons, Transporter Robot Wars, Cloud Computing Workshops, Autonomous Racing, and Paper Presentations across 50+ engineering colleges.',
    category: 'Hackathon',
    tags: ['Hackathon', 'AI', 'Robotics', 'Cloud Computing', 'Coding', 'South India', 'Kerala'],
    poster: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1200',
    collegeName: 'National Institute of Technology Calicut (NITC)',
    venue: 'NIT Calicut OAT & Main Campus Complex',
    location: {
      address: 'NIT Campus P.O., Kozhikode, Kerala 673601',
      city: 'Kozhikode',
      lat: 11.3216,
      lng: 75.9339,
      googleMapUrl: 'https://maps.google.com/?q=11.3216,75.9339'
    },
    eventDate: '2026-10-16T09:00:00.000Z',
    startTime: '09:00 AM',
    endTime: '09:30 PM',
    registrationDeadline: '2026-10-10T23:59:59.000Z',
    registrationLink: 'https://tathva.org',
    contactPerson: {
      name: 'Abhinav Nair (Student Convenor)',
      phone: '+91 94471 22334',
      email: 'tathva@nitc.ac.in'
    },
    entryFee: 0,
    prizePool: '₹7,50,000',
    gallery: ['https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=800'],
    status: 'approved',
    featured: true,
    viewsCount: 2450
  },
  {
    _id: 'evt_124',
    title: 'Kurukshetra 2026: UNESCO Patronized International Tech Fest',
    description: 'Anna University\'s battle of brains — featuring Speed Coding, AI Innovation Arena, Autonomous Racing, and Guest Keynotes from top global tech pioneers.',
    category: 'Coding',
    tags: ['Coding', 'Algorithms', 'AI', 'UNESCO', 'Anna University', 'South India', 'Tamil Nadu'],
    poster: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=1200',
    collegeName: 'College of Engineering Guindy, Anna University',
    venue: 'Vivekananda Auditorium & CEG Campus, Guindy',
    location: {
      address: '12, Sardar Patel Rd, Guindy, Chennai, Tamil Nadu 600025',
      city: 'Chennai',
      lat: 13.0102,
      lng: 80.2354,
      googleMapUrl: 'https://maps.google.com/?q=13.0102,80.2354'
    },
    eventDate: '2026-09-28T09:00:00.000Z',
    startTime: '09:00 AM',
    endTime: '08:30 PM',
    registrationDeadline: '2026-09-22T23:59:59.000Z',
    registrationLink: 'https://kurukshetra.org.in',
    contactPerson: {
      name: 'Siddharth V (CTO)',
      phone: '+91 98401 99887',
      email: 'kurukshetra@ceg.annauniv.edu'
    },
    entryFee: 200,
    prizePool: '₹12,00,000',
    gallery: [],
    status: 'approved',
    featured: true,
    viewsCount: 3100
  },
  {
    _id: 'evt_125',
    title: 'Kriya 2026: Global Student Engineering & Tech Summit',
    description: 'Organised by PSG Tech Students Union, Kriya brings 40+ engineering challenges, IoT Edge Computing Hackathons, EV Powertrain Design, and Industrial Automation events.',
    category: 'IoT & Embedded',
    tags: ['IoT & Embedded', 'Hardware', 'Robotics', 'EV Tech', 'PSG Tech', 'South India', 'Coimbatore'],
    poster: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200',
    collegeName: 'PSG College of Technology',
    venue: 'PSG Tech Quadrangle & Assembly Hall',
    location: {
      address: 'Avinashi Rd, Peelamedu, Coimbatore, Tamil Nadu 641004',
      city: 'Coimbatore',
      lat: 11.0247,
      lng: 77.0028,
      googleMapUrl: 'https://maps.google.com/?q=11.0247,77.0028'
    },
    eventDate: '2026-10-09T09:30:00.000Z',
    startTime: '09:30 AM',
    endTime: '07:00 PM',
    registrationDeadline: '2026-10-03T23:59:59.000Z',
    registrationLink: 'https://psgkriya.in',
    contactPerson: {
      name: 'Kavya Subramaniam',
      phone: '+91 97912 33445',
      email: 'kriya@psgtech.ac.in'
    },
    entryFee: 250,
    prizePool: '₹6,00,000',
    gallery: [],
    status: 'approved',
    featured: true,
    viewsCount: 1950
  },
  {
    _id: 'evt_126',
    title: 'Invente 6.0: National Level Tech Symposium & Hackathon',
    description: 'SSN\'s premier tech fest with Web Dev Sprints, AI Model Showcases, Cyber CTF Battles, and Bio-Tech Paper Presentations.',
    category: 'Web Development',
    tags: ['Web Development', 'AI', 'Cyber Security', 'SSN', 'South India', 'Chennai'],
    poster: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=1200',
    collegeName: 'SSN College of Engineering',
    venue: 'SSN Auditorium & CSE Block, Kalavakkam',
    location: {
      address: 'Old Mahabalipuram Rd, Kalavakkam, Tamil Nadu 603110',
      city: 'Chennai',
      lat: 12.7509,
      lng: 80.1972,
      googleMapUrl: 'https://maps.google.com/?q=12.7509,80.1972'
    },
    eventDate: '2026-11-14T09:00:00.000Z',
    startTime: '09:00 AM',
    endTime: '06:00 PM',
    registrationDeadline: '2026-11-08T23:59:59.000Z',
    registrationLink: 'https://ssninvente.com',
    contactPerson: {
      name: 'Ashwin Raman',
      phone: '+91 98840 77665',
      email: 'invente@ssn.edu.in'
    },
    entryFee: 150,
    prizePool: '₹4,00,000',
    gallery: [],
    status: 'approved',
    featured: false,
    viewsCount: 1620
  },
  {
    _id: 'evt_127',
    title: 'Felicity 2026: IIIT Hyderabad Annual Techno-Cultural Festival',
    description: 'Featuring Threads Competitive Programming, AI LLM Hackathon, GameDev Jams, and Pro Night Music Performances.',
    category: 'AI & Healthcare',
    tags: ['AI', 'Coding', 'Machine Learning', 'Game Development', 'IIIT Hyderabad', 'South India', 'Telangana'],
    poster: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=1200',
    collegeName: 'International Institute of Information Technology Hyderabad (IIITH)',
    venue: 'Felicity Ground & Nilgiri Block, Gachibowli',
    location: {
      address: 'Prof. CR Rao Rd, Gachibowli, Hyderabad, Telangana 500032',
      city: 'Hyderabad',
      lat: 17.4451,
      lng: 78.3489,
      googleMapUrl: 'https://maps.google.com/?q=17.4451,78.3489'
    },
    eventDate: '2026-10-23T10:00:00.000Z',
    startTime: '10:00 AM',
    endTime: '10:00 PM',
    registrationDeadline: '2026-10-18T23:59:59.000Z',
    registrationLink: 'https://felicity.iiit.ac.in',
    contactPerson: {
      name: 'Nikhil Reddy',
      phone: '+91 99890 12345',
      email: 'felicity@iiit.ac.in'
    },
    entryFee: 0,
    prizePool: '₹8,00,000',
    gallery: [],
    status: 'approved',
    featured: true,
    viewsCount: 2890
  },
  {
    _id: 'evt_128',
    title: 'Atmos 2026: BITS Pilani Hyderabad Techno-Management Fest',
    description: 'High-octane Drone Racing League, Quadcopter Autonomous Challenges, Algorithmic Trading Arena, and AI Prompt Engineering Sprints.',
    category: 'Robotics',
    tags: ['Robotics', 'Drones', 'Finance & FinTech', 'AI', 'BITS Pilani', 'South India', 'Hyderabad'],
    poster: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1200',
    collegeName: 'BITS Pilani Hyderabad Campus',
    venue: 'BITS Auditorium & Tech Lawns, Jawaharnagar',
    location: {
      address: 'Jawaharnagar, Kapra Mandal, Hyderabad, Telangana 500078',
      city: 'Hyderabad',
      lat: 17.5449,
      lng: 78.5718,
      googleMapUrl: 'https://maps.google.com/?q=17.5449,78.5718'
    },
    eventDate: '2026-11-06T09:30:00.000Z',
    startTime: '09:30 AM',
    endTime: '09:00 PM',
    registrationDeadline: '2026-10-31T23:59:59.000Z',
    registrationLink: 'https://bits-atmos.org',
    contactPerson: {
      name: 'Pranav Teja',
      phone: '+91 97010 44332',
      email: 'atmos@hyderabad.bits-pilani.ac.in'
    },
    entryFee: 200,
    prizePool: '₹5,00,000',
    gallery: [],
    status: 'approved',
    featured: true,
    viewsCount: 2150
  },
  {
    _id: 'evt_129',
    title: 'Incident 2026: National Beachside Techno-Cultural Extravaganza',
    description: 'NITK Surathkal\'s iconic beachside fest featuring Coastal Hackathons, Battle of the Bands, Fine Arts, and Pro Nights right on the Arabian Sea coast.',
    category: 'Cultural',
    tags: ['Cultural', 'Music & Performing Arts', 'Beachside Fest', 'NITK Surathkal', 'South India', 'Karnataka'],
    poster: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=1200',
    collegeName: 'National Institute of Technology Karnataka (NITK Surathkal)',
    venue: 'NITK Beach Pavilion & Open Air Theatre',
    location: {
      address: 'NH 66, Srinivasnagar, Surathkal, Mangaluru, Karnataka 575025',
      city: 'Mangaluru',
      lat: 13.0108,
      lng: 74.7943,
      googleMapUrl: 'https://maps.google.com/?q=13.0108,74.7943'
    },
    eventDate: '2026-12-05T09:00:00.000Z',
    startTime: '09:00 AM',
    endTime: '11:00 PM',
    registrationDeadline: '2026-11-28T23:59:59.000Z',
    registrationLink: 'https://incident.nitk.ac.in',
    contactPerson: {
      name: 'Suhas Hegde',
      phone: '+91 98451 99001',
      email: 'incident@nitk.edu.in'
    },
    entryFee: 300,
    prizePool: '₹4,50,000',
    gallery: [],
    status: 'approved',
    featured: true,
    viewsCount: 3400
  },
  {
    _id: 'evt_130',
    title: '8th Mile 2026: RVCE Inter-Collegiate Smart Tech Festival',
    description: 'RVCE Bengaluru\'s flagship event focused on Smart City IoT Nodes, EV Battery Prototypes, CleanTech Solutions, and Speed Hackathons.',
    category: 'Hackathon',
    tags: ['Hackathon', 'IoT & Embedded', 'CleanTech', 'RVCE', 'South India', 'Bengaluru'],
    poster: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200',
    collegeName: 'RV College of Engineering (RVCE)',
    venue: 'RVCE Main Auditorium & Tech Park, Mysore Road',
    location: {
      address: 'RV Vidyaniketan Post, Mysore Rd, Bengaluru, Karnataka 560059',
      city: 'Bengaluru',
      lat: 12.9237,
      lng: 77.4987,
      googleMapUrl: 'https://maps.google.com/?q=12.9237,77.4987'
    },
    eventDate: '2026-11-22T09:00:00.000Z',
    startTime: '09:00 AM',
    endTime: '08:00 PM',
    registrationDeadline: '2026-11-16T23:59:59.000Z',
    registrationLink: 'https://8thmile.rvce.edu.in',
    contactPerson: {
      name: 'Ananya Gowda',
      phone: '+91 98441 55443',
      email: '8thmile@rvce.edu.in'
    },
    entryFee: 100,
    prizePool: '₹5,50,000',
    gallery: [],
    status: 'approved',
    featured: false,
    viewsCount: 1820
  },
  {
    _id: 'evt_131',
    title: 'Kuruksastra 2026: National Cultural & Design Festival',
    description: 'SASTRA University\'s grand cultural spectacle bringing together classical music, dance, short film, digital art, and UI/UX design challenges.',
    category: 'Cultural',
    tags: ['Cultural', 'Design', 'UI/UX', 'Music & Performing Arts', 'SASTRA', 'South India', 'Thanjavur'],
    poster: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&q=80&w=1200',
    collegeName: 'SASTRA Deemed University',
    venue: 'SASTRA Campus Auditorium, Thanjavur',
    location: {
      address: 'Tirumalaisamudram, Thanjavur, Tamil Nadu 613401',
      city: 'Thanjavur',
      lat: 10.7303,
      lng: 79.0204,
      googleMapUrl: 'https://maps.google.com/?q=10.7303,79.0204'
    },
    eventDate: '2026-10-04T09:30:00.000Z',
    startTime: '09:30 AM',
    endTime: '08:30 PM',
    registrationDeadline: '2026-09-29T23:59:59.000Z',
    registrationLink: 'https://sastra.edu/kuruksastra',
    contactPerson: {
      name: 'Sundararajan M',
      phone: '+91 94431 88776',
      email: 'kuruksastra@sastra.edu'
    },
    entryFee: 200,
    prizePool: '₹3,50,000',
    gallery: [],
    status: 'approved',
    featured: false,
    viewsCount: 1450
  },
  {
    _id: 'evt_132',
    title: 'Dhwani 2026: Premier Technical & Cultural Carnival',
    description: 'College of Engineering Trivandrum\'s signature fest with Choreonite, Short Film Contest, Algorithmic Coding Marathons, and Pro Nights in Kerala\'s capital.',
    category: 'Cultural',
    tags: ['Cultural', 'Photography & Film', 'Coding', 'CET Trivandrum', 'South India', 'Kerala'],
    poster: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1200',
    collegeName: 'College of Engineering Trivandrum (CET)',
    venue: 'CET Amphitheatre & PG Block, Kulathoor',
    location: {
      address: 'Engineering College P.O., Thiruvananthapuram, Kerala 695016',
      city: 'Thiruvananthapuram',
      lat: 8.5456,
      lng: 76.9061,
      googleMapUrl: 'https://maps.google.com/?q=18.5456,76.9061'
    },
    eventDate: '2026-11-26T09:00:00.000Z',
    startTime: '09:00 AM',
    endTime: '10:00 PM',
    registrationDeadline: '2026-11-20T23:59:59.000Z',
    registrationLink: 'https://dhwani.cet.ac.in',
    contactPerson: {
      name: 'Gokul Das',
      phone: '+91 94950 11223',
      email: 'dhwani@cet.ac.in'
    },
    entryFee: 150,
    prizePool: '₹4,00,000',
    gallery: [],
    status: 'approved',
    featured: true,
    viewsCount: 2280
  }
];

export default api;
