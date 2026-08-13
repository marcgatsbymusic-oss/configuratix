export const PLACEHOLDER_UNVERIFIED = 'PLACEHOLDER_UNVERIFIED';

export interface MechanicalFixingConfigType {
  screwSpecification: string;
  minHolesPerSide: number | string;
  maxSpacingMm: number | string;
  cornerOffsetMm: number | string;
  tighteningSequence: string;
}

/**
 * Mechanical fixing configuration.
 * FR-5.16, FR-5.20, FR-5.21
 * These values MUST be verified by Drutex technical documentation before use.
 * Do not hallucinate replacements; leave PLACEHOLDER_UNVERIFIED until officially supplied.
 */
export const mechanicalFixingConfig: MechanicalFixingConfigType = {
  screwSpecification: PLACEHOLDER_UNVERIFIED, // e.g. "7mm frame screw"
  minHolesPerSide: PLACEHOLDER_UNVERIFIED,    // e.g. 2 for small windows, 3 for large
  maxSpacingMm: PLACEHOLDER_UNVERIFIED,       // e.g. 700mm
  cornerOffsetMm: PLACEHOLDER_UNVERIFIED,                        // Standard safe distance from corner weld
  tighteningSequence: PLACEHOLDER_UNVERIFIED, // e.g. "diagonal opposite corners"
};

/**
 * Checks if the configuration is safe to use in the field.
 */
export function isFixingConfigVerified(config: MechanicalFixingConfigType = mechanicalFixingConfig): boolean {
  return !Object.values(config).includes(PLACEHOLDER_UNVERIFIED);
}
