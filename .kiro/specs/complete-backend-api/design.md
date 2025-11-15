# Design Document

## Overview

This design document outlines the technical implementation for completing the Student Portal Backend API. The system will replace mock data in the frontend with real database operations through RESTful PHP endpoints. The design follows the existing architecture pattern established in the authentication endpoints and maintains consistency with the current database schema.

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│  React Frontend │ (Port 5173)
│   (Vite Dev)    │
└────────┬────────┘
         │ HTTP/JSON
         │ JWT Token in Headers
         ▼
┌─────────────────┐
│   PHP Backend   │ (Port 8000/80)
│   Apache/XAMPP  │
├─────────────────┤
│ • CORS Handler  │
│ • JWT Validator │
│ • API Routes    │
│ • Controllers   │
│ • Helpers       │
└────────┬────────┘
         │ PDO
         ▼
┌─────────────────┐
│ MySQL Database  │ (Port 3306)
│  11 Tables      │
└─────────────────┘
```

### Directory Structure

```
backend/
├── api/
│   ├── auth/
│   │   ├── login.php          [EXISTS]
│   │   ├── logout.php         [EXISTS]
│   │   └── verify.php         [EXISTS]
│   ├── student/
│   │   ├── get_marks.php              [NEW]
│   │   ├── get_attendance.php         [NEW]
│   │   ├── get_fees.php               [NEW]
│   │   ├── get_payments.php           [NEW]
│   │   ├── get_profile.php            [NEW]
│   │   ├── download_id_card.php       [NEW]
│   │   ├── download_receipt.php       [NEW]
│   │   └── download_performance_report.php [NEW]
│   ├── teacher/
│   │   ├── mark_attendance.php    [NEW]
│   │   ├── enter_marks.php        [NEW]
│   │   ├── update_marks.php       [NEW]
│   │   ├── get_students.php       [NEW]
│   │   └── get_attendance_report.php [NEW]
│   ├── admin/
│   │   ├── students/
│   │   │   ├── create.php     [NEW]
│   │   │   ├── update.php     [NEW]
│   │   │   ├── delete.php     [NEW]
│   │   │   └── list.php       [NEW]
│   │   ├── teachers/
│   │   │   ├── create.php     [NEW]
│   │   │   ├── update.php     [NEW]
│   │   │   ├── delete.php     [NEW]
│   │   │   └── list.php       [NEW]
│   │   ├── fees/
│   │   │   ├── create.php     [NEW]
│   │   │   ├── update.php     [NEW]
│   │   │   ├── delete.php     [NEW]
│   │   │   └── list.php       [NEW]
│   │   ├── subjects/
│   │   │   ├── create.php     [NEW]
│   │   │   ├── update.php     [NEW]
│   │   │   ├── delete.php     [NEW]
│   │   │   └── list.php       [NEW]
│   │   ├── payments/
│   │   │   ├── process.php    [NEW]
│   │   │   └── list.php       [NEW]
│   │   ├── notices/
│   │   │   ├── create.php     [NEW]
│   │   │   ├── update.php     [NEW]
│   │   │   ├── delete.php     [NEW]
│   │   │   └── list.php       [NEW]
│   │   ├── sessions/
│   │   │   ├── create.php     [NEW]
│   │   │   ├── activate.php   [NEW]
│   │   │   └── list.php       [NEW]
│   │   ├── semesters/
│   │   │   └── create.php     [NEW]
│   │   └── reports/
│   │       ├── performance.php [NEW]
│   │       ├── financial.php   [NEW]
│   │       └── trends.php      [NEW]
│   ├── notices/
│   │   └── get_all.php        [NEW]
│   └── upload/
│       └── upload_image.php   [NEW]
├── config/
│   ├── database.php           [EXISTS]
│   └── jwt.php                [EXISTS]
├── includes/
│   ├── cors.php               [NEW]
│   ├── auth.php               [NEW]
│   ├── validation.php         [NEW]
│   ├── grade_calculator.php   [NEW]
│   ├── pdf_generator.php      [NEW]
│   └── helpers.php            [NEW]
├── uploads/
│   ├── profiles/              [NEW]
│   ├── documents/             [NEW]
│   └── temp/                  [NEW]
└── vendor/
    └── tecnickcom/tcpdf/      [COMPOSER DEPENDENCY]
