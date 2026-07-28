import express from 'express';
import { supabase } from '../db/supabase.client.js';

const router = express.Router();

// GET /api/favorites?userId=xxx
router.get('/', async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ success: false, error: 'userId est obligatoire.' });
  }

  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('product_id, created_at')
      .eq('user_id', userId);

    if (error) {
      console.error('[FAVORITES-ROUTE] Fetch error:', error.message);
      return res.status(500).json({ success: false, error: error.message });
    }

    res.json({
      success: true,
      favorites: data.map(f => f.product_id)
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/favorites (Toggle Favorite)
router.post('/', async (req, res) => {
  const { userId, productId } = req.body;
  if (!userId || !productId) {
    return res.status(400).json({ success: false, error: 'userId et productId sont obligatoires.' });
  }

  try {
    // Check if already favorited
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (existing) {
      // Remove favorite
      await supabase
        .from('favorites')
        .delete()
        .eq('id', existing.id);

      console.log(`[FAVORITES-ROUTE] 💔 Favorite removed for user ${userId}: product ${productId}`);
      return res.json({ success: true, isFavorite: false, action: 'removed' });
    } else {
      // Add favorite
      const { error: insertErr } = await supabase
        .from('favorites')
        .insert({ user_id: userId, product_id: productId });

      if (insertErr) {
        console.error('[FAVORITES-ROUTE] Insert error:', insertErr.message);
        return res.status(500).json({ success: false, error: insertErr.message });
      }

      console.log(`[FAVORITES-ROUTE] ❤️ Favorite added for user ${userId}: product ${productId}`);
      return res.json({ success: true, isFavorite: true, action: 'added' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
