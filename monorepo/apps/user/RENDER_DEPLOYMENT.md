# Render Deployment Guide for Tiyende User Backend

## Prerequisites

1. **Render Account**: Make sure you have a Render account
2. **Database**: PostgreSQL database already created on Render
3. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, etc.)

## Step 1: Database Setup

### 1.1 Get Database Connection String
1. Go to your Render dashboard
2. Navigate to your PostgreSQL database service
3. Copy the **External Database URL** from the database settings
4. The URL format should be: `postgresql://username:password@host:port/database_name`

### 1.2 Database Schema
Make sure your database has the required tables. You can run the SQL scripts from the `Database/` folder or use the test scripts in the admin app.

## Step 2: Backend Service Setup

### 2.1 Create Web Service
1. Go to your Render dashboard
2. Click "New +" → "Web Service"
3. Connect your Git repository
4. Set the following configuration:

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm start
```

**Root Directory:** `monorepo/apps/user`

### 2.2 Environment Variables
Set these environment variables in your Render service:

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | `postgresql://username:password@host:port/database_name` | Your Render database connection string |
| `JWT_SECRET` | `your-secret-key-here` | A secure random string for JWT tokens |
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `10000` | Port for the application |

### 2.3 Health Check
The service includes a health check endpoint at `/api/health` that Render will use to verify the service is running.

## Step 3: Deploy and Test

### 3.1 Deploy
1. Commit and push your changes to your Git repository
2. Render will automatically detect changes and deploy
3. Monitor the deployment logs for any errors

### 3.2 Test the Connection
Once deployed, test the database connection:

```bash
curl https://your-render-service.onrender.com/api/health
```

Expected response:
```json
{"status":"ok"}
```

### 3.3 Test Database Endpoints
Test your API endpoints:

```bash
# Test routes endpoint
curl https://your-render-service.onrender.com/api/user/routes

# Test login endpoint
curl -X POST https://your-render-service.onrender.com/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"mobile":"1234567890","username":"testuser","password":"password"}'
```

## Step 4: Update Frontend Configuration

### 4.1 Update API Base URL
Update your frontend configuration to use the new Render backend URL:

```typescript
// In your frontend API configuration
const API_BASE_URL = 'https://your-render-service.onrender.com';
```

### 4.2 Update CORS
If your frontend is hosted on a different domain, update the CORS configuration in the backend to include your frontend domain.

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify the `DATABASE_URL` is correct
   - Check that the database is accessible from Render
   - Ensure the database user has proper permissions

2. **Build Failures**
   - Check that all dependencies are in `package.json`
   - Verify the build command is correct
   - Check the build logs for specific errors

3. **Runtime Errors**
   - Check the service logs in Render dashboard
   - Verify all environment variables are set
   - Test the health check endpoint

### Logs and Monitoring
- View logs in the Render dashboard under your service
- Monitor the service health and performance
- Set up alerts for downtime

## Security Considerations

1. **Environment Variables**: Never commit sensitive data like database URLs or secrets
2. **CORS**: Only allow necessary origins in production
3. **HTTPS**: Render provides HTTPS by default
4. **Database**: Use strong passwords and limit database access

## Cost Optimization

1. **Free Tier**: Render offers a free tier with limitations
2. **Auto-sleep**: Free services sleep after 15 minutes of inactivity
3. **Scaling**: Upgrade to paid plans for better performance and reliability

## Next Steps

1. Set up monitoring and alerts
2. Configure custom domain (optional)
3. Set up CI/CD pipeline
4. Implement database backups
5. Add rate limiting and security headers 