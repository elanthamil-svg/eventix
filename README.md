# CampusConnect 🚀

> **Tagline:** Smart Event Discovery with Student Safety & Accommodation Assistance

CampusConnect is a production-ready, AI-powered web platform designed for college students across India to discover inter-college events (Hackathons, Workshops, Robotics, Coding Contests, Design Summits) while providing real-time travel safety analysis and student accommodation assistance.

---

## ✨ Key Features

### 🎓 For Students
- **Smart Event Discovery**: Search and multi-filter by Category (Hackathon, Workshop, Symposium, Coding, AI, Robotics, Design), Location, Date, College Name, and Entry Fee.
- **AI Event Recommendations**: Powered by Google Gemini 2.5 Flash, recommending personalized events based on student interests, department, skills, and past bookmarks with natural language reasons.
- **AI Travel Safety Score**: Calculates a live 0-100% safety score based on travel distance, travel duration, event conclusion time, weather forecast, and public transport availability.
- **AI Accommodation Assistant**: Automatically triggers when travel distance exceeds configurable threshold (>100 km), ranking top 3 student hostels/PGs/hotels by safety rating, budget, and distance.
- **Digital QR Entry Pass**: Instant registration with downloadable QR ticket passes.

### 📢 For Event Organizers
- **Event Creation Wizard**: Publish events with custom posters, prize pools, venue locations, and registration links.
- **Attendee Roster & Analytics**: Monitor total student views, registered teams, and revenue generated.

### 🛡️ For Admins
- **Moderation Command Center**: Approve or reject pending event submissions, flag fake events, and manage user roles.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS (Glassmorphism design system), Framer Motion, React Router v6, Axios, Lucide Icons.
- **Backend**: Node.js, Express.js (MVC architecture).
- **Database**: MongoDB Atlas, Mongoose Models (`User`, `Event`, `Registration`, `Bookmark`, `Accommodation`, `Notification`).
- **AI Engine**: Google Gemini API (`@google/genai` 2.5 Flash model with intelligent heuristic fallback).
- **Auth**: JWT + Firebase OAuth hybrid with 1-Click Instant Demo Role Switcher.

---

## ⚡ Quick Start & Installation

### 1. Backend Setup
```bash
cd backend
npm install
npm run seed     # Seed database with realistic demo events & users
npm run dev      # Start backend API on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev      # Start Vite dev server on http://localhost:3000
```

---

## 🔑 Environment Variables Setup

Create a `.env` file in both `backend` and `frontend` directories using the provided templates:
- `backend/.env.example`
- `frontend/.env.example`

---

## 📂 Project Structure

```
eventix/
├── backend/
│   ├── config/
│   ├── controllers/      # authController, eventController, aiController, adminController
│   ├── middleware/       # authMiddleware, roleMiddleware
│   ├── models/           # User, Event, Registration, Bookmark, Accommodation, Notification
│   ├── routes/           # Express router endpoints
│   ├── services/         # geminiService, weatherService
│   ├── utils/            # seedData.js
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/   # Navbar, Footer, EventCard, AISafetyScoreCard, AIAccommodationCard
│   │   ├── context/      # AuthContext, ThemeContext
│   │   ├── pages/        # HomePage, EventsPage, EventDetailsPage, Dashboards, AuthPage
│   │   ├── services/     # api.js with mock dataset fallbacks
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── package.json
├── ER_DIAGRAM.md
├── API_DOCUMENTATION.md
├── DEPLOYMENT_GUIDE.md
└── README.md
```
