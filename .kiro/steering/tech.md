---
inclusion: always
---

# Technology Stack

## Frontend

- **Framework**: React 19.0.0
- **Build Tool**: Vite 6.0.7
- **Routing**: React Router DOM 7.9.4
- **Styling**: TailwindCSS 3.4.17 with custom glassmorphism design
- **Animations**: Motion 11.15.0 (Framer Motion)
- **PDF Generation**: jsPDF 3.0.3, html2canvas 1.4.1
- **HTTP Client**: Axios (via services/api.js)
- **UI Library**: liquid-glass-react 1.1.1

## Backend (Dual Architecture)

### Node.js Server
- **Purpose**: Serves React frontend, handles WebSocket connections (future)
- **Port**: 5173 (development)
- **Role**: Frontend serving, real-time updates

### PHP Server
- **Purpose**: Complete REST API backend
- **Port**: 8000 (or 80 via XAMPP)
- **Role**: Authentication, database operations, file uploads, business logic
- **Authentication**: JWT tokens (stateless, NOT sessions)

## Database

- **RDBMS**: MySQL 8.0
- **Character Set**: utf8mb4
- **Collation**: utf8mb4_unicode_ci
- **Tables**: 11 core tables (users, students, teachers, admins, subjects, marks, attendance, fees, payments, sessions, semesters)

## Development Tools

- **Containerization**: Docker & Docker Compose
- **Local Development**: XAMPP (Apache + MySQL + PHP)
- **Code Quality**: ESLint, Prettier
- **Version Control**: Git

## Common Commands

### Development
```bash
# Install dependencies
npm install

# Start frontend dev server (Vite)
npm run dev

# Start PHP backend (if not using XAMPP)
cd backend && php -S localhost:8000

# Start with Docker
docker-compose up -d
```

### Build & Deploy
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Database
```bash
# Import schema
mysql -u root -p studentportal < database/schema.sql

# Import seed data (in order)
mysql -u root -p studentportal < database/seeds/01_sessions.sql
mysql -u root -p studentportal < database/seeds/02_admin.sql
# ... continue with remaining seed files
```

## File Storage

- **Location**: Local file system (NOT cloud storage)
- **Paths**: 
  - Assignments: `/backend/uploads/assignments/`
  - Profiles: `/backend/uploads/profiles/`
  - Receipts: `/backend/uploads/receipts/`
- **Database**: Stores file paths only

## API Communication

- **Format**: JSON
- **Auth**: JWT Bearer tokens in Authorization header
- **CORS**: Enabled for localhost:5173
- **Base URL**: `http://localhost:8000/api`

## Environment Variables

Key variables in `.env`:
- `VITE_API_URL`: Backend API URL
- Database credentials in `backend/config/database.php`
