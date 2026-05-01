/**
 * Client-side utilities for image processing before sending to the backend.
 * Actual image generation is now handled entirely by the Express backend.
 */

/**
 * Reads a File as base64 string (without data: prefix).
 * Used to send the user's photo to the backend for LLM analysis and flux-2-dev processing.
 */
export function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
