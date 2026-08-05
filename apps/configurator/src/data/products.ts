import type { Product, ProductCategory } from '../types'
import techSpecs from './technical_specs.json'
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

const BASE_PRODUCTS: Product[] = [
  // ─── PVC WINDOWS ──────────────────────────────────────────────────────────

  {
    id: 'p1',
    slug: 'iglo-edge',
    name: 'IGLO EDGE',
    tagline: 'Maximum insulation, minimal frame',
    description: 'The IGLO EDGE window system represents the pinnacle of energy efficiency. Designed for passive houses and energy-conscious renovations, it features a 7-chamber profile, the best-in-class Uw = 0.66 W/(m²K), and a minimalist design that maximises natural light entering the room.',
    category: CATEGORIES[0],
    material: 'pvc',
    type: 'window',
    isNew: true,
    isFeatured: true,
    specs: [
      { label: 'Thermal Transmittance (Uw)', value: '0.66', unit: 'W/(m²K)' },
      { label: 'Installation Depth', value: '82', unit: 'mm' },
      { label: 'Profile Chambers', value: '7' },
      { label: 'Sound Insulation (Rw)', value: '36–47', unit: 'dB' },
    ],
    images: ['/assets/iglo-edge-featured.png'],
  },
  {
    id: 'p1_f104',
    slug: 'iglo-edge-f104',
    name: 'IGLO EDGE F104',
    tagline: 'Outstanding passive-house performance',
    description: 'An advanced single-sash window typology under the 1600-IGLO EDGE profile system. Boasting exceptional thermal insulation and minimalist aesthetics, it maximizes natural light while offering class-leading energy efficiency.',
    category: CATEGORIES[0],
    material: 'pvc',
    type: 'window',
    isNew: true,
    isFeatured: true,
    specs: [
      { label: 'Thermal Transmittance (Uw)', value: '0.66', unit: 'W/(m²K)' },
      { label: 'Installation Depth', value: '82', unit: 'mm' },
      { label: 'Profile Chambers', value: '7' },
      { label: 'Sound Insulation (Rw)', value: '36–47', unit: 'dB' },
    ],
    images: ['/assets/iglo-edge-featured.png'],
  },
  {
    id: 'p1_f104_fix_bot',
    slug: 'iglo-edge-f104-fix-bot',
    name: 'IGLO EDGE F104 with Bottom Fixed',
    tagline: 'Sleek aesthetics with safety bottom fixed glazing',
    description: 'An advanced window system featuring a top-opening Tilt & Turn sash and a safety bottom fixed glazing field, separated by a horizontal stable post.',
    category: CATEGORIES[0],
    material: 'pvc',
    type: 'window',
    isNew: true,
    isFeatured: true,
    specs: [
      { label: 'Thermal Transmittance (Uw)', value: '0.99', unit: 'W/(m²K)' },
      { label: 'Installation Depth', value: '82', unit: 'mm' },
      { label: 'Profile Chambers', value: '7' },
      { label: 'Sound Insulation (Rw)', value: '36', unit: 'dB' },
    ],
    images: ['/assets/iglo-edge-featured.png'],
  },

  {
    id: 'p1_slide',
    slug: 'iglo-edge-slide',
    name: 'IGLO EDGE SLIDE',
    tagline: 'Technology That Impresses',
    description: 'Our new, most technologically advanced window is distinguished by an excellent thermal insulation parameter of Uw = 0,65 W/(m2K)* and a modern, angular profile shape.',
    category: CATEGORIES[2], // Terrace Systems
    material: 'pvc',
    type: 'window',
    isNew: true,
    isFeatured: true,
    specs: [
      { label: 'Thermal Transmittance (Uw)', value: '0.65', unit: 'W/(m²K)' },
      { label: 'Installation Depth (Frame)', value: '163', unit: 'mm' },
      { label: 'Profile Chambers', value: '6' },
      { label: 'Gaskets', value: '3' },
    ],
    images: ['/assets/placeholder-window.jpg'],
  },

  {
    id: 'p2',
    slug: 'iglo-energy',
    name: 'IGLO ENERGY',
    tagline: 'First-class energy efficiency, 7-chamber innovation',
    description: 'An innovative 7-chamber A-class profile made exclusively of primary materials. The world\'s first system using a central gasket made of foamed EPDM to ensure best-in-class energy efficiency. Iglo Energy windows also stand out for water tightness, microventilation and resistance to wind.',
    category: CATEGORIES[0],
    material: 'pvc',
    type: 'window',
    isFeatured: true,
    specs: [
      { label: 'Thermal Transmittance (Uw)', value: '0.71', unit: 'W/(m²K)' },
      { label: 'Installation Depth', value: '82', unit: 'mm' },
      { label: 'Profile Chambers', value: '7' },
      { label: 'Sound Insulation (Rw)', value: '37–46', unit: 'dB' },
    ],
    images: ['/assets/iglo-energy-1.jpg'],
  },

  {
    id: 'p3',
    slug: 'iglo-energy-classic',
    name: 'IGLO ENERGY CLASSIC',
    tagline: 'Square glazing bead meets passive-house performance',
    description: 'A unique design where you can choose the square-shaped glazing bead to reflect the latest architectural trends. The remarkable thermal insulation parameters are ensured by the optimum 7-chamber profile structure and a specially designed sealing system made of foamed EPDM. Profile available in white, anthracite and bronze.',
    category: CATEGORIES[0],
    material: 'pvc',
    type: 'window',
    specs: [
      { label: 'Thermal Transmittance (Uw)', value: '0.73', unit: 'W/(m²K)' },
      { label: 'Installation Depth', value: '82', unit: 'mm' },
      { label: 'Profile Chambers', value: '7' },
      { label: 'Sound Insulation (Rw)', value: '36–42', unit: 'dB' },
    ],
    images: ['/assets/iglo-energy-classic-1.jpg'],
  },

  {
    id: 'p4',
    slug: 'iglo-energy-alucover',
    name: 'IGLO ENERGY ALUCOVER',
    tagline: 'PVC performance with aluminium exterior elegance',
    description: 'Experience the fusion of cutting-edge thermal insulation performance and contemporary design. The aluminium cladding on the exterior offers boundless colour possibilities, empowering you to fashion a unique personalised style for every interior or building facade — without compromising on thermal performance.',
    category: CATEGORIES[0],
    material: 'pvc',
    type: 'window',
    specs: [
      { label: 'Thermal Transmittance (Uw)', value: '0.76', unit: 'W/(m²K)' },
      { label: 'Installation Depth', value: '82', unit: 'mm' },
      { label: 'Profile Chambers', value: '7' },
      { label: 'Glazing Package (Ug)', value: '0.5', unit: 'W/(m²K)' },
    ],
    images: ['/assets/iglo-energy-alucover-1.jpg'],
  },

  {
    id: 'p5',
    slug: 'iglo-5',
    name: 'IGLO 5',
    tagline: 'High quality at an attractive price',
    description: 'A 5-chamber system features very good thermal insulation parameters. Our innovative solution is based on a snow-white A-class profile made exclusively of primary materials to ensure the highest quality. These windows are perfect for both warm and cold climates.',
    category: CATEGORIES[0],
    material: 'pvc',
    type: 'window',
    specs: [
      { label: 'Thermal Transmittance (Uw)', value: '0.89', unit: 'W/(m²K)' },
      { label: 'Installation Depth', value: '70', unit: 'mm' },
      { label: 'Profile Chambers', value: '5' },
      { label: 'Sound Insulation (Rw)', value: '34–42', unit: 'dB' },
    ],
    images: ['/assets/iglo-5-1.jpg'],
  },

  {
    id: 'p6',
    slug: 'iglo-5-classic',
    name: 'IGLO 5 CLASSIC',
    tagline: 'Proven solutions mean customer satisfaction',
    description: 'The IGLO 5 Classic blends the proven 5-chamber profile system with a traditional aesthetic. Reliable thermal and acoustic performance makes it the trusted choice for both new builds and renovation projects across all climate zones.',
    category: CATEGORIES[0],
    material: 'pvc',
    type: 'window',
    specs: [
      { label: 'Thermal Transmittance (Uw)', value: '0.89', unit: 'W/(m²K)' },
      { label: 'Installation Depth', value: '70', unit: 'mm' },
      { label: 'Profile Chambers', value: '5' },
      { label: 'Sound Insulation (Rw)', value: '36–44', unit: 'dB' },
    ],
    images: ['/assets/iglo-5-classic-1.jpg'],
  },

  {
    id: 'p7',
    slug: 'iglo-light',
    name: 'IGLO LIGHT',
    tagline: 'Even more daylight into your space',
    description: 'IGLO LIGHT is characterised by its exceptionally slim profiles, allowing significantly more natural light into the interior. Despite its slender appearance, it offers outstanding structural stability and thermal performance in the classic 5-chamber engineering.',
    category: CATEGORIES[0],
    material: 'pvc',
    type: 'window',
    isFeatured: true,
    specs: [
      { label: 'Thermal Transmittance (Uw)', value: '0.88', unit: 'W/(m²K)' },
      { label: 'Installation Depth', value: '70', unit: 'mm' },
      { label: 'Profile Chambers', value: '5' },
      { label: 'Sound Insulation (Rw)', value: '34', unit: 'dB' },
    ],
    images: ['/assets/iglo-light-1.jpg'],
  },

  {
    id: 'p8',
    slug: 'iglo-ext',
    name: 'IGLO EXT',
    tagline: 'Modern PVC balcony windows that open outwards',
    description: 'IGLO EXT is a modern outward-opening PVC system ideal for balconies, terraces, and tight-space installations where inward opening is impractical. It offers reliable weather protection and thermal insulation in a space-saving design.',
    category: CATEGORIES[0],
    material: 'pvc',
    type: 'window',
    specs: [
      { label: 'Thermal Transmittance (Uw)', value: '0.89', unit: 'W/(m²K)' },
      { label: 'Installation Depth', value: '70', unit: 'mm' },
      { label: 'Profile Chambers', value: '5' },
      { label: 'Opening Direction', value: 'Outward' },
    ],
    images: ['/assets/iglo-ext-1.jpg'],
  },

  {
    id: 'p9',
    slug: 'iglo-premier',
    name: 'IGLO PREMIER',
    tagline: 'Modern outward-opening casement or tilt windows',
    description: 'Iglo Premier delivers the premium outward-opening window experience with exceptional weatherproofing and thermal performance. Designed for contemporary architecture requiring clean sightlines and reliable long-term performance.',
    category: CATEGORIES[0],
    material: 'pvc',
    type: 'window',
    specs: [
      { label: 'Installation Depth', value: '70', unit: 'mm' },
      { label: 'Profile Chambers', value: '5' },
      { label: 'Opening Direction', value: 'Outward' },
      { label: 'Standard Glazing (Ug)', value: '0.6', unit: 'W/(m²K)' },
    ],
    images: ['/assets/iglo-premier-1.jpg'],
  },

  {
    id: 'p10',
    slug: 'ideal-neo-ad',
    name: 'IDEAL NEO AD',
    tagline: 'More than modern design',
    description: 'The IDEAL NEO AD offers a 5/6-chamber profile structure with outstanding design versatility. It incorporates advanced thermal break technology and is available in a wide range of finishes, making it ideal for architecturally demanding projects.',
    category: CATEGORIES[0],
    material: 'pvc',
    type: 'window',
    specs: [
      { label: 'Thermal Transmittance (Uw)', value: '0.79', unit: 'W/(m²K)' },
      { label: 'Installation Depth', value: '76', unit: 'mm' },
      { label: 'Profile Chambers', value: '5/6' },
      { label: 'Sound Insulation (Rw)', value: '36', unit: 'dB' },
    ],
    images: ['/assets/ideal-neo-ad-1.jpg'],
  },

  {
    id: 'p11',
    slug: 'ideal-neo-md',
    name: 'IDEAL NEO MD',
    tagline: 'More than modern design',
    description: 'IDEAL NEO MD is a premium 6-chamber system offering excellent thermal insulation and a contemporary flush profile aesthetic. The seamless sash design removes visible rebates, creating a modern appearance that suits minimalist interiors and facades.',
    category: CATEGORIES[0],
    material: 'pvc',
    type: 'window',
    specs: [
      { label: 'Thermal Transmittance (Uw)', value: '0.76', unit: 'W/(m²K)' },
      { label: 'Installation Depth', value: '76', unit: 'mm' },
      { label: 'Profile Chambers', value: '6' },
      { label: 'Sound Insulation (Rw)', value: '36', unit: 'dB' },
    ],
    images: ['/assets/ideal-neo-md-1.jpg'],
  },

  {
    id: 'p12',
    slug: 'ideal-neo-md-fs',
    name: 'IDEAL NEO MD-FS',
    tagline: 'In harmony with the architecture',
    description: 'The IDEAL NEO MD-FS flush sash variant removes the visible step between frame and sash, resulting in a perfectly flat exterior appearance. Ideal for modern, minimalist architecture where sightlines matter as much as performance.',
    category: CATEGORIES[0],
    material: 'pvc',
    type: 'window',
    specs: [
      { label: 'Thermal Transmittance (Uw)', value: '0.73', unit: 'W/(m²K)' },
      { label: 'Installation Depth', value: '76', unit: 'mm' },
      { label: 'Profile Chambers', value: '6' },
      { label: 'Sound Insulation (Rw)', value: '36', unit: 'dB' },
    ],
    images: ['/assets/ideal-neo-md-fs-1.jpg'],
  },

  {
    id: 'p13',
    slug: 'ideal-neo-md-monoblock',
    name: 'IDEAL NEO MD MONOBLOCK',
    tagline: 'Designed for installation within insulation layers',
    description: 'Monoblock frames are designed for windows installed within a layer of insulation. The wide frame range (76–162 mm) allows appropriate selection depending on insulation thickness. A special outer shelf aesthetically masks the insulation around the window perimeter.',
    category: CATEGORIES[0],
    material: 'pvc',
    type: 'window',
    specs: [
      { label: 'Thermal Transmittance (Uw)', value: '0.76', unit: 'W/(m²K)' },
      { label: 'Installation Depth', value: '76–162', unit: 'mm' },
      { label: 'Profile Chambers', value: '6' },
      { label: 'Sound Insulation (Rw)', value: '36', unit: 'dB' },
    ],
    images: ['/assets/ideal-neo-md-monoblock-1.jpg'],
  },

  {
    id: 'p14',
    slug: 'ideal-neo-md-renovation',
    name: 'IDEAL NEO MD RENOVATION',
    tagline: 'New windows without removing the old frame',
    description: 'The renovation frame system enables window installation without dismantling old frames. Special frames with a masking profile encompass the existing wooden frame. Masking profiles are available in widths of 40 mm and 70 mm and can be cut for specific requirements.',
    category: CATEGORIES[0],
    material: 'pvc',
    type: 'window',
    specs: [
      { label: 'Thermal Transmittance (Uw)', value: '0.76', unit: 'W/(m²K)' },
      { label: 'Installation Depth', value: '76', unit: 'mm' },
      { label: 'Profile Chambers', value: '5/6' },
      { label: 'Sound Insulation (Rw)', value: '36', unit: 'dB' },
    ],
    images: ['/assets/ideal-neo-md-renovation-1.jpg'],
  },

  {
    id: 'p15',
    slug: 'ideal-7000-nl',
    name: 'IDEAL 7000 NL',
    tagline: 'In harmony with the architecture',
    description: 'The IDEAL 7000 NL is a versatile PVC window system offering clean sightlines and solid thermal performance. Well-suited to projects where architecture demands a refined, contemporary window profile without compromising on insulation or durability.',
    category: CATEGORIES[0],
    material: 'pvc',
    type: 'window',
    specs: [
      { label: 'Profile Chambers', value: '5' },
      { label: 'Glazing Package (Ug)', value: '0.5', unit: 'W/(m²K)' },
      { label: 'Available Weld Types', value: 'V-Perfect, classic' },
      { label: 'Standard Hardware', value: 'MACO MULTI-MATIC' },
    ],
    images: ['/assets/ideal-7000-nl-1.jpg'],
  },

  // ─── ALUMINIUM WINDOWS ────────────────────────────────────────────────────

  {
    id: 'pa1',
    slug: 'mb-86n-si',
    name: 'MB-86N SI',
    tagline: 'Excellent parameters and durability of aluminium',
    description: 'A highly advanced aluminium window system that meets the highest thermal insulation requirements. The warm-edge spacer and premium thermal break deliver Uw values as low as 0.76 W/(m²K), making it the top performer in the Drutex aluminium window range.',
    category: CATEGORIES[0],
    material: 'aluminum',
    type: 'window',
    isFeatured: true,
    specs: [
      { label: 'Thermal Transmittance (Uw)', value: '0.76', unit: 'W/(m²K)' },
      { label: 'Installation Depth', value: '77', unit: 'mm' },
      { label: 'Sealing Layers', value: '3' },
      { label: 'Standard Glazing (Ug)', value: '0.5', unit: 'W/(m²K)' },
    ],
    images: ['/assets/mb-86n-si-1.jpg'],
  },

  {
    id: 'pa2',
    slug: 'mb-79n-si',
    name: 'MB-79N SI',
    tagline: 'Choose energy efficiency',
    description: 'The MB-79N SI aluminium window system delivers outstanding thermal performance for a 70 mm profile depth. Three sealing levels and a high-performance thermal break make it suitable for both residential and commercial applications requiring efficient, durable aluminium framing.',
    category: CATEGORIES[0],
    material: 'aluminum',
    type: 'window',
    specs: [
      { label: 'Thermal Transmittance (Uw)', value: '0.81', unit: 'W/(m²K)' },
      { label: 'Installation Depth', value: '70', unit: 'mm' },
      { label: 'Sealing Layers', value: '3' },
      { label: 'Standard Glazing (Ug)', value: '0.5', unit: 'W/(m²K)' },
    ],
    images: ['/assets/mb-79n-si-1.jpg'],
  },

  {
    id: 'pa3',
    slug: 'mb-70hi',
    name: 'MB-70HI',
    tagline: 'Lightweight, durable, thermally efficient aluminium',
    description: 'MB-70HI aluminium windows can be used in both individual buildings and aluminium facades. The lightweight and durable construction ensures a high level of comfort for many years. Standard equipment includes MACO MULTI-MATIC KS fittings and microventilation.',
    category: CATEGORIES[0],
    material: 'aluminum',
    type: 'window',
    specs: [
      { label: 'Thermal Transmittance (Uw)', value: '0.96', unit: 'W/(m²K)' },
      { label: 'Installation Depth', value: '70', unit: 'mm' },
      { label: 'Sealing Layers', value: '3' },
      { label: 'Glazing Range', value: '23.5–62', unit: 'mm' },
    ],
    images: ['/assets/mb-70hi-1.jpg'],
  },

  {
    id: 'pa4',
    slug: 'mb-70',
    name: 'MB-70',
    tagline: 'Reliable aluminium with a 70 mm profile depth',
    description: 'The MB-70 aluminium window system provides a reliable, cost-effective solution for modern architecture. Standard equipment includes MACO hardware, 70 mm installation depth, and RAL matt colours in white or anthracite — covering the broadest range of residential and commercial applications.',
    category: CATEGORIES[0],
    material: 'aluminum',
    type: 'window',
    specs: [
      { label: 'Thermal Transmittance (Uw)', value: '1.06', unit: 'W/(m²K)' },
      { label: 'Installation Depth', value: '70', unit: 'mm' },
      { label: 'Sealing Layers', value: '3' },
      { label: 'Glazing Range', value: '23.5–62', unit: 'mm' },
    ],
    images: ['/assets/mb-70-1.jpg'],
  },

  {
    id: 'pa5',
    slug: 'mb-45',
    name: 'MB-45',
    tagline: 'Slim aluminium profile for maximum glass area',
    description: 'The MB-45 is an ultra-slim aluminium window system with a 45 mm profile depth, perfect for applications where maximum glass surface and minimal frame visibility are priorities. Standard equipment includes MACO fittings, EPDM seals, and RAL matt finishes.',
    category: CATEGORIES[0],
    material: 'aluminum',
    type: 'window',
    specs: [
      { label: 'Installation Depth', value: '45', unit: 'mm' },
      { label: 'Sealing Layers', value: '2' },
      { label: 'Glazing Range', value: '1.5–37', unit: 'mm' },
      { label: 'Available Colours', value: 'White RAL 9016, Anthracite RAL 7016' },
    ],
    images: ['/assets/mb-45-1.jpg'],
  },

  // ─── WOOD WINDOWS ─────────────────────────────────────────────────────────

  {
    id: 'pw1',
    slug: 'softline',
    name: 'SOFTLINE 68/78/88',
    tagline: 'Durability and beauty of nature',
    description: 'SOFTLINE wooden windows bring the warmth and beauty of natural materials with modern engineering precision. Available in three profile depths — 68 mm, 78 mm, and 88 mm — to suit varying insulation and aesthetic requirements, finished with high-quality microporous lacquers for long-term durability.',
    category: CATEGORIES[0],
    material: 'wood',
    type: 'window',
    specs: [
      { label: 'Available Depths', value: '68 / 78 / 88', unit: 'mm' },
      { label: 'Material', value: 'Pine / Oak / Meranti' },
      { label: 'Surface Treatment', value: 'High-quality microporous lacquer' },
      { label: 'Standard Hardware', value: 'MACO MULTI-MATIC' },
    ],
    images: ['/assets/softline-1.jpg'],
  },

  // ─── WOOD-ALUMINIUM WINDOWS ───────────────────────────────────────────────

  {
    id: 'pwa1',
    slug: 'duoline',
    name: 'DUOLINE 68/78/88',
    tagline: 'Unique combination of wood and aluminium',
    description: 'DUOLINE wood-aluminium windows combine the warmth of a natural wood interior with a robust, low-maintenance aluminium exterior shell. Available in three profile depths (68 mm, 78 mm, 88 mm) with virtually unlimited RAL exterior colour options for any architectural style.',
    category: CATEGORIES[0],
    material: 'wood-aluminum',
    type: 'window',
    specs: [
      { label: 'Available Depths', value: '68 / 78 / 88', unit: 'mm' },
      { label: 'Interior', value: 'Natural wood (pine/oak/meranti)' },
      { label: 'Exterior', value: 'Aluminium shell, unlimited RAL' },
      { label: 'Standard Hardware', value: 'MACO MULTI-MATIC' },
    ],
    images: ['/assets/duoline-1.jpg'],
  },

  // ─── DOORS ────────────────────────────────────────────────────────────────

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
    images: ['/assets/iglo-edge-door-1.jpg'],
  },

  {
    id: 'd2',
    slug: 'iglo-energy-doors',
    name: 'IGLO ENERGY DOORS',
    tagline: 'World-leading design and excellent parameters',
    description: 'The Iglo Energy PVC exterior entrance door means modern and beautiful design, energy efficiency as well as aesthetic values and perfect functionality.',
    category: CATEGORIES[1],
    material: 'pvc',
    type: 'door',
    isFeatured: true,
    specs: [
      { label: 'Thermal Transmittance (Ud)', value: '0.8', unit: 'W/(m²K)' },
      { label: 'Installation Depth', value: '82', unit: 'mm' },
      { label: 'Locking Points', value: '3 to 5' },
    ],
    images: ['/assets/iglo-energy-doors/door.webp'],
  },

  {
    id: 'd3',
    slug: 'mb-86si-doors-alu',
    name: 'MB-86N SI DOORS',
    tagline: 'Excellent parameters and durability of aluminium',
    description: 'The exterior aluminium door in this system comes with an aluminium threshold with a thermal break as standard and is characterised by not only exceptional thermal insulation qualities, but also durability. Recommended for energy-efficient buildings.',
    category: CATEGORIES[1],
    material: 'aluminum',
    type: 'door',
    isNew: true,
    specs: [
      { label: 'Thermal Transmittance (Ud)', value: '0.8', unit: 'W/(m²K)' },
      { label: 'Installation Depth', value: '77', unit: 'mm' },
    ],
    images: ['/assets/products/mb-86si-doors-alu/gallery/gallery-2.png'],
  },

  // ─── SHUTTERS ─────────────────────────────────────────────────────────────

  {
    id: 's1',
    slug: 'aluminium-shutters',
    name: 'ALUMINIUM ROLLER SHUTTERS',
    tagline: 'Take care of your comfort and privacy',
    description: 'Choose proven and modern solutions to reduce heating and energy bills and take care of your privacy and safety.\n\nThey can also be integrated with Smart Home control systems.',
    category: CATEGORIES[3],
    material: 'aluminum',
    type: 'shutter',
    specs: [],
    images: ['/assets/products/aluminium-shutters/colors/golden-oak.jpg'],
  },

  {
    id: 's2',
    slug: 'external-venetian-blinds',
    name: 'EXTERNAL VENETIAN BLINDS',
    tagline: 'Comfort and joy of use',
    description: 'Venetian blinds are ideal for protecting indoors against excessive sunlight. Once installed, they can not only provide better privacy but also considerably reduce energy costs generated by air conditioning systems.\n\nWhat is more, Venetian blinds can be used in both old and new buildings, while modern Smart Home solutions allow Venetian blinds to be controlled with your smartphone or tablet.',
    category: CATEGORIES[3],
    material: 'aluminum',
    type: 'shutter',
    specs: [],
    images: ['/assets/products/external-venetian-blinds/colors/ral9016.jpg'],
  },

  {
    id: 's3',
    slug: 'roller-blind-box-225',
    name: 'ROLLER BLIND BOX 225',
    tagline: 'Advanced aluminium roller blinds with side guide rails',
    description: 'Premium aluminium roller blinds featuring a top-mounted 225mm box casing and side guide rails. Offers exceptional light control, insulation, privacy and safety for your home.',
    category: CATEGORIES[3],
    material: 'aluminum',
    type: 'shutter',
    specs: [
      { label: 'Installation Depth', value: '240', unit: 'mm' }
    ],
    images: ['/assets/products/aluminium-shutters/colors/anthracite.jpg'],
  },

  // ─── TERRACE ──────────────────────────────────────────────────────────────

  {
    id: 't1',
    slug: 'iglo-hs',
    name: 'IGLO-HS',
    tagline: 'Panoramic views without limits',
    description: 'Lift-and-slide (HS) doors that allow the creation of spectacular, large-format glazing. The advanced mechanism ensures effortless operation even for sashes weighing up to 400 kg.',
    category: CATEGORIES[2],
    material: 'pvc',
    type: 'terrace',
    isFeatured: true,
    specs: [
      { label: 'Thermal Transmittance (Uw)', value: '0.73', unit: 'W/(m²K)' },
      { label: 'Max Dimensions', value: '3.2m × 6.5m' },
      { label: 'Installation Depth', value: '194', unit: 'mm (frame)' },
    ],
    images: ['/assets/iglo-hs-1.jpg'],
  },
]

export const PRODUCTS: Product[] = BASE_PRODUCTS.map(p => {
  const specKey = p.slug.replace(/-/g, '')
  const data = (techSpecs as Record<string, any>)[specKey]
  if (data && data.technical) {
    return { ...p, techDetails: data.technical }
  }
  return p
})
