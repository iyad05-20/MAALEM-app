import React from 'react';
import { useTranslation } from 'react-i18next';
import { Star, MessageCircle } from 'lucide-react';
import { SmartAvatar } from '../../Shared/SmartAvatar';
import { Artisan } from '../../../types';

interface AssignedArtisanCardProps {
    artisanId?: string;
    artisanName?: string;
    artisanImage?: string;
    artisanRating?: number;
    onOpenProfile: (id: string | undefined) => void;
    onOpenChat: (artisan: Partial<Artisan>) => void;
}

export const AssignedArtisanCard: React.FC<AssignedArtisanCardProps> = ({ 
    artisanId, artisanName, artisanImage, artisanRating, onOpenProfile, onOpenChat 
}) => {
    const { t } = useTranslation();
    return (
        <div className="space-y-6">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{t('order_detail.assigned_expert')}</h3>
            <div 
                onClick={() => onOpenProfile(artisanId)} 
                className="glass-card p-6 rounded-[2.5rem] bg-[#121214] border border-white/10 shadow-2xl group cursor-pointer active:scale-[0.99] transition-all"
            >
                <div className="flex items-center gap-5">
                    <div className="size-16 rounded-full border-2 border-indigo-500/30 overflow-hidden shadow-xl">
                        <SmartAvatar src={artisanImage} name={artisanName || 'Expert'} initialsClassName="text-xl font-black text-white" />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-xl font-black text-white tracking-tighter mb-2">{artisanName}</h4>
                        <div className="flex items-center gap-1">
                            <Star className="size-3 text-yellow-400 fill-current" />
                            <span className="text-xs font-black text-white">{artisanRating}</span>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={(e) => { 
                        e.stopPropagation(); 
                        onOpenChat({ id: artisanId, name: artisanName, image: artisanImage }); 
                    }} 
                    className="w-full mt-8 py-4 bg-indigo-600 rounded-2xl flex items-center justify-center gap-3 text-white font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all shadow-xl shadow-indigo-600/20"
                >
                    <MessageCircle size={16} /> {t('order_detail.chat_with_expert')}
                </button>
            </div>
        </div>
    );
};
