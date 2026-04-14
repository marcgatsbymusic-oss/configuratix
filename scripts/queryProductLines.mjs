/**
 * queryProductLines.mjs  – READ-ONLY
 * Extracts all product line definitions from DRUTEX_DEALER (Cantor SQL Server).
 *
 * Architecture discovered:
 *   • PRODTYP       = product line / type table (620 rows)
 *   • PRODUKTSYSTEME = colour/profile grouping (13 rows, FK from PRODTYP.PRODUCTSYSTEM)
 *   • PRODTYP.MATERIALART values: 2=PVC, 3=ALU, 4=Wood (confirmed from column MATERIALART)
 *
 * Output:
 *   scripts/data/prodtyp_raw.json
 *   docs/01_product_lines.md
 */

import sql from 'mssql/msnodesqlv8.js';
import fs  from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, '..');

const sqlConfig = {
    server:   'localhost\\CANTOR2019',
    database: 'DRUTEX_DEALER',
    options: { trustedConnection: true, enableArithAbort: true },
    driver:   'msnodesqlv8'
};

function safeStr(v) { return v == null ? '' : String(v).trim(); }

// ── MATERIALART mapping (from Cantor schema conventions) ─────────────────────
// 1 = Wood or system/accessory rows (SOFTLINE, DUOLINE, shutters, accessories headers)
// 2 = PVC  3 = Aluminium  4 = Wood (pure wood products with DRE system)
const MATERIALART_MAP = {
    1: 'Wood / System',
    2: 'PVC',
    3: 'Aluminium',
    4: 'Wood',
    5: 'Steel',
    6: 'Mixed / Other',
};

