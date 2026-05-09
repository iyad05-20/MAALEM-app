import React, { useEffect, useRef } from 'react';
import { 
  Wrench, 
  Zap, 
  Hammer, 
  Sparkles, 
  Sun, 
  Home, 
  Paintbrush, 
  Wind, 
  LayoutGrid,
  ArrowRight
} from 'lucide-react';

type Language = 'fr' | 'en' | 'ar';

interface CategoriesSectionProps {
  lang: Language;
}

interface ServiceItem {
  iconName: string;
  nameEn: string;
  nameFr: string;
  nameAr: string;
  descEn: string;
  descFr: string;
  descAr: string;
  color: string;
  gradient: string;
  img: string;
}

const services: ServiceItem[] = [
  {
    iconName: 'Wrench',
    nameEn: 'Plumbing',
    nameFr: 'Plomberie',
    nameAr: 'السباكة',
    descEn: 'Pipe repairs, leak fixes, installation & emergency water services.',
    descFr: 'Réparations de tuyaux, fuites, installation et urgences.',
    descAr: 'إصلاح الأنابيب، تسريبات المياه، والتركيبات الطارئة.',
    color: '#1E88E5',
    gradient: 'from-[#1E88E5]/10 to-transparent',
    img: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=600&auto=format&fit=crop',
  },
  {
    iconName: 'Zap',
    nameEn: 'Electrical',
    nameFr: 'Électricité',
    nameAr: 'الكهرباء',
    descEn: 'Wiring, panel upgrades, lighting installation & fault diagnosis.',
    descFr: 'Câblage, tableaux électriques, éclairage et diagnostic.',
    descAr: 'أسلاك كهربائية، تركيب الإضاءة وتشخيص الأعطال.',
    color: '#FFB300',
    gradient: 'from-[#FFB300]/10 to-transparent',
    img: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=600&auto=format&fit=crop',
  },
  {
    iconName: 'Hammer',
    nameEn: 'Carpentry',
    nameFr: 'Menuiserie',
    nameAr: 'النجارة',
    descEn: 'Custom furniture, door fitting, shelving & wood restoration.',
    descFr: 'Meubles sur mesure, portes, étagères et restauration bois.',
    descAr: 'أثاث مخصص، تركيب الأبواب والرفوف وترميم الخشب.',
    color: '#8D6E63',
    gradient: 'from-[#8D6E63]/10 to-transparent',
    img: 'https://th.bing.com/th/id/R.f41223c074143e16727a61d7a001bd0a?rik=H6R4XHMY5DNelw&pid=ImgRaw&r=0',
  },
  {
    iconName: 'Sparkles',
    nameEn: 'Cleaning',
    nameFr: 'Nettoyage',
    nameAr: 'التنظيف',
    descEn: 'Deep cleaning, post-construction cleanup & regular housekeeping.',
    descFr: 'Nettoyage en profondeur, post-chantier et ménage régulier.',
    descAr: 'تنظيف عميق، ما بعد البناء والتنظيف المنتظم.',
    color: '#26C6DA',
    gradient: 'from-[#26C6DA]/10 to-transparent',
    img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=600&auto=format&fit=crop',
  },
  {
    iconName: 'Sun',
    nameEn: 'Gardening',
    nameFr: 'Jardinage',
    nameAr: 'البستنة',
    descEn: 'Lawn care, tree trimming, irrigation & landscape design.',
    descFr: 'Entretien pelouse, taille, irrigation et paysagisme.',
    descAr: 'رعاية العشب، تقليم الأشجار والتصميم المشهدي.',
    color: '#43A047',
    gradient: 'from-[#43A047]/10 to-transparent',
    img: 'https://tse3.mm.bing.net/th/id/OIP.NwjF30PbxT0Ru3_94mo_JAHaE8?rs=1&pid=ImgDetMain&o=7&rm=3',
  },
  {
    iconName: 'Home',
    nameEn: 'Construction',
    nameFr: 'Construction',
    nameAr: 'البناء',
    descEn: 'Renovations, extensions, masonry & structural improvements.',
    descFr: 'Rénovations, extensions, maçonnerie et améliorations.',
    descAr: 'تجديدات، توسعات، بناء وتحسينات هيكلية.',
    color: '#EF5350',
    gradient: 'from-[#EF5350]/10 to-transparent',
    img: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=600&auto=format&fit=crop',
  },
  {
    iconName: 'Paintbrush',
    nameEn: 'Painting',
    nameFr: 'Peinture',
    nameAr: 'الدهانات',
    descEn: 'Interior & exterior painting, texture finishes & wall prep.',
    descFr: 'Peinture intérieure/extérieure, textures et préparation.',
    descAr: 'طلاء داخلي وخارجي، تشطيبات الملمس وتحضير الجدران.',
    color: '#AB47BC',
    gradient: 'from-[#AB47BC]/10 to-transparent',
    img: 'https://img.freepik.com/premium-photo/painter-is-painting-interior-wall-whitex9xa_109549-3231.jpg',
  },
  {
    iconName: 'Wind',
    nameEn: 'Air Conditioning',
    nameFr: 'Climatisation',
    nameAr: 'التكييف',
    descEn: 'AC installation, servicing, cleaning & refrigerant refills.',
    descFr: 'Installation, entretien, nettoyage et recharge de climatiseurs.',
    descAr: 'تركيب وصيانة وتنظيف المكيفات وإعادة الشحن.',
    color: '#29B6F6',
    gradient: 'from-[#29B6F6]/10 to-transparent',
    img: 'https://res.cloudinary.com/mychauffage/image/upload/f_auto/v1610621202/MyChauffage/climatisation-maison.png',
  },
  {
    iconName: 'LayoutGrid',
    nameEn: 'Zellij',
    nameFr: 'Zellij',
    nameAr: 'الزليج',
    descEn: 'Traditional Moroccan mosaic tile art for floors, walls & fountains.',
    descFr: 'Mosaïque marocaine traditionnelle pour sols, murs et fontaines.',
    descAr: 'فن الزليج المغربي التقليدي للأرضيات والجدران والنوافير.',
    color: '#FF7043',
    gradient: 'from-[#FF7043]/10 to-transparent',
    img: 'https://tse3.mm.bing.net/th/id/OIP.Pn-2TxOficlMSIXlapdZswAAAA?w=474&h=592&rs=1&pid=ImgDetMain&o=7&rm=3',
  },
];

