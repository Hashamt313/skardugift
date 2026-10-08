import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';
import products from './routes/products.js';
import checkout from './routes/checkout.js';
import admin from './routes/admin.js';
import { requireDb } from './config/supabase.js';

const configuredOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((origin) => origin.trim());
const isSkarduGiftVercelDomain = (origin) => /^https:\/\/skardugift(?:-[a-z0-9-]+)?\.vercel\.app$/i.test(origin);
const app = express();
app.use(helmet());
app.use(cors({ origin(origin, callback) {
  if (!origin || configuredOrigins.includes(origin) || isSkarduGiftVercelDomain(origin)) return callback(null, true);
  return callback(new Error('Origin not allowed by CORS'));
} }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));
app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (req, res) => res.json({ ok: true }));
app.get('/api/categories', async (req, res, next) => {
  try {
    const { data, error } = await requireDb().from('categories').select('*').eq('is_visible', true).order('sort_order');
    if (error) throw error;
    res.json({ data });
  } catch (error) { next(error); }
});
app.use('/api/products', products);
app.use('/api/checkout', checkout);
app.use('/api/admin', admin);
app.use((req, res) => res.status(404).json({ message: 'Not found' }));
app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.status || 500).json({ message: error.message || 'An unexpected error occurred' });
});
if (!process.env.VERCEL) app.listen(process.env.PORT || 5000, () => console.log(`SkarduGift API listening on ${process.env.PORT || 5000}`));
export default app;
