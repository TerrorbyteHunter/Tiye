# Firebase 2FA Setup Guide

This guide will help you set up Firebase Authentication with email OTP for two-factor authentication in your Tiyende vendor portal.

## Prerequisites

1. A Google account
2. Access to Firebase Console
3. Basic understanding of Firebase Authentication

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "tiyende-vendor-2fa")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Email/Password" authentication
5. Enable "Email link (passwordless sign-in)" for OTP functionality
6. Save your changes

## Step 3: Configure Email Templates

1. In the Authentication section, go to "Templates" tab
2. Click on "Email link (passwordless sign-in)"
3. Customize the email template:
   - **Subject**: "Verify your Tiyende vendor login"
   - **Sender name**: "Tiyende Security"
   - **Reply-to**: "security@tiyende.com"
   - **Message**: Customize the email content as needed
4. Save the template

## Step 4: Get Firebase Configuration

1. In your Firebase project, click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>) to add a web app
5. Register your app with a nickname (e.g., "Tiyende Vendor Portal")
6. Copy the Firebase configuration object

## Step 5: Update Firebase Configuration

1. Open `monorepo/apps/vendor/src/lib/firebase.ts`
2. Replace the placeholder configuration with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

3. Update the action code settings:

```typescript
const actionCodeSettings = {
  url: 'http://localhost:5173/verify-email', // Update with your domain
  handleCodeInApp: true,
  iOS: {
    bundleId: 'com.yourapp.ios'
  },
  android: {
    packageName: 'com.yourapp.android',
    installApp: true,
    minimumVersion: '12'
  },
  dynamicLinkDomain: 'your-dynamic-link-domain.page.link' // Optional
};
```

## Step 6: Environment Variables

Create a `.env` file in the vendor app directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# JWT Secret (for backend)
JWT_SECRET=your-jwt-secret-key
```

## Step 7: Database Schema Updates

Add the following column to your `vendor_users` table:

```sql
ALTER TABLE vendor_users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE;
```

## Step 8: Testing the Setup

1. Start your development server:
   ```bash
   cd monorepo/apps/vendor
   npm run dev
   ```

2. Navigate to `http://localhost:5173/login-2fa`

3. Try logging in with a vendor account

4. Check that the email verification flow works correctly

## Security Considerations

1. **Firebase Admin SDK**: In production, implement Firebase Admin SDK on your backend to verify tokens server-side
2. **Rate Limiting**: Implement rate limiting for email sending
3. **Domain Verification**: Verify your domain in Firebase Console
4. **HTTPS**: Ensure your production domain uses HTTPS
5. **Token Expiration**: Configure appropriate token expiration times

## Production Deployment

1. Update the Firebase configuration with your production domain
2. Set up proper CORS settings in Firebase Console
3. Configure email templates for production
4. Set up monitoring and logging
5. Test the complete flow in a staging environment

## Troubleshooting

### Common Issues

1. **Email not received**: Check spam folder and Firebase Console logs
2. **Invalid link**: Ensure the action code settings URL matches your domain
3. **CORS errors**: Configure CORS settings in Firebase Console
4. **Token verification fails**: Check JWT secret and token expiration

### Debug Mode

Enable debug logging by adding this to your browser console:

```javascript
localStorage.setItem('debug', 'firebase:*');
```

## Support

If you encounter issues:

1. Check Firebase Console for error logs
2. Verify your configuration matches the setup guide
3. Test with a simple Firebase project first
4. Check browser console for JavaScript errors

## Additional Features

Consider implementing these additional security features:

1. **Backup codes**: Generate backup codes for account recovery
2. **Device management**: Allow users to manage trusted devices
3. **Login history**: Track and display login attempts
4. **Account lockout**: Implement temporary account lockouts after failed attempts
5. **SMS fallback**: Add SMS OTP as a backup option

## Cost Considerations

Firebase Authentication pricing (as of 2024):
- **Free tier**: 10,000 authentications/month
- **Paid tier**: $0.01 per authentication after free tier
- **Email sending**: Included in authentication costs

For most small to medium applications, the free tier should be sufficient. 