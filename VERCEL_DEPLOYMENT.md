# Vercel Deployment Guide for LinguaLearn

## 📋 Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. MongoDB Atlas account for production database
3. All environment variables ready

## 🚀 Deployment Steps

### 1. Prepare Environment Variables

In your Vercel project settings, add these environment variables:

**Backend Variables:**
- `MONGODB_URI` - Your MongoDB Atlas connection string
- `JWT_SECRET` - Your JWT secret key
- `NODE_ENV` - Set to `production`
- `FRONTEND_URL` - Your Vercel frontend URL (e.g., https://your-app.vercel.app)
- `EMAIL_USER` - Email service username (if using email features)
- `EMAIL_PASS` - Email service password (if using email features)

### 2. Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

#### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Vercel will auto-detect the configuration from `vercel.json`
4. Add environment variables in the project settings
5. Click "Deploy"

### 3. Post-Deployment Configuration

After deployment:

1. **Update CORS settings** in `Mern/backend/server.js`:
   - Add your Vercel domain to allowed origins

2. **Update API endpoints** in your frontend:
   - Change API base URL to your Vercel backend URL

3. **Test all endpoints**:
   - `/health` - Health check
   - `/api/auth/*` - Authentication routes
   - `/api/users/*` - User routes
   - etc.

## 🔧 Common Vercel Errors & Fixes

### DEPLOYMENT_NOT_FOUND (404)
- **Cause**: Incorrect deployment URL or deleted deployment
- **Fix**: Verify your Vercel project URL in dashboard

### NO_RESPONSE_FROM_FUNCTION (502)
- **Cause**: Function timeout or crash
- **Fix**: 
  - Check Vercel function logs
  - Ensure MongoDB connection is established
  - Add proper error handling in routes

### FUNCTION_INVOCATION_FAILED (500)
- **Cause**: Unhandled exception in serverless function
- **Fix**:
  - Check Vercel logs for stack traces
  - Ensure all dependencies are in `package.json`
  - Validate environment variables are set

### NOT_FOUND (404) for API Routes
- **Cause**: Route misconfiguration in `vercel.json`
- **Fix**: Verify route patterns match your API structure

## 📊 Monitoring

- **Vercel Dashboard**: Monitor deployments, logs, and analytics
- **Function Logs**: Check serverless function execution logs
- **Performance**: Monitor response times and errors

## 🔒 Security Checklist

- [ ] All sensitive data in environment variables
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Helmet security headers active
- [ ] MongoDB connection uses SSL
- [ ] JWT secrets are strong and unique

## 🐛 Debugging Tips

1. **Check Vercel Logs**: 
   - Go to your project → Deployments → Click on deployment → View Function Logs

2. **Test Locally First**:
   ```bash
   # Set NODE_ENV to production
   NODE_ENV=production npm start
   ```

3. **Verify Build Output**:
   - Ensure `Mern/project/dist` is created during build
   - Check that all static assets are included

4. **Database Connection**:
   - Verify MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
   - Or add Vercel's IP ranges to whitelist

## 📝 Notes

- Vercel serverless functions have a 10-second execution limit on Hobby plan
- For longer operations, consider upgrading to Pro plan or using background jobs
- Static files are served from CDN automatically
- Environment variables are encrypted at rest

## 🆘 Need Help?

- Vercel Documentation: https://vercel.com/docs
- Vercel Community: https://github.com/vercel/vercel/discussions
- MongoDB Atlas: https://docs.atlas.mongodb.com/