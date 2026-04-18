import { useReducer, useMemo, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { CONFIG_SCHEMA, WINDOW_TYPES } from './types';
import glazingOptions from '../../data/glazing.json';
import iglo5Data from '../../data/iglo5_data.json';
import type { ConfiguratorState, ConfiguratorAction, CategoryType } from './types';
import { PROFILE_GLAZING_MAP } from '../../data/profileGlazing';
import { calculatePrice, resolveOpeningClass } from '../../utils/pricingEngine';

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
      let defaultCode = action.payload.toUpperCase().includes('F100') ? 'o3' : 'o2';
      let newOpenings = Array.from({ length: wt.sashes }).map(() => defaultCode);
      let newFittingVariant = state.fittingVariant;

      if (action.payload.toUpperCase() === 'F104') {
         defaultCode = 'o1';
         newOpenings = ['o1'];
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

  // --- PHASE 2 CANTOR FETCH ENGINE ---
  const [cantorSystem, setCantorSystem] = useState<any>(null);
  const [cantorRules, setCantorRules] = useState<any[]>([]);
  const [cantorMatrices, setCantorMatrices] = useState<any[]>([]);
  const [isLoadingCantor, setIsLoadingCantor] = useState(false);

  useEffect(() => {
    // We only fetch Phase 2 Cantor data if configured. Otherwise fallback to IDW logic over profile/categories.
    async function loadCantorDefinitions() {
       let systemLookupKey = state.profile;
       // Map arbitrary UI dropdown codes to Cantor SCHLUESSEL (e.g. 'iglo5' -> 'I5S', 'MB-86' -> 'ALU')
       if (state.profile === 'iglo5') systemLookupKey = 'I5S'; 

       setIsLoadingCantor(true);
       try {
           // 1. Fetch system & dimensions constraints
           const { data: sysData, error: sysErr } = await supabase
               .from('cantor_systems')
               .select('*')
               .eq('cantor_key', systemLookupKey)
               .single();

           if (!sysErr && sysData) {
               setCantorSystem(sysData);

               // 2. Fetch Pricing Rules for GRPRS modification
               const { data: rulesData } = await supabase
                   .from('cantor_pricing_rules')
                   .select('*')
                   .eq('system_key', systemLookupKey);
                   
               if (rulesData) setCantorRules(rulesData);
           }

           // 3. Fetch matrices for this specific system (independent of system table)
           // 3. Fetch exact matrices for this specific system AND structure
           let matrixClasses = [systemLookupKey, ''];
           if (state.profile === 'iglo5') matrixClasses = ['IG5', 'SZP', 'I5S', ''];
           
           // Resolve Matrix Base mechanically based on UI Typology
           const isPVC = cantorSystem?.type_class === 'S11' || state.profile.includes('iglo') || state.profile.includes('pvc');
           const matPrefix = isPVC ? 'PVC' : 'AL';
           // F104 maps internally to F100 matrix group in Cantor Database
           let structClass = state.windowTypeId.toUpperCase().includes('F10') ? 'F100' : state.windowTypeId;
           const targetMatrixName = `${matPrefix}_${structClass}`;

           // Dynamically resolve target hardware class (e.g., 'F', 'DK', 'UR')
           const targetClass1 = resolveOpeningClass(state.sashOpenings);

           // Supabase natively caps requests to 1000 rows (PostgREST limit).
           // Since PVC_F100 + IG5 + F contains ~2800 rows, we MUST paginate to gather the active interpolation grid.
           let allMatrixData: any[] = [];
           let offset = 0;
           const batchSize = 1000;
           let hasMore = true;

           while (hasMore) {
               const { data: chunk, error } = await supabase
                   .from('cantor_formula_matrices')
                   .select('*')
                   .in('class_2', matrixClasses)
                   .in('class_1', [targetClass1, 'KOLOR', '']) 
                   .in('matrix_name', [targetMatrixName, `${matPrefix}_DOD`, `${cantorSystem?.type_class}_DOD`]) 
                   .range(offset, offset + batchSize - 1);
                   
               if (error) {
                   console.error("Matrix Paging Error", error);
                   break;
               }
                   
               if (chunk && chunk.length > 0) {
                   allMatrixData = [...allMatrixData, ...chunk];
                   if (chunk.length < batchSize) {
                       hasMore = false; // We've reached the end
                   } else {
                       offset += batchSize;
                   }
               } else {
                   hasMore = false;
               }
           }

           if (allMatrixData.length > 0) setCantorMatrices(allMatrixData);
       } catch (err) {
           console.error("Cantor Sync Error", err);
       }
       setIsLoadingCantor(false);
    }
    loadCantorDefinitions();
  }, [state.profile, state.windowTypeId]); // Dependency updated to trigger on Structure change
  // -----------------------------------

  const pricing = useMemo(() => {
    // Resolve addon costs
    const addonPrices = state.addons.map(addonId => {
      const item = CONFIG_SCHEMA.addons.find(a => a.id === addonId);
      return item ? item.price : 0;
    });

    // Resolve sash opening selections → Cantor opening class (DK | UR | F100 | PSK)
    // This translates the user's sash choices (o1=fixed, o2/o3=DK, o6=kipp) into the
    // correct matrix key. Do NOT use windowTypeId directly — it's a typology ID (F101,
    // F202 etc.) not an opening class. Only F100 coincidentally shares both namespaces.
    const openingTypeId = resolveOpeningClass(state.sashOpenings);

    // Run full engine: Native Phase 2 GRPRS/Surcharge Logic + Fallback
    const breakdown = calculatePrice(
      state.profile,
      openingTypeId,
      state.dimensions.width,
      state.dimensions.height,
      state.glazingPackage,
      state.interiorColor,
      state.exteriorColor,
      addonPrices,
      cantorSystem,
      cantorRules,
      cantorMatrices
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
