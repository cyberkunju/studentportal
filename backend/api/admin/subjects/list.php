<?php
/**
 * List Subjects API - Get all subjects with filters
 * Method: GET | Auth: admin
 */
require_once '../../../config/database.php';
require_once '../../../includes/cors.php';
require_once '../../../includes/auth.php';
require_once '../../../includes/functions.php';

$user = verifyAuth();
if (!$user || $user['role'] !== 'admin') sendError('Forbidden', 'forbidden', 403);

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $semester = isset($_GET['semester']) ? (int) $_GET['semester'] : null;
    $department = isset($_GET['department']) ? trim($_GET['department']) : null;
    $isActive = isset($_GET['is_active']) ? ($_GET['is_active'] === 'true' || $_GET['is_active'] === '1') : null;
    
    $query = "SELECT * FROM subjects WHERE 1=1";
    $params = [];
    
    if ($semester !== null) {
        $query .= " AND semester = :semester";
        $params[':semester'] = $semester;
    }
    if ($department !== null) {
        $query .= " AND (department IS NULL OR department = :department)";
        $params[':department'] = $department;
    }
    if ($isActive !== null) {
        $query .= " AND is_active = :is_active";
        $params[':is_active'] = $isActive ? 1 : 0;
    }
    
    $query .= " ORDER BY semester, subject_code";
    
    $stmt = $db->prepare($query);
    foreach ($params as $key => $value) $stmt->bindValue($key, $value);
    $stmt->execute();
    
    $subjects = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($subjects as &$subject) {
        $subject['credit_hours'] = (int) $subject['credit_hours'];
        $subject['semester'] = (int) $subject['semester'];
        $subject['is_active'] = (bool) $subject['is_active'];
    }
    
    sendSuccess(['subjects' => $subjects, 'total' => count($subjects)]);
} catch (PDOException $e) {
    logError('DB error list subjects: ' . $e->getMessage());
    sendError('Database error', 'database_error', 500);
}
