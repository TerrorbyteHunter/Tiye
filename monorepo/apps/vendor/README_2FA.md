# Two-Factor Authentication (2FA) Implementation

This document explains the two-factor authentication system implemented for the Tiyende vendor portal using Firebase Authentication with email OTP.

## Overview

The 2FA system provides an additional layer of security by requiring vendors to verify their email address through a one-time password (OTP) sent via email after successful password authentication.

## Features

- ✅ Email-based OTP verification
- ✅ Firebase Authentication integration
- ✅ Secure token-based authentication
- ✅ User-friendly interface
- ✅ Configurable 2FA settings
- ✅ Session management
- ✅ Error handling and retry mechanisms

## Architecture

### Frontend Components

1. **Login2FA.tsx** - Enhanced login page with 2FA support
2. **VerifyEmail.tsx** - Email verification page
3. **TwoFactorSettings.tsx** - 2FA management component
4. **auth2fa.ts** - 2FA service layer
5. **firebase.ts** - Firebase configuration

### Backend Endpoints

1. `/api/vendor/verify-2fa` - Verify Firebase token and generate JWT
2. `/api/vendor/enable-2fa` - Enable 2FA for a vendor
3. `/api/vendor/disable-2fa` - Disable 2FA for a vendor
4. `/api/vendor/2fa-status` - Check 2FA status

## How It Works

### 1. Login Flow

1. User enters email and password
2. Backend validates credentials
3. If 2FA is enabled, system sends email OTP
4. User clicks link in email
5. Firebase verifies the email link
6. Backend generates JWT token with 2FA verification
7. User is redirected to dashboard

### 2. Email Verification Flow

1. Firebase sends email with verification link
2. User clicks the link
3. Frontend detects Firebase email link
4. Firebase verifies the link
5. Backend receives Firebase token
6. Backend generates new JWT with 2FA verification
7. User is authenticated and redirected

## Setup Instructions

### 1. Firebase Setup

Follow the detailed guide in `FIREBASE_SETUP.md` to:
- Create a Firebase project
- Enable Authentication
- Configure email templates
- Get Firebase configuration

### 2. Database Setup

Run the database migration script:

```bash
psql -d your_database -f setup_2fa_database.sql
```

### 3. Environment Configuration

Create a `.env` file with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
JWT_SECRET=your-jwt-secret
```

### 4. Update Firebase Configuration

Edit `src/lib/firebase.ts` with your actual Firebase configuration.

## Usage

### For Vendors

1. **Login with 2FA**:
   - Navigate to `/login-2fa`
   - Enter email and password
   - Check email for verification link
   - Click the link to complete login

2. **Manage 2FA Settings**:
   - Go to Settings page
   - Use the 2FA settings component
   - Enable/disable 2FA as needed

### For Developers

1. **Testing**:
   ```bash
   cd monorepo/apps/vendor
   npm run dev
   # Navigate to http://localhost:5173/login-2fa
   ```

2. **API Testing**:
   ```bash
   # Check 2FA status
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        http://localhost:4000/api/vendor/2fa-status
   
   # Enable 2FA
   curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
        http://localhost:4000/api/vendor/enable-2fa
   ```

## Security Features

### 1. Token Security
- JWT tokens include 2FA verification status
- Tokens expire after 24 hours
- Secure token storage in localStorage

### 2. Email Security
- Firebase handles email delivery
- Secure email links with expiration
- Rate limiting on email sending

### 3. Session Management
- Automatic session cleanup
- Secure logout functionality
- Cross-tab session synchronization

### 4. Error Handling
- Comprehensive error messages
- Retry mechanisms for failed attempts
- Graceful fallback options

## Configuration Options

### Firebase Settings

```typescript
// In firebase.ts
const actionCodeSettings = {
  url: 'http://localhost:5173/verify-email',
  handleCodeInApp: true,
  // ... other settings
};
```

### Email Templates

Customize email templates in Firebase Console:
- Subject line
- Sender information
- Email content
- Branding

### Security Settings

```typescript
// JWT token expiration
{ expiresIn: '24h' }

// Rate limiting (implement in backend)
const MAX_EMAIL_ATTEMPTS = 5;
const EMAIL_COOLDOWN = 60; // seconds
```

## Troubleshooting

### Common Issues

1. **Email not received**:
   - Check spam folder
   - Verify email address
   - Check Firebase Console logs

2. **Invalid verification link**:
   - Ensure correct domain in Firebase settings
   - Check action code settings
   - Verify email link format

3. **CORS errors**:
   - Configure CORS in Firebase Console
   - Check domain whitelist
   - Verify HTTPS settings

### Debug Mode

Enable Firebase debug logging:

```javascript
localStorage.setItem('debug', 'firebase:*');
```

### Logs

Check these locations for debugging:
- Browser console for frontend errors
- Firebase Console for authentication logs
- Backend server logs for API errors

## Production Considerations

### 1. Security
- Implement Firebase Admin SDK for server-side verification
- Add rate limiting for email sending
- Configure proper CORS settings
- Use HTTPS in production

### 2. Performance
- Implement caching for 2FA status
- Add database indexes for queries
- Optimize email delivery

### 3. Monitoring
- Set up Firebase Analytics
- Monitor email delivery rates
- Track authentication success/failure rates

### 4. Backup
- Implement backup authentication methods
- Add account recovery options
- Consider SMS fallback

## API Reference

### Authentication Endpoints

#### POST `/api/vendor/verify-2fa`
Verify Firebase token and generate JWT.

**Request:**
```json
{
  "firebaseToken": "firebase-id-token",
  "email": "vendor@example.com"
}
```

**Response:**
```json
{
  "token": "jwt-token",
  "vendor": {
    "id": 1,
    "email": "vendor@example.com",
    "twoFactorVerified": true
  }
}
```

#### POST `/api/vendor/enable-2fa`
Enable 2FA for a vendor.

**Response:**
```json
{
  "success": true,
  "message": "Two-factor authentication enabled"
}
```

#### POST `/api/vendor/disable-2fa`
Disable 2FA for a vendor.

**Response:**
```json
{
  "success": true,
  "message": "Two-factor authentication disabled"
}
```

#### GET `/api/vendor/2fa-status`
Get 2FA status for current vendor.

**Response:**
```json
{
  "twoFactorEnabled": true
}
```

## Contributing

When contributing to the 2FA system:

1. Follow the existing code structure
2. Add proper error handling
3. Include unit tests
4. Update documentation
5. Test with different email providers

## Support

For issues or questions:

1. Check the troubleshooting section
2. Review Firebase Console logs
3. Test with a simple Firebase project
4. Contact the development team

## License

This 2FA implementation is part of the Tiyende project and follows the same license terms. 