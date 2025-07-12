# Tiyende Backup System

A comprehensive backup solution for the Tiyende bus reservation platform, supporting multiple backup types with advanced configuration options.

## Overview

The backup system provides granular control over data protection with support for:

- **Full System Backup**: Complete database backup
- **Analytics & Reports Backup**: Revenue, booking, and performance data
- **Audit Logs Backup**: Security and activity logs with encryption
- **Operational Data Backup**: Routes, tickets, schedules, and business operations
- **User & Vendor Data Backup**: Account information with privacy protection
- **Settings Backup**: System configuration and preferences

## Features

### Backup Types

| Type | Description | Tables | Compression | Encryption |
|------|-------------|--------|-------------|------------|
| `full` | Complete system backup | All tables | ✅ | ❌ |
| `analytics` | Analytics and reporting data | tickets, routes, vendors, activities | ✅ | ❌ |
| `audit` | Audit logs and security data | activities, audit_logs | ✅ | ✅ |
| `operational` | Operational data | routes, tickets, buses, completed_trips | ✅ | ❌ |
| `users` | User and vendor accounts | admins, vendors, vendor_users, vendor_user_permissions | ✅ | ✅ |
| `settings` | System settings | settings, roles | ❌ | ❌ |

### Key Features

- **Selective Backup**: Choose specific data types to backup
- **Compression**: Reduce backup file sizes by up to 70%
- **Encryption**: Secure sensitive data backups
- **Scheduling**: Automated backup creation
- **Retention Policies**: Automatic cleanup of old backups
- **Health Monitoring**: Backup integrity verification
- **Notifications**: Email and webhook alerts
- **Cloud Integration**: Support for AWS, GCP, Azure
- **Compliance**: Audit trails and regulatory compliance

## Installation & Setup

### 1. Initialize Backup Settings

Run the initialization script to set up backup configurations:

```powershell
# Navigate to admin directory
cd monorepo/apps/admin

# Run initialization script
.\initialize_backup_settings.ps1
```

### 2. Verify Installation

Check that backup types are available:

```bash
# Test backup types endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/backups/types
```

### 3. Create First Backup

```bash
# Create a full system backup
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"type": "full"}' \
     http://localhost:3000/api/backups
```

## Configuration

### Backup Settings

The system includes comprehensive configuration options:

#### General Backup Settings
- `backup_scheduled`: Enable/disable automatic backups
- `backup_frequency`: How often to create backups (hourly/daily/weekly/monthly)
- `backup_retention_days`: How long to keep backups
- `backup_compression`: Enable compression to save space
- `backup_encryption`: Enable encryption for sensitive data

#### Type-Specific Settings

**Analytics Backups:**
- `analytics_backup_enabled`: Enable analytics backups
- `analytics_backup_frequency`: Frequency for analytics backups
- `analytics_backup_retention`: Retention period for analytics data
- `analytics_include_reports`: Include generated reports

**Audit Backups:**
- `audit_backup_enabled`: Enable audit log backups
- `audit_backup_encryption`: Encrypt audit backups (recommended)
- `audit_backup_retention`: Longer retention for compliance
- `audit_include_activities`: Include activity logs

**Operational Backups:**
- `operational_backup_enabled`: Enable operational data backups
- `operational_include_routes`: Include route data
- `operational_include_tickets`: Include ticket data
- `operational_include_schedules`: Include schedule data

**User Backups:**
- `user_backup_enabled`: Enable user data backups
- `user_backup_encryption`: Encrypt user backups (required)
- `user_include_admins`: Include admin accounts
- `user_include_vendors`: Include vendor accounts
- `user_exclude_passwords`: Exclude password hashes for security

### Storage Configuration

- `backup_storage_path`: Local backup directory
- `backup_max_size_mb`: Maximum backup file size
- `backup_cleanup_enabled`: Automatic cleanup of old backups
- `backup_cleanup_threshold`: Storage usage threshold for cleanup

### Security Settings

- `backup_access_logging`: Log backup access attempts
- `backup_download_authentication`: Require auth for downloads
- `backup_download_audit`: Audit download activities
- `backup_ip_whitelist`: Restrict access by IP address

### Performance Settings

- `backup_parallel_jobs`: Number of parallel backup jobs
- `backup_timeout_minutes`: Operation timeout
- `backup_verify_integrity`: Verify backup integrity
- `backup_compression_level`: Compression level (1-9)

## Usage

### Manual Backups

#### Create Different Backup Types

```javascript
// Full system backup
await apiRequest('/api/backups', {
  method: 'POST',
  body: JSON.stringify({ type: 'full' })
});

// Analytics backup
await apiRequest('/api/backups', {
  method: 'POST',
  body: JSON.stringify({ type: 'analytics' })
});

// Audit backup
await apiRequest('/api/backups', {
  method: 'POST',
  body: JSON.stringify({ type: 'audit' })
});

// Operational backup
await apiRequest('/api/backups', {
  method: 'POST',
  body: JSON.stringify({ type: 'operational' })
});

// User backup
await apiRequest('/api/backups', {
  method: 'POST',
  body: JSON.stringify({ type: 'users' })
});

// Settings backup
await apiRequest('/api/backups', {
  method: 'POST',
  body: JSON.stringify({ type: 'settings' })
});
```

#### List Available Backups

```javascript
const backups = await apiRequest('/api/backups');
console.log('Available backups:', backups);
```

#### Download Backup

```javascript
// Download backup file
const response = await fetch(`/api/backups/${filename}/download`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const blob = await response.blob();
// Handle download...
```

#### Delete Backup

```javascript
await apiRequest(`/api/backups/${filename}`, {
  method: 'DELETE'
});
```

### Scheduled Backups

