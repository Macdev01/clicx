# Railway Deployment Guide for Clicx Monorepo

This guide explains how to deploy the entire Clicx monorepo to Railway.

## Project Structure

The monorepo contains multiple services:

- **backend-js**: Node.js/Express.js API backend
- **frontend**: Next.js frontend application
- **admin**: Admin dashboard application
- **shared**: Shared utilities and types

## Railway Configuration Files

### 1. `railway.json`
Main Railway configuration for the root project.

### 2. `railway.toml`
Service definitions for multiple applications.

### 3. `package.json`
Root package.json with workspace configuration and scripts.

### 4. `.railwayignore`
Specifies which files to exclude from deployment.

## Deployment Steps

### 1. Connect to Railway
1. Go to [Railway.app](https://railway.app)
2. Connect your GitHub account
3. Select the `Macdev01/clicx` repository

### 2. Configure Services
Railway will automatically detect the multiple services based on the configuration.

### 3. Set Environment Variables
For each service, set the required environment variables:

#### Backend Service
- `NODE_ENV=production`
- `PORT=8080`
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET`
- `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`
- Other variables from `backend-js/env.example`

#### Frontend Service
- `NEXT_PUBLIC_API_URL` (point to backend service URL)
- `NODE_ENV=production`

#### Admin Service
- `NEXT_PUBLIC_API_URL` (point to backend service URL)
- `NODE_ENV=production`

### 4. Deploy
1. Railway will automatically build and deploy all services
2. Each service will be deployed to its own URL
3. The backend service will be accessible at `/health` for health checks

## Service URLs

After deployment, you'll have:
- Backend API: `https://your-backend-service.railway.app`
- Frontend: `https://your-frontend-service.railway.app`
- Admin: `https://your-admin-service.railway.app`

## Database Setup

1. Create a PostgreSQL database in Railway
2. Set the database environment variables in the backend service
3. Run migrations: `npm run migrate` (this will happen automatically during deployment)

## Monitoring

- Use Railway's built-in monitoring and logs
- Health check endpoints:
  - Backend: `/health`
  - Frontend: `/`
  - Admin: `/`

## Troubleshooting

### Build Failures
- Check that all dependencies are properly installed
- Verify Node.js version compatibility (>=18.0.0)
- Check build logs for specific error messages

### Service Communication
- Ensure environment variables are correctly set
- Verify service URLs are accessible
- Check CORS configuration in backend

### Database Issues
- Verify database connection string
- Check if migrations ran successfully
- Ensure database is accessible from Railway

## Support

If you encounter issues:
1. Check Railway deployment logs
2. Verify environment variables
3. Test services locally first
4. Check the Railway documentation
