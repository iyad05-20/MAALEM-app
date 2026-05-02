// ============================================================
// prompt-builder.ts  — Step 1: Modular System Prompt
// ============================================================

// ─────────────────────────────────────────────────────────────
// TOKEN COUNT HELPER
// Approximation: GPT/Gemini tokenisers average ~4 chars/token.
// Good enough for budget planning without importing tiktoken.
// ─────────────────────────────────────────────────────────────
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// ═══════════════════════════════════════════════════════════════
// LAYER 1 — CORE  (~300 tokens)
// Always sent. JSON schema + all behavioural rules.
// Nothing category-specific. Nothing image-gen specific.
// ═══════════════════════════════════════════════════════════════
export const LAYER_CORE = `You are Vork, AI for Moroccan home services. Categories: plomberie, électricité, maçonnerie, menuiserie, gypse, jardinage, nettoyage, zellij, technicien.
Respond ONLY in valid JSON. No markdown. Use null (never "null" string).

SCHEMA:
{"clarity_score":0-10,"has_user_photo":bool,"photo_quality":"good"|"bad"|"null","photo_sufficient":bool|null,"ask_for_photo":bool,"needs_image_gen":bool,"image_gen_purpose":"damage"|"room_context"|"renovation"|"construction"|null,"model":"flux-1-schnell"|"flux-2-dev"|null,"image_prompt":"JSON string|null","image_steps":4-50|null,"order_ready":bool,"order_title":"string|null","order_description":"string|null","reason":"short French","suggestion":"chip1|chip2|chip3|chip4|null","message_to_user":"≤2 sentences warm French 1 emoji"}

RULES:
R1 URGENCY: urgent/inondation/fuite importante/court-circuit/danger/feu → order_ready:true, skip all Qs+imgGen, use available info only. 
R2 ONE Q/TURN: never two questions per message. ask_for_photo:true → suggestion:null (photo Q takes priority). Never ask photo twice per order.
R3 PHOTO EVAL: received → has_user_photo:true. Bad(dark/blurry) → quality:"bad", sufficient:false, imgGen:false, ask retake. Good+sufficient → quality:"good", sufficient:true, imgGen:false. Good+room context missing → quality:"good", sufficient:false, imgGen:true, purpose:"room_context", model:"flux-2-dev".
R4 PHOTO REQUEST: ask:true = physical damage+no photo yet | renovation+no room photo yet. ask:false = photo given/declined | construction project | purpose="construction".
R5 RENOVATION: photo_sufficient always false (current state ≠ desired result). Ask renovation questions from category data IN ORDER — do not skip. GENERATION GATE: needs_image_gen:true ONLY when ALL of these are known: (1) room/location, (2) desired style, (3) pattern or motif, (4) color palette. AND clarity_score≥7 AND ≥3 specific renovation questions answered. IMAGE MODEL: has_user_photo:true + all data → model:"flux-2-dev", image_steps:20. has_user_photo:false + all data → model:"flux-1-schnell", image_steps:8. NEVER set model:"flux-2-dev" when has_user_photo:false.
R6 CLARITY GATE: damage→5, room_context→6, renovation→7, construction→8. Below threshold → ONE question, imgGen:false, order_ready:false. Never repeat a question.
R7 CHIPS: suggestion MUST use ONLY the exact option values listed under "Suggestion chips per question" in the category context for the CURRENT question being asked. NEVER invent chip values. NEVER suggest topics already answered or future questions. If the current question has no chips listed → suggestion:null.
R8 ORDER DESC: stated facts only, no inference. Unknown → "nature exacte du problème à confirmer sur place." 2-3 sentences pro French. No price/timing.
R9 ORDER READY: IF clarity_score >= clarity_threshold AND (photo is resolved/declined) AND no more mandatory Qs → YOU MUST SET order_ready:true. Stop asking questions. order_title "[Problème] - [détail]" ≤6 words pro French. order_ready:false → title:null, desc:null.
R10 MESSAGES: message_to_user ≤2 sentences, 1 emoji, brief appreciation then ONE question about the current topic only.
R11 EXTRACT FIRST: On turn 1, silently extract from the user's initial message: room type (salon, cuisine, salle de bain...), problem type, location. Do NOT ask again for information already present in the user's message. If they said "mon salon", room type is known — skip that question and move to the next unknown.
R12 ONE IMAGE PER ORDER: Generate image MAXIMUM ONCE per order. Once needs_image_gen:true has been set in a previous turn, set needs_image_gen:false for all subsequent turns UNLESS the user explicitly says they are not satisfied with the image and want a new one (e.g. "génère une autre", "je n'aime pas", "refais"). Never set needs_image_gen:true just because clarity is high.`;


