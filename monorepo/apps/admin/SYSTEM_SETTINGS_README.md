# Tiyende System Settings

This document provides comprehensive documentation for the Tiyende System Settings functionality, including setup, API endpoints, and usage examples.

## Overview

The System Settings module provides a comprehensive configuration management system for the Tiyende bus reservation platform. It includes:

- **System Configuration**: Basic system settings like name, timezone, language
- **Contact Information**: Company contact details and social media links
- **Notification Settings**: Email, SMS, and webhook notification configurations
- **Security Settings**: Authentication, session management, and security policies
- **Backup Management**: Database backup scheduling and management
- **Payment Settings**: Payment processing configurations
- **Feature Flags**: Enable/disable system features
- **Integration Settings**: Third-party service configurations

## Features

### 🎛️ Comprehensive Settings Management
- **Tabbed Interface**: Organized settings in logical groups
- **Real-time Updates**: Instant feedback on setting changes
- **Validation**: Input validation for different setting types
- **Audit Trail**: Track all setting changes
- **Backup Integration**: Direct backup management from settings

### 🔧 Setting Types
- **Text**: Simple text input
- **Textarea**: Multi-line text input
- **Email**: Email address validation
- **Phone**: Phone number input
- **Number**: Numeric input with min/max validation
- **Select**: Dropdown with predefined options
- **Switch**: Boolean toggle
- **URL**: URL validation
- **Password**: Secure password input

### 🛡️ Security Features
- **Admin-only Access**: Settings can only be modified by administrators
- **Input Validation**: Server-side validation for all settings
- **Audit Logging**: All changes are logged with user and timestamp
- **Permission-based**: Settings access controlled by user permissions

## Setup Instructions

### 1. Database Setup

First, ensure the settings table exists in your database:

```sql
-- The settings table should already exist from the schema
-- If not, run the schema migration
```

### 2. Initialize Default Settings

Run the settings initialization script to populate default settings:

```powershell
# Navigate to the admin directory
cd monorepo/apps/admin

# Run the initialization script
.\initialize_settings.ps1
```

This will populate the database with comprehensive default settings for all system components.

### 3. Start the Application

```powershell
# Start the admin application
npm run dev
```

### 4. Access Settings

Navigate to the Settings page in the admin interface:
- URL: `http://localhost:3000/settings`
- Login as an administrator
- Go to Settings in the sidebar

## API Documentation

### Get All Settings

```http
GET /api/settings
Authorization: Bearer <admin-token>
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "system_name",
    "value": "Tiyende Bus Reservation",
    "description": "The name of the system as displayed to users",
    "updated_at": "2024-01-15T10:30:00Z"
  }
]
```

### Update Setting

```http
POST /api/settings/{setting_name}
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "value": "New Setting Value"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "system_name",
  "value": "New Setting Value",
  "description": "The name of the system as displayed to users",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### Backup Management

#### Create Backup
```http
POST /api/backups
Authorization: Bearer <admin-token>
```

#### List Backups
```http
GET /api/backups
Authorization: Bearer <admin-token>
```

#### Download Backup
```http
GET /api/backups/{filename}/download
Authorization: Bearer <admin-token>
```

#### Delete Backup
```http
DELETE /api/backups/{filename}
Authorization: Bearer <admin-token>
```

## Settings Categories

### System Settings
- `system_name`: System display name
- `system_timezone`: Default timezone
- `system_language`: Default language
- `system_maintenance_mode`: Maintenance mode toggle
- `system_debug_mode`: Debug mode toggle
- `system_log_level`: Logging level

### Contact Settings
- `contact_email`: Primary support email
- `contact_phone`: Primary support phone
- `contact_address`: Physical address
- `contact_website`: Company website
- `contact_facebook`: Facebook page URL
- `contact_twitter`: Twitter page URL

### Notification Settings
- `notification_email_enabled`: Email notifications toggle
- `notification_sms_enabled`: SMS notifications toggle
- `notification_push_enabled`: Push notifications toggle
- `notification_webhook_url`: Webhook URL
- `notification_smtp_host`: SMTP server host
- `notification_smtp_port`: SMTP server port
- `notification_smtp_username`: SMTP username
- `notification_smtp_password`: SMTP password
- `notification_from_email`: From email address
- `notification_from_name`: From name

### Security Settings
- `security_session_timeout`: Session timeout in minutes
- `security_password_min_length`: Minimum password length
- `security_password_require_uppercase`: Require uppercase in passwords
- `security_password_require_lowercase`: Require lowercase in passwords
- `security_password_require_numbers`: Require numbers in passwords
- `security_password_require_special`: Require special characters
- `security_two_factor_enabled`: 2FA toggle
- `security_login_attempts_limit`: Max login attempts
- `security_lockout_duration`: Account lockout duration
- `security_require_ssl`: Require SSL connections

### Backup Settings
- `backup_scheduled`: Scheduled backups toggle
- `backup_frequency`: Backup frequency (hourly/daily/weekly/monthly)
- `backup_retention_days`: Days to retain backups
- `backup_include_files`: Include file uploads
- `backup_compression`: Enable compression
- `backup_encryption`: Enable encryption
- `backup_notify_on_success`: Success notifications
- `backup_notify_on_failure`: Failure notifications

## Testing

### Run Settings Tests

```bash
# Navigate to admin directory
cd monorepo/apps/admin

