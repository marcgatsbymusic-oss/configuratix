/**
 * mergeAlPricing.mjs
 *
 * Merges the correctly split AL pricing (pricing_matrices_al.json)
 * into the main cantorPricingMatrices.json, replacing the old polluted MB entries.
 *
 * For the large F100 anchor sets (28k+ rows), we sample to max 800 points
 * covering the typical configurator range (300–4000mm width/height).
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const mainPath = resolve(__dirname, '../src/data/cantorPricingMatrices.json');
const alPath   = resolve(__dirname, './pricing_matrices_al.json');

const main = JSON.parse(readFileSync(mainPath, 'utf-8'));
const al   = JSON.parse(readFileSync(alPath, 'utf-8'));

const MAX_ANCHORS = 800;
const MAX_DIM = 6000; // Beyond 6m is custom facade territory — skip

function sampleAnchors(anchors, max) {
  // Filter to configurator-relevant range
  const filtered = anchors.filter(a => a.w <= MAX_DIM && a.h <= MAX_DIM && a.price > 0 && a.price < 50000);
  if (filtered.length <= max) return filtered;
  // Sample evenly
  const step = Math.floor(filtered.length / max);
  return filtered.filter((_, i) => i % step === 0).slice(0, max);
}

// Replace MB profile entries with the correctly split AL data
for (const [profileId, openings] of Object.entries(al)) {
  console.log(`\nUpdating ${profileId}:`);
  const newOpenings = {};
  for (const [openingClass, anchors] of Object.entries(openings)) {
    const sampled = sampleAnchors(anchors, MAX_ANCHORS);
    newOpenings[openingClass] = sampled;
    const prices = sampled.map(a => a.price).sort((a, b) => a - b);
    const at1000 = sampled.find(a => a.w === 1000 && a.h === 1200);
    console.log(`  ${openingClass}: ${sampled.length} anchors (from ${anchors.length}) €${prices[0]?.toFixed(2)}–€${prices[prices.length-1]?.toFixed(2)}${at1000 ? ' | @1000x1200=€'+at1000.price : ''}`);
  }
  main[profileId] = newOpenings;
}

writeFileSync(mainPath, JSON.stringify(main, null, 2));
console.log(`\nSaved updated cantorPricingMatrices.json`);
console.log('Total profiles:', Object.keys(main).length);