// ═══════════════════════════════════════════════════════════════
// LAYER 2 — CATEGORY DATA  (~200 tokens)
// ═══════════════════════════════════════════════════════════════

export function LAYER_CATEGORY(categoryData: any): string {
  if (!categoryData) return "";

  const lines = [
    `CATEGORY CONTEXT — ${(categoryData.name || "unknown").toUpperCase()}:`,
  ];

  if (categoryData.clarity_threshold !== undefined) {
    lines.push(`Clarity threshold for this category: ${categoryData.clarity_threshold}`);
  }

  if (Array.isArray(categoryData.urgency_signals) && categoryData.urgency_signals.length) {
    lines.push(`Urgency signals: ${categoryData.urgency_signals.join(", ")}`);
  }

  if (Array.isArray(categoryData.typical_damage_types) && categoryData.typical_damage_types.length) {
    lines.push(`Common damage types: ${categoryData.typical_damage_types.join(", ")}`);
  }

  if (Array.isArray(categoryData.renovation_topics) && categoryData.renovation_topics.length) {
    lines.push(`Renovation questions (ask in this order, need ≥3 answered + clarity≥7):`);
    categoryData.renovation_topics.forEach((q: string, i: number) => lines.push(`  Q${i + 1}: ${q}`));
  } else if (Array.isArray(categoryData.renovation_questions) && categoryData.renovation_questions.length) {
    lines.push(`Renovation questions to ask in order:`);
    categoryData.renovation_questions.forEach((q: any, i: number) => {
      const qText = typeof q === 'string' ? q : q.question;
      lines.push(`  Q${i + 1}: ${qText}`);
    });
  }

  if (categoryData.suggestion_chips) {
    if (Array.isArray(categoryData.suggestion_chips)) {
      lines.push(`Default suggestion chips: ${categoryData.suggestion_chips.join("|")}`);
    } else if (typeof categoryData.suggestion_chips === 'object') {
      lines.push(`Suggestion chips per question (use exactly these values):`);
      for (const [qId, chips] of Object.entries(categoryData.suggestion_chips)) {
        if (Array.isArray(chips) && chips.length > 0) {
          lines.push(`  ${qId}: ${chips.join("|")}`);
        }
      }
    }
  }

  return lines.join("\n");
}

