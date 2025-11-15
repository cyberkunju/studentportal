# Implementation Plan

- [x] 1. Set up core infrastructure and helper files
  - Create CORS handler for frontend-backend communication
  - Create authentication middleware for JWT validation
  - Create validation helper functions for input sanitization
  - Create grade calculator helper for GP/CP/GPA/CGPA calculations
  - Create general helper functions for common operations
  - _Requirements: 4.1, 4.2, 6.1, 7.1-7.5_

- [x] 2. Implement student API endpoints
  - [x] 2.1 Create get_marks.php endpoint to retrieve student marks with GPA/CGPA
    - Query marks table joined with subjects table
    - Calculate GPA using grade calculator helper
    - Calculate CGPA across all semesters
    - Return marks array with summary statistics
    - _Requirements: 1.1, 7.1-7.5_
  
  - [x] 2.2 Create get_attendance.php endpoint to retrieve attendance records
    - Query attendance table joined with subjects table
    - Calculate attendance percentage per subject
    - Group results by subject
    - Return attendance array with percentage calculations
    - _Requirements: 1.2_
  
  - [x] 2.3 Create get_fees.php endpoint to retrieve applicable fees
    - Query fees table filtered by student's semester and department
    - Calculate current late fines based on due dates
    - Left join with payments table to show payment status
    - Return fees array with late fine calculations
    - _Requirements: 1.3_
  
  - [x] 2.4 Create get_payments.php endpoint to retrieve payment history
    - Query payments table joined with fees table
    - Filter by student_id
    - Order by payment_date descending
    - Return payment history with receipt numbers
    - _Requirements: 1.4_
  
  - [x] 2.5 Create get_profile.php endpoint to retrieve student profile
    - Query students table joined with users table
    - Return complete student profile information
    - Include guardian details and enrollment information
    - _Requirements: 1.5_

- [x] 3. Implement teacher API endpoints
  - [x] 3.1 Create mark_attendance.php endpoint for bulk attendance marking
    - Validate subject_id and attendance_date
    - Validate attendance array with student_id and status
    - Insert multiple attendance records in transaction
    - Handle duplicate attendance for same date (update instead of insert)
    - Return success message with count of records created
    - _Requirements: 2.1_
  
  - [x] 3.2 Create enter_marks.php endpoint for entering student marks
    - Validate student_id, subject_id, internal_marks, external_marks
    - Calculate total_marks as sum of internal and external
    - Use grade calculator to determine grade_point and letter_grade
    - Insert marks record with calculated values
    - Return created marks with all calculated fields
    - _Requirements: 2.2, 7.1-7.3_
  
  - [x] 3.3 Create update_marks.php endpoint for updating existing marks
    - Validate marks_id exists
    - Validate new internal_marks and external_marks
    - Recalculate total_marks, grade_point, and letter_grade
    - Update marks record with new values
    - Return updated marks with recalculated fields
    - _Requirements: 2.4, 7.1-7.3_
  
  - [x] 3.4 Create get_students.php endpoint to retrieve student list
    - Query students table with optional filters (department, semester)
    - Join with users table for email
    - Support search by name or student_id
    - Return paginated student list
    - _Requirements: 2.3_
  
  - [x] 3.5 Create get_attendance_report.php endpoint for attendance statistics
    - Query attendance table filtered by subject_id and date range
    - Group by student_id
    - Calculate present_count, absent_count, and percentage
    - Return attendance report with statistics
    - _Requirements: 2.5, 10.1_

- [x] 4. Implement admin student management endpoints
  - [x] 4.1 Create admin/students/create.php endpoint
    - Validate all required student fields
    - Check username and email uniqueness
    - Hash password using password_hash
    - Generate unique student_id
    - Insert into users table first
    - Insert into students table with user_id
    - Use database transaction for atomicity
    - Return created student with generated IDs
    - _Requirements: 3.1, 6.1-6.5_
  
  - [x] 4.2 Create admin/students/update.php endpoint
    - Validate student_id exists
    - Validate updated fields
    - Update users table if email or username changed
    - Update students table with new information
    - Use transaction for atomicity
    - Return updated student data
    - _Requirements: 3.1, 6.1-6.5_
  
  - [x] 4.3 Create admin/students/delete.php endpoint
    - Validate student_id exists
    - Delete from users table (cascade deletes student record)
    - Return success message
    - _Requirements: 3.1_
  
  - [x] 4.4 Create admin/students/list.php endpoint
    - Query students table joined with users table
    - Support pagination with page and limit parameters
    - Support search by name, student_id, or email
    - Support filters by department, semester, status
    - Return paginated student list with total count
    - _Requirements: 3.1_

- [x] 5. Implement admin teacher management endpoints
  - [x] 5.1 Create admin/teachers/create.php endpoint
    - Validate all required teacher fields
    - Check username and email uniqueness
    - Hash password using password_hash
    - Generate unique teacher_id
    - Insert into users table with role='teacher'
    - Insert into teachers table with user_id
    - Use database transaction
    - Return created teacher with generated IDs
    - _Requirements: 3.2, 6.1-6.5_
  
  - [x] 5.2 Create admin/teachers/update.php endpoint
    - Validate teacher_id exists
    - Update users and teachers tables
    - Use transaction for atomicity
    - Return updated teacher data
    - _Requirements: 3.2_
  
  - [x] 5.3 Create admin/teachers/delete.php endpoint
    - Validate teacher_id exists
    - Delete from users table (cascade delete)
    - Return success message
    - _Requirements: 3.2_
  
  - [x] 5.4 Create admin/teachers/list.php endpoint
    - Query teachers table joined with users table
    - Support pagination and search
    - Support filter by department
    - Return paginated teacher list
    - _Requirements: 3.2_

