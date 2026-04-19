// Runtime context for evaluating Cantor formulas.
//
// FormulaContext is the surface the evaluator interacts with:
//   - resolve(name): variable lookup (returns undefined for unknown -> null)
//   - GRPRS / AKTZUSCHLAG: mutable accumulators threaded by the schema evaluator
//   - callFn(name, args): fn_* user-defined function shims
//   - pmatall(...): PREISMAT lookup
//   - lastPmatRow: anchor for PREISFELDx variable resolution

import type { Value } from './coercion';

export interface PMatRow {
  PREISMATRIX: string;
  KLASSE1: string;
  KLASSE2: string;
  BREITE: number;
  HOEHE: number;
  PREIS: number;
  PREIS2: number | null;
  PREIS3: number | null;
  PREIS4: number | null;
  PREIS5: number | null;
  PREIS6: number | null;
  PREIS7: number | null;
  PREIS8: number | null;
  PREIS9: number | null;
  PREIS10: number | null;
  [k: string]: unknown;
}

export interface FormulaContext {
  resolve(name: string): Value | undefined;
  GRPRS: number;
  AKTZUSCHLAG: Record<number, number>;
  callFn(name: string, args: Value[]): Value | undefined;
  pmatall(matrix: string, klasse1: string, klasse2: string, klasse3: string, breite: number, hoehe: number): PMatRow | null;
  // Resolve a category-key (k3) on a returned PMatRow to the price the
  // formula expects. For dimension-style calls (k3=""), this is row.PREIS.
  // For category-style calls (k3="4"), this is row.PREIS4.
  pmatPrice(row: PMatRow, k3: string): number;
  lastPmatRow: PMatRow | null;
  // When set, PREISFELDn lookup reads from this source instead of lastPmatRow.
  // Used for article-level schemas like SCHEMA 51 (panes) where PREISFELDx
  // values come from ARTPREISE for the current article, not from a matrix.
  preisfeldSource?: (n: number) => number;
}
