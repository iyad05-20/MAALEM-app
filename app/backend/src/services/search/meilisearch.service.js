import { Meilisearch } from 'meilisearch';
import { supabase } from '../../db/supabase.client.js';
import { recommendationService } from '../recommendation.service.js';

const client = new Meilisearch({
  host: process.env.MEILISEARCH_HOST || process.env.MEILI_HOST || 'http://127.0.0.1:7700',
  apiKey: process.env.MEILI_MASTER_KEY || 'dev_only_key_change_in_prod',
});

export const productsIndex = client.index('products');
export const intentsIndex = client.index('search_intents');

let seedingInFlight = null;

/**
 * Deduplicated index seeding entry point to prevent concurrent initialization/queries.
 */
export function seedSearchIndexOnce() {
  if (seedingInFlight) {
    console.log('⏳ Search engine seeding is already in flight. Deduplicating request.');
    return seedingInFlight;
  }
  seedingInFlight = initSearchIndex().finally(() => {
    seedingInFlight = null;
  });
  return seedingInFlight;
}

/**
 * Initializes and seeds both the products and search_intents index on Meilisearch idempotently.
 */
export async function initSearchIndex() {
  console.log('⚡ Running Meilisearch index initialization check...');
  await seedProducts();
  await seedIntents();
  console.log('✅ Meilisearch initialization check done.');
}

async function seedProducts() {
  try {
    const stats = await productsIndex.getStats();
    if (stats.numberOfDocuments > 0) {
      console.log(`✅ Meilisearch: 'products' index already populated with ${stats.numberOfDocuments} items. Skipping seed.`);
      return;
    }
  } catch (error) {
    if (error.code !== 'index_not_found') {
      console.error('❌ Meilisearch error checking products stats:', error.message);
      throw error;
    }
    console.log("⚙️ Creating Meilisearch index 'products'...");
    await client.createIndex('products', { primaryKey: 'id' });
  }

  // Configure settings
  await productsIndex.updateSettings({
    searchableAttributes: ['title', 'search_keywords', 'artisanName'],
    filterableAttributes: [
      'category',
      'category_group',
      'rec_tags.style',
      'rec_tags.material',
      'rec_tags.color_vibe',
      'facets.placement_context',
      'price',
      'in_stock',
    ],
    displayedAttributes: ['id', 'imageUrl', 'title', 'price', 'artisanName', 'category', 'category_group'],
  });

  const products = recommendationService.getProducts();
  if (products && products.length > 0) {
    const docs = products.map(p => ({
      ...p,
      category_group: p.category_group || p.identity?.category_group
    }));
    const task = await productsIndex.addDocuments(docs);
    console.log(`✅ Meilisearch: Seeded 'products' index (task uid: ${task.taskUid}).`);
  } else {
    console.log('⚠️ No products found in memory to seed.');
  }
}

async function seedIntents() {
  try {
    const stats = await intentsIndex.getStats();
    if (stats.numberOfDocuments > 0) {
      console.log(`✅ Meilisearch: 'search_intents' index already populated with ${stats.numberOfDocuments} items. Skipping seed.`);
      return;
    }
  } catch (error) {
    if (error.code !== 'index_not_found') {
      console.error('❌ Meilisearch error checking intents stats:', error.message);
      throw error;
    }
    console.log("⚙️ Creating Meilisearch index 'search_intents'...");
    await client.createIndex('search_intents', { primaryKey: 'id' });
  }

  // Configure settings
  await intentsIndex.updateSettings({
    searchableAttributes: ['query'],
    filterableAttributes: ['category_groups', 'tags', 'price_max'],
  });

  console.log('⚡ Fetching search intents from Supabase...');
  const { data: intents, error } = await supabase.from('search_intents').select('*');
  if (error) {
    console.error('❌ Failed to fetch search_intents from Supabase:', error);
    throw error;
  } else if (intents && intents.length > 0) {
    const task = await intentsIndex.addDocuments(intents);
    console.log(`✅ Meilisearch: Seeded 'search_intents' index with ${intents.length} items (task uid: ${task.taskUid}).`);
  }
}

export default client;
