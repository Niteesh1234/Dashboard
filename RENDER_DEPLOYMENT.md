# Deploy to Render - Step-by-Step Guide

## ✅ Fixed: Dockerfile Error
If you got "failed to read dockerfile: open Dockerfile: no such file or directory", the issue is now fixed! I've created root-level Dockerfiles (`Dockerfile.api` and `Dockerfile.dashboard`) that Render can find.

## Prerequisites
1. **MongoDB Atlas Account**: [mongodb.com/atlas](https://mongodb.com/atlas) (free)
2. **MySQL Database**: PlanetScale or Railway (see options below)
3. **Render Account**: [render.com](https://render.com) (free tier available)

## Step 1: Set Up Databases

### MongoDB Atlas (Free)
1. Create account at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create free cluster (M0 tier)
3. Create database user
4. Get connection string (looks like: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`)

### MySQL Database Options

#### Option A: PlanetScale (Requires Card)
1. Create account at [planetscale.com](https://planetscale.com)
2. Create database
3. Get connection details

#### Option B: Railway MySQL (Free)
1. Create Railway account
2. Add MySQL database to your project
3. Get connection details from Railway dashboard

## Step 2: Deploy to Render

### Method 1: Using render.yaml (Recommended)

1. **Connect Repository**:
   - Go to [render.com](https://render.com)
   - Connect your GitHub repository
   - Render will auto-detect `render.yaml`

2. **Set Environment Variables**:
   In Render dashboard, set these for each service:

   **API Service**:
   ```
   MONGODB_URI=your_mongodb_atlas_connection_string
   MYSQL_HOST=your_mysql_host
   MYSQL_USER=your_mysql_username
   MYSQL_PASSWORD=your_mysql_password
   MYSQL_DATABASE=your_database_name
   NODE_ENV=production
   ```

   **Dashboard Service**:
   ```
   MONGODB_URI=your_mongodb_atlas_connection_string
   NODE_ENV=production
   ```

3. **Deploy**: Click "Create" and wait for deployment

### Method 2: Manual Deployment

1. **Create API Service**:
   - New → Web Service
   - Connect GitHub repo
   - Runtime: Docker
   - Dockerfile Path: `Dockerfile.api`
   - Set environment variables (see above)

2. **Create Dashboard Service**:
   - New → Web Service
   - Connect GitHub repo
   - Runtime: Docker
   - Dockerfile Path: `Dockerfile.dashboard`
   - Set environment variables (see above)
   - Add environment variable: `API_URL=https://your-api-service.onrender.com`

## Step 3: Configure Database Schema

### For MySQL:
Upload your schema to your MySQL database:
- Use the SQL files in `docker/mysql-init/`
- Or use a MySQL client to create tables

### For MongoDB:
The application will create collections automatically.

## Step 4: Test Deployment

1. **API**: Visit `https://your-api.onrender.com/api/stats/summary`
2. **Dashboard**: Visit `https://your-dashboard.onrender.com`

## Troubleshooting

### Service Crashes:
- Check logs in Render dashboard
- Verify environment variables are set correctly
- Ensure database connections work

### Database Connection Issues:
- Verify connection strings
- Check firewall settings (Atlas)
- Ensure database user has correct permissions

### Memory Issues:
- Render free tier: 512MB RAM
- Reduce concurrent connections if needed
- Monitor usage in Render dashboard

## Free Tier Limits

- **Render**: 750 hours/month, 512MB RAM
- **MongoDB Atlas**: 512MB storage
- **PlanetScale**: 1GB storage (requires card)
- **Railway**: Generous free tier for databases

## Cost Optimization

- Monitor usage to stay within free tiers
- Scale up only when needed
- Use Railway for better Docker Compose support if Render struggles

## Alternative: Railway Deployment (Recommended)

**Railway is actually better for your application** because:

- ✅ **Native Docker Compose support** (no Dockerfile errors)
- ✅ **Free databases included** (PostgreSQL/MySQL)
- ✅ **No card required** for basic usage
- ✅ **Better resource allocation** for complex apps

### Railway Deployment Steps:

1. **Create Railway Account**: [railway.app](https://railway.app) (free, no card)

2. **Connect Repository**:
   - Railway auto-detects `railway.json`
   - Uses `render-compose.yml` for deployment

3. **Add Databases**:
   - Railway provides free PostgreSQL/MySQL
   - Or use external MongoDB Atlas

4. **Set Environment Variables** (same as Render)

5. **Deploy**: One-click deployment!

**Try Railway first** - it's much better suited for Docker Compose applications like yours.
