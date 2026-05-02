import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

let firebaseApp: admin.app.App;

export function initializeFirebase() {
  if (firebaseApp) return firebaseApp;

  try {
    const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT || '{}';
    const serviceAccount = JSON.parse(serviceAccountStr);

    // Skip Firebase if credentials are empty (development without Firebase)
    if (!serviceAccount.project_id) {
      console.log('⚠️  Firebase credentials not configured. Skipping initialization.');
      console.log('   Set FIREBASE_SERVICE_ACCOUNT env var to enable Firebase.');
      return null as any;
    }

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });

    console.log('✅ Firebase Admin SDK initialized');
    return firebaseApp;
  } catch (error: any) {
    console.log('⚠️  Firebase initialization skipped:', error.message);
    console.log('   Backend will work without Firebase until credentials are configured.');
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
