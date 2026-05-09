import React, { createContext, useContext, useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAContextType {
  deferredPrompt: BeforeInstallPromptEvent | null;
  showInstallButton: boolean;
  isStandalone: boolean;
  installPWA: () => Promise<void>;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export const PWAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
      return isStandaloneMode;
    };

    const isCurrentlyStandalone = checkStandalone();

    // Recover deferredPrompt if captured before React hydration
    if ((window as any).deferredPrompt && !isCurrentlyStandalone) {
      setDeferredPrompt((window as any).deferredPrompt);
      setShowInstallButton(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      (window as any).deferredPrompt = e;
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Only show install button if not already in standalone
      if (!window.matchMedia('(display-mode: standalone)').matches) {
        setShowInstallButton(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const installPWA = async () => {
    if (isStandalone) {
      window.location.href = '/?mode=pwa';
      return;
    }

    if (!deferredPrompt) {
      // If not standalone and no prompt, we try to "deep link" into the app flow
      window.location.href = '/?mode=pwa';
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallButton(false);
        (window as any).deferredPrompt = undefined;
        window.location.href = '/?app';
      }
    } catch (err) {
      console.error('PWA: Installation error:', err);
    }
  };

  return (
    <PWAContext.Provider value={{ deferredPrompt, showInstallButton, isStandalone, installPWA }}>
      {children}
    </PWAContext.Provider>
  );
};

export const usePWA = () => {
  const context = useContext(PWAContext);
  if (context === undefined) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
};
