<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        getApplications();
        break;
    case 'POST':
        if (isset($_GET['action'])) {
            switch($_GET['action']) {
                case 'update_status':
                    updateApplicationStatus();
                    break;
                case 'archive':
                    archiveApplication();
                    break;
                default:
                    createApplication();
            }
        } else {
            createApplication();
        }
        break;
    case 'DELETE':
        deleteApplication();
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

function getApplications() {
    global $pdo;
    
    try {
        $stmt = $pdo->query("SELECT * FROM applications WHERE archived = 0 ORDER BY created_at DESC");
        $applications = $stmt->fetchAll();
        
        // Decode JSON fields
        foreach($applications as &$app) {
            if ($app['files']) {
                $app['files'] = json_decode($app['files'], true);
            }
        }
        
        echo json_encode(['success' => true, 'data' => $applications]);
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

function createApplication() {
    global $pdo;
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid input']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("
            INSERT INTO applications (
                id, name, email, phone, experience, message, files, 
                status, created_at, updated_at
            ) VALUES (
                :id, :name, :email, :phone, :experience, :message, :files,
                :status, :created_at, :updated_at
            )
        ");
        
        $stmt->execute([
            'id' => $input['id'],
            'name' => $input['name'],
            'email' => $input['email'],
            'phone' => $input['phone'],
            'experience' => $input['experience'] ?? '',
            'message' => $input['message'] ?? '',
            'files' => json_encode($input['files'] ?? []),
            'status' => $input['status'] ?? 'pending',
            'created_at' => $input['timestamp'],
            'updated_at' => $input['timestamp']
        ]);
        
        echo json_encode(['success' => true, 'message' => 'Application saved successfully']);
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

function updateApplicationStatus() {
    global $pdo;
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['id']) || !isset($input['status'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing required fields']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("
            UPDATE applications 
            SET status = :status, updated_at = :updated_at 
            WHERE id = :id
        ");
        
        $stmt->execute([
            'status' => $input['status'],
            'updated_at' => date('Y-m-d H:i:s'),
            'id' => $input['id']
        ]);
        
        echo json_encode(['success' => true, 'message' => 'Status updated successfully']);
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

function archiveApplication() {
    global $pdo;
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing application ID']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("
            UPDATE applications 
            SET archived = 1, archived_at = :archived_at, auto_delete_date = :auto_delete_date 
            WHERE id = :id
        ");
        
        $autoDeleteDate = date('Y-m-d H:i:s', strtotime('+14 days'));
        
        $stmt->execute([
            'archived_at' => date('Y-m-d H:i:s'),
            'auto_delete_date' => $autoDeleteDate,
            'id' => $input['id']
        ]);
        
        echo json_encode(['success' => true, 'message' => 'Application archived successfully']);
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

function deleteApplication() {
    global $pdo;
    
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing application ID']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("DELETE FROM applications WHERE id = :id");
        $stmt->execute(['id' => $id]);
        
        echo json_encode(['success' => true, 'message' => 'Application deleted successfully']);
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}
?>

