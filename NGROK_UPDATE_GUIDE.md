# Ngrok Link Update Guide

When you get a new ngrok link, you need to update several configuration files across the Tiyende project.

## 🔗 New Ngrok Link Format
```
https://[random-string].ngrok-free.app
```

## 📝 Files to Update

### 1. User App Environment Variables
**File:** `monorepo/apps/user/.env.production`
```env
VITE_API_URL=https://[your-new-ngrok-link].ngrok-free.app/api
```

### 2. User Backend CORS Configuration
**File:** `monorepo/apps/user/server/index.ts`

Update both CORS configurations:

**First CORS block (around line 40):**
```typescript
app.use(cors({
  origin: [
    'http://localhost:6173', // user frontend (local)
    'https://tiyende-3811a.web.app', // Firebase deployed frontend
    'https://tiyende-3811a.firebaseapp.com', // Firebase Hosting frontend
    'https://[your-new-ngrok-link].ngrok-free.app' // new ngrok backend
  ],
  credentials: true
}));
```

**Second CORS block (around line 510):**
```typescript
app.options('*', cors({
  origin: [
    'http://localhost:6173',
    'https://tiyende-3811a.web.app',
    'https://tiyende-3811a.firebaseapp.com', // Firebase Hosting frontend
    'https://[your-new-ngrok-link].ngrok-free.app'
  ],
  credentials: true
}), (req, res) => {
  res.sendStatus(200);
});
```

### 3. Admin Backend CORS Configuration (if needed)
**File:** `monorepo/apps/admin/server/index.ts`

If your admin backend is also exposed via ngrok, update the CORS origins:

```typescript
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://tiyende-3811a.web.app',
    'https://tiyende-3811admin.web.app',
    'https://tiyende-3811vendor.web.app',
    'https://tiyende-3811a.firebaseapp.com', // Added for Firebase Hosting frontend
    'https://[your-new-ngrok-link].ngrok-free.app' // Add if admin backend is exposed
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
```

### 4. Vendor Backend CORS Configuration (if needed)
**File:** `monorepo/apps/vendor/server/index.ts`

If your vendor backend is also exposed via ngrok, update the CORS origins:

```typescript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://tiyende-3811vendor.web.app',
    'https://tiyende-3811a.firebaseapp.com',
    'https://[your-new-ngrok-link].ngrok-free.app' // Add if vendor backend is exposed
  ],
  credentials: true
}));
```

## 🔄 Steps After Updating

1. **Restart all backend servers** that you updated
2. **Rebuild the frontend** if you updated environment variables:
   ```bash
   cd monorepo/apps/user
   npm run build
   ```
3. **Redeploy the frontend** to Firebase Hosting:
   ```bash
   firebase deploy --only hosting
   ```

## 🧪 Testing

After updating, test these endpoints:
- User login: `https://[your-new-ngrok-link].ngrok-free.app/api/user/login`
- Health check: `https://[your-new-ngrok-link].ngrok-free.app/api/health`

## ⚠️ Important Notes

- **Ngrok links expire** - Update them regularly
- **CORS is strict** - Make sure all your frontend domains are listed
- **Environment variables** - Don't forget to rebuild/redeploy after changing `.env.production`
- **Multiple backends** - If you expose multiple backends via ngrok, update CORS for each one

## 🔍 Quick Find Commands

To find all files that might need updating:
```bash
# Find all CORS configurations
grep -r "cors" monorepo/apps/*/server/

# Find all environment variable files
find monorepo -name ".env*"

# Find all ngrok references
grep -r "ngrok" monorepo/
```

## 📋 Checklist

- [ ] Update `.env.production` with new API URL
- [ ] Update CORS origins in user backend
- [ ] Update CORS origins in admin backend (if needed)
- [ ] Update CORS origins in vendor backend (if needed)
- [ ] Restart all backend servers
- [ ] Rebuild frontend
- [ ] Redeploy to Firebase Hosting
- [ ] Test login functionality
- [ ] Test API endpoints

---

**Last Updated:** July 12, 2025  
**Current Ngrok Link:** `https://62a6b69a4faf.ngrok-free.app` 