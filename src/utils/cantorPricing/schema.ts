// Schema evaluator: evaluates a full PREISE schema (e.g. SCHEMA 41) by
// running every formula row in declared order, threading GRPRS as a running
// accumulator. This is what Cantor does internally to produce one AUFPREIS
// row's PREIS value.

import { parse, evalExpr, toNum } from '../cantorFormula';
import type { FormulaContext } from '../cantorFormula';
import type { CantorMirror, PreiseRow } from './mirror';

export interface SchemaLine {
  formelText: string | null;
  preisgruppe: string | null;
  value: number;
  formel: string;
}

export interface SchemaResult {
  lines: SchemaLine[];
  total: number; // Final GRPRS after all formulas have run.
}

export function evaluateSchema(
  schemaId: number,
  zyklus: number,
  preisart: 'E' | 'V',
  ctx: FormulaContext,
  mirror: CantorMirror,
): SchemaResult {
  const rows = mirror.loadSchema(schemaId, zyklus, preisart);

  const lines: SchemaLine[] = [];

  // Reset accumulators at the start of each schema evaluation.
  ctx.GRPRS = 0;
  ctx.AKTZUSCHLAG = {};

  for (const row of rows) {
    if (!row.FORMEL || !row.FORMEL.trim()) continue;
    let value = 0;
    try {
      const ast = parse(row.FORMEL);
      value = toNum(evalExpr(ast, ctx));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(
        `evaluateSchema(${schemaId}/${preisart}) formula (${row.FORMELTEXT ?? '?'}) failed: ${msg}`,
      );
    }
    lines.push({
      formelText: row.FORMELTEXT,
      preisgruppe: row.PREISGRUPPE,
      value,
      formel: row.FORMEL,
    });
    
    // In Cantor, GRPRS exclusively accumulates "base price" lines (those without a PREISGRUPPE, 
    // or specifically PVC_I5, etc) whereas DOD (surcharges) accumulate into AKTZUSCHLAG.
    // We mock this by routing null pricing groups to GRPRS.
    if (!row.PREISGRUPPE) {
      ctx.GRPRS += value;
    } else {
      ctx.AKTZUSCHLAG[row.PREISGRUPPE] = (ctx.AKTZUSCHLAG[row.PREISGRUPPE] || 0) + value;
    }
  }

  // The engine expects result.total to encompass everything so we sum it back here.
  const total = ctx.GRPRS + Object.values(ctx.AKTZUSCHLAG).reduce((a, b) => a + Number(b), 0);
  return { lines, total };
}


