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

  // Step 1: What profiles exist?
  try {
    const profiles = await q(`SELECT SCHLUESSEL, BEZEICHNUNG, PREISGRUPPE FROM PRODUKTSYSTEME ORDER BY SCHLUESSEL`);
    console.log('=== ALL PROFILES ===');
    profiles.forEach(p => console.log(`  ${p.SCHLUESSEL} | ${p.BEZEICHNUNG} | PG: ${p.PREISGRUPPE}`));
  } catch(e) { console.error('profiles error:', e.message); }

  // Step 2: What does the PREISE table look like?
  try {
    const cols = await q(`SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'PREISE' ORDER BY ORDINAL_POSITION`);
    console.log('\n=== PREISE table columns ===');
    cols.forEach(c => console.log(`  ${c.COLUMN_NAME} (${c.DATA_TYPE})`));
  } catch(e) { console.error('PREISE schema error:', e.message); }

  // Step 3: Sample PREISE rows
  try {
    const sample = await q(`SELECT TOP 20 * FROM PREISE`);
    console.log('\n=== PREISE sample rows ===');
    console.log(JSON.stringify(sample, null, 2));
  } catch(e) { console.error('PREISE sample error:', e.message); }

  // Step 4: Try FF_PREIS or other pricing tables
  try {
    const tables = await q(`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE '%PREIS%' OR TABLE_NAME LIKE '%PRICE%' ORDER BY TABLE_NAME`);
    console.log('\n=== Pricing-related tables ===');
    tables.forEach(t => console.log('  ' + t.TABLE_NAME));
  } catch(e) { console.error('table list error:', e.message); }
}

main()
  .catch(e => console.error('FATAL:', e.message))
  .finally(() => sql.close());
