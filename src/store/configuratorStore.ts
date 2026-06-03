import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type {
  ProfileSystem,
  WindowType,
  DimensionBounds,
  PriceResult,
  ConfiguratorStoreState,
} from '../types'

// ── default dimension bounds (overridden by constraints fetch) ────────────
const DEFAULT_BOUNDS: DimensionBounds = {
  min_width_mm: 400,
  max_width_mm: 3000,
  min_height_mm: 400,
  max_height_mm: 2500,
}

// ── debounce helper ───────────────────────────────────────────────────────
let priceDebounceTimer: ReturnType<typeof setTimeout> | null = null
function debouncedPriceCall(fn: () => void, ms = 400) {
  if (priceDebounceTimer) clearTimeout(priceDebounceTimer)
  priceDebounceTimer = setTimeout(fn, ms)
}

// ── store actions type ────────────────────────────────────────────────────
interface ConfiguratorActions {
  setStep: (step: 1 | 2 | 3 | 4) => void
  setProductCategory: (category: string) => void
  setProfileSystem: (profile: ProfileSystem) => void
  setWindowType: (windowType: WindowType) => void
  setDimension: (field: 'width' | 'height', value: number) => void
  setOption: (group: string, key: string) => void
  validateDimensions: () => boolean
  recalculatePrice: () => void
  reset: () => void
  saveConfiguration: () => Promise<string>
  loadConfiguration: (id: string) => Promise<void>
}

type ConfiguratorStore = ConfiguratorStoreState & ConfiguratorActions

// ── initial state ─────────────────────────────────────────────────────────
const initialState: ConfiguratorStoreState = {
  step: 1,
  productCategory: 'window',
  profileSystem: null,
  windowType: null,
  dimensions: { width: 1000, height: 1200 },
  dimensionBounds: DEFAULT_BOUNDS,
  options: {
    glazing: 'double',
    color_exterior: 'white',
    color_interior: 'white',
    security: 'standard',
    spacer: 'standard',
    handle: 'standard-silver',
  },
  price: null,
  isPricingLoading: false,
  validationErrors: {},
  isLoading: false,
}

