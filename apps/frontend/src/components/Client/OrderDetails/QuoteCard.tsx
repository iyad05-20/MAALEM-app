import React from 'react';
import { useTranslation } from 'react-i18next';
import { Star, XCircle, UserCheck, Loader2 } from 'lucide-react';
import { Quote } from '../../../types';
import { SmartAvatar } from '../../Shared/SmartAvatar';

interface QuoteCardProps {
    quote: Quote;
    isAccepting: boolean;
    isRejecting: boolean;
    onAccept: (quote: Quote) => void;
    onReject: (quote: Quote) => void;
    disabled: boolean;
}

export const QuoteCard: React.FC<QuoteCardProps> = ({ 
    quote, isAccepting, isRejecting, onAccept, onReject, disabled 
}) => {
    const { t } = useTranslation();
    return (
        <div className="glass-card p-6 rounded-[2.5rem] bg-[#121214] border border-white/10 shadow-2xl">
            <div className="flex items-start gap-4 mb-6">
                <div className="size-14 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
                    <SmartAvatar src={quote.artisanImage} name={quote.artisanName} initialsClassName="text-xl font-black text-white" />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="text-white font-black text-base uppercase tracking-tight">{quote.artisanName}</h4>
                            <div className="flex items-center gap-1 mt-1">
                                <Star className="size-3 text-yellow-400 fill-current" />
                                <span className="text-[10px] font-black text-white">{quote.artisanRating}</span>
                            </div>
                        </div>
                        <span className="text-lg font-black text-emerald-400 tracking-tighter">{quote.price}</span>
                    </div>
                </div>
            </div>
            <p className="text-slate-400 text-xs italic mb-6 bg-white/5 p-4 rounded-2xl border border-white/5">
                "{quote.description}"
            </p>
            <div className="flex gap-3">
                <button 
                    onClick={() => onReject(quote)} 
                    disabled={disabled} 
                    className="flex-1 py-4 rounded-2xl bg-white/5 text-red-400 border border-white/5 font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2"
                >
                    {isRejecting ? <Loader2 className="size-4 animate-spin" /> : <><XCircle size={16} /> {t('order_detail.reject')}</>}
                </button>
                <button 
                    onClick={() => onAccept(quote)} 
                    disabled={disabled} 
                    className="flex-[2] py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2"
                >
                    {isAccepting ? <Loader2 className="size-4 animate-spin" /> : <><UserCheck size={16} /> {t('order_detail.accept')}</>}
                </button>
            </div>
        </div>
    );
};
