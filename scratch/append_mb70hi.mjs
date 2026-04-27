import fs from 'fs';

let code = fs.readFileSync('src/data/productDetails.ts', 'utf8');

const mb70hiData = `
export const MB_70HI_DETAIL: ProductDetailData = {
  id: 'mb-70hi',
  slug: 'mb-70hi',
  name: 'MB-70HI',
  tagline: 'Lightweight, durable, thermally efficient aluminium',
  description: 'MB-70HI aluminium windows can be used in both individual buildings and aluminium facades. The lightweight and durable construction ensures a high level of comfort for many years. Standard equipment includes MACO MULTI-MATIC KS fittings and microventilation.',
  heroImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp',
  windowPhoto: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp',
  profileImage: '/assets/mb-70hi/profile.webp',
  blueprintImage: '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp',
  videoSrc: '',
  inlineVideoSrc: '',
  keySpecs: [
    { label: 'thermal', value: 'Uw = 0.96 W/(m²K)*' },
    { label: 'depth', value: '70 mm' },
    { label: 'sealing', value: '3' },
    { label: 'glazing', value: '23.5-62 mm' }
  ],
  standardEquipment: [
    'MACO MULTI-MATIC KS fittings',
    'Microventilation',
    'Aluminium construction'
  ],
  colors: FULL_RAL_COLORS,
  glassOptions: [
    { id: 'g1',  name: '33.1 safety',              image: '/assets/glass/thumbs/segura-331.webp',          largeImage: '/assets/glass/large/segura-331.jpg' },
    { id: 'g2',  name: '33.2 (safety) matt film',  image: '/assets/glass/thumbs/segura-332-mat.webp',      largeImage: '/assets/glass/large/segura-332-mat.jpg' },
    { id: 'g3',  name: 'Float 4',                  image: '/assets/glass/thumbs/float-4.webp',             largeImage: '/assets/glass/large/float-4.jpg' }
  ],
  hardware: [],
  accessories: []
};
`;

if (!code.includes('MB_70HI_DETAIL')) {
    fs.writeFileSync('src/data/productDetails.ts', code + '\n' + mb70hiData);
}

let enJson = JSON.parse(fs.readFileSync('src/locales/en.json', 'utf8'));
if (enJson.productData['mb-70hi']) {
    enJson.productData['mb-70hi'].specs = {
        'thermal': 'Thermal Transmittance (Uw)',
        'depth': 'Installation Depth',
        'sealing': 'Sealing Layers',
        'glazing': 'Glazing Range'
    };
    fs.writeFileSync('src/locales/en.json', JSON.stringify(enJson, null, 2));
}

let esJson = JSON.parse(fs.readFileSync('src/locales/es.json', 'utf8'));
if (esJson.productData && esJson.productData['mb-70hi']) {
    esJson.productData['mb-70hi'].specs = {
        'thermal': 'Transmitancia Térmica',
        'depth': 'Profundidad de instalación',
        'sealing': 'Capas de sellado',
        'glazing': 'Rango de acristalamiento'
    };
    fs.writeFileSync('src/locales/es.json', JSON.stringify(esJson, null, 2));
}

if (!fs.existsSync('public/assets/mb-70hi')) {
    fs.mkdirSync('public/assets/mb-70hi', { recursive: true });
}