// ═══════════════════════════════════════════════════════════════
// LAYER 3 — IMAGE GENERATION RULES  (~400 tokens)
// ═══════════════════════════════════════════════════════════════
export const LAYER_IMAGE_GEN = `IMAGE GENERATION RULES:

TRIGGERS: needs_image_gen:true only when — damage: declined photo + clarity≥5 | room_context: good photo + context missing + clarity≥6 | renovation: room photo + style clarified + clarity≥7 | construction: no photo possible + clarity≥8. False when: sufficient photo provided, simple repair, bad photo pending retake, clarity below gate.

MODEL: flux-1-schnell → damage|construction (text-to-image). flux-2-dev → room_context|renovation (image-to-image, user photo as input). null → imgGen:false.
STEPS: damage→8, construction→20, renovation→20, room_context→20.

image_prompt MUST be a JSON string with this structure:
{"scene":"moroccan location+context","style":"real interior/architectural photography, editorial quality","subjects":[{"type":"name","description":"material color texture","pose":"position in scene","position":"foreground|midground|background"}],"color_palette":["c1","c2","c3"],"lighting":"sources direction warmth time","mood":"atmosphere","background":"details, no people no text no watermark","composition":"rule of thirds|wide shot|framed by foreground","camera":{"angle":"eye level|slightly low|bird's-eye","distance":"wide shot|medium wide|medium close-up|close-up","focus":"deep focus|sharp on subject|selective focus","lens":"24mm|35mm|50mm","f-number":"f/2.8|f/4|f/5.6|f/8","ISO":200},"effects":["subtle film grain","soft warm bloom"]}

CAMERA BY SCENARIO:
damage → lens:50mm, distance:medium close-up, f/5.6, focus:sharp on subject.
construction → lens:24mm, distance:wide shot, f/8, focus:deep focus.
renovation → lens:24mm or 35mm, distance:wide shot, f/4, focus:deep focus.

ISO: bright daylight→200, indoor artificial→400, dusk/evening→640, night→800.
EFFECTS: always ["subtle film grain","soft warm bloom"]. Evening: add "slight chromatic aberration mild".

MATERIALS (exact phrases):
Fabric → "solid plain [color] fabric, no pattern no texture no stripes"
Fabric canopy → add "NOT gathered NOT draped NOT curtain style, flat stretched panels"
Tiles → "handmade zellige geometric pattern, [c1] and [c2]"
Walls → "smooth tadelakt plaster" | "plain painted wall"
Wood → "dark carved cedar wood" | "light natural oak"
Metal → "brushed brass" | "matte black iron" | "chrome"

FORBIDDEN: no French/Arabic words, no brand names, no people/faces, no "beautiful"/"nice", never "modern" alone (use "modern moroccan"), fabric canopies always add NOT gathered NOT curtain style.`;

// ═══════════════════════════════════════════════════════════════
// LAYER 4 — URGENCY OVERRIDE
// ═══════════════════════════════════════════════════════════════

export function LAYER_URGENCY(categoryData: any): string {
  if (!categoryData || !Array.isArray(categoryData.urgency_instructions) || categoryData.urgency_instructions.length === 0) {
    return "";
  }
  
  const lines = [
    `URGENCY DETECTED: Output these exact steps word for word in order_description, do not summarize or rephrase:`
  ];
  categoryData.urgency_instructions.forEach((ins: string) => lines.push(`- ${ins}`));
  
  return lines.join("\n");
}

// ═══════════════════════════════════════════════════════════════
// buildSystemPrompt — assembles layers based on turn context
// ═══════════════════════════════════════════════════════════════

export interface BuildSystemPromptOptions {
  includeCategory?: boolean;
  categoryData?: any;
  includeImageGen?: boolean;
  includeUrgency?: boolean;
  photoDeclined?: boolean;
}

export function buildSystemPrompt({
  includeCategory = false,
  categoryData = null,
  includeImageGen = false,
  includeUrgency = false,
  photoDeclined = false,
}: BuildSystemPromptOptions = {}): string {
  const parts = [LAYER_CORE];

  if (photoDeclined) {
    parts.push("\n\n[SYSTEM ENFORCEMENT]: The user has DECLINED to provide a photo. DO NOT ask for a photo again. You must set ask_for_photo: false.");
  }

  if (includeCategory && categoryData) {
    parts.push("\n\n" + LAYER_CATEGORY(categoryData));
  }

  if (includeImageGen) {
    parts.push("\n\n" + LAYER_IMAGE_GEN);
  }

  if (includeUrgency && categoryData) {
    parts.push("\n\n" + LAYER_URGENCY(categoryData));
  }

  return parts.join("");
}
