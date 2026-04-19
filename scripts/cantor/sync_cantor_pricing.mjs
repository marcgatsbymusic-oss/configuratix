#!/usr/bin/env node
// Sync Cantor pricing tables into src/data/cantor/cantor.sqlite.
// Read-only against DRUTEX_DEALER. Writes sync_meta.json with timestamp and
// per-table SHA256 checksums so verify_cantor_sync.mjs can detect drift.

import sql from 'mssql/msnodesqlv8.js';
import Database from 'better-sqlite3';
import { createHash } from 'node:crypto';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');
const OUT_DIR = resolve(REPO_ROOT, 'src', 'data', 'cantor');
const OUT_DB = resolve(OUT_DIR, 'cantor.sqlite');
const OUT_META = resolve(OUT_DIR, 'sync_meta.json');

const CANTOR_CONFIG = {
  server: 'localhost\\CANTOR2019',
  database: 'DRUTEX_DEALER',
  options: { trustedConnection: true, enableArithAbort: true },
  driver: 'msnodesqlv8',
};

// Table -> (columns, pk, filterSql for Phase A).
// Phase A is PVC IGLO5 / fixed / white / 1000x1000 so we aggressively filter
// PREISMAT (1.22M rows) to cycles and matrices actually referenced.
const TABLES = [
  {
    name: 'PREISMAT',
    columns: ['NUMMER', 'PREISMATRIX', 'KLASSE1', 'KLASSE2', 'BREITE', 'HOEHE',
              'PREIS', 'PREIS2', 'PREIS3', 'PREIS4', 'PREIS5', 'PREIS6', 'PREIS7',
              'PREIS8', 'PREIS9', 'PREIS10', 'HERSTELLERSYSTEM'],
    sqliteDecl: `NUMMER INTEGER, PREISMATRIX TEXT, KLASSE1 TEXT, KLASSE2 TEXT,
                 BREITE REAL, HOEHE REAL,
                 PREIS REAL, PREIS2 REAL, PREIS3 REAL, PREIS4 REAL, PREIS5 REAL,
                 PREIS6 REAL, PREIS7 REAL, PREIS8 REAL, PREIS9 REAL, PREIS10 REAL,
                 HERSTELLERSYSTEM TEXT`,
    indexes: ['CREATE INDEX IF NOT EXISTS IX_PREISMAT_LOOKUP ON PREISMAT(PREISMATRIX, KLASSE1, KLASSE2, BREITE, HOEHE, NUMMER)'],
    // Phase A: only active cycle 2301 and the matrices Phase A needs.
    query: `SELECT ${/*cols*/''}PHASEA_COLS FROM PREISMAT WHERE NUMMER = 2301`,
  },
  {
    name: 'PREISE',
    columns: ['ZYKLUS', 'KUNDENR', 'KEY1', 'KEY2', 'KEY3', 'KEY4', 'PREISART',
              'MONTIERT', 'PREISNR', 'LFDNR', 'MENGENEINHEIT', 'PREISTYP', 'MIN',
              'PREISSTUECK', 'PREISEINHEIT', 'PROZENT', 'MATRIX', 'FORMEL',
              'FORMELTEXT', 'SICHTBAR', 'PREISGRUPPE', 'FARBGRUPPE',
              'HERSTELLERSYSTEM', 'TEXTNR', 'SPRACHID', 'KLASSE1', 'KLASSE2',
              'EBENE', 'SORTINDEX'],
    sqliteDecl: `ZYKLUS INTEGER, KUNDENR REAL, KEY1 TEXT, KEY2 TEXT, KEY3 TEXT,
                 KEY4 TEXT, PREISART TEXT, MONTIERT TEXT, PREISNR INTEGER,
                 LFDNR INTEGER, MENGENEINHEIT TEXT, PREISTYP TEXT, MIN REAL,
                 PREISSTUECK REAL, PREISEINHEIT REAL, PROZENT REAL, MATRIX TEXT,
                 FORMEL TEXT, FORMELTEXT TEXT, SICHTBAR INTEGER, PREISGRUPPE TEXT,
                 FARBGRUPPE TEXT, HERSTELLERSYSTEM TEXT, TEXTNR INTEGER,
                 SPRACHID REAL, KLASSE1 TEXT, KLASSE2 TEXT, EBENE TEXT, SORTINDEX INTEGER`,
    indexes: ['CREATE INDEX IF NOT EXISTS IX_PREISE_KEY ON PREISE(KEY1, KEY2, ZYKLUS, PREISART, LFDNR)'],
    query: `SELECT PHASEA_COLS FROM PREISE WHERE ZYKLUS = 2301`,
  },
  {
    name: 'PREISSCHEMA',
    columns: ['PREISSCHEMAID', 'BEZEICHNUNG1', 'BEZEICHNUNG2', 'BEZEICHNUNG3',
              'ARTIKELBEREICH', 'SPRACHID', 'GRUPPIERUNG', 'SORTINDEX',
              'GUELTIGAB', 'STATUS', 'LASTCHANGE', 'LASTUSER', 'ARTIKELKLASSEN',
              'GUELTIGFUEREK', 'GUELTIGFUERVK', 'FUELLUNGMITSTUECKLISTE'],
    sqliteDecl: `PREISSCHEMAID INTEGER, BEZEICHNUNG1 TEXT, BEZEICHNUNG2 TEXT,
                 BEZEICHNUNG3 TEXT, ARTIKELBEREICH INTEGER, SPRACHID REAL,
                 GRUPPIERUNG TEXT, SORTINDEX INTEGER, GUELTIGAB TEXT,
                 STATUS INTEGER, LASTCHANGE TEXT, LASTUSER REAL,
                 ARTIKELKLASSEN TEXT, GUELTIGFUEREK INTEGER, GUELTIGFUERVK INTEGER,
                 FUELLUNGMITSTUECKLISTE INTEGER`,
    indexes: ['CREATE INDEX IF NOT EXISTS IX_PREISSCHEMA_ID ON PREISSCHEMA(PREISSCHEMAID)'],
    query: `SELECT PHASEA_COLS FROM PREISSCHEMA`,
  },
  {
    name: 'PREISSCHEMAD',
    columns: ['PREISSCHEMAID', 'PREISFELDNR', 'BEZEICHNUNG1', 'BEZEICHNUNG2',
              'SPALTENUEBERSCHRIFT', 'SPRACHID', 'GRUPPIERUNG', 'SORTINDEX',
              'STATUS', 'NACHKOMMA', 'BERECHNETESFELD', 'FORMEL', 'SICHTBARKEIT'],
    sqliteDecl: `PREISSCHEMAID INTEGER, PREISFELDNR INTEGER, BEZEICHNUNG1 TEXT,
                 BEZEICHNUNG2 TEXT, SPALTENUEBERSCHRIFT TEXT, SPRACHID REAL,
                 GRUPPIERUNG TEXT, SORTINDEX INTEGER, STATUS INTEGER,
                 NACHKOMMA INTEGER, BERECHNETESFELD INTEGER, FORMEL TEXT,
                 SICHTBARKEIT INTEGER`,
    indexes: ['CREATE INDEX IF NOT EXISTS IX_PREISSCHEMAD ON PREISSCHEMAD(PREISSCHEMAID, PREISFELDNR)'],
    query: `SELECT PHASEA_COLS FROM PREISSCHEMAD`,
  },
  {
    name: 'PREISGRUPPE',
    columns: ['PREISGRUPPE', 'BEZEICHNUNG1', 'BEZEICHNUNG2', 'SPRACHID',
              'HERSTELLERSYSTEM', 'GUELTIGFUERMONTAGE', 'GUELTIGFUEREK',
              'GUELTIGFUERVK', 'EKFUSSRABATTFAEHIG', 'VKFUSSRABATTFAEHIG',
              'ZFUSSRABATTFAEHIG', 'UEBERSTEUERBAR', 'ERLOESKONTO'],
    sqliteDecl: `PREISGRUPPE TEXT, BEZEICHNUNG1 TEXT, BEZEICHNUNG2 TEXT,
                 SPRACHID REAL, HERSTELLERSYSTEM TEXT, GUELTIGFUERMONTAGE INTEGER,
                 GUELTIGFUEREK INTEGER, GUELTIGFUERVK INTEGER,
                 EKFUSSRABATTFAEHIG INTEGER, VKFUSSRABATTFAEHIG INTEGER,
                 ZFUSSRABATTFAEHIG INTEGER, UEBERSTEUERBAR INTEGER,
                 ERLOESKONTO TEXT`,
    indexes: ['CREATE INDEX IF NOT EXISTS IX_PREISGRUPPE ON PREISGRUPPE(PREISGRUPPE, SPRACHID)'],
    query: `SELECT PHASEA_COLS FROM PREISGRUPPE`,
  },
  {
    name: 'PREISZYK',
    columns: ['KURZBEZ', 'BEZEICHNUNG', 'GUELTIGKEIT', 'WAEHRUNG',
              'WAEHRUNGNACHKOMMA', 'RUNDUNGSART', 'ZYKLUS', 'FAKTOR',
              'BASISWAEHRUNG', 'HERSTELLERSYSTEM', 'PREISLISTEKUNDE',
              'SEKUNDAERWAEHRUNG', 'SPRACHID', 'FAKTORHAENDLER',
              'GUELTIGFUEREK', 'GUELTIGFUERVK'],
    sqliteDecl: `KURZBEZ TEXT PRIMARY KEY, BEZEICHNUNG TEXT, GUELTIGKEIT TEXT,
                 WAEHRUNG TEXT, WAEHRUNGNACHKOMMA INTEGER, RUNDUNGSART INTEGER,
                 ZYKLUS INTEGER, FAKTOR REAL, BASISWAEHRUNG TEXT,
                 HERSTELLERSYSTEM TEXT, PREISLISTEKUNDE TEXT,
                 SEKUNDAERWAEHRUNG TEXT, SPRACHID REAL, FAKTORHAENDLER REAL,
                 GUELTIGFUEREK INTEGER, GUELTIGFUERVK INTEGER`,
    indexes: ['CREATE INDEX IF NOT EXISTS IX_PREISZYK_CYCLE ON PREISZYK(ZYKLUS, WAEHRUNG)'],
    query: `SELECT PHASEA_COLS FROM PREISZYK`,
  },
  {
    name: 'ARTIKEL',
    columns: ['ARTNR', 'BEZEICHNUNG', 'MINBREITE', 'MINHOEHE', 'MAXBREITE',
              'MAXHOEHE', 'HERSTELLERSYSTEM', 'MATERIALART', 'PRODUKTTYP',
              'ELEMENTTYP', 'ARTIKELID', 'FELDANZAHL', 'TUER', 'STULP'],
    sqliteDecl: `ARTNR TEXT, BEZEICHNUNG TEXT, MINBREITE REAL, MINHOEHE REAL,
                 MAXBREITE REAL, MAXHOEHE REAL, HERSTELLERSYSTEM TEXT,
                 MATERIALART INTEGER, PRODUKTTYP INTEGER, ELEMENTTYP INTEGER,
                 ARTIKELID REAL PRIMARY KEY, FELDANZAHL INTEGER, TUER TEXT, STULP TEXT`,
    indexes: ['CREATE INDEX IF NOT EXISTS IX_ARTIKEL_ARTNR ON ARTIKEL(ARTNR)'],
    query: `SELECT PHASEA_COLS FROM ARTIKEL`,
  },
  {
    name: 'ARTPREISE',
    columns: ['ARTIKELID', 'PREISSCHEMAID', 'PREISFELDNR', 'WERT',
              'LASTCHANGE', 'LASTUSER'],
    sqliteDecl: `ARTIKELID REAL, PREISSCHEMAID INTEGER, PREISFELDNR INTEGER,
                 WERT REAL, LASTCHANGE TEXT, LASTUSER REAL`,
    indexes: ['CREATE INDEX IF NOT EXISTS IX_ARTPREISE ON ARTPREISE(ARTIKELID, PREISSCHEMAID, PREISFELDNR)'],
    query: `SELECT PHASEA_COLS FROM ARTPREISE`,
  },
  {
    name: 'AUFPOS',
    // Minimum subset needed to link AUFARTIK rows to their article/profile,
    // and to serve as a golden source for the coverage harness.
    columns: ['AUFNR', 'POSNR', 'ARTNR', 'ARTTYP', 'ARTIKELKLASSE',
              'EINHBREITE', 'EINHHOEHE', 'PROFILFARBE', 'FL_PROFILNR',
              'RA_PROFILNR', 'PROFILSATZNAME', 'FELDANZAHL',
              'EKPOSPREIS', 'VKPOSPREIS'],
    sqliteDecl: `AUFNR INTEGER, POSNR INTEGER, ARTNR TEXT, ARTTYP TEXT,
                 ARTIKELKLASSE TEXT, EINHBREITE REAL, EINHHOEHE REAL,
                 PROFILFARBE TEXT, FL_PROFILNR TEXT, RA_PROFILNR TEXT,
                 PROFILSATZNAME TEXT, FELDANZAHL INTEGER,
                 EKPOSPREIS REAL, VKPOSPREIS REAL`,
    indexes: [
      'CREATE INDEX IF NOT EXISTS IX_AUFPOS_POS ON AUFPOS(AUFNR, POSNR)',
      'CREATE INDEX IF NOT EXISTS IX_AUFPOS_ARTICLE ON AUFPOS(ARTNR, PROFILSATZNAME)',
    ],
    query: `SELECT PHASEA_COLS FROM AUFPOS WHERE ARTTYP = 'E'`,
  },
  {
    name: 'AUFARTIK',
    columns: ['AUFNR', 'REFPOSNR', 'GRUPPE', 'LFDNR', 'ARTKLCODE', 'ARTNR',
              'GESBREITE', 'GESHOEHE', 'ESFELD', 'ARTIKELVARIABLEN', 'ARTIKELVARIABLEN2'],
    sqliteDecl: `AUFNR INTEGER, REFPOSNR INTEGER, GRUPPE INTEGER, LFDNR INTEGER,
                 ARTKLCODE INTEGER, ARTNR TEXT, GESBREITE REAL, GESHOEHE REAL,
                 ESFELD TEXT, ARTIKELVARIABLEN TEXT, ARTIKELVARIABLEN2 TEXT`,
    indexes: [
      'CREATE INDEX IF NOT EXISTS IX_AUFARTIK_CLASS ON AUFARTIK(ARTKLCODE, AUFNR, REFPOSNR)',
      'CREATE INDEX IF NOT EXISTS IX_AUFARTIK_ARTICLE ON AUFARTIK(ARTNR, ARTKLCODE)',
    ],
    // Keep only rows where ARTIKELVARIABLEN is populated — these are the
    // config-bearing rows. Limit to ARTKLCODE 1805 (INFO) and 1199 (TECH)
    // which carry the fields pricing formulas reference (ART_1805_MatrixName,
    // ART_1805_ETyp, ART_1805_MatArt, ART_1199_MacierzOku, ...).
    query: `SELECT PHASEA_COLS FROM AUFARTIK WHERE ARTKLCODE IN (1805, 1199, 1850) AND ARTIKELVARIABLEN IS NOT NULL AND ARTIKELVARIABLEN <> ''`,
  },
  {
    name: 'GLASS_PANE',
    columns: ['ARTICLENO', 'ARTIKELID', 'THICKNESS', 'WEIGHT', 'GLASSTYPE',
              'EXCHANGEGROUP', 'COATEDTYPE', 'SORTINDEX'],
    sqliteDecl: `ARTICLENO TEXT, ARTIKELID REAL, THICKNESS REAL, WEIGHT REAL,
                 GLASSTYPE INTEGER, EXCHANGEGROUP TEXT, COATEDTYPE INTEGER,
                 SORTINDEX INTEGER`,
    indexes: ['CREATE INDEX IF NOT EXISTS IX_GLASS_PANE_CODE ON GLASS_PANE(ARTICLENO)'],
    query: `SELECT PHASEA_COLS FROM GLASS_PANE`,
  },
  {
    name: 'GLASS_SPACER',
    columns: ['ARTICLENO', 'ARTIKELID'],
    sqliteDecl: `ARTICLENO TEXT, ARTIKELID REAL`,
    indexes: ['CREATE INDEX IF NOT EXISTS IX_GLASS_SPACER_CODE ON GLASS_SPACER(ARTICLENO)'],
    query: `SELECT PHASEA_COLS FROM GLASS_SPACER`,
  },
  {
    name: 'ARTVARBL',
    columns: ['ARTKLCODE', 'ARTNR', 'LFDNR', 'VARNAME', 'VARTYP',
              'ZUWFORMEL', 'WENNFORMEL', 'HERSTELLERSYSTEM', 'BEZEICHNUNG1', 'SPRACHID'],
    sqliteDecl: `ARTKLCODE INTEGER, ARTNR TEXT, LFDNR INTEGER, VARNAME TEXT,
                 VARTYP INTEGER, ZUWFORMEL TEXT, WENNFORMEL TEXT,
                 HERSTELLERSYSTEM TEXT, BEZEICHNUNG1 TEXT, SPRACHID REAL`,
    indexes: ['CREATE INDEX IF NOT EXISTS IX_ARTVARBL ON ARTVARBL(VARNAME, ARTKLCODE, ARTNR)'],
    query: `SELECT PHASEA_COLS FROM ARTVARBL`,
  },
];

