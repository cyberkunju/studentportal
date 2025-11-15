<?php
/**
 * Get All Notices API - For all users (filtered by role)
 * Method: GET | Auth: required (any role)
 */
require_once '../../config/database.php';
require_once '../../includes/cors.php';
require_once '../../includes/auth.php';
require_once '../../includes/functions.php';

$user = verifyAuth();
if (!$user) sendError('Unauthorized', 'unauthorized', 401);

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Filter by user role
    $query = "SELECT id, title, content, target_role, expiry_date, created_at, updated_at
              FROM notices 
              WHERE is_active = 1 
              AND (target_role = :role OR target_role = 'all')
              AND (expiry_date IS NULL OR expiry_date >= CURDATE())
              ORDER BY created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':role', $user['role']);
    $stmt->execute();
    
    $notices = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    sendSuccess(['notices' => $notices, 'total' => count($notices)]);
} catch (PDOException $e) {
    logError('DB error get notices: ' . $e->getMessage());
    sendError('Database error', 'database_error', 500);
}
