/**
 * src/services/llm/promptBuilder.js
 * ═══════════════════════════════════════════════════════════════════════
 * Adaptive Prompt Builder System
 * Implements the 4-level progressive constraint strategy.
 * Separated from the image generation caller logic.
 * ═══════════════════════════════════════════════════════════════════════
 */

/**
 * Generates an adaptive prompt based on the requested level (V1-V4).
 * 
 * @param {Object} params
 * @param {string} params.baseContext - The general environment/context to preserve.
 * @param {string} params.targetFeature - The specific feature to change (e.g., "color", "shape").
 * @param {string} params.targetValue - The new value (e.g., "square", "deep green").
 * @param {string} params.visualDecomposition - Detailed visual properties (used in V3/V4).
 * @param {string} params.preservedProperties - List of properties to explicitly preserve.
 * @param {string} params.level - 'V1', 'V2', 'V3', or 'V4'.
 * @returns {string} The constructed prompt.
 */
export function buildAdaptivePrompt({
  baseContext,
  targetFeature,
  targetValue,
  visualDecomposition,
  preservedProperties,
  level
}) {
  const preservationText = `Preserve the original ${preservedProperties}.`;

  switch (level) {
    case 'V1':
      // Direct formulation
      return `${baseContext} Change the ${targetFeature} to ${targetValue}. ${preservationText}`;

    case 'V2':
      // Explicit target-first prompting
      return `Change the ${targetFeature} into a clearly recognizable ${targetValue}. ${baseContext} ${preservationText}`;

    case 'V3':
      // Semantic Reinforcement
      return `Change only the ${targetFeature}. Create a ${visualDecomposition}. ${baseContext} ${preservationText}`;

    case 'V4':
      // Strong Constraint & Semantic Negation
      return `The primary and only structural change is the ${targetFeature}. It must be an unmistakably ${targetValue}: ${visualDecomposition}. ${baseContext} ${preservationText} Do not alter any other major visual property of the scene.`;

    default:
      throw new Error(`Unknown prompt level: ${level}`);
  }
}
