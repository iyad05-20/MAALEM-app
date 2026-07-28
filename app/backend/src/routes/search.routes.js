import express from 'express';
import client, { productsIndex } from '../services/search/meilisearch.service.js';

const router = express.Router();

// GET /api/search?q=...&category_groups=...
router.get('/', async (req, res) => {
  const query = req.query.q || '';
  const limit = parseInt(req.query.limit || '20');
  const offset = parseInt(req.query.offset || '0');
  const categoryFilter = req.query.category_groups;

  if (!query.trim() && !categoryFilter) {
    return res.json({ success: true, data: [], facets: {}, total: 0, query: '' });
  }

  const intentsIndex = client.index('search_intents');
  
  try {
    let searchOptions = {
      limit,
      offset,
      facets: ['category_group', 'rec_tags.style', 'rec_tags.material', 'rec_tags.color_vibe', 'price'],
    };

    // Helper to map facet names back to what frontend expects
    const formatResults = (results, queryStr, intentApplied = undefined) => {
      const facets = results.facetDistribution || {};
      // Map category_group back to category_groups for frontend compatibility
      if (facets.category_group) {
        facets.category_groups = facets.category_group;
        delete facets.category_group;
      }
      return {
        success: true,
        data: results.hits,
        facets: facets,
        total: results.estimatedTotalHits || results.hits.length,
        query: queryStr,
        intentApplied
      };
    };

    // If explicit filter is passed from frontend, query directly
    if (categoryFilter) {
      searchOptions.filter = `category_group = "${categoryFilter}"`;
      const results = await productsIndex.search(query, searchOptions);
      return res.json(formatResults(results, query));
    }

    // 1. Direct search
    let results = await productsIndex.search(query, searchOptions);
    
    // If we have direct results, return them
    if (results.hits.length > 0) {
      return res.json(formatResults(results, query));
    }

    // 2. No direct results -> Intent Fallback (ensure intentsIndex exists or handle gracefully)
    let intentRes = { hits: [] };
    try {
      intentRes = await intentsIndex.search(query, { limit: 1 });
    } catch (e) {
      // Intentionally ignore if intentsIndex is not yet created
    }
    
    if (intentRes.hits.length > 0) {
      const intent = intentRes.hits[0];
      const filterParts = [];

      // Primary filter: category_group is the anchor — always reliable
      if (intent.category_groups) {
        filterParts.push(`category_group = "${intent.category_groups}"`);
      } else if (intent.tags && intent.tags.length > 0) {
        // Fallback: if no category, try matching style tags
        const validStyleTags = ['traditionnel', 'berbere', 'luxe', 'artisanal', 'marocain', 'moderne', 'rustique'];
        const matchingTags = intent.tags.filter(t => validStyleTags.includes(t));
        if (matchingTags.length > 0) {
          const tagList = matchingTags.map(t => `"${t}"`).join(', ');
          filterParts.push(`rec_tags.style IN [${tagList}]`);
        }
      }

      // Price cap: only apply if products actually have a price field in the index
      // (Meilisearch returns empty facets for price if no documents have it)
      // We skip price filtering when the DB has no price data to avoid blocking all results
      // if (intent.price_max) filterParts.push(`price <= ${intent.price_max}`);

      if (filterParts.length > 0) {
        searchOptions.filter = filterParts.join(' AND ');
      }

      const refinedResults = await productsIndex.search('', searchOptions);
      return res.json(formatResults(refinedResults, query, intent.query));
    }

    // 3. Zero hits
    return res.json({ success: true, data: [], facets: {}, total: 0, query });

  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/search/suggest?q=...
router.get('/suggest', async (req, res) => {
  const query = req.query.q || '';
  if (!query.trim() || query.length < 2) return res.json({ success: true, suggestions: [] });

  try {
    const results = await productsIndex.search(query, {
      limit: 8,
      attributesToHighlight: ['title'],
      attributesToRetrieve: ['title', 'category_group'],
    });

    // Dedup simple suggestions for autocomplete
    const seen = new Set();
    const suggestions = [];

    for (const hit of results.hits) {
      const text = hit.title.toLowerCase();
      if (!seen.has(text)) {
        seen.add(text);
        suggestions.push({ text: hit.title, type: 'product', category: hit.category_group });
      }
    }

    res.json({ success: true, suggestions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
