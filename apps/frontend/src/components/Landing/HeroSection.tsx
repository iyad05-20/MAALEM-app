import React, { useEffect, useRef } from 'react';
import { usePWA } from '../../context/PWAContext';

type Language = 'en' | 'fr' | 'ar';

interface HeroSectionProps {
  lang: Language;
}

const heroContent: Record<
  Language,
  {
    badge: string;
    headline: string;
    sub: string;
    ctaInstall: string;
    ctaOpen: string;
    ctaExplore: string;
    note: string;
    card1: string;
    card2: string;
    card3: string;
    card4: string;
  }
> = {
  fr: {
    badge: '🇲🇦 Disponible à Marrakech',
    headline: 'Tous vos besoins,\nune seule app.',
    sub: 'Artisans vérifiés, intervention rapide, paiement sécurisé.',
    ctaInstall: "Installer l'app",
    ctaOpen: "Ouvrir l'app",
    ctaExplore: "Voir les services",
    note: 'Gratuit · Pas de store · Fonctionne comme une vraie app',
    card1: '🔧 Plombier · ⭐ 4.9 · Disponible',
    card2: '⚡ Électricien · ⭐ 5.0 · En route',
    card3: '🔷 Zellij · ⭐ 4.8 · Nouveau',
    card4: '🌿 Jardinage · ⭐ 4.7 · Disponible',
  },
  en: {
    badge: '🇲🇦 Available in Marrakech',
    headline: 'All your needs,\none single app.',
    sub: 'Verified craftsmen, fast intervention, secure payment.',
    ctaInstall: 'Install the app',
    ctaOpen: 'Open the app',
    ctaExplore: 'Explore services',
    note: 'Free · No store needed · Works like a real app',
    card1: '🔧 Plumber · ⭐ 4.9 · Available',
    card2: '⚡ Electrician · ⭐ 5.0 · On the way',
    card3: '🔷 Tiling · ⭐ 4.8 · New',
    card4: '🌿 Gardening · ⭐ 4.7 · Available',
  },
  ar: {
    badge: '🇲🇦 متوفر في مراكش',
    headline: 'كل احتياجاتك،\nفي تطبيق واحد.',
    sub: 'حرفيون معتمدون، تدخل سريع، ودفع آمن.',
    ctaInstall: 'تثبيت التطبيق',
    ctaOpen: 'افتح التطبيق',
    ctaExplore: 'استكشف الخدمات',
    note: 'مجاني · بدون متجر · يعمل كتطبيق حقيقي',
    card1: '🔧 سباك · ⭐ 4.9 · متوفر',
    card2: '⚡ كهربائي · ⭐ 5.0 · في الطريق',
    card3: '🔷 زليج · ⭐ 4.8 · جديد',
    card4: '🌿 بستنة · ⭐ 4.7 · متوفر',
  },
};

