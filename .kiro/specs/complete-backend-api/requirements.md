# Requirements Document

## Introduction

The Student Portal Management System requires a complete backend API implementation to replace the current mock data system. The frontend application is fully developed with all UI components and pages, but currently operates with hardcoded mock data. This feature will implement all missing backend API endpoints to enable full functionality of the student, teacher, and admin portals with real database operations.

## Glossary

- **System**: The Student Portal Backend API
- **Frontend Application**: The React-based user interface already implemented
- **Database**: MySQL database with 11 tables as defined in schema.sql
- **JWT**: JSON Web Token used for stateless authentication
- **Mock Data**: Hardcoded data currently used in frontend for development
- **API Endpoint**: A specific URL path that handles HTTP requests and returns JSON responses
- **CRUD Operations**: Create, Read, Update, Delete database operations
- **Role**: User type (student, teacher, admin) that determines access permissions
- **Student**: A user with role='student' who can view their own academic data
- **Teacher**: A user with role='teacher' who can manage attendance and marks for assigned students
- **Admin**: A user with role='admin' who has full system management privileges
- **Session**: An academic year period with start and end dates
- **Semester**: A subdivision of academic year, numbered 1 through 6
- **Grade Point (GP)**: Numerical value assigned to letter grade (0.00 to 4.00)
- **Credit Point (CP)**: Product of grade point and credit hours for a subject
- **GPA**: Grade Point Average for a single semester
- **CGPA**: Cumulative Grade Point Average across all semesters
- **Virtual ID Card**: Digital student identification card with photo, student details, and QR code
- **PDF Document**: Portable Document Format file generated server-side for download
- **Receipt**: Payment confirmation document with transaction details and receipt number
- **Performance Report**: Academic transcript showing marks, grades, GPA, and CGPA for specified semesters

## Requirements

### Requirement 1: Student API Endpoints

**User Story:** As a student, I want to access my academic information through the portal, so that I can view my marks, attendance, fees, and other academic data in real-time.

#### Acceptance Criteria

1. WHEN a student requests their marks data, THE System SHALL retrieve marks from the database filtered by student_id and return marks with calculated GP, CP, GPA, and CGPA
2. WHEN a student requests their attendance data, THE System SHALL retrieve attendance records from the database and return attendance with calculated percentage by subject
3. WHEN a student requests their fee information, THE System SHALL retrieve applicable fees from the fees table based on student's semester and department
4. WHEN a student requests their payment history, THE System SHALL retrieve all payment records from the payments table filtered by student_id
5. WHERE a student views their profile, THE System SHALL retrieve student details from students table joined with users table

### Requirement 2: Teacher API Endpoints

**User Story:** As a teacher, I want to manage student attendance and marks through the portal, so that I can efficiently record and update academic data for my assigned students.

#### Acceptance Criteria

1. WHEN a teacher marks attendance for a class, THE System SHALL insert attendance records into the attendance table with status (present, absent, late, excused) and marked_by teacher_id
2. WHEN a teacher enters marks for a student, THE System SHALL insert or update marks in the marks table with automatic calculation of grade_point and letter_grade based on total_marks
3. WHEN a teacher requests their student list, THE System SHALL retrieve students from the students table filtered by the teacher's assigned department and subjects
4. WHEN a teacher updates previously entered marks, THE System SHALL update the marks table record and recalculate grade_point and letter_grade
5. WHERE a teacher views attendance reports, THE System SHALL retrieve attendance data grouped by subject and date with calculated statistics

### Requirement 3: Admin API Endpoints

**User Story:** As an administrator, I want to manage all users, fees, and system data through the portal, so that I can maintain the system and configure academic settings.

#### Acceptance Criteria

1. WHEN an admin creates a new student account, THE System SHALL insert records into both users table and students table with hashed password and generate unique student_id
2. WHEN an admin creates a new teacher account, THE System SHALL insert records into both users table and teachers table with hashed password and generate unique teacher_id
3. WHEN an admin creates a fee structure, THE System SHALL insert fee record into fees table with amount, due_date, semester, and department filters
4. WHEN an admin processes a payment, THE System SHALL insert payment record into payments table with generated receipt_number and update payment status
5. WHERE an admin manages subjects, THE System SHALL perform CRUD operations on subjects table with validation for subject_code uniqueness

### Requirement 4: Authentication and Authorization

**User Story:** As a system user, I want secure authentication and role-based access control, so that my data is protected and I can only access features appropriate to my role.

#### Acceptance Criteria

