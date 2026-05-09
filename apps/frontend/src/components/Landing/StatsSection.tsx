import React, { useEffect, useRef, useState } from 'react';

type Language = 'en' | 'fr' | 'ar';

interface StatsSectionProps {
  lang: Language;
}

const statsContent: Record<
  Language,
  {
    label: string;
    heading: string;
    stats: { value: string; suffix: string; desc: string; icon: string }[];
  }
> = {
  en: {
    label: 'Trusted by Thousands',
    heading: 'The Numbers Speak',
    stats: [
      { value: '1200', suffix: '+', desc: 'Verified Craftsmen', icon: 'Users' },
      { value: '15000', suffix: '+', desc: 'Jobs Completed', icon: 'ShieldCheck' },
      { value: '12', suffix: '', desc: 'Cities Covered', icon: 'MapPin' },
      { value: '4.8', suffix: '★', desc: 'Average App Rating', icon: 'Star' },
    ],
  },
  fr: {
    label: 'Approuvé par des Milliers',
    heading: 'Les Chiffres Parlent',
    stats: [
      { value: '1200', suffix: '+', desc: 'Artisans Vérifiés', icon: 'Users' },
      { value: '15000', suffix: '+', desc: 'Missions Réalisées', icon: 'ShieldCheck' },
      { value: '12', suffix: '', desc: 'Villes Couvertes', icon: 'MapPin' },
      { value: '4.8', suffix: '★', desc: 'Note Moyenne App', icon: 'Star' },
    ],
  },
  ar: {
    label: 'موثوق من الآلاف',
    heading: 'الأرقام تتحدث',
    stats: [
      { value: '1200', suffix: '+', desc: 'حرفي موثوق', icon: 'Users' },
      { value: '15000', suffix: '+', desc: 'مهمة منجزة', icon: 'ShieldCheck' },
      { value: '12', suffix: '', desc: 'مدينة مغطاة', icon: 'MapPin' },
      { value: '4.8', suffix: '★', desc: 'متوسط تقييم التطبيق', icon: 'Star' },
    ],
  },
};

function AnimatedNumber({ target, suffix }: { target: string; suffix: string }) {
  const [display, setDisplay] = useState('0');
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const numericTarget = parseFloat(target.replace(/[^\d.]/g, ''));
    if (isNaN(numericTarget)) {
      setDisplay(target);
      return;
    }
    const duration = 1800;
    const start = performance.now();
    const isDecimal = target.includes('.');

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = numericTarget * eased;
      setDisplay(isDecimal ? current.toFixed(1) : Math.floor(current).toLocaleString());
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, target]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

export default function StatsSection({ lang }: StatsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const _t = statsContent[lang];
  const _isRtl = lang === 'ar';

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { threshold: 0.1 }
    );
    const reveals = sectionRef.current?.querySelectorAll('.reveal');
    reveals?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="stats"
      ref={sectionRef}
      className="relative py-24 px-6 bg-[#0B1D2D] overflow-hidden"
      dir={_isRtl ? 'rtl' : 'ltr'}
    >
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#2E9BDA] rounded-full blur-[120px] opacity-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#2E9BDA] rounded-full blur-[120px] opacity-10 translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 reveal">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            {_t.heading}
          </h2>
          <p className="text-white/60 text-lg">
            {_t.label}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 reveal reveal-delay-1">
          {_t.stats.map((stat, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center justify-center p-8 rounded-[32px] bg-white/[0.03] border border-white/[0.05] backdrop-blur-sm hover:bg-white/[0.05] transition-colors duration-300"
            >
              <div className="text-4xl md:text-5xl font-black text-[#2E9BDA] mb-3 flex items-center gap-1 drop-shadow-[0_0_15px_rgba(46,155,218,0.3)]">
                <AnimatedNumber target={stat.value} suffix={stat.suffix} />
              </div>
              <p className="text-white/80 font-medium text-center text-sm md:text-base">
                {stat.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
