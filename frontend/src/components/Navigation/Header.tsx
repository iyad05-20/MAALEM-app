import React from 'react';
import { MessageSquare, Bell } from 'lucide-react'; import { useLanguage } from '../../i18n/LanguageContext';
import { View } from '../../types';

export const Header = ({ view, userRole, userProfile, chats, notifications, onToggleRole, onOpenChats, onOpenNotifications }: {
    view: View;
    userRole: 'user' | 'artisan';
    userProfile: any;
    chats: any[];
    notifications: any[];
    onToggleRole: () => void;
    onOpenChats: () => void;
    onOpenNotifications: () => void;
}) => {
    const { t } = useLanguage();
    const isProfileHeader = view === 'profile';
    const isArtisanDashboard = view === 'home' && userRole === 'artisan';
    const isClientHome = view === 'home' && userRole === 'user';

    // Hide header on certain views
    const hideHeader = ['chat-detail', 'order-detail', 'artisan-detail', 'category-detail', 'all-categories', 'portfolio', 'work-detail', 'reviews', 'favorites-list', 'settings', 'update-email', 'urgent', 'generic-form', 'artisan-history'].includes(view);
    if (hideHeader) return null;

    const unreadChats = chats.reduce((acc, c) => acc + (userRole === 'artisan' ? (c.unreadCountArtisan || 0) : (c.unreadCountClient || 0)), 0);
    const unreadNotifications = notifications.filter(n => !n.read).length;

    return (
        <header className="px-6 pt-10 pb-4 sticky top-0 z-40 bg-[#0a0a0c]/80 backdrop-blur-xl border-b border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                    <img src="/icons/icon-192x192.png" alt="Vork Logo" className="w-7 h-7 object-contain" />
                </div>
                <div>
                    <h1 className="text-lg font-black tracking-tighter text-white uppercase leading-none">VORK</h1>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <div className={`size-1.5 rounded-full ${userProfile?.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`}></div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
                            {userProfile?.isOnline ? t('common.online') : t('common.offline')}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={onToggleRole}
                    className="px-3 py-2 bg-white/5 rounded-xl text-[8px] font-black uppercase tracking-widest text-slate-400 border border-white/5 hover:text-white transition-colors"
                >
                    {t('nav.switch_to')} {userRole === 'user' ? t('auth.artisan') : t('auth.client')}
                </button>
                <button
                    onClick={onOpenChats}
                    className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center relative active:scale-90 transition-all border border-white/5"
                >
                    <MessageSquare className="w-5 h-5 text-slate-400" />
                    {unreadChats > 0 && (
                        <>
                            <div className="absolute top-2 right-2 size-2 bg-purple-500 rounded-full animate-ping"></div>
                            <div className="absolute top-2 right-2 size-2 bg-purple-500 rounded-full border border-[#0a0a0c]"></div>
                        </>
                    )}
                </button>
                <button
                    onClick={onOpenNotifications}
                    className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center relative active:scale-90 transition-all border border-white/5"
                >
                    <Bell className="w-5 h-5 text-slate-400" />
                    {unreadNotifications > 0 && (
                        <div className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border border-[#0a0a0c]"></div>
                    )}
                </button>
            </div>
        </header>
    );
};
