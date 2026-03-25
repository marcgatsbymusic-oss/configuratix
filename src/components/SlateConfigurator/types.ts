import colorLocalesJson from '../../data/colorLocales.json';
import glassLocalesJson from '../../data/glassLocales.json';

export const COLOR_LOCALE = (colorLocalesJson as any)['en'];
export const GLASS_LOCALE = (glassLocalesJson as any)['en'].glass;

export interface WindowDimensions {
  width: number; // mm
  height: number; // mm
}

export type MaterialType = 'PVC' | 'Aluminium' | 'PVC-Aluminium' | 'Wood' | 'Wood-Aluminium';
export type GlazingType = '2-pane' | '3-pane';

export interface ProfileTag {
  text: string;
  color: 'emerald' | 'blue';
}

export interface ProfileSystem {
  id: string;
  name: string;
  image: string;
  tags: ProfileTag[];
}

export interface Addon {
  id: string;
  name: string;
  price: number;
}

export interface ConfiguratorState {
  dimensions: WindowDimensions;
  material: MaterialType;
  profile: string;
  windowTypeId: string;
  sashOpenings: string[];
  interiorColorGroup: string;
  interiorColor: string;
  exteriorColorGroup: string;
  exteriorColor: string;
  glazing: string;
  addons: string[];
}

export type ConfiguratorAction =
  | { type: 'SET_DIMENSIONS'; payload: Partial<WindowDimensions> }
  | { type: 'SET_MATERIAL'; payload: MaterialType }
  | { type: 'SET_PROFILE'; payload: string }
  | { type: 'SET_WINDOW_TYPE'; payload: string }
  | { type: 'SET_SASH_OPENING'; payload: { index: number; openingId: string } }
  | { type: 'SET_INTERIOR_COLOR_GROUP'; payload: string }
  | { type: 'SET_INTERIOR_COLOR'; payload: string }
  | { type: 'SET_EXTERIOR_COLOR_GROUP'; payload: string }
  | { type: 'SET_EXTERIOR_COLOR'; payload: string }
  | { type: 'SET_GLAZING'; payload: string }
  | { type: 'TOGGLE_ADDON'; payload: string };