# Run the test script
node test_settings.cjs
```

### Manual Testing

1. **Access Settings Page**
   - Login as administrator
   - Navigate to Settings
   - Verify all tabs are visible

2. **Test Setting Updates**
   - Change system name
   - Update contact email
   - Toggle notification settings
   - Verify changes are saved

3. **Test Backup Management**
   - Create a manual backup
   - View backup list
   - Download a backup file
   - Delete a backup

4. **Test Validation**
   - Try invalid email addresses
   - Try invalid numbers
   - Verify validation messages

## Configuration Examples

### Email Configuration
```json
{
  "notification_email_enabled": "true",
  "notification_smtp_host": "smtp.gmail.com",
  "notification_smtp_port": "587",
  "notification_smtp_username": "your-email@gmail.com",
  "notification_smtp_password": "your-app-password",
  "notification_from_email": "noreply@tiyende.com",
  "notification_from_name": "Tiyende System"
}
```

### Security Configuration
```json
{
  "security_session_timeout": "30",
  "security_password_min_length": "8",
  "security_password_require_uppercase": "true",
  "security_password_require_numbers": "true",
  "security_two_factor_enabled": "false",
  "security_login_attempts_limit": "5",
  "security_lockout_duration": "15"
}
```

### Backup Configuration
```json
{
  "backup_scheduled": "true",
  "backup_frequency": "daily",
  "backup_retention_days": "30",
  "backup_compression": "true",
  "backup_notify_on_success": "true",
  "backup_notify_on_failure": "true"
}
```

## Troubleshooting

### Common Issues

1. **Settings not loading**
   - Check database connection
   - Verify settings table exists
   - Run initialization script

2. **Backup creation fails**
   - Ensure `pg_dump` is installed
   - Check database permissions
   - Verify backup directory exists

3. **Validation errors**
   - Check setting type requirements
   - Verify input format
   - Check minimum/maximum values

4. **Permission denied**
   - Ensure user has admin role
   - Check JWT token validity
   - Verify user permissions

### Debug Mode

Enable debug mode to see detailed logs:

```json
{
  "system_debug_mode": "true",
  "system_log_level": "debug"
}
```

## Development

### Adding New Settings

1. **Add to Database Schema**
   ```sql
   INSERT INTO settings (name, value, description) 
   VALUES ('new_setting', 'default_value', 'Setting description');
   ```

2. **Add to Frontend Component**
   ```typescript
   // In system-settings.tsx
   const newSettings = {
     new_setting: {
       name: 'new_setting',
       label: 'New Setting',
       value: 'default_value',
       description: 'Setting description',
       type: 'text'
     }
   };
   ```

3. **Add Validation (Optional)**
   ```typescript
   // In settings.service.ts
   this.addMetadata('new_setting', {
     name: 'new_setting',
     type: 'text',
     label: 'New Setting',
     description: 'Setting description',
     validation: { required: true, min: 1, max: 100 },
     group: 'system',
     category: 'General'
   });
   ```

### Custom Setting Types

To add a new setting type:

1. **Update TypeScript Types**
   ```typescript
   type: 'text' | 'textarea' | 'email' | 'phone' | 'select' | 'switch' | 'number' | 'url' | 'password' | 'custom';
   ```

2. **Add Frontend Renderer**
   ```typescript
   case "custom":
     return <CustomInput value={setting.value} onChange={(value) => handleChange(key, value)} />;
   ```

3. **Add Validation**
   ```typescript
   case 'custom':
     return validateCustomValue(value);
   ```

## Security Considerations

1. **Admin Access Only**: Settings modification requires admin privileges
2. **Input Validation**: All inputs are validated server-side
3. **Audit Logging**: All changes are logged with user and timestamp
4. **Sensitive Data**: Passwords and API keys are stored securely
5. **Rate Limiting**: API endpoints are rate-limited
6. **HTTPS Required**: All connections should use HTTPS in production

## Performance

1. **Caching**: Settings are cached to reduce database queries
2. **Lazy Loading**: Settings are loaded on-demand
3. **Batch Updates**: Multiple settings can be updated in one request
4. **Optimized Queries**: Database queries are optimized for performance

## Monitoring

### Health Checks

```http
GET /api/settings/health
```

### Metrics

- Settings update frequency
- Backup success rate
- Validation error rate
- API response times

## Support

For issues or questions:

1. Check the troubleshooting section
2. Review the logs for error messages
3. Test with the provided test scripts
4. Contact the development team

## Changelog

### Version 1.0.0
- Initial implementation
- Basic settings management
- Backup functionality
- Security settings
- Notification configuration

### Future Enhancements
- Advanced backup scheduling
- Setting templates
- Bulk import/export
- API rate limiting
- Advanced validation rules 