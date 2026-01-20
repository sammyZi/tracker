# Firebase and Backend Setup Checklist

Use this checklist to ensure you've completed all setup steps correctly.

## ☐ Prerequisites

- [ ] Node.js 18+ installed
- [ ] npm installed
- [ ] Google account for Firebase
- [ ] Git installed (optional)

## ☐ Firebase Project Setup

### Create Firebase Project
- [ ] Navigate to [Firebase Console](https://console.firebase.google.com/)
- [ ] Click "Add project" or "Create a project"
- [ ] Enter project name (e.g., "social-fitness-platform")
- [ ] Complete project creation wizard
- [ ] Project dashboard is accessible

### Enable Firebase Authentication
- [ ] Go to "Authentication" in Firebase Console
- [ ] Click "Get started"
- [ ] Go to "Sign-in method" tab
- [ ] Enable "Google" provider
- [ ] Enter support email
- [ ] Save configuration

### Enable Cloud Firestore
- [ ] Go to "Firestore Database" in Firebase Console
- [ ] Click "Create database"
- [ ] Select "Start in test mode"
- [ ] Choose database location
- [ ] Database is created and accessible

### Get Service Account Credentials
- [ ] Go to Project Settings (gear icon)
- [ ] Go to "Service accounts" tab
- [ ] Click "Generate new private key"
- [ ] Download JSON file
- [ ] Store JSON file securely (DO NOT commit to git)
- [ ] Extract `project_id`, `client_email`, and `private_key`

## ☐ Backend Installation

### Install Dependencies
- [ ] Navigate to `backend` directory
- [ ] Run `npm install`
- [ ] All dependencies installed successfully
- [ ] No critical errors in installation

### Configure Environment Variables
- [ ] Copy `.env.example` to `.env`
- [ ] Open `.env` file
- [ ] Set `FIREBASE_PROJECT_ID` from service account JSON
- [ ] Set `FIREBASE_CLIENT_EMAIL` from service account JSON
- [ ] Set `FIREBASE_PRIVATE_KEY` from service account JSON (keep `\n` characters)
- [ ] Verify `PORT` is set (default: 3000)
- [ ] Verify `NODE_ENV` is set (default: development)
- [ ] Verify `ALLOWED_ORIGINS` includes your frontend URLs
- [ ] Save `.env` file

### Verify Setup
- [ ] Run `npm run verify`
- [ ] All environment variables check passes
- [ ] Firebase Admin SDK initializes successfully
- [ ] Firestore connection test passes
- [ ] Firebase Authentication check passes
- [ ] No errors in verification output

## ☐ Test Backend Server

### Start Development Server
- [ ] Run `npm run dev`
- [ ] Server starts without errors
- [ ] See "Firebase initialized successfully" message
- [ ] See "Server is running on port 3000" message
- [ ] No error messages in console

### Test Health Endpoint
- [ ] Open browser to `http://localhost:3000/api/health`
- [ ] OR run: `curl http://localhost:3000/api/health`
- [ ] Receive JSON response with `"success": true`
- [ ] Response includes timestamp

### Test API Info Endpoint
- [ ] Open browser to `http://localhost:3000/api`
- [ ] OR run: `curl http://localhost:3000/api`
- [ ] Receive JSON response with API information
- [ ] Response includes list of endpoints

## ☐ Security Verification

### Git Configuration
- [ ] `.env` file is in `.gitignore`
- [ ] Service account JSON file is in `.gitignore`
- [ ] No sensitive credentials in git history
- [ ] `.env.example` is committed (without real credentials)

### Environment Variables
- [ ] `.env` file is NOT committed to git
- [ ] Service account JSON is NOT committed to git
- [ ] All sensitive data is in environment variables
- [ ] No hardcoded credentials in source code

### Firebase Security
- [ ] Firebase project has proper access controls
- [ ] Service account key is stored securely
- [ ] Only authorized team members have Firebase access

## ☐ Documentation Review

- [ ] Read `README.md` for full documentation
- [ ] Read `FIREBASE_SETUP.md` for detailed setup steps
- [ ] Read `QUICKSTART.md` for quick reference
- [ ] Understand project structure
- [ ] Know where to find troubleshooting help

## ☐ Optional: Build and Production Test

### Build TypeScript
- [ ] Run `npm run build`
- [ ] Build completes without errors
- [ ] `dist` directory is created
- [ ] JavaScript files are in `dist` directory

### Test Production Build
- [ ] Run `npm start`
- [ ] Server starts from compiled JavaScript
- [ ] Health endpoint works in production mode

## ☐ Ready for Next Steps

- [ ] All checklist items above are complete
- [ ] Backend server runs successfully
- [ ] API endpoints respond correctly
- [ ] No errors in console
- [ ] Ready to implement Task 2: Backend authentication system

## 🎉 Setup Complete!

If all items are checked, your Firebase project and backend infrastructure are properly set up!

## 📝 Notes

Use this space to record any issues or customizations:

```
Project ID: _______________________
Database Location: _______________________
Port: _______________________
Any custom configuration: _______________________
```

## 🆘 Troubleshooting

If any checklist item fails, refer to:
- `FIREBASE_SETUP.md` - Detailed setup instructions
- `README.md` - Troubleshooting section
- `QUICKSTART.md` - Common issues and solutions

## 📞 Need Help?

Common issues:
1. **"Missing Firebase configuration"** → Check `.env` file exists and has all variables
2. **"Invalid private key"** → Ensure private key has `\n` characters and is quoted
3. **"Port already in use"** → Change PORT in `.env` or kill process using the port
4. **CORS errors** → Add your frontend URL to ALLOWED_ORIGINS in `.env`

## ✅ Verification Command

Run this command to verify everything is set up correctly:

```bash
npm run verify && npm run build && npm run dev
```

This will:
1. Verify Firebase configuration
2. Build TypeScript
3. Start development server

If all three succeed, you're ready to go!
