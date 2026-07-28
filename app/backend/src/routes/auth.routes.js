import express from 'express';
import { signUpUser, signInUser, signOutUser, getUserFromToken } from '../services/auth.service.js';

const router = express.Router();

// Helper middleware / extraction de Bearer Token
function getBearerToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  return null;
}

// ── POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { email, password, fullName } = req.body;
  try {
    const result = await signUpUser(email, password, fullName);
    console.log(`[AUTH-ROUTE] 👤 New user registered: ${email}`);
    res.status(201).json({
      success: true,
      message: 'Inscription réussie !',
      user: result.user,
      session: result.session
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message || 'Erreur lors de l\'inscription.'
    });
  }
});

// ── POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await signInUser(email, password);
    console.log(`[AUTH-ROUTE] 🔑 User logged in: ${email}`);
    res.json({
      success: true,
      message: 'Connexion réussie !',
      user: result.user,
      profile: result.profile,
      session: result.session
    });
  } catch (err) {
    res.status(401).json({
      success: false,
      error: err.message || 'Identifiants incorrects.'
    });
  }
});

// ── POST /api/auth/logout
router.post('/logout', async (req, res) => {
  const token = getBearerToken(req);
  try {
    await signOutUser(token);
    console.log(`[AUTH-ROUTE] 🚪 User logged out`);
    res.json({
      success: true,
      message: 'Déconnexion réussie !'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// ── GET /api/auth/me
router.get('/me', async (req, res) => {
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Non authentifié (jeton absent).'
    });
  }

  try {
    const userData = await getUserFromToken(token);
    if (!userData) {
      return res.status(401).json({
        success: false,
        error: 'Jeton invalide ou expiré.'
      });
    }

    res.json({
      success: true,
      user: userData.user,
      profile: userData.profile
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

export default router;