const sectionTitle: Record<Language, { label: string; heading: string; sub: string }> = {
  en: {
    label: 'What We Offer',
    heading: 'Every Service You Need',
    sub: 'From emergency repairs to artistic craftsmanship — Vork connects you with the right professional, every time.',
  },
  fr: {
    label: 'Ce Que Nous Offrons',
    heading: 'Tous les Services dont Vous Avez Besoin',
    sub: "Des réparations d'urgence à l'artisanat artistique — Vork vous connecte avec le bon professionnel, à chaque fois.",
  },
  ar: {
    label: 'ما نقدمه',
    heading: 'كل خدمة تحتاجها',
    sub: 'من الإصلاحات الطارئة إلى الحرف الفنية — يربطك Vork بالمحترف المناسب في كل مرة.',
  },
};

const getBentoSpan = (idx: number) => {
  switch (idx) {
    case 0: return 'col-span-1 md:col-span-2 lg:col-span-2 lg:row-span-2';
    case 1: return 'col-span-1 md:col-span-2 lg:col-span-2';
    case 2: return 'col-span-1 md:col-span-1 lg:col-span-1';
    case 3: return 'col-span-1 md:col-span-1 lg:col-span-1 lg:row-span-2';
    case 4: return 'col-span-1 md:col-span-2 lg:col-span-2';
    case 5: return 'col-span-1 md:col-span-1 lg:col-span-1';
    case 6: return 'col-span-1 md:col-span-1 lg:col-span-1';
    case 7: return 'col-span-1 md:col-span-2 lg:col-span-2';
    case 8: return 'col-span-1 md:col-span-2 lg:col-span-1';
    default: return 'col-span-1 md:col-span-1 lg:col-span-1';
  }
};

