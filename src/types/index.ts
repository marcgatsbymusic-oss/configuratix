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
  images: string[]
  isNew?: boolean
  isFeatured?: boolean
}

// ─── Configurator ────────────────────────────────────────────────────────────

export type GlassType = 'single' | 'double' | 'triple'
export type ColorFinish = 'white' | 'anthracite' | 'golden-oak' | 'dark-brown' | 'custom-ral'
export type OpeningType = 'tilt' | 'turn' | 'tilt-turn' | 'fixed' | 'sliding'

export interface ConfiguratorState {
  productLine: string         // e.g. 'iglo-edge'
  productType: ProductType
  material: ProductMaterial
  width: number               // mm
  height: number              // mm
  color: ColorFinish
  glassType: GlassType
  openingType: OpeningType
  hardware: string
  extras: string[]
}

export interface ConfiguratorSave {
  id: string
  user_id: string
  name: string
  product_line: string
  product_type: ProductType
  material: ProductMaterial
  configuration: ConfiguratorState
  screenshot_url: string | null
  is_quote_requested: boolean
  created_at: string
  updated_at: string
}

// ─── Navigation ──────────────────────────────────────────────────────────────

export interface NavItem {
  label: string
  href: string
  children?: NavItem[]
}
