import React, { useState } from 'react';
import Navbar from '../components/Landing/Navbar';
import HeroSection from '../components/Landing/HeroSection';
import CategoriesSection from '../components/Landing/CategoriesSection';
import StatsSection from '../components/Landing/StatsSection';
import HowItWorksSection from '../components/Landing/HowItWorksSection';
import DownloadSection from '../components/Landing/DownloadSection';
import Footer from '../components/Landing/Footer';
import InstallPWA from '../components/pwa/InstallPWA';

type Language = 'fr' | 'en' | 'ar';

export const LandingView: React.FC = () => {
    const [lang, setLang] = useState<Language>('fr');

    return (
        <div className="font-landing selection:bg-[#2E9BDA]/20 min-h-screen bg-white">
            {/* New Premium Navbar from Archive */}
            <Navbar currentLang={lang} onLangChange={setLang} />

            {/* Sections with smooth anchor IDs */}
            <main>
                <div id="hero">
                    <HeroSection lang={lang} />
                </div>
                
                <div id="services">
                    <CategoriesSection lang={lang} />
                </div>
                
                <StatsSection lang={lang} />
                
                <div id="how-it-works">
                    <HowItWorksSection lang={lang} />
                </div>
                
                <div id="download">
                    <DownloadSection lang={lang} />
                </div>
            </main>

            <Footer lang={lang} />
        </div>
    );
};

export default LandingView;
