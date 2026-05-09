
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, Diamond, AlertCircle, User, Briefcase } from 'lucide-react';
import { loginUser, signInWithGoogle } from '../../services/auth.service';

interface Props {
    onLoginSuccess: (userData: any, role: 'user' | 'artisan') => void;
    onSwitchToSignup: () => void;
}

export const LoginView: React.FC<Props> = ({ onLoginSuccess, onSwitchToSignup }) => {
    const { t } = useTranslation();
    const [role, setRole] = useState<'user' | 'artisan'>('user');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [googleLoading, setGoogleLoading] = useState(false);

    const handleGoogleLogin = async () => {
        setGoogleLoading(true);
        setError(null);
        try {
            await signInWithGoogle();
            // onAuthStateChanged in useAuthLogic handles the rest
        } catch (err: any) {
            setError(err.message || t('auth.error_google_login'));
        } finally {
            setGoogleLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError(t('auth.error_fill_all'));
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await loginUser(email, password, role);
            onLoginSuccess(result.data, role);
        } catch (err: any) {
            setError(err.message || t('auth.error_login'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0a0a0c] relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-gradient-to-tr from-purple-900/20 via-transparent to-pink-900/10 blur-[120px] pointer-events-none" />

            <div className="flex flex-col items-center text-center mb-8 z-10">
                <div className="size-16 bg-gradient-to-br from-[#a855f7] to-[#ec4899] rounded-[1.5rem] flex items-center justify-center mb-4 shadow-2xl overflow-hidden">
                    <img src="/icons/icon-512x512.png" alt="Vork Logo" className="w-10 h-10 object-contain" />
                </div>
                <h1
                  className="text-4xl font-black text-white tracking-tighter mb-1 uppercase"
                >
                  {t('common.vork')}
                </h1>
                <p
                  className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em]"
                >
                  {t('auth.login_title')}
                </p>
            </div>

            <div className="w-full max-w-sm glass-card bg-[#121214]/60 rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative z-20">
                <div className="flex gap-2 mb-6">
                    <button
                      onClick={() => setRole('user')}
                      className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border transition-all ${role === 'user' ? 'bg-purple-600 border-purple-500 text-white shadow-lg' : 'bg-white/5 border-white/5 text-slate-600'}`}
                    >
                      <User size={12} />
                      {t('auth.client')}
                    </button>
                    <button
                      onClick={() => setRole('artisan')}
                      className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border transition-all ${role === 'artisan' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-white/5 border-white/5 text-slate-600'}`}
                    >
                      <Briefcase size={12} />
                      {t('auth.artisan')}
                    </button>
                </div>

                {/* Google OAuth Button */}
                <button
                    onClick={handleGoogleLogin}
                    disabled={googleLoading}
                    className="w-full bg-white/5 border border-white/10 py-4 rounded-2xl text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-3 hover:bg-white/10 active:scale-[0.98] transition-all mb-5"
                >
                    {googleLoading ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <>
                            <svg viewBox="0 0 24 24" className="size-4" fill="none">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            {t('auth.google_login')}
                        </>
                    )}
                </button>

                {/* Separator */}
                <div className="flex items-center gap-3 mb-5">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{t('auth.or')}</span>
                    <div className="flex-1 h-px bg-white/10" />
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('auth.email_label')}</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder={t('auth.placeholder_email')}
                              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-xs focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-slate-700"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('auth.password_label')}</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder={t('auth.placeholder_password')}
                              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white text-xs focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-slate-700"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2">
                            <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                            <p className="text-red-500 text-[9px] font-bold uppercase tracking-tight leading-tight">{error}</p>
                        </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-[#a855f7] to-[#ec4899] py-5 rounded-2xl text-white font-black text-sm uppercase tracking-[0.2em] shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4 group"
                    >
                        {isLoading ? <Loader2 className="size-4 animate-spin" /> : <>{t('auth.login_button')} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /></>}
                    </button>
                </form>

                <button
                  onClick={onSwitchToSignup}
                  className="w-full mt-6 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
                >
                  {t('auth.no_account')}
                </button>
            </div>
        </div>
    );
};
