// ─── User & Auth ────────────────────────────────────────────────────────────

export type UserRole = 'customer' | 'partner'

export interface Profile {
  id: string
  role: UserRole
  full_name: string | null
  company_name: string | null
  company_tax_id: string | null
  phone: string | null
  address: string | null
  country: string
  partner_verified: boolean
  created_at: string
  updated_at: string
}

// ─── Products ───────────────────────────────────────────────────────────────

export type ProductMaterial = 'pvc' | 'aluminum' | 'wood' | 'wood-aluminum'
export type ProductType = 'window' | 'door' | 'terrace' | 'shutter' | 'accessory'

export interface ProductCategory {
  id: string
  slug: string
  name: string
  description: string
  type: ProductType
  imageUrl: string
}

export interface TechDetails {
  soundInsulation: string
  gaskets: string
  thermalTransmittance: string
  chambers: string
  installationDepth: string
  profileClass: string
}

export interface ProductSpec {
  label: string
  value: string
  unit?: string
}


export interface Product {
  id: string
  slug: string
  name: string
  tagline: string
  description: string
  category: ProductCategory
  material: ProductMaterial
  type: ProductType
  specs: ProductSpec[]
  techDetails?: TechDetails
  images: string[]
  isNew?: boolean
  isFeatured?: boolean
}

// ─── Configurator — Catalog Types ────────────────────────────────────────────

export interface CatalogProductCategory {
  id: string
  slug: string
  label: string
  icon_url: string | null
  sort_order: number
}

export interface ProfileSystem {
  id: string
  category_id: string | null
  slug: string
  name: string
  material: ProductMaterial
  depth_mm: number | null
  uw_value: number | null
  description: string | null
  image_url: string | null
  allowed_types: string[]
  sort_order: number
  is_active: boolean
}

export interface WindowType {
  id: string
  slug: string
  label: string
  product_category: string
  sash_count: number
  opening_type: string
  svg_template: string | null
  allowed_materials: string[]
  sort_order: number
  is_active: boolean
}

export interface OptionItem {
  id: string
  group_name: string
  key: string
  label: string
  description: string | null
  icon_url: string | null
  value_json: Record<string, unknown>
  sort_order: number
  allowed_materials: string[]
}

export interface Constraint {
  id: string
  profile_system_id: string
  window_type_id: string
  min_width_mm: number
  max_width_mm: number
  min_height_mm: number
  max_height_mm: number
  max_area_m2: number | null
}

export interface PricingRule {
  id: string
  profile_system_id: string
  group_name: string | null
  option_key: string | null
  price_delta_eur: number | null
  price_per_m2_eur: number | null
}

// ─── Configurator — Session Types ────────────────────────────────────────────

export interface LineItem {
  label: string
  price_eur: number
}

export interface PriceResult {
  line_items: LineItem[]
  total_eur: number
}

export interface DimensionBounds {
  min_width_mm: number
  max_width_mm: number
  min_height_mm: number
  max_height_mm: number
}

export interface ConfiguratorStoreState {
  // Navigation
  step: 1 | 2 | 3 | 4

  // Selections
  productCategory: string          // 'window' | 'door' | …
  profileSystem: ProfileSystem | null
  windowType: WindowType | null
  dimensions: { width: number; height: number }
  dimensionBounds: DimensionBounds
  options: Record<string, string>  // { glazing: 'triple', color_exterior: 'anthracite', … }

  // Pricing
  price: PriceResult | null
  isPricingLoading: boolean

  // Validation
  validationErrors: Record<string, string>

  // UI state
  isLoading: boolean
}

export interface SavedConfiguration {
  id: string
  session_id: string
  user_id: string | null
  product_category: string
  profile_system_id: string | null
  window_type_id: string | null
  width_mm: number
  height_mm: number
  options_json: Record<string, string>
  total_price_eur: number | null
  created_at: string
}

export interface QuoteRequest {
  id: string
  configuration_id: string | null
  name: string
  email: string
  phone: string | null
  message: string | null
  status: 'new' | 'read' | 'replied'
  created_at: string
}

// ─── Navigation ──────────────────────────────────────────────────────────────

export interface NavItem {
  label: string
  href: string
  children?: NavItem[]
}
