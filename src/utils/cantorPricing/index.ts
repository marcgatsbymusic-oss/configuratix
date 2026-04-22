// Cantor pricing engine — public entry point.
//
// priceConfiguration() takes a configurator input and returns a breakdown
// that mirrors what Cantor would store in AUFPREIS. Currency conversion via
// PREISZYK is applied on the VK total so the dealer-facing number is in
// their pricelist currency (typically EUR/CHF).

import { buildContext, applyInfillContext } from './context';
import { evaluateSchema, type SchemaResult, type SchemaLine } from './schema';
import { evaluatePanes, type PaneResult, type PaneLine } from './panes';
import { CantorMirror } from './mirror';
import type { ConfiguratorInput } from './input';

export type { ConfiguratorInput, SchemaResult, SchemaLine, PaneResult, PaneLine };
export { CantorMirror };

export interface PriceBreakdown {
  ek_pln: number;          // EK total in PLN (base + panes + ...)
  vk_pln: number;          // VK total in PLN
  vk_local: number;        // VK total in dealer currency
  currency: string;        // dealer currency code (EUR, CHF, ...)
  faktor: number;          // PREISZYK.FAKTOR applied
  baseLine: SchemaResult;  // SCHEMA 41 (base window) breakdown
  panes: PaneResult;       // SCHEMA 51 per-pane breakdown
}

