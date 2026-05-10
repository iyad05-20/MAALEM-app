import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, ImageIcon, X, CheckCircle2 } from 'lucide-react';
import { SmartAvatar } from '../../Shared/SmartAvatar';
import { useFilePreviews } from '../../../hooks/useFilePreview';
import { uploadToSupabase } from '../../../services/supabase.config';

interface CompletionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (rating: number, comment: string, images: string[]) => Promise<void>;
    artisanName: string;
    artisanImage?: string;
    orderId: string;
    showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({ 
    isOpen, onClose, onConfirm, artisanName, artisanImage, orderId, showToast 
}) => {
    const { t } = useTranslation();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [step, setStep] = useState<'rate' | 'uploading' | 'processing' | 'success'>('rate');
    const [images, setImages] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const previews = useFilePreviews(images);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImages(prev => [...prev, ...Array.from(e.target.files!)].slice(0, 4));
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        setStep('uploading');
        const imageUrls: string[] = [];

        try {
            if (images.length > 0) {
                for (const [index, file] of images.entries()) {
                    const fileExt = file.name.split('.').pop() || 'jpg';
                    const path = `reviews/${orderId}/result_${index}_${Date.now()}.${fileExt}`;
                    const url = await uploadToSupabase('vork-profilepic-bucket', path, file);
                    imageUrls.push(url);
                }
            }

            setStep('processing');
            await onConfirm(rating, comment, imageUrls);
            setStep('success');
        } catch (error) {
            console.error("Error submitting review:", error);
            setStep('rate');
            showToast(t('order_detail.submit_error'), "error");
        }
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-end justify-center animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={step === 'rate' ? onClose : undefined} />
            <div className="relative w-full max-w-md bg-[#0a0a0c] border-t border-white/10 rounded-t-[3rem] p-8 pb-safe-bottom shadow-2xl animate-in slide-in-from-bottom duration-500 max-h-[90vh] overflow-y-auto no-scrollbar text-center">
                {step === 'rate' && (
                    <div className="space-y-6">
                        <div className="size-16 mx-auto rounded-full overflow-hidden border-4 border-white/10 shadow-2xl">
                            <SmartAvatar src={artisanImage} name={artisanName} initialsClassName="text-xl font-black text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">{t('order_detail.mission_completed')}</h2>
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">{t('order_detail.rate_work_for', { name: artisanName })}</p>
                        </div>

                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} onClick={() => setRating(star)} className="p-1 transition-transform hover:scale-110 focus:outline-none">
                                    <Star size={32} className={`${rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-white/10 fill-white/5'} transition-colors`} />
                                </button>
                            ))}
                        </div>

                        <div className="w-full space-y-3 text-left">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">{t('order_detail.result_photos')} <span className="text-indigo-400">({t('order_detail.required')})</span></label>
                            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                                {images.length < 4 && (
                                    <button onClick={() => fileInputRef.current?.click()} className="size-20 shrink-0 rounded-2xl border-2 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center gap-1 group hover:border-indigo-500/50 transition-all">
                                        <ImageIcon size={18} className="text-slate-500 group-hover:text-indigo-400" />
                                        <span className="text-[8px] font-black text-slate-500 group-hover:text-indigo-400 uppercase tracking-widest">{t('common.add')}</span>
                                    </button>
                                )}
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileChange} />
                                 {images.map((_, idx) => (
                                    <div key={idx} className="size-20 shrink-0 rounded-2xl relative overflow-hidden border border-white/10 group">
                                        <img src={previews[idx]} className="w-full h-full object-cover" alt="Preview" />
                                        <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 size-5 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg"><X size={10} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder={t('order_detail.comment_placeholder')}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none h-20 placeholder:text-slate-600"
                        />

                        <div className="flex w-full gap-3 pt-2">
                            <button onClick={onClose} className="flex-1 py-4 bg-white/5 rounded-2xl text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-white/10">{t('common.cancel_button')}</button>
                            <button onClick={handleSubmit} disabled={rating === 0} className="flex-[2] py-4 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all">{t('order_detail.close_mission')}</button>
                        </div>
                    </div>
                )}

                {(step === 'uploading' || step === 'processing') && (
                    <div className="flex flex-col items-center justify-center py-10 space-y-6">
                        <div className="size-24 relative">
                            <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"></div>
                            <div className="absolute inset-0 border-t-4 border-emerald-500 rounded-full animate-spin"></div>
                        </div>
                        <h3 className="text-white font-black uppercase tracking-widest animate-pulse">{step === 'uploading' ? t('order_detail.uploading_photos') : t('order_detail.archiving_in_progress')}</h3>
                    </div>
                )}

                {step === 'success' && (
                    <div className="flex flex-col items-center justify-center py-10 space-y-6 animate-in zoom-in duration-300">
                        <div className="size-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_40_rgba(16,185,129,0.5)]">
                            <CheckCircle2 size={48} className="text-white animate-bounce" />
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">{t('order_detail.success')}</h3>
                    </div>
                )}
            </div>
        </div>
    );
};
