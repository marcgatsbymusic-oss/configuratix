#!/usr/bin/env node
// Bulk coverage check: reprice every real AUFPOS row (ARTTYP='E') through
// the new engine and compare to what Cantor stored.
//
// Categorises each row as:
//   ✓ match        — engine total == AUFPOS.VKPOSPREIS within €0.05
//   ✗ mismatch     — engine returned a number but it differs from Cantor
//   — unsupported  — engine threw (configuration outside Phase A/B scope)
//
// Prints a summary table by (article, profilsatz, color) and lists the
// first few mismatches for triage. Rows where VKPOSPREIS is 0 (unpriced
// test skeletons) are skipped.
//
// Usage:  node scripts/cantor/coverage_replay.mjs            # all orders
//         node scripts/cantor/coverage_replay.mjs --limit=20 # sample
//         node scripts/cantor/coverage_replay.mjs --verbose  # show all rows

import sql from 'mssql/msnodesqlv8.js';
import { handlePriceRequest } from './pricingServer.ts';

const CANTOR_CONFIG = {
  server: 'localhost\\CANTOR2019',
  database: 'DRUTEX_DEALER',
  options: { trustedConnection: true, enableArithAbort: true },
  driver: 'msnodesqlv8',
};

const TOLERANCE_EUR = 0.05;

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    limit: Number(args.find(a => a.startsWith('--limit='))?.split('=')[1] ?? Infinity),
    verbose: args.includes('--verbose'),
  };
}

function classifyOpening(article, sashCount) {
  // Very rough typology → opening class mapping. Good enough to feed the
  // engine; if it's wrong the mismatch will be obvious and we fix per-article.
  if (article.startsWith('F10')) return ['F'];
  if (article.startsWith('F2') || article.startsWith('F3') || article.startsWith('F4')) {
    return Array(sashCount).fill('DK');
  }
  if (article.startsWith('PP')) return ['F'];
  if (article.startsWith('CV')) return ['F'];
  return ['F'];
}

