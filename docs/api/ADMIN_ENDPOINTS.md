# Admin API Endpoints

Complete documentation for administrator endpoints in the Student Portal API.

## Base URL

```
http://localhost:8000/api/admin
```

## Authentication

All admin endpoints require:
- Valid JWT token in Authorization header
- User role must be 'admin'

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## Student Management

### Create Student

Create a new student account with user credentials.

**Endpoint**: `POST /admin/students/create.php`

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
    "id": 15,
    "user_id": 25,
    "student_id": "STU2024015",
    "first_name": "John",
    "last_name": "Doe",
    "email": "student123@university.edu",
    "department": "BCA",
    "semester": 1
  },
  "message": "Student created successfully"
}
```

**Error Responses**:
- `400`: Validation error (missing fields, invalid format)
- `409`: Username or email already exists
- `500`: Database error

---

### Update Student

Update existing student information.

**Endpoint**: `PUT /admin/students/update.php`

**Request Body**:
```json
{
  "student_id": 15,
  "email": "newemail@university.edu",
  "phone": "9876543210",
  "address": "456 New Street",
  "semester": 2,
  "guardian_phone": "1234567890"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 15,
    "student_id": "STU2024015",
    "first_name": "John",
    "last_name": "Doe",
    "email": "newemail@university.edu",
    "semester": 2
  },
  "message": "Student updated successfully"
}
```

---

### Delete Student

Delete a student account (soft delete).

**Endpoint**: `DELETE /admin/students/delete.php`

**Request Body**:
```json
{
  "student_id": 15
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Student deleted successfully"
}
```

---

### List Students

Get paginated list of students with filters.

**Endpoint**: `GET /admin/students/list.php`

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search by name, student_id, or email
- `department` (optional): Filter by department
- `semester` (optional): Filter by semester
- `status` (optional): Filter by status (active/inactive)

**Example**: `GET /admin/students/list.php?page=1&limit=20&department=BCA&semester=3`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "students": [
      {
        "id": 1,
        "student_id": "STU2024001",
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@university.edu",
        "department": "BCA",
        "semester": 3,
        "phone": "1234567890",
        "enrollment_date": "2024-07-01"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 95,
      "items_per_page": 20
    }
  }
}
```

---

## Teacher Management

### Create Teacher

Create a new teacher account.

**Endpoint**: `POST /admin/teachers/create.php`

**Request Body**:
```json
{
  "username": "teacher5",
  "password": "password123",
  "email": "teacher5@university.edu",
  "first_name": "Jane",
  "last_name": "Smith",
  "date_of_birth": "1985-03-20",
  "gender": "female",
  "phone": "5551234567",
  "address": "789 Faculty Lane",
  "department": "BCA",
  "qualification": "M.Tech Computer Science",
  "specialization": "Database Systems",
  "joining_date": "2020-08-01"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": 5,
    "user_id": 30,
    "teacher_id": "TCH2024005",
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "teacher5@university.edu",
    "department": "BCA"
  },
  "message": "Teacher created successfully"
}
```

---

### Update Teacher

Update teacher information.

**Endpoint**: `PUT /admin/teachers/update.php`

**Request Body**:
```json
{
  "teacher_id": 5,
  "email": "jane.smith@university.edu",
  "phone": "5559876543",
  "department": "BBA",
  "specialization": "Management Information Systems"
}
```

---

### Delete Teacher

Delete a teacher account.

**Endpoint**: `DELETE /admin/teachers/delete.php`

**Request Body**:
```json
{
  "teacher_id": 5
}
```

---

### List Teachers

Get paginated list of teachers.

**Endpoint**: `GET /admin/teachers/list.php`

**Query Parameters**:
- `page`, `limit`, `search`, `department`

**Response**: Similar structure to student list

---

## Fee Management

### Create Fee

Create a new fee structure.

**Endpoint**: `POST /admin/fees/create.php`

