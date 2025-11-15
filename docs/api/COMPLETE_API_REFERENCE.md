# Complete API Reference

## Overview

This document provides a comprehensive reference for all API endpoints in the Student Portal Management System.

**Base URL**: `http://localhost:8000/api`

**Authentication**: JWT Bearer token in `Authorization` header

**Response Format**: JSON

---

## Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [Student Endpoints](#student-endpoints)
3. [Teacher Endpoints](#teacher-endpoints)
4. [Admin Endpoints](#admin-endpoints)
5. [Notice Endpoints](#notice-endpoints)
6. [Upload Endpoints](#upload-endpoints)
7. [PDF Download Endpoints](#pdf-download-endpoints)
8. [Session Management Endpoints](#session-management-endpoints)
9. [Reporting Endpoints](#reporting-endpoints)
10. [Error Codes](#error-codes)

---

## Authentication Endpoints

### POST /auth/login.php

Login with username and password.

**Request Body**:
```json
{
  "username": "student1",
  "password": "password123",
  "role": "student"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "user": {
      "id": 1,
      "username": "student1",
      "email": "student1@university.edu",
      "role": "student"
    }
  }
}
```

**Requirements**: 4.1

---

### POST /auth/logout.php

Logout current user (client-side token removal).

**Headers**: `Authorization: Bearer {token}`

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Requirements**: 4.5

---

### POST /auth/verify.php

Verify JWT token validity.

**Headers**: `Authorization: Bearer {token}`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "username": "student1",
    "role": "student"
  }
}
```

**Requirements**: 4.2

---

## Student Endpoints

### GET /student/get_marks.php

Get student marks with GPA/CGPA calculations.

**Headers**: `Authorization: Bearer {token}`

**Query Parameters**:
- `semester` (optional): Filter by semester (1-6)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "marks": [
      {
        "id": 1,
        "subject_code": "BCA501",
        "subject_name": "Computer Networks",
        "credit_hours": 4,
        "internal_marks": 25.00,
        "external_marks": 65.00,
        "total_marks": 90.00,
        "grade_point": 4.00,
        "letter_grade": "A+",
        "credit_points": 16.00
      }
    ],
    "summary": {
      "total_subjects": 6,
      "total_credits": 20,
      "total_credit_points": 72.50,
      "gpa": 3.625,
      "cgpa": 3.54
    }
  }
}
```

**Requirements**: 1.1, 7.1-7.5

---

### GET /student/get_attendance.php

Get student attendance records with percentages.

**Headers**: `Authorization: Bearer {token}`

**Query Parameters**:
- `semester` (optional): Filter by semester

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "subject_code": "BCA501",
      "subject_name": "Computer Networks",
      "total_classes": 45,
      "present_count": 40,
      "absent_count": 5,
      "percentage": 88.89
    }
  ]
}
```

**Requirements**: 1.2

---

### GET /student/get_fees.php

Get applicable fees with late fine calculations.

**Headers**: `Authorization: Bearer {token}`

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "fee_type": "Tuition Fee",
      "fee_name": "Semester 5 Tuition",
      "amount": 25000.00,
      "due_date": "2024-08-15",
      "late_fine_per_day": 100.00,
      "max_late_fine": 5000.00,
      "current_late_fine": 2500.00,
      "payment_status": "pending"
    }
  ]
}
```

**Requirements**: 1.3

---

### GET /student/get_payments.php

Get payment history.

**Headers**: `Authorization: Bearer {token}`

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "receipt_number": "RCP20241114001",
      "fee_type": "Tuition Fee",
      "amount_paid": 25000.00,
      "late_fine": 2500.00,
      "total_amount": 27500.00,
      "payment_date": "2024-11-14",
      "payment_method": "Cash",
      "status": "completed"
    }
  ]
}
```

**Requirements**: 1.4

---

### GET /student/get_profile.php

Get student profile information.

**Headers**: `Authorization: Bearer {token}`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "student_id": "STU2024001",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@university.edu",
    "phone": "1234567890",
    "department": "BCA",
    "semester": 5,
    "enrollment_date": "2022-07-01",
    "profile_image": "/uploads/profiles/student_1.jpg"
  }
}
```

**Requirements**: 1.5

---

## Teacher Endpoints

### POST /teacher/mark_attendance.php

