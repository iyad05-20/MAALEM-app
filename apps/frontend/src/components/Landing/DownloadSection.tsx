import AppIcon from './AppIcon';
import { usePWA } from '../../context/PWAContext';

type Language = 'en' | 'fr' | 'ar';

interface DownloadSectionProps {
  lang: Language;
}

const content: Record<
  Language,
  {
    heading: string;
    sub: string;
    ctaInstall: string;
    ctaOpen: string;
    ctaExplore: string;
    feat1: string;
    feat2: string;
    feat3: string;
  }
> = {
  en: {
    heading: 'Ready to transform\nyour home?',
    sub: 'Install the Vork PWA today. No storage space required, works instantly on all your devices.',
    ctaInstall: 'Install Now',
    ctaOpen: 'Open App',
    ctaExplore: 'Explore Services',
    feat1: 'Safe & Secure',
    feat2: 'Verified Experts',
    feat3: '24/7 Support',
  },
  fr: {
    heading: 'Prêt à transformer\nvotre maison ?',
    sub: "Installez l'app Vork dès aujourd'hui. Aucun espace requis, fonctionne instantanément sur tous vos appareils.",
    ctaInstall: 'Installer maintenant',
    ctaOpen: "Ouvrir l'app",
    ctaExplore: 'Explorer les services',
    feat1: 'Sûr & Sécurisé',
    feat2: 'Experts Vérifiés',
    feat3: 'Support 24/7',
  },
  ar: {
    heading: 'جاهز لتحويل\nمنزلك؟',
    sub: 'قم بتثبيت تطبيق Vork اليوم. لا يتطلب مساحة تخزين، يعمل فوراً على جميع أجهزتك.',
    ctaInstall: 'ثبت الآن',
    ctaOpen: 'افتح التطبيق',
    ctaExplore: 'استكشف الخدمات',
    feat1: 'آمن ومضمون',
    feat2: 'خبراء معتمدون',
    feat3: 'دعم 24/7',
  },
};

export default function DownloadSection({ lang }: DownloadSectionProps) {
  const { installPWA, showInstallButton, isStandalone } = usePWA();
  const t = content[lang];
  const isRtl = lang === 'ar';

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

  return (
    <section className="py-24 px-6 bg-[#F4F9FF] overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-5xl mx-auto">
        <div className="relative bg-[#2E9BDA] rounded-[40px] p-8 md:p-16 overflow-hidden shadow-2xl">
          {/* Abstract background shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#E87B35]/20 rounded-full blur-3xl -ml-32 -mb-32" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-start">
              <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-6 whitespace-pre-line">
                {t.heading}
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-lg">
                {t.sub}
              </p>

              <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-8">
                {[t.feat1, t.feat2, t.feat3].map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-white/90 font-medium text-sm">
                    <AppIcon name="ShieldCheck" size={18} className="text-[#E87B35]" />
                    {feat}
                  </div>
                ))}
              </div>

              <button
                onClick={handleInstallClick}
                className="inline-flex items-center justify-center gap-3 h-14 px-10 bg-white text-[#2E9BDA] font-black rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all duration-300 uppercase tracking-wider text-sm"
              >
                <AppIcon name={isStandalone ? "ArrowRight" : "ArrowDownTrayIcon"} size={20} />
                {getButtonText()}
              </button>
            </div>

            {/* QR/App Visual Mockup (Simple) */}
            <div className="w-full md:w-1/3 flex justify-center">
              <div className="relative w-48 h-48 bg-white rounded-[32px] p-4 shadow-2xl flex items-center justify-center group rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="w-full h-full border-4 border-[#2E9BDA]/10 rounded-2xl flex items-center justify-center overflow-hidden">
                  <img src="/icons/icon-192x192.png" alt="Vork QR" className="w-24 h-24 opacity-80 group-hover:scale-110 transition-transform duration-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
