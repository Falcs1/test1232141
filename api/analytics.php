<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        getAnalytics();
        break;
    case 'POST':
        updateAnalytics();
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

function getAnalytics() {
    global $pdo;
    
    try {
        // Get page views
        $stmt = $pdo->query("SELECT * FROM page_views ORDER BY date DESC LIMIT 30");
        $pageViews = $stmt->fetchAll();
        
        // Get social analytics
        $stmt = $pdo->query("SELECT * FROM social_analytics ORDER BY date DESC LIMIT 30");
        $socialAnalytics = $stmt->fetchAll();
        
        // Get application counts by date
        $stmt = $pdo->query("
            SELECT DATE(created_at) as date, COUNT(*) as count 
            FROM applications 
            GROUP BY DATE(created_at) 
            ORDER BY date DESC 
            LIMIT 30
        ");
        $applicationStats = $stmt->fetchAll();
        
        echo json_encode([
            'success' => true,
            'data' => [
                'pageViews' => $pageViews,
                'socialAnalytics' => $socialAnalytics,
                'applicationStats' => $applicationStats
            ]
        ]);
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

function updateAnalytics() {
    global $pdo;
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['type'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid input']);
        return;
    }
    
    try {
        $today = date('Y-m-d');
        
        switch($input['type']) {
            case 'page_view':
                // Update or insert page view
                $stmt = $pdo->prepare("
                    INSERT INTO page_views (date, views) 
                    VALUES (:date, 1) 
                    ON DUPLICATE KEY UPDATE views = views + 1
                ");
                $stmt->execute(['date' => $today]);
                break;
                
            case 'social_click':
                $platform = $input['platform'] ?? 'unknown';
                
                // Update or insert social click
                $stmt = $pdo->prepare("
                    INSERT INTO social_analytics (date, platform, clicks) 
                    VALUES (:date, :platform, 1) 
                    ON DUPLICATE KEY UPDATE clicks = clicks + 1
                ");
                $stmt->execute([
                    'date' => $today,
                    'platform' => $platform
                ]);
                break;
        }
        
        echo json_encode(['success' => true, 'message' => 'Analytics updated']);
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}
?>