Mark attendance for multiple students.

**Headers**: `Authorization: Bearer {token}`

**Request Body**:
```json
{
  "subject_id": 1,
  "attendance_date": "2024-11-14",
  "attendance": [
    {
      "student_id": 1,
      "status": "present"
    },
    {
      "student_id": 2,
      "status": "absent"
    }
  ]
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Attendance marked successfully",
  "data": {
    "records_created": 2
  }
}
```

**Requirements**: 2.1

---

### POST /teacher/enter_marks.php

Enter marks for a student.

**Headers**: `Authorization: Bearer {token}`

**Request Body**:
```json
{
  "student_id": 1,
  "subject_id": 1,
  "internal_marks": 25,
  "external_marks": 65,
  "semester": 5
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "student_id": 1,
    "subject_id": 1,
    "internal_marks": 25.00,
    "external_marks": 65.00,
    "total_marks": 90.00,
    "grade_point": 4.00,
    "letter_grade": "A+"
  }
}
```

**Requirements**: 2.2, 7.1-7.3

---

### PUT /teacher/update_marks.php

Update existing marks.

**Headers**: `Authorization: Bearer {token}`

**Request Body**:
```json
{
  "marks_id": 1,
  "internal_marks": 28,
  "external_marks": 70
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "internal_marks": 28.00,
    "external_marks": 70.00,
    "total_marks": 98.00,
    "grade_point": 4.00,
    "letter_grade": "A+"
  }
}
```

**Requirements**: 2.4, 7.1-7.3

---

### GET /teacher/get_students.php

Get list of students.

**Headers**: `Authorization: Bearer {token}`

**Query Parameters**:
- `department` (optional): Filter by department
- `semester` (optional): Filter by semester
- `search` (optional): Search by name or student ID

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "student_id": "STU2024001",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@university.edu",
      "department": "BCA",
      "semester": 5
    }
  ]
}
```

**Requirements**: 2.3

---

### GET /teacher/get_attendance_report.php

Get attendance statistics.

**Headers**: `Authorization: Bearer {token}`

**Query Parameters**:
- `subject_id` (required): Subject ID
- `start_date` (optional): Start date (YYYY-MM-DD)
- `end_date` (optional): End date (YYYY-MM-DD)

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "student_id": "STU2024001",
      "student_name": "John Doe",
      "total_classes": 45,
      "present_count": 40,
      "absent_count": 5,
      "percentage": 88.89
    }
  ]
}
```

**Requirements**: 2.5, 10.1

---

## Admin Endpoints

### Student Management

#### POST /admin/students/create.php

Create a new student.

**Headers**: `Authorization: Bearer {token}`

**Request Body**:
```json
{
  "username": "student123",
  "password": "password123",
  "email": "student123@university.edu",
  "first_name": "John",
  "last_name": "Doe",
  "date_of_birth": "2005-05-15",
  "gender": "male",
  "phone": "1234567890",
  "address": "123 Main St",
  "enrollment_date": "2024-07-01",
  "semester": 1,
  "department": "BCA",
  "program": "Bachelor of Computer Applications",
  "batch_year": 2024,
  "guardian_name": "Jane Doe",
  "guardian_phone": "0987654321",
  "guardian_email": "jane.doe@email.com"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "student_id": "STU2024001",
    "username": "student123",
    "email": "student123@university.edu"
  }
}
```

**Requirements**: 3.1, 6.1-6.5

---

#### PUT /admin/students/update.php

Update student information.

**Headers**: `Authorization: Bearer {token}`

**Request Body**:
```json
{
  "student_id": 1,
  "email": "newemail@university.edu",
  "phone": "9876543210",
  "semester": 2
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "student_id": "STU2024001",
    "email": "newemail@university.edu",
    "phone": "9876543210",
    "semester": 2
  }
}
```

**Requirements**: 3.1, 6.1-6.5

---

#### DELETE /admin/students/delete.php

Delete a student.

**Headers**: `Authorization: Bearer {token}`

**Request Body**:
```json
{
  "student_id": 1
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Student deleted successfully"
}
```

**Requirements**: 3.1

---

#### GET /admin/students/list.php

List all students with pagination.

