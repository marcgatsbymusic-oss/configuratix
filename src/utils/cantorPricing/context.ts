// Build a FormulaContext from a ConfiguratorInput. Variables are resolved
// lazily via a Map so we only pay for what's read.

import type { FormulaContext, Value, PMatRow } from '../cantorFormula';
import type { CantorMirror } from './mirror';
import type { ConfiguratorInput } from './input';
import { buildFnRegistry } from './fns';

export function buildContext(input: ConfiguratorInput, mirror: CantorMirror): FormulaContext {
  // Dimensions.
  //
  // Empirically verified across 10 real PVC orders (AUFNRs 1500030-1500041):
  //   EINHBREITE == LOCHBREITE == UNITWIDTH_INCL_INST_ACCESSORY
  // Cantor's `BRB` (Brutto-Breite) equals EINHBREITE directly for PVC — there
  // is no frame-edge deduction between the unit dimension and BRB. BRB is the
  // dimension the pricing matrices key on.
  //
  // `FELDB`/`FELDH` differ from BRB only for multi-sash windows (split by the
  // mullion). For single-sash F104, FELDB == BRB. Multi-sash not yet covered
  // (throws below) because the mullion offset depends on profile geometry
  // which we don't yet read from PROFILINGDEDUCTION.
  //
  // `GLASB`/`GLASH` are smaller than BRB by the glazing rabbet (a profile-
  // dependent offset). Today they're only referenced by the MB60-filling
  // formula in SCHEMA 51, which multiplies by PREISFELD2=0 for standard PVC
  // panes — so the approximation GLASB==BRB does not affect Phase A/B output.
  // Flagged for Phase C.
  const BRB = input.width_mm;
  const BRH = input.height_mm;
  if (input.sashCount > 1) {
    throw new Error(
      `buildContext: multi-sash (${input.sashCount}) not yet supported — ` +
      `FELDB/FELDH need mullion offsets from PROFILINGDEDUCTION (Phase C).`,
    );
  }
  const FELDB = BRB;
  const FELDH = BRH;
  // Glass dimensions: single row in AUFPOS doesn't expose GLASB, but Cantor
  // computes it as BRB - 2*rabbet_side - mullion_fraction. For now we use BRB
  // which is correct for formulas that only reference GLASB via a coefficient
  // that is 0 in Phase A/B. Phase C must read rabbet from profile geometry.
  const GLASB = BRB;
  const GLASH = BRH;

  const vars = new Map<string, Value>();
  // Article-class
  vars.set('ARTIKEL', input.article);
  vars.set('ARTNR', input.article);
  vars.set('MATERIALART', input.materialart);
  vars.set('AUFTYP', 'N');                    // 'N' = normal order; 'PP' would be a pattern
  vars.set('BESCHVAR', input.beschvar);
  vars.set('PROFILSATZ', input.profilsatz);
  vars.set('PROFILSATZ_TYPKLASSE', typklasse(input.materialart));
  vars.set('TYPKLASSE', typklasse(input.materialart));
  vars.set('KATALOGNR', 0);                   // 0 = standard rectangular shape

  // Profile choices
  vars.set('AKTARTNRRA', input.frameProfile);
  vars.set('AKTARTNRFL', input.sashProfile);
  vars.set('AKTARTNRSW', '');                  // No threshold for fixed window
  vars.set('AKTARTNRGT', '-');                 // No coupling profile
  vars.set('AKTARTNRST', '');                  // No movable mullion
  vars.set('AKTARTNRSP', '');
  vars.set('ARTNRRAL', input.frameProfile);
  vars.set('ARTNRRAO', input.frameProfile);
  vars.set('ARTNRRAR', input.frameProfile);
  vars.set('ARTNRRAU', input.frameProfile);

  // Dimensions
  vars.set('BRB', BRB);
  vars.set('BRH', BRH);
  vars.set('B', BRB);
  vars.set('H', BRH);
  vars.set('FELDB', FELDB);
  vars.set('FELDH', FELDH);
  vars.set('ECHTEFELDBREITE', FELDB);
  vars.set('ECHTEFELDHOEHE', FELDH);
  vars.set('FLH', FELDH);
  vars.set('UMFANG', 2 * (BRB + BRH));
  vars.set('GLASB', GLASB);
  vars.set('GLASH', GLASH);
  vars.set('FELDNRNUM', 1);

  // Article-variant resolved fields (from input mapping; in Phase B we'll
  // source these from ARTVARBL/EINHVARBL formula evaluation).
  vars.set('ART_1199_MacierzOku', macierzOkuFromOpenings(input.openings));
  vars.set('ART_1805_MatArt', matArtCode(input.materialart));
  vars.set('ART_1199_WzmSkrzO', 'N');
  vars.set('ART_1199_WzmSkrzD', 'N');
  vars.set('ART_1199_WersjaHiO', 'N');
  vars.set('ART_x801_SystemOkuc', 'STD');
  vars.set('ART_x801_Wzm_Ram', '0');
  vars.set('ART_x801_KlasaBezp', '');
  vars.set('ART_x801_OtwNaZewn', 0);
  vars.set('AUSFUEHRUNG', 'STANDARD');

  // Color (W-W = white interior + white exterior, no surcharge)
  vars.set('SYSTEMFARBE_FL', input.color.code);
  vars.set('SYSTEMFARBE_RA', input.color.code);
  vars.set('FARBCODE_FL_A', input.color.exteriorRal ?? '');
  vars.set('FARBCODE_FL_I', input.color.interiorRal ?? '');
  vars.set('FARBCODE_RA_A', input.color.exteriorRal ?? '');
  vars.set('FARBCODE_RA_I', input.color.interiorRal ?? '');
  vars.set('FARBCODEGRUPPE_TECHNIK_RA_A', '');

  // Glazing
  vars.set('SCHWELLE', input.schwelle);
  vars.set('SCHEIBE_1', input.glazing.panes[0] ?? '');
  vars.set('SCHEIBE_2', input.glazing.panes[1] ?? '');
  vars.set('SCHEIBE_3', '');
  vars.set('ARTNRFUELLUNG', '');

  // Beschlag priorities. 0/0 means "no priority article specified" → engine
  // falls through to the standard PMATALL("PVC_F100", ...) lookup.
  vars.set('BESCHLAGMAXPRIOWERT', 0);
  vars.set('BESCHLAGMINPRIOWERT', 0);
  vars.set('BESCHLAGMAXPRIO', '');
  vars.set('BESCHLAGMINPRIO', '');

  // Order / dealer
  vars.set('KUNDENNR', input.dealer.kundenNr);
  vars.set('LAND', input.dealer.land);
  vars.set('MANDANT', 1);
  vars.set('ZUPOS', 0);

  // Misc accumulators referenced by some color formulas
  vars.set('AST', 0);
  vars.set('AGT', 0);
  vars.set('ASAGT', 0);
  vars.set('ASAK', 0);
  vars.set('AK', 0);
  vars.set('AFE', 1);
  vars.set('GESLAENGE_GT', 0);
  vars.set('GESLAENGE_ST', 0);

  return {
    GRPRS: 0,
    AKTZUSCHLAG: {},
    lastPmatRow: null as PMatRow | null,
    resolve(name) { return vars.get(name); },
    callFn: buildFnRegistry(input, mirror),
    pmatall(matrix, k1, k2, k3, w, h) {
      return mirror.pmatLookup(matrix, k1, k2, k3, w, h);
    },
    pmatPrice(row, k3) {
      return mirror.pmatPrice(row, k3);
    },
  };
}

function matArtCode(mat: 1 | 2 | 3): string {
  return ({ 1: 'HO', 2: 'PVC', 3: 'AL' } as const)[mat];
}

function typklasse(mat: 1 | 2 | 3): string {
  return ({ 1: 'HO', 2: 'PVC', 3: 'AL' } as const)[mat];
}

// Maps per-sash opening behaviours to Cantor's MacierzOku ("hardware matrix")
// classification. For F104 single fixed sash the opening matrix is "F".
function macierzOkuFromOpenings(openings: ConfiguratorInput['openings']): string {
  if (openings.length === 0 || openings.every(o => o === 'F')) return 'F';
  if (openings.length === 1) return openings[0];
  // Multi-sash combos use richer codes (e.g., "DK,DK") — Phase B.
  return openings.join(',');
}
