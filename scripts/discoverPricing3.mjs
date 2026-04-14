import sql from 'mssql/msnodesqlv8.js';
import { writeFileSync } from 'fs';

const sqlConfig = {
  server: 'localhost\\CANTOR2019',
  database: 'DRUTEX_DEALER',
  options: { trustedConnection: true, enableArithAbort: true },
  driver: 'msnodesqlv8'
};

async function q(query) {
  const res = await sql.query(query);
  return res.recordset || [];
}

async function main() {
  await sql.connect(sqlConfig);

  // The key insight: PREISMAT has PREISMATRIX name, BREITE (width), HOEHE (height), PREIS
  // We need to find what PREISMATRIX names correspond to our profiles

  // 1. Get all unique PREISMATRIX names
  const matrices = await q(`SELECT DISTINCT PREISMATRIX, COUNT(*) as cnt FROM PREISMAT GROUP BY PREISMATRIX ORDER BY PREISMATRIX`);
  console.log('=== All PREISMATRIX names ===');
  matrices.forEach(m => console.log(`  "${m.PREISMATRIX}" (${m.cnt} rows)`));

  // 2. Look at PREISE formulas that reference GRPRS — this is the base price function
  const grprsFormulas = await q(`
    SELECT DISTINCT KEY1, KEY2, KEY3, FORMEL, FORMELTEXT, PREISGRUPPE 
    FROM PREISE 
    WHERE FORMEL LIKE '%GRPRS%' AND FORMEL LIKE '%PREISMAT%'
    ORDER BY KEY2
  `);
  console.log('\n=== PREISE rows using GRPRS + PREISMAT (base window price formulas) ===');
  grprsFormulas.forEach(r => {
    console.log(`  KEY2=${r.KEY2} KEY3=${r.KEY3} PG=${r.PREISGRUPPE}`);
    console.log(`    FORMULA: ${r.FORMEL?.substring(0, 200)}`);
    console.log('');
  });

  // 3. Look for PREISMAT rows where PREISMATRIX contains profile-like names
  const profileLike = await q(`
    SELECT TOP 5 PREISMATRIX, BREITE, HOEHE, PREIS, KLASSE1, KLASSE2 
    FROM PREISMAT 
    WHERE PREISMATRIX LIKE '%PVC%' OR PREISMATRIX LIKE '%IGLO%' OR PREISMATRIX LIKE '%I5S%'
    ORDER BY PREISMATRIX, BREITE, HOEHE
  `);
  console.log('\n=== PREISMAT rows for PVC/IGLO profiles ===');
  console.log(JSON.stringify(profileLike, null, 2));

  // 4. Get ALL dimension-based rows from PREISMAT (BREITE and HOEHE look like real mm values)
  const dimRows = await q(`
    SELECT DISTINCT PREISMATRIX, KLASSE1, KLASSE2, COUNT(*) as cnt, 
      MIN(BREITE) as min_w, MAX(BREITE) as max_w, MIN(HOEHE) as min_h, MAX(HOEHE) as max_h,
      MIN(PREIS) as min_price, MAX(PREIS) as max_price
    FROM PREISMAT 
    WHERE BREITE > 100 AND HOEHE > 100 AND PREIS > 0
    GROUP BY PREISMATRIX, KLASSE1, KLASSE2
    ORDER BY cnt DESC
  `);
  console.log('\n=== PREISMAT matrices with real dimension data (W>100, H>100, Price>0) ===');
  console.log(JSON.stringify(dimRows, null, 2));

  // 5. Check SPRBAUM for F100 opening code link to pricing
  const sprbaum = await q(`
    SELECT TOP 10 * FROM SPRBAUM 
    WHERE FFARTNR LIKE '%F100%' OR BEZEICHNUNG LIKE '%F100%'
  `);
  console.log('\n=== SPRBAUM F100 rows ===');
  console.log(JSON.stringify(sprbaum, null, 2));

  writeFileSync('./scripts/pricing_discovery.json', JSON.stringify({ matrices, dimRows, grprsFormulas: grprsFormulas.map(r => ({...r, FORMEL: r.FORMEL?.substring(0, 300)})) }, null, 2));
  console.log('\nSaved to scripts/pricing_discovery.json');
}

main()
  .catch(e => console.error('FATAL:', e.message))
  .finally(() => sql.close());
