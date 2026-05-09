import { Router, Response } from 'express';
import { verifyFirebaseToken, AuthRequest } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * GET /api/auth/me
 * Returns the authenticated user's full profile + roles.
 * Protected by Firebase token verification.
 */
router.get('/me', verifyFirebaseToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    res.json({
      success: true,
      data: {
        uid: req.user.uid,
        email: req.user.email,
        isClient: req.user.isClient,
        isArtisan: req.user.isArtisan,
        profile: req.user.profile,
      },
    });
  } catch (error: any) {
    console.error('Error in /auth/me:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/logout
 * Optional server-side cleanup on logout.
 */
router.post('/logout', verifyFirebaseToken, async (req: AuthRequest, res: Response) => {
  try {
    // Server-side cleanup if needed (e.g., clear sessions, revoke tokens)
    console.log(`User ${req.user?.uid} logged out`);
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, error: 'Logout failed' });
  }
});

export default router;
