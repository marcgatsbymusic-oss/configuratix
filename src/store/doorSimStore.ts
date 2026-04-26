import { create } from 'zustand';

export interface DoorState {
  system: 'alu' | 'pvc' | 'wood';
  modelId: string;
  frameColor: string;
  leafColor: string;
  handleId: string;
  glassType: string;
  patternMaskId: string;
  
  // Actions
  setSystem: (sys: 'alu' | 'pvc' | 'wood') => void;
  setModel: (modelId: string) => void;
  setColor: (part: 'frame' | 'leaf', colorId: string) => void;
  setHandle: (handleId: string) => void;
  setGlass: (glassType: string) => void;
  setPatternMask: (patternId: string) => void;
}

export const useDoorConfigurator = create<DoorState>((set, get) => ({
  system: 'alu',
  modelId: 'MB-86N',
  frameColor: 'c214',
  leafColor: 'c214',
  handleId: 'klamka_srebrna',
  glassType: 'antisol_szary',
  patternMaskId: 'alaska1',

  setSystem: (sys) => {
    // If we switch systems, we might need to reset incompatible handles/models
    set({ system: sys, modelId: sys === 'pvc' ? 'IGLO-Energy' : 'MB-86N' });
  },
  
  setModel: (modelId) => set({ modelId }),
  
  setColor: (part, colorId) => {
    if (part === 'frame') set({ frameColor: colorId });
    if (part === 'leaf') set({ leafColor: colorId });
  },

  setHandle: (handleId) => {
    const { system } = get();
    // Example: Hardware Compatibility Rule Engine
    if (system === 'pvc' && handleId.startsWith('P45')) {
      console.warn("Handle P45 is incompatible with PVC systems. Reverting to Q10.");
      set({ handleId: 'Q10' });
    } else {
      set({ handleId });
    }
  },

  setGlass: (glassType) => set({ glassType }),
  
  setPatternMask: (patternId) => set({ patternMaskId: patternId }),
}));

// Asset URL Generator Utility (maps state to PNGs/SVGs)
export const generateAssetURLs = (state: DoorState) => {
  // Point to the scraped assets
  const baseUrl = '/doorsim-assets/scraped_doors/assets';

  const colorHexMap: Record<string, string> = {
    'c197': '#ffffff',
    'c214': '#3b3c3f',
    'c217': '#0a0a0a',
    'c231': '#3e2b23',
    'c205': '#878c93',
    'c209': '#4f5358',
    'c236': '#163e63',
    'c234': '#0d2d1e',
    'c235': '#461515'
  };

  const glassMap: Record<string, string> = {
    'antisol_szary': '/glass/szyba_antisol_szary.webp',
    'antisol_brazowy': '/glass/szyba_antisol_brazowy.webp',
    'matowa': '/glass/szyba_bezpieczna_folia_matowa.webp',
    'chinchilla': '/glass/szyba_ornament_chinchilla.webp'
  };

  const patternMap: Record<string, string | null> = {
    'none': null,
    'alaska1': '/panel/ALASKA_1-3/ALASKA-1-maska-szyby-C.svg',
    'alaska2': '/panel/ALASKA_2/ALASKA-2-maska-szyby-C.svg',
    'alaska3': '/panel/ALASKA_1-3/ALASKA-3-panel-frez.svg'
  };

  const handleMap: Record<string, string | null> = {
    'none': null,
    'klamka_srebrna': '/handles/Klamka-30A-1006-Srebrna.webp',
    'klamka_czarna': '/handles/Klamka-H6S36-szyld-dlogi-34mm-klamka-26mm-czarna.webp',
    'pochwyt_p10': '/handles/Pochwyt-P10D-120.webp',
    'pochwyt_q10': '/handles/Pochwyt-Q10-120.webp'
  };

  return {
    frameColorHex: colorHexMap[state.frameColor],
    leafColorHex: colorHexMap[state.leafColor],
    frameMask: `${baseUrl}/system/MB86N/Drzwi-MB86N-wz-oscieznica.svg`,
    leafMask: `${baseUrl}/system/MB86N/Drzwi-MB86N-wz-rama-skrzydla.svg`,
    glassUrl: state.glassType ? `${baseUrl}${glassMap[state.glassType]}` : null,
    patternMaskUrl: state.patternMaskId ? (patternMap[state.patternMaskId] ? `${baseUrl}${patternMap[state.patternMaskId]}` : null) : null,
    handleUrl: state.handleId ? (handleMap[state.handleId] ? `${baseUrl}${handleMap[state.handleId]}` : null) : null,
  };
};
