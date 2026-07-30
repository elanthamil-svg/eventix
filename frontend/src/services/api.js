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
  }
];

export default api;
