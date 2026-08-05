/**
 * mergePvcPricing.mjs
 *
 * Merges the correctly extracted PVC pricing (pricing_matrices_pvc.json)
 * into the main cantorPricingMatrices.json, replacing the old PVC_OK-based entries.
 *
 * Applies a max anchor cap of 800 per opening class to keep the JSON manageable.
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const mainPath = resolve(__dirname, '../src/data/cantorPricingMatrices.json');
const pvcPath  = resolve(__dirname, './pricing_matrices_pvc.json');

const main = JSON.parse(readFileSync(mainPath, 'utf-8'));
const pvc  = JSON.parse(readFileSync(pvcPath, 'utf-8'));

const MAX_ANCHORS = 800;

function sampleAnchors(anchors, max) {
  const filtered = anchors.filter(a => a.price > 0 && a.price < 10000);
  if (filtered.length <= max) return filtered;
  const step = Math.floor(filtered.length / max);
  return filtered.filter((_, i) => i % step === 0).slice(0, max);
}

for (const [profileId, openings] of Object.entries(pvc)) {
  console.log(`\nUpdating ${profileId}:`);
  const newOpenings = {};
  for (const [openingClass, anchors] of Object.entries(openings)) {
    const sampled = sampleAnchors(anchors, MAX_ANCHORS);
    newOpenings[openingClass] = sampled;
    const prices = sampled.map(a => a.price).sort((a, b) => a - b);
    const spot = sampled.find(a => a.w === 1000 && a.h === 1200);
    console.log(
      `  ${openingClass.padEnd(6)}: ${sampled.length} anchors (from ${anchors.length}) €${prices[0]?.toFixed(2)}–€${prices[prices.length-1]?.toFixed(2)}` +
      (spot ? ` | @1000x1200=€${spot.price}` : '')
    );
  }
  main[profileId] = newOpenings;
}

writeFileSync(mainPath, JSON.stringify(main, null, 2));
console.log(`\nSaved updated cantorPricingMatrices.json`);
console.log('Total profiles:', Object.keys(main).length);

// Final spot-check log
console.log('\n=== Spot check: iglo5 at 1000x1200 ===');
const ig5 = main['iglo5'];
for (const [cls, anchors] of Object.entries(ig5)) {
  const spot = anchors.find(a => a.w === 1000 && a.h === 1200);
  if (spot) console.log(`  ${cls}: €${spot.price}`);
}
