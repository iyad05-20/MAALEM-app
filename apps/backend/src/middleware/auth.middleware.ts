import { Request, Response, NextFunction } from 'express';
import { getAuth, getFirestore } from '../services/firebase.service.js';

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email: string;
    isClient: boolean;
    isArtisan: boolean;
    profile: any;
  };
}

/**
 * Main auth middleware — verifies Firebase ID token and resolves user roles from Firestore.
 * Auto-creates users/{uid} profile on first Google login.
 */
export async function verifyFirebaseToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing or malformed authorization token',
      });
    }

    const token = authHeader.split('Bearer ')[1];
    const authService = getAuth();

    if (!authService) {
      return res.status(503).json({
        success: false,
        error: 'Firebase Auth not initialized',
      });
    }

    // 1. Verify Firebase ID token
    const decodedToken = await authService.verifyIdToken(token);
    const { uid, email, name, picture } = decodedToken;

    // 2. Check both collections in parallel
    const db = getFirestore();
    if (!db) {
      return res.status(503).json({
        success: false,
        error: 'Firestore not initialized',
      });
    }

    const [userDoc, artisanDoc] = await Promise.all([
      db.collection('users').doc(uid).get(),
      db.collection('artisans').doc(uid).get(),
    ]);

    const isClient = userDoc.exists;
    const isArtisan = artisanDoc.exists;

    let profile: any = null;

    if (isArtisan) {
      profile = { id: uid, ...artisanDoc.data() };
    } else if (isClient) {
      profile = { id: uid, ...userDoc.data() };
    } else {
      // First login — auto-create client profile with Google data
      const newProfile = {
        id: uid,
        uid: uid,
        name: name || decodedToken.name || email?.split('@')[0] || 'Utilisateur',
        email: email || '',
        avatar: picture || '',
        role: 'user',
        profileComplete: false,
        phone: null,
        favorites: [],
        createdAt: new Date().toISOString(),
      };
      await db.collection('users').doc(uid).set(newProfile);
      profile = newProfile;
      console.log(`✅ Auto-created user profile for ${email} (first Google login)`);
    }

    // 3. Attach user info to request
    req.user = {
      uid,
      email: email || '',
      isClient: isClient || (!isClient && !isArtisan), // new users default to client
      isArtisan,
      profile,
    };

    next();
  } catch (error: any) {
    console.error('Auth middleware error:', error.message);

    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        error: 'Token expired — please refresh',
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }
}

/**
 * Require artisan role
 */
export function requireArtisan(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user?.isArtisan) {
    return res.status(403).json({
      success: false,
      error: 'Only artisans can access this resource',
    });
  }
  next();
}

/**
 * Require client role
 */
export function requireClient(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user?.isClient) {
    return res.status(403).json({
      success: false,
      error: 'Only clients can access this resource',
    });
  }
  next();
}
