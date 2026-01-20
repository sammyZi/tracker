# Quick Start Guide

Get the backend up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Firebase project created (see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed instructions)

## Quick Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your Firebase credentials:

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"

PORT=3000
NODE_ENV=development

ALLOWED_ORIGINS=http://localhost:19006,exp://localhost:19000
```

**Where to get these values:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon → Project Settings
4. Go to "Service accounts" tab
5. Click "Generate new private key"
6. Extract values from the downloaded JSON file

### 3. Verify Setup

Run the verification script to ensure everything is configured correctly:

```bash
npm run verify
```

You should see:
```
=== Firebase Setup Verification ===

Checking environment variables...
✓ FIREBASE_PROJECT_ID is set
✓ FIREBASE_CLIENT_EMAIL is set
✓ FIREBASE_PRIVATE_KEY is set

✓ All environment variables are set

Initializing Firebase Admin SDK...
✓ Firebase Admin SDK initialized successfully

Testing Firestore connection...
✓ Firestore connection successful

Testing Firebase Authentication...
✓ Firebase Authentication accessible

=== Setup Verification Complete ===

✓ All checks passed!
✓ Firebase project is properly configured
✓ Backend is ready to run
```

### 4. Start the Server

```bash
npm run dev
```

You should see:
```
Initializing Firebase...
Firebase initialized successfully
Server is running on port 3000
Environment: development
Health check: http://localhost:3000/api/health
```

### 5. Test the API

Open your browser or use curl:

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

## Troubleshooting

### "Missing Firebase configuration" error

- Check that your `.env` file exists in the `backend` directory
- Verify all three Firebase variables are set
- Make sure there are no typos in variable names

### "Invalid private key" error

- Ensure the private key includes `\n` characters (not actual line breaks)
- Keep the quotes around the private key value
- Copy the entire key including BEGIN and END markers

### Port already in use

Change the port in `.env`:
```env
PORT=3001
```

### CORS errors

Add your frontend URL to `ALLOWED_ORIGINS` in `.env`:
```env
ALLOWED_ORIGINS=http://localhost:19006,exp://localhost:19000,http://localhost:3000
```

## Next Steps

✅ Task 1 Complete: Firebase project and backend infrastructure set up

Continue with:
- **Task 2**: Implement backend authentication system
- **Task 3**: Implement user profile management backend
- **Task 4**: Implement activity cloud storage backend

## Available Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run verify` - Verify Firebase setup

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── firebase.ts          # Firebase initialization
│   ├── middleware/
│   │   ├── auth.ts              # Authentication middleware
│   │   └── errorHandler.ts     # Error handling
│   ├── routes/
│   │   └── index.ts             # API routes
│   ├── types/
│   │   └── index.ts             # TypeScript types
│   ├── app.ts                   # Express app setup
│   └── index.ts                 # Server entry point
├── scripts/
│   └── verify-setup.js          # Setup verification
├── .env                         # Environment variables (create this)
├── .env.example                 # Environment template
├── package.json
└── tsconfig.json
```

## Need Help?

- See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed Firebase configuration
- See [README.md](./README.md) for full documentation
- Check the troubleshooting section above
