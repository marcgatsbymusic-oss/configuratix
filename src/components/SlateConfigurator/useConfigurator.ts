import { useReducer, useMemo, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { CONFIG_SCHEMA, WINDOW_TYPES } from './types';
import glazingOptions from '../../data/glazing.json';
import iglo5Data from '../../data/iglo5_data.json';
import type { ConfiguratorState, ConfiguratorAction, CategoryType } from './types';
import { PROFILE_GLAZING_MAP } from '../../data/profileGlazing';
import { fetchPrice, type PricingApiResponse } from '../../utils/cantorPricing/pricingApi';
import { stateToInput, DEFAULT_DEALER } from '../../utils/cantorPricing/configuratorAdapter';
import { getDefaultSashOpenings } from '../../utils/windowOpenings';

const initialState: ConfiguratorState = {
  dimensions: { width: 1000, height: 1200 },
  category: 'Windows',
  materialFilter: 'PVC',
  sortByTracker: 'default',
  sortDirection: 'asc',
  profile: 'iglo5',
  windowTypeId: 'F100',
  sashOpenings: ['o3'], // Default F100 to Handle Left, Hinges Right (o3)
  fittingVariant: 'FIX',
  interiorColorGroup: 'Solid',
  interiorColor: 'c197', // White
  exteriorColorGroup: 'Solid',
  exteriorColor: 'c197', // White
  glazingPackage: '2-24', // Default from DB extract 
  glassOutside: 'FL4',
  glassMiddle: '',
  glassInside: 'T4',
  glassSpacer: 'S24',
  gasketColor: 'czarny',
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

      const selectedProfileInfo = limits.profiles?.find((p: any) => p.id === fallbackProfile);
      const isPVC = selectedProfileInfo?.material === 'PVC';

      return {
        ...state,
        category: action.payload,
        materialFilter: defaultMaterialFilter,
        profile: fallbackProfile,
        dimensions: {
          width: Math.min(Math.max(state.dimensions.width, limits.minWidth), limits.maxWidth),
          height: Math.min(Math.max(state.dimensions.height, limits.minHeight), limits.maxHeight),
        },
        ...(isPVC ? {
          interiorColorGroup: 'Solid',
          interiorColor: 'c197',
          exteriorColorGroup: 'Solid',
          exteriorColor: 'c197'
        } : {})
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

      const selectedProfileInfo = limits.profiles?.find((p: any) => p.id === action.payload);
      const isPVC = selectedProfileInfo?.material === 'PVC';

      return { 
        ...state, 
        profile: action.payload,
        dimensions: {
          width: Math.min(Math.max(state.dimensions.width, limits.minWidth), limits.maxWidth),
          height: Math.min(Math.max(state.dimensions.height, limits.minHeight), limits.maxHeight),
        },
        ...(isPVC ? {
          interiorColorGroup: 'Solid',
          interiorColor: 'c197',
          exteriorColorGroup: 'Solid',
          exteriorColor: 'c197'
        } : {})
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
      
      const isPVC = newMaterial === 'PVC' || limits.profiles?.find((p: any) => p.id === firstProfileForMaterial)?.material === 'PVC';

      return { 
        ...state, 
        materialFilter: newMaterial, 
        profile: firstProfileForMaterial,
        ...(isPVC ? {
          interiorColorGroup: 'Solid',
          interiorColor: 'c197',
          exteriorColorGroup: 'Solid',
          exteriorColor: 'c197'
        } : {})
      };
    }
    case 'SET_SORT_BY':
      return { ...state, sortByTracker: action.payload };
    case 'SET_SORT_DIRECTION':
      return { ...state, sortDirection: action.payload };
    case 'SET_WINDOW_TYPE': {
      const wt = WINDOW_TYPES.find(w => w.id === action.payload);
      if (!wt) return state;
      
      // Auto-populate the sash openings array based on the window type
      const newOpenings = getDefaultSashOpenings(action.payload, wt.sashes);
      let newFittingVariant = state.fittingVariant;

      if (action.payload.toUpperCase().includes('F104')) {
         newFittingVariant = 'FIX';
      }

      return { ...state, windowTypeId: action.payload, sashOpenings: newOpenings, fittingVariant: newFittingVariant };
    }
    case 'SET_SASH_OPENING': {
      const updatedOpenings = [...state.sashOpenings];
      updatedOpenings[action.payload.index] = action.payload.openingId;
      return { ...state, sashOpenings: updatedOpenings };
    }
    case 'SET_FITTING_VARIANT':
      return { ...state, fittingVariant: action.payload };
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
    case 'SET_GASKET_COLOR':
      return { ...state, gasketColor: action.payload };
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

  // Constraints (min/max W×H) still come from cantor_systems on Supabase.
  // The actual pricing now goes through the new Cantor formula interpreter
  // via /api/price (Vite middleware in dev, Supabase Edge Function in prod).
  const [cantorSystem, setCantorSystem] = useState<any>(null);

  useEffect(() => {
    async function loadConstraints() {
       let systemLookupKey = state.profile;
       if (state.profile === 'iglo5') systemLookupKey = 'I5S';
       try {
           const { data, error } = await supabase
               .from('cantor_systems')
               .select('*')
               .eq('cantor_key', systemLookupKey)
               .maybeSingle();
           if (!error && data) setCantorSystem(data);
       } catch (err) {
           console.error('Cantor constraints fetch error', err);
       }
    }
    loadConstraints();
  }, [state.profile]);

  // --- Pricing via the new Cantor formula interpreter ---
  // Async because the engine runs Node-side (mirror is SQLite/Supabase). The
  // adapter maps configurator state → ConfiguratorInput; the engine throws on
  // configurations Phase A/B doesn't yet cover, which we surface as a
  // priceError so the UI can show a clear message instead of a wrong number.
  const VAT_RATE = 0.21;
  type PricingShape = {
    base: number;
    glazing: number;
    hardware: number;
    addons: number;
    colorModifier: number;
    subtotal: number;
    vat: number;
    total: number;
    currency: string;
    error: string | null;
    loading: boolean;
    raw: PricingApiResponse | null;
  };
  const EMPTY_PRICING: PricingShape = {
    base: 0, glazing: 0, hardware: 0, addons: 0, colorModifier: 0,
    subtotal: 0, vat: 0, total: 0, currency: 'EUR',
    error: null, loading: false, raw: null,
  };
  const [pricing, setPricing] = useState<PricingShape>(EMPTY_PRICING);

  const addonPrices = useMemo(() => state.addons.map(addonId => {
    const item = CONFIG_SCHEMA.addons.find(a => a.id === addonId);
    return item ? item.price : 0;
  }), [state.addons]);
  const addonsTotal = useMemo(() => addonPrices.reduce((s, p) => s + p, 0), [addonPrices]);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    setPricing(prev => ({ ...prev, loading: true, error: null }));

    let input;
    try {
      input = stateToInput(state, DEFAULT_DEALER);
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      setPricing({ ...EMPTY_PRICING, error });
      return () => controller.abort();
    }

    fetchPrice({ input })
      .then(res => {
        if (cancelled) return;
        const base = res.vk_local;
        const subtotal = base + addonsTotal;
        setPricing({
          base,
          glazing: 0,                   // folded into base in the new engine
          hardware: 0,                  // folded into base
          addons: addonsTotal,
          colorModifier: 0,             // folded into base; Phase C exposes per-line
          subtotal,
          vat: subtotal * VAT_RATE,
          total: subtotal * (1 + VAT_RATE),
          currency: res.currency,
          error: null,
          loading: false,
          raw: res,
        });
      })
      .catch(err => {
        if (cancelled) return;
        setPricing({ ...EMPTY_PRICING, error: err instanceof Error ? err.message : String(err) });
      });

    return () => { cancelled = true; controller.abort(); };
  }, [state, addonsTotal]);

  const activeLimits = useMemo(() => {
    // If we loaded dimensions actively from Cantor Phase 2 Data, use those strictly!
    if (cantorSystem && cantorSystem.min_width) {
        return {
           minWidth: cantorSystem.min_width,
           maxWidth: cantorSystem.max_width,
           minHeight: cantorSystem.min_height,
           maxHeight: cantorSystem.max_height,
        };
    }

    // Fallback to Phase 1 / Local Schema
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
  }, [state.category, state.profile, cantorSystem]);

  const activeColors = useMemo(() => {
    // Disable strict cantor-code filtering for iglo5 until we have a proper cXXX -> Cantor mapping.
    // Otherwise, the color grid becomes completely empty because UI uses cXXX codes while Cantor uses 0001, 0015, etc.
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