**Request Body**:
```json
{
  "fee_type": "Tuition Fee",
  "fee_name": "Semester 5 Tuition",
  "amount": 25000.00,
  "due_date": "2024-12-31",
  "semester": 5,
  "department": "BCA",
  "session_id": 1,
  "late_fine_per_day": 100.00,
  "max_late_fine": 5000.00,
  "description": "Tuition fee for semester 5"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": 10,
    "fee_type": "Tuition Fee",
    "fee_name": "Semester 5 Tuition",
    "amount": 25000.00,
    "due_date": "2024-12-31",
    "semester": 5,
    "department": "BCA"
  },
  "message": "Fee created successfully"
}
```

---

### Update Fee

Update fee structure.

**Endpoint**: `PUT /admin/fees/update.php`

**Request Body**:
```json
{
  "fee_id": 10,
  "amount": 26000.00,
  "due_date": "2025-01-15",
  "late_fine_per_day": 150.00
}
```

---

### Delete Fee

Soft delete a fee (sets is_active to false).

**Endpoint**: `DELETE /admin/fees/delete.php`

**Request Body**:
```json
{
  "fee_id": 10
}
```

---

### List Fees

Get list of fees with filters.

**Endpoint**: `GET /admin/fees/list.php`

**Query Parameters**:
- `semester` (optional): Filter by semester
- `department` (optional): Filter by department
- `session_id` (optional): Filter by session
- `fee_type` (optional): Filter by fee type

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "fees": [
      {
        "id": 1,
        "fee_type": "Tuition Fee",
        "fee_name": "Semester 5 Tuition",
        "amount": 25000.00,
        "due_date": "2024-12-31",
        "semester": 5,
        "department": "BCA",
        "late_fine_per_day": 100.00,
        "max_late_fine": 5000.00
      }
    ]
  }
}
```

---

## Payment Processing

### Process Payment

Record a fee payment for a student.

**Endpoint**: `POST /admin/payments/process.php`

**Request Body**:
```json
{
  "student_id": 1,
  "fee_id": 5,
  "amount_paid": 25000.00,
  "payment_method": "cash",
  "transaction_id": "TXN123456",
  "payment_date": "2024-11-14"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": 25,
    "receipt_number": "RCP20241114025",
    "student_id": 1,
    "fee_id": 5,
    "amount_paid": 25000.00,
    "late_fine": 500.00,
    "total_amount": 25500.00,
    "payment_method": "cash",
    "payment_date": "2024-11-14",
    "status": "completed"
  },
  "message": "Payment processed successfully"
}
```

---

### List Payments

Get payment history with filters.

**Endpoint**: `GET /admin/payments/list.php`

**Query Parameters**:
- `student_id` (optional): Filter by student
- `start_date` (optional): Filter from date
- `end_date` (optional): Filter to date
- `status` (optional): Filter by status
- `page`, `limit`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": 25,
        "receipt_number": "RCP20241114025",
        "student_name": "John Doe",
        "student_id": "STU2024001",
        "fee_name": "Semester 5 Tuition",
        "amount_paid": 25000.00,
        "late_fine": 500.00,
        "total_amount": 25500.00,
        "payment_date": "2024-11-14",
        "payment_method": "cash",
        "status": "completed"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_items": 55
    }
  }
}
```

---

## Subject Management

### Create Subject

Create a new subject.

**Endpoint**: `POST /admin/subjects/create.php`

**Request Body**:
```json
{
  "subject_code": "BCA501",
  "subject_name": "Computer Networks",
  "credit_hours": 4,
  "semester": 5,
  "department": "BCA",
  "description": "Introduction to computer networking concepts"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": 15,
    "subject_code": "BCA501",
    "subject_name": "Computer Networks",
    "credit_hours": 4,
    "semester": 5,
    "department": "BCA"
  },
  "message": "Subject created successfully"
}
```

---

### Update Subject

Update subject information.

**Endpoint**: `PUT /admin/subjects/update.php`

---

### Delete Subject