// ── store ─────────────────────────────────────────────────────────────────
export const useConfiguratorStore = create<ConfiguratorStore>((set, get) => ({
  ...initialState,

  setStep: (step) => set({ step }),

  setProductCategory: (productCategory) =>
    set({
      productCategory,
      profileSystem: null,
      windowType: null,
      dimensionBounds: DEFAULT_BOUNDS,
      options: initialState.options,
      price: null,
      validationErrors: {},
    }),

  setProfileSystem: (profile) => {
    const isEdgeSlide = profile?.id === 'iglo-edge-slide' || profile?.slug === 'iglo-edge-slide';
    set({
      profileSystem: profile,
      // Reset downstream selections when profile changes
      windowType: null,
      dimensionBounds: isEdgeSlide ? {
        min_width_mm: 1300,
        max_width_mm: 5000,
        min_height_mm: 1500,
        max_height_mm: 3000,
      } : DEFAULT_BOUNDS,
      dimensions: isEdgeSlide ? { width: 2000, height: 2100 } : { width: 1000, height: 1200 },
      options: initialState.options,
      price: null,
      validationErrors: {},
    })
  },

  setWindowType: (windowType) => {
    set({ windowType, price: null, validationErrors: {} })
    // Fetch constraints for this profile × window type pair
    const { profileSystem } = get()
    if (profileSystem && windowType) {
      const isEdgeSlide = profileSystem.id === 'iglo-edge-slide' || profileSystem.slug === 'iglo-edge-slide';
      if (isEdgeSlide) {
        const bounds = {
          min_width_mm: 1300,
          max_width_mm: 5000,
          min_height_mm: 1500,
          max_height_mm: 3000,
        };
        set({
          dimensionBounds: bounds,
          dimensions: {
            width: Math.min(Math.max(get().dimensions.width, bounds.min_width_mm), bounds.max_width_mm),
            height: Math.min(Math.max(get().dimensions.height, bounds.min_height_mm), bounds.max_height_mm),
          },
        });
      } else {
        supabase
          .from('constraints')
          .select('*')
          .eq('profile_system_id', profileSystem.id)
          .eq('window_type_id', windowType.id)
          .single()
          .then(({ data }) => {
            if (data) {
              const row = data as unknown as { min_width_mm: number; max_width_mm: number; min_height_mm: number; max_height_mm: number }
              set({
                dimensionBounds: {
                  min_width_mm: row.min_width_mm,
                  max_width_mm: row.max_width_mm,
                  min_height_mm: row.min_height_mm,
                  max_height_mm: row.max_height_mm,
                },
                // Clamp current dimensions into new bounds
                dimensions: {
                  width: Math.min(
                    Math.max(get().dimensions.width, row.min_width_mm),
                    row.max_width_mm
                  ),
                  height: Math.min(
                    Math.max(get().dimensions.height, row.min_height_mm),
                    row.max_height_mm
                  ),
                },
              })
            }
          })
      }
    }
    // Trigger pricing after selection settles
    get().recalculatePrice()
  },

  setDimension: (field, value) => {
    set((s) => ({ dimensions: { ...s.dimensions, [field]: value } }))
    get().recalculatePrice()
  },

  setOption: (group, key) => {
    set((s) => ({ options: { ...s.options, [group]: key } }))
    get().recalculatePrice()
  },

  validateDimensions: () => {
    const { dimensions, dimensionBounds } = get()
    const errors: Record<string, string> = {}

    if (dimensions.width < dimensionBounds.min_width_mm)
      errors.width = `Min width is ${dimensionBounds.min_width_mm} mm`
    else if (dimensions.width > dimensionBounds.max_width_mm)
      errors.width = `Max width is ${dimensionBounds.max_width_mm} mm`

    if (dimensions.height < dimensionBounds.min_height_mm)
      errors.height = `Min height is ${dimensionBounds.min_height_mm} mm`
    else if (dimensions.height > dimensionBounds.max_height_mm)
      errors.height = `Max height is ${dimensionBounds.max_height_mm} mm`

    set({ validationErrors: errors })
    return Object.keys(errors).length === 0
  },

  recalculatePrice: () => {
    const { profileSystem, windowType, dimensions, options } = get()
    if (!profileSystem || !windowType) return

    // --- Beta Functional Requirement: Dynamic Instant Pricing Engine ---
    // Calculate an instant optimistic estimate based on area and modifiers
    const areaM2 = (dimensions.width / 1000) * (dimensions.height / 1000)
    let estimatedPrice = areaM2 * 150 // €150 per m2 base

    if (options.glazing === 'triple') estimatedPrice *= 1.25
    if (options.color_exterior !== 'white') estimatedPrice *= 1.15
    if (options.security === 'rc2') estimatedPrice *= 1.30

    const clientSidePrice: PriceResult = {
      line_items: [{ label: 'Estimated Base Price', price_eur: Number(estimatedPrice.toFixed(2)) }],
      total_eur: Number(estimatedPrice.toFixed(2))
    }

    // Set optimistic price instantly
    set({ price: clientSidePrice, isPricingLoading: true })

    debouncedPriceCall(async () => {
      try {
        const { data, error } = await supabase.functions.invoke<PriceResult>(
          'calculate-price',
          {
            body: {
              profile_system_id: profileSystem.id,
              window_type_id: windowType.id,
              dimensions,
              options,
            },
          }
        )
        if (error) throw error
        set({ price: data, isPricingLoading: false })
      } catch (err) {
        console.error('[Configurator] Pricing error:', err)
        set({ isPricingLoading: false })
      }
    }, 400)
  },

  reset: () => set(initialState),

  saveConfiguration: async () => {
    const state = get()
    const stateToSave = {
      step: state.step,
      productCategory: state.productCategory,
      profileSystem: state.profileSystem,
      windowType: state.windowType,
      dimensions: state.dimensions,
      dimensionBounds: state.dimensionBounds,
      options: state.options,
    }
    
    // Use any cast for supabase here to bypass the strict generated schema which does not have saved_configurations yet
    const { data, error } = await (supabase as any)
      .from('saved_configurations')
      .insert({ config_state: stateToSave })
      .select('id')
      .single()

    if (error) {
      console.error('[Configurator] Failed to save configuration:', error)
      throw error
    }
    
    return data.id as string
  },

  loadConfiguration: async (id: string) => {
    set({ isLoading: true })
    const { data, error } = await (supabase as any)
      .from('saved_configurations')
      .select('config_state')
      .eq('id', id)
      .single()

    if (error) {
      console.error('[Configurator] Failed to load configuration:', error)
      set({ isLoading: false })
      return
    }

    if (data?.config_state) {
      const savedState = data.config_state as Partial<ConfiguratorStoreState>
      set({ ...savedState, isLoading: false })
      get().recalculatePrice()
    } else {
      set({ isLoading: false })
    }
  },
}))