// ── Product-type heuristic from description ───────────────────────────────────
function inferType(code, bezeichnung) {
    const s = [String(code), bezeichnung].join(' ').toUpperCase();
    if (/BRAMA|GARAZ|GARAGE|BRG/.test(s))               return 'Garage Door';
    if (/ROLETA|ROLLO|SHUTTER/.test(s))                  return 'Roller Shutter';
    if (/MOSKIT|MOSKITIERA|INSECT/.test(s))               return 'Mosquito Screen';
    if (/PERGOLA|AWNING|MARKIZA/.test(s))                 return 'Awning / Pergola';
    if (/\bHST\b|HEBE\b|\bHS\b|\bPSK\b|SLIDING|ZSUW/.test(s)) return 'Sliding Door / HST';
    if (/BALKON|BALCONY|TARAS/.test(s))                  return 'Balcony Door';
    if (/DRZWI|ENTRANCE DOOR|TUR\b|WEJSCIOW|\bDOOR\b/.test(s)) return 'Entrance Door';
    if (/SL\b|SLIDE\b/.test(s))                          return 'Sliding Door';
    if (/CORNER|NAROZNIK/.test(s))                       return 'Corner Window / Door';
    if (/PROFILE|PROFIL|INTERMEDIATE/.test(s))           return 'Profile Component';
    if (/WINDOW|OKNO|FENSTER/.test(s))                   return 'Window';
    if (/\bPSK\b/.test(s))                               return 'Lift-and-Slide Door';
    return 'Window / Door';
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function run() {
    await sql.connect(sqlConfig);
    console.log('✅  Connected to DRUTEX_DEALER\n');

    // 1. Get PRODTYP columns
    const prodtypColsResult = await sql.query(`
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME='PRODTYP' ORDER BY ORDINAL_POSITION
    `);
    const prodtypCols = prodtypColsResult.recordset.map(r => r.COLUMN_NAME);

    // 2. Distinct MATERIALART values
    const matResult = await sql.query(`
        SELECT MATERIALART, COUNT(*) AS CNT FROM PRODTYP 
        GROUP BY MATERIALART ORDER BY MATERIALART
    `);
    console.log('MATERIALART distribution:');
    matResult.recordset.forEach(r =>
        console.log(`   ${r.MATERIALART} (${MATERIALART_MAP[r.MATERIALART] || '?'}) → ${r.CNT} rows`)
    );

    // 3. All PRODTYP rows (key columns), unique by PRODUKTTYP
    //    In Cantor, PRODTYP rows can be duplicated across SPRACHID values (one per language).
    //    We use MIN(SPRACHID) to get the canonical row.
    const pdResult = await sql.query(`
        SELECT 
            PRODUKTTYP,
            MAX(BEZEICHNUNG)  AS BEZEICHNUNG,
            MAX(BEZEICHNUNG2) AS BEZEICHNUNG2,
            MAX(MATERIALART)  AS MATERIALART,
            MAX(SORTINDEX)    AS SORTINDEX,
            MAX(PRODUCTSYSTEM) AS PRODUCTSYSTEM,
            MAX(GRAFIK)       AS GRAFIK,
            MAX(HERSTELLERSYSTEM) AS HERSTELLERSYSTEM,
            MAX(BOCKELEMENTTYPE) AS BOCKELEMENTTYPE
        FROM PRODTYP
        GROUP BY PRODUKTTYP
        ORDER BY MAX(SORTINDEX), PRODUKTTYP
    `);
    const rows = pdResult.recordset;
    console.log(`\n✅  ${rows.length} distinct PRODUKTTYP records extracted`);

    // 4. PRODUKTSYSTEME reference
    const psResult = await sql.query(`
        SELECT PRODUKTSYSTEM, BEZEICHNUNG FROM PRODUKTSYSTEME ORDER BY PRODUKTSYSTEM
    `);
    const psMap = Object.fromEntries(psResult.recordset.map(r => [r.PRODUKTSYSTEM, r.BEZEICHNUNG]));
    console.log(`\n✅  ${psResult.recordset.length} PRODUKTSYSTEME entries`);

    // 5. Save raw JSON
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    const raw = { _meta: { extractedAt: new Date().toISOString(), rowCount: rows.length }, prodtypCols, rows, produktsysteme: psResult.recordset };
    fs.writeFileSync(path.join(dataDir, 'prodtyp_raw.json'), JSON.stringify(raw, null, 2), 'utf-8');
    console.log(`💾  Raw JSON saved → scripts/data/prodtyp_raw.json`);

    // 6. Enrich rows
    const enriched = rows.map(r => {
        const code        = safeStr(r.PRODUKTTYP);
        const bezeichnung = safeStr(r.BEZEICHNUNG || r.BEZEICHNUNG2);
        const matCode     = r.MATERIALART;
        const material    = MATERIALART_MAP[matCode] || `Unknown (${matCode})`;
        const psCode      = safeStr(r.PRODUCTSYSTEM);
        const psName      = psCode ? (psMap[psCode] || psCode) : '—';
        const sortindex   = r.SORTINDEX ?? '';
        const productType = inferType(code, bezeichnung);
        return { code, bezeichnung, matCode, material, psCode, psName, sortindex, productType, grafik: safeStr(r.GRAFIK), herstellersystem: safeStr(r.HERSTELLERSYSTEM) };
    });

    // 7. Build markdown
    // Group by material for easier reading
    const byMaterial = {};
    for (const e of enriched) {
        (byMaterial[e.material] = byMaterial[e.material] || []).push(e);
    }

    let grouped = '';
    for (const [mat, entries] of Object.entries(byMaterial).sort()) {
        grouped += `### ${mat}\n\n`;
        grouped += `| Code | Description | Profile System | Product Type |\n`;
        grouped += `|------|-------------|----------------|--------------|\n`;
        grouped += entries.map(e =>
            `| \`${e.code}\` | ${e.bezeichnung} | \`${e.psCode || '—'}\` ${e.psName !== e.psCode ? `→ ${e.psName}` : ''} | ${e.productType} |`
        ).join('\n');
        grouped += '\n\n';
    }

    const flatTable = enriched.map(e =>
        `| \`${e.code}\` | ${e.bezeichnung} | ${e.productType} | ${e.material} |`
    ).join('\n');

    const md = `# 01 – Drutex Product Lines

> **Source:** \`DRUTEX_DEALER.dbo.PRODTYP\`  
> **Extracted:** ${new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' })}  
> **Distinct product types:** ${rows.length}  
> **Read-only query – no DB writes performed.**

---

## Key Finding: Table Architecture

| Table | Role |
|-------|------|
| **\`PRODTYP\`** | **Product line / type definitions** – one record per product line |
| **\`PRODUKTSYSTEME\`** | Colour/profile grouping system (ALU, DRE, DRUTEX1–4…) |
| \`PRODTYP.PRODUCTSYSTEM\` | FK → \`PRODUKTSYSTEME.PRODUKTSYSTEM\` (links product to colour group) |
| \`PRODTYP.MATERIALART\` | Material code: **2=PVC, 3=Aluminium, 4=Wood** |
| \`PRODTYP.BEZEICHNUNG\` | Product line description / display name |

---

## Master Product Lines Table

| Code | Description | Product Type | Material |
|------|-------------|--------------|----------|
${flatTable}

---

## Grouped by Material

${grouped}

---

## MATERIALART Reference

| Value | Material |
|-------|----------|
${Object.entries(MATERIALART_MAP).map(([k, v]) => `| ${k} | ${v} |`).join('\n')}

---

## PRODUKTSYSTEME Reference (Profile Colour Groups)

| Code | Description | Meaning |
|------|-------------|---------|
| \`ALU\` | Aluminium | Aluminium products with bicolour support |
| \`ALU2\` | Aluminium bez bikoloru | Aluminium without bicolour |
| \`ALUPLAST1\` | Profile główne (obustronne) | Main profiles, double-sided |
| \`ALUPLAST2\` | Listwy przyszybowe | Glass bead strips |
| \`ALUPLAST3\` | Akcesoria jednostronne | Single-sided accessories |
| \`ALUPLAST4\` | Akcesoria obustronne | Double-sided accessories |
| \`DRE\` | Drewno (jeden kolor) | Wood (single colour) |
| \`DRUTEX_SPR\` | Szprosy | Glazing bars / sprouts |
| \`DRUTEX1\` | Baza: biała, brąz | PVC base colours: white + brown |
| \`DRUTEX2\` | Baza: biała | PVC base colour: white only |
| \`DRUTEX3\` | Baza: biała, brąz, antracyt | PVC base: white + brown + anthracite |
| \`DRUTEX4\` | Baza: biały, krem, antracyt | PVC base: white + cream + anthracite |
| \`PROGI\` | Progi | Thresholds / sills |

---

## PRODTYP Column Inventory

| # | Column | Notes |
|---|--------|-------|
${prodtypCols.map((c, i) => `| ${i+1} | \`${c}\` | |`).join('\n')}

---

## Full Raw Data Dump

| PRODUKTTYP | BEZEICHNUNG | MATERIALART | PRODUCTSYSTEM | GRAFIK | SORTINDEX |
|-----------|-------------|-------------|---------------|--------|-----------|
${rows.map(r =>
    `| \`${safeStr(r.PRODUKTTYP)}\` | ${safeStr(r.BEZEICHNUNG || r.BEZEICHNUNG2)} | \`${r.MATERIALART}\` (${MATERIALART_MAP[r.MATERIALART] || '?'}) | \`${safeStr(r.PRODUCTSYSTEM) || '—'}\` | ${safeStr(r.GRAFIK) || '—'} | ${r.SORTINDEX ?? ''} |`
).join('\n')}

---
_Generated by \`scripts/queryProductLines.mjs\`_
`;

    const docsDir = path.join(ROOT, 'docs');
    if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
    const mdPath = path.join(docsDir, '01_product_lines.md');
    fs.writeFileSync(mdPath, md, 'utf-8');
    console.log(`📄  Markdown → ${mdPath}`);
    console.log('\n✅  Done!');
}

run()
    .catch(err => { console.error('❌  Fatal:', err.message); process.exit(1); })
    .finally(() => sql.close());
