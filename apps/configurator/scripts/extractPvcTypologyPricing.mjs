/**
 * extractPvcTypologyPricing.mjs
 *
 * Extracts PVC profile pricing from PVC_F100 (the correct per-typology source),
 * split by KLASSE2 (profile system) and KLASSE1 (opening behaviour).
 *
 * This replaces the old PVC_OK extraction which was a coarse aggregate table
 * that didn't properly separate profiles or opening types.
 *
 * KLASSE2 → profileId mapping (confirmed from live PVC_F100 data):
 *   IG5 / IG5 DW      → iglo5
 *   IGL               → iglolight
 *   IGE / IGE DW      → igloenergy
 *   IGEDGE / DW       → igloedge
 *   IGPR              → iglopremier
 *   IG EXT            → igloext
 *   IGEAC             → igloenergyalucover
 *   N76M / N76M DW    → ideal-neo-md
 *   N76A / N76A DW    → ideal-neo-ad
 *   I7NL / I7NL DW    → ideal-7000-nl
 *
 * KLASSE1 → opening class:
 *   R, R_ZEW, R_ZEW_PREMIER, W_ZEW, W_ZEW_PREMIER → DK
 *   U, F                                            → F100
 *   UR                                              → UR
 *   FF                                              → F100 (fixed-in-frame)
 *   SBP                                             → SBP
 *   PSK                                             → PSK
 *   HS                                              → HS
 *   DW                                              → DOOR
 */

import sql from 'mssql/msnodesqlv8.js';
import { writeFileSync } from 'fs';

const sqlConfig = {
  server: 'localhost\\CANTOR2019',
  database: 'DRUTEX_DEALER',
  options: { trustedConnection: true, enableArithAbort: true },
  driver: 'msnodesqlv8'
};

// KLASSE2 value → our frontend profileId
// DW suffix = window+door variant of same profile — merge into same profileId
const KLASSE2_TO_PROFILE = {
  'IG5':          'iglo5',
  'IG5 DW':       'iglo5',
  'IGL':          'iglolight',
  'IGE':          'igloenergy',
  'IGE DW':       'igloenergy',
  'IGEDGE':       'igloedge',
  'IGEDGE DW':    'igloedge',
  'IGEDGEOLD':    'igloedge',       // older edge variant
  'IGPR':         'iglopremier',
  'IG EXT':       'igloext',
  'IGEAC':        'igloenergyalucover',
  'N76M':         'ideal-neo-md',
  'N76M DW':      'ideal-neo-md',
  'N76A':         'ideal-neo-ad',
  'N76A DW':      'ideal-neo-ad',
  'I7NL':         'ideal-7000-nl',
  'I7NL DW':      'ideal-7000-nl',
};

// KLASSE1 value → our canonical opening class
const KLASSE1_TO_CLASS = {
  'R':               'DK',
  'R_ZEW':           'DK',
  'R_ZEW_PREMIER':   'DK',
  'W_ZEW':           'DK',
  'W_ZEW_PREMIER':   'DK',
  'BALKON RUCH':     'DK',
  'U':               'F100',
  'F':               'F100',
  'FF':              'F100',
  'UD':              'F100',  // fixed-fixed combination
  'UR':              'UR',
  'SBP':             'SBP',
  'S':               'SBP',
  'PSK':             'PSK',
  'HS':              'HS',
  'DW':              'DOOR',
};

async function q(query) {
  const r = await sql.query(query);
  return r.recordset || [];
}

async function main() {
  await sql.connect(sqlConfig);
  console.log('Connected. Extracting PVC pricing from typology matrices...\n');

  // Main extraction from PVC_F100 — the reference single-sash matrix
  // This covers all standard window profiles for the F100 typology group
  const rows = await q(`
    SELECT PREISMATRIX, KLASSE1, KLASSE2, BREITE, HOEHE, PREIS
    FROM PREISMAT
    WHERE PREISMATRIX IN (
      'PVC_F100', 'PVC_F100R', 'PVC_F100AO', 'PVC_F100U',
      'PVC_F150', 'PVC_F150R',
      'PVC_F200', 'PVC_F200E',
      'PVC_F270', 'PVC_F270E',
      'PVC_F300'
    )
      AND BREITE > 100 AND HOEHE > 100
      AND PREIS > 0 AND PREIS < 10000
    ORDER BY PREISMATRIX, KLASSE2, KLASSE1, BREITE, HOEHE
  `);

  console.log(`Fetched ${rows.length} total rows from PVC typology matrices.`);

  // Show distinct KLASSE2 values
  const k2Set = new Set(rows.map(r => r.KLASSE2?.trim() || ''));
  console.log('\nDistinct KLASSE2 values:', [...k2Set].sort().join(', '));

  // Group: profileId → openingClass → anchors (deduplicated, keep lowest price per W×H)
  const result = {};

  for (const row of rows) {
    const k2 = row.KLASSE2?.trim() || '';
    const k1 = row.KLASSE1?.trim() || '';
    const profileId = KLASSE2_TO_PROFILE[k2];
    if (!profileId) continue;

    const openingClass = KLASSE1_TO_CLASS[k1];
    if (!openingClass) continue;

    if (!result[profileId]) result[profileId] = {};
    if (!result[profileId][openingClass]) result[profileId][openingClass] = new Map();

    const key = `${row.BREITE}x${row.HOEHE}`;
    const existing = result[profileId][openingClass].get(key);
    const price = parseFloat(row.PREIS);
    // Keep lowest price for same dimension (DW vs non-DW variants)
    if (!existing || existing.price > price) {
      result[profileId][openingClass].set(key, { w: row.BREITE, h: row.HOEHE, price });
    }
  }

  // Convert Maps → arrays
  const structured = {};
  for (const [profileId, openings] of Object.entries(result)) {
    structured[profileId] = {};
    for (const [openingClass, map] of Object.entries(openings)) {
      structured[profileId][openingClass] = Array.from(map.values());
    }
  }

  // Print summary, spot-check 1000x1200
  console.log('\n=== Summary ===');
  for (const [profileId, openings] of Object.entries(structured)) {
    console.log(`\n${profileId}:`);
    for (const [cls, anchors] of Object.entries(openings)) {
      const prices = anchors.map(a => a.price).sort((a, b) => a - b);
      const spot = anchors.find(a => a.w === 1000 && a.h === 1200);
      console.log(
        `  ${cls.padEnd(6)}: ${anchors.length} anchors €${prices[0].toFixed(2)}–€${prices[prices.length-1].toFixed(2)}` +
        (spot ? ` | @1000x1200=€${spot.price}` : '')
      );
    }
  }

  writeFileSync('./scripts/pricing_matrices_pvc.json', JSON.stringify(structured, null, 2));
  console.log('\nSaved to ./scripts/pricing_matrices_pvc.json');
}

main()
  .catch(e => console.error('FATAL:', e.message))
  .finally(() => sql.close());
