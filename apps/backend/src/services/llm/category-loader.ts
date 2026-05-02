/**
 * category-loader.ts
 * Loads category JSON data from disk.
 * DATA_DIR points to apps/backend/src/data/categories/
 * Migration to DB planned post-category-study.
 */

import fs from 'fs';
import path from 'path';
import { DATA_DIR } from '../../config/constants.js';

export function loadCategoryData(category: string): Record<string, any> {
  if (!category) return { error: 'Missing category parameter' };

  try {
    const filePath = path.join(DATA_DIR, `${category.toLowerCase()}.json`);

    if (!fs.existsSync(filePath)) {
      return { error: `Category '${category}' not found in database.` };
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return data;
  } catch (error: any) {
    return { error: `Failed to load category data: ${error.message}` };
  }
}
