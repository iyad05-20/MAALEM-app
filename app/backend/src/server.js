import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes           from './routes/auth.routes.js';
import recommendationRoutes from './routes/recommendation.routes.js';
import searchRoutes         from './routes/search.routes.js';
import productsRoutes       from './routes/products.routes.js';
import favoritesRoutes      from './routes/favorites.routes.js';
import reviewsRoutes        from './routes/reviews.routes.js';
import clientRoutes         from './client/routes/clientRoutes.js';
import mockCmiRouter        from './core/paymentProviders/mockCmi.js';
import { loadProducts }       from './services/recommendation.service.js';
import { initSearchIndex }  from './services/search/meilisearch.service.js';
import { initSchema }       from './core/db/index.js';

dotenv.config();

(async () => {
  try {
    initSchema();
    await loadProducts();
    await initSearchIndex();
  } catch (err) {
    console.error('Initialization failed (non-fatal):', err.message);
  }
})();

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',   // Vite dev
  'http://127.0.0.1:5173',
  'http://localhost:4173',   // Vite preview
  'http://localhost:3000',   // Frontend Docker compose
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── API Routes (MVC — controllers live in routes/) ───────────────────────────
app.use('/api/auth',            authRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/search',          searchRoutes);
app.use('/api/products',        productsRoutes);
app.use('/api/favorites',       favoritesRoutes);
app.use('/api/reviews',         reviewsRoutes);
app.use('/api/client',          clientRoutes);
app.use('/mock-cmi',            mockCmiRouter);

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Endpoint not found: ${req.method} ${req.path}` });
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ success: false, error: err.message || 'Internal server error' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🚀 MAALEM Backend running on http://localhost:${PORT}`);
  console.log(`   GET  /health`);
  console.log(`   GET  /api/products`);
  console.log(`   GET  /api/recommendations?userId=x`);
  console.log(`   GET  /api/search?q=zellige`);
  console.log(`   POST /api/client/orders`);
  console.log(`   POST /api/client/orders/:id/pay`);
  console.log(`   GET  /api/client/wallet/:userId/balance\n`);
});

export { app };
