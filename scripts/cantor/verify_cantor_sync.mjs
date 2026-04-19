#!/usr/bin/env node
// Verify the Cantor mirror is still in sync with the live source.
//
// Two modes (both run by default):
//   1. Schema/data drift: re-checksum each mirrored table from live Cantor and
//      compare with sync_meta.json. Reports counts and sha256 deltas.
//   2. Engine drift: run the Vitest pricing suite (which loads goldens and
//      reprices through the interpreter).
//
// Exit code: 0 on full pass, 1 on any drift. Wire into CI to gate merges.

import sql from 'mssql/msnodesqlv8.js';
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');
const META_PATH = resolve(REPO_ROOT, 'src', 'data', 'cantor', 'sync_meta.json');

const CANTOR_CONFIG = {
  server: 'localhost\\CANTOR2019',
  database: 'DRUTEX_DEALER',
  options: { trustedConnection: true, enableArithAbort: true },
  driver: 'msnodesqlv8',
};

// Mirror the same column lists used by sync_cantor_pricing.mjs so checksums match.
const TABLE_QUERIES = {
  PREISMAT: `SELECT [NUMMER], [PREISMATRIX], [KLASSE1], [KLASSE2], [BREITE], [HOEHE], [PREIS], [PREIS2], [PREIS3], [PREIS4], [PREIS5], [PREIS6], [PREIS7], [PREIS8], [PREIS9], [PREIS10], [HERSTELLERSYSTEM] FROM PREISMAT WHERE NUMMER = 2301`,
  PREISE: `SELECT [ZYKLUS], [KUNDENR], [KEY1], [KEY2], [KEY3], [KEY4], [PREISART], [MONTIERT], [PREISNR], [LFDNR], [MENGENEINHEIT], [PREISTYP], [MIN], [PREISSTUECK], [PREISEINHEIT], [PROZENT], [MATRIX], [FORMEL], [FORMELTEXT], [SICHTBAR], [PREISGRUPPE], [FARBGRUPPE], [HERSTELLERSYSTEM], [TEXTNR], [SPRACHID], [KLASSE1], [KLASSE2], [EBENE], [SORTINDEX] FROM PREISE WHERE ZYKLUS = 2301`,
  PREISSCHEMA: `SELECT [PREISSCHEMAID], [BEZEICHNUNG1], [BEZEICHNUNG2], [BEZEICHNUNG3], [ARTIKELBEREICH], [SPRACHID], [GRUPPIERUNG], [SORTINDEX], [GUELTIGAB], [STATUS], [LASTCHANGE], [LASTUSER], [ARTIKELKLASSEN], [GUELTIGFUEREK], [GUELTIGFUERVK], [FUELLUNGMITSTUECKLISTE] FROM PREISSCHEMA`,
  PREISSCHEMAD: `SELECT [PREISSCHEMAID], [PREISFELDNR], [BEZEICHNUNG1], [BEZEICHNUNG2], [SPALTENUEBERSCHRIFT], [SPRACHID], [GRUPPIERUNG], [SORTINDEX], [STATUS], [NACHKOMMA], [BERECHNETESFELD], [FORMEL], [SICHTBARKEIT] FROM PREISSCHEMAD`,
  PREISGRUPPE: `SELECT [PREISGRUPPE], [BEZEICHNUNG1], [BEZEICHNUNG2], [SPRACHID], [HERSTELLERSYSTEM], [GUELTIGFUERMONTAGE], [GUELTIGFUEREK], [GUELTIGFUERVK], [EKFUSSRABATTFAEHIG], [VKFUSSRABATTFAEHIG], [ZFUSSRABATTFAEHIG], [UEBERSTEUERBAR], [ERLOESKONTO] FROM PREISGRUPPE`,
  PREISZYK: `SELECT [KURZBEZ], [BEZEICHNUNG], [GUELTIGKEIT], [WAEHRUNG], [WAEHRUNGNACHKOMMA], [RUNDUNGSART], [ZYKLUS], [FAKTOR], [BASISWAEHRUNG], [HERSTELLERSYSTEM], [PREISLISTEKUNDE], [SEKUNDAERWAEHRUNG], [SPRACHID], [FAKTORHAENDLER], [GUELTIGFUEREK], [GUELTIGFUERVK] FROM PREISZYK`,
  ARTIKEL: `SELECT [ARTNR], [BEZEICHNUNG], [MINBREITE], [MINHOEHE], [MAXBREITE], [MAXHOEHE], [HERSTELLERSYSTEM], [MATERIALART], [PRODUKTTYP], [ELEMENTTYP], [ARTIKELID], [FELDANZAHL], [TUER], [STULP] FROM ARTIKEL`,
  ARTPREISE: `SELECT [ARTIKELID], [PREISSCHEMAID], [PREISFELDNR], [WERT], [LASTCHANGE], [LASTUSER] FROM ARTPREISE`,
  ARTVARBL: `SELECT [ARTKLCODE], [ARTNR], [LFDNR], [VARNAME], [VARTYP], [ZUWFORMEL], [WENNFORMEL], [HERSTELLERSYSTEM], [BEZEICHNUNG1], [SPRACHID] FROM ARTVARBL`,
};

function sha256OfRows(rows) {
  const h = createHash('sha256');
  for (const r of rows) h.update(JSON.stringify(r));
  return h.digest('hex');
}

async function checkDataDrift() {
  if (!existsSync(META_PATH)) {
    console.error(`[verify] sync_meta.json missing at ${META_PATH}. Run npm run cantor:sync first.`);
    return false;
  }
  const meta = JSON.parse(readFileSync(META_PATH, 'utf8'));
  await sql.connect(CANTOR_CONFIG);

  let allOk = true;
  for (const [table, query] of Object.entries(TABLE_QUERIES)) {
    const rs = await sql.query(query);
    const rows = rs.recordset || [];
    const liveHash = sha256OfRows(rows);
    const stored = meta.tables?.[table];
    if (!stored) {
      console.warn(`[verify] ${table}: no stored checksum (skipping)`);
      continue;
    }
    const ok = stored.row_count === rows.length && stored.sha256 === liveHash;
    const status = ok ? '✓' : '✗';
    console.log(`  ${status} ${table}: rows ${rows.length.toLocaleString()} (was ${stored.row_count.toLocaleString()})  live=${liveHash.slice(0, 12)}  stored=${stored.sha256.slice(0, 12)}`);
    if (!ok) allOk = false;
  }

  await sql.close();
  return allOk;
}

function checkEngineDrift() {
  console.log('\n[verify] Running pricing test suite...');
  const r = spawnSync(process.execPath, [resolve(REPO_ROOT, 'node_modules/vitest/vitest.mjs'), 'run', 'tests/pricing/'], {
    cwd: REPO_ROOT,
    stdio: 'inherit',
  });
  return r.status === 0;
}

async function main() {
  console.log('[verify] Checking Cantor data drift...');
  const dataOk = await checkDataDrift();
  const engineOk = checkEngineDrift();

  if (!dataOk) console.error('\n[verify] DATA DRIFT detected — re-run npm run cantor:sync');
  if (!engineOk) console.error('\n[verify] ENGINE DRIFT detected — pricing tests failed');

  process.exit(dataOk && engineOk ? 0 : 1);
}

main().catch(err => {
  console.error('[verify] FAILED:', err?.message || err);
  process.exit(1);
});
