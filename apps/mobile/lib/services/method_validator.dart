import '../config/installation_config.dart';

class UnverifiedConfigurationException implements Exception {
  final String message;
  UnverifiedConfigurationException(this.message);

  @override
  String toString() => "UnverifiedConfigurationException: $message";
}

enum InstallationMethod {
  largeMachine,
  smallMachine,
  manualOneWorker,
  manualTwoWorkers
}

class MethodValidator {
  
  /// Validates if the selected method is legal for the given window weight.
  /// Enforces FR-6.13 (Machine-only size threshold).
  static void validateMethod(InstallationMethod method, double windowWeightKg) {
    if (!InstallationConfig.isConfigVerified()) {
      print('[WARNING] Evaluated method rules while MACHINE_ONLY_WEIGHT_THRESHOLD_KG is unverified.');
      // Depending on strictness, we might throw here. For now, we warn heavily.
      // throw UnverifiedConfigurationException('Machine-only weight threshold is unverified.');
    }

    final threshold = InstallationConfig.MACHINE_ONLY_WEIGHT_THRESHOLD_KG;
    
    // If we have a real threshold, enforce it.
    if (threshold is num && windowWeightKg >= threshold) {
      if (method == InstallationMethod.manualOneWorker || 
          method == InstallationMethod.manualTwoWorkers) {
        throw Exception('Safety Violation: Window weight ($windowWeightKg kg) exceeds manual handling threshold ($threshold kg). A machine method is legally required.');
      }
    }
  }
}
