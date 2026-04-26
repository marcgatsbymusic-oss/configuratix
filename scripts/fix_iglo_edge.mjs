import fs from 'fs';

let content = fs.readFileSync('src/data/productDetails.ts', 'utf8');

// The exact block for IGLO_EDGE_SLIDE_DETAIL starts at export const IGLO_EDGE_SLIDE_DETAIL and ends before export const IGLO_ENERGY_DETAIL
const targetStart = 'export const IGLO_EDGE_SLIDE_DETAIL: ProductDetailData = {';
const targetEnd = 'export const IGLO_ENERGY_DETAIL: ProductDetailData = {';

const startIndex = content.indexOf(targetStart);
const endIndex = content.indexOf(targetEnd);

const replacement = `export const IGLO_EDGE_SLIDE_DETAIL: ProductDetailData = {
  id: 'p1_slide',
  slug: 'iglo-edge-slide',
  name: 'IGLO EDGE SLIDE',
  tagline: 'Technology That Impresses',
  description: 'Our new, most technologically advanced window is distinguished by an excellent thermal insulation parameter of Uw = 0,65 W/(m2K)* and a modern, angular profile shape.',
  heroImage: '/assets/iglo-edge-slide-profile.png',
  heroVideoSrc: '/assets/iglo-edge-slide-hero.mp4',
  windowPhoto: '/assets/iglo-edge-slide-profile.png',
  profileImage: '/assets/iglo-edge-slide-profile.png',
  blueprintImage: '/assets/iglo-edge-slide-cross-section.png',
  videoSrc: '/assets/iglo-edge-slide-product.mp4',
  modalVideoSrc: '/assets/iglo-edge-slide-product.mp4',
  disableHeroFilter: true,
  standardEquipment: [
    'double-chamber glazing package Ug = 0,5 W/(m2K)',
    'Swisspacer Ultimate warm edge',
    'V-Perfect weld',
    'perimeter and glazing gasket in black or grey',
    'central gasket in black',
    'wide selection of pvc veneer colours',
    'aluminium handle inside',
    'aluminium pull handle outside',
  ],
  keySpecs: [
    { label: 'Thermal Transmittance (Uw)', value: '0.65 W/(m2K)' },
    { label: 'Installation Depth (Frame)', value: '163 mm' },
    { label: 'Installation Depth (Sash)', value: '82 mm' },
    { label: 'Profile Chambers', value: '6' },
    { label: 'Gaskets', value: '3' },
  ],
  hardware: [],
  accessories: [],
  colors: IGLO_EDGE_COLORS,
  glassOptions: []
};

`;

content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
fs.writeFileSync('src/data/productDetails.ts', content);
console.log("Surgically updated IGLO_EDGE_SLIDE_DETAIL");
