# 🚀 Deployment Guide

## Frontend Deployment (Vercel)

### Step 1: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Set the following:
   - **Framework Preset**: Vite
   - **Root Directory**: `permitflow-hub-main` (or leave empty if deploying from root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 2: Environment Variables
Add these environment variables in Vercel dashboard:
```
VITE_API_BASE_URL=https://your-backend-url.onrender.com/api
```

### Step 3: Deploy
Click "Deploy" and wait for the build to complete.

---

## Backend Deployment (Render)

### Step 1: Deploy to Render
1. Go to [render.com](https://render.com) and sign in
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Set the following:
   - **Name**: `permit-management-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### Step 2: Environment Variables
Add these environment variables in Render dashboard:
```
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### Step 3: Deploy
Click "Create Web Service" and wait for deployment.

---

## Post-Deployment Steps

### 1. Update Frontend API URL
After backend deployment, update the frontend environment variable:
```
VITE_API_BASE_URL=https://your-actual-backend-url.onrender.com/api
```

### 2. Test the Application
1. Visit your Vercel frontend URL
2. Test login (admin@gmail.com / password123)
3. Test permit scraping
4. Test email subscriptions
5. Test CSV export

### 3. Configure Email (Optional)
For production email sending, update the email service in `backend/services/emailService.js`:
```javascript
// Replace the mock transporter with real SMTP
this.transporter = nodemailer.createTransporter({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
});
```

---

## Features Available After Deployment

✅ **Frontend**: Complete React app with all pages
✅ **Backend**: Node.js API with permit scraping
✅ **Database**: In-memory database (upgrade to PostgreSQL for production)
✅ **Email**: Automated CSV reports (configure SMTP for production)
✅ **Authentication**: Login/logout system
✅ **Scheduling**: Daily permit scraping and email reports

---

## Production Upgrades

### Database
- Replace in-memory database with PostgreSQL
- Update `backend/config/database.js` to use PostgreSQL connection

### Email
- Configure real SMTP service (Gmail, SendGrid, etc.)
- Update email service configuration

### Monitoring
- Add logging service (Winston, etc.)
- Set up error tracking (Sentry, etc.)

---

## URLs After Deployment

- **Frontend**: `https://your-app.vercel.app`
- **Backend API**: `https://your-backend.onrender.com/api`
- **Health Check**: `https://your-backend.onrender.com/api/health`
