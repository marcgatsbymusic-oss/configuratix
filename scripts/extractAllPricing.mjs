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
  console.log('Connected. Extracting full pricing matrices...\n');

  // All configurator profiles mapped to their PREISMAT matrix names:
  const targetMatrices = [
    // === PVC IGLO SERIES ===
    { matrix: 'PVC_OK',      profileId: 'iglo5',                description: 'IGLO 5' },
    { matrix: 'PVC_OK_IGE',  profileId: 'igloedge',             description: 'IGLO Edge' },
    { matrix: 'PVC_OK',      profileId: 'iglo5classic',         description: 'IGLO 5 Classic (shares PVC_OK)' },
    { matrix: 'PVC_OK_IGE',  profileId: 'igloenergyalucover',   description: 'IGLO Energy AluCover (shares IGE)' },

    // === PVC IGLO ENERGY ===
    // IGLO ENERGY uses its own matrix row set — discovered as KO_U_EN / KO_EN R BA / KO_EN BALK
    { matrix: 'KO_U_EN',     profileId: 'igloenergy',           description: 'IGLO Energy (fixed pane)' },
    { matrix: 'KO_U_EN',     profileId: 'igloenergyclassic',    description: 'IGLO Energy Classic' },

    // === PVC IGLO LIGHT / EXT / PREMIER ===
    { matrix: 'KO_PREM_U',   profileId: 'iglolight',            description: 'IGLO Light (KO_PREM_U)' },
    { matrix: 'KO_PREMR',    profileId: 'igloext',              description: 'IGLO EXT (KO_PREMR fixed)' },
    { matrix: 'KO_PREMR',    profileId: 'iglopremier',          description: 'IGLO PREMIER' },

    // === IDEAL NEO SERIES ===
    // NEO 76 main window
    { matrix: 'KO_N76M',     profileId: 'ideal-neo-md',         description: 'IDEAL NEO MD' },
    { matrix: 'KO_N76M',     profileId: 'ideal-neo-md-fs',      description: 'IDEAL NEO MD FS' },
    { matrix: 'KO_NEO76M',   profileId: 'ideal-neo-ad',         description: 'IDEAL NEO AD (Lico)' },
    // Monoblock variant — uses specific mono balcony rows
    { matrix: 'KO_N76MONO',  profileId: 'ideal-neo-md-monoblock', description: 'IDEAL NEO MD MONOBLOCK' },
    // Renovation variant
    { matrix: 'KO_N76RENO',  profileId: 'ideal-neo-md-renovation', description: 'IDEAL NEO MD RENOVATION' },

    // === IDEAL 7000 NL ===
    { matrix: 'KO_7000_RU',  profileId: 'ideal-7000-nl',        description: 'IDEAL 7000 NL' },

    // === ALUMINIUM MB SERIES ===
    { matrix: 'AL_F100',     profileId: 'mb86nsi',              description: 'MB-86N SI (AL_F100)' },
    { matrix: 'AL_F100',     profileId: 'mb79nsi',              description: 'MB-79N SI (AL_F100)' },
    { matrix: 'AL_F100',     profileId: 'mb70hi',               description: 'MB-70 HI (AL_F100)' },
    { matrix: 'AL_F100',     profileId: 'mb70',                 description: 'MB-70 (AL_F100)' },
    { matrix: 'AL_F100',     profileId: 'mb45',                 description: 'MB-45 (AL_F100)' },

    // === WOOD / SOFTLINE / DUOLINE ===
    // These are wood profiles — map to KO_PREM_U as a reasonable proxy if no dedicated matrix
    { matrix: 'KO_PREM_U',   profileId: 'softline68',           description: 'SOFTLINE 68 (aprox KO_PREM_U)' },
    { matrix: 'KO_PREM_U',   profileId: 'softline78',           description: 'SOFTLINE 78' },
    { matrix: 'KO_PREM_U',   profileId: 'softline88',           description: 'SOFTLINE 88' },
    { matrix: 'KO_PREM_U',   profileId: 'duoline68',            description: 'DUOLINE 68' },
    { matrix: 'KO_PREM_U',   profileId: 'duoline78',            description: 'DUOLINE 78' },
    { matrix: 'KO_PREM_U',   profileId: 'duoline88',            description: 'DUOLINE 88' },
  ];

  const result = {};

  for (const { matrix, profileId, description } of targetMatrices) {
    console.log(`\nExtracting ${description} (${matrix})...`);
    
    const rows = await q(`
      SELECT PREISMATRIX, KLASSE1, KLASSE2, BREITE, HOEHE, 
             PREIS, PREIS2, PREIS3, PREIS4, PREIS5
      FROM PREISMAT 
      WHERE PREISMATRIX = '${matrix}'
        AND BREITE > 100 AND HOEHE > 100 AND PREIS > 0
      ORDER BY BREITE, HOEHE
    `);

    console.log(`  Found ${rows.length} rows`);
    
    if (rows.length > 0) {
      console.log(`  Sample: W=${rows[0].BREITE} H=${rows[0].HOEHE} = €${rows[0].PREIS}`);
      const mid = rows[Math.floor(rows.length/2)];
      console.log(`  Mid:    W=${mid.BREITE} H=${mid.HOEHE} = €${mid.PREIS}`);
      const last = rows[rows.length-1];
      console.log(`  Last:   W=${last.BREITE} H=${last.HOEHE} = €${last.PREIS}`);
      
      // Group by KLASSE1 (likely opening type separator)
      const byClass = {};
      for (const row of rows) {
        const key = row.KLASSE1?.trim() || 'default';
        if (!byClass[key]) byClass[key] = [];
        byClass[key].push({
          w: row.BREITE,
          h: row.HOEHE,
          price: parseFloat(row.PREIS)
        });
      }
      
      const classes = Object.keys(byClass);
      console.log(`  Opening classes: ${classes.join(', ')}`);
      
      result[profileId] = byClass;
    }
  }

  // Also get the GRPRS base formula reference rows for each profile
  console.log('\n\n=== Checking PREISE GRPRS formulas by profile ===');
  const grprsRows = await q(`
    SELECT TOP 50 KEY1, KEY2, KEY3, FORMELTEXT, FORMEL, PREISGRUPPE
    FROM PREISE 
    WHERE (FORMEL LIKE '%GRPRS%' OR FORMEL LIKE '%PREISMAT%')
      AND FORMEL NOT LIKE '%PMATALL%'
    ORDER BY KEY2, KEY3
  `);
  grprsRows.forEach(r => {
    console.log(`\n  KEY2=${r.KEY2} KEY3=${r.KEY3} PG=${r.PREISGRUPPE}`);
    console.log(`  TEXT: ${r.FORMELTEXT}`);
    console.log(`  FORMULA: ${r.FORMEL?.substring(0, 300)}`);
  });

  // Save full result
  writeFileSync('./scripts/pricing_matrices.json', JSON.stringify(result, null, 2));
  console.log('\n\nSaved full matrices to scripts/pricing_matrices.json');
  console.log('Total profiles extracted:', Object.keys(result).length);
}

main()
  .catch(e => console.error('FATAL:', e.message))
  .finally(() => sql.close());
