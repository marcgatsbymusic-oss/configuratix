import colorLocalesJson from '../../data/colorLocales.json';
import glassLocalesJson from '../../data/glassLocales.json';
import typologiesJson from '../../data/window_typologies.json';
import websiteCatalog from '../../data/website_catalog.json';

export const COLOR_LOCALE = (colorLocalesJson as any)['en'];
export const GLASS_LOCALE = (glassLocalesJson as any)['en'].glass;
export const WINDOW_TYPES: any[] = typologiesJson;

export interface WindowDimensions {
  width: number; // mm
  height: number; // mm
}

export const SINGLE_PANES = [
  // Float
  { code: 'FL4', name: 'Float 4mm' },
  { code: 'FL6', name: 'Float 6mm' },
  { code: 'FL8', name: 'Float 8mm' },
  { code: 'FL10', name: 'Float 10mm' },
  // Thermo (Low-E)
  { code: 'T4', name: 'Thermoline 4mm' },
  { code: 'T6', name: 'Thermoline 6mm' },
  { code: 'T8', name: 'Thermoline 8mm' },
  { code: 'T10', name: 'Thermoline 10mm' },
  // Safe / Laminated
  { code: 'B1', name: 'Safe 33.1' },
  { code: 'TB1', name: 'Thermo Safe 33.1 th' },
  { code: 'B2', name: 'Safe 33.2' },
  { code: 'TB2', name: 'Thermo Safe 33.2 th' },
  { code: '44.4', name: 'Anti-burglary 44.4' },
  { code: 'TA4', name: 'Thermo Anti-burglary 44.4 th' },
  { code: 'TB4', name: 'Thermo Anti-burglary 44.2 th' },
  { code: 'VSG', name: 'VSG Standard' },
  // Acoustic
  { code: 'SR9', name: 'Acoustic 44.2 SR' },
  { code: 'TSR9', name: 'Thermo Acoustic 44.2 SR th' },
  // Obscured / Tinted
  { code: 'M4', name: 'Matte 4mm' },
  { code: 'M8.2', name: 'Matte 8.2mm' },
  { code: 'ADB6H', name: 'Antisol Dark Blue 6mm (Tempered)' },
  { code: 'SAT4', name: 'Satin 4mm' }
];

const IGLO_ACOUSTIC_PACKAGES = [
  'T4/18/FL8', 'FL6/16/T4', 'B1/16/T4', 'B1/16/TB1', 'TB1/18/FL', 'A4/16/T4', 'A4/16/TB1', 'T8/20/SR9'
];

const IGLO_STANDARD_PACKAGES = [
  '2-18', '2-20', '2-22', '2-24', '2-26', '2-28', '2-30', '2-32', '2-34', '2-36', '2-40',
  '3-24', '3-28', '3-32', '3-34', '3-36', '3-40',
  ...IGLO_ACOUSTIC_PACKAGES
];

export const PROFILE_GLAZING_LIMITS: Record<string, { min: number; max: number; packages: string[] }> = {
  '50011': { min: 18, max: 40, packages: IGLO_STANDARD_PACKAGES },
  '1100': { min: 18, max: 40, packages: IGLO_STANDARD_PACKAGES },
  '1101': { min: 18, max: 40, packages: IGLO_STANDARD_PACKAGES },
  '1103': { min: 18, max: 40, packages: IGLO_STANDARD_PACKAGES },
  '1110': { min: 18, max: 40, packages: IGLO_STANDARD_PACKAGES },
  '1200': { min: 18, max: 40, packages: IGLO_STANDARD_PACKAGES },
  '1300': { min: 18, max: 40, packages: IGLO_STANDARD_PACKAGES },
  '1310': { min: 18, max: 40, packages: IGLO_STANDARD_PACKAGES },
  '1360': { min: 18, max: 40, packages: IGLO_STANDARD_PACKAGES },
  '1400': { min: 18, max: 40, packages: IGLO_STANDARD_PACKAGES },
  '1500': { min: 18, max: 40, packages: IGLO_STANDARD_PACKAGES },
  '1600': { min: 18, max: 40, packages: IGLO_STANDARD_PACKAGES },
  'IG5': { min: 18, max: 40, packages: IGLO_STANDARD_PACKAGES },
  'IG5CL': { min: 18, max: 40, packages: IGLO_STANDARD_PACKAGES },
  'IG5 PP PSK': { min: 18, max: 40, packages: IGLO_STANDARD_PACKAGES },
  'IGE': { min: 18, max: 48, packages: IGLO_STANDARD_PACKAGES },
  'IGECL': { min: 18, max: 48, packages: IGLO_STANDARD_PACKAGES },
  'IGL': { min: 18, max: 40, packages: IGLO_STANDARD_PACKAGES },
  'IGP': { min: 18, max: 40, packages: IGLO_STANDARD_PACKAGES },
  // Fallback limits for all other unknown profiles
  'DEFAULT': { min: 18, max: 68, packages: [
    '2-18', '2-20', '2-22', '2-24', '2-26', '2-28', '2-30', '2-32', '2-34', '2-36', '2-40',
    '3-24', '3-28', '3-32', '3-34', '3-36', '3-40', '3-48', '4-58', '4-68'
  ] }
};