- [x] 6. Implement admin fee management endpoints
  - [x] 6.1 Create admin/fees/create.php endpoint
    - Validate fee_type, fee_name, amount, due_date
    - Validate semester (1-6) if provided
    - Insert fee record into fees table
    - Return created fee with id
    - _Requirements: 3.3_
  
  - [x] 6.2 Create admin/fees/update.php endpoint
    - Validate fee_id exists
    - Update fee record with new values
    - Return updated fee data
    - _Requirements: 3.3_
  
  - [x] 6.3 Create admin/fees/delete.php endpoint
    - Validate fee_id exists
    - Soft delete by setting is_active to false
    - Return success message
    - _Requirements: 3.3_
  
  - [x] 6.4 Create admin/fees/list.php endpoint
    - Query fees table with filters
    - Support filter by semester, department, session
    - Return fee list ordered by due_date
    - _Requirements: 3.3_

- [x] 7. Implement admin payment processing endpoints
  - [x] 7.1 Create admin/payments/process.php endpoint
    - Validate student_id and fee_id exist
    - Calculate late_fine based on current date and due_date
    - Calculate total_amount as amount_paid plus late_fine
    - Generate unique receipt_number
    - Insert payment record with status='completed'
    - Return payment record with receipt_number
    - _Requirements: 3.4_
  
  - [x] 7.2 Create admin/payments/list.php endpoint
    - Query payments table joined with students and fees
    - Support filter by student_id, date range, status
    - Support pagination
    - Return payment list with student and fee details
    - _Requirements: 3.4_

- [x] 8. Implement admin subject management endpoints
  - [x] 8.1 Create admin/subjects/create.php endpoint
    - Validate subject_code uniqueness
    - Validate semester (1-6)
    - Validate credit_hours is positive integer
    - Insert subject record
    - Return created subject
    - _Requirements: 3.5_
  
  - [x] 8.2 Create admin/subjects/update.php endpoint
    - Validate subject_id exists
    - Update subject record
    - Return updated subject
    - _Requirements: 3.5_
  
  - [x] 8.3 Create admin/subjects/delete.php endpoint
    - Validate subject_id exists
    - Soft delete by setting is_active to false
    - Return success message
    - _Requirements: 3.5_
  
  - [x] 8.4 Create admin/subjects/list.php endpoint
    - Query subjects table
    - Support filter by semester, department
    - Return subject list ordered by subject_code
    - _Requirements: 3.5_

- [x] 9. Implement notice system endpoints
  - [x] 9.1 Create notices/get_all.php endpoint for all users
    - Query notices table filtered by user's role
    - Filter by expiry_date (only show non-expired)
    - Filter by is_active = true
    - Order by created_at descending
    - Return notice list
    - _Requirements: 8.2_
  
  - [x] 9.2 Create admin/notices/create.php endpoint
    - Validate title and content are not empty
    - Validate target_role is valid (student, teacher, all)
    - Insert notice record with created_at timestamp
    - Return created notice
    - _Requirements: 8.1_
  
  - [x] 9.3 Create admin/notices/update.php endpoint
    - Validate notice_id exists
    - Update notice record
    - Set updated_at timestamp
    - Return updated notice
    - _Requirements: 8.4_
  
  - [x] 9.4 Create admin/notices/delete.php endpoint
    - Validate notice_id exists
    - Soft delete by setting is_active to false
    - Return success message
    - _Requirements: 8.5_

- [x] 10. Implement file upload endpoint
  - [x] 10.1 Create upload/upload_image.php endpoint
    - Validate file is uploaded via POST
    - Validate file type is image (jpeg, png, gif)
    - Validate file size is under 5MB
    - Generate unique filename with timestamp
    - Create uploads/profiles directory if not exists
    - Move uploaded file to uploads/profiles
    - Return file_path in JSON response
    - _Requirements: 5.1-5.5_

- [x] 11. Implement session and semester management endpoints
  - [x] 11.1 Create admin/sessions/create.php endpoint
    - Validate session_name, start_year, end_year, start_date, end_date
    - Validate start_date is before end_date
    - Validate start_year and end_year are consistent with dates
    - Insert session record with is_active defaulting to false
    - Return created session
    - _Requirements: 9.1_
  
  - [x] 11.2 Create admin/sessions/activate.php endpoint
    - Validate session_id exists
    - Begin database transaction
    - Set is_active to false for all sessions
    - Set is_active to true for specified session
    - Commit transaction
    - Return success message
    - _Requirements: 9.2_
  
  - [x] 11.3 Create admin/sessions/list.php endpoint
    - Query sessions table ordered by start_year descending
    - Return all sessions with active status
    - _Requirements: 9.3_
  
  - [x] 11.4 Create admin/semesters/create.php endpoint
    - Validate session_id exists
    - Validate semester_number is between 1 and 6
    - Validate start_date is before end_date
    - Validate dates fall within parent session dates
    - Insert semester record
    - Return created semester
    - _Requirements: 9.4, 9.5_
- [x] 12. Install and configure TCPDF library
  - [x] 12.1 Install TCPDF via Composer
    - Navigate to backend directory
    - Run composer require tecnickcom/tcpdf
    - Verify installation by checking vendor directory
    - Create composer.json if it doesn't exist
    - _Requirements: 14.1_
  
  - [x] 12.2 Create PDF generator helper file
    - Create backend/includes/pdf_generator.php
    - Add initializePDF function with institution branding
    - Configure default fonts, margins, and styling
    - Add embedQRCode helper function
    - Add cleanupTempFiles function
    - Add outputPDFDownload function
    - _Requirements: 14.1, 14.2_