function sha256OfRows(rows) {
  const h = createHash('sha256');
  for (const r of rows) h.update(JSON.stringify(r));
  return h.digest('hex');
}

async function fetchAll(tableName, baseQuery, columns) {
  const cols = columns.map(c => `[${c}]`).join(', ');
  const q = baseQuery.replace('PHASEA_COLS', cols);
  console.log(`  [${tableName}] ${q.length > 120 ? q.slice(0, 120) + '...' : q}`);
  const rs = await sql.query(q);
  return rs.recordset || [];
}

function toSqliteValue(v) {
  if (v === undefined) return null;
  if (v instanceof Date) return v.toISOString();
  if (typeof v === 'boolean') return v ? 1 : 0;
  return v;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  console.log(`[sync] DB target: ${OUT_DB}`);

  await sql.connect(CANTOR_CONFIG);
  const db = new Database(OUT_DB);
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');

  const meta = {
    last_synced_at: new Date().toISOString(),
    source: { server: CANTOR_CONFIG.server, database: CANTOR_CONFIG.database },
    sync_script_version: '0.1.0',
    phase: 'A',
    filters: {
      PREISMAT: 'NUMMER = 2301',
      PREISE: 'ZYKLUS = 2301',
    },
    tables: {},
  };

  for (const t of TABLES) {
    const rows = await fetchAll(t.name, t.query, t.columns);
    // Rebuild table
    db.exec(`DROP TABLE IF EXISTS ${t.name}`);
    db.exec(`CREATE TABLE ${t.name} (${t.sqliteDecl})`);
    for (const idx of t.indexes) db.exec(idx);

    if (rows.length > 0) {
      const colList = t.columns.join(', ');
      const placeholders = t.columns.map(() => '?').join(', ');
      const stmt = db.prepare(`INSERT INTO ${t.name} (${colList}) VALUES (${placeholders})`);
      const insertMany = db.transaction((arr) => {
        for (const row of arr) {
          stmt.run(t.columns.map(c => toSqliteValue(row[c])));
        }
      });
      insertMany(rows);
    }

    const hash = sha256OfRows(rows);
    meta.tables[t.name] = { row_count: rows.length, sha256: hash };
    console.log(`  [${t.name}] ${rows.length.toLocaleString()} rows  sha256=${hash.slice(0, 12)}...`);
  }

  db.close();
  await sql.close();

  writeFileSync(OUT_META, JSON.stringify(meta, null, 2));
  console.log(`[sync] Meta written: ${OUT_META}`);
  console.log(`[sync] Done.`);
}

main().catch(err => {
  console.error('[sync] FAILED:', err?.message || err);
  if (err?.stack) console.error(err.stack);
  process.exit(1);
});
