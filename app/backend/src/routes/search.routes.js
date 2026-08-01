import express from 'express';
import { seedSearchIndexOnce } from '../services/search/meilisearch.service.js';

const router = express.Router();
const SEARCH_KEY = process.env.MEILI_SEARCH_KEY || process.env.MEILI_MASTER_KEY || 'dev_only_key_change_in_prod';

/**
 * Route GET /api/search/key (and /api/search/search-key)
 * Resolves search-only key to frontend, and starts background index self-healing check.
 */
const keyHandler = (req, res) => {
  if (!SEARCH_KEY) {
    console.error('❌ MEILI_SEARCH_KEY environment variable is not configured on the backend.');
    return res.status(500).json({ error: 'Search key configuration missing on server' });
  }

  // 1. Return the key immediately for minimal search delay
  res.json({ searchKey: SEARCH_KEY });

  // 2. Run deduplicated index verify & seed check in background
  seedSearchIndexOnce().catch(err => {
    console.error('⚠️ On-demand search engine background seeding failed:', err.message);
  });
};

router.get('/key', keyHandler);
router.get('/search-key', keyHandler);

export default router;
