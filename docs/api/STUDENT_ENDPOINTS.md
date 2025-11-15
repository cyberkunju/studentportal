# Student API Endpoints

Complete documentation for student endpoints in the Student Portal API.

## Base URL

```
http://localhost:8000/api/student
```

## Authentication

All student endpoints require:
- Valid JWT token in Authorization header
- User role must be 'student'

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## Academic Information

### Get Marks

Retrieve student marks with calculated GP, CP, GPA, and CGPA.

**Endpoint**: `GET /student/get_marks.php`

**Query Parameters**:
- `semester` (optional): Filter by specific semester (1-6)
- If omitted, returns marks for all semesters

**Example**: `GET /student/get_marks.php?semester=5`

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
      },
      {
        "id": 2,
        "subject_code": "BCA502",
        "subject_name": "Software Engineering",
        "credit_hours": 3,
        "internal_marks": 22.00,
        "external_marks": 58.00,
        "total_marks": 80.00,
        "grade_point": 3.50,
        "letter_grade": "A-",
        "credit_points": 10.50
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

**Grade Scale**:
| Marks Range | Letter Grade | Grade Point |
|-------------|--------------|-------------|
| 90-100 | A+ | 4.00 |
| 85-89 | A | 3.75 |
| 80-84 | A- | 3.50 |
| 75-79 | B+ | 3.25 |
| 70-74 | B | 3.00 |
| 65-69 | B- | 2.75 |
| 60-64 | C+ | 2.50 |
| 55-59 | C | 2.25 |
| 50-54 | C- | 2.00 |
| 45-49 | D | 1.75 |
| 40-44 | E | 1.50 |
| <40 | F | 0.00 |

**Calculations**:
- **Credit Points (CP)**: Grade Point × Credit Hours
- **GPA**: Σ(CP) / Σ(Credit Hours) for semester
- **CGPA**: Σ(Semester GPA × Semester Credits) / Σ(All Credits)

---

### Get Attendance

Retrieve attendance records with percentage calculations.

**Endpoint**: `GET /student/get_attendance.php`

**Query Parameters**:
- `semester` (optional): Filter by semester
- `subject_id` (optional): Filter by specific subject

**Example**: `GET /student/get_attendance.php?semester=5`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "attendance": [
      {
        "subject_code": "BCA501",
        "subject_name": "Computer Networks",
        "total_classes": 45,
        "present_count": 42,
        "absent_count": 3,
        "late_count": 0,
        "percentage": 93.33,
        "status": "good"
      },
      {
        "subject_code": "BCA502",
        "subject_name": "Software Engineering",
        "total_classes": 40,
        "present_count": 35,
        "absent_count": 5,
        "late_count": 0,
        "percentage": 87.50,
        "status": "good"
      }
    ],
    "summary": {
      "total_classes": 240,
      "total_present": 215,
      "total_absent": 25,
      "overall_percentage": 89.58
    }
  }
}
```

**Attendance Status**:
- `excellent`: ≥ 95%
- `good`: 85-94%
- `warning`: 75-84%
- `critical`: < 75%

---

### Get Fees

Retrieve applicable fees with late fine calculations.

**Endpoint**: `GET /student/get_fees.php`

**Query Parameters**:
- `semester` (optional): Filter by semester
- `status` (optional): Filter by payment status (paid | pending | overdue)

**Example**: `GET /student/get_fees.php?semester=5`

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
        "late_fine_per_day": 100.00,
        "max_late_fine": 5000.00,
        "current_late_fine": 0.00,
        "total_amount": 25000.00,
        "payment_status": "pending",
        "payment_id": null,
        "description": "Tuition fee for semester 5"
      },
      {
        "id": 2,
        "fee_type": "Exam Fee",
        "fee_name": "Semester 5 Exam Fee",
        "amount": 2000.00,
        "due_date": "2024-11-30",
        "late_fine_per_day": 50.00,
        "max_late_fine": 1000.00,
        "current_late_fine": 700.00,
        "total_amount": 2700.00,
        "payment_status": "overdue",
        "payment_id": null,
        "description": "Exam fee for semester 5"
      }
    ],
    "summary": {
      "total_fees": 2,
      "total_amount": 27000.00,
      "total_paid": 0.00,
      "total_pending": 27000.00,
      "total_late_fines": 700.00
    }
  }
}
```

