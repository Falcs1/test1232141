# Admin Panel Login Credentials

## İşteyim Göçteyim Admin Panel Access

### Login Information:
- **Username:** anatoliaexp
- **Password:** anatoliapress

### Admin Panel Features:
1. **Secure Login System** - Session-based authentication
2. **Application Management** - View, accept, reject applications
3. **Archive System** - Archive applications with auto-delete after 14 days
4. **Permanent Delete** - Permanently remove archived applications
5. **Auto-Delete** - Archived applications are automatically deleted after 14 days
6. **Restore Function** - Restore archived applications back to active list
7. **Export Functions** - Export data to CSV/JSON formats
8. **Email Logs** - Track all email communications
9. **Analytics Dashboard** - View statistics and charts

### Security Features:
- Session-based login (credentials stored in sessionStorage)
- Logout functionality clears session
- Protected admin content (hidden until login)
- Confirmation dialogs for destructive actions

### Archive System Details:
- Applications can be archived from the main applications table
- Archived applications are stored separately
- Each archived application has a 14-day countdown timer
- Applications are automatically deleted after 14 days
- Permanent delete button for immediate removal
- Restore button to move applications back to active list

### Access URL:
- Admin Panel: `admin.html`
- Main Site: `index.html`

### Important Notes:
- Keep these credentials secure
- Change credentials in production environment
- Regular backups recommended for application data
- Auto-delete runs every hour to clean expired archived applications

---
**Last Updated:** $(date)
**Version:** 1.0