export interface GlazingPackage {
  id: string;
  name?: string;
  priceMod?: number;
  group?: string;
  description2?: string;
  fixedPanes?: string[];
}

export type CategoryType = 'Windows' | 'Doors' | 'Terrace Systems' | 'Shutters' | 'Exterior Venetian Blinds' | 'Insect Screens' | 'Garage doors' | 'Facades / Winter Gardens' | 'Pergola';
export type GlazingType = '2-pane' | '3-pane';

// --- CANTOR DATA INTERFACES --- //
export interface CantorSystem {
  cantor_key: string;
  name: string;
  type_class: string;
  pricing_group: string;
  base_price: number;
  min_width: number;
  max_width: number;
  min_height: number;
  max_height: number;
}
export interface CantorPricingRule {
  id: string;
  system_key: string;
  description: string;
  rule_type: string;
  formula_string: string;
  modifier: number;
}
export interface CantorArticle {
  article_code: string;
  system_key: string;
  name: string;
  price_value: number;
  matrix_column_index: number;
}
export interface CantorFormulaMatrix {
  id: number;
  matrix_name: string;
  class_1: string;
  class_2: string;
  width: number;
  height: number;
  prices: number[];
}
// ------------------------------ //

export interface ProfileTag {
  text: string;
  color: 'emerald' | 'blue';
}

export interface ProfileSystem {
  id: string;
  name: string;
  image: string;
  tags: ProfileTag[];
  cantorSystemMap?: string | null;
  material?: string;
  technical?: {
    uwValue: number;
    profileDepth: number;
    chambers?: number;
    gaskets: number;
    energyGrade: 'A+' | 'A' | 'B' | 'C' | 'D';
    description: string;
  };
}

export interface Addon {
  id: string;
  name: string;
  price: number;
}

export interface ConfiguratorState {
  dimensions: WindowDimensions;
  category: CategoryType;
  materialFilter: string | null;
  sortByTracker: 'default' | 'energy' | 'depth' | 'sound' | 'price';
  sortDirection: 'asc' | 'desc';
  profile: string;
  windowTypeId: string;
  sashOpenings: string[];
  fittingVariant: string;
  interiorColorGroup: string;
  interiorColor: string;
  exteriorColorGroup: string;
  exteriorColor: string;
  blindColorGroup: string;
  blindColor: string;
  glazingPackage: string;
  glassOutside: string;
  glassMiddle: string;
  glassInside: string;
  glassSpacer: string;
  gasketColor: string;
  addons: string[];
  invertSides?: boolean;
}

export type ConfiguratorAction =
  | { type: 'SET_DIMENSIONS'; payload: Partial<WindowDimensions> }
  | { type: 'SET_CATEGORY'; payload: CategoryType }
  | { type: 'SET_MATERIAL_FILTER'; payload: string | null }
  | { type: 'SET_SORT_BY'; payload: 'default' | 'energy' | 'depth' | 'sound' | 'price' }
  | { type: 'SET_SORT_DIRECTION'; payload: 'asc' | 'desc' }
  | { type: 'SET_PROFILE'; payload: string }
  | { type: 'SET_WINDOW_TYPE'; payload: string }
  | { type: 'SET_SASH_OPENING'; payload: { index: number; openingId: string } }
  | { type: 'SET_FITTING_VARIANT'; payload: string }
  | { type: 'SET_INTERIOR_COLOR_GROUP'; payload: string }
  | { type: 'SET_INTERIOR_COLOR'; payload: string }
  | { type: 'SET_EXTERIOR_COLOR_GROUP'; payload: string }
  | { type: 'SET_EXTERIOR_COLOR'; payload: string }
  | { type: 'SET_BLIND_COLOR_GROUP'; payload: string }
  | { type: 'SET_BLIND_COLOR'; payload: string }
  | { type: 'SET_GLAZING_PACKAGE'; payload: string }
  | { type: 'SET_GLASS_OUTSIDE'; payload: string }
  | { type: 'SET_GLASS_MIDDLE'; payload: string }
  | { type: 'SET_GLASS_INSIDE'; payload: string }
  | { type: 'SET_GLASS_SPACER'; payload: string }
  | { type: 'SET_GASKET_COLOR'; payload: string }
  | { type: 'TOGGLE_ADDON'; payload: string }
  | { type: 'SET_INVERT_SIDES'; payload: boolean };

