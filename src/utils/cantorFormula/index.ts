// Public surface of the Cantor formula interpreter.
//
// Layers (each in its own file for maintainability):
//   tokenizer.ts  - source string -> Token[]
//   parser.ts     - Token[] -> Expr (AST)
//   coercion.ts   - Cantor's null/string/number coercion rules
//   context.ts    - FormulaContext + PMatRow types (runtime surface)
//   evaluator.ts  - Expr + FormulaContext -> Value
//   builtins.ts   - DSL primitives (IIF, PMATALL, SWITCHA_*, ...) and fn_* dispatch

export { tokenize, type Token } from './tokenizer';
export { parse, type Expr } from './parser';
export { toNum, toStr, toBool, cmpEq, isStringContext, type Value } from './coercion';
export type { FormulaContext, PMatRow } from './context';
export { evalExpr } from './evaluator';
export { callBuiltin } from './builtins';
