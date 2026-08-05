// Lexer for the Cantor formula DSL stored in PREISE.FORMEL.
//
// Token kinds:
//   NUM    - numeric literal (parsed as JS number)
//   STR    - string literal in "..."  (no escape sequences observed)
//   IDENT  - bare identifier (variable, function name)
//   OP     - operator: + - * / = <> < > <= >=
//   KW     - keyword: AND OR NOT IN
//   LPAREN RPAREN COMMA - structural

export type Token =
  | { kind: 'NUM'; value: number }
  | { kind: 'STR'; value: string }
  | { kind: 'IDENT'; value: string }
  | { kind: 'OP'; value: string }
  | { kind: 'KW'; value: 'AND' | 'OR' | 'NOT' | 'IN' }
  | { kind: 'LPAREN' }
  | { kind: 'RPAREN' }
  | { kind: 'COMMA' };

const KEYWORDS = new Set(['AND', 'OR', 'NOT', 'IN']);
const TWO_CHAR_OPS = new Set(['<>', '<=', '>=']);
const ONE_CHAR_OPS = new Set(['+', '-', '*', '/', '=', '<', '>']);

export function tokenize(src: string): Token[] {
  // Strip /* ... */ comments first.
  const text = src.replace(/\/\*[\s\S]*?\*\//g, ' ');
  const out: Token[] = [];
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (c === ' ' || c === '\t' || c === '\r' || c === '\n') { i++; continue; }
    if (c === '(') { out.push({ kind: 'LPAREN' }); i++; continue; }
    if (c === ')') { out.push({ kind: 'RPAREN' }); i++; continue; }
    if (c === ',') { out.push({ kind: 'COMMA' }); i++; continue; }
    if (c === '"') {
      const start = ++i;
      while (i < text.length && text[i] !== '"') i++;
      out.push({ kind: 'STR', value: text.slice(start, i) });
      i++;
      continue;
    }
    if (c >= '0' && c <= '9') {
      const start = i;
      while (i < text.length && /[0-9.]/.test(text[i])) i++;
      out.push({ kind: 'NUM', value: parseFloat(text.slice(start, i)) });
      continue;
    }
    const two = text.slice(i, i + 2);
    if (TWO_CHAR_OPS.has(two)) { out.push({ kind: 'OP', value: two }); i += 2; continue; }
    if (ONE_CHAR_OPS.has(c)) { out.push({ kind: 'OP', value: c }); i++; continue; }
    if (/[A-Za-z_]/.test(c)) {
      const start = i;
      while (i < text.length && /[A-Za-z0-9_]/.test(text[i])) i++;
      const word = text.slice(start, i);
      const upper = word.toUpperCase();
      if (KEYWORDS.has(upper)) out.push({ kind: 'KW', value: upper as 'AND' | 'OR' | 'NOT' | 'IN' });
      else out.push({ kind: 'IDENT', value: word });
      continue;
    }
    throw new Error(`tokenize: unexpected char ${JSON.stringify(c)} at offset ${i}`);
  }
  return out;
}
