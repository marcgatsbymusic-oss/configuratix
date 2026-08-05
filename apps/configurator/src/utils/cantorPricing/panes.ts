// Pane line-item pricing (Phase B).
//
// Follows Cantor's chain faithfully (verified against AUFNR 1500041 / POS 1):
//
//   1. pane code (e.g. "FL4", "T4")  --GLASS_PANE.ARTICLENO--> ARTIKELID
//   2. (ARTIKELID, PREISSCHEMAID=51) --ARTPREISE.PREISFELDNR--> PREISFELDx map
//   3. Evaluate all PREISE rows where KEY1='SCHEMA' AND KEY2='51' with the
//      PREISFELDx values sourced from ARTPREISE (via ctx.preisfeldSource).
//      Formula: area × IIF(LAND="IT", PREISFELD13, PREISFELD11)
//
// Each pane emits its own AUFPREIS line (SORTKEY1 = pane code, SORTKEY2 = '1;...').
// The engine sums them to the total pane surcharge.

import { evaluateSchema } from './schema';
import { buildContext, applyInfillContext } from './context';
import type { CantorMirror } from './mirror';
import type { ConfiguratorInput } from './input';

export interface PaneLine {
  code: string;
  articleId: number;
  value: number;
  preisfelds: Record<number, number>;
}

export interface PaneResult {
  lines: PaneLine[];
  total: number;
}

export function evaluatePanes(
  input: ConfiguratorInput,
  preisart: 'E' | 'V',
  mirror: CantorMirror,
): PaneResult {
  const out: PaneLine[] = [];
  let total = 0;
  const paneCount = input.sashCount;
  for (let f = 0; f < paneCount; f++) {
    const infill = input.infills[f] ?? input.infills[0];
    if (!infill?.panes) continue;
    
    // Evaluate field dimensions for panes
    let fieldW = input.width_mm / paneCount;
    let fieldH = input.height_mm;
    
    if (paneCount > 1) {
       if (infill.width_mm) fieldW = infill.width_mm;
       if (infill.height_mm) fieldH = infill.height_mm;
    }
    
    for (const code of infill.panes) {
      if (!code) continue;
      const articleId = mirror.paneArticleId(code);
      if (articleId === null) {
        throw new Error(`Unknown pane code ${JSON.stringify(code)} (no row in GLASS_PANE)`);
      }
      const fields = mirror.artpreiseFields(articleId, 51);
      if (fields.size === 0) {
        throw new Error(`No ARTPREISE rows for pane ${code} (ARTIKELID=${articleId}, PREISSCHEMAID=51)`);
      }
  
      const ctx = buildContext(input, mirror);
      if (paneCount > 1) {
         ctx.vars.set('BRB', fieldW);
         ctx.vars.set('B', fieldW);
         ctx.vars.set('ECHTEFELDBREITE', fieldW);
         ctx.vars.set('FELDH', fieldH);
         ctx.vars.set('H', fieldH);
      }
      applyInfillContext(ctx.vars, infill, mirror, input.profilsatz);
      ctx.preisfeldSource = (n: number) => fields.get(n) ?? 0;
  
      const result = evaluateSchema(51, 2301, preisart, ctx, mirror);
      const pf: Record<number, number> = {};
      for (const [k, v] of fields) pf[k] = v;
      out.push({ code, articleId, value: result.total, preisfelds: pf });
      total += result.total;
    }
  }
  return { lines: out, total };
}
