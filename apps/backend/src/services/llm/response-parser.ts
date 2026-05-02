export function parseVorkResponse(rawText: string): Record<string, any> {
  let parsed: Record<string, any>;

  try {
    const firstBrace = rawText.indexOf('{');
    const lastBrace = rawText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const jsonStr = rawText.substring(firstBrace, lastBrace + 1);
      parsed = JSON.parse(jsonStr);
    } else {
      const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleaned);
    }
  } catch (e) {
    throw new Error('parse_error');
  }

  // Normalize suggestion field
  if (Array.isArray(parsed.suggestion)) {
    parsed.suggestion = parsed.suggestion.map((s: any) => String(s).trim()).filter(Boolean);
  } else if (typeof parsed.suggestion === 'string') {
    parsed.suggestion = parsed.suggestion.split('|').map((s: string) => s.trim()).filter(Boolean);
  } else {
    parsed.suggestion = null;
  }

  if (parsed.suggestion && parsed.suggestion.length === 0) {
    parsed.suggestion = null;
  }

  // FAILSAFE: ask_for_photo=true → suggestion must be null
  if (parsed.ask_for_photo === true) {
    parsed.suggestion = null;
  }

  // NORMALIZE image_prompt: LLaMA sometimes returns it as an object, not a string
  if (parsed.image_prompt && typeof parsed.image_prompt === 'object') {
    parsed.image_prompt = JSON.stringify(parsed.image_prompt);
  }

  // FAILSAFE: needs_image_gen=true but missing required fields → disable
  if (parsed.needs_image_gen && (!parsed.image_prompt || !parsed.model)) {
    console.warn('[response-parser] needs_image_gen=true but image_prompt or model is missing — forcing false');
    parsed.needs_image_gen = false;
  }

  return parsed;
}

export function buildFallbackResponse(reasonText: string) {
  return {
    success: false,
    error: 'Fallback response due to error or quota',
    fallback: {
      clarity_score: 5,
      has_user_photo: false,
      photo_quality: null,
      photo_sufficient: null,
      ask_for_photo: false,
      needs_image_gen: false,
      image_gen_purpose: null,
      model: null,
      image_prompt: null,
      image_steps: null,
      order_ready: false,
      order_title: null,
      order_description: null,
      risk_level: 'none',
      safety_warning: null,
      category_valid: true,
      suggested_category: null,
      multi_order_detected: false,
      pending_orders: null,
      order_sequence: null,
      reason: reasonText,
      suggestion: 'Continuer | Réessayer plus tard',
      message_to_user:
        "Je reçois beaucoup de demandes en ce moment ! 👷 On peut continuer, mais je serai un peu plus lent à traiter les images.",
    },
  };
}
