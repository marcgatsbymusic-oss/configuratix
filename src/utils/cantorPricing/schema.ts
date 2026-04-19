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
  const rows: PreiseRow[] = mirror.loadSchema(schemaId, zyklus, preisart);
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
        `evaluateSchema(${schemaId}/${preisart}) formula #${row.LFDNR} (${row.FORMELTEXT ?? '?'}) failed: ${msg}`,
      );
    }
    lines.push({
      formelText: row.FORMELTEXT,
      preisgruppe: row.PREISGRUPPE,
      value,
      formel: row.FORMEL,
    });
    ctx.GRPRS += value;
  }

  return { lines, total: ctx.GRPRS };
}
