import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import frLocale from '../locales/fr.json';
import arLocale from '../locales/ar.json';

// Ressources des langues
const resources = {
  fr: { translation: frLocale },
  ar: { translation: arLocale },
};

// Initialisation d'i18next
i18n
  .use(LanguageDetector) // Détecte la langue du navigateur
  .use(initReactI18next) // Intégration React
  .init({
    resources,
    fallbackLng: 'fr', // Fallback sur français
    interpolation: {
      escapeValue: false, // React protège déjà contre les XSS
    },
  });

// Gestion du dir="rtl" pour l'arabe
i18n.on('languageChanged', (lng) => {
  if (lng === 'ar') {
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';
  } else {
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'fr';
  }
});

// Définir la direction au chargement initial
if (i18n.language === 'ar') {
  document.documentElement.dir = 'rtl';
  document.documentElement.lang = 'ar';
} else {
  document.documentElement.dir = 'ltr';
  document.documentElement.lang = 'fr';
}

export default i18n;
