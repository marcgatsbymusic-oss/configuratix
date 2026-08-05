import fs from 'fs';

// 1. Read base (clean from git)
let content = fs.readFileSync('src/data/productDetails.ts', 'utf8');

// 2. Read the scraped output and fix missing properties
let scraped = fs.readFileSync('scripts/out_details.ts', 'utf8');
scraped = scraped.replace(/accessories:\s*\[\]\r?\n\};/g, 'accessories: [],\n  colors: IGLO_EDGE_COLORS,\n  glassOptions: []\n};');

// 3. Define IGLO_EDGE_SLIDE_DETAIL
const replacementSlide = `export const IGLO_EDGE_SLIDE_DETAIL: ProductDetailData = {
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
  modalVideoSrc: '/assets/iglo_edge_slide-en-web.mp4',
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
  colors: IGLO_EDGE_SLIDE_COLORS,
  glassOptions: []
};
`;

// 4. Get IGLO_EDGE_SLIDE_COLORS array
const newColorsArray = fs.readFileSync('scripts/slide_colors_code.ts', 'utf8');

// Regex replace
const colorsStartTag = 'export const IGLO_EDGE_COLORS: SwatchColor[] = [';
const colorsStartIndex = content.indexOf(colorsStartTag);
const colorsEndIndex = content.indexOf('export const IGLO_EDGE_DETAIL:', colorsStartIndex);

if (colorsStartIndex === -1 || colorsEndIndex === -1) {
    console.error("Regex could not find IGLO_EDGE_COLORS block");
    process.exit(1);
}

content = content.substring(0, colorsEndIndex) + newColorsArray + '\n\n' + content.substring(colorsEndIndex);

// Append scraped details AND IGLO_EDGE_SLIDE_DETAIL to the end of the file
content = content + '\n\n' + replacementSlide + '\n\n' + scraped + '\n';

fs.writeFileSync('src/data/productDetails.ts', content);
console.log("Successfully rebuilt productDetails.ts from scratch!");