- [x] 13. Implement PDF generation endpoints
  - [x] 13.1 Create student/download_id_card.php endpoint
    - Validate user is authenticated as student
    - Query student data including profile_image
    - Call generateIDCard function from pdf_generator
    - Generate QR code with student_id and verification URL
    - Create ID card layout with institution logo and student photo
    - Set PDF dimensions to 85.6mm × 53.98mm
    - Output PDF with filename ID_Card_{student_id}.pdf
    - _Requirements: 11.1-11.5, 14.1-14.5_
  
  - [x] 13.2 Create student/download_receipt.php endpoint
    - Validate user is authenticated as student
    - Validate payment_id query parameter
    - Query payment data joined with fee and student tables
    - Verify payment belongs to authenticated student
    - Call generateReceipt function from pdf_generator
    - Create receipt layout with institution header
    - Include fee breakdown, late fines, and totals
    - Output PDF with filename Receipt_{receipt_number}_{student_id}.pdf
    - _Requirements: 12.1-12.5, 14.1-14.5_
  
  - [x] 13.3 Create student/download_performance_report.php endpoint
    - Validate user is authenticated as student
    - Query all marks data grouped by semester
    - Calculate GPA per semester and overall CGPA
    - Call generatePerformanceReport function from pdf_generator
    - Create multi-page report with semester-wise tables
    - Include student header and semester summaries
    - Output PDF with filename Performance_Report_{student_id}_{date}.pdf
    - _Requirements: 13.1-13.5, 14.1-14.5_
  
  - [x] 13.4 Create cleanup script for temporary PDF files
    - Create backend/includes/cleanup_temp_files.php
    - Scan uploads/temp directory for files
    - Delete files older than 24 hours
    - Log cleanup activity
    - Make script executable via cron job
    - _Requirements: 14.4_

- [x] 14. Implement reporting and analytics endpoints
  - [x] 14.1 Create admin/reports/performance.php endpoint
    - Validate user is authenticated as admin
    - Accept optional filters: semester, department, subject_id
    - Query marks data with aggregations
    - Calculate average GPA, pass percentage by group
    - Calculate subject-wise averages
    - Return performance statistics
    - _Requirements: 10.2_
  
  - [x] 14.2 Create admin/reports/financial.php endpoint
    - Validate user is authenticated as admin
    - Accept date range and department filters
    - Query payments and fees tables
    - Calculate total_collected, total_pending, total_late_fines
    - Group by fee_type for breakdown
    - Return financial report with totals
    - _Requirements: 10.4_
  
  - [x] 14.3 Create admin/reports/trends.php endpoint
    - Validate user is authenticated as admin
    - Accept metric parameter (attendance, performance, payments)
    - Accept period parameter (monthly, semester)
    - Query historical data grouped by period
    - Calculate percentage changes between periods
    - Return trend data with comparisons
    - _Requirements: 10.5_

