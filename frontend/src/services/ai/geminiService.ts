import type { GeminiResponse } from '../../types';

// The sessionId is now passed dynamically from the UI, usually matching the authenticated user's ID.
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export const ORDER_CHANGE_KEYWORDS = [
  "finalement", "non plutôt", "oublie", "autre chose", "en fait", "non c'est pas ça"
];

/**
 * Shared mapping from the clean backend shape into the legacy GeminiResponse shape.
 * The image generation is now fully handled by the backend —
 * `json.imageUrl` is the ready result (or null). No Cloudflare calls needed from frontend.
 */
function mapBackendResponse(json: any): any {
  return {
    message_to_user:    json.reply,
    suggestion:         json.suggestions ? json.suggestions.join('|') : null,
    order_ready:        json.orderReady,
    order_title:        json.order?.title || null,
    order_description:  json.order?.description || null,
    clarity_score:      json.sessionState?.clarityScore || 0,

    // Image — backend queued a job and flagged it
    isImagePending:     json.isImagePending ?? false,
    imageUrl:           json.imageUrl || null,

    // Photo flow
    ask_for_photo:      json.askForPhoto ?? false,
    photo_quality:      null,
  } as any;
}

/**
 * Sends a text message to our modular Vork Backend.
 */
export async function sendMessage(text: string, sessionId: string): Promise<any> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        message: text,
      }),
    });

    if (!response.ok) throw new Error(`Backend error: ${response.status}`);
    const json = await response.json();
    return mapBackendResponse(json);

  } catch (err) {
    console.error('[geminiService] sendMessage failed:', err);
    throw err;
  }
}

/**
 * Sends a message with a photo.
 * The backend stores the photo in session for potential flux-2-dev use.
 */
export async function sendMessageWithPhoto(
  text: string,
  base64: string,
  sessionId: string
): Promise<any> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        message: text || "Analyse cette photo.",
        photo: base64
      }),
    });

    if (!response.ok) throw new Error(`Backend error: ${response.status}`);
    const json = await response.json();
    return mapBackendResponse(json);

  } catch (err) {
    console.error('[geminiService] sendMessageWithPhoto failed:', err);
    throw err;
  }
}

/**
 * Resets context for a new order.
 * Instructs the backend to delete the active session, clearing LLM conversation history.
 */
export async function resetSession(sessionId: string): Promise<void> {
  try {
    await fetch(`${BACKEND_URL}/api/chat/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });
    console.log("[geminiService] Backend session history completely wiped.");
  } catch (err) {
    console.error("[geminiService] Failed to reset backend session:", err);
  }
}

/**
 * Calls the backend to run the pending image generation job stored in session.
 * This should be called after /api/chat returns isImagePending:true.
 * Returns the base64 imageUrl or null on failure.
 */
export async function fetchGeneratedImage(sessionId: string): Promise<string | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/generate-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });

    if (!response.ok) {
      console.error('[geminiService] Image generation failed:', response.status);
      return null;
    }

    const json = await response.json();
    return json.imageUrl || null;
  } catch (err) {
    console.error('[geminiService] fetchGeneratedImage failed:', err);
    return null;
  }
}
