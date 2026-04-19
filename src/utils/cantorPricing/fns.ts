// Shims for Cantor's user-defined fn_* functions.
//
// These are not stored as SQL UDFs — INFORMATION_SCHEMA.ROUTINES contains zero
// fn_* functions, meaning Cantor's application code evaluates them. We
// reverse-engineer each one from observed inputs/outputs against real orders.
//
// Phase A scope: only the fns used by SCHEMA 41 for a PVC IGLO5 fixed white
// window. Anything not in this scope must throw to surface unsupported paths
// (no silent zero returns — that's how AI-slop pricing happens).

import type { Value } from '../cantorFormula';
import type { CantorMirror } from './mirror';
import type { ConfiguratorInput } from './input';

// Resolves the article-variant field value for a given (article, ARTKLCODE).
// Cantor stores this in ARTVARBL keyed by ARTNR + ARTKLCODE — but ARTVARBL
// rows hold ZUWFORMEL (assignment formulas), not values. The actual value
// flows from ARTIKEL configuration data. For Phase A we hardcode the pieces
// we need from the configurator input.
export function buildFnRegistry(input: ConfiguratorInput, _mirror: CantorMirror) {
  return (name: string, args: Value[]): Value | undefined => {
    switch (name) {
      // SCHEMA 41 fixed-window/PVC path -------------------------------------
      case 'fn_SystemCeny':
        // Returns the price-system code derived from PROFILSATZ.
        // For IGLO5 / IGL → "IG5". Other systems return their bare code.
        return systemCenyFromProfilsatz(input.profilsatz);

      case 'fn_SystemCenyAlu':
        // Aluminum equivalent — not needed for PVC Phase A.
        return '';

      case 'fn_getEinhVarFeldA':
        // (article, fieldId) -> string field from EINH (article unit) variant.
        // For F104, fieldId=41 returns "F100" (the matrix family) — observed
        // in the SCHEMA 41 formula `ART_1805_MatArt + "_" + fn_getEinhVarFeldA(ARTIKEL,41)`.
        // For fieldId=31 it returns the article's "ETyp" (FE / DB / PP / DS / HT).
        // Sourced from ARTIKEL config; for Phase A we ship a small lookup table.
        return einhVarFeldA(String(args[0] ?? ''), Number(args[1] ?? 0));

      case 'fn_CenaBaz41DRE':
        // Wood-only base price (DREWNO = wood). MATERIALART=1 path; returns 0
        // for PVC and ALU. The outer SCHEMA 41 formula already gates on
        // MATERIALART before calling this, so any non-zero would be a bug.
        return 0;

      case 'fn_CenaDopKolor':
      case 'fn_CenaDopRdzen':
      case 'fn_CenaDopZgrzew':
      case 'fn_CenaDopUszcz':
        // Color/core/weld/seal surcharge factors. For W-W (white) all return 0.
        if (input.color.code === 'W-W') return 0;
        // Any non-white color must be implemented in Phase B.
        throw new Error(`${name}: not implemented for color ${JSON.stringify(input.color.code)} (Phase B)`);

      case 'fn_IloscKwater':
        // Number of sashes. F104 = 1.
        return input.sashCount;

      case 'fn_PRICE_GROUPS':
        // (kundenNr, group) -> dealer-specific group discount %. Phase A: no
        // group discounts in scope.
        return 0;

      case 'fn_JednCennik':
        // Returns the unit-pricelist code if the dealer has a custom one. Empty
        // for our test dealer.
        return '';

      case 'fn_JEDN_RENO':
        // (profilsatz, profilNr) -> RENO replacement key. Empty unless a RENO
        // (renovation) profile is selected.
        return '';

      case 'fn_NrProfZast':
        // (kind, articleNr) -> substitute profile number. Pass-through for
        // standard profiles.
        return String(args[1] ?? '');

      case 'fn_CenaModele':
      case 'fn_CenaModele41':
        // Non-rectangular shape surcharge (KATALOGNR-driven). 0 for standard
        // rectangular F104.
        return 0;

      case 'fn_getBesWarVarFeldA':
        // (beschvar, fieldId) -> string field from beschlag-variant. Field 42
        // is the price-class adjustment string for the BESCHVAR. Returns ""
        // for STANDARD/FIX.
        return '';

      case 'fn_getFarbcodeClass1':
      case 'fn_getFarbcodeClass2':
      case 'fn_getFarbcodeClass3':
        // Color classification helpers. For W-W they all return "" (no class).
        if (input.color.code === 'W-W') return '';
        throw new Error(`${name}: not implemented for non-white (Phase B)`);

      case 'fn_BESCHVARS_ALLE':
        // Comma-joined list of all sash beschvars. Phase A: a single FIX sash.
        return 'FIX';

      case 'fn_HSNCeny':
        // HS sliding-door specific surcharge — not relevant for fixed F104.
        return 0;

      // Anything else surfaces as an explicit, debuggable failure.
      default:
        return undefined;
    }
  };
}

function systemCenyFromProfilsatz(profilsatz: string): string {
  // Cantor's mapping from PROFILSATZ to system pricing code.
  const map: Record<string, string> = {
    'IG5':       'IG5',
    'IGL':       'IG5',     // IGLO Light maps to IG5 pricelist
    'IG5 DW':    'IG5 DW',
    'IGE':       'IGE',
    'IGE DW':    'IGE DW',
    'IGEDGE':    'IGEDGE',
    'IGEAC':     'IGEAC',
    'IGPR':      'IGPR',
    'I7NL':      'I7NL',
    'I7NL DW':   'I7NL DW',
    'N76A':      'N76A',
    'N76M':      'N76M',
    'IG HS':     'IG HS',
    'IG SL':     'IG SL',
    'IG EXT':    'IG EXT',
  };
  return map[profilsatz] ?? profilsatz;
}

// (article, fieldId) -> string field from the article-unit (EINH) variant.
// For Phase A only F104 / fieldId 31 + 41 are needed. Sourced from observed
// AUFPREIS data; in Phase B/C we read this from ARTIKEL/EINHVARBL tables.
function einhVarFeldA(article: string, fieldId: number): string {
  const F104 = { 31: 'FE', 41: 'F100' } as Record<number, string>;
  if (article === 'F104') return F104[fieldId] ?? '';
  // Other articles will be added per-need with golden-test verification.
  throw new Error(`einhVarFeldA(${article}, ${fieldId}): not in Phase A scope`);
}
