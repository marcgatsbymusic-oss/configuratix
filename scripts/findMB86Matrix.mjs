import sql from 'mssql/msnodesqlv8.js';

const cfg = {
  server: 'localhost\\CANTOR2019',
  database: 'DRUTEX_DEALER',
  options: { trustedConnection: true, enableArithAbort: true },
  driver: 'msnodesqlv8'
};
async function q(query) { return (await sql.query(query)).recordset || []; }

async function main() {
  await sql.connect(cfg);
  console.log('Connected.\n');

  // Find MB86N SI in PRODUKTSYSTEME — PRODUKTSYSTEM might be nvarchar
  const r1 = await q(`
    SELECT TOP 20 PRODUKTSYSTEM, BEZEICHNUNG, HERSTELLERSYSTEM
    FROM PRODUKTSYSTEME
    WHERE BEZEICHNUNG LIKE '%MB86N%' OR BEZEICHNUNG LIKE '%MB-86N%'
       OR BEZEICHNUNG LIKE '%3350%' OR CAST(PRODUKTSYSTEM AS VARCHAR) = '3350'
  `);
  console.log('PRODUKTSYSTEME MB86N:');
  r1.forEach(r => console.log(`  PS=${r.PRODUKTSYSTEM} NAME=${r.BEZEICHNUNG} HERSTELLER=${r.HERSTELLERSYSTEM}`));

  // Search for 796.87 at 1000x1200 across ALL matrices
  const r2 = await q(`
    SELECT PREISMATRIX, KLASSE1, KLASSE2, BREITE, HOEHE, PREIS, PREIS2, PREIS3, PREIS4, PREIS5
    FROM PREISMAT
    WHERE BREITE = 1000 AND HOEHE = 1200 AND PREIS BETWEEN 793 AND 800
    ORDER BY PREISMATRIX, KLASSE1
  `);
  console.log('\nAll rows PREIS 793-800 at 1000x1200:');
  r2.forEach(r => console.log(
    `  [${r.PREISMATRIX}] K1=${String(r.KLASSE1||'').padEnd(8)} K2=${String(r.KLASSE2||'').padEnd(15)} P1=${r.PREIS} P2=${r.PREIS2} P3=${r.PREIS3}`
  ));

  // Check PREIS5 column for AL_F100 MB86N — dealer price might be in alternate column
  const r3 = await q(`
    SELECT PREISMATRIX, KLASSE1, KLASSE2, BREITE, HOEHE, PREIS, PREIS2, PREIS3, PREIS4, PREIS5
    FROM PREISMAT
    WHERE PREISMATRIX = 'AL_F100' AND KLASSE2 = 'MB86N' AND BREITE = 1000 AND HOEHE = 1200
  `);
  console.log('\nAL_F100 MB86N at 1000x1200 — ALL columns:');
  r3.forEach(r => console.log(
    `  K1=${String(r.KLASSE1||'').padEnd(6)} P=${r.PREIS} P2=${r.PREIS2} P3=${r.PREIS3} P4=${r.PREIS4} P5=${r.PREIS5}`
  ));

  // KEY2=4 PREISMAT AL formulas
  const r4 = await q(`
    SELECT TOP 20 KEY1, KEY2, KEY3, FORMELTEXT, LEFT(FORMEL, 500) AS FORMEL
    FROM PREISE
    WHERE KEY2 = '4' AND FORMEL LIKE '%PREISMAT%' AND FORMEL LIKE '%AL%'
    ORDER BY KEY1
  `);
  console.log('\nPREISE KEY2=4 PREISMAT AL formulas:');
  r4.forEach(r => console.log(`  [KEY1=${r.KEY1}] TEXT: ${r.FORMELTEXT}\n  FORMULA: ${r.FORMEL}\n`));

  // Also find how KEY1 relates to PRODUKTSYSTEME — discover the PREISE table KEY1 for AL profiles
  const r5 = await q(`
    SELECT DISTINCT KEY1
    FROM PREISE
    WHERE FORMEL LIKE '%AL_F100%'
    ORDER BY KEY1
  `);
  console.log('\nKEY1 values in PREISE referencing AL_F100:');
  r5.forEach(r => console.log(`  KEY1=${r.KEY1}`));
}

main()
  .catch(e => console.error('FATAL:', e.message))
  .finally(() => sql.close());
