import { useState, useCallback } from 'react';
import { ChatMessage, Order } from '../types';
import { aiService, ChatResponse } from '../services/ai/aiService';
import { uploadToSupabase } from '../services/supabase.config';
import { getInitialArtisans } from '../services/recommendation.service';
import { reverseGeocode, MARRAKECH_CENTER } from '../services/location.service';
import type { Category, Artisan, Coordinates } from '../types';

interface UseChatbotOptions {
    category: Category;
    preSelectedArtisan?: Artisan;
    userLocation?: Coordinates | null;
    onSubmit: (order: Order) => Promise<void>;
    showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
    onClose: () => void;
}

let msgCounter = 0;
const newId = () => `msg-${++msgCounter}`;

function botTextMessage(text: string): ChatMessage {
    return { id: newId(), role: 'bot', type: 'text', text };
}

const ORDER_CHANGE_KEYWORDS = ['finalement', 'plutôt', 'non', 'changeons', 'annule', 'autre chose', 'je me suis trompé'];

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64String = reader.result as string;
            resolve(base64String.split(',')[1]);
        };
        reader.onerror = error => reject(error);
    });
};

export function useChatbot({
    category,
    preSelectedArtisan,
    userLocation,
    onSubmit,
    showToast,
    onClose,
}: UseChatbotOptions) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [askForPhoto, setAskForPhoto] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [orderReady, setOrderReady] = useState(false);
    const [orderTitle, setOrderTitle] = useState('');
    const [orderDescription, setOrderDescription] = useState('');
    const [userPhoto, setUserPhoto] = useState<string | null>(null);
    const [isPublishing, setIsPublishing] = useState(false);

    const addMessage = (msg: ChatMessage) =>
        setMessages((prev) => [...prev, msg]);

    // ─── Handle Unified Backend Response ────────────────────────────────────

    const handleBackendResponse = useCallback((response: ChatResponse) => {
        if (!response.success) {
            addMessage(botTextMessage(response.reply || "Une erreur est survenue, veuillez réessayer."));
            return;
        }

        // 1. Add Text Message
        addMessage({
            id: newId(),
            role: 'bot',
            type: 'text',
            text: response.reply,
            suggestions: response.suggestions,
            isPhotoError: response.askForPhoto, // Re-enable retry button
        });

        // 2. Handle Image Generation
        if (response.imageUrl) {
            setGeneratedImage(response.imageUrl);
            addMessage({
                id: newId(),
                role: 'bot',
                type: 'image',
                imageUrl: response.imageUrl,
            });
        }

        // 3. Handle Ask For Photo
        if (response.askForPhoto) {
            setAskForPhoto(true);
        }

        // 4. Handle Order Ready
        if (response.orderReady && response.order) {
            setOrderReady(true);
            setOrderTitle(response.order.title || '');
            setOrderDescription(response.order.description || '');
        }
    }, []);

    // ─── Send Text ──────────────────────────────────────────────────────────

    const handleSendMessage = useCallback(
        async (text: string) => {
            if (!text.trim() || isLoading) return;

            addMessage({ id: newId(), role: 'user', type: 'text', text });
            setIsLoading(true);

            try {
                // Check if the user is changing their mind
                const lowerText = text.toLowerCase();
                const isChangingOrder = ORDER_CHANGE_KEYWORDS.some(kw => lowerText.includes(kw));

                const payloadText = isChangingOrder
                    ? `Nouvelle commande. Oublie la conversation précédente.\n\n${text}`
                    : text;

                const response = await aiService.sendMessage(payloadText);
                handleBackendResponse(response);
            } catch (err) {
                console.error('[useChatbot] sendMessage error:', err);
                addMessage(botTextMessage('Une erreur est survenue, veuillez réessayer.'));
            } finally {
                setIsLoading(false);
            }
        },
        [isLoading, handleBackendResponse]
    );

    // ─── Send Photo ─────────────────────────────────────────────────────────

    const handleSendPhoto = useCallback(
        async (file: File) => {
            if (isLoading) return;
            setAskForPhoto(false);

            // Show preview in UI
            const previewUrl = URL.createObjectURL(file);
            addMessage({ id: newId(), role: 'user', type: 'image', imageUrl: previewUrl });

            setIsLoading(true);

            try {
                const base64 = await fileToBase64(file);
                setUserPhoto(base64);

                const response = await aiService.sendMessage('Voici ma photo.', base64);
                handleBackendResponse(response);
            } catch (err) {
                console.error('[useChatbot] sendPhoto error:', err);
                addMessage(botTextMessage('Une erreur est survenue avec la photo. Veuillez réessayer.'));
            } finally {
                setIsLoading(false);
            }
        },
        [isLoading, handleBackendResponse]
    );

    // ─── Start (called with initial description) ────────────────────────────

    const startChatbot = useCallback(
        async (description: string) => {
            const firstMessage = `[Catégorie choisie par l'utilisateur dans l'app: ${category.name}]\nDescription: ${description}`;
            addMessage({ id: newId(), role: 'user', type: 'text', text: description });
            setIsLoading(true);

            try {
                const response = await aiService.sendMessage(firstMessage);
                handleBackendResponse(response);
            } catch (err) {
                console.error('[useChatbot] startChatbot error:', err);
                addMessage(botTextMessage('Une erreur est survenue, veuillez réessayer.'));
            } finally {
                setIsLoading(false);
            }
        },
        [category.name, handleBackendResponse]
    );

    // ─── Publish Order ──────────────────────────────────────────────────────

    const publishOrder = useCallback(async () => {
        setIsPublishing(true);
        const effectiveLocation = userLocation || MARRAKECH_CENTER;

        try {
            const orderId = `ord-${Date.now()}`;
            const imageUrls: string[] = [];

            // Upload user photo if present
            if (userPhoto) {
                try {
                    const blob = await fetch(`data:image/jpeg;base64,${userPhoto}`).then((r) => r.blob());
                    const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
                    const url = await uploadToSupabase('vork-profilepic-bucket', `orders/${orderId}/user_photo.jpg`, file);
                    imageUrls.push(url);
                } catch (e) {
                    console.warn('Photo upload failed, continuing without it:', e);
                }
            }

            // Upload generated image if present
            if (generatedImage) {
                try {
                    const blob = await fetch(generatedImage).then((r) => r.blob());
                    const file = new File([blob], `generated_${Date.now()}.png`, { type: 'image/png' });
                    const url = await uploadToSupabase('vork-profilepic-bucket', `orders/${orderId}/generated.png`, file);
                    imageUrls.push(url);
                } catch (e) {
                    console.warn('Generated image upload failed, continuing without it:', e);
                }
            }

            // Artisan matching
            let targeted: string[] = [];
            if (preSelectedArtisan) {
                targeted = [preSelectedArtisan.id];
            } else {
                targeted = await getInitialArtisans(orderId, category.name, effectiveLocation);
            }

            const city = userLocation
                ? await reverseGeocode(effectiveLocation.lat, effectiveLocation.lng)
                : 'Marrakech';

            const newOrder: Order = {
                id: orderId,
                category: category.name,
                status: "EN ATTENTE D'EXPERT",
                date: new Date().toLocaleString('fr-FR', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                }),
                description: orderDescription,
                title: orderTitle,
                location: userLocation ? 'Ma position actuelle' : 'Marrakech, Centre',
                locationCoords: effectiveLocation,
                city,
                responses: [],
                images: imageUrls,
                targetedArtisans: targeted,
                isDirect: !!preSelectedArtisan,
                contactedArtisanIds: targeted,
                currentRadius: 1,
                rejectedArtisanIds: [],
            };

            await onSubmit(newOrder);

            await aiService.resetSession();
            setMessages([]);
            onClose();
            showToast('Demande publiée avec succès !', 'success');

        } catch (err) {
            console.error('[useChatbot] publishOrder error:', err);
            showToast('Erreur lors de la publication.', 'error');
        } finally {
            setIsPublishing(false);
        }
    }, [
        userLocation, userPhoto, generatedImage, preSelectedArtisan,
        category.name, orderDescription, orderTitle, onSubmit, showToast, onClose
    ]);

    return {
        messages,
        isLoading,
        isPublishing,
        isGeneratingImage: false, // Image generation is internal now
        askForPhoto,
        userPhoto,
        generatedImage,
        orderReady,
        orderTitle,
        orderDescription,
        setOrderTitle,
        setOrderDescription,
        startChatbot,
        handleSendMessage,
        handleSendPhoto,
        publishOrder,
    };
}