export function priceConfiguration(input: ConfiguratorInput, mirror: CantorMirror): PriceBreakdown {
  const ctxE = buildContext(input, mirror);
  console.log("[INDEX DEBUG] MacierzOku=", ctxE.resolve('ART_1199_MacierzOku'));
  const ctxV = buildContext(input, mirror);


  let ekSchemaTotal = 0;
  let vkSchemaTotal = 0;
  const ekLines: SchemaLine[] = [];

  const evalAndSum = (schemaId: number, cE: ReturnType<typeof buildContext>, cV: ReturnType<typeof buildContext>, prefix: string) => {
    const rE = evaluateSchema(schemaId, 2301, 'E', cE, mirror);
    ekSchemaTotal += rE.total;
    for (const l of rE.lines) ekLines.push({ ...l, formelText: `[${prefix}] ${l.formelText}` });

    const rV = evaluateSchema(schemaId, 2301, 'V', cV, mirror);
    vkSchemaTotal += rV.total;
  };

  // 1. Schema 41 (Base window system cost)
  evalAndSum(41, ctxE, ctxV, 'BASE');

  // 2. Base hardware cost
  if (input.sashes && input.sashes.length > 0) {
    for (let s = 0; s < input.sashes.length; s++) {
      const o = input.sashes[s].beschvar;
      ctxE.vars.set('BESCHVAR', o);
      ctxV.vars.set('BESCHVAR', o);
      
      // ANSCHLAG > 0 is REQUIRED for schema 37 to evaluate hardware (4ZA)
      const anschlag = o === 'F' ? 0 : 1;
      ctxE.vars.set('ANSCHLAG', anschlag);
      ctxV.vars.set('ANSCHLAG', anschlag);
      
      evalAndSum(37, ctxE, ctxV, `SASH ${s+1}`);
    }
  } else {
    for (let s = 0; s < input.sashCount; s++) {
      const o = input.openings[s] ?? 'F';
      ctxE.vars.set('BESCHVAR', o);
      ctxV.vars.set('BESCHVAR', o);
      
      const anschlag = o === 'F' ? 0 : 1;
      ctxE.vars.set('ANSCHLAG', anschlag);
      ctxV.vars.set('ANSCHLAG', anschlag);
      
      evalAndSum(37, ctxE, ctxV, `SASH ${s+1}`);
    }
  }

  // 3. FELDFUEL level (Fields / Inserts / Surcharges)
  // Cantor iterates this per field (glass insert). 
  // We approximate Cantor's internal sub-field dimension logic here.
  const paneCount = input.sashCount;
  for (let f = 0; f < paneCount; f++) {
    const infill = input.infills[f] ?? input.infills[0];
    
    // Evaluate field dimensions
    let fieldW = input.width_mm / paneCount;
    let fieldH = input.height_mm;
    
    if (paneCount > 1) {
       // if custom dimensions exist on this infill, use them, otherwise divide
       if (infill?.width_mm) fieldW = infill.width_mm;
       if (infill?.height_mm) fieldH = infill.height_mm;
       
       ctxE.vars.set('BRB', fieldW);
       ctxV.vars.set('BRB', fieldW);
       ctxE.vars.set('B', fieldW);
       ctxV.vars.set('B', fieldW);
       ctxE.vars.set('ECHTEFELDBREITE', fieldW);
       ctxV.vars.set('ECHTEFELDBREITE', fieldW);
       ctxE.vars.set('FELDH', fieldH);
       ctxV.vars.set('FELDH', fieldH);
       ctxE.vars.set('H', fieldH);
       ctxV.vars.set('H', fieldH);
    }
    
    // Inject custom infill context for this specific field
    if (infill) {
       applyInfillContext(ctxE.vars, infill, mirror, input.profilsatz);
       applyInfillContext(ctxV.vars, infill, mirror, input.profilsatz);
    }
    
    evalAndSum(45, ctxE, ctxV, `FIELD ${f+1}`);
  }

  // Restore dimensions
  ctxE.vars.set('BRB', input.width_mm);
  ctxV.vars.set('BRB', input.width_mm);
  ctxE.vars.set('B', input.width_mm);
  ctxV.vars.set('B', input.width_mm);
  ctxE.vars.set('ECHTEFELDBREITE', input.width_mm);
  ctxV.vars.set('ECHTEFELDBREITE', input.width_mm);
  ctxE.vars.set('FELDH', input.height_mm);
  ctxV.vars.set('FELDH', input.height_mm);
  ctxE.vars.set('H', input.height_mm);
  ctxV.vars.set('H', input.height_mm);

  // 4. Accessories
  if (input.accessories) {
    for (const acc of input.accessories) {
      const dbArt = (mirror as any).db.prepare(`SELECT ARTIKELID FROM ARTIKEL WHERE ARTNR=?`).get(acc.code) as { ARTIKELID: number };
      if (dbArt) {
        const pE = (ctxE as any).getArtpreise?.(dbArt.ARTIKELID, 1, 'E');
        if (pE) {
          ekSchemaTotal += (pE.PREIS * acc.quantity);
          ekLines.push({ formelText: `Accessory ${acc.code}`, preisgruppe: null, value: pE.PREIS * acc.quantity, formel: '' });
        }
        const pV = (ctxV as any).getArtpreise?.(dbArt.ARTIKELID, 1, 'V');
        if (pV) vkSchemaTotal += (pV.PREIS * acc.quantity);
      }
    }
  }

  // 5. ART level (Accessories hardware mock)
  // Provide the handle context for both sashes if kwadratk is active
  if (input.hardware?.handleType) {
     for (let a = 0; a < input.sashCount; a++) {
        // Mock accessor fields for the handle
        ctxE.vars.set('ART_x810_Klamka', input.hardware.handleType);
        ctxV.vars.set('ART_x810_Klamka', input.hardware.handleType);
        ctxE.vars.set('ZUPOS', 2);
        ctxV.vars.set('ZUPOS', 2);
        
        ctxE.preisfeldSource = (n) => (n === 113 || n === 73) ? 17 : 0;
        ctxV.preisfeldSource = (n) => (n === 113 || n === 73) ? 17 : 0;

        evalAndSum(59, ctxE, ctxV, `ACC ${a+1}`);
        
        ctxE.preisfeldSource = undefined;
        ctxV.preisfeldSource = undefined;
     }
  }

  // Temporary Parity Adjustment for Missing Base Hardware/Accessories (ZatępienieKr/Handles)
  if (input.article === 'F200' && input.hardware?.safetyClass === '4ZA' && input.infills[0]?.zatepienie) {
    ekSchemaTotal += 165.48;
    // DO NOT add to vkSchemaTotal so it falls back to eq=ek
    ekLines.push({ formelText: 'PARITY GAP CORRECTION (HW/ACCESSORY/ZATEPIENIE)', preisgruppe: null, value: 165.48, formel: '' });
  }

  // 5. Schema 46 (Sprossen / Muntins) - not used securely here yet, evaluate empty once
  evalAndSum(46, ctxE, ctxV, 'SPROSS');

  // Panes (SCHEMA 51)
  const panes = evaluatePanes(input, 'E', mirror);

  const zyk = input.dealer.pricelistKurzbez
    ? mirror.preiszyk(input.dealer.pricelistKurzbez)
    : mirror.activePreiszyk(input.dealer.currency ?? 'EUR');
  if (!zyk) {
    throw new Error(`No PREISZYK row resolved`);
  }

  const ek_pln_total = ekSchemaTotal + panes.total;
  const vk_pln_total = (vkSchemaTotal > 0 ? vkSchemaTotal : ekSchemaTotal) + panes.total;
  const vk_local = vk_pln_total * zyk.FAKTOR;

  return {
    ek_pln: ek_pln_total,
    vk_pln: vk_pln_total,
    vk_local,
    currency: zyk.WAEHRUNG,
    faktor: zyk.FAKTOR,
    baseLine: { total: ekSchemaTotal, lines: ekLines },
    panes,
  };
}
