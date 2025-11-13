# Railway Deployment Guide

## 🚀 Quick Deploy (5 minutes)

### Step 1: Push Changes to GitHub
```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### Step 2: Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Click **"New Project"**
3. Choose **"Deploy from GitHub repo"**
4. Select your repository
5. Click **"Deploy"**

Railway will automatically:
- ✅ Detect `docker-compose.railway.yml`
- ✅ Build your containers
- ✅ Create MySQL and MongoDB databases
- ✅ Set environment variables
- ✅ Deploy your app

### Step 3: Get Your URLs
After deployment, Railway provides:
- **API**: `https://your-project-name.railway.app` (port 3000)
- **Dashboard**: `https://your-project-name.railway.app` (port 3001)

## 🔧 Configuration Details

### Environment Variables (Auto-set by Railway)
Railway automatically provides these variables:
- `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`
- `MONGODB_URL`
- `PORT` (for web services)

### Database Setup
1. Railway creates databases automatically
2. Run your schema: `docker/mysql-init/init.sql`
3. Or use Railway's database dashboard

## 📊 Free Tier Limits
- 512MB RAM per service
- 1GB disk total
- Perfect for development/demo

## 🐛 Troubleshooting

### Check Logs
```bash
# In Railway dashboard → Your service → Logs tab
```

### Common Issues
1. **Database connection fails**: Check environment variables
2. **Service won't start**: Verify Dockerfile configuration
3. **Memory limits**: Free tier = 512MB per service

## 🎯 What Gets Deployed
- ✅ **API Service** (Node.js/Express)
- ✅ **Dashboard Service** (Node.js/EJS)
- ✅ **MySQL Database** (Railway managed)
- ✅ **MongoDB Database** (Railway managed)

## 💡 Next Steps
1. Test your endpoints
2. Add custom domain (optional)
3. Scale up if needed

**Your app is now live! 🎉**