```

## Key Design Decisions

### PDF Generation Library Selection

**Decision**: Use TCPDF library for all PDF generation

**Rationale**:
- **UTF-8 Support**: Full Unicode support for international characters and special symbols
- **Active Maintenance**: Regularly updated with security patches and bug fixes
- **Comprehensive Features**: Built-in support for QR codes, barcodes, images, and complex layouts
- **No External Dependencies**: Pure PHP implementation, no need for external binaries
- **Well Documented**: Extensive documentation and examples available
- **License**: LGPL v3, suitable for both open-source and commercial projects

**Alternatives Considered**:
- **FPDF**: Rejected due to limited UTF-8 support and lack of QR code generation
- **mPDF**: Rejected due to higher memory usage and slower performance
- **Dompdf**: Rejected due to CSS rendering inconsistencies and larger footprint

### Session Management Approach

**Decision**: Single active session with database flag

**Rationale**:
- **Simplicity**: Only one academic session is active at a time, reducing complexity
- **Data Integrity**: Prevents accidental data entry in wrong session
- **Query Performance**: Filtering by active session is faster than date-based filtering
- **Historical Data**: Inactive sessions remain in database for historical reporting

### Temporary File Management

**Decision**: Store generated PDFs temporarily, delete after 24 hours

**Rationale**:
- **Performance**: Generating PDFs on-demand for every request is CPU-intensive
- **Caching**: Temporary storage allows re-serving same PDF if requested multiple times
- **Disk Space**: 24-hour cleanup prevents unlimited disk usage growth
- **Security**: Temporary files use unique random names, preventing unauthorized access

### Report Data Aggregation

**Decision**: Calculate analytics in real-time from database queries

**Rationale**:
- **Accuracy**: Always reflects current data without cache staleness
- **Simplicity**: No need for separate aggregation tables or scheduled jobs
- **Flexibility**: Easy to add new filters and grouping options
- **Database Optimization**: Proper indexes make aggregation queries fast enough

## Components and Interfaces

### 1. Authentication Middleware

**File**: `backend/includes/auth.php`

**Purpose**: Validate JWT tokens and extract user information for all protected endpoints.

**Functions**:
```php
function verifyAuth(): array|false
// Returns user data from JWT or false if invalid
// Checks Authorization header
// Validates token signature and expiration
// Returns: ['user_id' => int, 'username' => string, 'role' => string]

function requireRole(string $role): void
// Ensures current user has required role
// Calls verifyAuth() internally
// Exits with 403 if role doesn't match

function requireRoles(array $roles): void
// Ensures current user has one of the required roles
// Exits with 403 if no role matches
```

**Usage Pattern**:
```php
require_once '../../includes/auth.php';

$user = verifyAuth();
if (!$user) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

requireRole('student'); // Only students can access
```

### 2. CORS Handler

**File**: `backend/includes/cors.php`

**Purpose**: Handle Cross-Origin Resource Sharing for frontend-backend communication.

**Implementation**:
```php
// Allow requests from frontend
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
```

### 3. Validation Helper

**File**: `backend/includes/validation.php`

**Purpose**: Centralized input validation functions.

**Functions**:
```php
function validateRequired(array $fields, object $data): array
// Validates required fields are present
// Returns array of missing fields

function validateEmail(string $email): bool
// Validates email format

function validatePhone(string $phone): bool
// Validates phone number format

function validateDate(string $date): bool
// Validates date format (YYYY-MM-DD)

function validateSemester(int $semester): bool
// Validates semester is between 1 and 6

function validateMarks(float $marks, float $max): bool
// Validates marks are within valid range

function sanitizeInput(string $input): string
// Sanitizes user input to prevent XSS
```

### 4. Grade Calculator

**File**: `backend/includes/grade_calculator.php`

**Purpose**: Calculate grades, GP, CP, GPA, and CGPA based on marks.

**Functions**:
```php
function calculateGrade(float $totalMarks): array
// Input: Total marks (0-100)
// Returns: ['grade_point' => float, 'letter_grade' => string]
// Scale:
//   90-100: A+ (4.00)
//   85-89:  A  (3.75)
//   80-84:  A- (3.50)
//   75-79:  B+ (3.25)
//   70-74:  B  (3.00)
//   65-69:  B- (2.75)
//   60-64:  C+ (2.50)
//   55-59:  C  (2.25)
//   50-54:  C- (2.00)
//   45-49:  D  (1.75)
//   40-44:  E  (1.50)
//   <40:    F  (0.00)

function calculateGPA(array $marks, array $subjects): float
// Input: Array of marks with grade_points, array of subjects with credit_hours
// Returns: GPA for semester
// Formula: Σ(GP × Credits) / Σ(Credits)

function calculateCGPA(array $semesterGPAs, array $semesterCredits): float
// Input: Array of semester GPAs, array of total credits per semester
// Returns: Cumulative GPA
// Formula: Σ(GPA × Credits) / Σ(Credits)

function calculateCP(float $gradePoint, int $creditHours): float
// Input: Grade point, credit hours
// Returns: Credit points (GP × Credits)
```

### 5. Helper Functions

**File**: `backend/includes/helpers.php`

**Purpose**: Common utility functions used across endpoints.

**Functions**:
```php
function generateUniqueId(string $prefix): string
// Generates unique ID with prefix (e.g., STU2024001)

