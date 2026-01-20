# Firebase Setup Guide

This guide walks you through setting up Firebase for the Social Fitness Platform backend.

## Step 1: Create Firebase Project

1. Navigate to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter your project name: `social-fitness-platform` (or your preferred name)
4. Click **"Continue"**
5. (Optional) Enable Google Analytics if desired
6. Click **"Create project"**
7. Wait for project creation to complete
8. Click **"Continue"** to go to your project dashboard

## Step 2: Enable Firebase Authentication

1. In the left sidebar, click **"Authentication"**
2. Click **"Get started"**
3. Go to the **"Sign-in method"** tab
4. Find **"Google"** in the list of providers
5. Click on **"Google"** to expand it
6. Toggle the **"Enable"** switch to ON
7. Enter a **"Project support email"** (your email)
8. Click **"Save"**

### Configure OAuth Consent Screen (if prompted)

1. If prompted to configure OAuth consent screen, click the link
2. Select **"External"** user type
3. Click **"Create"**
4. Fill in required fields:
   - App name: `Social Fitness Platform`
   - User support email: your email
   - Developer contact information: your email
5. Click **"Save and Continue"**
6. Skip the Scopes section (click **"Save and Continue"**)
7. Skip the Test users section (click **"Save and Continue"**)
8. Review and click **"Back to Dashboard"**

## Step 3: Enable Cloud Firestore

1. In the left sidebar, click **"Firestore Database"**
2. Click **"Create database"**
3. Select **"Start in test mode"** (we'll add security rules later)
4. Click **"Next"**
5. Choose a location for your database (select closest to your users)
   - Example: `us-central1` for US users
   - Example: `europe-west1` for European users
6. Click **"Enable"**
7. Wait for database creation to complete

### Initial Firestore Configuration

The database will start in test mode with these rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2024, 3, 1);
    }
  }
}
```

**Important:** These rules allow anyone to read/write. We'll implement proper security rules in Task 22.

## Step 4: Get Firebase Admin SDK Credentials

1. Click the **gear icon** (⚙️) next to "Project Overview" in the left sidebar
2. Click **"Project settings"**
3. Go to the **"Service accounts"** tab
4. You should see "Firebase Admin SDK" section
5. Select **"Node.js"** as the language
6. Click **"Generate new private key"**
7. A dialog will appear warning you to keep the key secure
8. Click **"Generate key"**
9. A JSON file will download automatically (e.g., `social-fitness-platform-firebase-adminsdk-xxxxx.json`)

### Extract Credentials from JSON File

Open the downloaded JSON file and extract these values:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",           // ← Copy this
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",  // ← Copy this
  "client_email": "firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com",  // ← Copy this
  "client_id": "...",
  "auth_uri": "...",
  "token_uri": "...",
  "auth_provider_x509_cert_url": "...",
  "client_x509_cert_url": "..."
}
```

## Step 5: Configure Backend Environment Variables

1. Navigate to the `backend` directory
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. Open `.env` and fill in the values from your Firebase service account JSON:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:19006,exp://localhost:19000
```

**Important Notes:**
- Keep the quotes around `FIREBASE_PRIVATE_KEY`
- Keep the `\n` characters in the private key (they represent line breaks)
- Never commit the `.env` file to version control
- Never commit the service account JSON file to version control

## Step 6: Verify Setup

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. You should see:
   ```
   Initializing Firebase...
   Firebase initialized successfully
   Server is running on port 3000
   Environment: development
   Health check: http://localhost:3000/api/health
   ```

4. Test the health check endpoint:
   ```bash
   curl http://localhost:3000/api/health
   ```

   Expected response:
   ```json
   {
     "success": true,
     "message": "Server is running",
     "timestamp": "2024-01-20T12:00:00.000Z"
   }
   ```

## Step 7: Get Web App Configuration (for Mobile App)

You'll need this configuration for the mobile app in later tasks.

1. In Firebase Console, go to **"Project settings"**
2. Scroll down to **"Your apps"** section
3. Click the **Web icon** (`</>`) to add a web app
4. Enter app nickname: `Social Fitness Web`
5. Click **"Register app"**
6. Copy the Firebase configuration object:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

Save this configuration - you'll need it when setting up the mobile app authentication.

## Troubleshooting

### Error: "Missing Firebase configuration"
- Check that all three environment variables are set in `.env`
- Verify there are no typos in variable names
- Ensure the `.env` file is in the `backend` directory

### Error: "Invalid private key"
- Verify the private key includes the full key with BEGIN and END markers
- Check that `\n` characters are present (not actual line breaks)
- Ensure the private key is wrapped in quotes in `.env`

### Error: "Permission denied"
- Verify the service account has the necessary permissions
- Check that you downloaded the key from the correct Firebase project
- Try generating a new private key

### CORS errors when testing from mobile app
- Add your Expo development URL to `ALLOWED_ORIGINS` in `.env`
- Restart the backend server after changing `.env`

## Security Checklist

- [ ] Firebase project created
- [ ] Google OAuth provider enabled
- [ ] Cloud Firestore database created
- [ ] Service account key downloaded and stored securely
- [ ] Environment variables configured in `.env`
- [ ] `.env` file added to `.gitignore`
- [ ] Service account JSON file NOT committed to git
- [ ] Backend server starts successfully
- [ ] Health check endpoint responds correctly

## Next Steps

After completing this setup:
1. ✅ Task 1 complete: Firebase project and backend infrastructure set up
2. → Task 2: Implement backend authentication system
3. → Task 3: Implement user profile management backend
4. → Continue with remaining tasks...

## Additional Resources

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Cloud Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
