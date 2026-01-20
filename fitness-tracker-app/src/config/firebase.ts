import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDfTA_wwEwP_92BEEtgy99ZU4ckMt2FRk0",
  authDomain: "gig-app-e83ce.firebaseapp.com",
  projectId: "gig-app-e83ce",
  storageBucket: "gig-app-e83ce.firebasestorage.app",
  messagingSenderId: "606855101923",
  appId: "1:606855101923:web:3d9a36ed65a02ce82c34d6",
  measurementId: "G-6HHFB9CWL6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Analytics is optional and may not work in React Native
// Only initialize if running in a web environment
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