function generateReceiptNumber(): string
// Generates unique receipt number (e.g., RCP20241114001)

function getActiveSession(PDO $db): array|false
// Returns currently active academic session

function getStudentIdFromUserId(int $userId, PDO $db): int|false
// Gets student.id from user.id

function getTeacherIdFromUserId(int $userId, PDO $db): int|false
// Gets teacher.id from user.id

function sendJsonResponse(int $statusCode, array $data): void
// Sends JSON response with status code

function logError(string $message, array $context = []): void
// Logs error to error log file
```

### 6. PDF Generator

**File**: `backend/includes/pdf_generator.php`

**Purpose**: Centralized PDF generation using TCPDF library for all downloadable documents.

**Design Rationale**: 
- Centralizing PDF generation ensures consistent branding and formatting across all documents
- TCPDF was chosen for its robust UTF-8 support, extensive documentation, and active maintenance
- Template-based approach allows easy customization of document layouts
- Temporary file management prevents disk space issues from abandoned downloads

**Functions**:
```php
function initializePDF(string $orientation = 'P', string $format = 'A4'): TCPDF
// Creates and configures TCPDF instance with institution branding
// Sets default fonts, margins, and header/footer
// Returns configured TCPDF object

function generateIDCard(array $studentData): string
// Input: Student data (name, student_id, department, photo, etc.)
// Creates ID card sized PDF (85.6mm × 53.98mm)
// Includes QR code with student_id and verification URL
// Returns temporary file path

function generateReceipt(array $paymentData): string
// Input: Payment data (receipt_number, amount, student info, fee details)
// Creates receipt PDF with institution header
// Includes fee breakdown, late fines, totals
// Returns temporary file path

function generatePerformanceReport(array $studentData, array $marksData): string
// Input: Student info and marks grouped by semester
// Creates multi-page report with semester-wise marks tables
// Includes GPA per semester and overall CGPA
// Returns temporary file path

function embedQRCode(TCPDF $pdf, string $data, int $x, int $y, int $size): void
// Generates and embeds QR code at specified position
// Uses TCPDF's built-in 2D barcode functionality

function cleanupTempFiles(int $olderThanHours = 24): void
// Deletes temporary PDF files older than specified hours
// Should be called via cron job or at start of PDF generation

function outputPDFDownload(string $filePath, string $filename): void
// Sends PDF file to browser with appropriate headers
// Sets Content-Type: application/pdf
// Sets Content-Disposition: attachment
// Deletes temporary file after sending
```

**TCPDF Configuration**:
```php
// Institution branding constants
define('PDF_HEADER_LOGO', 'path/to/logo.png');
define('PDF_HEADER_LOGO_WIDTH', 30);
define('PDF_HEADER_TITLE', 'Institution Name');
define('PDF_HEADER_STRING', 'Address Line\nPhone | Email');

// Default styling
define('PDF_FONT_NAME_MAIN', 'helvetica');
define('PDF_FONT_SIZE_MAIN', 10);
define('PDF_MARGIN_LEFT', 15);
define('PDF_MARGIN_TOP', 27);
define('PDF_MARGIN_RIGHT', 15);
```

## Data Models

### Request/Response Formats

#### Session Management Request
```json
{
  "session_name": "2024-2025",
  "start_year": 2024,
  "end_year": 2025,
  "start_date": "2024-07-01",
  "end_date": "2025-06-30"
}
```

#### Session Management Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "session_name": "2024-2025",
    "start_year": 2024,
    "end_year": 2025,
    "start_date": "2024-07-01",
    "end_date": "2025-06-30",
    "is_active": true,
    "created_at": "2024-11-14 10:00:00"
  }
}
```

#### Performance Report Response
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

#### Financial Report Response
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
      },
      {
        "fee_type": "Exam Fee",
        "collected": 450000.00,
        "pending": 150000.00
      }
    ]
  }
}
```

#### Student Marks Response
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

#### Teacher Mark Attendance Request
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

#### Admin Create Student Request
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

### Database Query Patterns

#### Get Student Marks with Subjects
```sql
SELECT 
    m.id,
    m.internal_marks,
    m.external_marks,
    m.total_marks,
    m.grade_point,
    m.letter_grade,
    s.subject_code,
    s.subject_name,
    s.credit_hours,
    (m.grade_point * s.credit_hours) as credit_points
FROM marks m
JOIN subjects s ON m.subject_id = s.id
WHERE m.student_id = :student_id 
  AND m.semester = :semester
  AND m.session_id = :session_id