**Headers**: `Authorization: Bearer {token}`

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search term
- `department` (optional): Filter by department
- `semester` (optional): Filter by semester

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "student_id": "STU2024001",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@university.edu",
      "department": "BCA",
      "semester": 5
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "pages": 8
  }
}
```

**Requirements**: 3.1

---

### Teacher Management

Similar endpoints for teachers:
- `POST /admin/teachers/create.php`
- `PUT /admin/teachers/update.php`
- `DELETE /admin/teachers/delete.php`
- `GET /admin/teachers/list.php`

**Requirements**: 3.2

---

### Fee Management

#### POST /admin/fees/create.php

Create a new fee structure.

**Headers**: `Authorization: Bearer {token}`

**Request Body**:
```json
{
  "fee_type": "Tuition Fee",
  "fee_name": "Semester 5 Tuition",
  "amount": 25000.00,
  "due_date": "2024-08-15",
  "late_fine_per_day": 100.00,
  "max_late_fine": 5000.00,
  "semester": 5,
  "department": "BCA",
  "description": "Tuition fee for semester 5"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "fee_type": "Tuition Fee",
    "amount": 25000.00,
    "due_date": "2024-08-15"
  }
}
```

**Requirements**: 3.3

---

#### POST /admin/payments/process.php

Process a payment.

**Headers**: `Authorization: Bearer {token}`

**Request Body**:
```json
{
  "student_id": 1,
  "fee_id": 1,
  "amount_paid": 25000.00,
  "payment_method": "Cash",
  "transaction_id": "TXN123456"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "receipt_number": "RCP20241114001",
    "amount_paid": 25000.00,
    "late_fine": 2500.00,
    "total_amount": 27500.00,
    "payment_date": "2024-11-14"
  }
}
```

**Requirements**: 3.4

---

### Subject Management

Similar endpoints for subjects:
- `POST /admin/subjects/create.php`
- `PUT /admin/subjects/update.php`
- `DELETE /admin/subjects/delete.php`
- `GET /admin/subjects/list.php`

**Requirements**: 3.5

---

### Notice Management

#### POST /admin/notices/create.php

Create a new notice.

**Headers**: `Authorization: Bearer {token}`

**Request Body**:
```json
{
  "title": "Holiday Notice",
  "content": "University will be closed on...",
  "target_role": "all",
  "expiry_date": "2024-12-31"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Holiday Notice",
    "created_at": "2024-11-14 10:00:00"
  }
}
```

**Requirements**: 8.1

---

## Notice Endpoints

### GET /notices/get_all.php

Get all active notices for current user's role.

**Headers**: `Authorization: Bearer {token}`

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Holiday Notice",
      "content": "University will be closed on...",
      "target_role": "all",
      "created_at": "2024-11-14 10:00:00",
      "expiry_date": "2024-12-31"
    }
  ]
}
```

**Requirements**: 8.2

---

## Upload Endpoints

### POST /upload/upload_image.php

Upload a profile image.

**Headers**: 
- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data`

**Request Body** (FormData):
```
image: [File]
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "file_path": "/uploads/profiles/1731582000_abc123.jpg"
  }
}
```

**Requirements**: 5.1-5.5

---

## PDF Download Endpoints

### GET /student/download_id_card.php

Download student ID card as PDF.

**Headers**: `Authorization: Bearer {token}`

**Response**: PDF file (application/pdf)

**Requirements**: 11.1-11.5, 14.1-14.5

---

### GET /student/download_receipt.php

Download payment receipt as PDF.

**Headers**: `Authorization: Bearer {token}`

**Query Parameters**:
- `payment_id` (required): Payment ID

**Response**: PDF file (application/pdf)

**Requirements**: 12.1-12.5, 14.1-14.5

---

### GET /student/download_performance_report.php

Download academic performance report as PDF.

**Headers**: `Authorization: Bearer {token}`

**Query Parameters**:
- `semester` (optional): Filter by semester

**Response**: PDF file (application/pdf)

**Requirements**: 13.1-13.5, 14.1-14.5

---

## Session Management Endpoints

### POST /admin/sessions/create.php

Create a new academic session.

**Headers**: `Authorization: Bearer {token}`

**Request Body**:
```json
{
  "session_name": "2024-2025",
  "start_year": 2024,
  "end_year": 2025,
  "start_date": "2024-07-01",
  "end_date": "2025-06-30"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "session_name": "2024-2025",
    "is_active": false
  }
}
```

**Requirements**: 9.1

---

### POST /admin/sessions/activate.php

Activate an academic session.

**Headers**: `Authorization: Bearer {token}`

**Request Body**:
```json
{
  "session_id": 1
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Session activated successfully"
}
```

**Requirements**: 9.2

---

### GET /admin/sessions/list.php

List all academic sessions.

**Headers**: `Authorization: Bearer {token}`

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "session_name": "2024-2025",
      "start_year": 2024,
      "end_year": 2025,
      "is_active": true
    }
  ]
}
```

