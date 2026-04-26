const fs = require('fs');

let txt = fs.readFileSync('src/data/productDetails.ts', 'utf8');

txt = txt.replace(
  '  videoSrc: string\n  standardEquipment: string[]\n  keySpecs: { label: string; value: string }[]\n  colors: SwatchColor[]',
  '  videoSrc: string\n  modalVideoSrc?: string\n  disableHeroFilter?: boolean\n  standardEquipment: string[]\n  keySpecs: { label: string; value: string }[]\n  colors: SwatchColor[]\n  outdoorColors?: SwatchColor[]\n  outdoorWindowPhoto?: string'
);

txt = txt.replace(
  '  videoSrc: string\r\n  standardEquipment: string[]\r\n  keySpecs: { label: string; value: string }[]\r\n  colors: SwatchColor[]',
  '  videoSrc: string\r\n  modalVideoSrc?: string\r\n  disableHeroFilter?: boolean\r\n  standardEquipment: string[]\r\n  keySpecs: { label: string; value: string }[]\r\n  colors: SwatchColor[]\r\n  outdoorColors?: SwatchColor[]\r\n  outdoorWindowPhoto?: string'
);


const newData = `

export const RAL_COLORS: SwatchColor[] = [
  { id: 'ral-7016', name: 'Anthracite Grey (RAL 7016)', hex: '#373f43', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/antracita.webp' },
  { id: 'ral-9016', name: 'Traffic White (RAL 9016)', hex: '#f4f4f4', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp' },
  { id: 'ral-9005', name: 'Jet Black (RAL 9005)', hex: '#0a0a0a', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/negro-madera.webp' },
  { id: 'ral-7035', name: 'Light Grey (RAL 7035)', hex: '#c5c7c4', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/gris-claro.webp' },
  { id: 'ral-8014', name: 'Sepia Brown (RAL 8014)', hex: '#49392d', group: 'Solid', windowImage: '/assets/windowcolors/wingloedgeframeswithcolor/marron-chocolate.webp' }
];

export const IGLO_ENERGY_ALUCOVER_DETAIL: ProductDetailData = {
  id: 'p4',
  slug: 'iglo-energy-alucover',
  name: 'IGLO Energy Alu Cover',
  tagline: 'Modern aluminum look with PVC insulation',
  description: \`The system combines the excellent thermal insulation parameters of PVC windows with the modern design of aluminum windows. The aluminum cover on the outside of the profile gives the windows a sleek, modern appearance while maintaining the energy efficiency of the 7-chamber PVC profile.\`,
  heroImage: '/assets/products/iglo_energy_alucover_pr.png',
  windowPhoto: '/assets/products/iglo_energy_alucover_pr.png',
  outdoorWindowPhoto: '/assets/products/iglo_energy_alucover_pr.png',
  profileImage: '/assets/products/iglo_energy_alucover_pr.png',
  blueprintImage: '/assets/tech/iglo-energy-alucover-profil-swisspacer.png',
  videoSrc: '/assets/heroes/okno_-_iglo_energy_alu_cover_-_mobile.mp4',
  modalVideoSrc: '/assets/products/iglo-energy-classic-alu-cover.mp4',
  disableHeroFilter: false,
  standardEquipment: [
    "Double-chamber glazing package Ug = 0.5 W/(m²K)",
    "Swisspacer Ultimate plastic warm frame - as a free elective option",
    "Aluminum cover on the outside of the profile",
    "4 anti-theft strikers according to the size of the sash and the hardware system",
    "Microventilation",
    "Aluminium window handle",
    "Handle misplacement locking mechanism",
    "Perimeter, glazing and central gaskets in black or grey",
    "Filling of the lower hardware groove",
    "Sill trim",
    "Wide selection of PVC veneer colours for the inside",
    "Over 200 RAL colours for the aluminum cover"
  ],
  keySpecs: [
    { label: 'sound', value: 'dB = 37-46' },
    { label: 'gaskets', value: '3' },
    { label: 'thermal', value: 'Uw = 0.71 W/(m²K)*' },
    { label: 'chambers', value: '7' },
    { label: 'depth', value: '82 mm' },
    { label: 'class', value: 'A' }
  ],
  hardware: [],
  accessories: [],
  colors: IGLO_EDGE_COLORS,
  outdoorColors: RAL_COLORS,
  glassOptions: []
};
`;

fs.writeFileSync('src/data/productDetails.ts', txt.trim() + newData);
console.log('Appended IGLO_ENERGY_ALUCOVER_DETAIL');
