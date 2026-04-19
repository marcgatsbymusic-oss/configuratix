// Type coercion rules for the Cantor formula DSL.
//
// Verified against AUFNR 1500041:
//   - null/undefined acts as 0 in numeric context, "" in string context
//   - + is overloaded: numeric add unless either side "looks string-y"
//     (a string that doesn't parse to a number, or both sides are strings)
//   - = / <> compare as strings if either operand is a string

export type Value = number | string | boolean | null;

export function toNum(v: Value): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === 'number') return v;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (typeof v === 'string') {
    if (v === '') return 0;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export function toStr(v: Value): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return v ? '1' : '0';
  return '';
}

export function toBool(v: Value): boolean {
  if (v === null || v === undefined) return false;
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  if (typeof v === 'string') return v !== '';
  return false;
}

export function isStringContext(a: Value, b: Value): boolean {
  if (typeof a === 'string' && typeof b === 'string') return true;
  if (typeof a === 'string' && (Number.isNaN(Number(a)) || a === '')) return true;
  if (typeof b === 'string' && (Number.isNaN(Number(b)) || b === '')) return true;
  return false;
}

export function cmpEq(a: Value, b: Value): boolean {
  if (typeof a === 'string' || typeof b === 'string') return toStr(a) === toStr(b);
  return toNum(a) === toNum(b);
}
