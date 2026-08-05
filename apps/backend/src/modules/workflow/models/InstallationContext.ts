export interface InstallationContext {
  openingId: string;
  installationType?: string; // e.g., 'machine', 'manual'
  windowCount?: number;
  hasAutoLevelling?: boolean;
  requiresSpecialCure?: boolean;
  material?: string; // e.g., 'PVC', 'ALU', 'WOOD'
  [key: string]: any; // Allow arbitrary attributes for flexible rules
}
