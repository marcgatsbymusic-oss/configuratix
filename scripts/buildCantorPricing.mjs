/**
 * buildCantorPricing.mjs
 * 
 * Reads the extracted pricing_matrices.json and generates cantorPricingData.ts
 * with the full real-data matrix from Cantor for all profiles and opening types.
 * 
 * Opening class → opening type mapping (Cantor internal names):
 *   R             = regular (DK - Dreh-Kipp)
 *   UR            = UR (single turn/fixed-open)
 *   PP / U        = Fixed pane  (F100)
 *   R_ZEW         = External turn
 *   PSK           = PSK (lift-and-slide)
 *   DW            = Door leaf (active)
 *   DW-BIERNE     = Door leaf (passive)
 *   HS            = Sliding
 *   FEST_WSZYSTKO = Fixed (all)
 *   UR 3 SZYBY    = UR 3-pane
 *   BALKON RUCH   = balcony opening
 *   I5 1 SKRZ     = Single sash door
 *   NEO 1 SKRZ    = NEO door
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const raw = JSON.parse(readFileSync(resolve(__dirname, './pricing_matrices.json'), 'utf-8'));

// Map Cantor opening class names → our frontend opening type IDs
const CLASS_TO_OPENING = {
  // Fixed pane
  'PP':              'F100',
  'U':               'F100',
  'FEST_WSZYSTKO':   'F100',
  'F':               'F100',
  'default':         'F100',

  // Dreh-Kipp / Dreh (turn-tilt)
  'R':               'DK',
  'R_ZEW':           'DK',
  'R_ZEW_PREMIER':   'DK',
  'W_ZEW_PREMIER':   'DK',
  'BALKON RUCH':     'DK',
  'R DWIE SZYBY':    'DK',
  'R BALK WSZYST':   'DK',
  'R_BAL_3SZ':       'DK',
  'BALK RUCH':       'DK',
  'OKNO STD':        'DK',  // IGLO EXT / PREMIER default

  // UR (turn-only / Unterlicht)
  'UR':              'UR',
  'UR 3 SZYBY':      'UR',
  'UR LICO 3SZYB':   'UR',
  'UR balkon':       'UR',
  'RU BALK 2 SZYB':  'UR',
  'RU BALK 2SZYB':   'UR',
  'RU BALK 2 SZYBY': 'UR',
  'BALK 2 SZYB':     'UR',
  'BALK RU 2SZYBY':  'UR',
  'RU_BAL_3SZ':      'UR',
  'STD':             'UR',

  // SBP (tilt turn + special)
  'SBP':             'SBP',
  'S':               'SBP',

  // PSK (lift and slide)
  'PSK':             'PSK',
  'HS':              'HS',

  // Doors
  'DW':              'DOOR',
  'DW-BIERNE':       'DOOR_PASSIVE',
  'I5 1 SKRZ':       'DOOR',
  'NEO 1 SKRZ':      'DOOR',
  '1 SKRZ 2 SZYB':   'DOOR',
};

// Build structured output: profileId -> openingTypeId -> [{w, h, price}]
const structured = {};

for (const [profileId, classes] of Object.entries(raw)) {
  structured[profileId] = {};
  for (const [className, anchors] of Object.entries(classes)) {
    const openingId = CLASS_TO_OPENING[className] || 'OTHER';
    if (!structured[profileId][openingId]) {
      structured[profileId][openingId] = [];
    }

    // 1. Filter: Exclude sentinel prices (e.g., 0 or negative)
    const validAnchors = anchors.filter(a => a.price > 0);

    // 2. Deduplicate: Use string key for w/h
    const uniqueMap = new Map();
    for (const a of validAnchors) {
      const key = `${a.w}x${a.h}`;
      if (!uniqueMap.has(key) || uniqueMap.get(key).price > a.price) {
        uniqueMap.set(key, a);
      }
    }

    let finalAnchors = Array.from(uniqueMap.values());

    // 3. Sample: If too large, keep max 400 representative points
    if (finalAnchors.length > 400) {
      const step = Math.floor(finalAnchors.length / 400);
      finalAnchors = finalAnchors.filter((_, i) => i % step === 0).slice(0, 400);
    }

    structured[profileId][openingId].push(...finalAnchors);
  }
}

// Print summary
for (const [profileId, openings] of Object.entries(structured)) {
  console.log(`\n${profileId}:`);
  for (const [openingId, anchors] of Object.entries(openings)) {
    const prices = anchors.map(a => a.price).sort((a, b) => a - b);
    console.log(`  ${openingId}: ${anchors.length} anchors | €${prices[0].toFixed(2)}–€${prices[prices.length-1].toFixed(2)}`);
  }
}

// Write structured JSON for import by cantorPricingData.ts
const outPath = resolve(__dirname, '../src/data/cantorPricingMatrices.json');
writeFileSync(outPath, JSON.stringify(structured, null, 2));
console.log(`\nWritten to ${outPath}`);
console.log('Total profiles:', Object.keys(structured).length);
