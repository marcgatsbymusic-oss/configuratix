export const PLACEHOLDER_UNVERIFIED = 'PLACEHOLDER_UNVERIFIED';

/**
 * Trim Config (Prompt 12 implementation)
 * 
 * According to FR-7.2 and the AI guardrails, the actual formula and datum for 
 * trim calculation MUST NOT be assumed. The arithmetic given in the spec is 
 * an explicitly unvalidated example.
 */
export const TrimConfig = {
  // Datum for measurements (e.g. "FRAME_FACE", "WALL_FACE")
  measurementDatum: PLACEHOLDER_UNVERIFIED,
  
  // Cut length formulas (these should be functions/evaluations provided by product data)
  straightCutFormula: PLACEHOLDER_UNVERIFIED,
  mitreCutFormula: PLACEHOLDER_UNVERIFIED,
  buttCutFormula: PLACEHOLDER_UNVERIFIED,
  
  // Configurable stocked widths seeded per FR-7.11
  stockedWidthsMm: [20, 30, 40, 50, 60, 70, 80, 100]
};

export function isTrimConfigVerified(): boolean {
  return ![
    TrimConfig.measurementDatum, 
    TrimConfig.straightCutFormula,
    TrimConfig.mitreCutFormula,
    TrimConfig.buttCutFormula
  ].includes(PLACEHOLDER_UNVERIFIED);
}
