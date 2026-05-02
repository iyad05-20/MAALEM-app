import path from 'path';
import { fileURLToPath } from 'url';

// ESM-compatible __dirname replacement
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Absolute path to the categories data folder.
 * Migration to DB planned post-category-study.
 */
export const DATA_DIR = path.join(__dirname, '..', 'data', 'categories');

/**
 * LLM Configuration
 */
export const LLM_MODEL = 'llama-3.3-70b-versatile';
export const LLM_MAX_TOKENS = 1000;
export const LLM_TEMPERATURE = 0.7;

/**
 * Session Configuration
 */
export const SESSION_TTL_MS = 30 * 60 * 1000;        // 30 minutes inactivity
export const SESSION_CLEANUP_INTERVAL_MS = 10 * 60 * 1000; // Cleanup every 10 minutes
export const SESSION_MAX_TURNS = 6;                   // Max conversation turns kept in history
