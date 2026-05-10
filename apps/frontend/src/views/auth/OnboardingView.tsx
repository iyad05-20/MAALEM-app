import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Briefcase, Phone, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import { db } from '../../services/firebase.config';
import { doc, updateDoc, setDoc } from "firebase/firestore";

interface Props {
    userProfile: any;
    onComplete: (updatedProfile: any, role: 'user' | 'artisan') => void;
}

export const OnboardingView: React.FC<Props> = ({ userProfile, onComplete }) => {
    const { t } = useTranslation();
    const [role, setRole] = useState<'user' | 'artisan'>(() => {
        const pending = localStorage.getItem('vork_pending_google_role');
        if (pending) {
            localStorage.removeItem('vork_pending_google_role');
            return pending as 'user' | 'artisan';
        }
        return 'user';
    });
    const [name, setName] = useState(userProfile?.name || '');
    const [phone, setPhone] = useState('+212');
    const [category, setCategory] = useState('Plomberie');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const artisanCategories = [
        { value: 'Plomberie', label: t('onboarding.categories.plumbing') },
        { value: 'Électricité', label: t('onboarding.categories.electricity') },
        { value: 'Climatisation', label: t('onboarding.categories.ac') },
        { value: 'Peinture', label: t('onboarding.categories.painting') },
        { value: 'Menuiserie', label: t('onboarding.categories.carpentry') },
        { value: 'Maçonnerie', label: t('onboarding.categories.masonry') },
        { value: 'Nettoyage', label: t('onboarding.categories.cleaning') }
    ];

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value.startsWith('+212')) {
            const digits = value.slice(4).replace(/\D/g, '');
            if (digits.length <= 9) {
                setPhone('+212' + digits);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!name || phone.length !== 13) {
            setError(phone.length !== 13 ? t('onboarding.error_phone_invalid') : t('onboarding.error_fill_all'));
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const uid = userProfile.id || userProfile.uid;
            
            if (role === 'user') {
                // Update existing user document
                const updatedData = {
                    name,
                    phone,
                    role: 'user',
                    profileComplete: true
                };
                await updateDoc(doc(db, 'users', uid), updatedData);
                onComplete({ ...userProfile, ...updatedData }, 'user');
                
            } else {
                // Mettre à jour le document utilisateur existant (un artisan est aussi un client)
                const updatedUserData = {
                    name,
                    phone,
                    role: 'artisan', // ou on garde 'user', mais on ajoute isArtisan ? Le middleware vérifie les collections. On peut mettre 'artisan' ici pour la logique frontend.
                    profileComplete: true
                };
                await updateDoc(doc(db, 'users', uid), updatedUserData);

                // Créer le document dans la collection artisans
                const artisanData = {
                    ...userProfile,
                    name,
                    phone,
                    role: 'artisan',
                    category,
                    profileComplete: true,
                    available: true,
                    rating: 5,
                    experience: 0,
                    jobsDone: 0,
                    about: "Nouvel expert Vork prêt à intervenir.",
                    services: [category],
                    portfolio: [],
                    reviews: [],
                    city: '',
                    location: ''
                };
                
                // Create artisan doc
                await setDoc(doc(db, 'artisans', uid), artisanData);
                
                onComplete(artisanData, 'artisan');
            }
        } catch (err: any) {
            setError(err.message || t('onboarding.error_save_profile'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0a0a0c] relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-gradient-to-tr from-purple-900/20 via-transparent to-pink-900/10 blur-[120px] pointer-events-none" />

            <div className="flex flex-col items-center text-center mb-8 z-10">
                <div className="size-16 bg-gradient-to-br from-[#a855f7] to-[#ec4899] rounded-[1.5rem] flex items-center justify-center mb-4 shadow-2xl overflow-hidden">
                    <img src={userProfile?.avatar || "/icons/icon-512x512.png"} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <h1 className="text-3xl font-black text-white tracking-tighter mb-1 uppercase">{t('onboarding.welcome')}</h1>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] leading-relaxed max-w-[250px]">
                    {t('onboarding.subtitle')}
                </p>
            </div>

            <div className="w-full max-w-sm glass-card bg-[#121214]/60 rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative z-20">
                <div className="flex gap-2 mb-6">
                    <button onClick={() => setRole('user')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border transition-all ${role === 'user' ? 'bg-purple-600 border-purple-500 text-white shadow-lg' : 'bg-white/5 border-white/5 text-slate-600'}`}>
                        <User size={12} /> {t('onboarding.client')}
                    </button>
                    <button onClick={() => setRole('artisan')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border transition-all ${role === 'artisan' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-white/5 border-white/5 text-slate-600'}`}>
                        <Briefcase size={12} /> {t('onboarding.artisan')}
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('onboarding.full_name')}</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('onboarding.full_name_placeholder')} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white text-xs focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-slate-700" />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('onboarding.phone')}</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                            <input type="tel" value={phone} onChange={handlePhoneChange} placeholder={t('onboarding.phone_placeholder')} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white text-xs focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-slate-700" />
                        </div>
                    </div>

                    {role === 'artisan' && (
                        <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('onboarding.category')}</label>
                            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white text-[10px] focus:outline-none focus:border-purple-500/50 appearance-none">
                                {artisanCategories.map(s => <option key={s.value} value={s.value} className="bg-[#121214]">{s.label}</option>)}
                            </select>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2">
                            <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                            <p className="text-red-500 text-[9px] font-bold uppercase tracking-tight leading-tight">{error}</p>
                        </div>
                    )}

                    <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-[#a855f7] to-[#ec4899] py-5 rounded-2xl text-white font-black text-sm uppercase tracking-[0.2em] shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4 group">
                        {isLoading ? <Loader2 className="size-4 animate-spin" /> : <>{t('onboarding.continue')} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /></>}
                    </button>
                </form>
            </div>
        </div>
    );
};
