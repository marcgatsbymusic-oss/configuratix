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
    set({
      profileSystem: profile,
      // Reset downstream selections when profile changes
      windowType: null,
      dimensionBounds: DEFAULT_BOUNDS,
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
      supabase
        .from('constraints')
        .select('*')
        .eq('profile_system_id', profileSystem.id)
        .eq('window_type_id', windowType.id)
        .single()
        .then(({ data }) => {
          if (data) {
            set({
              dimensionBounds: {
                min_width_mm: data.min_width_mm,
                max_width_mm: data.max_width_mm,
                min_height_mm: data.min_height_mm,
                max_height_mm: data.max_height_mm,
              },
              // Clamp current dimensions into new bounds
              dimensions: {
                width: Math.min(
                  Math.max(get().dimensions.width, data.min_width_mm),
                  data.max_width_mm
                ),
                height: Math.min(
                  Math.max(get().dimensions.height, data.min_height_mm),
                  data.max_height_mm
                ),
              },
            })
          }
        })
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

    set({ isPricingLoading: true })

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
}))