**Late Fine Calculation**:
```
IF current_date > due_date THEN
  days_late = DATEDIFF(current_date, due_date)
  late_fine = MIN(days_late * late_fine_per_day, max_late_fine)
ELSE
  late_fine = 0
END IF
```

---

### Get Payments

Retrieve payment history.

**Endpoint**: `GET /student/get_payments.php`

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `start_date` (optional): Filter from date
- `end_date` (optional): Filter to date

**Example**: `GET /student/get_payments.php?page=1&limit=10`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": 15,
        "receipt_number": "RCP20241114015",
        "fee_type": "Tuition Fee",
        "fee_name": "Semester 4 Tuition",
        "amount_paid": 25000.00,
        "late_fine": 0.00,
        "total_amount": 25000.00,
        "payment_date": "2024-08-15",
        "payment_method": "online",
        "transaction_id": "TXN123456789",
        "status": "completed"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 2,
      "total_items": 15,
      "items_per_page": 10
    },
    "summary": {
      "total_paid": 75000.00,
      "total_late_fines": 500.00
    }
  }
}
```

---

### Get Profile

Retrieve student profile information.

**Endpoint**: `GET /student/get_profile.php`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 5,
    "student_id": "STU2024001",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@university.edu",
    "date_of_birth": "2005-05-15",
    "gender": "male",
    "phone": "1234567890",
    "address": "123 Main St, City",
    "profile_image": "/uploads/profiles/student_1.jpg",
    "enrollment_date": "2024-07-01",
    "semester": 5,
    "department": "BCA",
    "program": "Bachelor of Computer Applications",
    "batch_year": 2024,
    "guardian_name": "Jane Doe",
    "guardian_phone": "0987654321",
    "guardian_email": "jane.doe@email.com",
    "status": "active"
  }
}
```

---

## PDF Downloads

### Download ID Card

Generate and download virtual ID card as PDF.

**Endpoint**: `GET /student/download_id_card.php`

**Response**: PDF file (application/pdf)

**File Name**: `ID_Card_{student_id}.pdf`

**PDF Contents**:
- Institution logo and name
- Student photo
- Student ID (with QR code)
- Full name
- Department and semester
- Enrollment date
- Valid until date
- QR code for verification

**QR Code Data**:
```json
{
  "student_id": "STU2024001",
  "verification_url": "https://portal.university.edu/verify/STU2024001"
}
```

**Dimensions**: 85.6mm × 53.98mm (standard ID card size)

**Example Request**:
```http
GET /student/download_id_card.php
Authorization: Bearer <jwt_token>
```

**Error Responses**:
- `400`: Missing required data (no profile image, etc.)
- `500`: PDF generation failed

---

### Download Receipt

Download payment receipt as PDF.

**Endpoint**: `GET /student/download_receipt.php`

**Query Parameters**:
- `payment_id` (required): Payment ID

**Example**: `GET /student/download_receipt.php?payment_id=15`

**Response**: PDF file (application/pdf)

**File Name**: `Receipt_{receipt_number}_{student_id}.pdf`

**PDF Contents**:
- Institution header (name, address, contact)
- Receipt number and date
- Student details (name, ID, department, semester)
- Fee breakdown:
  - Fee type and name
  - Base amount
  - Late fine (if applicable)
  - Total amount
- Payment details:
  - Payment method
  - Transaction ID
  - Payment date
- Institution seal/signature

**Example Request**:
```http
GET /student/download_receipt.php?payment_id=15
Authorization: Bearer <jwt_token>
```

