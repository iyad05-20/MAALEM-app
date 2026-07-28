import React from 'react';
import { motion } from 'framer-motion';
import type { View } from '../../types';

// Same SVG data (simplified for brevity here, assuming it's imported or defined above)
const NAV_ITEMS = [
  {
    index: 0, label: 'Accueil', view: 'home',
    outlineIcon: <svg viewBox="0 0 24 24"><path d="M12 5.69l5 4.5V18h-2v-6H9v6H7v-7.81l5-4.5M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z"/></svg>,
    filledIcon: <svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>,
  },
  {
    index: 1, label: 'Recherche', view: 'search',
    outlineIcon: <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>,
    filledIcon: <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5z"/></svg>,
  },
  {
    index: 2, label: 'Atelier', view: 'atelier',
    outlineIcon: (
      <svg style={{ color: '#4DA3FF' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3 L14.2 7.8 L19 10 L14.2 12.2 L12 17 L9.8 12.2 L5 10 L9.8 7.8 Z"/>
          <path d="M12 8.8 L15 12 L12 15.2 L9 12 Z"/>
      </svg>
    ),
    filledIcon: (
      <svg style={{ color: '#4DA3FF' }} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3 L14.2 7.8 L19 10 L14.2 12.2 L12 17 L9.8 12.2 L5 10 L9.8 7.8 Z"/>
          <path d="M12 8.8 L15 12 L12 15.2 L9 12 Z" fill="white"/>
      </svg>
    ),
  },
  {
    index: 3, label: 'Favoris', view: 'favorites',
    outlineIcon: <svg viewBox="0 0 24 24"><path d="M12.1 18.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05zM16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3z"/></svg>,
    filledIcon: <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>,
  },
  {
    index: 4, label: 'Profil', view: 'profile',
    outlineIcon: <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0-6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 7c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4zm6 5H6v-.99c.2-.72 3.3-2.01 6-2.01s5.8 1.29 6 2v1z"/></svg>,
    filledIcon: <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>,
  },
];

interface BottomNavProps {
  activeView: View;
  onNavigate: (view: View) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeView, onNavigate }) => {

  return (
    <div className="nav-bar-container">
      <nav className="floating-nav" style={{ justifyContent: 'space-between' }}>
        
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.view;
          const isAtelier = item.view === 'atelier';

          if (isAtelier) {
            return (
              <motion.button
                layout
                key={item.index}
                onClick={() => onNavigate(item.view as View)}
                whileTap={{ scale: 0.92 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  background: isActive 
                    ? 'linear-gradient(180deg, rgba(77,163,255,.16), rgba(77,163,255,.08))' 
                    : 'transparent',
                  padding: '8px 16px', // Constante pour garder les icônes centralisées
                  borderRadius: '999px',
                  border: 'none',
                  cursor: 'pointer',
                  zIndex: 10,
                  margin: '0 4px',
                  flex: '0 0 auto',
                  transition: 'background 0.3s ease'
                }}
              >
                <motion.div 
                  layout
                  animate={isActive ? { rotate: [0, -20, 0] } : { rotate: 0 }}
                  transition={{ duration: 0.4 }}
                  style={{ 
                    width: '24px', 
                    height: '24px', 
                    color: isActive ? '#4DA3FF' : '#8E8E93' 
                  }}
                >
                  {isActive ? item.filledIcon : item.outlineIcon}
                </motion.div>
                
                <motion.span
                  layout
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: isActive ? '#4DA3FF' : '#8E8E93',
                    whiteSpace: 'nowrap',
                    transition: 'color 0.3s ease'
                  }}
                >
                  Atelier
                </motion.span>
              </motion.button>
            );
          }

          // Standard items — always render the pill div, animate opacity only
          return (
            <motion.button
              layout
              key={item.index}
              onClick={() => onNavigate(item.view as View)}
              whileTap={{ scale: 0.85 }}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: isActive ? '#111' : '#8E8E93',
                position: 'relative',
                zIndex: 10,
                transition: 'color 0.25s ease',
              }}
            >
              {/* Always-present pill — slides via layoutId, fades via opacity */}
              <motion.div
                layoutId="active-nav-bg"
                animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0.8 }}
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '52px',
                  height: '52px',
                  backgroundColor: 'rgba(0,0,0,0.06)',
                  borderRadius: '26px',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 0,
                  pointerEvents: 'none',
                }}
              />
              <div style={{ width: '22px', height: '22px', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isActive ? item.filledIcon : item.outlineIcon}
              </div>
              <span style={{ fontSize: '10px', fontWeight: 500, zIndex: 1 }}>
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </nav>
    </div>
  );
};