async function main() {
  const { limit, verbose } = parseArgs();
  await sql.connect(CANTOR_CONFIG);

  // Compare against AUFPREIS breakdown (what Cantor derives from formulas),
  // not AUFPOS.VKPOSPREIS (which includes line-level discounts). Also pull
  // the order's own VKFAKTORPREISZYK so historical orders with different
  // pricelists compare apples-to-apples.
  const posRs = await sql.query(`
    SELECT p.AUFNR, p.POSNR, p.ARTNR, p.EINHBREITE, p.EINHHOEHE,
           p.PROFILFARBE, p.FL_PROFILNR, p.RA_PROFILNR, p.PROFILSATZNAME,
           p.VKPOSPREIS, p.EKPOSPREIS, p.FELDANZAHL,
           h.EDATUM, h.VKFAKTORPREISZYK
    FROM AUFPOS p
    JOIN AUFKOPF h ON h.AUFNR = p.AUFNR
    WHERE p.ARTTYP = 'E' AND p.VKPOSPREIS > 0 AND h.VKFAKTORPREISZYK > 0
    ORDER BY p.AUFNR, p.POSNR
  `);

  // Fetch AUFPREIS sums per position: base ARTIKEL + pane deltas (SORTKEY2
  // prefix '1;' = delta row, '0;' = included-default with PREIS=0).
  const bdRs = await sql.query(`
    SELECT AUFNR, REFPOSNR, KEY1, KEYPREISART, SORTKEY1, SORTKEY2, PREIS
    FROM AUFPREIS WHERE PREIS > 0
  `);
  const bdByPos = new Map();
  for (const b of bdRs.recordset) {
    const k = `${b.AUFNR}/${b.REFPOSNR}`;
    if (!bdByPos.has(k)) bdByPos.set(k, []);
    bdByPos.get(k).push(b);
  }

  await sql.close();

  const rows = posRs.recordset.slice(0, limit);
  const results = { match: [], mismatch: [], unsupported: [] };

  for (const p of rows) {
    const sashCount = p.FELDANZAHL || 1;

    // Extract actual glazing from this order's own AUFPREIS rows so we feed
    // the engine the real config, not a hardcoded assumption. The FELDFUEL
    // row's SORTKEY1 is the glazing code (e.g. "2-24", "BS24"). PANE rows
    // with SORTKEY2 starting with "1;" are upgrade deltas — we only pass
    // panes to the engine if the order actually has deltas (otherwise the
    // default glazing is assumed and panes contribute 0).
    const bd = bdByPos.get(`${p.AUFNR}/${p.POSNR}`) ?? [];
    const glazingCode = bd.find(b => b.KEY1 === 'FELDFUEL')?.SORTKEY1 ?? '2-24';
    const upgradedPanes = [...new Set(bd
      .filter(b => b.KEY1 === 'PANE' && String(b.SORTKEY2).startsWith('1;'))
      .map(b => b.SORTKEY1))];

    const input = {
      article: p.ARTNR,
      profilsatz: p.PROFILSATZNAME || 'IG5',
      materialart: String(p.PROFILSATZNAME || '').includes('MB') ? 3 : 2,
      beschvar: 'FIX',
      width_mm: p.EINHBREITE,
      height_mm: p.EINHHOEHE,
      sashCount,
      openings: classifyOpening(p.ARTNR, sashCount),
      color: { code: p.PROFILFARBE || 'W-W' },
      frameProfile: p.RA_PROFILNR || '50001',
      sashProfile: p.FL_PROFILNR || '50011',
      glazing: { code: glazingCode, panes: upgradedPanes, spacer: 'S16' },
      schwelle: 0,
      dealer: { kundenNr: 1008, pricelistKurzbez: 'EUR23011', land: 'CH' },
    };

    const r = await handlePriceRequest(JSON.stringify({ input }));
    const tag = `${p.AUFNR}/${p.POSNR} ${p.ARTNR} ${p.PROFILSATZNAME} ${p.EINHBREITE}×${p.EINHHOEHE} ${p.PROFILFARBE}`;

    if (!r.ok) {
      results.unsupported.push({ tag, reason: r.error });
      if (verbose) console.log(`  —  ${tag}\n       ${r.error}`);
      continue;
    }

    // Compare against the sum of AUFPREIS lines (the pre-discount, pre-sum
    // breakdown Cantor itself derived). Base = ARTIKEL V PREIS; add pane
    // delta rows (SORTKEY2 starting with '1;') for V as well.
    const breakdown = bdByPos.get(`${p.AUFNR}/${p.POSNR}`) ?? [];
    const cantorBase = breakdown.find(b => b.KEY1 === 'ARTIKEL' && b.KEYPREISART === 'V')?.PREIS ?? 0;
    const cantorPanes = breakdown
      .filter(b => b.KEY1 === 'PANE' && b.KEYPREISART === 'V' && String(b.SORTKEY2).startsWith('1;'))
      .reduce((s, b) => s + b.PREIS, 0);
    const cantorExpected = cantorBase + cantorPanes;  // already in dealer currency
    const engineVK = r.ek_pln * (p.VKFAKTORPREISZYK || r.faktor);

    const delta = engineVK - cantorExpected;
    const display = `engine ${engineVK.toFixed(2)} ${r.currency}  cantor ${cantorExpected.toFixed(2)} (base ${cantorBase} + panes ${cantorPanes.toFixed(2)})`;

    if (Math.abs(delta) <= TOLERANCE_EUR) {
      results.match.push({ tag, display });
      if (verbose) console.log(`  ✓  ${tag}   ${display}`);
    } else {
      results.mismatch.push({ tag, engine: engineVK, cantor: cantorExpected, delta, display });
      if (verbose) console.log(`  ✗  ${tag}   Δ${delta.toFixed(2)}  ${display}`);
    }
  }

  const total = rows.length;
  const pct = n => ((n / total) * 100).toFixed(1);
  console.log(`\n=== Coverage summary (${total} priced positions) ===`);
  console.log(`  ✓  match        ${results.match.length.toString().padStart(3)}  (${pct(results.match.length)}%)`);
  console.log(`  ✗  mismatch     ${results.mismatch.length.toString().padStart(3)}  (${pct(results.mismatch.length)}%)`);
  console.log(`  —  unsupported  ${results.unsupported.length.toString().padStart(3)}  (${pct(results.unsupported.length)}%)`);

  if (results.mismatch.length > 0) {
    console.log(`\n--- First 10 mismatches (engine delivered a number but it's wrong) ---`);
    for (const m of results.mismatch.slice(0, 10)) {
      console.log(`  Δ${m.delta.toFixed(2).padStart(7)}  ${m.tag}`);
      console.log(`          ${m.display}`);
    }
  }

  if (results.unsupported.length > 0) {
    console.log(`\n--- First 10 unsupported (Phase A/B scope gaps) ---`);
    for (const u of results.unsupported.slice(0, 10)) {
      console.log(`  —  ${u.tag}`);
      console.log(`     ${u.reason}`);
    }
  }

  process.exit(results.mismatch.length > 0 ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(2); });
