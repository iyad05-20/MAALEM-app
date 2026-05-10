import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, MoreVertical, Search, Zap, X, CheckCircle2 } from 'lucide-react';
import { Order, Artisan, Quote } from '../../types';
import { sanitizeFirestoreData } from '../../utils';
import { findBestArtisans } from '../../services/recommendation.service';
import { db, auth } from '../../services/firebase.config';
import { doc, getDoc, onSnapshot, updateDoc, addDoc, collection, setDoc, query, orderBy } from "firebase/firestore";
import { ordersAPI } from '../../services/api.client';
import { rejectQuote } from '../../services/order.actions';

// New Extracted Components
import { CompletionModal } from '../../components/Client/OrderDetails/CompletionModal';
import { QuoteCard } from '../../components/Client/OrderDetails/QuoteCard';
import { AssignedArtisanCard } from '../../components/Client/OrderDetails/AssignedArtisanCard';
import { OrderHeader } from '../../components/Client/OrderDetails/OrderHeader';
import { PhotoGallery } from '../../components/Client/OrderDetails/PhotoGallery';

interface Props {
    order: Order;
    onBack: () => void;
    onUpdateOrder: (id: string, updates: Partial<Order>) => Promise<void>;
    onOpenChat: (artisan: Partial<Artisan>) => void;
    onOpenArtisanProfile: (id: string | undefined) => void;
    onViewImage?: (url: string) => void;
    showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ClientOrderDetailView: React.FC<Props> = ({ order, onBack, onOpenChat, onOpenArtisanProfile, showToast }) => {
    const { t } = useTranslation();
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [isAccepting, setIsAccepting] = useState<string | null>(null);
    const [isRejecting, setIsRejecting] = useState<string | null>(null);
    const [canExpand, setCanExpand] = useState(false);
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

    useEffect(() => {
        const q = query(collection(db, "orders", order.id, "quotes"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ ...sanitizeFirestoreData(doc.data()), id: doc.id })) as Quote[];
            setQuotes(list.filter(q => q.status !== 'rejected'));
        });

        const checkExpandTime = () => {
            const createdAt = new Date(order.createdAt || Date.now()).getTime();
            const diffMinutes = (Date.now() - createdAt) / (1000 * 60);
            if (diffMinutes >= 30 && (order.searchRadius || 1) < 2) setCanExpand(true);
        };
        checkExpandTime();
        const interval = setInterval(checkExpandTime, 60000);

