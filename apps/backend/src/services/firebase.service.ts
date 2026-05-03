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
    // Load service account from JSON file (best practice — never store in .env)
    const serviceAccountPath = join(__dirname, '..', '..', 'serviceAccount.json');
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });

    console.log('✅ Firebase Admin SDK initialized (from serviceAccount.json)');
    return firebaseApp;
  } catch (error: any) {
    // Fallback: try FIREBASE_SERVICE_ACCOUNT env var (for Docker/CI)
    try {
      const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT || '{}';
      const serviceAccount = JSON.parse(serviceAccountStr);

      if (!serviceAccount.project_id) {
        console.log('⚠️  Firebase credentials not configured. Skipping initialization.');
        console.log('   Place serviceAccount.json in apps/backend/ or set FIREBASE_SERVICE_ACCOUNT env var.');
        return null as any;
      }

      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
      });

      console.log('✅ Firebase Admin SDK initialized (from env var)');
      return firebaseApp;
    } catch (envError: any) {
      console.log('⚠️  Firebase initialization skipped:', error.message);
      console.log('   Backend will work without Firebase until credentials are configured.');
      return null as any;
    }
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
