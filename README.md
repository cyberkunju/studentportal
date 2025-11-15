# Student Portal Management System

A comprehensive web-based management system for educational institutions with role-based access for students, teachers, and administrators.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Access at http://localhost:5173
```

## 📚 Documentation

**Complete documentation is available in the `/docs` folder.**

### Essential Reading
- **[START HERE](./docs/START_HERE.md)** - Your guided entry point
- **[Complete Project Guide](./docs/COMPLETE_PROJECT_GUIDE.md)** - Master guide with 100% understanding
- **[Critical Clarifications](./docs/CRITICAL_CLARIFICATIONS.md)** - ⚠️ MUST READ - Key implementation details
- **[Setup Guide](./docs/setup/SETUP_GUIDE.md)** - Installation instructions

### Quick Links
- [System Architecture](./docs/architecture/SYSTEM_ARCHITECTURE.md)
- [Dual Backend Architecture](./docs/architecture/DUAL_BACKEND_ARCHITECTURE.md)
- [Database Schema](./docs/database/SCHEMA.md)
- [API Documentation](./docs/api/API_OVERVIEW.md)
- [Development Workflow](./docs/DEVELOPMENT_WORKFLOW.md)

## 🎯 Features

### Student Portal
- View marks and grades (GP/CP/GPA/CGPA)
- Check attendance records
- Submit assignments
- Pay fees and download receipts
- View notices and announcements
- Virtual ID card

### Teacher Portal
- Manage student lists
- Mark attendance
- Enter marks and grades
- Create and track assignments
- View student performance

### Admin Portal
- User management (students, teachers)
- Fee structure management
- Payment processing
- Send notifications
- Generate reports

## 🛠️ Tech Stack

### Frontend
- React 18.3.1 + Vite 5.4.2
- TailwindCSS 3.4.1
- React Router DOM 6.26.2
- Axios 1.7.7
- jsPDF 2.5.2

### Backend
- **Dual Architecture**: Node.js/Express + PHP
- MySQL 8.0
- JWT Authentication
- Apache (via XAMPP)

### Development
- Docker & Docker Compose
- XAMPP (local development)
- Git

## 📋 Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- MySQL 8.0
- PHP 8.x (with PDO, cURL, GD extensions)
- Composer (for PHP dependencies)
- Docker (optional)

### PHP Dependencies

The backend requires TCPDF library for PDF generation:

```bash
cd backend
composer install
```

This will install:
- **TCPDF** (tecnickcom/tcpdf) - For generating ID cards, receipts, and performance reports

## 🔧 Setup Options

### Option 1: Docker (Recommended)
```bash
docker-compose up -d
```

### Option 2: Local with XAMPP
```bash
# 1. Install backend dependencies
cd backend
composer install

# 2. Import database
mysql -u root -p studentportal < database/schema.sql

# 3. Start XAMPP (Apache + MySQL)

# 4. Install frontend dependencies
npm install
npm run dev
```

See [Local Setup Guide](./docs/setup/LOCAL_SETUP.md) for detailed instructions.

### Option 3: Frontend Only (Mock Data)
```bash
npm install
npm run dev
```

## 📁 Project Structure

```
studentportal-main/
├── backend/           # PHP API server
├── database/          # SQL schemas and migrations
├── docs/              # Complete documentation
├── public/            # Static assets
├── src/               # React frontend
│   ├── components/    # Reusable components
│   ├── pages/         # Page components
│   ├── services/      # API services
│   └── utils/         # Utility functions
└── docker/            # Docker configuration
```

## 🔐 Default Credentials (Development)

**Student**
- Username: `student1`
- Password: `password123`

**Teacher**
- Username: `teacher1`
- Password: `password123`

**Admin**
- Username: `admin1`
- Password: `password123`

## 🧪 Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📦 Build & Deploy

```bash
# Build frontend
npm run build

# Output in dist/ folder
```

See [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md) for production deployment.

## 🐛 Troubleshooting

See [Troubleshooting Guide](./docs/TROUBLESHOOTING.md) for common issues and solutions.

## 📄 License

[Add your license here]

## 🤝 Support

- Documentation: `/docs` folder
- Issues: [GitHub Issues]
- Contact: [Your contact information]

---

**For complete documentation, start here: [docs/START_HERE.md](./docs/START_HERE.md)**
