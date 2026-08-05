/**
 * extractCantorPricing.mjs
 * 
 * Connects to the local Cantor SQL Server and extracts window pricing breakpoints.
 * Run this whenever Drutex updates their Cantor pricelist to refresh the anchor table.
 * 
 * Usage:
 *   node scripts/extractCantorPricing.mjs
 * 
 * Output:
 *   Updates src/data/cantorPricingData.ts with new anchor points.
 * 
 * Requirements:
 *   - Local CANTOR2019 SQL Server running
 *   - npm install msnodesqlv8
 */

import sql from 'msnodesqlv8';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const CONNECTION_STRING = 
  'server=CANTOR2019;Database=DRUTEX_DEALER;Trusted_Connection=Yes;Driver={SQL Server Native Client 11.0}';

function query(conn, sql) {
  return new Promise((resolve, reject) => {
    conn.query(sql, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function main() {
  console.log('Connecting to Cantor SQL Server...');
  
  const conn = await new Promise((resolve, reject) => {
    sql.open(CONNECTION_STRING, (err, conn) => {
      if (err) reject(err);
      else resolve(conn);
    });
  });

  console.log('Connected. Extracting pricing data...');

  try {
    // ---------------------------------------------------------------------------
    // Step 1: Discover available price groups for the profiles we care about
    // ---------------------------------------------------------------------------
    const pgRows = await query(conn, `
      SELECT DISTINCT 
        PS.SCHLUESSEL AS profile_key,
        PS.BEZEICHNUNG AS profile_name,
        PS.PREISGRUPPE AS price_group
      FROM PRODUKTSYSTEME PS
      WHERE PS.SCHLUESSEL IN ('I5S', 'I5E', 'I5L', 'I5EN', 'MBSI', 'MB86')
      ORDER BY PS.SCHLUESSEL
    `);
    
    console.log(`Found ${pgRows.length} profile/price-group mappings:`);
    pgRows.forEach(r => console.log(`  ${r.profile_key} → ${r.price_group}`));

    // ---------------------------------------------------------------------------
    // Step 2: For each profile, query price table at standard dimension breakpoints
    // We query PREISE table for the profile's price group
    // ---------------------------------------------------------------------------
    const TEST_DIMS = [
      [500, 500], [600, 600], [700, 700], [800, 800], [900, 900],
      [1000, 1000], [1000, 1200], [1000, 1500], [1000, 2000],
      [1200, 1000], [1200, 1500], [1200, 2000],
      [1500, 1000], [1500, 1500], [1500, 2000],
      [1600, 2000], [1800, 2000], [2000, 2000]
    ];

    const profileMap = {
      'I5S': 'iglo5',
      'I5E': 'igloenergy',
      'I5L': 'iglolight',
      'I5EN': 'igloenergy',     // may differ
      'MBSI': 'mb_si',
      'MB86': 'mb_86'
    };

    const frontendKey = {
      'F100': 'F100',   // Fixed pane
      'DKL':  'DKL',   // Tilt & turn left
      'DKR':  'DKR',   // Tilt & turn right
    };

    const pricingAnchors = {};

    for (const row of pgRows) {
      const profileId = profileMap[row.profile_key] || row.profile_key.toLowerCase();
      pricingAnchors[profileId] = pricingAnchors[profileId] || {};
      
      console.log(`\nExtracting prices for ${row.profile_key} (${row.price_group})...`);
      
      for (const [w, h] of TEST_DIMS) {
        try {
          // Try to query price directly from PREISE or ARTIKELPREISE based on the price group
          const priceRows = await query(conn, `
            SELECT TOP 1 
              PR.PREIS AS price,
              PR.BREITE AS width,
              PR.HOEHE AS height
            FROM PREISE PR
            WHERE PR.PREISGRUPPE = '${row.price_group}'
              AND PR.BREITE = ${w}
              AND PR.HOEHE = ${h}
            ORDER BY PR.PREIS ASC
          `);
          
          if (priceRows.length > 0) {
            const openingType = 'F100'; // Default
            if (!pricingAnchors[profileId][openingType]) {
              pricingAnchors[profileId][openingType] = [];
            }
            pricingAnchors[profileId][openingType].push({
              w, h, price: parseFloat(priceRows[0].price)
            });
            console.log(`  ${w}x${h}: €${priceRows[0].price}`);
          }
        } catch (e) {
          // Dimension may not exist in Cantor — skip silently
        }
      }
    }

    // ---------------------------------------------------------------------------
    // Step 3: Write output to cantorPricingData.ts
    // ---------------------------------------------------------------------------
    const anchorsJson = JSON.stringify(pricingAnchors, null, 2);
    
    console.log('\n\nExtracted pricing anchors:');
    console.log(anchorsJson);
    
    console.log('\n⚠️  Review the output above and manually update src/data/cantorPricingData.ts');
    console.log('   Copy the extracted anchor arrays into the CANTOR_PRICING object.');
    
    // Also save as raw JSON for easy import
    const outPath = resolve(__dirname, '../src/data/cantorPricingRaw.json');
    writeFileSync(outPath, anchorsJson, 'utf-8');
    console.log(`\nRaw JSON saved to: ${outPath}`);

  } finally {
    conn.close();
    console.log('\nConnection closed.');
  }
}

main().catch(err => {
  console.error('ERROR:', err.message || err);
  process.exit(1);
});
