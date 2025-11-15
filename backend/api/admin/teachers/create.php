<?php
/**
 * Create Teacher API
 * Creates a new teacher account with user record
 * Method: POST
 * Auth: Required (admin role)
 * Body: Complete teacher information including credentials
 */

// Include required files
require_once '../../../config/database.php';
require_once '../../../includes/cors.php';
require_once '../../../includes/auth.php';
require_once '../../../includes/functions.php';
require_once '../../../includes/validation.php';

// Verify authentication
$user = verifyAuth();
if (!$user) {
    sendError('Unauthorized - Invalid or missing token', 'unauthorized', 401);
}

// Check role
if ($user['role'] !== 'admin') {
    sendError('Forbidden - This endpoint is only accessible to admins', 'forbidden', 403);
}

// Get request body
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    sendError('Invalid JSON data', 'invalid_json', 400);
}

try {
    // Validate required fields
    $required = [
        'username', 'password', 'email', 'first_name', 'last_name',
        'date_of_birth', 'gender', 'phone', 'joining_date',
        'department', 'designation'
    ];
    $missing = validateRequired($required, $data);
    
    if (!empty($missing)) {
        sendError('Missing required fields: ' . implode(', ', $missing), 'validation_error', 400, ['missing_fields' => $missing]);
    }
    
    // Extract and validate data
    $username = trim($data['username']);
    $password = $data['password'];
    $email = trim($data['email']);
    $firstName = trim($data['first_name']);
    $lastName = trim($data['last_name']);
    $dateOfBirth = trim($data['date_of_birth']);
    $gender = strtolower(trim($data['gender']));
    $phone = trim($data['phone']);
    $address = isset($data['address']) ? trim($data['address']) : null;
    $joiningDate = trim($data['joining_date']);
    $department = trim($data['department']);
    $designation = trim($data['designation']);
    $qualification = isset($data['qualification']) ? trim($data['qualification']) : null;
    $specialization = isset($data['specialization']) ? trim($data['specialization']) : null;
    $experienceYears = isset($data['experience_years']) ? (int) $data['experience_years'] : null;
    
    // Validate username
    if (!validateUsername($username)) {
        sendError('Invalid username format. Must be 3-50 alphanumeric characters', 'invalid_username', 400);
    }
    
    // Validate password
    $passwordValidation = validatePassword($password);
    if (!$passwordValidation['valid']) {
        sendError($passwordValidation['message'], 'invalid_password', 400);
    }
    
    // Validate email
    if (!validateEmail($email)) {
        sendError('Invalid email format', 'invalid_email', 400);
    }
    
    // Validate phone
    if (!validatePhone($phone)) {
        sendError('Invalid phone number format', 'invalid_phone', 400);
    }
    
    // Validate dates
    if (!validateDate($dateOfBirth)) {
        sendError('Invalid date of birth format. Use YYYY-MM-DD', 'invalid_date', 400);
    }
    
    if (!validateDate($joiningDate)) {
        sendError('Invalid joining date format. Use YYYY-MM-DD', 'invalid_date', 400);
    }
    
    // Validate gender
    if (!validateGender($gender)) {
        sendError('Invalid gender. Must be male, female, or other', 'invalid_gender', 400);
    }
    
    // Get database connection
    $database = new Database();
    $db = $database->getConnection();
    
    // Check if username already exists
    if (usernameExists($username, $db)) {
        sendError('Username already exists', 'username_exists', 409);
    }
    
    // Check if email already exists
    if (emailExists($email, $db)) {
        sendError('Email already exists', 'email_exists', 409);
    }
    
    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
    
    // Generate unique teacher ID
    $teacherId = generateUniqueId('TCH', $db, 'teachers', 'teacher_id');
    
    // Start transaction
    $db->beginTransaction();
    
    try {
        // Insert user record
        $userQuery = "INSERT INTO users (username, password, email, role, status) 
                      VALUES (:username, :password, :email, 'teacher', 'active')";
        
        $userStmt = $db->prepare($userQuery);
        $userStmt->bindParam(':username', $username, PDO::PARAM_STR);
        $userStmt->bindParam(':password', $hashedPassword, PDO::PARAM_STR);
        $userStmt->bindParam(':email', $email, PDO::PARAM_STR);
        
        if (!$userStmt->execute()) {
            throw new Exception('Failed to create user account');
        }
        
        $userId = $db->lastInsertId();
        
        // Insert teacher record
        $teacherQuery = "INSERT INTO teachers 
                        (user_id, teacher_id, first_name, last_name, date_of_birth, gender, 
                         phone, address, joining_date, department, designation, qualification,
                         specialization, experience_years)
                        VALUES 
                        (:user_id, :teacher_id, :first_name, :last_name, :date_of_birth, :gender,
                         :phone, :address, :joining_date, :department, :designation, :qualification,
                         :specialization, :experience_years)";
        
        $teacherStmt = $db->prepare($teacherQuery);
        $teacherStmt->bindParam(':user_id', $userId, PDO::PARAM_INT);
        $teacherStmt->bindParam(':teacher_id', $teacherId, PDO::PARAM_STR);
        $teacherStmt->bindParam(':first_name', $firstName, PDO::PARAM_STR);
        $teacherStmt->bindParam(':last_name', $lastName, PDO::PARAM_STR);
        $teacherStmt->bindParam(':date_of_birth', $dateOfBirth, PDO::PARAM_STR);
        $teacherStmt->bindParam(':gender', $gender, PDO::PARAM_STR);
        $teacherStmt->bindParam(':phone', $phone, PDO::PARAM_STR);
        $teacherStmt->bindParam(':address', $address, PDO::PARAM_STR);
        $teacherStmt->bindParam(':joining_date', $joiningDate, PDO::PARAM_STR);
        $teacherStmt->bindParam(':department', $department, PDO::PARAM_STR);
        $teacherStmt->bindParam(':designation', $designation, PDO::PARAM_STR);
        $teacherStmt->bindParam(':qualification', $qualification, PDO::PARAM_STR);
        $teacherStmt->bindParam(':specialization', $specialization, PDO::PARAM_STR);
        $teacherStmt->bindParam(':experience_years', $experienceYears, PDO::PARAM_INT);
        
        if (!$teacherStmt->execute()) {
            throw new Exception('Failed to create teacher record');
        }
        
        // Commit transaction
        $db->commit();
        
        // Prepare response
        $response = [
            'user_id' => (int) $userId,
            'teacher_id' => $teacherId,
            'username' => $username,
            'email' => $email,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'department' => $department,
            'designation' => $designation,
            'created' => true
        ];
        
        sendSuccess($response, 201);
        
    } catch (Exception $e) {
        // Rollback transaction
        $db->rollBack();
        throw $e;
    }
    
} catch (PDOException $e) {
    logError('Database error in create teacher: ' . $e->getMessage(), [
        'admin_id' => $user['user_id'],
        'username' => $username ?? null
    ]);
    sendError('An error occurred while creating teacher', 'database_error', 500);
} catch (Exception $e) {
    logError('Error in create teacher: ' . $e->getMessage(), [
        'admin_id' => $user['user_id']
    ]);
    sendError($e->getMessage(), 'server_error', 500);
}
