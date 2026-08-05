/**
 * extractAlPricing.mjs
 *
 * Re-extracts AL_F100 (and related AL_ matrices) split by KLASSE2 (profile system),
 * so each MB profile gets its own correct price anchors instead of being mixed together.
 *
 * KLASSE2 → profileId mapping confirmed from Cantor PREISMAT:
 *   MB45      → mb45
 *   MB60 3    → mb60  (not currently in UI)
 *   MB79      → mb79nsi
 *   MB79_MAX  → mb79nsi (max glazing variant, same profile)
 *   MB86N     → mb86nsi
 *   MB86N DW  → mb86nsi (door variant)
 *   MB86N_MAX → mb86nsi (max glazing)
 *   MB70      → mb70
 *   MB70_HI   → mb70hi
 *   MB59S A   → mb59  (not currently in UI)
 *   MB78 3    → (premium, not in UI)
 */

import sql from 'mssql/msnodesqlv8.js';
import { writeFileSync } from 'fs';

const sqlConfig = {
  server: 'localhost\\CANTOR2019',
  database: 'DRUTEX_DEALER',
  options: { trustedConnection: true, enableArithAbort: true },
  driver: 'msnodesqlv8'
};

// KLASSE2 → our frontend profile ID
const KLASSE2_TO_PROFILE = {
  'MB45':       'mb45',
  'MB79':       'mb79nsi',
  'MB79_MAX':   'mb79nsi',
  'MB86N':      'mb86nsi',
  'MB86N DW':   'mb86nsi',
  'MB86N_MAX':  'mb86nsi',
  'MB70':       'mb70',
  'MB70_HI':    'mb70hi',
  'MB70 DW_HI': 'mb70hi',
};

// KLASSE1 → Cantor opening class
const KLASSE1_TO_CLASS = {
  'F':   'F100',
  'U':   'F100',
  'R':   'DK',
  'R_ZEW': 'DK',
  'UR':  'UR',
  'SBP': 'SBP',
  'S':   'SBP',
  'PSK': 'PSK',
  'HS':  'HS',
  'DW':  'DOOR',
};

async function q(query) {
  const res = await sql.query(query);
  return res.recordset || [];
}

async function main() {
  await sql.connect(sqlConfig);
  console.log('Connected. Extracting AL_F100 with KLASSE2 profile separation...\n');

  // Query all relevant AL matrices with KLASSE2 to get per-profile rows
  const rows = await q(`
    SELECT PREISMATRIX, KLASSE1, KLASSE2, BREITE, HOEHE, PREIS
    FROM PREISMAT
    WHERE PREISMATRIX IN ('AL_F100', 'AL_F100A', 'AL_F100U', 'AL_F100D')
      AND BREITE > 100 AND HOEHE > 100
      AND PREIS > 0 AND PREIS < 50000
    ORDER BY KLASSE2, KLASSE1, BREITE, HOEHE
  `);

  console.log(`Fetched ${rows.length} total rows from AL matrices.`);

  // Show distinct KLASSE2 values present
  const k2Set = new Set(rows.map(r => r.KLASSE2?.trim() || ''));
  console.log('\nDistinct KLASSE2 values:', [...k2Set].join(', '));

  // Group by profileId -> openingClass -> anchors
  const result = {};

  for (const row of rows) {
    const k2 = row.KLASSE2?.trim() || '';
    const k1 = row.KLASSE1?.trim() || 'F';
    const profileId = KLASSE2_TO_PROFILE[k2];
    if (!profileId) continue; // skip profiles not in our frontend

    const openingClass = KLASSE1_TO_CLASS[k1] || 'OTHER';
    if (openingClass === 'OTHER') continue;

    if (!result[profileId]) result[profileId] = {};
    if (!result[profileId][openingClass]) result[profileId][openingClass] = [];

    result[profileId][openingClass].push({
      w: row.BREITE,
      h: row.HOEHE,
      price: parseFloat(row.PREIS)
    });
  }

  // Deduplicate within each profile/opening — keep lowest price for same W×H
  // (multiple PREISMATRIX variants can produce duplicates)
  for (const [profileId, openings] of Object.entries(result)) {
    for (const [openingClass, anchors] of Object.entries(openings)) {
      const map = new Map();
      for (const a of anchors) {
        const key = `${a.w}x${a.h}`;
        if (!map.has(key) || map.get(key).price > a.price) {
          map.set(key, a);
        }
      }
      result[profileId][openingClass] = Array.from(map.values());
    }
  }

  // Print summary and spot-check 1000x1200
  console.log('\n=== Summary ===');
  for (const [profileId, openings] of Object.entries(result)) {
    console.log(`\n${profileId}:`);
    for (const [cls, anchors] of Object.entries(openings)) {
      const prices = anchors.map(a => a.price).sort((a, b) => a - b);
      const at1000 = anchors.find(a => a.w === 1000 && a.h === 1200);
      const spot = at1000 ? ` | @1000x1200=€${at1000.price}` : '';
      console.log(`  ${cls}: ${anchors.length} anchors €${prices[0].toFixed(2)}–€${prices[prices.length-1].toFixed(2)}${spot}`);
    }
  }

  // Save to scripts/pricing_matrices_al.json (separate file — merged in next step)
  const outPath = './scripts/pricing_matrices_al.json';
  writeFileSync(outPath, JSON.stringify(result, null, 2));
  console.log(`\nSaved to ${outPath}`);
}

main()
  .catch(e => console.error('FATAL:', e.message))
  .finally(() => sql.close());
