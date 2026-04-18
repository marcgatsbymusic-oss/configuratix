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

export interface GlazingPackage {
  id: string;
  name?: string;
  priceMod?: number;
  group?: string;
  description2?: string;
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
  glazingPackage: string;
  glassOutside: string;
  glassMiddle: string;
  glassInside: string;
  glassSpacer: string;
  addons: string[];
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
  | { type: 'SET_GLAZING_PACKAGE'; payload: string }
  | { type: 'SET_GLASS_OUTSIDE'; payload: string }
  | { type: 'SET_GLASS_MIDDLE'; payload: string }
  | { type: 'SET_GLASS_INSIDE'; payload: string }
  | { type: 'SET_GLASS_SPACER'; payload: string }
  | { type: 'TOGGLE_ADDON'; payload: string };

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
    { id: '2-24', name: '2-24 Double-glazed 24mm', priceMod: 1.0, group: 'Glazing Packages' },
    { id: '3-36', name: '3-36 Triple-glazed 36mm', priceMod: 1.15, group: 'Glazing Packages' },
    { id: '3-48', name: '3-48 Triple-glazed 48mm', priceMod: 1.30, group: 'Glazing Packages' },
    
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
