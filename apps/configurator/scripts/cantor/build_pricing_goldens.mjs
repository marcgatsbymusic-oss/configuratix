#!/usr/bin/env node
// Build pricing golden files from real Cantor orders.
//
// Usage:  node scripts/cantor/build_pricing_goldens.mjs <AUFNR> [<AUFNR> ...]
//
// For each (AUFNR, REFPOSNR) on the order, reads the configurator-equivalent
// input from AUFPOS and the expected line-item breakdown from AUFPREIS, then
// writes tests/pricing/goldens/auf_<AUFNR>_<REFPOSNR>.json.
//
// Phase A produces goldens for the base-window SCHEMA 41 only. Pane / color /
// profile breakdown will be added in subsequent phases as the engine handles
// each.

import sql from 'mssql/msnodesqlv8.js';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');
const OUT_DIR = resolve(REPO_ROOT, 'tests', 'pricing', 'goldens');

const CANTOR_CONFIG = {
  server: 'localhost\\CANTOR2019',
  database: 'DRUTEX_DEALER',
  options: { trustedConnection: true, enableArithAbort: true },
  driver: 'msnodesqlv8',
};

async function fetchOrder(aufnr) {
  const head = await sql.query(`
    SELECT AUFNR, KDNR, NAME1, EDATUM, GESPREISBRUTTO, GESPREISNETTO,
           VKFAKTORPREISZYK
    FROM AUFKOPF WHERE AUFNR = ${aufnr}
  `);
  const positions = await sql.query(`
    SELECT POSNR, STCK, ARTNR, EINHBREITE, EINHHOEHE, PROFILFARBE,
           FL_PROFILNR, RA_PROFILNR, ARTIKELKLASSE, GESENDPREIS, POSPREIS,
           VKPOSPREIS, EKPOSPREIS, PROFILSATZNAME, FELDANZAHL
    FROM AUFPOS WHERE AUFNR = ${aufnr} ORDER BY POSNR
  `);
  const breakdown = await sql.query(`
    SELECT REFPOSNR, KEY1, KEYPREISART, SORTKEY1, SORTKEY2, PREISGRUPPE,
           PREIS, LISTENPREIS, PREISSCHEMAID, ARTIKELID, ARTKLCODE
    FROM AUFPREIS WHERE AUFNR = ${aufnr}
    ORDER BY REFPOSNR, KEY1, KEYPREISART
  `);
  return {
    head: head.recordset?.[0] ?? null,
    positions: positions.recordset || [],
    breakdown: breakdown.recordset || [],
  };
}

function buildGolden(aufnr, head, pos, posBreakdown) {
  // Map AUFPOS row to ConfiguratorInput (Phase A subset). Fields not yet
  // surfaced in the configurator are taken from the Cantor row verbatim so
  // the engine can reproduce the breakdown.
  const articleEK = posBreakdown.find(r => r.KEY1 === 'ARTIKEL' && r.KEYPREISART === 'E');
  const articleVK = posBreakdown.find(r => r.KEY1 === 'ARTIKEL' && r.KEYPREISART === 'V');
  const paneEKDelta = posBreakdown
    .filter(r => r.KEY1 === 'PANE' && r.KEYPREISART === 'E' && r.SORTKEY2?.startsWith('1;'))
    .reduce((s, r) => s + (r.PREIS || 0), 0);

  const beschvarEK = posBreakdown.find(r => r.KEY1 === 'BESCHVAR' && r.KEYPREISART === 'E');
  let beschvarStr = 'FIX';
  let openingClass = 'F';
  if (beschvarEK && beschvarEK.SORTKEY1) {
    beschvarStr = beschvarEK.SORTKEY1;
    // Map descriptive beschvar strings (e.g. 'UR-P', 'DK-L') to base opening codes expected by engine
    if (beschvarStr.startsWith('UR') || beschvarStr.startsWith('DK')) {
       openingClass = 'UR';
    } else if (beschvarStr.startsWith('D')) {
       openingClass = 'DK'; // Using DK for standard Dreh
    }
  }

  return {
    source: `AUFNR ${aufnr} / REFPOSNR ${pos.POSNR} (extracted from local Cantor DRUTEX_DEALER on ${new Date().toISOString().slice(0, 10)})`,
    cantorRaw: { head, position: pos, breakdown: posBreakdown },
    input: {
      article: pos.ARTNR,
      profilsatz: pos.PROFILSATZNAME,
      materialart: 2,
      beschvar: beschvarStr,
      width_mm: pos.EINHBREITE,
      height_mm: pos.EINHHOEHE,
      sashCount: pos.FELDANZAHL || 1,
      openings: Array(pos.FELDANZAHL || 1).fill(openingClass),
      color: { code: pos.PROFILFARBE || 'W-W' },
      frameProfile: pos.RA_PROFILNR,
      sashProfile: pos.FL_PROFILNR,
      glazing: { code: '2-24', panes: ['FL4', 'T4'], spacer: 'S16' },
      schwelle: 0,
      dealer: {
        kundenNr: head.KDNR,
        pricelistKurzbez: 'EUR23011',
        land: 'CH',
      },
    },
    expected: {
      ek_pln_baseSchema41: articleEK?.PREIS ?? null,
      vk_eur_baseSchema41_approx: articleVK?.PREIS ?? null,
      ek_pln_total_with_panes: pos.EKPOSPREIS,
      vk_eur_total_with_panes_approx: pos.VKPOSPREIS,
      tolerance_eur: 0.5,
      panes_ek_delta: paneEKDelta,
    },
  };
}

async function main() {
  const aufnrs = process.argv.slice(2).map(s => parseInt(s, 10)).filter(n => Number.isFinite(n));
  if (aufnrs.length === 0) {
    console.error('Usage: node scripts/cantor/build_pricing_goldens.mjs <AUFNR> [<AUFNR> ...]');
    process.exit(1);
  }
  mkdirSync(OUT_DIR, { recursive: true });
  await sql.connect(CANTOR_CONFIG);
  for (const aufnr of aufnrs) {
    const { head, positions, breakdown } = await fetchOrder(aufnr);
    if (!head) {
      console.warn(`[golden] AUFNR ${aufnr}: not found, skipping`);
      continue;
    }
    for (const pos of positions) {
      if (pos.ARTTYP === 'B') continue; // Skip BOM lines (GLOBAL/MONT/TS)
      const breakdownForPos = breakdown.filter(b => b.REFPOSNR === pos.POSNR);
      if (breakdownForPos.length === 0) continue;
      const out = resolve(OUT_DIR, `auf_${aufnr}_${pos.POSNR}.json`);
      writeFileSync(out, JSON.stringify(buildGolden(aufnr, head, pos, breakdownForPos), null, 2));
      console.log(`[golden] ${out}`);
    }
  }
  await sql.close();
}

main().catch(err => {
  console.error('[golden] FAILED:', err?.message || err);
  process.exit(1);
});
