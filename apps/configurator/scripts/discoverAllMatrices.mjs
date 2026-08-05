import sql from 'mssql/msnodesqlv8.js';

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
  console.log('Connected.\n');

  // Get ALL distinct PREISMATRIX names with real dimension data
  const allMatrices = await q(`
    SELECT DISTINCT PREISMATRIX, KLASSE1, 
      COUNT(*) as cnt,
      MIN(BREITE) as min_w, MAX(BREITE) as max_w,
      MIN(HOEHE) as min_h, MAX(HOEHE) as max_h,
      MIN(PREIS) as min_p, MAX(PREIS) as max_p
    FROM PREISMAT 
    WHERE BREITE BETWEEN 200 AND 5000 
      AND HOEHE BETWEEN 200 AND 5000 
      AND PREIS > 5
      AND PREIS < 10000
    GROUP BY PREISMATRIX, KLASSE1
    ORDER BY cnt DESC, PREISMATRIX
  `);
  
  console.log('=== All real pricing matrices ===');
  allMatrices.forEach(m => 
    console.log(`  "${m.PREISMATRIX}" / "${m.KLASSE1}" | ${m.cnt} rows | €${m.min_p.toFixed(0)}-${m.max_p.toFixed(0)} | W:${m.min_w}-${m.max_w} H:${m.min_h}-${m.max_h}`)
  );

  // Also look at profiles from PRODUKTSYSTEME to find their system keys
  const prods = await q(`SELECT SCHLUESSEL, BEZEICHNUNG, PREISGRUPPE FROM PRODUKTSYSTEME ORDER BY SCHLUESSEL`);
  console.log('\n=== All PRODUKTSYSTEME profile keys ===');
  prods.forEach(p => console.log(`  ${p.SCHLUESSEL} | ${p.BEZEICHNUNG} | PG: ${p.PREISGRUPPE}`));

  // Find which PREISMAT matrices are referenced in PREISE formulas
  // The formula references them like: PREISMAT("PVC_OK", ...) or GRPRS function
  const formulaRefs = await q(`
    SELECT DISTINCT 
      SUBSTRING(FORMEL, CHARINDEX('PREISMAT(', FORMEL)+9, 20) as matrix_ref,
      COUNT(*) as cnt
    FROM PREISE 
    WHERE FORMEL LIKE '%PREISMAT(%'
    GROUP BY SUBSTRING(FORMEL, CHARINDEX('PREISMAT(', FORMEL)+9, 20)
    ORDER BY cnt DESC
  `);
  console.log('\n=== PREISMAT references in PREISE formulas ===');
  formulaRefs.forEach(r => console.log(`  "${r.matrix_ref}" (used ${r.cnt}x)`));
}

main()
  .catch(e => console.error('FATAL:', e.message))
  .finally(() => sql.close());
