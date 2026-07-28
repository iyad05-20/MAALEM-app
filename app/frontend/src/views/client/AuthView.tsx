import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { authService, type UserProfile } from '../../services/authService';

interface AuthViewProps {
  onAuthSuccess: (user: UserProfile) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await authService.login(email, password);
        if (res.success && res.user) {
          onAuthSuccess(res.user);
        } else {
          setErrorMsg(res.error || 'Identifiants incorrects.');
        }
      } else {
        const res = await authService.signup(email, password, fullName);
        if (res.success && res.user) {
          onAuthSuccess(res.user);
        } else if (res.success) {
          setSuccessMsg('Compte créé avec succès ! Connectez-vous.');
          setMode('login');
        } else {
          setErrorMsg(res.error || 'Erreur lors de l\'inscription.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Une erreur réseau est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="app-view auth-container-view"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 20px',
        minHeight: '100%',
        position: 'relative',
        zIndex: 10
      }}
    >
      {/* Background Zellige Pattern Overlay */}
      <div className="search-zellige-pattern" style={{ opacity: 0.05 }} />

      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <h1 className="brand-logo" style={{ fontSize: '2.5rem', letterSpacing: '0.15em', marginBottom: 6 }}>
          MAALEM
        </h1>
        <p className="section-subtitle" style={{ fontSize: '0.88rem', letterSpacing: '0.05em', color: '#666' }}>
          L'Artisanat Marocain d'Exception
        </p>
      </div>

      {/* Glassmorphism Auth Card */}
      <div
        className="search-panel"
        style={{
          width: '100%',
          maxWidth: 380,
          padding: '28px 24px',
          background: 'rgba(252, 251, 249, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: 28,
          border: '1px solid rgba(196, 169, 106, 0.25)',
          boxShadow: '0 20px 40px rgba(26, 42, 58, 0.08)'
        }}
      >
        {/* Mode Switcher Tabs */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(235, 230, 220, 0.5)',
            borderRadius: 16,
            padding: 4,
            marginBottom: 24,
            position: 'relative'
          }}
        >
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(null); }}
            style={{
              flex: 1,
              padding: '10px 0',
              border: 'none',
              background: mode === 'login' ? '#FCFBF9' : 'transparent',
              borderRadius: 12,
              fontWeight: mode === 'login' ? 600 : 400,
              color: mode === 'login' ? '#1A2A3A' : '#666',
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: mode === 'login' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            Se connecter
          </button>

          <button
            type="button"
            onClick={() => { setMode('signup'); setErrorMsg(null); }}
            style={{
              flex: 1,
              padding: '10px 0',
              border: 'none',
              background: mode === 'signup' ? '#FCFBF9' : 'transparent',
              borderRadius: 12,
              fontWeight: mode === 'signup' ? 600 : 400,
              color: mode === 'signup' ? '#1A2A3A' : '#666',
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: mode === 'signup' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            Créer un compte
          </button>
        </div>

        {/* Error / Success Alert Messages */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              style={{
                background: 'rgba(220, 53, 69, 0.08)',
                border: '1px solid rgba(220, 53, 69, 0.2)',
                color: '#b02a37',
                padding: '10px 14px',
                borderRadius: 12,
                fontSize: '0.84rem',
                marginBottom: 18,
                textAlign: 'center'
              }}
            >
              ⚠️ {errorMsg}
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              style={{
                background: 'rgba(40, 167, 69, 0.08)',
                border: '1px solid rgba(40, 167, 69, 0.25)',
                color: '#155724',
                padding: '10px 14px',
                borderRadius: 12,
                fontSize: '0.84rem',
                marginBottom: 18,
                textAlign: 'center'
              }}
            >
              ✅ {successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {mode === 'signup' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 6, color: '#4A5568' }}>
                Nom complet
              </label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Ex: Youssef Alami"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 14,
                  border: '1px solid rgba(196, 169, 106, 0.3)',
                  background: '#FFF',
                  fontSize: '0.92rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 6, color: '#4A5568' }}>
              Adresse Email *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="votre.email@exemple.ma"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 14,
                border: '1px solid rgba(196, 169, 106, 0.3)',
                background: '#FFF',
                fontSize: '0.92rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 6, color: '#4A5568' }}>
              Mot de passe *
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 14,
                border: '1px solid rgba(196, 169, 106, 0.3)',
                background: '#FFF',
                fontSize: '0.92rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8,
              width: '100%',
              padding: '14px',
              borderRadius: 16,
              border: 'none',
              background: 'linear-gradient(135deg, #1A2A3A 0%, #2A3A4A 100%)',
              color: '#FFF',
              fontWeight: 600,
              fontSize: '0.95rem',
              letterSpacing: '0.04em',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 8px 16px rgba(26, 42, 58, 0.2)',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
          </button>
        </form>
      </div>

      <p style={{ marginTop: 24, fontSize: '0.78rem', color: '#888', textAlign: 'center' }}>
        MAALEM © 2026 — Plateforme d'artisanat marocain d'art
      </p>
    </motion.div>
  );
};
