// Tree-walking evaluator for parsed Cantor formula ASTs.

import type { Expr } from './parser';
import { toNum, toStr, toBool, cmpEq, isStringContext, type Value } from './coercion';
import type { FormulaContext } from './context';
import { callBuiltin } from './builtins';

export function evalExpr(node: Expr, ctx: FormulaContext): Value {
  switch (node.type) {
    case 'num': return node.value;
    case 'str': return node.value;
    case 'var': {
      const v = resolveVar(node.name, ctx);
      return v === undefined ? null : v;
    }
    case 'unary': {
      const a = evalExpr(node.arg, ctx);
      if (node.op === 'NOT') return !toBool(a);
      if (node.op === '-') return -toNum(a);
      throw new Error(`unknown unary ${node.op}`);
    }
    case 'binop': {
      const lhs = evalExpr(node.left, ctx);
      // Short-circuit boolean operators.
      if (node.op === 'AND') return toBool(lhs) ? toBool(evalExpr(node.right, ctx)) : false;
      if (node.op === 'OR') return toBool(lhs) ? true : toBool(evalExpr(node.right, ctx));
      const rhs = evalExpr(node.right, ctx);
      switch (node.op) {
        case '+':
          if (isStringContext(lhs, rhs)) return toStr(lhs) + toStr(rhs);
          return toNum(lhs) + toNum(rhs);
        case '-': return toNum(lhs) - toNum(rhs);
        case '*': return toNum(lhs) * toNum(rhs);
        case '/': {
          const r = toNum(rhs);
          if (r === 0) return 0; // Cantor returns 0 on divide-by-zero
          return toNum(lhs) / r;
        }
        case '=':  return cmpEq(lhs, rhs);
        case '<>': return !cmpEq(lhs, rhs);
        case '<':  return toNum(lhs) < toNum(rhs);
        case '>':  return toNum(lhs) > toNum(rhs);
        case '<=': return toNum(lhs) <= toNum(rhs);
        case '>=': return toNum(lhs) >= toNum(rhs);
      }
      throw new Error(`unknown binop ${node.op}`);
    }
    case 'in': {
      const v = evalExpr(node.left, ctx);
      for (const item of node.list) {
        if (cmpEq(v, evalExpr(item, ctx))) return true;
      }
      return false;
    }
    case 'call': return callBuiltin(node.name, node.args, ctx);
  }
}

// Variable resolution rules:
//   GRPRS              -> running schema accumulator
//   AKTZUSCHLAG<n>     -> named sub-totals from earlier formulas in same SCHEMA
//   PREISFELD<n>       -> n-th tier column on the most recent PMATALL anchor
//   anything else      -> ctx.resolve(name)  (per-configuration variable map)
function resolveVar(name: string, ctx: FormulaContext): Value | undefined {
  if (name === 'GRPRS') return ctx.GRPRS;
  const az = name.match(/^AKTZUSCHLAG(\d+)$/);
  if (az) return ctx.AKTZUSCHLAG[parseInt(az[1], 10)] ?? 0;
  const pf = name.match(/^PREISFELD(\d+)$/);
  if (pf) {
    const n = parseInt(pf[1], 10);
    // Article-level sources (ARTPREISE) take precedence when set — e.g.
    // pane prices come from ARTPREISE[paneArticleId][PREISSCHEMAID=51], not
    // from the last matrix anchor.
    if (ctx.preisfeldSource) return ctx.preisfeldSource(n);
    const row = ctx.lastPmatRow;
    if (!row) return 0;
    if (n === 1) return row.PREIS ?? 0;
    return ((row as unknown as Record<string, number | null>)[`PREIS${n}`] ?? 0);
  }
  return ctx.resolve(name);
}