**Error Responses**:
- `400`: Missing payment_id or invalid payment
- `403`: Payment doesn't belong to authenticated student
- `404`: Payment not found
- `500`: PDF generation failed

---

### Download Performance Report

Download academic performance report as PDF.

**Endpoint**: `GET /student/download_performance_report.php`

**Query Parameters**:
- `semester` (optional): Specific semester (1-6)
- If omitted, generates report for all semesters

**Example**: `GET /student/download_performance_report.php?semester=5`

**Response**: PDF file (application/pdf)

**File Name**: `Performance_Report_{student_id}_{date}.pdf`

**PDF Contents**:
- **Header Section**:
  - Institution name and logo
  - Student name and ID
  - Department and program
  - Enrollment date
  - Current semester
  - Report generation date

- **Semester-wise Tables** (for each semester):
  - Subject code and name
  - Credit hours
  - Internal marks (out of 30)
  - External marks (out of 70)
  - Total marks (out of 100)
  - Letter grade
  - Grade point
  - Credit points

- **Semester Summary** (after each semester table):
  - Total credits
  - Earned credits
  - Semester GPA
  - Cumulative CGPA

- **Overall Summary** (at end):
  - Total semesters completed
  - Total credits earned
  - Overall CGPA
  - Academic standing

**Example Request**:
```http
GET /student/download_performance_report.php
Authorization: Bearer <jwt_token>
```

**Error Responses**:
- `400`: Invalid semester number
- `404`: No marks data found
- `500`: PDF generation failed

---

## Common Error Responses

### Unauthorized (401)
```json
{
  "success": false,
  "error": "unauthorized",
  "message": "Please login to continue"
}
```

### Forbidden (403)
```json
{
  "success": false,
  "error": "forbidden",
  "message": "You don't have permission to access this resource"
}
```

### Not Found (404)
```json
{
  "success": false,
  "error": "not_found",
  "message": "Resource not found"
}
```

### Server Error (500)
```json
{
  "success": false,
  "error": "server_error",
  "message": "An unexpected error occurred"
}
```

---

## Usage Examples

### JavaScript (Axios)

```javascript
import axios from 'axios';

// Configure axios instance
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add JWT token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Get marks
const getMarks = async (semester) => {
  try {
    const response = await api.get('/student/get_marks.php', {
      params: { semester }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching marks:', error);
    throw error;
  }
};

// Download ID card
const downloadIDCard = async () => {
  try {
    const response = await api.get('/student/download_id_card.php', {
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'ID_Card.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error('Error downloading ID card:', error);
    throw error;
  }
};
```

### cURL

```bash
# Get marks
curl -X GET "http://localhost:8000/api/student/get_marks.php?semester=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Download ID card
curl -X GET "http://localhost:8000/api/student/download_id_card.php" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  --output ID_Card.pdf

# Download receipt
curl -X GET "http://localhost:8000/api/student/download_receipt.php?payment_id=15" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  --output Receipt.pdf
```

---

## PDF Generation Notes

### Requirements
- TCPDF library installed via Composer
- PHP GD extension enabled (for image processing)
- PHP mbstring extension enabled (for Unicode support)
- Minimum 256MB PHP memory_limit

### Temporary Files
- PDFs are temporarily stored in `/backend/uploads/temp/`
- Files are automatically deleted after 24 hours
- Cleanup runs via cron job (see deployment docs)

### Customization
- Institution branding can be customized in `backend/includes/pdf_generator.php`
- Logo, colors, fonts, and layout can be modified
- See [PDF Customization Guide](./PDF_GENERATION.md) for details

### Performance
- ID card generation: < 2 seconds
- Receipt generation: < 2 seconds
- Performance report (6 semesters): < 5 seconds

### Troubleshooting
- **PDF won't open**: Check PHP memory_limit
- **Missing images**: Verify profile_image path exists
- **QR code not scanning**: Ensure QR code data is valid JSON
- **Slow generation**: Check image file sizes, resize if needed

---

**Document Version**: 2.0  
**Last Updated**: November 15, 2025
