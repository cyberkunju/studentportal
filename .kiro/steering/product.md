---
inclusion: always
---

# Product Overview

## Student Portal Management System

A comprehensive web-based management system for educational institutions with role-based access for students, teachers, and administrators.

## Core Purpose

Streamline academic administration, improve communication between stakeholders, and provide 24/7 access to academic information including marks, attendance, fees, and notices.

## User Roles

- **Students**: View marks/grades (GP/CP/GPA/CGPA), check attendance, pay fees, download receipts, view notices, access virtual ID card
- **Teachers**: Manage student lists, mark attendance, enter/update marks, create assignments, view student performance
- **Admins**: User management, fee structure management, payment processing, send notifications, generate reports

## Key Features

- Real-time grade calculations (GP/CP/GPA/CGPA)
- Three-tier fee deadline system with automatic fine calculation
- PDF receipt generation
- Glassmorphism UI with dark mode
- Role-based access control with JWT authentication
- Responsive design (desktop, tablet, mobile)

## Important Constraints

- Mock payment system (no real payment gateway integration)
- Admin-only password reset (no email-based reset)
- Single super admin account
- 6 semesters (3 years) academic structure
- Marks locked after semester completion
- Polling for updates (WebSockets planned for future)
