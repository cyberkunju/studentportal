---
inclusion: always
---

# Project Structure

## Root Organization

```
studentportal-main/
├── backend/              # PHP API server
├── database/             # SQL schemas and migrations
├── docs/                 # Complete documentation
├── docker/               # Docker configuration
├── public/               # Static assets
├── src/                  # React frontend source
├── node_modules/         # NPM dependencies
└── [config files]        # Build and tool configs
```

## Frontend Structure (`src/`)

```
src/
├── components/           # Reusable UI components
│   ├── Navbar.jsx       # Top navigation bar
│   ├── Sidebar.jsx      # Side navigation menu
│   ├── GlassCard.jsx    # Glassmorphism card component
│   └── [other components]
├── pages/               # Page-level components
│   ├── Login.jsx        # Login page
│   ├── Dashboard.jsx    # Student dashboard
│   ├── admin/           # Admin portal pages
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminStudents.jsx
│   │   ├── AdminTeachers.jsx
│   │   └── [other admin pages]
│   └── [teacher pages]
├── services/            # API and business logic
│   └── api.js          # Axios instance, API calls, auth helpers
├── utils/              # Utility functions
│   └── gradeCalculator.js  # GP/CP/GPA/CGPA calculations
├── App.jsx             # Main app component with routing
├── main.jsx            # React entry point
└── index.css           # Global styles (Tailwind imports)
```

## Backend Structure (`backend/`)

```
backend/
├── api/                 # REST API endpoints
│   ├── auth/           # Authentication (login, logout, verify)
│   ├── student/        # Student endpoints (marks, attendance, fees, payments, profile)
│   ├── teacher/        # Teacher endpoints (attendance, marks, students)
│   ├── admin/          # Admin endpoints
│   │   ├── students/   # Student CRUD
│   │   ├── teachers/   # Teacher CRUD
│   │   ├── fees/       # Fee management
│   │   ├── payments/   # Payment processing
│   │   ├── subjects/   # Subject management
│   │   └── notices/    # Notice management
│   ├── notices/        # Public notice endpoints
│   └── upload/         # File upload handlers
├── config/             # Configuration files
│   ├── database.php    # PDO database connection
│   └── jwt.php         # JWT token helpers
├── includes/           # Helper functions
│   ├── auth.php        # Authentication middleware
│   ├── cors.php        # CORS headers
│   ├── validation.php  # Input validation functions
│   ├── grade_calculator.php  # Grade calculation logic
│   └── functions.php   # Utility functions
├── uploads/            # File storage (local filesystem)
│   ├── assignments/
│   ├── profiles/
│   └── receipts/
├── logs/               # Error and access logs
└── index.php           # API entry point
```

## Database Structure (`database/`)

```
database/
├── schema.sql          # Complete database schema (11 tables)
├── migrations/         # Database migration scripts
└── seeds/              # Test data (9 seed files, run in order)
    ├── 01_sessions.sql
    ├── 02_admin.sql
    ├── 03_teachers.sql
    └── [other seed files]
```

## Documentation Structure (`docs/`)

```
docs/
├── START_HERE.md                    # Entry point for all documentation
├── COMPLETE_PROJECT_GUIDE.md        # Comprehensive project overview
├── CRITICAL_CLARIFICATIONS.md       # Important implementation details
├── DEVELOPMENT_WORKFLOW.md          # Development process guide
├── architecture/                    # System architecture docs
│   ├── DUAL_BACKEND_ARCHITECTURE.md # Node.js + PHP explanation
│   ├── SYSTEM_ARCHITECTURE.md
│   ├── FRONTEND_ARCHITECTURE.md
│   └── BACKEND_ARCHITECTURE.md
├── api/                            # API documentation
│   ├── API_OVERVIEW.md
│   ├── AUTH_ENDPOINTS.md
│   ├── STUDENT_ENDPOINTS.md
│   ├── TEACHER_ENDPOINTS.md
│   └── ADMIN_ENDPOINTS.md
├── database/                       # Database documentation
│   └── SCHEMA.md
├── features/                       # Feature-specific docs
│   ├── GRADE_CALCULATION.md
│   ├── FEE_MANAGEMENT.md
│   └── [other features]
└── setup/                          # Setup guides
    ├── SETUP_GUIDE.md
    ├── DOCKER_SETUP.md
    └── LOCAL_SETUP.md
```

## Key Conventions

### File Naming
- **React Components**: PascalCase (e.g., `StudentDashboard.jsx`)
- **PHP Files**: snake_case (e.g., `get_marks.php`)
- **Utilities**: camelCase (e.g., `gradeCalculator.js`)
- **Documentation**: SCREAMING_SNAKE_CASE (e.g., `SETUP_GUIDE.md`)

### Component Organization
- One component per file
- Co-locate related components in subdirectories
- Separate page components from reusable components

### API Endpoint Structure
- RESTful conventions
- Grouped by role/resource
- Consistent response format: `{ success: boolean, data: any, error?: string }`

### Database Tables
- Singular names (e.g., `users`, not `user`)
- Foreign keys: `{table}_id` (e.g., `user_id`)
- Timestamps: `created_at`, `updated_at`
- Soft deletes: `is_active` boolean flag

### Routing Patterns
- Student routes: `/dashboard`, `/subjects`, `/result`, etc.
- Teacher routes: `/teacher/dashboard`, `/teacher/attendance`, etc.
- Admin routes: `/admin/dashboard`, `/admin/students`, etc.
