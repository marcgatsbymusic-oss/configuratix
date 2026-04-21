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
import { buildContext } from './context';
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
  for (const code of input.glazing.panes) {
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
    ctx.preisfeldSource = (n: number) => fields.get(n) ?? 0;

    const result = evaluateSchema(51, 2301, preisart, ctx, mirror);
    const pf: Record<number, number> = {};
    for (const [k, v] of fields) pf[k] = v;
    out.push({ code, articleId, value: result.total, preisfelds: pf });
    total += result.total;
  }
  return { lines: out, total };
}
