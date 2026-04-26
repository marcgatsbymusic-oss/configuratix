const fs = require('fs');

const txt = fs.readFileSync('src/data/productDetails.ts', 'utf8');

const newData = `

export const IGLO_ENERGY_DETAIL: ProductDetailData = {
  id: 'p2',
  slug: 'iglo-energy',
  name: 'IGLO Energy',
  tagline: 'An innovative and original 7-chamber A-class profile',
  description: \`An innovative and original 7-chamber A-class profile made exclusively of primary materials. The world's first system using a central gasket made of foamed EPDM to ensure the best energy efficiency parameters. Iglo Energy windows also stand out for their perfect parameters in terms of water tightness, microventilation and resistance to wind.\`,
  heroImage: '/assets/products/iglo_energy_pr.png',
  windowPhoto: '/assets/products/iglo_energy_pr.png',
  profileImage: '/assets/products/iglo_energy_pr.png',
  blueprintImage: '/assets/tech/iglo_energy.png',
  videoSrc: '/assets/heroes/iglo_energy_anim_winchester.mp4',
  modalVideoSrc: '/assets/products/iglo_energy_animacja-2024-en.mp4',
  disableHeroFilter: false,
  standardEquipment: [
    "Double-chamber glazing package Ug = 0.5 W/(m²K)",
    "Swisspacer Ultimate plastic warm frame - as a free elective option",
    "4 anti-theft strikers according to the size of the sash and the hardware system",
    "Microventilation",
    "Aluminium window handle",
    "Handle misplacement locking mechanism",
    "Perimeter, glazing and central gaskets in black or grey",
    "Filling of the lower hardware groove",
    "Sill trim",
    "Wide selection of PVC veneer colours",
    "Profile available in two colours: white, brown"
  ],
  keySpecs: [
    { label: 'Thermal Transmittance', value: 'High Efficiency' }
  ],
  hardware: [],
  accessories: [],
  colors: IGLO_EDGE_COLORS,
  glassOptions: []
};
`;

fs.writeFileSync('src/data/productDetails.ts', txt.trim() + newData);
console.log('Appended IGLO_ENERGY_DETAIL');
