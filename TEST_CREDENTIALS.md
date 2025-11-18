# Test Login Credentials

## Quick Test Accounts (Simple Credentials)

### Admin Account
```
Username: admin
Password: admin
Role: Admin
```

### Teacher Account
```
Username: teacher
Password: teacher
Role: Teacher
```

### Student Account
```
Username: student
Password: student
Role: Student
```

## Important Notes

### Role-Based Login Validation ✅

The login system now validates that the selected role matches the user's actual role:

- If you select **"Student"** on the login page but enter **admin** credentials, you will get an error:
  > "You are trying to login as student but your account is registered as admin. Please select the correct role."

- If you select **"Teacher"** on the login page but enter **student** credentials, you will get an error:
  > "You are trying to login as teacher but your account is registered as student. Please select the correct role."

- If you select **"Admin"** on the login page but enter **teacher** credentials, you will get an error:
  > "You are trying to login as admin but your account is registered as teacher. Please select the correct role."

**This ensures users can only access their designated portal!**

## Other Real Credentials (For Testing Multiple Users)

All other teachers and students retain their original credentials:

### Other Teachers
- Username: `prof.patel`, `prof.kumar`, etc.
- Password: `teacher123`

### Other Students  
- Username: `STU2024001`, `STU2024002`, etc.
- Password: `student123`

## How to Login

1. Go to `http://localhost:5173/login`
2. **Select the correct role** (Student, Teacher, or Admin)
3. Enter the username and password
4. Click "Log In"

### Example Login Flow

**Correct Login:**
1. Select "Student" → Enter `student` / `student` → ✅ Success → Redirects to Student Dashboard

**Incorrect Login (Role Mismatch):**
1. Select "Student" → Enter `admin` / `admin` → ❌ Error: "You are trying to login as student but your account is registered as admin. Please select the correct role."

**Correct Login After Fixing:**
1. Select "Admin" → Enter `admin` / `admin` → ✅ Success → Redirects to Admin Dashboard

## Testing the Features

### As Student (student/student)
- View Dashboard with GPA and Attendance
- Check Subjects and Results
- View Payments with Three-Tier Deadline System
- Access Virtual 3D ID Card (click to flip)
- View Notices

### As Teacher (teacher/teacher)
- View Teacher Dashboard
- Manage Assignments (create, view submissions)
- Enter Marks (with grid interface)
- Mark Attendance
- View Student Lists

### As Admin (admin/admin)
- View Admin Dashboard
- Manage Students and Teachers
- Fee Management with Three-Tier Deadline System
- Send Fee Notices
- Process Payments
- Manage Courses and Sessions
- View Reports

## Security Features

✅ **Password Hashing**: All passwords are hashed using bcrypt (PASSWORD_DEFAULT)
✅ **JWT Authentication**: Secure token-based authentication
✅ **Role Validation**: Selected role must match user's actual role
✅ **Active Status Check**: Only active accounts can login
✅ **Protected Routes**: Each route validates user role before access

## Database Details

- **Database Name**: studentportal
- **Admin User ID**: 1
- **Teacher User ID**: 2  
- **Student User ID**: 5

All test accounts are active and ready to use!