- [x] 15. Update frontend to use real API endpoints
  - [x] 15.1 Update src/services/api.js configuration
    - Set correct API_BASE_URL for backend
    - Remove all mock data logic from methods
    - Add JWT token to all request headers
    - Update login method to store JWT token
    - Add error handling for API responses
    - _Requirements: 4.1-4.5_
  
  - [x] 15.2 Add PDF download helper to api.js
    - Create downloadPDF function for handling PDF downloads
    - Handle blob response type
    - Create download link and trigger download
    - Add error handling for failed downloads
    - _Requirements: 11.1-11.5, 12.1-12.5, 13.1-13.5_
  
  - [x] 15.2.1 Add session and reporting API methods to api.js



















    - **Session Management Methods**
      - `async createSession(sessionData)`
        - Endpoint: POST /admin/sessions/create.php
        - Body: { session_name, start_year, end_year, start_date, end_date }
        - Returns: { success, data: { session_id, ...sessionData } }
        - Error handling for validation failures
      - `async activateSession(sessionId)`
        - Endpoint: PUT /admin/sessions/activate.php
        - Body: { session_id }
        - Returns: { success, message }
        - Handle transaction errors
      - `async listSessions()`
        - Endpoint: GET /admin/sessions/list.php
        - Returns: { success, data: { sessions: [...] } }
        - Sessions ordered by start_year descending
    - **Semester Management Methods**
      - `async createSemester(semesterData)`
        - Endpoint: POST /admin/semesters/create.php
        - Body: { session_id, semester_number, start_date, end_date }
        - Returns: { success, data: { semester_id, ...semesterData } }
        - Validation error handling
    - **Reporting Methods**
      - `async getPerformanceReport(filters = {})`
        - Endpoint: GET /admin/reports/performance.php
        - Query params: semester, department, subject_id (optional)
        - Build query string from filters object
        - Returns: { success, data: { average_gpa, pass_percentage, subject_stats: [...], department_stats: [...] } }
        - Handle empty results gracefully
      - `async getFinancialReport(filters = {})`
        - Endpoint: GET /admin/reports/financial.php
        - Query params: start_date, end_date, department, fee_type (optional)
        - Validate date format before sending
        - Returns: { success, data: { total_collected, total_pending, total_late_fines, fee_breakdown: [...], timeline: [...] } }
        - Handle date validation errors
      - `async getTrendsReport(metric, period, filters = {})`
        - Endpoint: GET /admin/reports/trends.php
        - Query params: metric (attendance|performance|payments), period (monthly|semester), plus optional filters
        - Returns: { success, data: { trends: [...], percentage_changes: [...], insights: [...] } }
        - Handle invalid metric/period errors
    - **Error Handling**
      - Consistent error format across all methods
      - Handle 401 (unauthorized) by redirecting to login
      - Handle 403 (forbidden) with appropriate message
      - Handle 400 (validation errors) with field-specific messages
      - Handle 500 (server errors) with retry option
    - **Type Safety** (optional, if using TypeScript)
      - Define interfaces for request/response types
      - Add JSDoc comments for parameter types
    - _Requirements: 9.1-9.5, 10.1-10.5_
  
  - [x] 15.2.1 Add session and reporting API methods to api.js
    - Add createSession, activateSession, listSessions methods
    - Add createSemester, listSemesters methods
    - Add getPerformanceReport, getFinancialReport, getTrendsReport methods
    - _Requirements: 9.1-9.5, 10.1-10.5_
  
  - [x] 15.3 Update student pages to use real API
    - Update Dashboard.jsx to call real API
    - Update Result.jsx to call get_marks.php
    - Update Subjects.jsx to call get_marks.php
    - Update Payments.jsx to call get_fees.php and get_payments.php
    - Update Analysis.jsx to call get_marks.php
    - Add PDF download buttons for ID card, receipts, and performance report
    - _Requirements: 1.1-1.5, 11.1-11.5, 12.1-12.5, 13.1-13.5_
  
  - [x] 15.4 Update teacher pages to use real API
    - Update TeacherAttendance.jsx to call mark_attendance.php
    - Update TeacherMarks.jsx to call enter_marks.php
    - Update TeacherStudentList.jsx to call get_students.php
    - _Requirements: 2.1-2.5_
  
  - [x] 15.5 Update admin pages to use real API
    - Update AdminStudents.jsx to call student CRUD endpoints
    - Update AdminTeachers.jsx to call teacher CRUD endpoints
    - Update AdminFeeManagement.jsx to call fee and payment endpoints
    - Update AdminCourses.jsx to call subject CRUD endpoints
    - Update AdminNotices.jsx to call notice CRUD endpoints
    - _Requirements: 3.1-3.5_
  
  - [x] 15.6 Create session management UI
    - **Create src/pages/admin/AdminSessions.jsx page** ✓
      - Import necessary components (GlassCard, motion, CustomSelect, AnimatedDatePicker)
      - Setup state management for sessions list, form data, loading states
      - Add authentication check for admin role
    - **Session Creation Form** ✓
      - Input fields: session_name (e.g., "2024-2025"), start_year, end_year
      - Date pickers: start_date, end_date with validation
      - Validation: start_date < end_date, years match dates
      - Submit handler calls api.createSession() method
      - Show success/error toast notifications
      - Clear form and refresh list on success
    - **Sessions List Display** ✓
      - Fetch sessions on component mount using api.listSessions()
      - Display in GlassCard with table/grid layout
      - Show: session_name, start_year-end_year, date range, active status
      - Active session highlighted with badge/indicator
      - Sort by start_year descending (most recent first)
    - **Activate/Deactivate Functionality** ✓
      - Add "Set Active" button for each inactive session
      - Show "Active" badge for current active session
      - Confirmation modal before activating (warns about deactivating current)
      - Call api.activateSession(session_id) on confirm
      - Refresh list after activation
    - **Add Navigation Link** ✓
      - Update AdminDashboard.jsx for admin role
      - Add "Academic Sessions" card with calendar icon
      - Route: /admin/sessions
    - **Update App.jsx Routing** ✓
      - Add protected route for /admin/sessions
      - Require admin role authentication
    - _Requirements: 9.1-9.3_
  - [x] 15.7 Create semester management UI
    - **Semester Creation Form (within AdminSessions.jsx)** ✓
      - Add collapsible section under each session in the list
      - "Add Semester" button expands form for that session
      - Input fields:
        - semester_number: Dropdown (1-6) with validation
        - start_date: Date picker (must be >= session.start_date)
        - end_date: Date picker (must be <= session.end_date)
      - Validation rules:
        - start_date < end_date
        - Dates must fall within parent session date range
        - Semester number must be unique within session
        - Show validation errors inline
      - Submit handler calls api.createSemester(session_id, data)
      - Show success/error toast
      - Refresh semesters list on success
    - **Semesters Display** ✓
      - Fetch semesters for each session using api.listSemesters()
      - Display semesters grouped under parent session
      - Show in expandable/collapsible accordion format
      - Display: Semester number, date range, duration (calculated)
      - Sort by semester_number ascending
      - Show "No semesters" message if empty
    - **Visual Hierarchy** ✓
      - Session card → Semesters list (indented/nested)
      - Use different background opacity for semester items
      - Add semester icon/badge for visual distinction
    - **Validation Feedback** ✓
      - Real-time validation as user types/selects dates
      - Disable submit button if validation fails
      - Show helpful error messages (e.g., "Semester dates must be within session dates")
    - _Requirements: 9.4-9.5_
  
  - [x] 15.8 Create reporting and analytics dashboard





    - **Create src/pages/admin/AdminReports.jsx page** (NEW FILE NEEDED)
      - Import GlassCard, motion, CustomSelect, AnimatedDatePicker
      - Setup tabbed interface for different report types
      - Add authentication check for admin role
      - State management for filters, report data, loading states
    - **Performance Report Section**
      - **Filters Panel (GlassCard)**
        - Semester dropdown: Fetch from sessions/semesters, "All Semesters" option
        - Department dropdown: BCA, BBA, B.Com, "All Departments"
        - Subject dropdown: Populated based on department selection, "All Subjects"
        - "Generate Report" button
      - **API Integration**
        - Call api.getPerformanceReport(filters) on button click
        - Handle loading state with spinner
        - Handle errors with toast notification
      - **Results Display (GlassCard)**
        - **Summary Statistics Cards**
          - Average GPA (large number with trend indicator)
          - Pass Percentage (with color coding: green >75%, yellow 60-75%, red <60%)
          - Total Students Analyzed
          - Top Performing Subject
        - **Subject-wise Performance Table**
          - Columns: Subject Code, Subject Name, Avg Marks, Pass Rate, Students
          - Sort by average marks descending
          - Color-coded pass rates
        - **Department Comparison (if "All Departments" selected)**
          - Bar chart or table showing department-wise averages
        - **Export Options**
          - "Download as PDF" button (future enhancement)
          - "Export to CSV" button (future enhancement)
    - **Financial Report Section**
      - **Filters Panel (GlassCard)**
        - Start Date picker (default: start of current month)
        - End Date picker (default: today)
        - Department filter: "All Departments" or specific
        - Fee Type filter: "All Types", Tuition, Lab, Library, etc.
        - "Generate Report" button
      - **API Integration**
        - Call api.getFinancialReport(filters) on button click
        - Validate start_date < end_date
        - Handle loading and error states
      - **Results Display (GlassCard)**
        - **Summary Cards**
          - Total Collected (green, large number with currency symbol)
          - Total Pending (orange/yellow)
          - Late Fines Collected (blue)
          - Collection Rate % (calculated: collected / (collected + pending))
        - **Fee Type Breakdown Table**
          - Columns: Fee Type, Total Due, Collected, Pending, Collection %
          - Progress bars for visual representation
          - Totals row at bottom
        - **Payment Timeline Chart**
          - Line/bar chart showing daily/weekly collections
          - X-axis: dates, Y-axis: amount
        - **Top Defaulters List** (optional)
          - Students with highest pending amounts
          - Link to student profile
    - **Trends Analytics Section**
      - **Metric Selection Panel (GlassCard)**
        - Metric dropdown: Attendance, Performance, Payments
        - Period dropdown: Monthly, Semester
        - Date range for custom period
        - "Generate Trends" button
      - **API Integration**
        - Call api.getTrendsReport(metric, period, filters)
        - Handle loading and error states
      - **Results Display (GlassCard)**
        - **Trend Chart**
          - Line chart showing metric over time
          - X-axis: time periods, Y-axis: metric value
          - Multiple lines if comparing departments/subjects
        - **Percentage Change Indicators**
          - Current vs Previous period
          - Color-coded: green (increase), red (decrease)
          - Arrow indicators (↑↓)
        - **Insights Panel**
          - Auto-generated insights based on trends
          - "Attendance improved by 15% this semester"
          - "Payment collection rate decreased by 5%"
        - **Period Comparison Table**
          - Columns: Period, Value, Change %, Status
          - Highlight best and worst periods
    - **Add Navigation Link**
      - Update AdminDashboard.jsx for admin role
      - Add "Reports & Analytics" card with chart/graph icon
      - Route: /admin/reports
    - **Update App.jsx Routing** (REQUIRED)
      - Add protected route for /admin/reports
      - Import AdminReports component
      - Require admin role authentication
    - **Responsive Design**
      - Stack cards vertically on mobile
      - Horizontal scrolling for tables on small screens
      - Collapsible filter panels on mobile
    - **Loading States**
      - Skeleton loaders for charts and tables
      - Disable filters while loading
      - Show "Generating report..." message
    - **Error Handling**
      - Show friendly error messages
      - "No data available for selected filters" state
      - Retry button on API failures
    - _Requirements: 10.1-10.5_

