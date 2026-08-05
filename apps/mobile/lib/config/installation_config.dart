/// Configuration variables for the mobile app execution environment.
/// Placeholders MUST remain 'PLACEHOLDER_UNVERIFIED' until officially
/// resolved by Drutex technical documentation (FR-6.13, etc).

const String PLACEHOLDER_UNVERIFIED = 'PLACEHOLDER_UNVERIFIED';

class InstallationConfig {
  /// The machine-only threshold in KG.
  /// If a window exceeds this weight, manual handling is strictly forbidden by regulations.
  /// FR-6.13 explicitly notes this is unresolved.
  static const dynamic MACHINE_ONLY_WEIGHT_THRESHOLD_KG = PLACEHOLDER_UNVERIFIED;
  
  static bool isConfigVerified() {
    if (MACHINE_ONLY_WEIGHT_THRESHOLD_KG == PLACEHOLDER_UNVERIFIED) {
      return false;
    }
    return true;
  }
}
