# Database Seed Data

This directory contains SQL scripts to populate the database with sample data for development and testing.

## Import Order

**IMPORTANT**: Import these files in the exact order listed below to maintain referential integrity:

```bash
# 1. Create sessions (academic years)
mysql -u root -p studentportal < database/seeds/01_sessions.sql

# 2. Create super admin account
mysql -u root -p studentportal < database/seeds/02_admin.sql

# 3. Create sample teachers
mysql -u root -p studentportal < database/seeds/03_teachers.sql

# 4. Create sample students
mysql -u root -p studentportal < database/seeds/04_students.sql

# 5. Create subjects for all semesters
mysql -u root -p studentportal < database/seeds/05_subjects.sql

# 6. Create marks records
mysql -u root -p studentportal < database/seeds/06_marks.sql

# 7. Create attendance records
mysql -u root -p studentportal < database/seeds/07_attendance.sql

# 8. Create fee structures
mysql -u root -p studentportal < database/seeds/08_fees.sql

# 9. Create payment records
mysql -u root -p studentportal < database/seeds/09_payments.sql
```

## Import All at Once

You can import all seed files in one command:

```bash
# Windows (PowerShell)
Get-Content database\seeds\*.sql | mysql -u root -p studentportal

# Linux/Mac
cat database/seeds/*.sql | mysql -u root -p studentportal
```

## Default Credentials

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`
- **Email**: `admin@studentportal.edu`

### Teacher Accounts
- **Username**: `prof.sharma` | Password: `teacher123`
- **Username**: `prof.patel` | Password: `teacher123`
- **Username**: `prof.kumar` | Password: `teacher123`

### Student Accounts
- **Username**: `student001` | Password: `student123`
- **Username**: `student002` | Password: `student123`
- **Username**: `student003` | Password: `student123`
- **Username**: `student004` | Password: `student123`
- **Username**: `student005` | Password: `student123`
- **Username**: `student006` | Password: `student123`

## Sample Data Overview

### Sessions
- 2024-2025 (Active)
- 2023-2024 (Inactive)
- 2022-2023 (Inactive)

### Users
- 1 Admin
- 3 Teachers
- 6 Students across different semesters (1, 3, 5)

### Subjects
- 30 subjects total
- 5 subjects per semester (Semesters 1-6)
- All subjects for BCA (Bachelor of Computer Applications) program

### Marks
- Marks for 4 students (STU2024001, STU2024002, STU2024003, STU2024004)
- 5 subjects per student
- Grades range from B to A+

### Attendance
- Attendance records for last 30 days
- Multiple subjects per student
- Varying attendance percentages (75% to 100%)

### Fees
- Tuition fees (odd semesters: ₹18,000, even semesters: ₹15,000)
- Examination fees (₹2,000)
- Lab fees (₹1,500)
- Library fee (₹500, annual)
- Project fees (minor: ₹3,000, major: ₹5,000)
- Infrastructure and sports fees (annual)

### Payments
- 15+ payment records
- Mix of on-time and late payments
- Various payment methods (online, cash, card)
- Some students have pending fees

## Notes

1. **Passwords**: All passwords are hashed using bcrypt. The plaintext passwords are listed above for testing.
2. **Session ID**: The active session (2024-2025) is used for all current data.
3. **Student IDs**: Follow the format `STU2024001`, `STU2024002`, etc.
4. **Teacher IDs**: Follow the format `TCH2024001`, `TCH2024002`, etc.
5. **Admin IDs**: Follow the format `ADM2024001`
6. **Receipt Numbers**: Follow the format `RCP20241114001`

## Resetting Data

To reset the database and re-import seed data:

```bash
# Drop all data (WARNING: This deletes everything!)
mysql -u root -p studentportal < database/schema.sql

# Re-import seed data
# (Run the import commands listed above)
```

## Production Deployment

**SECURITY WARNING**: Do NOT use these seed files in production!

- Change all default passwords
- Delete or disable test accounts
- Use strong, unique passwords for the admin account
- Remove sample student and teacher data

---

**Last Updated**: November 14, 2024