export const CONFIG_SCHEMA = {
  categories: {
    'Windows': { basePricePerSqm: 150, minWidth: 500, maxWidth: 3000, minHeight: 500, maxHeight: 2500, image: '/assets/materials/pvc_ideal.png', profiles: websiteCatalog['Windows'] as ProfileSystem[] },
    'Doors': { basePricePerSqm: 450, minWidth: 800, maxWidth: 2000, minHeight: 1800, maxHeight: 2500, image: '/assets/materials/wood_aluminium_teak-a.png', profiles: websiteCatalog['Doors'] as ProfileSystem[] },
    'Terrace Systems': { basePricePerSqm: 550, minWidth: 1000, maxWidth: 5000, minHeight: 1800, maxHeight: 3000, image: '/assets/materials/aluminium_mb_86_si_-_okno_profil.png', profiles: websiteCatalog['Terrace Systems'] as ProfileSystem[] },
    'Shutters': { basePricePerSqm: 100, minWidth: 500, maxWidth: 3000, minHeight: 500, maxHeight: 2500, image: '/assets/materials/PVC_aluminium.png', profiles: websiteCatalog['Shutters'] as ProfileSystem[] },
    'Exterior Venetian Blinds': { basePricePerSqm: 120, minWidth: 500, maxWidth: 3000, minHeight: 500, maxHeight: 2500, image: '/assets/materials/aluminium_mb_86_si_-_okno_profil.png', profiles: websiteCatalog['Exterior Venetian Blinds'] as ProfileSystem[] },
    'Insect Screens': { basePricePerSqm: 40, minWidth: 500, maxWidth: 3000, minHeight: 500, maxHeight: 2500, image: '/assets/materials/pvc_ideal.png', profiles: websiteCatalog['Insect Screens'] as ProfileSystem[] },
    'Garage doors': { basePricePerSqm: 800, minWidth: 2000, maxWidth: 5000, minHeight: 2000, maxHeight: 3000, image: '/assets/materials/wood_jasny_dab-a_1.png', profiles: websiteCatalog['Garage doors'] as ProfileSystem[] },
    'Facades / Winter Gardens': { basePricePerSqm: 700, minWidth: 1000, maxWidth: 5000, minHeight: 2000, maxHeight: 4000, image: '/assets/materials/aluminium_mb_86_si_-_okno_profil.png', profiles: websiteCatalog['Facades / Winter Gardens'] as ProfileSystem[] },
    'Pergola': { basePricePerSqm: 900, minWidth: 2000, maxWidth: 6000, minHeight: 2500, maxHeight: 3500, image: '/assets/materials/wood_aluminium_teak-a.png', profiles: websiteCatalog['Pergola'] as ProfileSystem[] }
  },
  glazing: [
    { id: '2-18', name: '2-18 Double-glazed 18mm', priceMod: 1.0, group: 'Glazing Packages' },
    { id: '2-20', name: '2-20 Double-glazed 20mm', priceMod: 1.0, group: 'Glazing Packages' },
    { id: '2-22', name: '2-22 Double-glazed 22mm', priceMod: 1.0, group: 'Glazing Packages' },
    { id: '2-24', name: '2-24 Double-glazed 24mm', priceMod: 1.0, group: 'Glazing Packages' },
    { id: '2-26', name: '2-26 Double-glazed 26mm', priceMod: 1.05, group: 'Glazing Packages' },
    { id: '2-28', name: '2-28 Double-glazed 28mm', priceMod: 1.05, group: 'Glazing Packages' },
    { id: '2-30', name: '2-30 Double-glazed 30mm', priceMod: 1.06, group: 'Glazing Packages' },
    { id: '2-32', name: '2-32 Double-glazed 32mm', priceMod: 1.07, group: 'Glazing Packages' },
    { id: '2-34', name: '2-34 Double-glazed 34mm', priceMod: 1.07, group: 'Glazing Packages' },
    { id: '2-36', name: '2-36 Double-glazed 36mm', priceMod: 1.08, group: 'Glazing Packages' },
    { id: '2-40', name: '2-40 Double-glazed 40mm', priceMod: 1.1, group: 'Glazing Packages' },
    { id: '3-24', name: '3-24 Triple-glazed 24mm', priceMod: 1.1, group: 'Glazing Packages' },
    { id: '3-28', name: '3-28 Triple-glazed 28mm', priceMod: 1.12, group: 'Glazing Packages' },
    { id: '3-32', name: '3-32 Triple-glazed 32mm', priceMod: 1.13, group: 'Glazing Packages' },
    { id: '3-34', name: '3-34 Triple-glazed 34mm', priceMod: 1.14, group: 'Glazing Packages' },
    { id: '3-36', name: '3-36 Triple-glazed 36mm', priceMod: 1.15, group: 'Glazing Packages' },
    { id: '3-40', name: '3-40 Triple-glazed 40mm', priceMod: 1.2, group: 'Glazing Packages' },
    { id: '3-48', name: '3-48 Triple-glazed 48mm', priceMod: 1.30, group: 'Glazing Packages' },
    { id: '4-58', name: '4-58 Quad-glazed 58mm', priceMod: 1.60, group: 'Glazing Packages' },
    { id: '4-68', name: '4-68 Quad-glazed 68mm', priceMod: 1.80, group: 'Glazing Packages' },
    
    // Fixed / Acoustic Glazing Packages
    { id: 'T4/18/FL8', name: 'T4/18/FL8 Ug=1.1', group: 'Fixed Pane Packages', fixedPanes: ['T4', '', 'FL8'] },
    { id: 'FL6/16/T4', name: 'FL6/16/T4 6/16/4 th Ug=1.1, Rw=40dB', group: 'Fixed Pane Packages', fixedPanes: ['FL6', '', 'T4'] },
    { id: 'B1/16/T4', name: 'B1/16/T4 33.1/16/4 th Ug=1.1, Rw=40dB', group: 'Fixed Pane Packages', fixedPanes: ['B1', '', 'T4'] },
    { id: 'B1/16/TB1', name: 'B1/16/TB1 33.1/16/33.1 th Ug=1.1, Rw=40dB', group: 'Fixed Pane Packages', fixedPanes: ['B1', '', 'TB1'] },
    { id: 'TB1/18/FL', name: 'TB1/18/FL 33.1 th/18/8 Ug=1.1, Rw=41dB', group: 'Fixed Pane Packages', fixedPanes: ['TB1', '', 'FL8'] },
    { id: 'A4/16/T4', name: 'A4/16/T4 44.4/16/4 th Ug=1.1, Rw=41dB', group: 'Fixed Pane Packages', fixedPanes: ['A4', '', 'T4'] },
    { id: 'A4/16/TB1', name: 'A4/16/TB1 44.4/16/33.1 th Ug=1.1, Rw=43dB', group: 'Fixed Pane Packages', fixedPanes: ['A4', '', 'TB1'] },
    { id: 'T8/20/SR9', name: 'T8/20/SR9 8 th/20/44.2 SR Ug=1.1, Rw=46dB', group: 'Fixed Pane Packages', fixedPanes: ['T8', '', 'SR9'] },
    
    // Non Glazing Packages mapped from UI Matrix
    { id: 'BS18', name: 'without glass, prepared for a package 18mm', priceMod: 0, group: 'Non Glazing' },
    { id: 'BS20', name: 'without glass, prepared for a package 20mm', priceMod: 0, group: 'Non Glazing' },
    { id: 'BS22', name: 'without glass, prepared for a package 22mm', priceMod: 0, group: 'Non Glazing' },
    { id: 'BS24', name: 'without glass, prepared for a package 24mm', priceMod: 0, group: 'Non Glazing' },
    { id: 'BS26', name: 'without glass, prepared for a package 26mm', priceMod: 0, group: 'Non Glazing' },
    { id: 'BS28', name: 'without glass, prepared for a package 28mm', priceMod: 0, group: 'Non Glazing' },
    { id: 'BS30', name: 'without glass, prepared for a package 30mm', priceMod: 0, group: 'Non Glazing' },
    { id: 'BS32', name: 'without glass, prepared for a package 32mm', priceMod: 0, group: 'Non Glazing' },
    { id: 'BS34', name: 'without glass, prepared for a package 34mm', priceMod: 0, group: 'Non Glazing' },
    { id: 'BS36', name: 'without glass, prepared for a package 36mm', priceMod: 0, group: 'Non Glazing' },
    { id: 'BS40', name: 'without glass, prepared for a package 40mm', priceMod: 0, group: 'Non Glazing' },
    { id: 'CA100_36', name: 'Classic panel - single-sided CA100 - 36mm', priceMod: 0, group: 'Non Glazing' },
    { id: 'DB100_36_V', name: 'V-type panel single-sided DB100 - 36mm Vertical milling', priceMod: 0, group: 'Non Glazing' },
    { id: 'DB100_36_H', name: 'V-type panel single-sided DB100 36mm Horizontal milling', priceMod: 0, group: 'Non Glazing' },
    { id: 'DB200_36_V', name: 'V-type panel double-sided DB200 36mm Vertical milling', priceMod: 0, group: 'Non Glazing' },
    { id: 'DB200_36_H', name: 'V-type panel double-sided DB200 36mm Horizontal milling', priceMod: 0, group: 'Non Glazing' },
    { id: 'DW100_3', name: 'Classic panel - single-sided DW100 - 36mm', priceMod: 0, group: 'Non Glazing' },
    { id: 'PVC24', name: 'PVC board 24mm', priceMod: 0, group: 'Non Glazing' },
    { id: 'PVC36', name: 'PVC board 36mm', priceMod: 0, group: 'Non Glazing' },
    { id: 'PW24', name: 'PVC polycarbonate 24mm', priceMod: 0, group: 'Non Glazing' }
  ] as GlazingPackage[],
  addons: [
    { id: 'handle-premium', name: 'Premium Metal Handle', price: 45 },
    { id: 'handle-locked', name: 'Key-Locked Safety Handle', price: 55 },
    { id: 'sill-alu', name: 'Aluminum Window Sill', price: 85 },
    { id: 'roller-shutter', name: 'Integrated Roller Shutter', price: 290 },
    { id: 'mosquito-net', name: 'Integrated Mosquito Net', price: 120 },
    { id: 'trim-facia', name: 'Exterior Frame Trim / Facia', price: 65 },
    { id: 'frame-extension', name: 'Frame Extension (+50mm)', price: 40 },
    { id: 'warm-edge', name: 'Warm Edge Spacer (Swisspacer)', price: 30 },
    { id: 'pressure-valve', name: 'Pressure Equalization Valve', price: 25 },
  ]
};