const IconRenderer = ({ name, color }: { name: string, color: string }) => {
  const props = { size: 26, style: { color } };
  switch (name) {
    case 'Wrench': return <Wrench {...props} />;
    case 'Zap': return <Zap {...props} />;
    case 'Hammer': return <Hammer {...props} />;
    case 'Sparkles': return <Sparkles {...props} />;
    case 'Sun': return <Sun {...props} />;
    case 'Home': return <Home {...props} />;
    case 'Paintbrush': return <Paintbrush {...props} />;
    case 'Wind': return <Wind {...props} />;
    case 'LayoutGrid': return <LayoutGrid {...props} />;
    default: return <Hammer {...props} />;
  }
};

const CategoriesSection: React.FC<CategoriesSectionProps> = ({ lang }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const t = sectionTitle[lang];
  const isRtl = lang === 'ar';

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const reveals = sectionRef.current?.querySelectorAll('.reveal');
    reveals?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const getName = (s: ServiceItem) =>
    lang === 'fr' ? s.nameFr : lang === 'ar' ? s.nameAr : s.nameEn;
  const getDesc = (s: ServiceItem) =>
    lang === 'fr' ? s.descFr : lang === 'ar' ? s.descAr : s.descEn;

  return (
    <section
      id="services"
      ref={sectionRef}
      className="relative py-28 px-6 bg-[#F9FBFF]"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 reveal">
          <span className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-[#2E9BDA]/10 text-[#2E9BDA] rounded-full text-sm font-semibold">
            {t.label}
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-[#0B1D2D] mb-5 leading-tight">
            {t.heading}
          </h2>
          <p className="text-[#474556] text-lg max-w-2xl mx-auto leading-relaxed">
            {t.sub}
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 reveal reveal-delay-1">
          {services.map((service, idx) => {
            const spanClass = getBentoSpan(idx);
            const isLargeSquare = idx === 0;
            const isTallRect = idx === 3;
            
            return (
              <div
                key={service.nameEn}
                className={`group relative overflow-hidden rounded-[32px] bg-white border border-gray-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(46,155,218,0.12)] hover:-translate-y-1 transition-all duration-300 ${spanClass} flex flex-col min-h-[300px] lg:min-h-[340px] cursor-pointer`}
              >
                {/* Decorative Image */}
                <div 
                  className={`absolute right-0 bottom-0 z-0 pointer-events-none transition-transform duration-700 group-hover:scale-105 w-full ${isLargeSquare || isTallRect ? 'h-[80%]' : 'h-[85%]'} opacity-100`}
                  style={{
                    maskImage: 'linear-gradient(to bottom, transparent 0%, black 40%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 40%)'
                  }}
                >
                  <img src={service.img} alt="" className="w-full h-full object-cover object-bottom" />
                </div>

                {/* Text Protection Gradient */}
                <div className="absolute inset-0 top-0 h-[55%] bg-gradient-to-b from-white via-white/95 to-transparent z-0 pointer-events-none" />

                {/* Background Gradient Hover Overlay (THE HOVER COLOR ANIMATION) */}
                <div className={`absolute inset-0 bg-gradient-to-b ${service.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none`} />

                {/* Content */}
                <div className="relative z-20 p-8 flex flex-col h-full">
                  {/* Upper Section */}
                  <div className="flex-1 flex flex-row items-start gap-5">
                    {/* Icon Container */}
                    <div
                      className="w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110 bg-white"
                      style={{
                        border: `1px solid ${service.color}30`,
                        boxShadow: `0 4px 20px ${service.color}15`,
                      }}
                    >
                      <IconRenderer name={service.iconName} color={service.color} />
                    </div>
                    
                    {/* Text Content */}
                    <div className="pt-1">
                      <h3 className="font-bold text-xl text-[#0B1D2D] mb-1">
                        {getName(service)}
                      </h3>
                      <p className={`text-[#474556] text-sm leading-relaxed drop-shadow-sm line-clamp-3 ${isLargeSquare ? 'max-w-xs' : ''}`}>
                        {getDesc(service)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Arrow indicator (Lower Section) */}
                  <div className="mt-6 flex justify-end items-end opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                    <div className="w-10 h-10 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center" style={{ color: service.color }}>
                      <ArrowRight size={20} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
