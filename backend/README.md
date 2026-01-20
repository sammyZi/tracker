# Social Fitness Platform - Backend API

Node.js/Express backend API for the Social Fitness Platform with Firebase integration.

## Features

- Firebase Authentication with Google OAuth
- Cloud Firestore database integration
- RESTful API endpoints
- JWT token verification middleware
- Error handling and logging
- CORS configuration
- TypeScript support

## Prerequisites

- Node.js 18+ installed
- Firebase project created in Google Cloud Console
- Firebase Admin SDK credentials

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name (e.g., "social-fitness-platform")
4. Follow the setup wizard

### 2. Enable Firebase Authentication

1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Google" provider
5. Configure OAuth consent screen if prompted

### 3. Enable Cloud Firestore

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (we'll add security rules later)
4. Select a location for your database
5. Click "Enable"

### 4. Get Firebase Admin SDK Credentials

1. In Firebase Console, go to "Project Settings" (gear icon)
2. Go to "Service accounts" tab
3. Click "Generate new private key"
4. Save the JSON file securely (DO NOT commit to git)
5. Extract the following values:
   - `project_id`
   - `client_email`
   - `private_key`

## Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create `.env` file from example:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"

PORT=3000
NODE_ENV=development

ALLOWED_ORIGINS=http://localhost:19006,exp://localhost:19000
```

**Note:** The private key should include the full key with `\n` characters for line breaks.

## Running the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm run build
npm start
```

### Run tests:
```bash
npm test
```

## API Endpoints

### Health Check
- `GET /api/health` - Check server status

### API Info
- `GET /api` - Get API information and available endpoints

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── firebase.ts          # Firebase initialization
│   ├── middleware/
│   │   ├── auth.ts              # Authentication middleware
│   │   └── errorHandler.ts     # Error handling middleware
│   ├── routes/
│   │   └── index.ts             # Route definitions
│   ├── app.ts                   # Express app configuration
│   └── index.ts                 # Server entry point
├── .env.example                 # Environment variables template
├── .gitignore
├── jest.config.js               # Jest configuration
├── package.json
├── tsconfig.json                # TypeScript configuration
└── README.md
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email | Yes |
| `FIREBASE_PRIVATE_KEY` | Firebase service account private key | Yes |
| `PORT` | Server port (default: 3000) | No |
| `NODE_ENV` | Environment (development/production/test) | No |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins | No |

## Security Notes

- Never commit `.env` file or `serviceAccountKey.json` to version control
- Keep Firebase credentials secure
- Use environment variables for all sensitive configuration
- Enable Firebase Security Rules before production deployment
- Use HTTPS in production

## Next Steps

After setting up the backend infrastructure:
1. Implement authentication endpoints (Task 2)
2. Implement user profile management (Task 3)
3. Implement activity cloud storage (Task 4)
4. Add more API endpoints as needed

## Troubleshooting

### Firebase initialization fails
- Check that all environment variables are set correctly
- Verify the private key format (should include `\n` for line breaks)
- Ensure the service account has necessary permissions

### CORS errors
- Add your frontend URL to `ALLOWED_ORIGINS` in `.env`
- Check that the origin is being sent correctly from the client

### Port already in use
- Change the `PORT` in `.env` to a different value
- Kill the process using the port: `lsof -ti:3000 | xargs kill` (Mac/Linux)
