const fs = require('fs');

const txt = fs.readFileSync('src/data/productDetails.ts', 'utf8');

const newData = `

export const IGLO_ENERGY_CLASSIC_DETAIL: ProductDetailData = {
  id: 'p3',
  slug: 'iglo-energy-classic',
  name: 'IGLO Energy Classic',
  tagline: 'A unique design with exceptional thermal insulation',
  description: \`A unique design where you can choose the square-shaped glazing bead to reflect the latest architectural trends. The remarkable thermal insulation parameters are ensured by the optimum 7-chamber profile structure, a specially designed sealing system made of foamed EPDM and glass packages with high thermal insulation parameters.\`,
  heroImage: '/assets/products/iglo_energy_classic_pr.png',
  windowPhoto: '/assets/products/iglo_energy_classic_pr.png',
  profileImage: '/assets/products/iglo_energy_classic_pr.png',
  blueprintImage: '/assets/tech/iglo_energy_classic.png',
  videoSrc: '/assets/heroes/iglo_energy_classic_anim_antracyt.mp4',
  modalVideoSrc: '/assets/heroes/iglo_energy_classic_anim_antracyt.mp4',
  disableHeroFilter: false,
  standardEquipment: [
    "Double-chamber glazing package Ug = 0.5 W/(m²K)",
    "Swisspacer Ultimate plastic warm frame - as a free elective option",
    "V-perfect weld",
    "4 anti-theft strikers according to the size of the sash and the hardware system",
    "Microventilation",
    "Aluminium window handle",
    "Handle misplacement locking mechanism",
    "Perimeter, glazing and central gaskets in black or grey",
    "Filling of the lower hardware groove",
    "Sill trim",
    "Wide selection of PVC veneer colours"
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
  glassOptions: []
};
`;

fs.writeFileSync('src/data/productDetails.ts', txt.trim() + newData);
console.log('Appended IGLO_ENERGY_CLASSIC_DETAIL');