export default function HeroSection({ lang }: HeroSectionProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const { installPWA, showInstallButton, isStandalone } = usePWA();
  const t = heroContent[lang];

  const handleInstallClick = async () => {
    if (isStandalone) {
      document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    await installPWA();
  };

  const getButtonText = () => {
    if (isStandalone) return (t as any).ctaExplore;
    if (showInstallButton) return (t as any).ctaInstall;
    return (t as any).ctaOpen;
  };

  // Magnetic hover effect for CTA button
  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 768) return;
      const rect = btn.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.15;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.15;
      btn.style.transform = `translate(${x}px, ${y}px)`;
    };

    const handleMouseLeave = () => {
      btn.style.transform = 'translate(0,0)';
    };

    btn.addEventListener('mousemove', handleMouseMove);
    btn.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      btn.removeEventListener('mousemove', handleMouseMove);
      btn.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <section 
      className="relative min-h-screen pt-24 pb-20 md:pt-32 md:pb-24 overflow-hidden bg-[#F4F9FF]"
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto px-6 h-full flex flex-col md:flex-row items-center gap-12 md:gap-8">
        
        <div className="w-full md:w-[55%] flex flex-col items-center md:items-start text-center md:text-start z-10 animate-slide-right">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-[#2E9BDA]/10 text-[#2E9BDA] rounded-full text-sm font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#2E9BDA] animate-pulse" />
            {t.badge}
          </div>

          <h1 className="text-4xl md:text-[52px] font-bold text-[#0B1D2D] leading-tight mb-6">
            {t.headline.split('\n').map((line, i, arr) => (
              <React.Fragment key={i}>
                {i === arr.length - 1 ? (
                  <span className="text-[#E87B35]">{line}</span>
                ) : (
                  line
                )}
                {i < arr.length - 1 && <br />}
              </React.Fragment>
            ))}
          </h1>

          <p className="text-base md:text-lg text-[#474556] max-w-lg mb-8">
            {t.sub}
          </p>

          <div className="flex flex-col items-center md:items-start w-full">
            <button
              ref={btnRef}
              onClick={handleInstallClick}
              className="inline-flex items-center justify-center h-12 px-8 bg-[#E87B35] text-white font-bold rounded-xl shadow-lg transition-transform duration-200 ease-out hover:shadow-xl w-full sm:w-auto active:scale-95"
            >
              {getButtonText()}
            </button>
            
            <p className="mt-4 text-[13px] text-[#474556]/80 font-medium">
              {t.note}
            </p>
          </div>
        </div>

        <div className="w-full md:w-[45%] relative flex justify-center mt-12 md:mt-0" dir="ltr">
          <div className="relative w-[280px] md:w-[340px] z-10 animate-scale-up" style={{ animationDelay: '0.2s' }}>
            <img 
              alt="Vork App Interface" 
              className="w-full h-auto rounded-[40px] shadow-2xl border-8 border-[#0B1D2D] relative z-0 transform -rotate-2 hover:rotate-0 transition-transform duration-500" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDm0lmVcXn2ZK_ibNSp0ApmmmD42VZc92NyEu_iG0_Bl4Anj1MfTPfF8g4ioCvaXE84HRlXnOoYpegSDc8u3lc9HMeqbHYz56DnQcwi22_YNS6wNmbbwKV8i1PcZGvnkKnSe3mUhm8QJnj4_SNtxMO7Vdz6g3mNskpYIE9SXgQn0wxhk24vYk5lSPfdRFvQWubng85bQUpqY1a--v4jb74qTI5jI-8-CfaJDRWaluMn1frzFBgr3_nFUVGpp2DMsghCcDOeLYIbDys"
            />
          </div>

          <div className="absolute inset-0 z-20 pointer-events-none flex justify-center items-center">
            <div className="absolute top-[5%] md:top-[10%] left-[-5%] md:left-[-15%] bg-white rounded-xl shadow-[0_8px_24px_rgba(11,29,45,0.08)] px-[14px] py-[10px] text-[13px] text-[#0B1D2D] font-medium whitespace-nowrap animate-fade-in-card animate-float float-delay-0" style={{ animationDelay: '0.1s' }} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              {t.card1}
            </div>
            <div className="absolute top-[25%] md:top-[30%] right-[-5%] md:right-[-20%] bg-white rounded-xl shadow-[0_8px_24px_rgba(11,29,45,0.08)] px-[14px] py-[10px] text-[13px] text-[#0B1D2D] font-medium whitespace-nowrap animate-fade-in-card animate-float float-delay-1" style={{ animationDelay: '0.2s' }} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              {t.card2}
            </div>
            <div className="hidden md:block absolute bottom-[35%] left-[-20%] bg-white rounded-xl shadow-[0_8px_24px_rgba(11,29,45,0.08)] px-[14px] py-[10px] text-[13px] text-[#0B1D2D] font-medium whitespace-nowrap animate-fade-in-card animate-float float-delay-2" style={{ animationDelay: '0.3s' }} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              {t.card3}
            </div>
            <div className="hidden md:block absolute bottom-[15%] right-[-15%] bg-white rounded-xl shadow-[0_8px_24px_rgba(11,29,45,0.08)] px-[14px] py-[10px] text-[13px] text-[#0B1D2D] font-medium whitespace-nowrap animate-fade-in-card animate-float float-delay-3" style={{ animationDelay: '0.4s' }} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              {t.card4}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
