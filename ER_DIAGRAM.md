# CampusConnect - Database ER Diagram & Schema Specifications

The database for **CampusConnect** is designed using MongoDB & Mongoose schemas to support multi-role authentication (Student, Organizer, Admin), event discovery, AI recommendations, travel safety scores, and accommodation assistance.

## Entity Relationship Diagram (Mermaid)

```mermaid
erDiagram
    USER ||--o{ EVENT : "organizes"
    USER ||--o{ REGISTRATION : "registers for"
    USER ||--o{ BOOKMARK : "saves"
    USER ||--o{ NOTIFICATION : "receives"
    EVENT ||--o{ REGISTRATION : "has attendees"
    EVENT ||--o{ BOOKMARK : "bookmarked in"
    EVENT ||--o{ ACCOMMODATION : "nearby stays"

    USER {
        ObjectId _id PK
        string name
        string email UK
        string password
        string role "student | organizer | admin"
        string college
        string department
        string year
        array interests
        array skills
        string phoneNumber
        object emergencyContact
        string avatar
        date createdAt
    }

    EVENT {
        ObjectId _id PK
        string title
        string description
        string category "Hackathon | Workshop | Symposium | Coding | AI | Robotics | Design"
        array tags
        string poster
        string collegeName
        string venue
        object location
        date eventDate
        string startTime
        string endTime
        date registrationDeadline
        string registrationLink
        object contactPerson
        number entryFee
        string prizePool
        array gallery
        string status "pending | approved | rejected"
        ObjectId organizer FK
        boolean featured
        number viewsCount
    }

    REGISTRATION {
        ObjectId _id PK
        ObjectId student FK
        ObjectId event FK
        string teamName
        number teamMembersCount
        string status "registered | cancelled | attended"
        string qrCodeToken
        date registeredAt
    }

    BOOKMARK {
        ObjectId _id PK
        ObjectId user FK
        ObjectId event FK
        date createdAt
    }

    ACCOMMODATION {
        ObjectId _id PK
        ObjectId event FK
        string name
        string type "Hostel | Hotel | Student PG | Guest House"
        string image
        number pricePerNight
        number rating
        number safetyScore
        number distanceKm
        string address
        array amenities
        string contactPhone
        string mapUrl
    }

    NOTIFICATION {
        ObjectId _id PK
        ObjectId user FK
        string title
        string message
        string type "event_recommendation | safety_alert | registration | general"
        boolean read
        string link
        date createdAt
    }
```

## Schema Highlights & Indexes
1. **User Compound Constraints**: `email` is indexed uniquely.
2. **Registration Unique Index**: `{ student: 1, event: 1 }` prevents double registration for the same event.
3. **Bookmark Unique Index**: `{ user: 1, event: 1 }` ensures clean single-bookmark toggles.
4. **Geospatial & Text Indexing**: `Event` features text index on `title`, `description`, `collegeName`, and `tags` for high-performance searching.
