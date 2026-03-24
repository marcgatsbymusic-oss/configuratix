import type { Product, ProductCategory } from '../types'

export const CATEGORIES: ProductCategory[] = [
  {
    id: 'c1',
    slug: 'windows',
    name: 'Windows',
    description: 'Precision-engineered windows combining excellent thermal insulation with modern aesthetics.',
    type: 'window',
    imageUrl: '/assets/placeholder-window.jpg',
  },
  {
    id: 'c2',
    slug: 'doors',
    name: 'Doors',
    description: 'Premium entry and exterior doors designed for security, durability, and elegance.',
    type: 'door',
    imageUrl: '/assets/placeholder-door.jpg',
  },
  {
    id: 'c3',
    slug: 'terrace-systems',
    name: 'Terrace Systems',
    description: 'Large-scale sliding and folding systems blurring the line between indoor and outdoor spaces.',
    type: 'terrace',
    imageUrl: '/assets/placeholder-terrace.jpg',
  },
  {
    id: 'c4',
    slug: 'shutters',
    name: 'Shutters & Blinds',
    description: 'Advanced shading systems for optimal light control, privacy, and energy efficiency.',
    type: 'shutter',
    imageUrl: '/assets/placeholder-shutter.jpg',
  },
]

export const PRODUCTS: Product[] = [
  // PVC WINDOWS
  {
    id: 'p1',
    slug: 'iglo-edge',
    name: 'IGLO EDGE',
    tagline: 'Maximum insulation, minimal frame',
    description: 'The IGLO EDGE window system represents the pinnacle of energy efficiency. Designed for passive houses and energy-conscious renovations, it features a 6-chamber profile and a minimalist design that maximizes natural light entering the room.',
    category: CATEGORIES[0],
    material: 'pvc',
    type: 'window',
    isNew: true,
    isFeatured: true,
    specs: [
      { label: 'Thermal Transmittance (Uw)', value: '0.57', unit: 'W/(m²K)' },
      { label: 'Installation Depth', value: '82', unit: 'mm' },
      { label: 'Profile Chambers', value: '6' },
      { label: 'Sound Insulation (Rw)', value: 'up to 48', unit: 'dB' },
    ],
    images: ['/assets/iglo-edge-featured.png']
  },
  {
    id: 'p2',
    slug: 'iglo-light',
    name: 'IGLO LIGHT',
    tagline: 'Even more light into your space',
    description: 'IGLO LIGHT is characterized by its exceptionally slim profiles, allowing up to 15% more natural light into the interior. Despite its slender appearance, it offers outstanding structural stability and thermal performance.',
    category: CATEGORIES[0],
    material: 'pvc',
    type: 'window',
    isFeatured: true,
    specs: [
      { label: 'Thermal Transmittance (Uw)', value: '0.89', unit: 'W/(m²K)' },
      { label: 'Installation Depth', value: '70', unit: 'mm' },
      { label: 'Profile Chambers', value: '5' },
      { label: 'Sound Insulation (Rw)', value: '34-44', unit: 'dB' },
    ],
    images: ['/assets/iglo-light-1.jpg']
  },
  {
    id: 'p3',
    slug: 'iglo-5',
    name: 'IGLO 5',
    tagline: 'The classic reborn',
    description: 'The IGLO 5 system combines elegance, functionality, and advanced energy-saving solutions. Its timeless rounded profile design makes it a versatile choice for both modern architecture and classic renovations.',
    category: CATEGORIES[0],
    material: 'pvc',
    type: 'window',
    specs: [
      { label: 'Thermal Transmittance (Uw)', value: '0.74', unit: 'W/(m²K)' },
      { label: 'Installation Depth', value: '70', unit: 'mm' },
      { label: 'Profile Chambers', value: '5' },
    ],
    images: ['/assets/iglo-5-1.jpg']
  },
  
  // ALUMINUM WINDOWS
  {
    id: 'pa1',
    slug: 'mb-86n',
    name: 'MB-86N',
    tagline: 'Architectural aluminum system',
    description: 'A highly advanced aluminum window system that meets the highest thermal insulation requirements. Available in various aesthetic variants (ST, SI, AERO) to suit different project needs.',
    category: CATEGORIES[0],
    material: 'aluminum',
    type: 'window',
    specs: [
      { label: 'Thermal Transmittance (Uw)', value: '0.72', unit: 'W/(m²K)' },
      { label: 'Installation Depth', value: '77', unit: 'mm' },
      { label: 'Acoustic Insulation', value: 'up to 48', unit: 'dB' },
    ],
    images: ['/assets/mb86n-1.jpg']
  },

  // DOORS
  {
    id: 'd1',
    slug: 'iglo-edge-doors',
    name: 'IGLO EDGE DOORS',
    tagline: 'The gateway to Premium',
    description: 'Exterior doors based on the IGLO EDGE system offer unparalleled security, durability, and thermal insulation. Available in a wide range of colors and infill panels to match any architectural style.',
    category: CATEGORIES[1],
    material: 'pvc',
    type: 'door',
    specs: [
      { label: 'Thermal Transmittance (Ud)', value: '0.75', unit: 'W/(m²K)' },
      { label: 'Installation Depth', value: '82', unit: 'mm' },
      { label: 'Locking Points', value: '3 to 5' },
    ],
    images: ['/assets/iglo-edge-door-1.jpg']
  },
  
  // TERRACE
  {
    id: 't1',
    slug: 'iglo-hs',
    name: 'IGLO-HS',
    tagline: 'Panoramic views without limits',
    description: 'Lift-and-slide (HS) doors that allow the creation of spectacular, large-format glazing. The advanced mechanism ensures effortless operation even for sashes weighing up to 400kg.',
    category: CATEGORIES[2],
    material: 'pvc',
    type: 'terrace',
    isFeatured: true,
    specs: [
      { label: 'Thermal Transmittance (Uw)', value: '0.73', unit: 'W/(m²K)' },
      { label: 'Max Dimensions', value: '3.2m x 6.5m' },
      { label: 'Installation Depth', value: '194', unit: 'mm (frame)' },
    ],
    images: ['/assets/iglo-hs-1.jpg']
  }
]
