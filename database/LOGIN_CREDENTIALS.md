# Login Credentials Reference

## Quick Access Credentials

### Admin Account
```
Username: admin
Password: admin123
Email: admin@college.edu.in
Role: Super Administrator
Permissions: Full access to all features
```

### Sample Teacher Accounts
```
Username: advik3810
Password: teacher123
Department: Electronics
Designation: Assistant Professor

Username: charan9388
Password: teacher123
Department: Computer Science
Designation: Associate Professor

Username: alexander7537
Password: teacher123
Department: Electrical
Designation: Lecturer

Username: ira9110
Password: teacher123
Department: Civil
Designation: Associate Professor

Username: aarini8136
Password: teacher123
Department: Civil
Designation: Professor
```

### Sample Student Accounts
```
Username: civ230001
Password: student123
Name: Yasti Nayak
Department: Civil
Batch: 2023

Username: mec250002
Password: student123
Name: Imaran Goda
Department: Mechanical
Batch: 2025

Username: mec230003
Password: student123
Name: Yoshita Sundaram
Department: Mechanical
Batch: 2023

Username: civ250004
Password: student123
Name: Sarthak Bhatia
Department: Civil
Batch: 2025

Username: com250005
Password: student123
Name: Samaksh Gandhi
Department: Computer Science
Batch: 2025
```

## Username Patterns

### Admin
- **Pattern:** `admin`
- **Count:** 1

### Teachers
- **Pattern:** `[firstname][last4digits]`
- **Example:** `rajesh5432`, `priya8901`
- **Count:** 100
- **Password:** `teacher123` (all teachers)

### Students
- **Pattern:** `[student_id]` (lowercase)
- **Format:** `[dept_code][year][number]`
- **Examples:**
  - `com22001` - Computer Science, 2022 batch, student #1
  - `ele23045` - Electronics, 2023 batch, student #45
  - `mec24123` - Mechanical, 2024 batch, student #123
  - `civ25200` - Civil, 2025 batch, student #200
  - `ele22500` - Electrical, 2022 batch, student #500
- **Count:** 1,000
- **Password:** `student123` (all students)

## Department Codes

| Department | Code | Students | Teachers |
|------------|------|----------|----------|
| Computer Science | COM | ~200 | ~20 |
| Electronics | ELE | ~200 | ~20 |
| Mechanical | MEC | ~200 | ~20 |
| Civil | CIV | ~200 | ~20 |
| Electrical | ELE | ~200 | ~20 |

## Batch Years

| Batch | Year | Current Semester | Students |
|-------|------|------------------|----------|
| 2022 | 2022-23 | 5-6 | ~333 |
| 2023 | 2023-24 | 3-4 | ~333 |
| 2024 | 2024-25 | 1-2 | ~334 |

## Finding Specific Users

### To find all teachers in a department:
```sql
SELECT u.username, t.first_name, t.last_name, t.designation 
FROM users u 
JOIN teachers t ON u.id = t.user_id 
WHERE t.department = 'Computer Science';
```

### To find all students in a department:
```sql
SELECT u.username, s.first_name, s.last_name, s.student_id, s.semester 
FROM users u 
JOIN students s ON u.id = s.user_id 
WHERE s.department = 'Computer Science';
```

### To find students by batch year:
```sql
SELECT u.username, s.first_name, s.last_name, s.student_id 
FROM users u 
JOIN students s ON u.id = s.user_id 
WHERE s.batch_year = 2023;
```

## Testing Recommendations

### Test Admin Features
1. Login as `admin` / `admin123`
2. Test user management (view students, teachers)
3. Test fee management
4. Test payment processing
5. Test report generation

### Test Teacher Features
1. Login as any teacher (e.g., `charan9388` / `teacher123`)
2. Test viewing assigned subjects
3. Test marking attendance
4. Test entering marks
5. Test viewing student lists

### Test Student Features
1. Login as any student (e.g., `com250005` / `student123`)
2. Test viewing marks and GPA
3. Test viewing attendance
4. Test viewing fee status
5. Test downloading receipts
6. Test viewing virtual ID card

## Security Notes

⚠️ **Important:** These are development/testing credentials only!

- All passwords are simple and identical within each role
- In production, enforce strong password policies
- Implement password reset functionality
- Add two-factor authentication for admin accounts
- Use environment variables for sensitive data
- Implement account lockout after failed attempts

## Password Hashing

All passwords are hashed using SHA-256 before storage:
- `admin123` → SHA-256 hash
- `teacher123` → SHA-256 hash
- `student123` → SHA-256 hash

## Quick Login URLs

Assuming the application runs on `http://localhost:5173`:

- **Admin Portal:** `http://localhost:5173/admin/login`
- **Teacher Portal:** `http://localhost:5173/teacher/login`
- **Student Portal:** `http://localhost:5173/login`

## Support

For issues with login credentials:
1. Verify the database is running: `docker ps`
2. Check user exists: `SELECT * FROM users WHERE username = 'admin';`
3. Verify password hash matches
4. Check user status is 'active'
5. Regenerate data if needed: `python database/generate_realistic_data.py`

---

**Last Updated:** November 14, 2025
**Total Users:** 1,101 (1 admin + 100 teachers + 1,000 students)
**Status:** ✓ ACTIVE
