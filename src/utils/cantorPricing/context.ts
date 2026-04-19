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
  let FELDB = BRB;
  let FELDH = BRH;

  if (input.sashCount > 1) {
    const sashCount = input.sashCount;
    // F2xx config uses 1 mullion for 2 sashes.
    const mullions = sashCount - 1;
    // The Web Configurator could eventually send AKTARTNRST if missing,
    // but the engine defaults to the standard 84mm mullion profile if unprovided.
    const mullionProfile = input.mullionProfile ?? '50021';
    
    const geo = mirror.profileGeometry(mullionProfile);
    const mullionWidth = geo ? geo.width : 84; 
    const totalMullionWidth = mullions * mullionWidth;
    
    FELDB = (BRB - totalMullionWidth) / sashCount;
  }
  // Glass dimensions: single row in AUFPOS doesn't expose GLASB, but Cantor
  // computes it as BRB - 2*rabbet_side - mullion_fraction. For now we use FELDB
  // which is correct for formulas that only reference GLASB via a coefficient
  // that is 0 in Phase A/B. Phase C must read rabbet from profile geometry.
  const GLASB = FELDB;
  const GLASH = FELDH;

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

  // Article-variant resolved fields come from Cantor's AUFARTIK row for this
  // (article, profilsatz) combination. Every ART_<klCode>_<name> variable a
  // formula might reference is populated from there — no per-article lookup
  // tables in code. If Cantor has no prior order for this combination, we
  // can't resolve the variables and must throw with a clear reason.
  const articleVars = mirror.articleVariablesFor(input.article, input.profilsatz);
  if (articleVars.size === 0) {
    throw new Error(
      `buildContext: no AUFARTIK rows for article=${input.article} profilsatz=${input.profilsatz}. ` +
      `Order one example in Cantor (any dimensions) and re-run cantor:sync so ART_* variables resolve.`,
    );
  }
  for (const [k, v] of articleVars) vars.set(k, v);

  // The engine must respect the dynamic hardware request (openings) from the user
  // rather than blindly inheriting what the fallback database snapshot happened
  // to be built with.
  if (input.sashCount === 1 && input.openings[0]) {
    vars.set('ART_1199_MacierzOku', input.openings[0]);
  } else if (input.sashCount === 2 && input.openings.length === 2) {
    // 2-sash windows usually concatenate opening types (e.g. "DKDK", "FF", "DKF")
    vars.set('ART_1199_MacierzOku', input.openings.join(''));
  } else if (input.sashCount > 2) {
    // Windows with 3+ sashes typically don't have a monolithic hardware matrix
    // in Cantor (MacierzOku = '-') and are priced per-sash via individual BESCHVAR components.
    vars.set('ART_1199_MacierzOku', '-');
  }

  // The beschvar AUSFUEHRUNG lives in ARTKLCODE=2801 (OPCJE) — not currently
  // mirrored with its variables. Default to STANDARD which matches every
  // PVC FIX order in our golden set; override once we mirror 2801 vars.
  if (!vars.has('AUSFUEHRUNG')) vars.set('AUSFUEHRUNG', 'STANDARD');

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

// TYPKLASSE is the material-class key. For PVC it happens to equal the
// material code ("PVC"); for wood ("HO") and aluminum ("AL") it matches too.
// Sourcing from AUFARTIK when available; this is the fallback when the
// variable is referenced outside the article-scoped context.
function typklasse(mat: 1 | 2 | 3): string {
  return ({ 1: 'HO', 2: 'PVC', 3: 'AL' } as const)[mat];
}