ORDER BY s.subject_code
```

#### Get Attendance with Percentage
```sql
SELECT 
    s.subject_code,
    s.subject_name,
    COUNT(*) as total_classes,
    SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count,
    SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_count,
    ROUND((SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as percentage
FROM attendance a
JOIN subjects s ON a.subject_id = s.id
WHERE a.student_id = :student_id
  AND a.session_id = :session_id
GROUP BY s.id, s.subject_code, s.subject_name
ORDER BY s.subject_code
```

#### Get Applicable Fees for Student
```sql
SELECT 
    f.id,
    f.fee_type,
    f.fee_name,
    f.amount,
    f.due_date,
    f.late_fine_per_day,
    f.max_late_fine,
    f.description,
    CASE 
        WHEN CURDATE() > f.due_date 
        THEN LEAST(DATEDIFF(CURDATE(), f.due_date) * f.late_fine_per_day, f.max_late_fine)
        ELSE 0 
    END as current_late_fine,
    p.id as payment_id,
    p.status as payment_status
FROM fees f
LEFT JOIN payments p ON f.id = p.fee_id AND p.student_id = :student_id
WHERE f.session_id = :session_id
  AND (f.semester IS NULL OR f.semester = :semester)
  AND (f.department IS NULL OR f.department = :department)
  AND f.is_active = 1
ORDER BY f.due_date
```

#### Get Student Data for ID Card
```sql
SELECT 
    s.student_id,
    CONCAT(s.first_name, ' ', s.last_name) as full_name,
    s.department,
    s.semester,
    s.enrollment_date,
    s.profile_image,
    DATE_ADD(s.enrollment_date, INTERVAL 3 YEAR) as valid_until
FROM students s
WHERE s.user_id = :user_id
```

#### Get Payment Data for Receipt
```sql
SELECT 
    p.receipt_number,
    p.amount_paid,
    p.late_fine,
    p.total_amount,
    p.payment_date,
    p.payment_method,
    p.transaction_id,
    f.fee_type,
    f.fee_name,
    f.amount as base_amount,
    CONCAT(s.first_name, ' ', s.last_name) as student_name,
    s.student_id,
    s.department,
    s.semester
FROM payments p
JOIN fees f ON p.fee_id = f.id
JOIN students s ON p.student_id = s.id
WHERE p.id = :payment_id
```

#### Get Performance Report Data
```sql
SELECT 
    m.semester,
    s.subject_code,
    s.subject_name,
    s.credit_hours,
    m.internal_marks,
    m.external_marks,
    m.total_marks,
    m.letter_grade,
    m.grade_point,
    (m.grade_point * s.credit_hours) as credit_points
FROM marks m
JOIN subjects s ON m.subject_id = s.id
WHERE m.student_id = :student_id
  AND (:semester IS NULL OR m.semester = :semester)
ORDER BY m.semester, s.subject_code
```

#### Get Active Session
```sql
SELECT 
    id,
    session_name,
    start_year,
    end_year,
    start_date,
    end_date
FROM sessions
WHERE is_active = 1
LIMIT 1
```

#### Get Performance Statistics by Department
```sql
SELECT 
    s.department,
    m.semester,
    COUNT(DISTINCT m.student_id) as total_students,
    ROUND(AVG(m.grade_point), 2) as average_gpa,
    ROUND((SUM(CASE WHEN m.grade_point >= 1.50 THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as pass_percentage
FROM marks m
JOIN students s ON m.student_id = s.id
WHERE m.session_id = :session_id
  AND (:department IS NULL OR s.department = :department)
  AND (:semester IS NULL OR m.semester = :semester)
GROUP BY s.department, m.semester
```

#### Get Financial Report Data
```sql
SELECT 
    f.fee_type,
    SUM(CASE WHEN p.status = 'completed' THEN p.total_amount ELSE 0 END) as collected,
    SUM(CASE WHEN p.status IS NULL OR p.status = 'pending' THEN f.amount ELSE 0 END) as pending,
    SUM(CASE WHEN p.status = 'completed' THEN p.late_fine ELSE 0 END) as late_fines
FROM fees f
LEFT JOIN payments p ON f.id = p.fee_id
WHERE f.session_id = :session_id
  AND f.due_date BETWEEN :start_date AND :end_date
  AND (:department IS NULL OR f.department = :department)
GROUP BY f.fee_type
```

## Error Handling

### Error Response Format

All errors follow consistent JSON format:
```json
{
  "success": false,
  "error": "error_code",
  "message": "Human-readable error message",
  "details": {} // Optional additional details
}
```

### HTTP Status Codes

- **200 OK**: Successful request
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid input/validation error
- **401 Unauthorized**: Missing or invalid JWT token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Duplicate resource (e.g., username exists)
- **500 Internal Server Error**: Server/database error

### Error Handling Pattern

```php
try {
    // Database operations
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    
    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'not_found',
            'message' => 'Resource not found'
        ]);
        exit();
    }
    
    // Success response
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => $result
    ]);
    
} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'database_error',
        'message' => 'An error occurred while processing your request'
    ]);
}
```

## Testing Strategy

### Unit Testing Approach

**Test Categories**:
1. **Authentication Tests**: Verify JWT generation and validation
2. **Validation Tests**: Test input validation functions
3. **Grade Calculation Tests**: Verify grade calculation accuracy
4. **Database Query Tests**: Test SQL queries with sample data

### Manual Testing Checklist

**For Each Endpoint**:
- [ ] Test with valid data
- [ ] Test with missing required fields
- [ ] Test with invalid data types
- [ ] Test with invalid JWT token
- [ ] Test with wrong user role
- [ ] Test with non-existent resources
- [ ] Test database constraint violations
- [ ] Verify response format matches specification

**For PDF Endpoints**:
- [ ] Test PDF generation with complete data
- [ ] Test PDF generation with missing optional fields
- [ ] Test PDF generation with missing required fields (should fail gracefully)
- [ ] Verify PDF file size is reasonable (< 1MB for most documents)
- [ ] Verify PDF opens correctly in multiple PDF readers
- [ ] Test QR code scanning on ID cards
- [ ] Verify image embedding works with different image formats
- [ ] Test temp file cleanup mechanism

### Integration Testing

**Test Scenarios**:
1. **Student Flow**: Login → View marks → View attendance → View fees → Make payment → Download receipt → Download ID card → Download performance report
2. **Teacher Flow**: Login → View students → Mark attendance → Enter marks → View attendance report
3. **Admin Flow**: Login → Create student → Create fee → Process payment → View reports → Create session → Activate session
4. **PDF Generation Flow**: Request PDF → Verify generation → Download → Verify content → Confirm temp file cleanup

### Testing Tools

- **Postman/Insomnia**: API endpoint testing
- **MySQL Workbench**: Database query testing
- **Browser DevTools**: Frontend-backend integration testing
- **PHP Error Logs**: Server-side error tracking

## Security Considerations

### Input Validation

1. **Sanitize all inputs**: Use `htmlspecialchars()` for output, prepared statements for SQL
2. **Validate data types**: Ensure integers are integers, dates are valid dates
3. **Validate ranges**: Marks 0-100, semester 1-6, etc.
4. **Validate formats**: Email, phone, date formats

### SQL Injection Prevention

```php
// ALWAYS use prepared statements
$stmt = $db->prepare("SELECT * FROM users WHERE username = :username");
$stmt->bindParam(':username', $username, PDO::PARAM_STR);
$stmt->execute();

