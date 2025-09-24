# 🚀 İşteyim Göçteyim - Deployment Guide

This guide will help you deploy your website with a working backend that saves data permanently.

## 📋 Requirements

- Web hosting with PHP 7.4+ and MySQL support
- cPanel or similar control panel access
- FTP/File Manager access

## 🗄️ Database Setup

### Step 1: Create Database
1. Log into your hosting control panel (cPanel)
2. Go to **MySQL Databases**
3. Create a new database named: `isteyim_gocteyim`
4. Create a database user with full privileges
5. Note down your database credentials

### Step 2: Import Database Structure
1. Go to **phpMyAdmin**
2. Select your database
3. Go to **Import** tab
4. Upload the `database_setup.sql` file
5. Click **Go** to execute

## 🔧 Configuration

### Step 1: Update Database Configuration
Edit `api/config.php` and update these lines:

```php
$host = 'localhost';           // Usually localhost
$dbname = 'your_db_name';      // Your database name
$username = 'your_db_user';    // Your database username  
$password = 'your_db_pass';    // Your database password
```

### Step 2: Update API Base URL
Edit `js/api.js` and update this line:

```javascript
const API_BASE_URL = '/api'; // Change to your domain if needed
// Example: const API_BASE_URL = 'https://yourdomain.com/api';
```

## 📁 File Upload Structure

Upload your files to your hosting in this structure:
```
public_html/
├── index.html
├── admin.html
├── styles.css
├── script.js
├── ADMIN_CREDENTIALS.md
├── js/
│   └── api.js
├── api/
│   ├── config.php
│   ├── applications.php
│   └── analytics.php
├── images/
│   └── (your images)
└── database_setup.sql (not needed on server after import)
```

## 🔐 Admin Access

**Default Admin Credentials:**
- **Username:** anatoliaexp  
- **Password:** anatoliapress

**Admin URL:** `https://yourdomain.com/admin.html`

## 🧪 Testing

### Test Application Form
1. Go to your website
2. Fill out and submit the application form
3. Check admin panel to see if data appears

### Test Admin Panel
1. Go to `/admin.html`
2. Login with admin credentials
3. Verify you can see applications
4. Test accept/reject functionality

## 🔒 Security Recommendations

### 1. Change Admin Password
- Update the password hash in the `admin_users` table
- Use a password generator for a strong password

### 2. Secure API Directory
Add this `.htaccess` file in your `/api` directory:

```apache
# Disable directory browsing
Options -Indexes

# Allow only specific file types
<FilesMatch "\.(php)$">
    Order allow,deny
    Allow from all
</FilesMatch>

# Block access to sensitive files
<FilesMatch "\.(sql|log|txt)$">
    Order deny,allow
    Deny from all
</FilesMatch>
```

### 3. Enable HTTPS
- Get an SSL certificate from your hosting provider
- Force HTTPS redirects

## 📊 Features That Will Work

✅ **Application Form Submission** - Saves to database  
✅ **Admin Panel** - View all applications  
✅ **Status Management** - Accept/Reject applications  
✅ **Data Export** - CSV/JSON download  
✅ **Analytics Tracking** - Page views, social clicks  
✅ **Archive System** - Auto-delete after 14 days  
✅ **Email Logging** - Track notification emails  

## 🔄 Backup & Maintenance

### Database Backup
1. Go to phpMyAdmin
2. Select your database
3. Click **Export**
4. Choose **Quick** export method
5. Download the SQL file

### Regular Maintenance
- The system automatically deletes archived applications after 14 days
- Monitor database size and clean up old analytics data if needed
- Keep regular backups

## 🐛 Troubleshooting

### Applications Not Saving
1. Check database connection in `api/config.php`
2. Verify database permissions
3. Check PHP error logs
4. Test API endpoints directly

### Admin Panel Not Loading Data
1. Check browser console for JavaScript errors
2. Verify API endpoints are accessible
3. Check database connection
4. Ensure proper file permissions

### 500 Internal Server Error
1. Check PHP error logs
2. Verify file permissions (644 for files, 755 for directories)
3. Check .htaccess configuration
4. Verify PHP version compatibility

## 📞 Support

If you encounter issues:
1. Check your hosting's error logs
2. Test API endpoints with a tool like Postman
3. Verify database connection and structure
4. Contact your hosting provider for server-specific issues

---

## 🎯 Quick Start Checklist

- [ ] Upload all files to hosting
- [ ] Create database and user
- [ ] Import database_setup.sql
- [ ] Update api/config.php with database credentials
- [ ] Test application form submission
- [ ] Test admin panel login
- [ ] Verify data is saving to database
- [ ] Set up SSL certificate
- [ ] Change default admin password

Your website is now ready for production with full data persistence! 🎉
