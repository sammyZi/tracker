import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Initialize Firebase Admin SDK
 * Uses environment variables for configuration
 */
export const initializeFirebase = (): admin.app.App => {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing Firebase configuration. Please check your environment variables.'
    );
  }

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
};

/**
 * Get Firestore database instance
 */
export const getFirestore = (): admin.firestore.Firestore => {
  return admin.firestore();
};

/**
 * Get Firebase Auth instance
 */
export const getAuth = (): admin.auth.Auth => {
  return admin.auth();
};

export default admin;