// NEVER concatenate user input
// BAD: $query = "SELECT * FROM users WHERE username = '$username'";
```

### Password Security

```php
// Hash passwords with bcrypt
$hashedPassword = password_hash($password, PASSWORD_BCRYPT);

// Verify passwords
if (password_verify($inputPassword, $hashedPassword)) {
    // Password correct
}
```

### JWT Security

1. **Use strong secret key**: Minimum 32 characters, random
2. **Set appropriate expiration**: 24 hours for regular users
3. **Validate on every request**: Check signature and expiration
4. **Don't store sensitive data**: Only user_id, username, role

### File Upload Security

1. **Validate file type**: Check MIME type and extension
2. **Limit file size**: Maximum 5MB for images
3. **Generate unique filenames**: Prevent overwrites and path traversal
4. **Store outside web root**: Or use .htaccess to prevent direct access
5. **Scan for malware**: If possible, integrate virus scanning

```php
$allowed_types = ['image/jpeg', 'image/png', 'image/gif'];
$max_size = 5 * 1024 * 1024; // 5MB

if (!in_array($_FILES['file']['type'], $allowed_types)) {
    // Reject file
}

if ($_FILES['file']['size'] > $max_size) {
    // Reject file
}

$filename = uniqid() . '_' . time() . '.' . $extension;
```

## Performance Optimization

### Database Optimization

1. **Use indexes**: Already defined in schema.sql
2. **Limit result sets**: Use LIMIT and OFFSET for pagination
3. **Avoid N+1 queries**: Use JOINs instead of multiple queries
4. **Cache frequently accessed data**: Active session, subject lists

### Query Optimization Examples

```php
// Good: Single query with JOIN
$query = "SELECT s.*, u.email FROM students s 
          JOIN users u ON s.user_id = u.id 
          WHERE s.department = :dept";

