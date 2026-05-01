import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';

export type Language = 'fr' | 'ar';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, args?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>(
        (localStorage.getItem('vork_lang') as Language) || 'fr'
    );

    useEffect(() => {
        localStorage.setItem('vork_lang', language);
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    }, [language]);

    const normalizeCategoryKey = (key: string) => {
        return key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_');
    };

    const t = (path: string, args?: Record<string, string | number>) => {
        // Auto-normalize category keys
        if (path.startsWith('categories.')) {
            const categoryName = path.substring('categories.'.length);
            path = `categories.${normalizeCategoryKey(categoryName)}`;
        }

        const keys = path.split('.');
        let result: any = translations[language];

        for (const key of keys) {
            if (result && typeof result === 'object' && key in result) {
                result = result[key];
            } else {
                // Fallback to English/French if key missing in Arabic
                let fallback: any = translations['fr'];
                for (const fKey of keys) {
                    if (fallback && typeof fallback === 'object' && fKey in fallback) {
                        fallback = fallback[fKey];
                    } else {
                        fallback = null;
                        break;
                    }
                }
                result = fallback;
                break;
            }
        }

        let translated = typeof result === 'string' ? result : path;

        if (args) {
            Object.entries(args).forEach(([key, value]) => {
                translated = translated.replace(`{${key}}`, String(value));
            });
        }

        return translated;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};


export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
