// Built-in DSL primitives. Anything Cantor exposes that isn't an fn_* UDF
// lives here. fn_* delegate to ctx.callFn.

import type { Expr } from './parser';
import { toNum, toStr, toBool, cmpEq, type Value } from './coercion';
import type { FormulaContext } from './context';
import { evalExpr } from './evaluator';

// Cantor ROUND: half-away-from-zero (NOT banker's rounding).
function roundCantor(value: number, digits: number): number {
  const factor = Math.pow(10, digits);
  return Math.sign(value) * Math.round(Math.abs(value) * factor) / factor;
}

export function callBuiltin(name: string, argExprs: Expr[], ctx: FormulaContext): Value {
  // IIF: short-circuit so the unused branch isn't evaluated (matters for
  // formulas like IIF(MATERIALART=1, fn_CenaBaz41DRE(), 0) where the branch
  // function might not be implemented for non-wood paths).
  if (name === 'IIF') {
    if (argExprs.length !== 3) throw new Error('IIF expects 3 args');
    return toBool(evalExpr(argExprs[0], ctx))
      ? evalExpr(argExprs[1], ctx)
      : evalExpr(argExprs[2], ctx);
  }

  // SWITCHA_S/D/I: switch on first arg, alternating key/val pairs, last arg is default.
  if (name === 'SWITCHA_S' || name === 'SWITCHA_D' || name === 'SWITCHA_I') {
    const subject = evalExpr(argExprs[0], ctx);
    const pairs = argExprs.slice(1, -1);
    const dflt = argExprs[argExprs.length - 1];
    for (let i = 0; i + 1 < pairs.length; i += 2) {
      const key = evalExpr(pairs[i], ctx);
      if (cmpEq(subject, key)) return evalExpr(pairs[i + 1], ctx);
    }
    return evalExpr(dflt, ctx);
  }

  const args = argExprs.map(a => evalExpr(a, ctx));

  switch (name) {
    case 'MAX': return Math.max(...args.map(toNum));
    case 'MIN': return Math.min(...args.map(toNum));
    case 'ROUND': return roundCantor(toNum(args[0]), toNum(args[1] ?? 0));
    case 'CEILING': return Math.ceil(toNum(args[0]));
    case 'FLOOR': return Math.floor(toNum(args[0]));
    case 'INT': return Math.trunc(toNum(args[0]));
    case 'STRING': return toStr(args[0]);
    case 'LEFT': return toStr(args[0]).slice(0, toNum(args[1]));
    case 'RIGHT': {
      const s = toStr(args[0]);
      const n = toNum(args[1]);
      return n <= 0 ? '' : s.slice(-n);
    }
    case 'REPLACE': return toStr(args[0]).split(toStr(args[1])).join(toStr(args[2]));
    case 'FINDINSTR': {
      // Cantor: FINDINSTR(haystack, needle, startPos1Based) -> 1-based pos or 0
      const hay = toStr(args[0]);
      const needle = toStr(args[1]);
      const start = Math.max(0, toNum(args[2] ?? 1) - 1);
      const i = hay.indexOf(needle, start);
      return i < 0 ? 0 : i + 1;
    }
      case 'BETWEEN':
        return toNum(args[0]) >= toNum(args[1]) && toNum(args[0]) <= toNum(args[2]);
      case 'PMATALL': {
        const k3 = toStr(args[3]);
        const matrix = toStr(args[0]);
        const k1 = toStr(args[1]);
        const k2 = toStr(args[2]);
        const w = toNum(args[4] ?? 1);
        const h = toNum(args[5] ?? 1);
        if (!matrix.includes('ALL_DOD') && !matrix.includes('FACTOR')) {
           console.log(`[PMATALL LOOKUP] matrix="${matrix}" k1="${k1}" k2="${k2}" k3="${k3}" w=${w} h=${h}`);
        }
      const row = ctx.pmatall(
        matrix, k1, k2, k3,
        w, h,
      );
      ctx.lastPmatRow = row;
      if (!row) {
         if (matrix.includes('PVC_F200') || matrix.includes('FACTOR')) console.log(` => NULL`);
         return 0;
      }
      const price = ctx.pmatPrice(row, k3);
      if (matrix.includes('PVC_F200') || matrix.includes('FACTOR')) console.log(` => PREIS=${price}`);
      return price;
    }
    // Phase A stubs — none are exercised by the 1500041 IGLO5/F104 path.
    // verify_cantor_sync flags any golden that hits these.
    case 'PMAT':
    case 'ZMAT':
    case 'ZMATALL':
      return 0;
    case 'GETSYSVAR_S':
    case 'GETARTVARFIELD_S':
      return '';
    case 'GETSYSVAR_D':
      return 0;
  }

  if (name.startsWith('fn_')) {
    const v = ctx.callFn(name, args);
    if (v === undefined) {
      throw new Error(`fn_ shim not implemented: ${name}(${args.map(a => JSON.stringify(a)).join(', ')})`);
    }
    return v;
  }

  throw new Error(`builtin not implemented: ${name}`);
}
