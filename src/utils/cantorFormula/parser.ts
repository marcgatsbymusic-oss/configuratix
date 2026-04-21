// Recursive-descent parser for the Cantor formula DSL.
//
// Operator precedence (low → high):
//   OR
//   AND
//   IN
//   = <> < > <= >=
//   + -
//   * /
//   unary NOT, unary -
//   primary (literals, identifiers, calls, parens)

import { tokenize, type Token } from './tokenizer';

export type Expr =
  | { type: 'num'; value: number }
  | { type: 'str'; value: string }
  | { type: 'var'; name: string }
  | { type: 'call'; name: string; args: Expr[] }
  | { type: 'unary'; op: 'NOT' | '-'; arg: Expr }
  | { type: 'binop'; op: string; left: Expr; right: Expr }
  | { type: 'in'; left: Expr; list: Expr[] };

class Parser {
  private pos: number;
  private toks: Token[];
  constructor(toks: Token[]) {
    this.pos = 0;
    this.toks = toks;
  }

  private peek(off = 0): Token | undefined { return this.toks[this.pos + off]; }
  private consume(): Token { return this.toks[this.pos++]; }
  private expect(pred: (t: Token | undefined) => boolean, what: string): Token {
    const t = this.peek();
    if (!pred(t)) throw new Error(`parse: expected ${what} at token #${this.pos} (got ${JSON.stringify(t)})`);
    return this.consume();
  }

  parse(): Expr {
    const e = this.parseOr();
    if (this.pos !== this.toks.length) {
      throw new Error(`parse: trailing tokens at #${this.pos}: ${JSON.stringify(this.toks.slice(this.pos, this.pos + 5))}`);
    }
    return e;
  }

  private parseOr(): Expr {
    let left = this.parseAnd();
    while (this.peek()?.kind === 'KW' && (this.peek() as { value: string }).value === 'OR') {
      this.consume();
      left = { type: 'binop', op: 'OR', left, right: this.parseAnd() };
    }
    return left;
  }

  private parseAnd(): Expr {
    let left = this.parseIn();
    while (this.peek()?.kind === 'KW' && (this.peek() as { value: string }).value === 'AND') {
      this.consume();
      left = { type: 'binop', op: 'AND', left, right: this.parseIn() };
    }
    return left;
  }

  private parseIn(): Expr {
    let left = this.parseCmp();
    if (this.peek()?.kind === 'KW' && (this.peek() as { value: string }).value === 'IN') {
      this.consume();
      this.expect(t => t?.kind === 'LPAREN', '(');
      const list: Expr[] = [];
      if (this.peek()?.kind !== 'RPAREN') {
        list.push(this.parseOr());
        while (this.peek()?.kind === 'COMMA') {
          this.consume();
          list.push(this.parseOr());
        }
      }
      this.expect(t => t?.kind === 'RPAREN', ')');
      left = { type: 'in', left, list };
    }
    return left;
  }

  private parseCmp(): Expr {
    let left = this.parseAdd();
    while (true) {
      const t = this.peek();
      if (t?.kind === 'OP' && ['=', '<>', '<', '>', '<=', '>='].includes(t.value)) {
        this.consume();
        left = { type: 'binop', op: t.value, left, right: this.parseAdd() };
      } else break;
    }
    return left;
  }

  private parseAdd(): Expr {
    let left = this.parseMul();
    while (true) {
      const t = this.peek();
      if (t?.kind === 'OP' && (t.value === '+' || t.value === '-')) {
        this.consume();
        left = { type: 'binop', op: t.value, left, right: this.parseMul() };
      } else break;
    }
    return left;
  }

  private parseMul(): Expr {
    let left = this.parseUnary();
    while (true) {
      const t = this.peek();
      if (t?.kind === 'OP' && (t.value === '*' || t.value === '/')) {
        this.consume();
        left = { type: 'binop', op: t.value, left, right: this.parseUnary() };
      } else break;
    }
    return left;
  }

  private parseUnary(): Expr {
    const t = this.peek();
    if (t?.kind === 'KW' && t.value === 'NOT') {
      this.consume();
      return { type: 'unary', op: 'NOT', arg: this.parseUnary() };
    }
    if (t?.kind === 'OP' && t.value === '-') {
      this.consume();
      return { type: 'unary', op: '-', arg: this.parseUnary() };
    }
    return this.parsePrimary();
  }

  private parsePrimary(): Expr {
    const t = this.consume();
    if (!t) throw new Error('parse: unexpected EOF');
    if (t.kind === 'NUM') return { type: 'num', value: t.value };
    if (t.kind === 'STR') return { type: 'str', value: t.value };
    if (t.kind === 'LPAREN') {
      const e = this.parseOr();
      this.expect(x => x?.kind === 'RPAREN', ')');
      return e;
    }
    if (t.kind === 'IDENT') {
      if (this.peek()?.kind === 'LPAREN') {
        this.consume();
        const args: Expr[] = [];
        if (this.peek()?.kind !== 'RPAREN') {
          args.push(this.parseOr());
          while (this.peek()?.kind === 'COMMA') {
            this.consume();
            args.push(this.parseOr());
          }
        }
        this.expect(x => x?.kind === 'RPAREN', ')');
        return { type: 'call', name: t.value, args };
      }
      return { type: 'var', name: t.value };
    }
    throw new Error(`parse: unexpected token ${JSON.stringify(t)}`);
  }
}

export function parse(src: string): Expr {
  return new Parser(tokenize(src)).parse();
}
