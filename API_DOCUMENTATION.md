# CampusConnect - REST API Documentation

Base URL: `http://localhost:5000/api`

All authenticated endpoints require an `Authorization: Bearer <JWT_TOKEN>` header.

---

## 🔐 1. Authentication Endpoints

### POST `/auth/register`
Creates a new student, organizer, or admin user.
- **Request Body**:
  ```json
  {
    "name": "Aarav Sharma",
    "email": "student@campusconnect.edu",
    "password": "password123",
    "role": "student",
    "college": "NIT Trichy",
    "department": "Computer Science & Engineering",
    "year": "3rd Year",
    "interests": ["AI", "Coding", "Hackathon"],
    "skills": ["React", "Python"]
  }
  ```
- **Response**: `{ "success": true, "token": "JWT...", "user": { ... } }`

### POST `/auth/login`
Authenticates existing users and returns JWT.
- **Request Body**: `{ "email": "student@campusconnect.edu", "password": "password123" }`

### GET `/auth/me`
Retrieves currently logged in user profile (Requires Auth).

---

## 🎯 2. Event Marketplace Endpoints

### GET `/events`
Returns list of approved events with optional search & filter parameters.
- **Query Params**:
  - `category`: Hackathon | Workshop | Symposium | Coding | AI | Robotics | Design
  - `search`: string keyword query
  - `fee`: free | paid
  - `college`: college name filter
  - `featured`: true | false
- **Response**: `{ "success": true, "count": 4, "data": [ ... ] }`

### GET `/events/:id`
Retrieves complete details of single event and increments view count.

### POST `/events`
Creates a new inter-college event (Requires Organizer / Admin role).

---

## 🤖 3. AI Endpoints (Google Gemini API)

### GET `/ai/recommend`
Generates personalized event recommendations using Gemini AI based on user interests, department, skills, and previous activities.
- **Header**: `Authorization: Bearer <JWT_TOKEN>`
- **Response**:
  ```json
  {
    "success": true,
    "count": 3,
    "data": [
      {
        "eventId": "evt_101",
        "score": 96,
        "reason": "You showed interest in Artificial Intelligence and Coding. We recommend HackNova 2026.",
        "event": { ... }
      }
    ]
  }
  ```

### POST `/ai/safety-score`
Computes live AI Travel Safety Score (0-100%) and safety classification based on travel distance, return time, weather, and transport options.
- **Request Body**:
  ```json
  {
    "distanceKm": 45,
    "travelTimeMins": 60,
    "eventEndTime": "08:30 PM",
    "currentTime": "06:00 PM",
    "weather": "Clear sky, 26°C",
    "transportAvailable": true
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "score": 92,
      "status": "Safe",
      "reasons": ["Daytime return expected", "Clear weather", "Public transport available"],
      "advice": "Keep your phone charged and share live location."
    }
  }
  ```

### POST `/ai/accommodations`
Ranks top 3 student accommodations (Hostels, PGs, Hotels) when event distance exceeds configurable threshold (>100km).
- **Request Body**: `{ "eventId": "evt_101", "userBudget": 1500, "distanceKm": 120 }`

---

## 🎟️ 4. Registration & Bookmarks Endpoints

### POST `/registrations/register`
Registers student for an event and generates digital QR pass.
- **Request Body**: `{ "eventId": "evt_101", "teamName": "CyberKnights", "teamMembersCount": 3 }`

### GET `/registrations/my-registrations`
Returns student's active registrations & QR pass tokens.

### POST `/registrations/bookmark/toggle`
Toggles saving an event to student bookmarks.

---

## 🛡️ 5. Admin Endpoints

### GET `/admin/stats`
Returns system metrics: Total Users, Total Events, Pending Approval Queue Count.

### PUT `/admin/events/:id/status`
Approve or Reject event (`status`: "approved" | "rejected").
