/**
 * Verification script to check Firebase setup
 * Run this after configuring your .env file
 */

const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkEnvVar(name) {
  const value = process.env[name];
  if (!value) {
    log(`✗ ${name} is not set`, colors.red);
    return false;
  }
  log(`✓ ${name} is set`, colors.green);
  return true;
}

async function verifySetup() {
  log('\n=== Firebase Setup Verification ===\n', colors.blue);

  // Check environment variables
  log('Checking environment variables...', colors.yellow);
  const hasProjectId = checkEnvVar('FIREBASE_PROJECT_ID');
  const hasClientEmail = checkEnvVar('FIREBASE_CLIENT_EMAIL');
  const hasPrivateKey = checkEnvVar('FIREBASE_PRIVATE_KEY');

  if (!hasProjectId || !hasClientEmail || !hasPrivateKey) {
    log('\n✗ Missing required environment variables', colors.red);
    log('Please configure your .env file with Firebase credentials', colors.yellow);
    process.exit(1);
  }

  log('\n✓ All environment variables are set\n', colors.green);

  // Initialize Firebase
  log('Initializing Firebase Admin SDK...', colors.yellow);
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });

    log('✓ Firebase Admin SDK initialized successfully\n', colors.green);
  } catch (error) {
    log('✗ Failed to initialize Firebase Admin SDK', colors.red);
    log(`Error: ${error.message}`, colors.red);
    process.exit(1);
  }

  // Test Firestore connection
  log('Testing Firestore connection...', colors.yellow);
  try {
    const db = admin.firestore();
    const testDoc = await db.collection('_test').doc('connection').set({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      message: 'Connection test',
    });
    
    await db.collection('_test').doc('connection').delete();
    
    log('✓ Firestore connection successful\n', colors.green);
  } catch (error) {
    log('✗ Firestore connection failed', colors.red);
    log(`Error: ${error.message}`, colors.red);
    log('\nMake sure Cloud Firestore is enabled in your Firebase project', colors.yellow);
    process.exit(1);
  }

  // Test Firebase Auth
  log('Testing Firebase Authentication...', colors.yellow);
  try {
    const auth = admin.auth();
    // Just verify we can access the auth instance
    log('✓ Firebase Authentication accessible\n', colors.green);
  } catch (error) {
    log('✗ Firebase Authentication check failed', colors.red);
    log(`Error: ${error.message}`, colors.red);
    process.exit(1);
  }

  // Summary
  log('=== Setup Verification Complete ===\n', colors.blue);
  log('✓ All checks passed!', colors.green);
  log('✓ Firebase project is properly configured', colors.green);
  log('✓ Backend is ready to run\n', colors.green);
  log('Next steps:', colors.yellow);
  log('  1. Run "npm run dev" to start the development server', colors.reset);
  log('  2. Test the health endpoint: http://localhost:3000/api/health', colors.reset);
  log('  3. Continue with Task 2: Implement backend authentication system\n', colors.reset);

  process.exit(0);
}

// Run verification
verifySetup().catch((error) => {
  log('\n✗ Verification failed with unexpected error', colors.red);
  log(`Error: ${error.message}`, colors.red);
  console.error(error);
  process.exit(1);
});
