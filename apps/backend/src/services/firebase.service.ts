import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let firebaseApp: admin.app.App;

export function initializeFirebase() {
  if (firebaseApp) return firebaseApp;

  try {
    // 1. Try loading from environment variable (Best for Production/Cloud)
    const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (serviceAccountStr) {
      const serviceAccount = JSON.parse(serviceAccountStr);
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });
      console.log('✅ Firebase Admin SDK initialized (from env var)');
      return firebaseApp;
    }

    // 2. Fallback to local file (for local development)
    const serviceAccountPath = join(__dirname, '..', '..', 'serviceAccount.json');
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });

    console.log('✅ Firebase Admin SDK initialized (from local serviceAccount.json)');
    return firebaseApp;
  } catch (error: any) {
    console.log('⚠️  Firebase initialization skipped or failed:', error.message);
    console.log('   Ensure FIREBASE_SERVICE_ACCOUNT env var is set or serviceAccount.json exists.');
    return null as any;
  }
}

export function getFirebaseApp() {
  if (!firebaseApp) {
    console.warn('Firebase not initialized.');
  }
  return firebaseApp;
}

export const getFirestore = () => {
  if (!firebaseApp) return null;
  return admin.firestore();
};

export const getAuth = (): admin.auth.Auth | null => {
  if (!firebaseApp) return null;
  return admin.auth();
};

export const getRealtimeDb = (): admin.database.Database | null => {
  if (!firebaseApp) return null;
  return admin.database();
};
