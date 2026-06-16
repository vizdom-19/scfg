# Vercel Deployment Guide

This guide walks you through deploying your React frontend and Express backend to Vercel.

## Prerequisites
- Vercel account (free tier works)
- GitHub connected to Vercel
- MongoDB Atlas connection string (NEW credentials)
- New Vercel token generated after revoking the old one

## Critical: Revoke Old Credentials First

⚠️ **SECURITY**: The credentials you initially shared are now compromised.

**Action items:**
1. **Revoke Vercel Token**: https://vercel.com/account/tokens → Delete the old token
2. **Reset MongoDB Password**: 
   - Go to MongoDB Atlas → Database Access
   - Find user `vedu989we_db_user`
   - Click "Edit" → "Edit Password"
   - Generate a new secure password
   - Update the connection string below

---

## Part 1: Backend Deployment

### 1.1 Deploy Backend to Vercel

**Via Vercel CLI:**
```bash
vercel --prod --cwd backend
```

**Via Vercel Dashboard:**
1. Go to https://vercel.com/new
2. Import your `vizdom-19/scfg` repository
3. Select "backend" as the root directory
4. Project name: `scfg-backend`
5. Click "Deploy"

### 1.2 Set Backend Environment Variables

In Vercel dashboard → `scfg-backend` project → Settings → Environment Variables:

```
MONGO_URI = mongodb+srv://NEW_USER:NEW_PASSWORD@cluster0.diwsrqv.mongodb.net/studycompanion
JWT_SECRET = your-super-secret-key-here-minimum-32-characters-recommended
FRONTEND_URL = https://scfg.vercel.app
NODE_ENV = production
```

**Important**: Replace `NEW_USER:NEW_PASSWORD` with your new MongoDB credentials (NOT the exposed ones).

### 1.3 Update Backend Server Code

The backend `server.js` already supports environment variables. However, update the secure cookie flag:

**File: `backend/server.js` (line 68-73)**

Update from:
```javascript
res.cookie('token', token, {
  httpOnly: true,
  sameSite: 'lax',
  secure: false,  // ❌ This needs to be true in production
  maxAge: 24 * 60 * 60 * 1000
});
```

To:
```javascript
res.cookie('token', token, {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',  // ✅ Automatically true in production
  maxAge: 24 * 60 * 60 * 1000
});
```

Commit this change and redeploy:
```bash
vercel --prod --cwd backend
```

After deployment, get your backend URL (e.g., `https://scfg-backend.vercel.app`)

---

## Part 2: Frontend Deployment

### 2.1 Update Frontend Package.json

**File: `studycompfor_gate/package.json`**

Remove or comment out the proxy line (line 38):
```json
// DELETE THIS LINE:
"proxy": "http://localhost:5000",
```

### 2.2 Create Production Environment File

**File: `studycompfor_gate/.env.production`** (create this)
```
REACT_APP_API_URL=https://scfg-backend.vercel.app
```

### 2.3 Update API Calls in Components

Find all your API calls and update them. Look for files that call:
- `axios.post('/api/...')`
- `fetch('/api/...')`

**Example - Create an API service:**

Create `studycompfor_gate/src/services/api.js`:
```javascript
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,  // Important for cookies!
});

// Auth endpoints
export const authAPI = {
  register: (data) => apiClient.post('/api/auth/register', data),
  login: (data) => apiClient.post('/api/auth/login', data),
  logout: () => apiClient.post('/api/auth/logout'),
  checkAuth: () => apiClient.get('/api/auth/me'),
};
```

Then use in components:
```javascript
import { authAPI } from '../services/api';

const handleLogin = async (email, password) => {
  try {
    const response = await authAPI.login({ email, password });
    console.log('Login successful:', response.data);
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### 2.4 Deploy Frontend to Vercel

**Via Vercel CLI:**
```bash
vercel --prod --cwd studycompfor_gate
```

**Via Vercel Dashboard:**
1. Go to https://vercel.com/new
2. Import `vizdom-19/scfg`
3. Select `studycompfor_gate` as root directory
4. Project name: `scfg` (or `scfg-frontend`)
5. Click "Deploy"

### 2.5 Set Frontend Environment Variables

In Vercel dashboard → frontend project → Settings → Environment Variables:

```
REACT_APP_API_URL=https://scfg-backend.vercel.app
```

---

## Part 3: Connect Backend CORS

### Update Backend CORS Configuration

**File: `backend/server.js` (lines 14-17)**

Update CORS to accept your frontend URL:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

Commit and redeploy backend:
```bash
vercel --prod --cwd backend
```

---

## Part 4: Test the Connection

1. **Open your frontend**: `https://scfg.vercel.app`
2. **Try to register** a new user
3. **Check MongoDB Atlas**: 
   - Go to Collections → studycompanion database → users collection
   - Verify your new user appears
4. **Try to login** with the registered credentials

---

## Troubleshooting

### CORS Error: "No 'Access-Control-Allow-Origin'"
**Solution:**
- Verify `FRONTEND_URL` is set correctly in backend environment variables
- Make sure `credentials: true` is set in frontend axios/fetch
- Redeploy backend after updating CORS

### Authentication Cookie Not Saving
**Solution:**
- Ensure `withCredentials: true` in axios: `apiClient = axios.create({ withCredentials: true })`
- Check that `secure` cookie flag is correct (should be `true` in production)
- Verify both URLs are HTTPS

### MongoDB Connection Error
**Solution:**
- Verify MongoDB connection string is correct
- Check IP whitelist includes `0.0.0.0/0` (you already have this)
- Verify username and password are URL-encoded if they contain special characters
- Test connection locally with new credentials first

### 404 on Backend Routes
**Solution:**
- Ensure `backend/server.js` exports the app correctly (should have `module.exports = app`)
- Check routes are prefixed with `/api/auth/`
- View backend logs: Vercel dashboard → [Backend Project] → Deployments → Logs

### Build Fails on Frontend
**Solution:**
- Check build logs in Vercel dashboard
- Verify all dependencies are installed: `npm install` in `studycompfor_gate/`
- Ensure no build errors in local development

---

## Useful Commands

```bash
# Deploy backend
vercel --prod --cwd backend

# Deploy frontend
vercel --prod --cwd studycompfor_gate

# View live logs
vercel logs [project-name] --tail

# Pull production environment variables
vercel env pull .env.local

# Run locally with production env
node -r dotenv/config backend/server.js
```

---

## Security Checklist

- [ ] Old Vercel token revoked
- [ ] Old MongoDB credentials reset
- [ ] New MongoDB user created
- [ ] Environment variables set in Vercel (NOT in code)
- [ ] `.env` files added to `.gitignore`
- [ ] `secure` cookie flag set correctly
- [ ] HTTPS enforced (automatic with Vercel)
- [ ] CORS properly configured
- [ ] JWT_SECRET is strong and random (32+ characters)

---

## Next Steps

1. Monitor backend logs for errors
2. Test all authentication flows
3. Verify MongoDB has created users
4. Set up CI/CD to auto-deploy on git push
5. Consider adding email verification
6. Monitor costs (free tier should be fine)

---

**Questions?** Check:
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas Docs: https://docs.mongodb.com/atlas/
- Express CORS: https://expressjs.com/en/resources/middleware/cors.html