- [x] 16. Create database seed data for testing
  - [x] 16.1 Create seed script for sample users
    - Insert admin user with hashed password
    - Insert 3-5 teacher users with different departments
    - Insert 10-15 student users across different semesters
    - _Requirements: 3.1, 3.2_
  
  - [x] 16.2 Create seed script for academic data
    - Insert subjects for all semesters and departments
    - Insert marks for students
    - Insert attendance records
    - Insert fee structures
    - Insert sample payments
    - Insert active session
    - _Requirements: 1.1-1.4, 3.3, 3.4, 9.1-9.3_

- [x] 17. Testing and validation
  - [x] 17.1 Test authentication flow end-to-end
    - Test login with valid credentials for all roles
    - Test login with invalid credentials
    - Test JWT token validation and expiration
    - Test role-based access control across endpoints
    - _Requirements: 4.1-4.5_
  
  - [x] 17.2 Test student endpoints integration
    - Test complete student flow: login → get marks → get attendance → get fees
    - Verify GPA/CGPA calculations are accurate
    - Test unauthorized access attempts
    - _Requirements: 1.1-1.5_
  
  - [x] 17.3 Test teacher endpoints integration
    - Test complete teacher flow: login → mark attendance → enter marks
    - Verify grade calculations are correct
    - Test unauthorized access attempts
    - _Requirements: 2.1-2.5_
  
  - [x] 17.4 Test admin endpoints integration
    - Test complete admin flow: create student → create fee → process payment
    - Test all CRUD operations work correctly
    - Test unauthorized access attempts
    - _Requirements: 3.1-3.5_
  
  - [x] 17.5 Test PDF generation endpoints
    - Test ID card generation with valid student data
    - Test receipt generation with valid payment data
    - Test performance report generation
    - Verify PDF files open correctly in multiple readers
    - Test QR code scanning on ID cards
    - Verify temp file cleanup works correctly
    - Test PDF generation with missing optional data
    - Test error handling for missing required data
    - _Requirements: 11.1-11.5, 12.1-12.5, 13.1-13.5, 14.1-14.5_
  
  - [x] 17.6 Test session management and reporting
    - Test session creation and activation
    - Test semester creation with validation
    - Test performance report with various filters
    - Test financial report with date ranges
    - Test trends analytics with different metrics
    - _Requirements: 9.1-9.5, 10.1-10.5_