Soft delete a subject.

**Endpoint**: `DELETE /admin/subjects/delete.php`

---

### List Subjects

Get list of subjects.

**Endpoint**: `GET /admin/subjects/list.php`

**Query Parameters**:
- `semester` (optional)
- `department` (optional)

---

## Notice Management

### Create Notice

Create a new notice/announcement.

**Endpoint**: `POST /admin/notices/create.php`

**Request Body**:
```json
{
  "title": "Semester Exam Schedule",
  "content": "The semester 5 exams will begin from December 15, 2024.",
  "target_role": "student",
  "expiry_date": "2024-12-20",
  "priority": "high"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": 10,
    "title": "Semester Exam Schedule",
    "content": "The semester 5 exams will begin from December 15, 2024.",
    "target_role": "student",
    "expiry_date": "2024-12-20",
    "priority": "high",
    "created_at": "2024-11-14 10:30:00"
  },
  "message": "Notice created successfully"
}
```

---

### Update Notice

Update an existing notice.

**Endpoint**: `PUT /admin/notices/update.php`

---

### Delete Notice

Soft delete a notice.

**Endpoint**: `DELETE /admin/notices/delete.php`

---

## Session Management

### Create Session

Create a new academic session.

**Endpoint**: `POST /admin/sessions/create.php`

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
    "id": 2,
    "session_name": "2024-2025",
    "start_year": 2024,
    "end_year": 2025,
    "start_date": "2024-07-01",
    "end_date": "2025-06-30",
    "is_active": false,
    "created_at": "2024-11-14 10:00:00"
  },
  "message": "Session created successfully"
}
```

**Validation Rules**:
- `start_date` must be before `end_date`
- `start_year` and `end_year` must match the dates
- Session name should be unique

---

### Activate Session

Set a session as active (deactivates all others).

**Endpoint**: `PUT /admin/sessions/activate.php`

**Request Body**:
```json
{
  "session_id": 2
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Session activated successfully"
}
```

**Note**: This operation:
1. Sets `is_active = false` for all sessions
2. Sets `is_active = true` for the specified session
3. Uses database transaction for atomicity

---

### List Sessions

Get all academic sessions.

**Endpoint**: `GET /admin/sessions/list.php`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": 2,
        "session_name": "2024-2025",
        "start_year": 2024,
        "end_year": 2025,
        "start_date": "2024-07-01",
        "end_date": "2025-06-30",
        "is_active": true,
        "created_at": "2024-11-14 10:00:00"
      },
      {
        "id": 1,
        "session_name": "2023-2024",
        "start_year": 2023,
        "end_year": 2024,
        "start_date": "2023-07-01",
        "end_date": "2024-06-30",
        "is_active": false,
        "created_at": "2023-06-01 09:00:00"
      }
    ]
  }
}
```

---

## Semester Management

### Create Semester

Create a semester within a session.

**Endpoint**: `POST /admin/semesters/create.php`

**Request Body**:
```json
{
  "session_id": 2,
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
    "id": 5,
    "session_id": 2,
    "semester_number": 1,
    "start_date": "2024-07-01",
    "end_date": "2024-12-31",
    "created_at": "2024-11-14 10:15:00"
  },
  "message": "Semester created successfully"
}
```

**Validation Rules**:
- `semester_number` must be between 1 and 6
- `start_date` must be before `end_date`
- Dates must fall within parent session dates
- Semester number must be unique within session

---

## Reporting and Analytics

### Performance Report

Generate academic performance statistics.

**Endpoint**: `GET /admin/reports/performance.php`

**Query Parameters**:
- `semester` (optional): Filter by semester
- `department` (optional): Filter by department
- `subject_id` (optional): Filter by subject
- `session_id` (optional): Filter by session (defaults to active)