export const CONFIG_SCHEMA = {
  materials: {
    'PVC': { 
      basePricePerSqm: 150, minWidth: 500, maxWidth: 3000, minHeight: 500, maxHeight: 2500, image: '/assets/materials/pvc_ideal.png',
      profiles: [
        { id: 'iglo5', name: 'Iglo 5', image: '/assets/profiles/iglo5.png', tags: [{ text: 'Uw-Value ≥ 0.94', color: 'emerald' }] },
        { id: 'iglo5classic', name: 'Iglo 5 Classic', image: '/assets/profiles/iglo5classic.png', tags: [{ text: 'Uw-Value ≥ 0.94', color: 'emerald' }] },
        { id: 'iglolight', name: 'Iglo Light', image: '/assets/profiles/iglolight.png', tags: [{ text: 'Uw-Value ≥ 0.95', color: 'emerald' }, { text: 'More Daylight', color: 'blue' }] },
        { id: 'igloenergy', name: 'Iglo Energy', image: '/assets/profiles/igloenergy.png', tags: [{ text: 'Uw-Value ≥ 0.79', color: 'emerald' }] },
        { id: 'igloenergyclassic', name: 'Iglo Energy Classic', image: '/assets/profiles/igloenergyclassic.png', tags: [{ text: 'Uw-Value ≥ 0.81', color: 'emerald' }] },
        { id: 'igloedge', name: 'Iglo Edge', image: '/assets/profiles/igloedge.png', tags: [{ text: 'Uw-Value ≥ 0.66', color: 'emerald' }, { text: 'NEW', color: 'blue' }] },
        { id: 'igloext', name: 'Iglo EXT', image: '/assets/profiles/igloext.png', tags: [{ text: 'Outward opening', color: 'blue' }] },
        { id: 'iglopremier', name: 'Iglo Premier', image: '/assets/profiles/iglopremier.png', tags: [{ text: 'Outward opening', color: 'blue' }] }
      ]
    },
    'Aluminium': { 
      basePricePerSqm: 450, minWidth: 400, maxWidth: 4000, minHeight: 400, maxHeight: 3000, image: '/assets/materials/aluminium_mb_86_si_-_okno_profil.png',
      profiles: []
    },
    'PVC-Aluminium': { 
      basePricePerSqm: 280, minWidth: 500, maxWidth: 3500, minHeight: 500, maxHeight: 2800, image: '/assets/materials/PVC_aluminium.png',
      profiles: [
        { id: 'igloenergyalucover', name: 'Iglo Energy Alucover', image: '/assets/profiles/igloenergyalucover.png', tags: [] }
      ]
    },
    'Wood': { 
      basePricePerSqm: 350, minWidth: 600, maxWidth: 2800, minHeight: 600, maxHeight: 2400, image: '/assets/materials/wood_jasny_dab-a_1.png',
      profiles: [
        { id: 'softline68', name: 'Softline-68', image: '/assets/profiles/softline68.png', tags: [] },
        { id: 'softline78', name: 'Softline-78', image: '/assets/profiles/softline78.png', tags: [] },
        { id: 'softline88', name: 'Softline-88', image: '/assets/profiles/softline88.png', tags: [] }
      ]
    },
    'Wood-Aluminium': { 
      basePricePerSqm: 550, minWidth: 600, maxWidth: 3200, minHeight: 600, maxHeight: 2800, image: '/assets/materials/wood_aluminium_teak-a.png',
      profiles: [
        { id: 'duoline68', name: 'Duoline-68', image: '/assets/profiles/duoline68.png', tags: [] },
        { id: 'duoline78', name: 'Duoline-78', image: '/assets/profiles/duoline78.png', tags: [] },
        { id: 'duoline88', name: 'Duoline-88', image: '/assets/profiles/duoline88.png', tags: [] }
      ]
    }
  },
  glazing: [
    { id: 'g1', priceMod: 1.1 },
    { id: 'g2', priceMod: 1.2 },
    { id: 'g3', priceMod: 1.4 },
    { id: 'g11', priceMod: 1.0 },
    { id: 'g12', priceMod: 1.15 },
    { id: 'g19', priceMod: 1.3 },
    { id: 'g20', priceMod: 1.5 }
  ],
  addons: [
    { id: 'handle-premium', name: 'Premium Metal Handle', price: 45 },
    { id: 'sill-alu', name: 'Aluminum Window Sill', price: 85 },
    { id: 'roller-shutter', name: 'Integrated Roller Shutter', price: 290 }
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

export const WINDOW_TYPES: WindowType[] = [
  { id: '1-flugel', name: '1 Flügel', sashes: 1, layout: 'horizontal', imgUrl: '/assets/windowtypes/1-flugel.png' },
  { id: '1-flugel-oberlicht', name: '1 Flügel \nmit Oberlicht', sashes: 2, layout: 'vertical', imgUrl: '/assets/windowtypes/1-flugel-oberlicht.png' },
  { id: '1-flugel-unterlicht', name: '1 Flügel \nmit Unterlicht', sashes: 2, layout: 'vertical', imgUrl: '/assets/windowtypes/1-flugel-unterlicht.png' },
  { id: '2-flugel', name: '2 Flügel', sashes: 2, layout: 'horizontal', imgUrl: '/assets/windowtypes/2-flugel.png' },
  { id: '2-flugel-oberlicht', name: '2 Flügel \nmit Oberlicht', sashes: 3, layout: 'grid', imgUrl: '/assets/windowtypes/2-flugel-oberlicht.png' },
  { id: '2-flugel-oberlicht-asym', name: '2 Flügel asym. \nmit Oberlicht', sashes: 3, layout: 'grid', imgUrl: '/assets/windowtypes/2-flugel-oberlicht-asym.png' },
  { id: '2-flugel-unterlicht', name: '2 Flügel \nmit Unterlicht', sashes: 3, layout: 'grid', imgUrl: '/assets/windowtypes/2-flugel-unterlicht.png' },
  { id: '2-flugel-unterlicht-asym', name: '2 Flügel asym. \nmit Unterlicht', sashes: 3, layout: 'grid', imgUrl: '/assets/windowtypes/2-flugel-unterlicht-asym.png' },
  { id: '3-flugel', name: '3 Flügel', sashes: 3, layout: 'horizontal', imgUrl: '/assets/windowtypes/3-flugel.png' },
  { id: '3-flugel-oberlicht', name: '3 Flügel \nmit Oberlicht', sashes: 4, layout: 'grid', imgUrl: '/assets/windowtypes/3-flugel-oberlicht.png' },
  { id: '3-flugel-oberlicht-asym', name: '3 Flügel asym. \nmit Oberlicht', sashes: 4, layout: 'grid', imgUrl: '/assets/windowtypes/3-flugel-oberlicht-asym.png' },
  { id: '3-flugel-unterlicht', name: '3 Flügel \nmit Unterlicht', sashes: 4, layout: 'grid', imgUrl: '/assets/windowtypes/3-flugel-unterlicht.png' },
  { id: '3-flugel-unterlicht-asym', name: '3 Flügel asym. \nmit Unterlicht', sashes: 4, layout: 'grid', imgUrl: '/assets/windowtypes/3-flugel-unterlicht-asym.png' },
  { id: '4-flugel', name: '4 Flügel', sashes: 4, layout: 'horizontal', imgUrl: '/assets/windowtypes/4-flugel.png' }
];

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
