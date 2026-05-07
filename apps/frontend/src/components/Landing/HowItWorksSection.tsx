import React, { useEffect, useRef } from 'react';
import AppIcon from './AppIcon';

type Language = 'en' | 'fr' | 'ar';

interface HowItWorksSectionProps {
  lang: Language;
}

const content: Record<
  Language,
  {
    label: string;
    heading: string;
    steps: { num: string; title: string; desc: string; icon: string }[];
  }
> = {
  en: {
    label: 'Simple Process',
    heading: 'Book a Craftsman in 3 Steps',
    steps: [
      { num: '01', title: 'Choose Your Service', desc: 'Browse 9+ service categories and describe what you need.', icon: 'MagnifyingGlassIcon' },
      { num: '02', title: 'Get Matched Instantly', desc: 'Our system connects you with verified craftsmen in under 2 minutes.', icon: 'UserGroupIcon' },
      { num: '03', title: 'Job Done, Guaranteed', desc: 'Your craftsman arrives on time. Pay securely through the app.', icon: 'CheckBadgeIcon' },
    ],
  },
  fr: {
    label: 'Processus Simple',
    heading: 'Réservez un Artisan en 3 Étapes',
    steps: [
      { num: '01', title: 'Choisissez Votre Service', desc: 'Parcourez plus de 9 catégories et décrivez votre besoin.', icon: 'MagnifyingGlassIcon' },
      { num: '02', title: 'Mise en Relation Instantanée', desc: 'Notre système vous connecte avec des artisans vérifiés à proximité.', icon: 'UserGroupIcon' },
      { num: '03', title: 'Travail Fait, Garanti', desc: "Votre artisan arrive à l'heure. Payez en toute sécurité via l'app.", icon: 'CheckBadgeIcon' },
    ],
  },
  ar: {
    label: 'عملية بسيطة',
    heading: 'احجز حرفياً في 3 خطوات',
    steps: [
      { num: '01', title: 'اختر خدمتك', desc: 'تصفح أكثر من 9 فئات خدمات وصف ما تحتاجه.', icon: 'MagnifyingGlassIcon' },
      { num: '02', title: 'مطابقة فورية', desc: 'يربطك نظامنا بحرفيين موثوقين قريبين منك في أقل من دقيقتين.', icon: 'UserGroupIcon' },
      { num: '03', title: 'العمل منجز، مضمون', desc: 'يصل حرفيك في الوقت المحدد. ادفع بأمان عبر التطبيق.', icon: 'CheckBadgeIcon' },
    ],
  },
};

export default function HowItWorksSection({ lang }: HowItWorksSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const t = content[lang];
  const isRtl = lang === 'ar';

  useEffect(() => {
    const reveals = sectionRef.current?.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { threshold: 0.1 }
    );
    reveals?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [lang]);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative py-28 px-6 bg-white overflow-hidden"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-24 reveal">
          <span className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-[#2E9BDA]/10 text-[#2E9BDA] rounded-full text-sm font-semibold">
            {t.label}
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-[#0B1D2D] leading-tight">
            {t.heading}
          </h2>
        </div>

        <div className="relative">
          <div className="hidden md:block absolute top-[48px] left-[15%] right-[15%] h-px border-t-2 border-dashed border-[#2E9BDA]/20 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative z-10">
            {t.steps.map((step, idx) => (
              <div
                key={step.num}
                className={`relative group overflow-hidden bg-white rounded-[32px] p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(46,155,218,0.1)] border border-gray-100 transition-all duration-500 hover:-translate-y-2 reveal reveal-delay-${idx + 1}`}
              >
                <div 
                  className={`absolute -bottom-8 ${isRtl ? '-left-4' : '-right-4'} text-[140px] font-black text-gray-100 group-hover:text-[#2E9BDA]/10 transition-colors duration-500 select-none z-0 leading-none`}
                >
                  {step.num}
                </div>

                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-[#2E9BDA] rounded-2xl opacity-0 group-hover:opacity-20 scale-100 group-hover:scale-150 transition-all duration-700 ease-out" />
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#F4F9FF] to-white shadow-inner flex items-center justify-center border border-[#2E9BDA]/10 relative z-10">
                      <AppIcon
                        name={step.icon}
                        size={40}
                        className="text-[#2E9BDA] transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300"
                      />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-[#0B1D2D] mb-4">
                    {step.title}
                  </h3>
                  <p className="text-[#474556]/90 text-base leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
