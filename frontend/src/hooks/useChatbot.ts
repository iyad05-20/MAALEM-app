import { useState, useCallback, useRef } from 'react';
import { ChatMessage, GeminiResponse, Order } from '../types';
import { sendMessage, sendMessageWithPhoto, resetSession, fetchGeneratedImage, ORDER_CHANGE_KEYWORDS } from '../services/ai/geminiService';
import { fileToBase64 } from '../services/ai/imageGenService';
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
    sessionId: string;
}

let msgCounter = 0;
const newId = () => `msg-${++msgCounter}`;

function botTextMessage(text: string): ChatMessage {
    return { id: newId(), role: 'bot', type: 'text', text };
}

export function useChatbot({
    category,
    preSelectedArtisan,
    userLocation,
    onSubmit,
    showToast,
    onClose,
    sessionId,
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
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    // Multi-order tracking
    const [pendingOrders, setPendingOrders] = useState<string[] | null>(null);
    const [orderSequence, setOrderSequence] = useState<'first' | 'second' | null>(null);

    const imageGenTriggeredRef = useRef(false);

    const addMessage = (msg: ChatMessage) =>
        setMessages((prev) => [...prev, msg]);

    // ─── Handle Gemini Response ─────────────────────────────────────────────

    const handleGeminiResponse = useCallback(
        async (json: GeminiResponse) => {
            // 1. Parse suggestions (pipe-separated)
            const suggestions = json.suggestion
                ? json.suggestion.split('|').map((s) => s.trim()).filter(Boolean)
                : undefined;

            // 2. Add message with suggestions (Fixes two-bubble bug)
            addMessage({
                id: newId(),
                role: 'bot',
                type: 'text',
                text: json.message_to_user,
                suggestions,
                isPhotoError: json.photo_quality === 'bad',
                safetyWarning: json.safety_warning,
                riskLevel: json.risk_level
            });

            // Request photo upload button — now driven by backend's ask_for_photo field
            if (json.ask_for_photo) {
                setAskForPhoto(true);
            }

            // Image pending: backend queued a job, fetch it asynchronously
            if (json.isImagePending && !imageGenTriggeredRef.current) {
                imageGenTriggeredRef.current = true;
                setIsGeneratingImage(true);
                // Add a loading placeholder bubble
                const loadingId = newId();
                addMessage({ id: loadingId, role: 'bot', type: 'text', text: '🎨 Génération de la simulation en cours...' });

                // Fire and forget — doesn't block the chat
                fetchGeneratedImage(sessionId).then((imageUrl) => {
                    setIsGeneratingImage(false);
                    if (imageUrl) {
                        setGeneratedImage(imageUrl);
                        // Replace loader bubble with real image bubble
                        setMessages((prev) => prev
                            .filter((m) => m.id !== loadingId)
                            .concat({ id: newId(), role: 'bot', type: 'image', imageUrl })
                        );
                    } else {
                        // Replace loader bubble with error bubble
                        setMessages((prev) => prev
                            .filter((m) => m.id !== loadingId)
                            .concat({ id: newId(), role: 'bot', type: 'text', text: '⚠️ Oups, je n\'ai pas pu générer l\'image cette fois-ci.' })
                        );
                    }
                });
            }

            // Order ready
            if (json.order_ready) {
                setOrderReady(true);
                setOrderTitle(json.order_title ?? '');
                setOrderDescription(json.order_description ?? '');
            }

            // Track multi-order state
            if (json.multi_order_detected) {
                setPendingOrders(json.pending_orders);
                setOrderSequence(json.order_sequence);
            }

            // If invalid category and user hasn't forced it, stop here
            if (!json.category_valid && json.suggested_category) {
                // The bot message already explains this and suggests changing category.
                // We'll intercept the user's specific chip choice if they pick "Changer de catégorie".
            }
        },
        [],
    );

    // ─── Send Text ──────────────────────────────────────────────────────────

    const handleSendMessage = useCallback(
        async (text: string) => {
            if (!text.trim() || isLoading) return;

            // Intercept category rejection if user taps "Changer de catégorie"
            // Let the UI handle closing, we don't send this to Gemini
            if (text === "Changer de catégorie") {
                resetSession(sessionId); // Clear backend session state
                onClose();
                return;
            }

            addMessage({ id: newId(), role: 'user', type: 'text', text });
            setIsLoading(true);
            imageGenTriggeredRef.current = false;

            try {
                // Check if the user is changing their mind (e.g. "finalement, ...")
                const lowerText = text.toLowerCase();
                const isChangingOrder = ORDER_CHANGE_KEYWORDS.some(kw => lowerText.includes(kw));

                // If changing order, send the reset instruction to Gemini before the real message
                const payloadText = isChangingOrder
                    ? `Nouvelle commande. Oublie la conversation précédente.\n\n${text}`
                    : text;

                const json = await sendMessage(payloadText, sessionId);
                await handleGeminiResponse(json);
            } catch (err) {
                console.error('[useChatbot] sendMessage error:', err);
                addMessage(botTextMessage('Une erreur est survenue, veuillez réessayer.'));
            } finally {
                setIsLoading(false);
            }
        },
        [isLoading, handleGeminiResponse, onClose],
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
            imageGenTriggeredRef.current = false;

            try {
                // Read original photo for LLM and backend processing (no frontend resize needed)
                const originalBase64 = await fileToBase64(file);
                setUserPhoto(originalBase64);

                const json = await sendMessageWithPhoto('Voici ma photo.', originalBase64, sessionId);
                await handleGeminiResponse(json);
            } catch (err) {
                console.error('[useChatbot] sendPhoto error:', err);
                addMessage(botTextMessage('Une erreur est survenue avec la photo. Veuillez réessayer.'));
            } finally {
                setIsLoading(false);
            }
        },
        [isLoading, handleGeminiResponse],
    );

    // ─── Start (called with initial description) ────────────────────────────

    const startChatbot = useCallback(
        async (description: string) => {
            imageGenTriggeredRef.current = false;
            const firstMessage = `[Catégorie choisie par l'utilisateur dans l'app: ${category.name}]\nDescription: ${description}`;
            addMessage({ id: newId(), role: 'user', type: 'text', text: description });
            setIsLoading(true);

            try {
                const json = await sendMessage(firstMessage, sessionId);
                await handleGeminiResponse(json);
            } catch (err) {
                console.error('[useChatbot] startChatbot error:', err);
                addMessage(botTextMessage('Une erreur est survenue, veuillez réessayer.'));
            } finally {
                setIsLoading(false);
            }
        },
        [category.name, handleGeminiResponse],
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
                    console.error('Photo upload failed:', e);
                    throw new Error('Erreur lors du téléchargement de votre photo. Veuillez réessayer.');
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
                    console.error('Generated image upload failed:', e);
                    throw new Error('Erreur lors de l\'enregistrement de la simulation. Veuillez réessayer.');
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

            // Reset order-specific state but NOT messages (for continuity)
            setGeneratedImage(null);
            setOrderReady(false);
            setOrderTitle('');
            setOrderDescription('');
            setUserPhoto(null);
            setAskForPhoto(false);
            imageGenTriggeredRef.current = false;

            showToast('Demande publiée avec succès !', 'success');

            // Multi-order transition: if this was the first order, auto-kick off the second
            if (orderSequence === 'first' && pendingOrders && pendingOrders.length >= 2) {
                const secondOrderName = pendingOrders[1];
                setOrderSequence('second');
                setPendingOrders(null);
                setMessages([]);
                setIsLoading(true);
                try {
                    // Tell Gemini to start the second order
                    const transitionMsg = `[Transition automatique vers la deuxième demande: ${secondOrderName}]`;
                    const json = await sendMessage(transitionMsg, sessionId);
                    await handleGeminiResponse(json);
                } catch (err) {
                    console.error('[useChatbot] multi-order transition error:', err);
                    addMessage(botTextMessage('Une erreur est survenue lors du passage à la deuxième demande.'));
                } finally {
                    setIsLoading(false);
                }
                return; // Don't close the chatbot
            }

            // Single order or second order done — reset session and close
            await resetSession(sessionId);
            setMessages([]);
            setPendingOrders(null);
            setOrderSequence(null);
            onClose();
        } catch (err: any) {
            console.error('[useChatbot] publishOrder error:', err);
            const errorMessage = err?.message || 'Erreur lors de la publication.';
            showToast(errorMessage, 'error');
        } finally {
            setIsPublishing(false);
        }
    }, [
        userLocation, userPhoto, generatedImage, preSelectedArtisan,
        category.name, orderDescription, orderTitle, onSubmit, showToast, onClose,
        orderSequence, pendingOrders, handleGeminiResponse, sessionId,
    ]);

    return {
        messages,
        isLoading,
        isPublishing,
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
