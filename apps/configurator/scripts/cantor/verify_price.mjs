#!/usr/bin/env node
// Standalone price check: run the engine against current Cantor live data and
// compare with AUFPOS.VKPOSPREIS. Usage:  node scripts/cantor/verify_price.mjs <AUFNR>

import sql from 'mssql/msnodesqlv8.js';
import { handlePriceRequest } from './pricingServer.ts';

const CANTOR_CONFIG = {
  server: 'localhost\\CANTOR2019',
  database: 'DRUTEX_DEALER',
  options: { trustedConnection: true, enableArithAbort: true },
  driver: 'msnodesqlv8',
};

async function main() {
  const aufnr = parseInt(process.argv[2] ?? '1500041', 10);
  await sql.connect(CANTOR_CONFIG);
  const posRs = await sql.query(`
    SELECT POSNR, ARTNR, EINHBREITE, EINHHOEHE, PROFILFARBE, FL_PROFILNR,
           RA_PROFILNR, PROFILSATZNAME, VKPOSPREIS, EKPOSPREIS
    FROM AUFPOS WHERE AUFNR = ${aufnr} AND ARTTYP = 'E' ORDER BY POSNR
  `);
  const bdRs = await sql.query(`
    SELECT REFPOSNR, KEY1, KEYPREISART, SORTKEY1, PREIS
    FROM AUFPREIS WHERE AUFNR = ${aufnr} AND PREIS > 0
  `);
  await sql.close();

  for (const p of posRs.recordset) {
    const input = {
      article: p.ARTNR,
      profilsatz: p.PROFILSATZNAME === 'IGLO 5' ? 'IG5' : p.PROFILSATZNAME,
      materialart: 2,
      beschvar: p.ARTNR === 'F200' ? 'R; UR-P' : 'FIX', // naive parse
      width_mm: p.EINHBREITE,
      height_mm: p.EINHHOEHE,
      sashCount: p.ARTNR === 'F200' ? 2 : 1,
      openings: p.ARTNR === 'F200' ? ['R', 'UR'] : ['F'],
      color: { code: p.PROFILFARBE || 'W-W' },
      frameProfile: p.RA_PROFILNR,
      sashProfile: p.FL_PROFILNR,
      glazing: { 
        code: p.ARTNR === 'F200' ? '3-40' : '2-24', 
        panes: p.ARTNR === 'F200' ? ['T4', 'FL6', 'ADB6H'] : ['FL4', 'T4'],
        spacer: 'S16' 
      },
      hardware: p.ARTNR === 'F200' ? {
        safetyClass: '4ZA',
        handleType: 'KwadratK',
        handleColor: 'bialy',
        coverColor: 'bialy'
      } : {},
      schwelle: 0,
      dealer: { kundenNr: 1008, pricelistKurzbez: 'EUR23011', land: 'CH' },
    };
    const { handlePriceRequest } = await import(new URL('file://' + process.cwd() + '/scripts/cantor/pricingServer.ts'));
    const result = await handlePriceRequest(JSON.stringify({ input }));
    if (!result.ok) { console.error(`POS ${p.POSNR}: ${result.error}`); continue; }

    const cantorBd = bdRs.recordset.filter(b => b.REFPOSNR === p.POSNR);
    const artE = cantorBd.find(b => b.KEY1 === 'ARTIKEL' && b.KEYPREISART === 'E')?.PREIS ?? 0;
    const artV = cantorBd.find(b => b.KEY1 === 'ARTIKEL' && b.KEYPREISART === 'V')?.PREIS ?? 0;
    const panesE = cantorBd.filter(b => b.KEY1 === 'PANE' && b.KEYPREISART === 'E').reduce((s, b) => s + b.PREIS, 0);
    const panesV = cantorBd.filter(b => b.KEY1 === 'PANE' && b.KEYPREISART === 'V').reduce((s, b) => s + b.PREIS, 0);

    const totalEkMatch = Math.abs(result.ek_pln - p.EKPOSPREIS) < 0.01 ? '✓' : '✗';
    const totalVkMatch = Math.abs(result.vk_local - p.VKPOSPREIS) < 0.05 ? '✓' : '✗';

    console.log(`\nAUFNR ${aufnr} / POS ${p.POSNR}: ${p.ARTNR} ${p.PROFILSATZNAME} ${p.EINHBREITE}×${p.EINHHOEHE} ${p.PROFILFARBE}`);
    console.log(`  Cantor breakdown:  base ${artE.toFixed(2)} + panes ${panesE.toFixed(2)} = ${p.EKPOSPREIS} PLN     |  ${artV.toFixed(2)} + ${panesV.toFixed(2)} = ${p.VKPOSPREIS} ${result.currency}`);
    console.log(`  Engine breakdown:  base ${result.baseTotal.toFixed(2)} + panes ${result.panesTotal.toFixed(2)} = ${result.ek_pln.toFixed(2)} PLN  |  ${(result.baseTotal * result.faktor).toFixed(2)} + ${(result.panesTotal * result.faktor).toFixed(2)} = ${result.vk_local.toFixed(2)} ${result.currency}`);
    console.log(`  Engine BASE LINES: ${JSON.stringify(result.lines.filter(l => l.value !== 0), null, 2)}`);
    console.log(`  TOTAL              ${totalEkMatch} EK    ${totalVkMatch} VK    (FAKTOR=${result.faktor})`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