Enable automatic backups through the admin dashboard:

1. Navigate to **Settings** → **Backup Manager**
2. Enable **Scheduled Backups**
3. Configure frequency and retention
4. Save settings

### Backup Monitoring

Monitor backup health and performance:

```javascript
// Get backup statistics
const stats = await apiRequest('/api/backups/stats');

// Check backup health
const health = await apiRequest('/api/backups/health');
```

## API Reference

### Endpoints

#### `POST /api/backups`
Create a new backup.

**Request Body:**
```json
{
  "type": "full|analytics|audit|operational|users|settings"
}
```

**Response:**
```json
{
  "message": "Backup created successfully",
  "path": "/path/to/backup.sql",
  "type": "full"
}
```

#### `GET /api/backups`
List all available backups.

**Response:**
```json
[
  {
    "filename": "backup-full-2024-01-15T10-30-00.sql",
    "type": "full",
    "description": "Complete system backup including all data",
    "size": "2.5 MB",
    "created": "2024-01-15T10:30:00Z",
    "status": "success",
    "metadata": {
      "recordCount": 15000,
      "tables": ["*"],
      "compressionRatio": 0.7
    }
  }
]
```

#### `GET /api/backups/types`
Get available backup types and configurations.

**Response:**
```json
[
  {
    "type": "analytics",
    "description": "Analytics and reporting data",
    "tables": ["tickets", "routes", "vendors", "activities"],
    "compression": true,
    "encryption": false
  }
]
```

#### `GET /api/backups/{filename}/download`
Download a backup file.

#### `DELETE /api/backups/{filename}`
Delete a backup file.

## Backup Reports

Each backup type generates additional reports:

### Analytics Reports
- Revenue summaries
- Booking statistics
- Route performance
- Vendor activity

### Audit Reports
- Activity summaries
- Security events
- Access patterns
- Compliance data

### Operational Reports
- Route status
- Ticket statistics
- Vendor performance
- Revenue calculations

### User Reports
- Account summaries
- Activity patterns
- Security metrics
- Privacy compliance

## Security Considerations

### Encryption
- Audit and user backups are encrypted by default
- Encryption keys should be stored securely
- Consider using hardware security modules (HSM) for production

### Access Control
- Backup downloads require authentication
- IP whitelisting available for restricted access
- All backup access is logged and audited

### Data Privacy
- User backups exclude password hashes
- Sensitive data is encrypted
- Compliance with data protection regulations

## Troubleshooting

### Common Issues

#### Backup Creation Fails
```bash
# Check database connection
psql -h localhost -U postgres -d tiyende -c "SELECT 1;"

# Check backup directory permissions
ls -la ./backups/

# Check available disk space
df -h
```

#### Backup Download Fails
```bash
# Check file exists
ls -la ./backups/backup-*.sql

# Check file permissions
chmod 644 ./backups/backup-*.sql

# Verify authentication
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/auth/verify
```

#### Scheduled Backups Not Running
```bash
# Check cron service
systemctl status cron

# Check backup settings
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/settings/backup_scheduled

# Check logs
tail -f ./logs/backup.log
```

### Performance Optimization

#### Large Database Backups
```bash
# Increase timeout for large databases
export BACKUP_TIMEOUT=120

# Use parallel compression
export BACKUP_COMPRESSION_LEVEL=9

# Split large backups
export BACKUP_MAX_SIZE_MB=500
```

#### Backup Storage Management
```bash
# Monitor backup directory size
du -sh ./backups/

# Clean old backups
find ./backups/ -name "*.sql" -mtime +30 -delete

# Compress old backups
gzip ./backups/backup-*.sql
```

## Monitoring & Alerts

### Health Checks
```bash
# Check backup system health
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/backups/health

# Monitor backup directory
watch -n 60 "ls -la ./backups/"
```

### Alert Configuration
```bash
# Set up email notifications
export BACKUP_NOTIFICATION_EMAIL="admin@tiyende.com"

# Configure webhook alerts
export BACKUP_NOTIFICATION_WEBHOOK="https://hooks.slack.com/..."

# Enable failure alerts
export BACKUP_ALERT_ON_FAILURE=true
```

## Best Practices

### Backup Strategy
1. **Full backups** weekly
2. **Analytics backups** daily
3. **Audit backups** daily with encryption
4. **Operational backups** daily
5. **User backups** weekly with encryption
6. **Settings backups** on configuration changes

### Storage Management
1. Monitor disk space usage
2. Implement retention policies
3. Use compression for all backups
4. Encrypt sensitive data
5. Test backup restoration regularly

### Security
1. Restrict backup access to authorized users
2. Encrypt backups containing sensitive data
3. Log all backup activities
4. Regularly audit backup access
5. Store encryption keys securely

### Performance
1. Schedule backups during low-traffic periods
2. Use parallel processing for large databases
3. Monitor backup completion times
4. Optimize compression settings
5. Implement incremental backups for large datasets

## Development

### Adding New Backup Types

1. Define backup configuration in `BACKUP_TYPES`
2. Implement backup function in `backup.ts`
3. Add API endpoint in `routes.ts`
4. Update frontend components
5. Add settings configuration
6. Test thoroughly

### Custom Backup Reports

```javascript
// Add custom report generation
async function generateCustomReport() {
  // Implement custom logic
  return {
    timestamp: new Date().toISOString(),
    type: "custom_report",
    data: { /* custom data */ }
  };
}
```

## Support

For issues or questions about the backup system:

1. Check the troubleshooting section
2. Review logs in `./logs/backup.log`
3. Verify configuration settings
4. Test with a small backup first
5. Contact system administrator

## License

This backup system is part of the Tiyende platform and follows the same licensing terms. 