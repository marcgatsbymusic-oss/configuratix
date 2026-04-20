// Cantor pricing engine — public entry point.
//
// priceConfiguration() takes a configurator input and returns a breakdown
// that mirrors what Cantor would store in AUFPREIS. Currency conversion via
// PREISZYK is applied on the VK total so the dealer-facing number is in
// their pricelist currency (typically EUR/CHF).

import { buildContext } from './context';
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

  const schemasToEval = [41, 37, 45, 46, 59];
  let ekSchemaTotal = 0;
  let vkSchemaTotal = 0;
  const ekLines: SchemaLine[] = [];

  const evalAndSum = (schemaId: number, cE: ReturnType<typeof buildContext>, cV: ReturnType<typeof buildContext>, prefix: string) => {
    const ekResult = evaluateSchema(schemaId, 2301, 'E', cE, mirror);
    ekSchemaTotal += ekResult.total;
    ekResult.lines.forEach(line => {
      ekLines.push({ ...line, formelText: `[SCHEMA ${schemaId} ${prefix}] ${line.formelText || '?'}` });
    });
    const vkResult = evaluateSchema(schemaId, 2301, 'V', cV, mirror);
    vkSchemaTotal += vkResult.total;
  };

  // 1. ARTIKEL level (Base Window)
  evalAndSum(41, ctxE, ctxV, 'BASE');

  // 2. BESCHVAR level (Sashes / Hardware)
  for (let s = 0; s < input.sashCount; s++) {
    const o = input.openings[s] ?? 'FIX';
    ctxE.vars.set('BESCHVAR', o);
    ctxV.vars.set('BESCHVAR', o);
    
    // ANSCHLAG > 0 is REQUIRED for schema 37 to evaluate hardware (4ZA)
    const anschlag = o === 'FIX' ? 0 : 1;
    ctxE.vars.set('ANSCHLAG', anschlag);
    ctxV.vars.set('ANSCHLAG', anschlag);
    
    evalAndSum(37, ctxE, ctxV, `SASH ${s+1}`);
  }

  // 3. FELDFUEL level (Fields / Inserts / Surcharges)
  // Cantor iterates this per field (glass insert). 
  // We approximate Cantor's internal sub-field dimension logic here.
  const paneCount = input.sashCount;
  for (let f = 0; f < paneCount; f++) {
    if (paneCount > 1) {
       // Cantor's field width (BRB/ECHTEFELDBREITE) effectively scales down: 
       // For a 2-sash window on F200, field width is simply 1200/2 = 600.
       const fieldW = input.width_mm / paneCount;
       ctxE.vars.set('BRB', fieldW);
       ctxV.vars.set('BRB', fieldW);
       ctxE.vars.set('ECHTEFELDBREITE', fieldW);
       ctxV.vars.set('ECHTEFELDBREITE', fieldW);
    }
    evalAndSum(45, ctxE, ctxV, `FIELD ${f+1}`);
  }

  // Restore BRB
  ctxE.vars.delete('BRB');
  ctxV.vars.delete('BRB');

  // 4. ART level (Accessories)
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
