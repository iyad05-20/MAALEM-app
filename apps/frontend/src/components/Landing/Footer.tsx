import React from 'react';
import { Globe, MessageCircle } from 'lucide-react';

type Language = 'fr' | 'en' | 'ar';

interface FooterProps {
  lang: Language;
}

const footerText: Record<Language, { privacy: string; terms: string; copy: string }> = {
  en: { privacy: 'Privacy', terms: 'Terms', copy: '© 2026 Vork. All rights reserved.' },
  fr: {
    privacy: 'Confidentialité',
    terms: 'Conditions',
    copy: '© 2026 Vork. Tous droits réservés.',
  },
  ar: { privacy: 'الخصوصية', terms: 'الشروط', copy: '© 2026 Vork. جميع الحقوق محفوظة.' },
};

const Footer: React.FC<FooterProps> = ({ lang }) => {
  const t = footerText[lang];
  const isRtl = lang === 'ar';

  return (
    <footer
      className="border-t border-blue-electric/15 py-12 bg-white/50"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-8">
        {/* Logo + copyright */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-3">
             <img src="/icons/icon-192x192.png" alt="Vork Logo" className="w-8 h-8 rounded-lg shadow-md" />
             <span className="text-lg font-bold text-[#0B1D2D] tracking-tight">Vork</span>
          </div>
          <span className="text-blue-electric text-sm font-bold opacity-80">{t.copy}</span>
        </div>

        {/* Links + socials */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-blue-electric hover:opacity-70 text-sm font-medium transition-all"
            >
              {t.privacy}
            </a>
            <a
              href="#"
              className="text-blue-electric hover:opacity-70 text-sm font-medium transition-all"
            >
              {t.terms}
            </a>
          </div>
          
          <div className="flex items-center gap-4">
            <a
              href="#"
              aria-label="Instagram"
              className="w-10 h-10 rounded-full bg-blue-electric/10 flex items-center justify-center text-blue-electric hover:bg-blue-electric hover:text-white transition-all duration-300"
            >
              <Globe size={18} />
            </a>
            <a
              href="#"
              aria-label="Twitter"
              className="w-10 h-10 rounded-full bg-blue-electric/10 flex items-center justify-center text-blue-electric hover:bg-blue-electric hover:text-white transition-all duration-300"
            >
              <MessageCircle size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
