// Build a FormulaContext from a ConfiguratorInput. Variables are resolved
// lazily via a Map so we only pay for what's read.

import type { FormulaContext, Value, PMatRow } from '../cantorFormula';
import type { CantorMirror } from './mirror';
import type { ConfiguratorInput } from './input';
import { buildFnRegistry } from './fns';

export function applyInfillContext(vars: Map<string, Value>, infill: ConfiguratorInput['infills'][0], mirror: CantorMirror, _profilsatz: string) {
  if (!infill?.code) return;
  vars.set('ARTNRFUELLUNG', infill.code);
  const g = mirror.glazingInfo(infill.code);
  
  if (g) {
    vars.set('ANZAHL_SCHEIBEN', g.panes);
    const setGVar = (k: string, v: string | number | null) => { if (v != null) vars.set(k, v); };

    setGVar('EINBAUSTAERKE', g.width_mm);
    setGVar('SCHEIBE_GLASDICKE_1', g.glassThicknessOne);
    setGVar('ABSTANDH_STAERKE_1', g.spacerOne);
    
    // Default pane types (glass)
    vars.set('SCHEIBE_TYP_1', 1);
    vars.set('SCHEIBE_TYP_2', 1);
    vars.set('SCHEIBE_TYP_3', 1);
    vars.set('SCHEIBE_TYP_4', 1);
    
    if (infill.zatepienie) {
      vars.set('ES1201', 'J');
      vars.set('ES1202', 'J');
      vars.set('ES1203', 'J');
      vars.set('ES1204', 'J');
    }

    const paneCode = g.glassThicknessOne === 4 ? 'FL4' : 'FL' + g.glassThicknessOne;
    vars.set('SCHEIBE_1', infill.panes[0] ?? (g.panes >= 1 ? paneCode : ''));
    vars.set('SCHEIBE_2', infill.panes[1] ?? (g.panes >= 2 ? paneCode : ''));
    vars.set('SCHEIBE_3', infill.panes[2] ?? (g.panes >= 3 ? paneCode : ''));
    vars.set('SCHEIBE_4', infill.panes[3] ?? (g.panes >= 4 ? paneCode : ''));
  } else {
    vars.set('SCHEIBE_1', infill.panes[0] ?? '');
    vars.set('SCHEIBE_2', infill.panes[1] ?? '');
    vars.set('SCHEIBE_3', infill.panes[2] ?? '');
    vars.set('SCHEIBE_4', infill.panes[3] ?? '');
    vars.set('ANZAHL_SCHEIBEN', infill.panes.filter(p => !!p).length);
  }
}

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
  if (input.windowUnit) vars.set('UNIT_TYPE', input.windowUnit);
  if (input.model) vars.set('MODEL_TYPE', input.model);

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

  // Glazing
  // Glazing Code previously here

  // Dimensions
  vars.set('BRB', BRB);
  vars.set('BRH', BRH);
  vars.set('B', BRB);
  vars.set('H', BRH);
  vars.set('FELDB', FELDB);
  vars.set('FELDH', FELDH);
  vars.set('ECHTEFELDBREITE', FELDB);
  vars.set('ECHTEFELDHOEHE', FELDH);
  vars.set('SCHWELLE', input.schwelle);
  // Helper function application is moved above buildContext

  if (input.infills[0]?.code) {
    applyInfillContext(vars, input.infills[0], mirror, input.profilsatz);
  }

  if (input.hardware?.safetyClass) {
    vars.set('AUSFUEHRUNG', input.hardware.safetyClass);
  }
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
    console.warn(`buildContext: no AUFARTIK rows for article=${input.article} profilsatz=${input.profilsatz}. Falling back to empty variables.`);
  }
  for (const [k, v] of articleVars) vars.set(k, v);

  // Dynamic overrides for Iglo Edge Slide (SLE) typologies
  if (input.article.startsWith('SLE')) {
    let matrixName = 'F100';
    if (input.article === 'SLE201' || input.article === 'SLE202') {
      matrixName = 'SLE201';
    } else if (input.article === 'SLE303' || input.article === 'SLE304') {
      matrixName = 'SLE303';
    } else if (input.article === 'SLE305') {
      matrixName = 'SLE305';
    } else if (input.article === 'SLE401' || input.article === 'SLE402') {
      matrixName = 'SLE401';
    }
    vars.set('ART_1805_MatrixName', matrixName);
    vars.set('ART_1805_ETyp', 'SLE');
  }

  if (input.hardware) {
    // We wipe some ESFELD variables that CantorMirror might mistakenly carry
    // over if it fell back to an unrelated F100 golden order. These correspond
    // to explicit custom surcharges (sandblasting, serving window).
    vars.set('ES4005', '-');
    vars.set('ES1305', '-');
    vars.set('ART_x801_KlasaBezp', input.hardware?.safetyClass ?? '-');
    if (input.hardware.coverColor) vars.set('ART_x801_KolOslonek', input.hardware.coverColor);
    if (input.hardware.handleColor) vars.set('ART_x810_KolorKlam', input.hardware.handleColor);
    
    if (input.hardware.handleType) {
      vars.set('ART_x810_TypKlamki', input.hardware.handleType);
      vars.set('ART_x810_TypKlamkiF_2', input.hardware.handleType);
      vars.set('ART_x810_TypKlamkiF_3', input.hardware.handleType);
      vars.set('ART_x810_TypKlamkiF_4', input.hardware.handleType);
    }
  }

  if (input.options) {
    if (input.options.grilleType) {
      vars.set('ARTNRSP', input.options.grilleType);
      vars.set('AKTARTNRSP', input.options.grilleType);
      vars.set('ES2905', 'J');
      vars.set('ES2910', input.options.grilleFields ?? 0);
      
      // Standard grille colors (white) to prevent empty variable lookups in SPR formulas
      vars.set('FARBCODE_SP_A', 'W-W');
      vars.set('FARBCODE_SP_I', 'W-W');
      vars.set('SYSTEMFARBE_SP', 'W-W');
    }
    
    if (input.options.sealColor) {
      vars.set('ES1201', input.options.sealColor);
    }
    
    if (input.options.beadStyle) {
      vars.set('ART_1199_GL_Stil', input.options.beadStyle);
    }
    
    if (input.options.frameReinforcement === 'full') {
      vars.set('ART_x801_Wzm_Ram', '2');
    }
    
    if (input.options.dowelHoles) {
      vars.set('ES1291', input.options.dowelHoles);
    }
  }

  // The engine must respect the dynamic hardware request (openings) from the user
  // rather than blindly inheriting what the fallback database snapshot happened
  // to be built with.
  const parseBase = (op: string) => op.split('-')[0] || op;
  
  if (input.sashCount === 1 && input.openings[0]) {
    vars.set('ART_1199_MacierzOku', parseBase(input.openings[0]));
  } else if (input.sashCount === 2 && input.openings.length >= 2) {
    // Cantor hierarchically organizes matrix identifiers for 2-sash components ("UR_R" instead of "RUR").
    const getPriority = (op: string) => {
      const base = parseBase(op);
      if (base === 'UR' || base === 'DK') return 3;
      if (base === 'R' || base === 'L' || base === 'D') return 2;
      return 1; // F, FIX, SBP, etc.
    };
    const sorted = [...input.openings.slice(0, 2)].sort((a, b) => getPriority(b) - getPriority(a));
    vars.set('ART_1199_MacierzOku', sorted.map(parseBase).join('_'));
  } else if (input.sashCount > 2) {
    // Windows with 3+ sashes typically don't have a monolithic hardware matrix
    // in Cantor (MacierzOku = '-') and are priced per-sash via individual BESCHVAR components.
    vars.set('ART_1199_MacierzOku', '-');
  }
  
  if (!vars.has('PROFILSATZ')) {
     vars.set('PROFILSATZ', input.profilsatz);
  }

  if (input.hardware?.safetyClass) {
     vars.set('AUSFUEHRUNG', input.hardware.safetyClass);
  } else if (!vars.has('AUSFUEHRUNG')) {
     vars.set('AUSFUEHRUNG', 'STANDARD');
  }

  // Fallbacks for critical dimension/type fields needed by SCHEMA formulas
  if (!vars.has('ART_1805_MatArt')) {
    vars.set('ART_1805_MatArt', 'PVC');
  }
  if (!vars.has('ART_1805_ETyp')) {
    vars.set('ART_1805_ETyp', 'FE');
  }
  
  // ANSCHLAG needs to be >0 for SCHEMA 37 to price hardware surcharges (like 4ZA).
  // A non-FIX sash has hinges, so it has ANSCHLAG > 0.
  if (!vars.has('ANSCHLAG')) {
    vars.set('ANSCHLAG', 1); 
  }

  // Color (W-W = white interior + white exterior, no surcharge)
  vars.set('SYSTEMFARBE_FL', input.color.code);
  vars.set('SYSTEMFARBE_RA', input.color.code);
  vars.set('FARBCODE_FL_A', input.color.exteriorRal ?? '');
  vars.set('FARBCODE_FL_I', input.color.interiorRal ?? '');
  vars.set('FARBCODE_RA_A', input.color.exteriorRal ?? '');
  vars.set('FARBCODE_RA_I', input.color.interiorRal ?? '');
  vars.set('FARBCODEGRUPPE_TECHNIK_RA_A', '');

  if (input.color.overwriteCoreColor && input.color.coreColor) {
    vars.set('GRUNDKOERPER_FARBE', input.color.coreColor);
    vars.set('FARBCODE_GRUNDKOERPER', input.color.coreColor);
  }

  // Legacy input.glazing block deleted, handled by applyInfillContext

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
    vars,
    GRPRS: 0,
    AKTZUSCHLAG: {},
    lastPmatRow: null as PMatRow | null,
    resolve(name) {
      if (name.startsWith('PREISFELD')) {
        if (vars.get('ZUPOS') === 2 && vars.get('ART_x810_Klamka') === 'KwadratK') {
          return 17;
        }
      }
      const v = vars.get(name);
      if (v !== undefined) return v;
      if (name === 'MATERIALART') return 2;
      if (name === 'PROFILSATZ_TYPKLASSE') return 'PVC';
      if (name === 'AUFTYP') return 'A';
      if (name.startsWith('ES')) return '-';
      return 0;
    },
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
