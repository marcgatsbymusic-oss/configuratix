#!/usr/bin/env node
// Build a minimal SQLite fixture that the pricing tests can run against on CI.
//
// The full cantor.sqlite is 110 MB (gitignored). This script extracts only
// the rows the committed goldens actually touch, producing a small file
// tests/pricing/fixtures/cantor.fixture.sqlite that's safe to commit.
//
// Run after cantor:sync to refresh the fixture when goldens change.

import Database from 'better-sqlite3';
import { readdirSync, readFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');
const SRC_DB = resolve(REPO_ROOT, 'src', 'data', 'cantor', 'cantor.sqlite');
const FIX_DIR = resolve(REPO_ROOT, 'tests', 'pricing', 'fixtures');
const FIX_DB = resolve(FIX_DIR, 'cantor.fixture.sqlite');
const GOLDEN_DIR = resolve(REPO_ROOT, 'tests', 'pricing', 'goldens');

function collectProfilsatze() {
  const pss = new Set();
  for (const fn of readdirSync(GOLDEN_DIR)) {
    if (!fn.endsWith('.json')) continue;
    const g = JSON.parse(readFileSync(resolve(GOLDEN_DIR, fn), 'utf8'));
    pss.add(g.input.profilsatz);
  }
  return [...pss];
}

function main() {
  mkdirSync(FIX_DIR, { recursive: true });

  if (existsSync(FIX_DB)) rmSync(FIX_DB);
  const src = new Database(SRC_DB, { readonly: true, fileMustExist: true });
  const dst = new Database(FIX_DB);

  // Exact schema replica — we re-apply the same CREATE statements the sync
  // script emits so PMatRow column positions line up.
  const tables = src.prepare(`SELECT name, sql FROM sqlite_master WHERE type = 'table' ORDER BY name`).all();
  for (const t of tables) {
    if (t.name.startsWith('sqlite_')) continue;
    dst.exec(t.sql);
  }
  const indexes = src.prepare(`SELECT sql FROM sqlite_master WHERE type = 'index' AND sql IS NOT NULL`).all();
  for (const i of indexes) dst.exec(i.sql);

  const profilsatze = collectProfilsatze();
  // Derive system codes used in matrix KLASSE2 (IG5, IGE, ...) from the
  // profilsatz names in the goldens. We keep the full row set for PREISE,
  // PREISSCHEMA*, PREISGRUPPE, PREISZYK, ARTIKEL, ARTVARBL, GLASS_* (small
  // tables) and filter PREISMAT/ARTPREISE to what the goldens exercise.
  // (matrix, k1, k2) tuples the Phase A+B formulas touch for our goldens.
  // Keep the entire (w,h) grid for PVC_F100[F][IG5] so the fixture can answer
  // any size; the other matrices are category-style with a single (1,1) row.
  const keepTuples = [
    ['PVC_F100',  'F',            'IG5',     null],
    ['PVC_F100',  'UR',           'IG5',     null],
    ['PVC_FACTOR','IG5',          '',        null],
    ['ALL_DOD',   'SZYBY',        'GABARYT', null],
    ['PVC_DOD',   'OSC',          'IG5',     null],
    ['PVC_DOD',   'WZMOCNIENIE',  '',        null],
    ['PVC_DOD',   'PRG',          'IG5',     null],
    ['PVC_DOD',   'x810',         'INNE4',   null],
    ['PVC_DOD',   'x810',         'INNE5',   null],
    ['PVC_DOD',   'SKOSNA_PRZEW', 'IG5',     null],
  ];

  const tblRowCounts = {};
  for (const t of tables) {
    if (t.name.startsWith('sqlite_')) continue;
    let rows;
    if (t.name === 'PREISMAT') {
      rows = [];
      for (const [matrix, k1, k2] of keepTuples) {
        const chunk = src.prepare(
          `SELECT * FROM PREISMAT WHERE PREISMATRIX = ? AND KLASSE1 = ? AND KLASSE2 = ?`,
        ).all(matrix, k1, k2);
        rows.push(...chunk);
      }
    } else if (t.name === 'AUFPOS') {
      // Keep only positions matching the goldens (article × profilsatz combos).
      const combos = new Set();
      for (const fn of readdirSync(GOLDEN_DIR)) {
        if (!fn.endsWith('.json')) continue;
        const g = JSON.parse(readFileSync(resolve(GOLDEN_DIR, fn), 'utf8'));
        combos.add(`${g.input.article}|${g.input.profilsatz}`);
      }
      rows = src.prepare(`SELECT * FROM AUFPOS`).all().filter(
        r => combos.has(`${r.ARTNR}|${r.PROFILSATZNAME}`),
      );
    } else if (t.name === 'AUFARTIK') {
      // Keep only AUFARTIK rows paired with retained AUFPOS positions.
      const posKeys = new Set();
      const combos = new Set();
      for (const fn of readdirSync(GOLDEN_DIR)) {
        if (!fn.endsWith('.json')) continue;
        const g = JSON.parse(readFileSync(resolve(GOLDEN_DIR, fn), 'utf8'));
        combos.add(`${g.input.article}|${g.input.profilsatz}`);
      }
      const posRows = src.prepare(`SELECT AUFNR, POSNR FROM AUFPOS WHERE ARTNR || '|' || PROFILSATZNAME IN (${[...combos].map(() => '?').join(',')})`).all(...combos);
      for (const p of posRows) posKeys.add(`${p.AUFNR}/${p.POSNR}`);
      rows = src.prepare(`SELECT * FROM AUFARTIK`).all().filter(
        r => posKeys.has(`${r.AUFNR}/${r.REFPOSNR}`),
      );
    } else if (t.name === 'ARTPREISE') {
      // Only the pane articles referenced by goldens + associated schemas.
      const artIds = new Set();
      for (const fn of readdirSync(GOLDEN_DIR)) {
        if (!fn.endsWith('.json')) continue;
        const g = JSON.parse(readFileSync(resolve(GOLDEN_DIR, fn), 'utf8'));
        for (const p of g.input.glazing.panes) {
          const row = src.prepare(`SELECT ARTIKELID FROM GLASS_PANE WHERE ARTICLENO = ?`).get(p);
          if (row) artIds.add(row.ARTIKELID);
        }
      }
      if (artIds.size === 0) { rows = []; }
      else {
        const ph = [...artIds].map(() => '?').join(',');
        rows = src.prepare(`SELECT * FROM ARTPREISE WHERE ARTIKELID IN (${ph})`).all(...artIds);
      }
    } else {
      rows = src.prepare(`SELECT * FROM ${t.name}`).all();
    }

    if (rows.length > 0) {
      const cols = Object.keys(rows[0]);
      const stmt = dst.prepare(
        `INSERT INTO ${t.name} (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`,
      );
      const tx = dst.transaction(rs => { for (const r of rs) stmt.run(cols.map(c => r[c])); });
      tx(rows);
    }
    tblRowCounts[t.name] = rows.length;
    console.log(`  ${t.name}: ${rows.length.toLocaleString()} rows`);
  }

  src.close();
  dst.close();
  console.log(`\nFixture written to ${FIX_DB}`);
}

main();
