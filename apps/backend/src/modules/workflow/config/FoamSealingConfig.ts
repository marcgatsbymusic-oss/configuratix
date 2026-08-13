export const PLACEHOLDER_UNVERIFIED = 'PLACEHOLDER_UNVERIFIED';

/**
 * Foam sealing and curing configuration.
 * FR-5.25, FR-5.73
 * Both cure timers must come from the foam manufacturer's technical data sheets.
 */
export const FoamSealingConfig = {
  // Cure time before sashes can be refit / adjusted (minutes)
  sashRefitCureTimerMinutes: PLACEHOLDER_UNVERIFIED as string | number, // e.g. 40
  // Cure time before excess foam can be trimmed / cut (minutes)
  trimmingCureTimerMinutes: PLACEHOLDER_UNVERIFIED as string | number,  // e.g. 20
};

export function isFoamConfigVerified(): boolean {
  return !Object.values(FoamSealingConfig).includes(PLACEHOLDER_UNVERIFIED);
}
