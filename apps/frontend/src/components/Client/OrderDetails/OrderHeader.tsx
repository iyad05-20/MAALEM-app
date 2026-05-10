import React from 'react';
import { useTranslation } from 'react-i18next';
import { ImageIcon, Clock } from 'lucide-react';
import { Order } from '../../../types';

interface OrderHeaderProps {
    order: Order;
    isPendingClosure: boolean;
    isAssigned: boolean;
}

export const OrderHeader: React.FC<OrderHeaderProps> = ({ order, isPendingClosure, isAssigned }) => {
    const { t } = useTranslation();
    return (
        <div className="glass-card p-6 rounded-[2.5rem] bg-[#1a1a20]/60 border border-white/5">
            <div className="flex items-center gap-5">
                <div className="size-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center text-indigo-500 border border-indigo-500/10">
                    <ImageIcon size={28} />
                </div>
                <div className="flex-1">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-1">
                        {order.title || order.category}
                    </h2>
                    <div className="flex items-center gap-2 text-slate-400">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                            {order.category}
                        </span>
                        <span className="text-slate-700">•</span>
                        <Clock size={12} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{order.date}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/5">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('order_detail.status')}</span>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
                    isAssigned ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                }`}>
                    <div className={`size-2 rounded-full ${order.status === 'Terminé' ? 'bg-emerald-500' : 'bg-orange-500 animate-pulse'}`}></div>
                    <span className="text-[9px] font-black uppercase tracking-widest">
                        {isPendingClosure ? t('order_detail.validation') : order.status}
                    </span>
                </div>
            </div>
        </div>
    );
};
