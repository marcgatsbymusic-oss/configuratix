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

  // PREISMAT — this is likely the dimension-based price matrix table Cantor uses
  try {
    const cols = await q(`SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'PREISMAT' ORDER BY ORDINAL_POSITION`);
    console.log('=== PREISMAT columns ===');
    cols.forEach(c => console.log(`  ${c.COLUMN_NAME} (${c.DATA_TYPE})`));

    const sample = await q(`SELECT TOP 10 * FROM PREISMAT`);
    console.log('\n=== PREISMAT sample ===');
    console.log(JSON.stringify(sample, null, 2));
  } catch(e) { console.error('PREISMAT error:', e.message); }

  // ARTPREISE — article prices (may contain per-profile pricing)
  try {
    const cols = await q(`SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'ARTPREISE' ORDER BY ORDINAL_POSITION`);
    console.log('\n=== ARTPREISE columns ===');
    cols.forEach(c => console.log(`  ${c.COLUMN_NAME} (${c.DATA_TYPE})`));

    const sample = await q(`SELECT TOP 10 * FROM ARTPREISE`);
    console.log('\n=== ARTPREISE sample ===');
    console.log(JSON.stringify(sample, null, 2));
  } catch(e) { console.error('ARTPREISE error:', e.message); }

  // PREISGRUPPE — price groups, likely indexed by profile system
  try {
    const sample = await q(`SELECT TOP 30 * FROM PREISGRUPPE ORDER BY PREISGRUPPE`);
    console.log('\n=== PREISGRUPPE (price groups) ===');
    console.log(JSON.stringify(sample, null, 2));
  } catch(e) { console.error('PREISGRUPPE error:', e.message); }

  // PREISSCHEMA — the price schema / matrix config
  try {
    const schema = await q(`SELECT TOP 20 * FROM PREISSCHEMA`);
    console.log('\n=== PREISSCHEMA sample ===');
    console.log(JSON.stringify(schema, null, 2));
  } catch(e) { console.error('PREISSCHEMA error:', e.message); }

  // Look at PREISE rows filtered to IGLO 5 (I5S) or product system key
  try {
    const rows = await q(`
      SELECT TOP 20 * FROM PREISE 
      WHERE KEY2 LIKE '%I5S%' OR KEY2 LIKE '%IGLO%' OR KEY3 LIKE '%I5S%' OR KEY3 LIKE '%IGLO%'
    `);
    console.log('\n=== PREISE rows related to IGLO ===');
    console.log(JSON.stringify(rows, null, 2));
  } catch(e) { console.error('PREISE IGLO filter error:', e.message); }

  // Look for GRPRS (base group price) references - mentioned in FORMEL fields
  try {
    const rows = await q(`
      SELECT TOP 10 * FROM PREISE WHERE FORMEL LIKE '%GRPRS%' OR FORMEL LIKE '%fn_Cena%'
    `);
    console.log('\n=== PREISE rows with GRPRS / fn_Cena formulas ===');
    rows.forEach(r => console.log(`  KEY2=${r.KEY2} KEY3=${r.KEY3} | ${r.FORMEL?.substring(0, 100)}`));
  } catch(e) { console.error('GRPRS query error:', e.message); }

  // CUSTOM_PRICE_MAPPING - might have bespoke mappings
  try {
    const sample = await q(`SELECT TOP 10 * FROM CUSTOM_PRICE_MAPPING`);
    console.log('\n=== CUSTOM_PRICE_MAPPING sample ===');
    console.log(JSON.stringify(sample, null, 2));
  } catch(e) { console.error('CUSTOM_PRICE_MAPPING error:', e.message); }
}

main()
  .catch(e => console.error('FATAL:', e.message))
  .finally(() => sql.close());
