export const PLACEHOLDER_UNVERIFIED = 'PLACEHOLDER_UNVERIFIED';

/**
 * Compliance Config (Prompt 9 implementation)
 * 
 * FR-5.50 hazardous material check: implement the prompt, the block, and the
 * escalation path, but DO NOT encode any rule about which buildings, which
 * materials, or which obligations apply. That is an unanswered compliance
 * question. Make the date threshold and the prompt text configuration, and
 * leave them empty by default.
 */
export const ComplianceConfig = {
  hazardousMaterialBuildingAgeThresholdYear: PLACEHOLDER_UNVERIFIED,
  hazardousMaterialPromptText: PLACEHOLDER_UNVERIFIED,
};

export function isComplianceConfigVerified(): boolean {
  return !Object.values(ComplianceConfig).includes(PLACEHOLDER_UNVERIFIED);
}