// Bad: Multiple queries
$students = $db->query("SELECT * FROM students WHERE department = '$dept'");
foreach ($students as $student) {
    $user = $db->query("SELECT email FROM users WHERE id = {$student['user_id']}");
}
```

### Response Optimization

1. **Return only needed fields**: Don't SELECT *
2. **Paginate large result sets**: Default 20 items per page
3. **Compress responses**: Enable gzip compression
4. **Cache static data**: Subject lists, fee structures

## API Endpoint Specifications

### Student Endpoints

#### GET /api/student/get_marks.php
- **Auth**: Required (student role)
- **Query Params**: `semester` (optional, defaults to current)
- **Response**: Marks array with GPA/CGPA summary
- **Requirements**: 1.1, 7.1-7.5

#### GET /api/student/get_attendance.php
- **Auth**: Required (student role)
- **Query Params**: `semester` (optional)
- **Response**: Attendance records with percentage by subject
- **Requirements**: 1.2

#### GET /api/student/get_fees.php
- **Auth**: Required (student role)
- **Response**: Applicable fees with late fine calculations
- **Requirements**: 1.3

#### GET /api/student/get_payments.php
- **Auth**: Required (student role)
- **Response**: Payment history with receipts
- **Requirements**: 1.4

#### GET /api/student/get_profile.php
- **Auth**: Required (student role)
- **Response**: Student profile with user details
- **Requirements**: 1.5

### Teacher Endpoints

#### POST /api/teacher/mark_attendance.php
- **Auth**: Required (teacher role)
- **Body**: `{ subject_id, attendance_date, attendance: [{student_id, status}] }`
- **Response**: Success message with count of records created
- **Requirements**: 2.1

#### POST /api/teacher/enter_marks.php
- **Auth**: Required (teacher role)
- **Body**: `{ student_id, subject_id, internal_marks, external_marks }`
- **Response**: Created marks with calculated grades
- **Requirements**: 2.2, 7.1-7.3

#### PUT /api/teacher/update_marks.php
- **Auth**: Required (teacher role)
- **Body**: `{ marks_id, internal_marks, external_marks }`
- **Response**: Updated marks with recalculated grades
- **Requirements**: 2.4, 7.1-7.3

#### GET /api/teacher/get_students.php
- **Auth**: Required (teacher role)
- **Query Params**: `department`, `semester` (optional filters)
- **Response**: Student list with basic info
- **Requirements**: 2.3

#### GET /api/teacher/get_attendance_report.php
- **Auth**: Required (teacher role)
- **Query Params**: `subject_id`, `start_date`, `end_date`
- **Response**: Attendance statistics by student
- **Requirements**: 2.5, 10.1

### Admin Endpoints

#### POST /api/admin/students/create.php
- **Auth**: Required (admin role)
- **Body**: Student data (see Data Models section)
- **Response**: Created student with generated student_id
- **Requirements**: 3.1

#### PUT /api/admin/students/update.php
- **Auth**: Required (admin role)
- **Body**: Student data with id
- **Response**: Updated student data
- **Requirements**: 3.1

#### DELETE /api/admin/students/delete.php
- **Auth**: Required (admin role)
- **Body**: `{ student_id }`
- **Response**: Success message
- **Requirements**: 3.1

#### GET /api/admin/students/list.php
- **Auth**: Required (admin role)
- **Query Params**: `page`, `limit`, `search`, `department`, `semester`
- **Response**: Paginated student list
- **Requirements**: 3.1

#### POST /api/admin/teachers/create.php
- **Auth**: Required (admin role)
- **Body**: Teacher data
- **Response**: Created teacher with generated teacher_id
- **Requirements**: 3.2

#### POST /api/admin/fees/create.php
- **Auth**: Required (admin role)
- **Body**: Fee structure data
- **Response**: Created fee record
- **Requirements**: 3.3

#### POST /api/admin/payments/process.php
- **Auth**: Required (admin role)
- **Body**: `{ student_id, fee_id, amount_paid, payment_method }`
- **Response**: Payment record with generated receipt_number
- **Requirements**: 3.4

#### POST /api/admin/subjects/create.php
- **Auth**: Required (admin role)
- **Body**: Subject data
- **Response**: Created subject
- **Requirements**: 3.5

### Notice Endpoints

#### GET /api/notices/get_all.php
- **Auth**: Required (any role)
- **Response**: Notices filtered by user role
- **Requirements**: 8.2

#### POST /api/admin/notices/create.php
- **Auth**: Required (admin role)
- **Body**: `{ title, content, target_role, expiry_date }`
- **Response**: Created notice
- **Requirements**: 8.1

### Upload Endpoints

#### POST /api/upload/upload_image.php
- **Auth**: Required (any role)
- **Body**: FormData with image file
- **Response**: `{ success, file_path }`
- **Requirements**: 5.1-5.5

### Session and Semester Management Endpoints

#### POST /api/admin/sessions/create.php
- **Auth**: Required (admin role)
- **Body**: `{ session_name, start_year, end_year, start_date, end_date }`
- **Response**: Created session record
- **Requirements**: 9.1

#### PUT /api/admin/sessions/activate.php
- **Auth**: Required (admin role)
- **Body**: `{ session_id }`
- **Response**: Success message, sets is_active to true for specified session and false for others
- **Requirements**: 9.2

#### GET /api/admin/sessions/list.php
- **Auth**: Required (admin role)
- **Response**: List of all sessions with active status
- **Requirements**: 9.3

#### POST /api/admin/semesters/create.php
- **Auth**: Required (admin role)
- **Body**: `{ session_id, semester_number, start_date, end_date }`
- **Response**: Created semester record
- **Requirements**: 9.4, 9.5

### PDF Generation Endpoints

#### GET /api/student/download_id_card.php
- **Auth**: Required (student role)
- **Response**: PDF file (Content-Type: application/pdf)
- **Filename**: `ID_Card_{student_id}.pdf`
- **Requirements**: 11.1-11.5, 14.1-14.5

#### GET /api/student/download_receipt.php
- **Auth**: Required (student role)
- **Query Params**: `payment_id`
- **Response**: PDF file (Content-Type: application/pdf)
- **Filename**: `Receipt_{receipt_number}_{student_id}.pdf`
- **Requirements**: 12.1-12.5, 14.1-14.5

#### GET /api/student/download_performance_report.php
- **Auth**: Required (student role)
- **Query Params**: `semester` (optional, defaults to all semesters)
- **Response**: PDF file (Content-Type: application/pdf)
- **Filename**: `Performance_Report_{student_id}_{date}.pdf`
- **Requirements**: 13.1-13.5, 14.1-14.5

### Reporting and Analytics Endpoints

#### GET /api/admin/reports/performance.php
- **Auth**: Required (admin role)
- **Query Params**: `semester`, `department`, `subject_id` (optional filters)
- **Response**: Performance statistics with averages grouped by specified criteria
- **Requirements**: 10.2

#### GET /api/admin/reports/financial.php
- **Auth**: Required (admin role)
- **Query Params**: `start_date`, `end_date`, `department` (optional filters)
- **Response**: Financial report with total_collected, total_pending, total_late_fines
- **Requirements**: 10.4

#### GET /api/admin/reports/trends.php
- **Auth**: Required (admin role)
- **Query Params**: `metric` (attendance, performance, payments), `period` (monthly, semester)
- **Response**: Trend data with percentage changes
- **Requirements**: 10.5

## PDF Generation Design Details

### ID Card Layout

**Dimensions**: 85.6mm × 53.98mm (standard credit card size)

**Front Side Layout**:
```
┌─────────────────────────────────────┐
│  [LOGO]    INSTITUTION NAME         │
│                                     │
│  ┌────────┐  Name: John Doe        │
│  │ PHOTO  │  ID: STU2024001        │
│  │        │  Dept: BCA             │
│  └────────┘  Sem: 5                │
│                                     │
│  [QR CODE]   Valid Until: 2027     │
└─────────────────────────────────────┘
```

**QR Code Data Format**:
```json
{
  "student_id": "STU2024001",
  "verification_url": "https://portal.institution.edu/verify/STU2024001"
}
```

### Receipt Layout

**Format**: A4 portrait

**Structure**:
```
┌─────────────────────────────────────┐
│         INSTITUTION HEADER          │
│    [Logo] Institution Name          │
│         Address & Contact           │
├─────────────────────────────────────┤
│         FEE PAYMENT RECEIPT         │
│                                     │
│  Receipt No: RCP20241114001         │
│  Date: November 14, 2024            │
│                                     │
│  Student Details:                   │
│  Name: John Doe                     │
│  Student ID: STU2024001             │
│  Department: BCA, Semester: 5       │
│                                     │
│  Fee Details:                       │
│  ┌─────────────────┬──────────────┐│
│  │ Fee Type        │ Amount       ││
│  ├─────────────────┼──────────────┤│
│  │ Tuition Fee     │ ₹25,000.00   ││
│  │ Late Fine       │ ₹500.00      ││
│  ├─────────────────┼──────────────┤│
│  │ Total Amount    │ ₹25,500.00   ││
│  └─────────────────┴──────────────┘│
│                                     │
│  Payment Method: Online             │
│  Transaction ID: TXN123456789       │
│                                     │
│  [Authorized Signature]             │
└─────────────────────────────────────┘
```

### Performance Report Layout

**Format**: A4 portrait, multi-page

**Structure**:
```
┌─────────────────────────────────────┐
│         INSTITUTION HEADER          │
│      ACADEMIC PERFORMANCE REPORT    │
│                                     │
│  Student: John Doe (STU2024001)     │
│  Department: BCA                    │
│  Enrollment: July 2024              │
│                                     │
│  SEMESTER 1 (2024-2025)             │
│  ┌────┬──────┬────┬────┬────┬──┬──┐│
│  │Sub │Name  │Crd │Int │Ext │Tot│GP││
│  ├────┼──────┼────┼────┼────┼───┼──┤│
│  │BCA │Prog  │ 4  │ 25 │ 65 │90 │4.0││
│  │101 │      │    │    │    │   │  ││
│  └────┴──────┴────┴────┴────┴───┴──┘│
│                                     │
│  Semester Summary:                  │
│  Total Credits: 20                  │
│  Semester GPA: 3.62                 │
│  Cumulative CGPA: 3.62              │
│                                     │
│  [Repeat for each semester]         │
│                                     │
│  Generated: November 14, 2024       │
└─────────────────────────────────────┘
```

## Implementation Priority

### Phase 1: Core Student Features (High Priority)
1. Student marks endpoint
2. Student attendance endpoint
3. Grade calculation helper
4. Authentication middleware

### Phase 2: Teacher Features (High Priority)
1. Mark attendance endpoint
2. Enter marks endpoint
3. Get students endpoint
4. Update marks endpoint

### Phase 3: Admin User Management (Medium Priority)
1. Create student endpoint
2. Create teacher endpoint
3. List students endpoint
4. List teachers endpoint

### Phase 4: Admin Fee Management (Medium Priority)
1. Create fee endpoint
2. Process payment endpoint
3. Get fees endpoint
4. Get payments endpoint

### Phase 5: Additional Features (Low Priority)
1. Notice system endpoints
2. File upload endpoint
3. Subject management endpoints
4. Session/semester management endpoints

### Phase 6: PDF Generation Features (Low Priority)
1. Install and configure TCPDF library
2. Create PDF generator helper
3. Implement ID card generation endpoint
4. Implement receipt generation endpoint
5. Implement performance report endpoint
6. Setup temp file cleanup mechanism

### Phase 7: Reporting and Analytics (Low Priority)
1. Performance report endpoint
2. Financial report endpoint
3. Trends analytics endpoint

## Migration from Mock Data

### Frontend Changes Required

1. **Update API base URL** in `src/services/api.js`:
```javascript
const API_BASE_URL = 'http://localhost:8000/api';
// or 'http://localhost/studentportal-api/api' for XAMPP
```

2. **Remove mock data logic** from API service methods

3. **Add JWT token to requests**:
```javascript
const token = localStorage.getItem('token');
const response = await fetch(url, {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
});
```

4. **Update login to store JWT token**:
```javascript
const data = await response.json();
if (data.success) {
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
}
```

5. **Handle API errors consistently**:
```javascript
if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Request failed');
}
```

6. **Add PDF download handlers**:
```javascript
async function downloadPDF(endpoint, filename) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    if (!response.ok) {
        throw new Error('Failed to download PDF');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

// Usage examples:
downloadPDF('/student/download_id_card.php', 'ID_Card.pdf');
downloadPDF('/student/download_receipt.php?payment_id=123', 'Receipt.pdf');
downloadPDF('/student/download_performance_report.php', 'Performance_Report.pdf');
```

## Deployment Considerations

### Development Environment
- XAMPP with Apache and MySQL
- PHP 8.x with required extensions (pdo_mysql, gd, mbstring)
- MySQL 8.0
- Composer for PHP dependency management (TCPDF)
- Frontend on Vite dev server (port 5173)
- Backend on Apache (port 80 or 8000)

### Production Environment
- Shared hosting or VPS with PHP support
- MySQL database
- SSL certificate for HTTPS
- Frontend built and served from same domain or CDN
- Environment-specific configuration files
- Cron job for temp file cleanup (runs daily)

### Configuration Management
- Use environment variables for sensitive data
- Separate config files for dev/prod
- Never commit passwords or secret keys to version control

### TCPDF Installation
```bash
# Install via Composer
cd backend
composer require tecnickcom/tcpdf

# Verify installation
php -r "require 'vendor/autoload.php'; echo 'TCPDF installed successfully';"
```

### Temp File Cleanup
```bash
# Add to crontab for daily cleanup
0 2 * * * php /path/to/backend/includes/cleanup_temp_files.php
```

---

**Design Version**: 2.0  
**Last Updated**: November 14, 2025  
**Status**: Ready for Implementation

**Changelog**:
- **v2.0** (Nov 14, 2025): Added PDF generation features (ID card, receipts, performance reports), session/semester management, reporting and analytics endpoints, TCPDF integration, and comprehensive design rationale for new features
- **v1.0** (Nov 14, 2025): Initial design covering core student, teacher, and admin endpoints
