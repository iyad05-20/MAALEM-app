import { Meilisearch } from 'meilisearch';
import { supabase } from '../../db/supabase.client.js';
import { recommendationService } from '../recommendation.service.js';

const client = new Meilisearch({
  host: process.env.MEILI_HOST || 'http://127.0.0.1:7700',
  apiKey: process.env.MEILI_MASTER_KEY || 'dev_only_key_change_in_prod',
});

export const productsIndex = client.index('products');
export const intentsIndex = client.index('search_intents');

export async function initSearchIndex() {
  // 1. Initialize Products Index
  await client.createIndex('products', { primaryKey: 'id' });
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
  if (products.length > 0) {
    const docs = products.map(p => ({
      ...p,
      category_group: p.category_group || p.identity?.category_group
    }));
    await productsIndex.addDocuments(docs);
    console.log(`✅ Meilisearch: synced 'products' index with ${docs.length} items from Supabase.`);
  }

  // 2. Initialize Search Intents Index
  await client.createIndex('search_intents', { primaryKey: 'id' });
  await intentsIndex.updateSettings({
    searchableAttributes: ['query'],
    filterableAttributes: ['category_groups', 'tags', 'price_max'],
  });

  const { data: intents, error } = await supabase.from('search_intents').select('*');
  if (error) {
    console.error('Failed to fetch search_intents from Supabase:', error);
  } else if (intents && intents.length > 0) {
    await intentsIndex.addDocuments(intents);
    console.log(`✅ Meilisearch: synced 'search_intents' index with ${intents.length} items from Supabase.`);
  }
}

export default client;
