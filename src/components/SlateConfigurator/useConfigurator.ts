import { useReducer, useMemo } from 'react';
import { CONFIG_SCHEMA, WINDOW_TYPES } from './types';
import type { ConfiguratorState, ConfiguratorAction, MaterialType } from './types';

const initialState: ConfiguratorState = {
  dimensions: { width: 1000, height: 1200 },
  material: 'PVC',
  profile: 'iglo5',
  windowTypeId: '1-flugel',
  sashOpenings: ['o2'], // Default: 1-sash Dreh-Kipp
  interiorColorGroup: 'Metal Effect',
  interiorColor: 'c209', // Basalt Grey
  exteriorColorGroup: 'Metal Effect',
  exteriorColor: 'c214', // Anthracite
  glazing: 'g11', // Float 4 (Standard)
  addons: []
};

function getInitialState(): ConfiguratorState {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const product = params.get('product');
    
    if (product) {
      const slugToProfile: Record<string, { material: MaterialType, profile: string }> = {
        'iglo-edge': { material: 'PVC', profile: 'igloedge' },
        'iglo-5': { material: 'PVC', profile: 'iglo5' },
        'iglo-light': { material: 'PVC', profile: 'iglolight' },
        'iglo-energy': { material: 'PVC', profile: 'igloenergy' },
      };
      
      if (slugToProfile[product]) {
        return { ...initialState, ...slugToProfile[product] };
      }
    }
  }
  return initialState;
}

function configuratorReducer(state: ConfiguratorState, action: ConfiguratorAction): ConfiguratorState {
  switch (action.type) {
    case 'SET_DIMENSIONS':
      return { ...state, dimensions: { ...state.dimensions, ...action.payload } };
    case 'SET_MATERIAL': {
      // Safely clamp dimensions if out of bounds for the newly selected material constraints
      const limits = CONFIG_SCHEMA.materials[action.payload];
      // Automatically target the first sub-profile mapped on this material tier explicitly
      const fallbackProfile = limits.profiles.length > 0 ? limits.profiles[0].id : '';
      return {
        ...state,
        material: action.payload,
        profile: fallbackProfile,
        dimensions: {
          width: Math.min(Math.max(state.dimensions.width, limits.minWidth), limits.maxWidth),
          height: Math.min(Math.max(state.dimensions.height, limits.minHeight), limits.maxHeight),
        }
      };
    }
    case 'SET_PROFILE':
      return { ...state, profile: action.payload };
    case 'SET_WINDOW_TYPE': {
      const wt = WINDOW_TYPES.find(w => w.id === action.payload);
      if (!wt) return state;
      // Auto-populate the sash openings array matching the new sash count
      const newOpenings = Array.from({ length: wt.sashes }).map((_, i) => state.sashOpenings[i] || 'o2');
      return { ...state, windowTypeId: action.payload, sashOpenings: newOpenings };
    }
    case 'SET_SASH_OPENING': {
      const updatedOpenings = [...state.sashOpenings];
      updatedOpenings[action.payload.index] = action.payload.openingId;
      return { ...state, sashOpenings: updatedOpenings };
    }
    case 'SET_INTERIOR_COLOR_GROUP': return { ...state, interiorColorGroup: action.payload };
    case 'SET_INTERIOR_COLOR': return { ...state, interiorColor: action.payload };
    case 'SET_EXTERIOR_COLOR_GROUP': return { ...state, exteriorColorGroup: action.payload };
    case 'SET_EXTERIOR_COLOR': return { ...state, exteriorColor: action.payload };
    case 'SET_GLAZING':
      return { ...state, glazing: action.payload };
    case 'TOGGLE_ADDON':
      return {
        ...state,
        addons: state.addons.includes(action.payload)
          ? state.addons.filter(id => id !== action.payload)
          : [...state.addons, action.payload]
      };
    default:
      return state;
  }
}

export function useConfigurator() {
  const [state, dispatch] = useReducer(configuratorReducer, initialState, getInitialState);

  const pricing = useMemo(() => {
    // Area in square meters
    const area = (state.dimensions.width / 1000) * (state.dimensions.height / 1000);
    
    // Base material cost metric
    let basePrice = area * CONFIG_SCHEMA.materials[state.material].basePricePerSqm;
    
    // Glazing multiplier processing
    const glassObj = CONFIG_SCHEMA.glazing.find(g => g.id === state.glazing);
    basePrice *= glassObj ? glassObj.priceMod : 1.0;
    
    // Hardware basics (fixed cost framework)
    let hardwareCost = 120; // Structural elements, hinges, mechanism locking points
    
    // Add-ons accumulator
    const addonsCost = state.addons.reduce((total, addonId) => {
      const item = CONFIG_SCHEMA.addons.find(a => a.id === addonId);
      return total + (item ? item.price : 0);
    }, 0);

    return {
      base: basePrice,
      hardware: hardwareCost,
      addons: addonsCost,
      total: basePrice + hardwareCost + addonsCost
    };
  }, [state]);

  // Removed legacy single static ugValue tracking; advanced glazing models have multiple performance metrics.
  // We will return standard '1.1' as a mocked unified value for UI backward compatibility for now.
  const ugValue = 1.1;

  return { state, dispatch, pricing, ugValue };
}