1. WHEN a user logs in with valid credentials, THE System SHALL verify password using password_verify function and generate JWT token containing user_id, username, and role
2. WHEN a user makes an API request with JWT token, THE System SHALL validate token signature and expiration before processing the request
3. IF a user attempts to access an endpoint without valid JWT token, THEN THE System SHALL return HTTP 401 Unauthorized response
4. IF a user attempts to access an endpoint not permitted for their role, THEN THE System SHALL return HTTP 403 Forbidden response
5. WHEN a user logs out, THE System SHALL invalidate the session on client side by removing stored token

### Requirement 5: File Upload and Management

**User Story:** As a system user, I want to upload and manage files such as profile images and documents, so that I can maintain complete records in the system.

#### Acceptance Criteria

1. WHEN a user uploads a profile image, THE System SHALL validate file type is one of (jpeg, png, gif), validate file size does not exceed 5242880 bytes (5MB), and save file to uploads/profiles directory
2. WHEN a file upload succeeds, THE System SHALL generate unique filename using timestamp and random string to prevent conflicts
3. IF a file upload fails validation, THEN THE System SHALL return HTTP 400 Bad Request with specific error message indicating validation failure reason
4. WHEN a file is successfully uploaded, THE System SHALL return file path in JSON response for storage in database
5. WHERE a user updates their profile image, THE System SHALL delete old image file from server before saving new image

### Requirement 6: Data Validation and Error Handling

**User Story:** As a system administrator, I want robust data validation and error handling, so that the system maintains data integrity and provides clear error messages.

#### Acceptance Criteria

1. WHEN any API endpoint receives a request, THE System SHALL validate all required fields are present before processing
2. WHEN database operations fail, THE System SHALL log error details to server error log and return generic error message to client
3. IF input data fails validation rules, THEN THE System SHALL return HTTP 400 Bad Request with array of validation errors
4. WHEN SQL queries are executed, THE System SHALL use prepared statements with parameter binding to prevent SQL injection
5. WHERE database constraints are violated, THE System SHALL catch PDO exceptions and return appropriate HTTP status code with user-friendly error message

### Requirement 7: Grade Calculation Logic

**User Story:** As a teacher entering marks, I want automatic grade calculation, so that grades are computed consistently according to the grading scale.

#### Acceptance Criteria

1. WHEN marks are entered or updated, THE System SHALL calculate total_marks as sum of internal_marks and external_marks
2. WHEN total_marks is calculated, THE System SHALL determine letter_grade based on predefined scale (A+ for 90-100, A for 85-89, etc.)
3. WHEN letter_grade is determined, THE System SHALL assign corresponding grade_point (4.00 for A+, 3.75 for A, etc.)
4. WHEN calculating GPA for a semester, THE System SHALL compute weighted average using formula: sum of (grade_point × credit_hours) divided by sum of credit_hours, rounded to 2 decimal places
5. WHEN calculating CGPA, THE System SHALL compute weighted average using formula: sum of (semester_GPA × semester_credits) divided by sum of all semester_credits, rounded to 2 decimal places

### Requirement 8: Notice and Notification System

**User Story:** As an administrator, I want to create and manage notices for students and teachers, so that I can communicate important information to all users.

#### Acceptance Criteria

1. WHEN an admin creates a notice, THE System SHALL insert notice record with title, content, target_role (student, teacher, all), and created_at timestamp
2. WHEN a user requests notices, THE System SHALL retrieve notices filtered by user's role and ordered by created_at descending
3. WHERE a notice has expiry_date, THE System SHALL only return notices where current date is before expiry_date
4. WHEN an admin updates a notice, THE System SHALL update notice record and set updated_at timestamp
5. WHEN an admin deletes a notice, THE System SHALL soft delete by setting is_active to false rather than removing record

### Requirement 9: Session and Semester Management

**User Story:** As an administrator, I want to manage academic sessions and semesters, so that the system operates within the correct academic timeframe.

#### Acceptance Criteria

1. WHEN an admin creates a new session, THE System SHALL insert session record with session_name, start_year, end_year, start_date, and end_date
2. WHEN a session is activated, THE System SHALL set is_active to true for new session and set is_active to false for all other sessions
3. WHERE data is filtered by session, THE System SHALL use the currently active session unless specific session_id is provided
4. WHEN semester data is created, THE System SHALL validate semester_number is an integer between 1 and 6 inclusive
5. WHERE semester dates are set, THE System SHALL validate start_date is before end_date and dates fall within parent session dates