**Requirements**: 9.3

---

### POST /admin/semesters/create.php

Create a semester within a session.

**Headers**: `Authorization: Bearer {token}`

**Request Body**:
```json
{
  "session_id": 1,
  "semester_number": 1,
  "start_date": "2024-07-01",
  "end_date": "2024-12-31"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "session_id": 1,
    "semester_number": 1
  }
}
```

**Requirements**: 9.4, 9.5

---

## Reporting Endpoints

### GET /admin/reports/performance.php

Get performance statistics.

**Headers**: `Authorization: Bearer {token}`

**Query Parameters**:
- `department` (optional): Filter by department
- `semester` (optional): Filter by semester
- `subject_id` (optional): Filter by subject

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "department": "BCA",
    "semester": 5,
    "total_students": 45,
    "average_gpa": 3.42,
    "pass_percentage": 88.89,
    "subject_averages": [
      {
        "subject_code": "BCA501",
        "subject_name": "Computer Networks",
        "average_marks": 78.5,
        "average_gpa": 3.25
      }
    ]
  }
}
```

**Requirements**: 10.2

---

### GET /admin/reports/financial.php

Get financial statistics.

**Headers**: `Authorization: Bearer {token}`

**Query Parameters**:
- `start_date` (optional): Start date (YYYY-MM-DD)
- `end_date` (optional): End date (YYYY-MM-DD)
- `department` (optional): Filter by department

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "period": {
      "start_date": "2024-07-01",
      "end_date": "2024-11-14"
    },
    "total_collected": 1250000.00,
    "total_pending": 350000.00,
    "total_late_fines": 15000.00,
    "payment_breakdown": [
      {
        "fee_type": "Tuition Fee",
        "collected": 800000.00,
        "pending": 200000.00
      }
    ]
  }
}
```

**Requirements**: 10.4

---

### GET /admin/reports/trends.php

Get trend analytics.

**Headers**: `Authorization: Bearer {token}`

**Query Parameters**:
- `metric` (required): Metric type (attendance, performance, payments)
- `period` (required): Period type (monthly, semester)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "metric": "attendance",
    "period": "monthly",
    "trends": [
      {
        "period": "2024-08",
        "value": 85.5,
        "change": 2.3
      },
      {
        "period": "2024-09",
        "value": 87.8,
        "change": 2.3
      }
    ]
  }
}
```

**Requirements**: 10.5

---

## Error Codes

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input or validation error |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate resource (e.g., username exists) |
| 500 | Internal Server Error | Server or database error |

### Error Response Format

```json
{
  "success": false,
  "error": "error_code",
  "message": "Human-readable error message",
  "details": {}
}
```

### Common Error Codes

| Error Code | Description |
|------------|-------------|
| `invalid_credentials` | Username or password incorrect |
| `token_expired` | JWT token has expired |
| `token_invalid` | JWT token is malformed or invalid |
| `unauthorized` | No authentication token provided |
| `forbidden` | User doesn't have required role |
| `not_found` | Requested resource doesn't exist |
| `validation_error` | Input validation failed |
| `duplicate_entry` | Resource already exists |
| `database_error` | Database operation failed |

---

## Rate Limiting

Currently, no rate limiting is implemented. For production, consider:

- 100 requests per minute per IP
- 1000 requests per hour per user
- Stricter limits for login attempts (5 per minute)

---

## Versioning

Current API version: **v1**

Future versions will be accessible via:
- `/api/v2/...`

---

## Support

For API issues or questions:

1. Check this documentation
2. Review error messages
3. Check server logs
4. Contact development team

---

## Changelog

### Version 1.0 (2024-11-14)

- Initial API release
- All endpoints implemented
- JWT authentication
- PDF generation
- Session management
- Reporting and analytics

