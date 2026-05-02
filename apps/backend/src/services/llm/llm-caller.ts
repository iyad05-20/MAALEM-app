import Groq from 'groq-sdk';
import { buildSystemPrompt } from './prompt-builder.js';
import { sessionManager } from './session-manager.js';
import { loadCategoryData } from './category-loader.js';
import { parseVorkResponse, buildFallbackResponse } from './response-parser.js';
import { generateImage } from './image-generator.js';
import { LLM_MODEL, LLM_MAX_TOKENS, LLM_TEMPERATURE } from '../../config/constants.js';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CallLLMParams {
  sessionId: string;
  message: string;
  photo?: string | null; // base64 JPEG from frontend
}

// ─── Groq client (lazy init, singleton) ─────────────────────────────────────

let groqClient: Groq | null = null;

function getGroqClient(): Groq {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('[llm-caller] GROQ_API_KEY environment variable is missing');
  }
  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

// ─── Category detection (Turn 1 only) ────────────────────────────────────────

const VALID_CATEGORIES = ['plomberie', 'electricite', 'zellij', 'gypse', 'maconnerie', 'menuiserie', 'jardinage', 'nettoyage', 'technicien'];

async function detectCategory(message: string): Promise<string> {
  const client = getGroqClient();
  const detectPrompt = `One word only from this list: [${VALID_CATEGORIES.join(', ')}, inconnu]\nMessage: "${message}"`;

  const response = await client.chat.completions.create({
    model: LLM_MODEL,
    temperature: 0.1,
    max_tokens: 10,
    messages: [{ role: 'user', content: detectPrompt }],
  });

  const tokens = response.usage?.total_tokens || 0;
  console.log(`[DEBUG-TOKEN] Step A (Detect Category) => ${tokens} tokens`);

  const raw = response.choices[0]?.message?.content?.trim().toLowerCase() || 'inconnu';
  return raw.replace(/[^a-z]/g, ''); // strip punctuation LLaMA may add
}

// ─── R12: Regen keywords ──────────────────────────────────────────────────────

const REGEN_KEYWORDS = ['génère une autre', 'refais', "je n'aime pas", 'nouvelle image', 'autre simulation', 'essaie encore'];

// ─── Public API ───────────────────────────────────────────────────────────────

export function resetSession(sessionId: string): boolean {
  return sessionManager.delete(sessionId);
}

export function getSession(sessionId: string) {
  return sessionManager.get(sessionId);
}

