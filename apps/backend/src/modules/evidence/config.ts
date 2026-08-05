export const EvidenceConfig = {
  // Compression and resolution policy for evidence photos
  photoPolicy: {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 80,
    format: 'jpeg',
    maxSizeBytes: 2 * 1024 * 1024 // 2MB
  },
  
  // Levelling tolerances per axis
  // DO NOT INVENT: These must be loaded from configuration.
  // Placeholder values MUST be marked with a PLACEHOLDER_UNVERIFIED constant.
  // The system MUST log loudly when a placeholder is used.
  levellingTolerances: {
    PLACEHOLDER_UNVERIFIED: true,
    // e.g. Max deviation in mm/m, placeholder values until Drutex provides real numbers
    X_AXIS_MAX_DEVIATION_MM: 2.0, 
    Y_AXIS_MAX_DEVIATION_MM: 2.0,
    Z_AXIS_MAX_DEVIATION_MM: 2.0,
  }
};
