
import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';

export const ArtisanProfileView: React.FC = () => {
    const { t } = useLanguage();

    return (
        <div className="p-8 text-center pt-20">
            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-4">{t('nav.profile')}</h2>
            <p className="text-slate-500 text-sm">{t('profile.title')}</p>
        </div>
    );
};
