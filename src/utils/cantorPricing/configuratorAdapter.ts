// Adapter between the configurator's UI state shape and the engine's
// ConfiguratorInput. Lives in the pricing layer (not the configurator) so the
// engine stays UI-agnostic — anyone with a ConfiguratorInput can call it.
//
// Maps performed:
//   - profile slug ('iglo5')     → Cantor PROFILSATZ  ('IG5')
//   - profile slug               → MATERIALART        (1=wood, 2=PVC, 3=ALU)
//   - windowTypeId ('F100')      → Cantor ARTNR        ('F104')
//   - sashOpenings (['o1','o2']) → opening matrix codes (['F','DK'])
//   - color codes ('c197')       → bicolor code        ('W-W')
//
// Anything we can't faithfully map throws — better an explicit error than a
// silent wrong number.

import type { ConfiguratorInput } from './input';

// Configurator state shape we depend on. Re-declared here (not imported from
// SlateConfigurator/types) so the pricing layer doesn't pull UI types.
export interface ConfiguratorStateLike {
  dimensions: { width: number; height: number };
  profile: string;
  windowTypeId: string;
  sashOpenings: string[];
  fittingVariant: string;
  interiorColor: string;
  exteriorColor: string;
  glazingPackage: string;
  glassOutside: string;
  glassMiddle: string;
  glassInside: string;
  glassSpacer: string;
}

// PVC profile slug → Cantor PROFILSATZ + system pricing code.
// Source: PROFILSATZNAME values in AUFPOS for real orders + IGLO catalogue.
const PROFILE_TO_PROFILSATZ: Record<string, { profilsatz: string; materialart: 1 | 2 | 3 }> = {
  iglo5:              { profilsatz: 'IG5',    materialart: 2 },
  iglo5classic:       { profilsatz: 'IG5',    materialart: 2 },
  iglolight:          { profilsatz: 'IGL',    materialart: 2 },
  iglopremier:        { profilsatz: 'IGPR',   materialart: 2 },
  iglo7nl:            { profilsatz: 'I7NL',   materialart: 2 },
  igloext:            { profilsatz: 'IG EXT', materialart: 2 },
  iglo5dw:            { profilsatz: 'IG5 DW', materialart: 2 },
  igloedge:           { profilsatz: 'IGEDGE', materialart: 2 },
  igloenergy:         { profilsatz: 'IGE',    materialart: 2 },
  igloenergyclassic:  { profilsatz: 'IGE',    materialart: 2 },
  igloenergyalucover: { profilsatz: 'IGEAC',  materialart: 2 },
  // Aluminum (Phase D)
  mb45:               { profilsatz: 'MB45',   materialart: 3 },
  mb70:               { profilsatz: 'MB70',   materialart: 3 },
  mb70hi:             { profilsatz: 'MB70HI', materialart: 3 },
  mb79nsi:            { profilsatz: 'MB79',   materialart: 3 },
  mb86nsi:            { profilsatz: 'MB86',   materialart: 3 },
};

// Configurator typology ID → Cantor article number.
// F100 (configurator) is the single-sash typology; Cantor codes it as F104.
const WINDOWTYPE_TO_ARTNR: Record<string, string> = {
  F100: 'F104',
  F101: 'F104',
};

// Sash opening UI codes to Cantor opening behaviour.
//   o1 = fixed, o2 = DK right, o3 = DK left, o6 = tilt-only (kipp)
const OPENING_CODE_MAP: Record<string, 'F' | 'DK' | 'UR' | 'R' | 'U'> = {
  o1: 'F',
  o2: 'DK',
  o3: 'DK',
  o4: 'R',
  o5: 'U',
  o6: 'UR',
};

// Configurator color slug → Cantor PROFILFARBE bicolor code.
// Today only white-white is supported by the engine; Phase C extends.
function mapColor(interior: string, exterior: string): { code: string } {
  const isWhite = (c: string) => ['c197', 'white', '0001', '9016', '-', ''].includes(c);
  if (isWhite(interior) && isWhite(exterior)) return { code: 'W-W' };
  // Surface non-white explicitly so the engine can throw on unsupported colors
  // rather than silently pricing them wrong.
  return { code: `${interior}-${exterior}` };
}

export function stateToInput(
  state: ConfiguratorStateLike,
  dealer: ConfiguratorInput['dealer'],
): ConfiguratorInput {
  const profEntry = PROFILE_TO_PROFILSATZ[state.profile];
  if (!profEntry) {
    throw new Error(`stateToInput: profile ${JSON.stringify(state.profile)} not mapped to Cantor PROFILSATZ`);
  }
  const article = WINDOWTYPE_TO_ARTNR[state.windowTypeId] ?? state.windowTypeId;
  const openings = state.sashOpenings.map(o => {
    const m = OPENING_CODE_MAP[o];
    if (!m) throw new Error(`stateToInput: sash opening ${JSON.stringify(o)} not in OPENING_CODE_MAP`);
    return m;
  });

  return {
    article,
    profilsatz: profEntry.profilsatz,
    materialart: profEntry.materialart,
    beschvar: state.fittingVariant,
    width_mm: state.dimensions.width,
    height_mm: state.dimensions.height,
    sashCount: state.sashOpenings.length || 1,
    openings,
    color: mapColor(state.interiorColor, state.exteriorColor),
    frameProfile: '50001',  // TODO: source from per-profile defaults table
    sashProfile: '50011',   // TODO: same
    glazing: {
      code: state.glazingPackage,
      panes: [state.glassOutside, state.glassMiddle, state.glassInside].filter(Boolean),
      spacer: state.glassSpacer,
    },
    schwelle: 0,
    dealer,
  };
}

// Default dealer for the current single-tenant deployment. When we
// onboard more dealers this comes from auth/session.
export const DEFAULT_DEALER: ConfiguratorInput['dealer'] = {
  kundenNr: 1008,
  pricelistKurzbez: 'EUR23011',
  land: 'CH',
};