### Requirement 10: Reporting and Analytics

**User Story:** As a teacher or administrator, I want to generate reports and view analytics, so that I can analyze student performance and attendance patterns.

#### Acceptance Criteria

1. WHEN a teacher requests attendance report, THE System SHALL retrieve attendance data grouped by student with calculated present_count, absent_count, and attendance_percentage rounded to 2 decimal places
2. WHEN an admin requests performance report, THE System SHALL retrieve marks data with calculated averages grouped by semester, department, or subject
3. WHERE a report includes date range filter, THE System SHALL filter records where date is between start_date and end_date
4. WHEN generating financial reports, THE System SHALL retrieve payment data with calculated total_collected, total_pending, and total_late_fines
5. WHERE analytics include trends, THE System SHALL calculate month-over-month or semester-over-semester percentage changes

### Requirement 11: Virtual ID Card Generation

**User Story:** As a student, I want to download my virtual ID card as a PDF, so that I can use it for identification purposes and keep a digital copy.

#### Acceptance Criteria

1. WHEN a student requests their virtual ID card, THE System SHALL retrieve student data including full_name, student_id, department, semester, enrollment_date, and profile_image from database
2. WHEN generating the ID card PDF, THE System SHALL use TCPDF or similar library to create PDF document with dimensions 85.6mm × 53.98mm (standard ID card size)
3. WHEN creating ID card layout, THE System SHALL include institution logo, student photo, student_id as barcode or QR code, full name, department, semester, and valid_until date
4. WHEN QR code is generated, THE System SHALL encode student_id and verification URL in QR code data for scanning validation
5. WHEN PDF generation completes, THE System SHALL return PDF file with Content-Type application/pdf and Content-Disposition attachment with filename format "ID_Card_{student_id}.pdf"

### Requirement 12: Fee Receipt Download

**User Story:** As a student, I want to download official fee payment receipts as PDF, so that I have proof of payment for my records.

#### Acceptance Criteria

1. WHEN a student requests a fee receipt for a payment, THE System SHALL retrieve payment record from payments table including receipt_number, amount, payment_date, payment_method, and fee_type
2. WHEN generating receipt PDF, THE System SHALL include institution header with name and address, receipt_number, payment_date, student details (name, student_id, department, semester), fee breakdown with amount, late_fine if applicable, total_amount, payment_method, and transaction_id
3. WHEN calculating receipt totals, THE System SHALL display base_amount, late_fine_amount, and total_amount with currency symbol and 2 decimal places
4. WHEN receipt includes multiple fee items, THE System SHALL list each fee_type with corresponding amount in tabular format
5. WHEN PDF generation completes, THE System SHALL return PDF file with filename format "Receipt_{receipt_number}_{student_id}.pdf" and set appropriate headers for download

### Requirement 13: Performance Report Download

**User Story:** As a student, I want to download my academic performance report as PDF, so that I can share my grades and GPA with others or keep for my records.

#### Acceptance Criteria

1. WHEN a student requests performance report, THE System SHALL retrieve all marks records for the student grouped by semester with calculated GPA per semester and overall CGPA
2. WHEN generating performance report PDF, THE System SHALL include student header with name, student_id, department, enrollment_date, and current semester
3. WHEN displaying marks data, THE System SHALL show table for each semester containing subject_code, subject_name, credit_hours, internal_marks, external_marks, total_marks, letter_grade, and grade_point
4. WHEN calculating semester summary, THE System SHALL display total_credits, earned_credits, semester_GPA, and cumulative_CGPA at end of each semester section
5. WHEN PDF generation completes, THE System SHALL return PDF file with filename format "Performance_Report_{student_id}_{date}.pdf" with generated_date timestamp in footer

### Requirement 14: PDF Generation Infrastructure

**User Story:** As a system administrator, I want a robust PDF generation system, so that all downloadable documents are consistently formatted and reliably generated.

#### Acceptance Criteria

1. WHEN any PDF generation is requested, THE System SHALL use TCPDF library version 6.x or higher with UTF-8 encoding support
2. WHEN creating PDF documents, THE System SHALL apply consistent styling with institution branding including logo, colors, and fonts
3. IF PDF generation fails due to missing data, THEN THE System SHALL return HTTP 400 Bad Request with error message indicating missing required fields
4. WHEN PDF file is generated, THE System SHALL save temporary copy to uploads/temp directory with unique filename and auto-delete files older than 24 hours
5. WHERE PDF includes images, THE System SHALL validate image file exists and is readable before embedding in PDF document
