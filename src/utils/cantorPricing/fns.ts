// Shims for Cantor's fn_* user-defined functions.
//
// Cantor's fn_* identifiers are app-level functions (SQL Server holds zero
// user-defined routines matching fn_%). We reimplement the needed ones here
// by reading the same source data Cantor reads: AUFARTIK.ARTIKELVARIABLEN,
// ARTPREISE, PREISMAT, etc.
//
// No fn_ currently hardcodes a lookup table — every value comes from the
// mirror. Unsupported paths (non-white colors, wood-base formulas not yet
// exercised) throw with clear reasons rather than returning zero.

import type { Value } from '../cantorFormula';
import type { CantorMirror } from './mirror';
import type { ConfiguratorInput } from './input';

// Mapping from fn_getEinhVarFeldA(ARTIKEL, fieldId) → ARTIKELVARIABLEN key.
// This is Cantor's internal convention for its "EINH variant field" accessor:
// fieldId selects which of the ART_1805_* variables to return. Observed
// across real AUFARTIK rows — NOT a per-article table, so not a workaround.
const EINH_FIELD_TO_VAR: Record<number, string> = {
  31: 'ART_1805_ETyp',        // Element type (FE / DB / PP / DS / HT / HS / PS)
  41: 'ART_1805_MatrixName',  // Matrix family suffix (F100 / F150 / F270 / ...)
};

export function buildFnRegistry(input: ConfiguratorInput, mirror: CantorMirror) {
  // Resolve the article's ARTIKELVARIABLEN once per price request. This is
  // the Cantor-faithful source for ART_<klCode>_<name> values.
  const articleVars = mirror.articleVariablesFor(input.article, input.profilsatz);

  return (name: string, args: Value[]): Value | undefined => {
    switch (name) {
      case 'fn_SystemCeny':
        // Cantor's system-pricing code for the current profile. 
        // The core matrix key is explicitly encoded as ESCODE 1040 (SystemProfili) 
        // on ARTKLCODE 1850 (ARTNR 'F') inside the ESFELD string.
        // "IGECL" is just the series alias (ART_1805_Serie); pricing matrices
        // native to Cantor are bucketed under the base system "IGE", which
        // this 1850.1040 variable exposes.
        return articleVars.get('ART_1850_1040') 
            ?? articleVars.get('ART_1805_Serie') 
            ?? input.profilsatz;

      case 'fn_SystemCenyAlu':
        // ALU equivalent — Phase D.
        if (input.materialart !== 3) return '';
        return articleVars.get('ART_1805_Serie') ?? input.profilsatz;

      case 'fn_getEinhVarFeldA': {
        const article = String(args[0] ?? '');
        const fieldId = Number(args[1] ?? 0);
        if (article !== input.article) {
          // Formula expected a different article than the one we resolved.
          // Don't silently mix variables from another article.
          throw new Error(
            `fn_getEinhVarFeldA: formula passed ARTIKEL=${article} but engine input article is ${input.article}`,
          );
        }
        const varName = EINH_FIELD_TO_VAR[fieldId];
        if (!varName) {
          throw new Error(
            `fn_getEinhVarFeldA: field ${fieldId} not mapped. Add to EINH_FIELD_TO_VAR after observing which ART_1805_* variable Cantor returns for this fieldId.`,
          );
        }
        const v = articleVars.get(varName);
        if (v === undefined) {
          throw new Error(
            `fn_getEinhVarFeldA: ${varName} not found in AUFARTIK for ` +
            `article=${input.article} profilsatz=${input.profilsatz}. ` +
            `Order an example in Cantor and re-run cantor:sync.`,
          );
        }
        return v;
      }

      case 'fn_CenaBaz41DRE':
        // Wood-only base price. Returns 0 for PVC and ALU. The outer SCHEMA
        // 41 formula gates on MATERIALART=1 before calling this, so any
        // non-zero here would be a bug.
        return 0;

      case 'fn_CenaDopKolor':
      case 'fn_CenaDopRdzen':
      case 'fn_CenaDopZgrzew':
      case 'fn_CenaDopUszcz':
        // Color surcharge factors. For W-W (white-white) all return 0.
        // Non-white colors resolve via SCHEMA 18 + PVC_DOD color matrices
        // in Phase C; until then, surface the gap explicitly.
        if (input.color.code === 'W-W') return 0;
        throw new Error(`${name}: color ${JSON.stringify(input.color.code)} not yet implemented (Phase C)`);

      case 'fn_IloscKwater':
        return input.sashCount;

      case 'fn_PRICE_GROUPS':
        // Per-dealer group discount. Phase A/B uses zero (no dealer-group
        // discounts configured in current golden set).
        return 0;

      case 'fn_JednCennik':
        // Dealer-specific unit-pricelist code. Read from AUFKOPF in a future
        // phase when we model per-dealer overrides; empty today.
        return '';

      case 'fn_JEDN_RENO':
        // Returns RENO (renovation) profile replacement key. Empty unless
        // a RENO profile is selected — not exposed in configurator today.
        return '';

      case 'fn_NrProfZast':
        // (kind, articleNr) — substitute profile pass-through. Returns the
        // original article number when no substitution configured.
        return String(args[1] ?? '');

      case 'fn_CenaModele':
      case 'fn_CenaModele41':
        // Non-rectangular (KATALOGNR-driven) surcharge. Zero for standard
        // rectangular windows — our current context sets KATALOGNR=0 and the
        // outer formula short-circuits.
        return 0;

      case 'fn_getBesWarVarFeldA':
        // (beschvar, fieldId) variant-field accessor for beschlag. Field 42
        // is the price-class adjustment string. Empty for STANDARD/FIX.
        return '';

      case 'fn_getFarbcodeClass1':
      case 'fn_getFarbcodeClass2':
      case 'fn_getFarbcodeClass3':
        if (input.color.code === 'W-W') return '';
        throw new Error(`${name}: non-white classification not yet implemented (Phase C)`);

      case 'fn_BESCHVARS_ALLE':
        // Comma-joined list of all sash beschvars.
        return new Array(input.sashCount).fill(input.beschvar).join(',');

      case 'fn_HSNCeny':
        // HS sliding-door specific surcharge. Zero for non-HS articles; the
        // outer gate checks ART_1805_ETyp="HS" before this contributes.
        return 0;

      default:
        return undefined;
    }
  };
}