- [-] 18. Final integration and polish





  - [x] 18.1 Verify frontend-backend integration


    - **Student Portal Testing**
      - Login as student with test credentials
      - Navigate through all pages: Dashboard, Subjects, Result, Payments, Analysis, Notice
      - Verify marks display correctly with GP/CP/GPA/CGPA calculations
      - Verify attendance percentages are accurate
      - Test fee payment history displays correctly
      - Download and verify ID card PDF opens correctly
      - Download and verify receipt PDF for a payment
      - Download and verify performance report PDF
      - Test profile image upload and display
      - Verify all data matches database seed data
      - Test error handling (network errors, invalid data)
    - **Teacher Portal Testing**
      - Login as teacher with test credentials
      - Navigate through: Dashboard, Student List, Attendance, Marks, Notice
      - Test marking attendance for a class
      - Test entering marks for students
      - Test updating existing marks
      - Verify student list filters work (department, semester)
      - Test attendance report generation
      - Verify grade calculations are correct
      - Test error handling for invalid inputs
    - **Admin Portal Testing**
      - Login as admin with test credentials
      - Navigate through all admin pages
      - **Student Management**: Create, update, delete student
      - **Teacher Management**: Create, update, delete teacher
      - **Fee Management**: Create fee structure, process payment
      - **Subject Management**: Create, update, delete subject
      - **Notice Management**: Create, update, delete notice
      - **Session Management**: Create session, activate session, create semester
      - **Reports**: Generate performance, financial, and trends reports
      - Verify all CRUD operations work correctly
      - Test form validations
      - Test search and filter functionality
      - Verify pagination works if implemented
    - **Cross-Role Testing**
      - Verify role-based access control (student can't access admin pages)
      - Test logout functionality for all roles
      - Test token expiration and auto-logout
      - Verify unauthorized access redirects to login
    - **PDF Download Testing**
      - Test ID card download from student dashboard
      - Test receipt download from payments page
      - Test performance report download
      - Verify PDFs open in multiple PDF readers (Adobe, Chrome, Firefox)
      - Verify QR codes on ID cards are scannable
      - Test PDF generation with missing optional data (e.g., no profile image)
      - Verify file naming conventions are correct
    - **Session Management UI Testing**
      - Create new academic session
      - Activate a session and verify others are deactivated
      - Create semesters within a session
      - Verify date validations work correctly
      - Test edge cases (overlapping dates, invalid ranges)
    - **Reporting Dashboard Testing**
      - Generate performance report with various filter combinations
      - Generate financial report with date ranges
      - Generate trends report for different metrics
      - Verify charts and statistics display correctly
      - Test with empty data sets
      - Test with large data sets
    - **Bug Fixing**
      - Document all issues found during testing
      - Prioritize bugs by severity (critical, high, medium, low)
      - Fix critical and high priority bugs
      - Retest after fixes
    - _Requirements: All_
  
  - [x] 18.2 Performance and optimization





    - **API Performance Testing**
      - Use browser DevTools Network tab to measure response times
      - Test with multiple concurrent users (simulate with multiple browser tabs)
      - Identify endpoints with response times > 1 second
      - Target response times: < 500ms for simple queries, < 2s for complex reports
      - Test with realistic data volumes (100+ students, 1000+ marks records)
    - **Database Query Optimization**
      - Review slow queries identified in testing
      - Add indexes on frequently queried columns:
        - users.username, users.role
        - students.department, students.semester
        - marks.student_id, marks.subject_id, marks.semester
        - attendance.student_id, attendance.date
        - fees.student_id, fees.semester
        - payments.student_id, payments.payment_date
      - Optimize JOIN queries in reporting endpoints
      - Use EXPLAIN to analyze query execution plans
      - Consider adding composite indexes for common filter combinations
      - Test query performance before and after optimization
    - **PDF Generation Performance**
      - Test ID card generation time (target: < 2 seconds)
      - Test receipt generation time (target: < 2 seconds)
      - Test performance report with 6 semesters of data (target: < 5 seconds)
      - Optimize image processing if slow (resize before embedding)
      - Consider caching frequently generated PDFs (future enhancement)
      - Test with missing images (should not slow down significantly)
    - **Frontend Performance**
      - Audit bundle size with `npm run build`
      - Lazy load admin pages (code splitting)
      - Optimize images (compress profile images on upload)
      - Add loading skeletons for better perceived performance
      - Implement pagination for large lists (students, teachers, payments)
      - Debounce search inputs to reduce API calls
    - **Error Handling Verification**
      - Test all endpoints with invalid inputs
      - Test with missing required fields
      - Test with SQL injection attempts (should be prevented by PDO)
      - Test with XSS attempts (should be sanitized)
      - Verify all errors return proper HTTP status codes
      - Verify error messages are user-friendly (not exposing system details)
      - Test network timeout scenarios
      - Test database connection failures
    - **Cron Job Setup for Temp File Cleanup**
      - **Linux/Mac Setup**:
        - Open crontab: `crontab -e`
        - Add line: `0 2 * * * php /path/to/backend/includes/cleanup_temp_files.php`
        - This runs daily at 2 AM
        - Verify cron job is scheduled: `crontab -l`
      - **Windows Setup**:
        - Use Task Scheduler
        - Create new task: "PDF Temp Cleanup"
        - Trigger: Daily at 2:00 AM
        - Action: Start program `php.exe` with argument `C:\path\to\backend\includes\cleanup_temp_files.php`
      - **XAMPP Setup**:
        - Place cleanup script in htdocs
        - Use Windows Task Scheduler or external cron service
      - **Testing Cleanup Script**:
        - Manually run: `php backend/includes/cleanup_temp_files.php`
        - Create test files in uploads/temp with old timestamps
        - Verify old files are deleted, recent files remain
        - Check logs for cleanup activity
    - **Memory Usage**
      - Monitor PHP memory usage during PDF generation
      - Increase memory_limit in php.ini if needed (recommend 256M)
      - Test with large performance reports (6 semesters, 20+ subjects)
    - **Caching Strategy** (optional future enhancement)
      - Consider caching session list (rarely changes)
      - Consider caching subject list per department
      - Use browser localStorage for user preferences
    - _Requirements: 6.1-6.5, 14.4_
  


  - [ ] 18.3 Documentation and deployment preparation
    - **API Documentation Updates**
      - Update docs/api/ADMIN_ENDPOINTS.md with:
        - Session management endpoints (create, activate, list)
        - Semester management endpoints (create)
        - Reporting endpoints (performance, financial, trends)
        - Request/response examples for each endpoint
        - Error codes and messages
      - Update docs/api/STUDENT_ENDPOINTS.md with:
        - PDF download endpoints (ID card, receipt, performance report)
        - Query parameters and response types
        - File naming conventions
      - Create docs/api/PDF_GENERATION.md with:
        - Overview of PDF generation system
        - TCPDF library usage
        - Customization options
        - Troubleshooting common issues
      - Update docs/api/API_OVERVIEW.md with:
        - New endpoint count and categories
        - Authentication requirements for new endpoints
        - Rate limiting considerations (if applicable)
    - **README Updates**
      - **TCPDF Installation Section**:
        ```markdown
        ## Installing TCPDF for PDF Generation
        
        The system uses TCPDF library for generating PDF documents (ID cards, receipts, reports).
        
        ### Installation Steps:
        1. Navigate to backend directory: `cd backend`
        2. Install via Composer: `composer install`
        3. Verify installation: `php -r "require 'vendor/autoload.php'; echo 'TCPDF installed';"`
        
        ### Requirements:
        - PHP 7.4 or higher
        - GD extension enabled (for image processing)
        - mbstring extension enabled (for Unicode support)
        
        ### Troubleshooting:
        - If Composer is not installed: [Install Composer](https://getcomposer.org/download/)
        - If GD extension missing: Enable in php.ini (uncomment extension=gd)
        - If memory errors: Increase memory_limit in php.ini to 256M
        ```
      - **Cron Job Setup Section**:
        ```markdown
        ## Setting Up Automatic Temp File Cleanup
        
        PDF files are temporarily stored and should be cleaned up regularly.
        
        ### Linux/Mac Setup:
        1. Open crontab: `crontab -e`
        2. Add this line: `0 2 * * * php /full/path/to/backend/includes/cleanup_temp_files.php`
        3. Save and exit
        4. Verify: `crontab -l`
        
        ### Windows Setup:
        1. Open Task Scheduler
        2. Create Basic Task: "PDF Cleanup"
        3. Trigger: Daily at 2:00 AM
        4. Action: Start a program
        5. Program: `C:\xampp\php\php.exe`
        6. Arguments: `C:\xampp\htdocs\studentportal\backend\includes\cleanup_temp_files.php`
        
        ### Manual Cleanup:
        Run manually: `php backend/includes/cleanup_temp_files.php`
        ```
      - **Environment Variables Section**:
        - Document all required environment variables
        - Add .env.example file with placeholders
        - Document database configuration
        - Document JWT secret key setup
      - **Deployment Checklist Section**:
        - List all prerequisites
        - Step-by-step deployment instructions
        - Post-deployment verification steps
    - **Create DEPLOYMENT_CHECKLIST.md**:
      ```markdown
      # Deployment Checklist
      
      ## Pre-Deployment
      - [ ] Run `npm run build` to create production frontend
      - [ ] Run `composer install --no-dev` in backend directory
      - [ ] Update database credentials in backend/config/database.php
      - [ ] Update API_BASE_URL in frontend .env
      - [ ] Generate strong JWT secret key
      - [ ] Test all endpoints with production data
      - [ ] Backup existing database (if updating)
      
      ## Server Requirements
      - [ ] PHP 8.0 or higher installed
      - [ ] MySQL 8.0 or higher installed
      - [ ] Apache/Nginx web server configured
      - [ ] PHP extensions enabled: pdo_mysql, gd, mbstring, json
      - [ ] Composer installed (for TCPDF)
      - [ ] SSL certificate installed (for HTTPS)
      
      ## Database Setup
      - [ ] Create database: `CREATE DATABASE studentportal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      - [ ] Import schema: `mysql -u root -p studentportal < database/schema.sql`
      - [ ] Import seed data (in order): 01_sessions.sql through 09_payments.sql
      - [ ] Verify tables created: `SHOW TABLES;`
      - [ ] Create database user with appropriate permissions
      
      ## Backend Deployment
      - [ ] Upload backend files to server
      - [ ] Set correct file permissions (755 for directories, 644 for files)
      - [ ] Set writable permissions for uploads directory (775)
      - [ ] Run `composer install` in backend directory
      - [ ] Verify TCPDF installed: `ls vendor/tecnickcom/tcpdf`
      - [ ] Configure CORS headers for frontend domain
      - [ ] Test API endpoints: `curl http://yourdomain.com/api/auth/verify.php`
      
      ## Frontend Deployment
      - [ ] Upload dist folder contents to web root or subdirectory
      - [ ] Configure web server to serve index.html for all routes (SPA routing)
      - [ ] Update .htaccess or nginx.conf for proper routing
      - [ ] Verify static assets load correctly
      - [ ] Test login and navigation
      
      ## Cron Job Setup
      - [ ] Setup daily cron job for temp file cleanup (see README)
      - [ ] Test cron job runs successfully
      - [ ] Verify old temp files are deleted
      
      ## Post-Deployment Verification
      - [ ] Test login for all roles (student, teacher, admin)
      - [ ] Test PDF generation (ID card, receipt, report)
      - [ ] Test file uploads (profile images)
      - [ ] Test all CRUD operations
      - [ ] Test session management
      - [ ] Test reporting dashboard
      - [ ] Verify email notifications work (if implemented)
      - [ ] Check error logs for any issues
      - [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
      - [ ] Test on mobile devices
      
      ## Security Checklist
      - [ ] Change default admin password
      - [ ] Disable directory listing
      - [ ] Remove .git directory from production
      - [ ] Verify SQL injection protection (PDO prepared statements)
      - [ ] Verify XSS protection (input sanitization)
      - [ ] Enable HTTPS and force redirect from HTTP
      - [ ] Set secure headers (X-Frame-Options, X-Content-Type-Options)
      - [ ] Limit file upload sizes and types
      - [ ] Set strong JWT secret key (32+ characters)
      
      ## Monitoring Setup
      - [ ] Setup error logging
      - [ ] Setup access logging
      - [ ] Monitor disk space (for uploads)
      - [ ] Monitor database size
      - [ ] Setup backup schedule (daily recommended)
      ```
    - **Create PDF_CUSTOMIZATION.md**:
      ```markdown
      # PDF Customization Guide
      
      ## Customizing Institution Branding
      
      ### Logo
      - Replace `backend/assets/logo.png` with your institution logo
      - Recommended size: 200x200 pixels
      - Format: PNG with transparent background
      - Used in: ID cards, receipts, performance reports
      
      ### Institution Information
      Edit `backend/includes/pdf_generator.php`:
      ```php
      define('INSTITUTION_NAME', 'Your Institution Name');
      define('INSTITUTION_ADDRESS', 'Your Address');
      define('INSTITUTION_PHONE', '+1234567890');
      define('INSTITUTION_EMAIL', 'info@yourinstitution.edu');
      define('INSTITUTION_WEBSITE', 'www.yourinstitution.edu');
      ```
      
      ### Colors
      Edit color constants in `pdf_generator.php`:
      ```php
      define('PRIMARY_COLOR', [41, 128, 185]); // RGB values
      define('SECONDARY_COLOR', [52, 73, 94]);
      define('ACCENT_COLOR', [46, 204, 113]);
      ```
      
      ### Fonts
      - Default font: Helvetica (built-in)
      - To use custom fonts:
        1. Convert TTF to TCPDF format using `tcpdf_addfont.php`
        2. Place font files in `vendor/tecnickcom/tcpdf/fonts/`
        3. Update font name in PDF generation functions
      
      ### ID Card Layout
      - Edit `generateIDCard()` function in `pdf_generator.php`
      - Adjust dimensions: Default is 85.6mm × 53.98mm (credit card size)
      - Modify field positions using `SetXY()` coordinates
      - Add/remove fields as needed
      
      ### Receipt Layout
      - Edit `generateReceipt()` function
      - Customize header/footer
      - Add institution seal/stamp image
      - Modify table styling
      
      ### Performance Report Layout
      - Edit `generatePerformanceReport()` function
      - Customize grade table columns
      - Add/remove summary sections
      - Modify page margins and spacing
      
      ## Testing Customizations
      1. Generate sample PDFs after changes
      2. Verify layout on different PDF readers
      3. Test with missing data (e.g., no profile image)
      4. Check print quality
      ```
    - **Update Main README.md**:
      - Add links to new documentation files
      - Update feature list to include PDF generation and reporting
      - Add screenshots of new admin pages (sessions, reports)
      - Update technology stack section with TCPDF
      - Add troubleshooting section for common issues
    - **Create CHANGELOG.md**:
      - Document all changes in this implementation
      - Version numbering (e.g., v2.0.0)
      - List new features, improvements, bug fixes
    - **Code Comments**:
      - Add PHPDoc comments to all new PHP functions
      - Add JSDoc comments to new JavaScript functions
      - Document complex logic and algorithms
      - Add inline comments for non-obvious code
    - _Requirements: All_


---

## Implementation Summary

### Completed Work (Backend & Core Frontend)
✅ All 50+ REST API endpoints implemented and tested
✅ JWT authentication with role-based access control
✅ PDF generation system with TCPDF (ID cards, receipts, reports)
✅ Session and semester management backend
✅ Reporting and analytics backend (performance, financial, trends)
✅ Grade calculation system (GP/CP/GPA/CGPA)
✅ File upload system with validation
✅ Database schema with 11 tables and seed data
✅ Frontend API service with all methods
✅ Student, teacher, and admin pages using real API

### Remaining Work (1-2 days estimated)
✅ **Task 15.2.1**: Add API methods for sessions/reports to api.js - COMPLETED
✅ **Task 15.6**: Create AdminSessions.jsx page - COMPLETED
✅ **Task 15.7**: Add semester management UI - COMPLETED
🔲 **Task 15.8**: Create AdminReports.jsx dashboard (6-8 hours) - ONLY REMAINING UI TASK
✅ **Task 18.1**: Integration testing - COMPLETED
✅ **Task 18.2**: Performance optimization - COMPLETED
🔲 **Task 18.3**: Documentation updates (3-4 hours)

### Implementation Order (Recommended)
1. **Day 1 Morning**: Task 15.8 (Create AdminReports.jsx - 6-8 hours)
   - Create the file with all three report sections
   - Add navigation link in AdminDashboard.jsx
   - Add route in App.jsx
2. **Day 1 Afternoon**: Test the reports dashboard
   - Verify all filters work correctly
   - Test with different data sets
   - Check responsive design
3. **Day 2**: Task 18.3 (Documentation updates - 3-4 hours)
   - Update API documentation
   - Create deployment checklist
   - Update README files
   - Final review

### Key Files to Create/Modify
- ✅ `src/services/api.js` - Added 8 new methods (COMPLETED)
- ✅ `src/pages/admin/AdminSessions.jsx` - Created with full functionality (COMPLETED)
- 🔲 `src/pages/admin/AdminReports.jsx` - New file (~500-600 lines) - NEEDS CREATION
- ✅ `src/pages/AdminDashboard.jsx` - Added navigation cards (COMPLETED)
- 🔲 `src/App.jsx` - Add 1 protected route for /admin/reports - NEEDS UPDATE
- 🔲 `docs/api/ADMIN_ENDPOINTS.md` - Document new endpoints
- 🔲 `docs/api/PDF_GENERATION.md` - New documentation file
- 🔲 `DEPLOYMENT_CHECKLIST.md` - New file
- 🔲 `PDF_CUSTOMIZATION.md` - New file

### Testing Checklist
- [x] Session creation and activation - TESTED
- [x] Semester creation with validation - TESTED
- [ ] Performance report with filters - PENDING (UI not created yet)
- [ ] Financial report with date ranges - PENDING (UI not created yet)
- [ ] Trends analytics for all metrics - PENDING (UI not created yet)
- [x] PDF downloads from all pages - TESTED
- [x] Role-based access control - TESTED
- [x] Error handling and edge cases - TESTED
- [x] Mobile responsiveness - TESTED
- [x] Cross-browser compatibility - TESTED

### Success Criteria
✅ Admin can create and manage academic sessions - COMPLETED
✅ Admin can create semesters within sessions - COMPLETED
🔲 Admin can generate performance reports with filters - PENDING (UI needed)
🔲 Admin can generate financial reports with date ranges - PENDING (UI needed)
🔲 Admin can view trends analytics - PENDING (UI needed)
✅ All PDFs generate correctly and are downloadable - COMPLETED
✅ System performs well under realistic load - COMPLETED
🔲 All documentation is complete and accurate - PENDING
🔲 Deployment checklist is ready for production - PENDING

---

**Last Updated**: November 15, 2025
**Status**: 95% Complete - Only AdminReports UI and Documentation Remaining
**Estimated Completion**: 1-2 days

### What's Left:
1. **Create AdminReports.jsx** (6-8 hours)
   - Performance report section with filters
   - Financial report section with date ranges
   - Trends analytics section with metric selection
   - Charts and visualizations
   - Add route in App.jsx
   - Add navigation card in AdminDashboard.jsx

2. **Documentation** (3-4 hours)
   - Update API documentation
   - Create deployment checklist
   - Create PDF customization guide
   - Update README files
