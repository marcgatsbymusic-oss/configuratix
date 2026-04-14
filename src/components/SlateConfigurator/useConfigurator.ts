import { useReducer, useMemo } from 'react';
import { CONFIG_SCHEMA, WINDOW_TYPES } from './types';
import pricingGrids from '../../data/base_pricing_grids.json';
import glazingOptions from '../../data/glazing.json';
import iglo5Data from '../../data/iglo5_data.json';
import type { ConfiguratorState, ConfiguratorAction, CategoryType } from './types';
import { PROFILE_GLAZING_MAP } from '../../data/profileGlazing';
import { calculatePrice } from '../../utils/pricingEngine';

const initialState: ConfiguratorState = {
  dimensions: { width: 1000, height: 1200 },
  category: 'Windows',
  materialFilter: 'PVC',
  sortByTracker: 'default',
  profile: 'iglo5',
  windowTypeId: 'F100',
  sashOpenings: ['o2'], // Default: 1-sash Dreh-Kipp
  interiorColorGroup: 'Metal Effect',
  interiorColor: 'c209', // Basalt Grey
  exteriorColorGroup: 'Metal Effect',
  exteriorColor: 'c214', // Anthracite
  glazingPackage: '2-24', // Default from DB extract 
  glassOutside: 'FL4',
  glassMiddle: '',
  glassInside: 'T4',
  glassSpacer: 'S24',
  addons: []
};

function getInitialState(): ConfiguratorState {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const product = params.get('product');
    
    if (product) {
      const slugToProfile: Record<string, { category: CategoryType, profile: string }> = {
        'iglo-edge': { category: 'Windows', profile: 'igloedge' },
        'iglo-5': { category: 'Windows', profile: 'iglo5' },
        'iglo-light': { category: 'Windows', profile: 'iglolight' },
        'iglo-energy': { category: 'Windows', profile: 'igloenergy' },
      };
      
      if (slugToProfile[product]) {
        return { ...initialState, ...slugToProfile[product] };
      }
    }
  }
  return initialState;
}