export async function callLLM({ sessionId, message, photo }: CallLLMParams) {
  const client = getGroqClient();

  try {
    const session = sessionManager.getOrCreate(sessionId);

    // ── Turn 1: detect category and load JSON data ──────────────────────────
    if (!session.category) {
      const category = await detectCategory(message);
      if (category !== 'inconnu' && VALID_CATEGORIES.includes(category)) {
        const categoryData = loadCategoryData(category);
        if (!categoryData.error) {
          sessionManager.update(sessionId, { category, categoryData });
        }
      }
    }

    // ── Photo handling ──────────────────────────────────────────────────────
    let userText = message;
    if (photo) {
      userText += '\n[System: User has uploaded a photo.]';
      sessionManager.update(sessionId, { photoProvided: true, userPhotoBase64: photo });
    } else if (session.lastResponse?.ask_for_photo) {
      sessionManager.update(sessionId, { photoDeclined: true });
    }

    // ── Determine if image gen context is relevant ──────────────────────────
    let isUrgent = false;
    let isImageGenCategory = false;

    if (session.categoryData) {
      if (Array.isArray(session.categoryData.urgency_signals)) {
        const lowerMsg = userText.toLowerCase();
        isUrgent = session.categoryData.urgency_signals.some((signal: string) =>
          lowerMsg.includes(signal.toLowerCase())
        );
      }
      const imgTypes = ['renovation', 'construction', 'traditional_craft'];
      isImageGenCategory =
        imgTypes.includes(session.categoryData.type) ||
        Array.isArray(session.categoryData.renovation_questions);
    }

    const shouldIncludeImageGen = isImageGenCategory || session.photoDeclined || session.photoProvided;

    // ── Build system prompt ─────────────────────────────────────────────────
    const systemPrompt = buildSystemPrompt({
      includeCategory: !!session.categoryData,
      categoryData: session.categoryData,
      includeImageGen: shouldIncludeImageGen,
      includeUrgency: isUrgent,
      photoDeclined: session.photoDeclined || false,
    });

    sessionManager.addMessage(sessionId, 'user', userText);

    // ── Main Groq LLM call ──────────────────────────────────────────────────
    const response = await client.chat.completions.create({
      model: LLM_MODEL,
      temperature: LLM_TEMPERATURE,
      max_tokens: LLM_MAX_TOKENS,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        ...session.history,
      ],
    });

    const usage = response.usage;
    console.log(
      `[DEBUG-TOKEN] Step B (Main Chat) => Input: ${usage?.prompt_tokens || 0}, Output: ${usage?.completion_tokens || 0}, Total: ${usage?.total_tokens || 0}`
    );

    const rawText = response.choices[0]?.message?.content || '';

    // ── Parse response ──────────────────────────────────────────────────────
    let parsed: Record<string, any>;
    try {
      parsed = parseVorkResponse(rawText);
      console.log('\n[DEBUG] EXACT LLM JSON OUTPUT:\n', JSON.stringify(parsed, null, 2), '\n');
    } catch (e) {
      console.error('[llm-caller] Failed to parse JSON:', rawText);
      return buildFallbackResponse('parse_error');
    }

    // ── Update session state ────────────────────────────────────────────────
    sessionManager.update(sessionId, {
      needsImageGen: parsed.needs_image_gen || false,
      orderReady: parsed.order_ready || false,
      lastResponse: parsed,
    });

    sessionManager.addMessage(sessionId, 'assistant', JSON.stringify(parsed));

    // ── R12 Image Generation Guard ──────────────────────────────────────────
    // image-generator is called internally.
    let imageUrl: string | null = null;

    const userWantsRegen = REGEN_KEYWORDS.some((kw) => message.toLowerCase().includes(kw));
    const imageAlreadyGenerated = !!session.imageGeneratedForOrder;

    if (parsed.needs_image_gen && parsed.image_prompt && parsed.model) {
      if (imageAlreadyGenerated && !userWantsRegen) {
        console.log('[llm-caller] Skipping duplicate image gen (R12 guard active)');
      } else {
        const userPhoto = parsed.model === 'flux-2-dev' ? (session.userPhotoBase64 || null) : null;
        // Silently downgrade flux-2-dev to schnell if no user photo is available
        const resolvedModel = parsed.model === 'flux-2-dev' && !userPhoto ? 'flux-1-schnell' : parsed.model;
        const resolvedSteps = resolvedModel === 'flux-2-dev' ? 20 : 8;

        try {
          console.log(`[llm-caller] Generating image inline: model=${resolvedModel}, steps=${resolvedSteps}`);
          imageUrl = await generateImage({
            prompt: parsed.image_prompt,
            model: resolvedModel as 'flux-1-schnell' | 'flux-2-dev',
            steps: resolvedSteps,
            userPhoto,
          });
          sessionManager.update(sessionId, { imageGeneratedForOrder: true });
        } catch (err) {
          console.error('[llm-caller] Inline image generation failed:', err);
          // We don't throw here; we still want to return the LLM's text reply.
        }
      }
    }

    // ── Return standard response contract ───────────────────────────────────
    return {
      success: true,
      reply: parsed.message_to_user,
      suggestions: parsed.suggestion,
      askForPhoto: !!parsed.ask_for_photo,
      imageUrl,
      orderReady: !!parsed.order_ready,
      order: parsed.order_ready
        ? { title: parsed.order_title || null, description: parsed.order_description || null }
        : null,
      sessionState: {
        category: session.category || null,
        clarityScore: parsed.clarity_score || 0,
        turns: Math.floor(session.history.length / 2),
      },
    };
  } catch (err: any) {
    console.error('[llm-caller] Error:', err);
    const reason = err?.status === 429 ? 'quota' : 'network_error';
    return buildFallbackResponse(reason);
  }
}

