import { create } from 'zustand';

export type EmbossingType = 'smooth' | 'grooves' | 'woodgrain' | 'stucco';
export type DriveType = 'manual' | 'beninca_jim3';
export type SpringType = 'extension' | 'torsion';

export interface GarageDoorState {
  width: number; // in mm
  height: number; // in mm
  lintelHeight: number; // in mm (C)
  revealLeft: number; // in mm (A)
  revealRight: number; // in mm (B)
  installationDepth: number; // in mm (D)
  extColor: string; // Hex color for exterior
  intColor: string; // Hex color for interior
  casingColor: string; // Hex color for outer frame/casing
  extTexture: string | undefined; // Optional woodgrain texture URL
  intTexture: string | undefined; // Optional interior texture URL
  panelThickness: number; // in mm
  embossing: EmbossingType;
  driveType: DriveType;
  springType: SpringType;
  
  // Animation state
  animationProgress: number; // 0 (closed) to 1 (open)
  isAnimating: boolean;
  animationDirection: 'up' | 'down';
  
  // Actions
  setWidth: (width: number) => void;
  setHeight: (height: number) => void;
  setColors: (ext: string, any?: string) => void;
  setExtColor: (color: string) => void;
  setIntColor: (color: string) => void;
  setCasingColor: (color: string) => void;
  setExtTexture: (tex: string | undefined) => void;
  setIntTexture: (tex: string | undefined) => void;
  setEmbossing: (embossing: EmbossingType) => void;
  setDriveType: (drive: DriveType) => void;
  setSpringType: (spring: SpringType) => void;
  setAnimationProgress: (prog: number) => void;
  setIsAnimating: (anim: boolean) => void;
  setAnimationDirection: (direction: 'up' | 'down') => void;
  resetToPdfSpecs: () => void;
}

export const useGarageDoorStore = create<GarageDoorState>((set) => ({
  width: 3985,
  height: 2185,
  lintelHeight: 120,
  revealLeft: 90,
  revealRight: 90,
  installationDepth: 3274,
  extColor: '#ffffff', // base color for texture blending
  intColor: '#ffffff',
  casingColor: '#ffffff',
  extTexture: '/assets/texturesbaked/zaoty-dab_kk/diffuse.jpg', // default Golden Oak
  intTexture: undefined,
  panelThickness: 40,
  embossing: 'woodgrain',
  driveType: 'beninca_jim3',
  springType: 'extension',
  animationProgress: 0,
  isAnimating: false,
  animationDirection: 'up',

  setWidth: (width) => set({ width }),
  setHeight: (height) => set({ height }),
  setColors: (ext, any) => set({ extColor: ext, ...(any ? { intColor: any } : {}) }),
  setExtColor: (extColor) => set({ extColor }),
  setIntColor: (intColor) => set({ intColor }),
  setCasingColor: (casingColor) => set({ casingColor }),
  setExtTexture: (extTexture) => set({ extTexture }),
  setIntTexture: (intTexture) => set({ intTexture }),
  setEmbossing: (embossing) => set({ embossing }),
  setDriveType: (driveType) => set({ driveType }),
  setSpringType: (springType) => set({ springType }),
  setAnimationProgress: (animationProgress) => set({ animationProgress }),
  setIsAnimating: (isAnimating) => set({ isAnimating }),
  setAnimationDirection: (animationDirection) => set({ animationDirection }),
  
  resetToPdfSpecs: () => set({
    width: 3985,
    height: 2185,
    lintelHeight: 120,
    revealLeft: 90,
    revealRight: 90,
    installationDepth: 3274,
    extColor: '#ffffff',
    intColor: '#ffffff',
    casingColor: '#ffffff',
    extTexture: undefined,
    intTexture: undefined,
    panelThickness: 40,
    embossing: 'smooth',
    driveType: 'beninca_jim3',
    springType: 'extension',
    animationProgress: 0,
    isAnimating: false,
    animationDirection: 'up',
  }),
}));