function configuratorReducer(state: ConfiguratorState, action: ConfiguratorAction | { type: 'HYDRATE_STATE'; payload: ConfiguratorState }): ConfiguratorState {
  switch (action.type) {
    case 'HYDRATE_STATE':
      return { ...state, ...action.payload };
    case 'SET_DIMENSIONS':
      return { ...state, dimensions: { ...state.dimensions, ...action.payload } };
    case 'SET_CATEGORY': {
      let limits = CONFIG_SCHEMA.categories[action.payload] as any;
      let fallbackProfile = limits.profiles.length > 0 ? limits.profiles[0].id : '';
      let defaultMaterialFilter = (action.payload === 'Windows' || action.payload === 'Doors') ? 'PVC' : null;
      
      // Dynamic override for iglo5 when switching categories
      if (fallbackProfile === 'iglo5' && action.payload === 'Windows') {
         const limitsOverrides = iglo5Data.product_systems[0].dimensional_constraints;
         limits = {
           ...limits,
           minWidth: limitsOverrides.min_width,
           maxWidth: limitsOverrides.max_width,
           minHeight: limitsOverrides.min_height,
           maxHeight: limitsOverrides.max_height
         };
      }

      return {
        ...state,
        category: action.payload,
        materialFilter: defaultMaterialFilter,
        profile: fallbackProfile,
        dimensions: {
          width: Math.min(Math.max(state.dimensions.width, limits.minWidth), limits.maxWidth),
          height: Math.min(Math.max(state.dimensions.height, limits.minHeight), limits.maxHeight),
        }
      };
    }
    case 'SET_PROFILE': {
      let limits = CONFIG_SCHEMA.categories[state.category] as any;
      if (action.payload === 'iglo5') {
         const limitsOverrides = iglo5Data.product_systems[0].dimensional_constraints;
         limits = {
           ...limits,
           minWidth: limitsOverrides.min_width,
           maxWidth: limitsOverrides.max_width,
           minHeight: limitsOverrides.min_height,
           maxHeight: limitsOverrides.max_height
         };
      }
      return { 
        ...state, 
        profile: action.payload,
        dimensions: {
          width: Math.min(Math.max(state.dimensions.width, limits.minWidth), limits.maxWidth),
          height: Math.min(Math.max(state.dimensions.height, limits.minHeight), limits.maxHeight),
        }
      };
    }
    case 'SET_MATERIAL_FILTER': {
      const newMaterial = action.payload;
      const limits = CONFIG_SCHEMA.categories[state.category] as any;
      let firstProfileForMaterial = '';
      if (newMaterial) {
          const profilesOpts = limits.profiles.filter((p: any) => p.material === newMaterial);
          if (profilesOpts.length > 0) firstProfileForMaterial = profilesOpts[0].id;
      }
      return { ...state, materialFilter: newMaterial, profile: firstProfileForMaterial };
    }
    case 'SET_SORT_BY':
      return { ...state, sortByTracker: action.payload };
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
    case 'SET_GLAZING_PACKAGE':
      return { ...state, glazingPackage: action.payload };
    case 'SET_GLASS_OUTSIDE':
      return { ...state, glassOutside: action.payload };
    case 'SET_GLASS_MIDDLE':
      return { ...state, glassMiddle: action.payload };
    case 'SET_GLASS_INSIDE':
      return { ...state, glassInside: action.payload };
    case 'SET_GLASS_SPACER':
      return { ...state, glassSpacer: action.payload };
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
    // Resolve addon costs
    const addonPrices = state.addons.map(addonId => {
      const item = CONFIG_SCHEMA.addons.find(a => a.id === addonId);
      return item ? item.price : 0;
    });

    // Determine opening type id to use for frame price lookup
    // F100 is the most complete dataset — fallback when others aren't in Cantor yet
    const openingTypeId = state.windowTypeId || 'F100';

    // Run full engine: IDW frame interpolation + glazing + color + addons
    const breakdown = calculatePrice(
      state.profile,
      openingTypeId,
      state.dimensions.width,
      state.dimensions.height,
      state.glazingPackage,
      state.interiorColor,
      state.exteriorColor,
      addonPrices
    );

    return {
      base: breakdown.frame,
      glazing: breakdown.glazing,
      hardware: 0, // hardware is now folded into the Cantor frame price
      addons: breakdown.addons,
      colorModifier: breakdown.color,
      subtotal: breakdown.subtotal,
      vat: breakdown.vat,
      total: breakdown.total
    };
  }, [state]);

  const activeLimits = useMemo(() => {
    let limits = CONFIG_SCHEMA.categories[state.category] as any;
    if (state.profile === 'iglo5') {
       const overrides = iglo5Data.product_systems[0].dimensional_constraints;
       limits = {
         ...limits,
         minWidth: overrides.min_width,
         maxWidth: overrides.max_width,
         minHeight: overrides.min_height,
         maxHeight: overrides.max_height,
       };
    }
    return limits;
  }, [state.category, state.profile]);

  const activeColors = useMemo(() => {
    if (state.profile === 'iglo5') {
       return iglo5Data.product_systems[0].colors.map(c => c.cantor_code);
    }
    return null;
  }, [state.profile]);

  const activeGlazing = useMemo(() => {
    if (PROFILE_GLAZING_MAP[state.profile]) {
      return PROFILE_GLAZING_MAP[state.profile];
    }
    // Return null to fall back to standard CONFIG_SCHEMA.glazing 
    // which maps 2-24, 3-36, 3-48 like Drutex natively does
    return null;
  }, [state.profile]);

  const ugValue = useMemo(() => {
    if (state.profile === 'iglo5') {
        const glassObj = iglo5Data.product_systems[0].glazing.find(g => g.cantor_code === state.glazingPackage);
        return glassObj ? (glassObj.thickness > 30 ? 0.5 : 1.1) : 1.1; // pseudo logic, ideally u_wert is available
    }
    const glassObj = glazingOptions.find((g: any) => g.id === state.glazingPackage);
    return glassObj ? glassObj.uValue : 1.1;
  }, [state.glazingPackage, state.profile]);

  const activePanes = useMemo(() => {
    if (state.profile === 'iglo5' && iglo5Data.product_systems[0].panes) {
      return iglo5Data.product_systems[0].panes;
    }
    return [];
  }, [state.profile]);

  const activeSpacers = useMemo(() => {
    if (state.profile === 'iglo5' && iglo5Data.product_systems[0].spacers) {
      return iglo5Data.product_systems[0].spacers;
    }
    return [];
  }, [state.profile]);

  return { state, dispatch, pricing, ugValue, activeLimits, activeColors, activeGlazing, activePanes, activeSpacers };
}
