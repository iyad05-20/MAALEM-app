import React from 'react';
import { useTranslation } from 'react-i18next';
import { Maximize2 } from 'lucide-react';

interface PhotoGalleryProps {
    title: string;
    images?: string[];
    onImageClick: (url: string) => void;
    titleColorClass?: string;
    borderColorClass?: string;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ 
    title, images, onImageClick, titleColorClass = "text-slate-500", borderColorClass = "border-white/10" 
}) => {
    const { t } = useTranslation();
    if (!images || images.length === 0) return null;

    return (
        <div className="space-y-4">
            <h3 className={`text-[10px] font-black uppercase tracking-widest px-1 ${titleColorClass}`}>
                {title}
            </h3>
            <div className="grid grid-cols-4 gap-2.5">
                {images.map((url, idx) => (
                    <div 
                        key={idx} 
                        onClick={() => onImageClick(url)} 
                        className={`relative aspect-square rounded-2xl overflow-hidden border group cursor-pointer ${borderColorClass}`}
                    >
                        <img 
                            src={url} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                            alt={t('order_detail.photo_detail', { title })} 
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/30 transition-all">
                            <Maximize2 size={16} className="text-white" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
