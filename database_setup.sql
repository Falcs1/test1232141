-- Create database
CREATE DATABASE IF NOT EXISTS isteyim_gocteyim CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE isteyim_gocteyim;

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    experience VARCHAR(255),
    message TEXT,
    files JSON,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    archived BOOLEAN DEFAULT FALSE,
    archived_at TIMESTAMP NULL,
    auto_delete_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_archived (archived),
    INDEX idx_email (email)
);

-- Page views table
CREATE TABLE IF NOT EXISTS page_views (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    views INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_date (date),
    INDEX idx_date (date)
);

-- Social analytics table
CREATE TABLE IF NOT EXISTS social_analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    platform VARCHAR(50) NOT NULL,
    clicks INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_date_platform (date, platform),
    INDEX idx_date (date),
    INDEX idx_platform (platform)
);

-- Email log table
CREATE TABLE IF NOT EXISTS email_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id VARCHAR(50),
    to_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    status ENUM('sent', 'failed') DEFAULT 'sent',
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE SET NULL,
    INDEX idx_application_id (application_id),
    INDEX idx_sent_at (sent_at),
    INDEX idx_to_email (to_email)
);

-- Admin users table (optional, for future use)
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    
    INDEX idx_username (username)
);

-- Insert default admin user (password: anatoliapress)
-- Note: In production, you should use a stronger password hash
INSERT INTO admin_users (username, password_hash, email) 
VALUES ('anatoliaexp', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@isteyimgocteyim.com')
ON DUPLICATE KEY UPDATE username = username;

-- Create cleanup event for auto-deleting archived applications
DELIMITER $$
CREATE EVENT IF NOT EXISTS cleanup_archived_applications
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
BEGIN
    DELETE FROM applications 
    WHERE archived = 1 
    AND auto_delete_date IS NOT NULL 
    AND auto_delete_date < NOW();
END$$
DELIMITER ;

-- Enable event scheduler (you may need to run this manually)
-- SET GLOBAL event_scheduler = ON;

