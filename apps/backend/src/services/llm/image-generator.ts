/**
 * image-generator.ts
 * Internal module — NOT a route. Called directly by llm-caller.ts.
 * Handles Cloudflare Workers AI image generation.
 * Provider: flux-1-schnell (text-to-image) | flux-2-dev (image-to-image)
 */

interface GenerateImageParams {
  prompt: string;
  model: 'flux-1-schnell' | 'flux-2-dev';
  steps: number;
  userPhoto: string | null; // base64 jpeg, required for flux-2-dev
}

/**
 * Generates an image using Cloudflare Workers AI.
 * Returns a base64 data URL (data:image/png;base64,...).
 */
export async function generateImage({ prompt, model, steps, userPhoto }: GenerateImageParams): Promise<string> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken) {
    throw new Error('[image-generator] CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN is missing');
  }

  const modelPath = model === 'flux-2-dev'
    ? '@cf/black-forest-labs/flux-2-dev'
    : '@cf/black-forest-labs/flux-1-schnell';

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${modelPath}`;

  // Build the request body based on the model
  const body: Record<string, any> = {
    prompt,
    num_steps: steps,
  };

  // flux-2-dev supports image-to-image when a user photo is provided
  if (model === 'flux-2-dev' && userPhoto) {
    body.image = userPhoto; // base64 JPEG string
  }

  console.log(`[image-generator] Calling Cloudflare AI: model=${model}, steps=${steps}`);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const contentType = response.headers.get('content-type') || '';
  
  let base64 = '';
  if (contentType.includes('application/json')) {
    // Cloudflare returned a JSON wrapper
    const json = await response.json() as any;
    if (json.result && json.result.image) {
      base64 = json.result.image;
    } else {
      throw new Error(`[image-generator] Unexpected JSON format from Cloudflare: ${JSON.stringify(json).substring(0, 100)}...`);
    }
  } else {
    // Cloudflare returned raw image bytes
    const buffer = await response.arrayBuffer();
    base64 = Buffer.from(buffer).toString('base64');
    console.log(`[image-generator] Raw image bytes received (${Math.round(buffer.byteLength / 1024)} KB)`);
  }

  const dataUrl = `data:image/png;base64,${base64}`;
  console.log(`[image-generator] Image generated successfully`);
  return dataUrl;
}