// --- NEW SCHEMA: WINDOW TYPES & OPENING TYPES ---

export interface WindowType {
  id: string;
  name: string;
  sashes: number;
  layout: 'horizontal' | 'vertical' | 'grid'; // For future Oberlicht/Unterlicht
  imgUrl: string;
}

export interface OpeningType {
  id: string;
  name: string;
  shortCode: string;
  imgUrl: string;
}

export const OPENING_TYPES: OpeningType[] = [
  { id: 'o1', name: 'Festverglasung', shortCode: 'F', imgUrl: '/assets/opening_types/o1.png' },
  { id: 'o2', name: 'Dreh-Kipp (links)', shortCode: 'DKL', imgUrl: '/assets/opening_types/o2_dkl.png' },
  { id: 'o3', name: 'Dreh-Kipp (rechts)', shortCode: 'DKR', imgUrl: '/assets/opening_types/o3_dkr.png' },
  { id: 'o4', name: 'Dreh (links)', shortCode: 'DL', imgUrl: '/assets/opening_types/o4_dl.png' },
  { id: 'o5', name: 'Dreh (rechts)', shortCode: 'DR', imgUrl: '/assets/opening_types/o5_dr.png' },
  { id: 'o6', name: 'Kipp', shortCode: 'K', imgUrl: '/assets/opening_types/o6_k.png' }
];

export function getTypologyImagePath(id: string): string {
  return `/assets/windowtypes/${id}.svg?v=2`;
}
