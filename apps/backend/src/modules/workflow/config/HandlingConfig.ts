export const PLACEHOLDER_UNVERIFIED = 'PLACEHOLDER_UNVERIFIED';

/**
 * Handling limits (Prompt 8b implementation)
 * 
 * According to FR-5.39 and the AI guardrails, the manual-handling thresholds 
 * for crew sizes and mechanical aids MUST come from regulation and equipment 
 * rating, not from the model's own knowledge.
 * 
 * These values must be overridden by confirmed compliance settings.
 */
export const HandlingConfig = {
  // Max weight 1 person can lift (kg)
  maxWeight1Person: PLACEHOLDER_UNVERIFIED, // e.g. 25
  // Max weight 2 people can lift (kg)
  maxWeight2People: PLACEHOLDER_UNVERIFIED, // e.g. 50
  // Threshold requiring mechanical aid (kg)
  mechanicalAidThresholdKg: PLACEHOLDER_UNVERIFIED, // e.g. 80
  
  // Dimensions that require mechanical aid regardless of weight (mm)
  mechanicalAidThresholdWidthMm: PLACEHOLDER_UNVERIFIED,
  mechanicalAidThresholdHeightMm: PLACEHOLDER_UNVERIFIED,
};

export function isHandlingConfigVerified(): boolean {
  return !Object.values(HandlingConfig).includes(PLACEHOLDER_UNVERIFIED);
}