        return () => { unsubscribe(); clearInterval(interval); };
    }, [order.id, order.createdAt, order.searchRadius]);

    const handleAcceptQuote = async (quote: Quote) => {
        setIsAccepting(quote.id);
        const displayPrice = quote.price || (quote.amount ? `${quote.amount} dh` : t('order_detail.agreed_price'));
        const clientId = order.userId || order.clientId || auth.currentUser?.uid;
        if (!clientId) {
            showToast(t('order_detail.error_identify_client'), "error");
            setIsAccepting(null);
            return;
        }
        try {
            await ordersAPI.updateStatus(order.id, 'En cours', {
                artisanId: quote.artisanId,
                artisanName: quote.artisanName,
                artisanImage: quote.artisanImage,
                artisanRating: quote.artisanRating,
                assignedPrice: displayPrice,
            });

            let myName = 'Client', myImage = '';
            if (auth.currentUser) {
                const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    myName = userData.name || 'Client';
                    myImage = userData.avatar || userData.image || '';
                }
            }

            const chatDocId = `${clientId}_${quote.artisanId}`;
            await setDoc(doc(db, "chats", chatDocId), {
                id: chatDocId, userId: clientId, userName: myName, userImage: myImage,
                artisanId: quote.artisanId, artisanName: quote.artisanName, artisanImage: quote.artisanImage,
                lastMessage: t('order_detail.chat_order_accepted', { price: displayPrice }), timestamp: new Date().toISOString(),
                lastMessageTime: new Date().toISOString(),
                unreadCount: 0, unreadCountClient: 0, unreadCountArtisan: 1, isOnline: true
            }, { merge: true });

            await addDoc(collection(db, "chats", chatDocId, "messages"), {
                text: t('order_detail.chat_accept_message', { price: displayPrice }),
                sender: 'user', timestamp: new Date().toISOString(), status: 'sent'
            });
            await addDoc(collection(db, "notifications"), {
                userId: quote.artisanId,
                title: t('order_detail.quote_accepted_title'),
                message: t('order_detail.quote_accepted_message', { price: displayPrice, category: order.category }),
                type: 'order_accepted',
                read: false,
                createdAt: new Date().toISOString(),
                relatedId: order.id
            });
            showToast(t('order_detail.quote_accepted_toast'), "success");
        } catch (err) {
            console.error("Error accepting quote:", err);
            showToast(t('order_detail.accept_error'), "error");
        } finally { setIsAccepting(null); }
    };

    const handleRejectQuote = async (quote: Quote) => {
        setIsRejecting(quote.id);
        try { await rejectQuote(order.id, quote.artisanId, quote.id); }
        catch (err) { console.error(err); showToast(t('order_detail.reject_error'), "error"); } finally { setIsRejecting(null); }
    };

    const handleConfirmCompletion = async (rating: number, comment: string, images: string[]) => {
        try {
            await ordersAPI.updateStatus(order.id, 'En attente de clôture', {
                pendingReview: { rating, comment, images }
            });
            if (order.artisanId) {
                const chatDocId = `${order.userId || order.clientId || auth.currentUser?.uid}_${order.artisanId}`;
                await addDoc(collection(db, "chats", chatDocId, "messages"), {
                    text: t('order_detail.completion_message', { rating }),
                    sender: 'user', timestamp: new Date().toISOString(), status: 'sent'
                });
                await addDoc(collection(db, "notifications"), {
                    userId: order.artisanId,
                    title: t('order_detail.closure_request_title'),
                    message: t('order_detail.closure_request_message', { category: order.category }),
                    type: 'order_accepted',
                    read: false,
                    createdAt: new Date().toISOString(),
                    relatedId: order.id
                });
            }
            showToast(t('order_detail.closure_sent_to_artisan'), "success");
            await new Promise(resolve => setTimeout(resolve, 1500));
            setShowCompletionModal(false);
        } catch (err) {
            console.error(err);
            showToast(t('order_detail.closure_error'), "error");
            setShowCompletionModal(false);
        }
    };

    const handleExpandSearch = async () => {
        try {
            const newRadius = 2;
            const additionalArtisans = await findBestArtisans(order.category, newRadius);
            const newTargetedSet = new Set([...(order.targetedArtisans || []), ...additionalArtisans]);
            await updateDoc(doc(db, "orders", order.id), {
                searchRadius: newRadius, targetedArtisans: Array.from(newTargetedSet), contactedArtisanIds: Array.from(newTargetedSet)
            });
            setCanExpand(false);
            showToast(t('order_detail.search_expanded'), "success");
        } catch (err) { console.error(err); showToast(t('order_detail.expand_search_error'), "error"); }
    };

    const isAssigned = ['En cours', 'Accepté', 'Terminé', 'En attente de clôture'].includes(order.status);
    const isPendingClosure = order.status === 'En attente de clôture';

    return (
        <div className="min-h-screen bg-[#0a0a0c] flex flex-col animate-in slide-in-from-right duration-500 pb-32">
            {/* Nav Header */}
            <header className="px-6 pt-12 pb-6 flex items-center justify-between sticky top-0 bg-[#0a0a0c]/90 backdrop-blur-xl z-50 border-b border-white/5">
                <button onClick={onBack} className="size-10 bg-white/5 rounded-xl flex items-center justify-center text-white border border-white/10 active:scale-90"><ChevronLeft className="w-5 h-5" /></button>
                <h1 className="text-[11px] font-black text-white tracking-[0.2em] uppercase">{t('order_detail.title', { id: order.id.slice(-5).toUpperCase() })}</h1>
                <button className="size-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-500 border border-white/10"><MoreVertical size={20} /></button>
            </header>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-8 p-6 bg-[#0a0a0c]">
                {/* Main Order Info */}
                <OrderHeader order={order} isAssigned={isAssigned} isPendingClosure={isPendingClosure} />

                {/* Description */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{t('order_detail.detailed_description')}</h3>
                    <div className="glass-card p-6 rounded-[2rem] bg-[#121214] border border-white/5 shadow-inner">
                        <p className="text-slate-400 text-sm font-medium italic leading-relaxed">"{order.description}"</p>
                    </div>
                </div>

                {/* Quick Completion Action */}
                {(order.status === 'En cours' || order.status === 'Accepté') && (
                    <div className="glass-card p-6 rounded-[2rem] bg-indigo-900/10 border border-indigo-500/20 flex items-center justify-between shadow-xl">
                        <div className="relative z-10">
                            <h4 className="text-white font-black text-sm uppercase tracking-tight">{t('order_detail.work_done')}</h4>
                            <p className="text-[10px] text-indigo-400/70 font-bold uppercase tracking-widest mt-0.5">{t('order_detail.validate_to_close')}</p>
                        </div>
                        <button onClick={() => setShowCompletionModal(true)} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center gap-2 hover:bg-indigo-500">
                            <CheckCircle2 size={16} /> {t('order_detail.validate_completion')}
                        </button>
                    </div>
                )}

                {/* Section Devis ou Artisan Assigné */}
                {!isAssigned ? (
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{t('order_detail.received_quotes')}</h3>
                        {quotes.length > 0 ? (
                            <div className="space-y-4">
                                {quotes.map((quote) => (
                                    <QuoteCard 
                                        key={quote.id}
                                        quote={quote}
                                        isAccepting={isAccepting === quote.id}
                                        isRejecting={isRejecting === quote.id}
                                        onAccept={handleAcceptQuote}
                                        onReject={handleRejectQuote}
                                        disabled={isAccepting !== null || isRejecting !== null}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="glass-card p-10 rounded-[2.5rem] bg-[#121214]/60 border border-dashed border-white/10 text-center">
                                <Search className="animate-pulse text-slate-700 mx-auto mb-4" size={24} />
                                <p className="text-slate-600 font-black text-[10px] uppercase tracking-widest">{t('order_detail.searching_experts')}</p>
                                {canExpand && (
                                    <button onClick={handleExpandSearch} className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-xl mx-auto mt-4">
                                        <Zap size={14} className="fill-current" /> {t('order_detail.expand_search')}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <AssignedArtisanCard 
                        artisanId={order.artisanId}
                        artisanName={order.artisanName}
                        artisanImage={order.artisanImage}
                        artisanRating={order.artisanRating}
                        onOpenProfile={onOpenArtisanProfile}
                        onOpenChat={onOpenChat}
                    />
                )}

                {/* Photo Galleries */}
                <PhotoGallery 
                    title={t('order_detail.initial_photos')} 
                    images={order.images} 
                    onImageClick={setFullScreenImage} 
                />
                
                <PhotoGallery 
                    title={t('order_detail.final_result')} 
                    images={order.resultImages} 
                    onImageClick={setFullScreenImage}
                    titleColorClass="text-emerald-500"
                    borderColorClass="border-emerald-500/20"
                />
            </div>

            {/* Modals */}
            <CompletionModal 
                isOpen={showCompletionModal} 
                onClose={() => setShowCompletionModal(false)} 
                onConfirm={handleConfirmCompletion} 
                artisanName={order.artisanName || 'Expert'} 
                artisanImage={order.artisanImage} 
                orderId={order.id} 
                showToast={showToast} 
            />

            {fullScreenImage && (
                <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 animate-in fade-in" onClick={() => setFullScreenImage(null)}>
                    <button className="absolute top-6 right-6 size-10 bg-white/10 rounded-full flex items-center justify-center text-white"><X size={20} /></button>
                    <img src={fullScreenImage} className="max-w-full max-h-full object-contain rounded-lg animate-in zoom-in-95" alt="Full" onClick={(e) => e.stopPropagation()} />
                </div>
            )}
        </div>
    );
};