**Example**: `GET /admin/reports/performance.php?semester=5&department=BCA`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "filters": {
      "semester": 5,
      "department": "BCA",
      "session": "2024-2025"
    },
    "summary": {
      "total_students": 45,
      "average_gpa": 3.42,
      "pass_percentage": 88.89,
      "total_subjects": 6
    },
    "subject_stats": [
      {
        "subject_code": "BCA501",
        "subject_name": "Computer Networks",
        "average_marks": 78.5,
        "average_gpa": 3.25,
        "pass_rate": 91.11,
        "total_students": 45
      }
    ],
    "department_stats": [
      {
        "department": "BCA",
        "average_gpa": 3.42,
        "pass_percentage": 88.89,
        "total_students": 45
      }
    ]
  }
}
```

---

### Financial Report

Generate financial statistics for fees and payments.

**Endpoint**: `GET /admin/reports/financial.php`

**Query Parameters**:
- `start_date` (required): Start date (YYYY-MM-DD)
- `end_date` (required): End date (YYYY-MM-DD)
- `department` (optional): Filter by department
- `fee_type` (optional): Filter by fee type

**Example**: `GET /admin/reports/financial.php?start_date=2024-07-01&end_date=2024-11-14&department=BCA`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "period": {
      "start_date": "2024-07-01",
      "end_date": "2024-11-14"
    },
    "summary": {
      "total_collected": 1250000.00,
      "total_pending": 350000.00,
      "total_late_fines": 15000.00,
      "collection_rate": 78.13
    },
    "fee_breakdown": [
      {
        "fee_type": "Tuition Fee",
        "total_due": 1000000.00,
        "collected": 800000.00,
        "pending": 200000.00,
        "late_fines": 10000.00,
        "collection_rate": 80.00
      },
      {
        "fee_type": "Exam Fee",
        "total_due": 600000.00,
        "collected": 450000.00,
        "pending": 150000.00,
        "late_fines": 5000.00,
        "collection_rate": 75.00
      }
    ],
    "timeline": [
      {
        "date": "2024-07-01",
        "collected": 50000.00,
        "count": 10
      }
    ]
  }
}
```

---

### Trends Report

Generate trend analytics for various metrics.

**Endpoint**: `GET /admin/reports/trends.php`

**Query Parameters**:
- `metric` (required): Metric type (attendance | performance | payments)
- `period` (required): Period type (monthly | semester)
- `department` (optional): Filter by department
- `start_date` (optional): Custom start date
- `end_date` (optional): Custom end date

**Example**: `GET /admin/reports/trends.php?metric=performance&period=semester&department=BCA`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "metric": "performance",
    "period": "semester",
    "trends": [
      {
        "period_label": "Semester 3",
        "value": 3.25,
        "date_range": "2024-01-01 to 2024-06-30"
      },
      {
        "period_label": "Semester 4",
        "value": 3.35,
        "date_range": "2024-07-01 to 2024-12-31"
      },
      {
        "period_label": "Semester 5",
        "value": 3.42,
        "date_range": "2025-01-01 to 2025-06-30"
      }
    ],
    "percentage_changes": [
      {
        "from_period": "Semester 3",
        "to_period": "Semester 4",
        "change_percent": 3.08,
        "direction": "increase"
      },
      {
        "from_period": "Semester 4",
        "to_period": "Semester 5",
        "change_percent": 2.09,
        "direction": "increase"
      }
    ],
    "insights": [
      "Performance improved by 3.08% from Semester 3 to Semester 4",
      "Consistent upward trend in academic performance",
      "Current semester showing highest average GPA"
    ]
  }
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `validation_error` | Input validation failed |
| `unauthorized` | Not authenticated |
| `forbidden` | Insufficient permissions |
| `not_found` | Resource not found |
| `duplicate_entry` | Unique constraint violation |
| `database_error` | Database operation failed |
| `server_error` | Internal server error |

---

## Rate Limiting

**Current Status**: Not implemented

**Recommended Limits**:
- 100 requests per minute per IP
- 1000 requests per hour per admin user

---

**Document Version**: 2.0  
**Last Updated**: November 15, 2025
