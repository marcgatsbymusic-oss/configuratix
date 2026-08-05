import fs from 'fs';
import * as cheerio from 'cheerio';

const URLS = [
  // LIFT AND SLIDE HS
  { slug: 'iglo-hs', url: 'https://www.drutex.eu/en/products/iglo-hs.html', catKey: 'liftAndSlide' },
  { slug: 'iglo-hs-alucover', url: 'https://www.drutex.eu/en/products/iglo-hs-alucover.html', catKey: 'liftAndSlide' },
  { slug: 'mb-77hs', url: 'https://www.drutex.eu/en/products/mb-77hs.html', catKey: 'liftAndSlide' },
  { slug: 'mb-77hs-monorail', url: 'https://www.drutex.eu/en/products/mb-77hs-hi-monorail.html', catKey: 'liftAndSlide' },
  { slug: 'mb-59hs', url: 'https://www.drutex.eu/en/products/hs-aluminium-mb-59hs.html', catKey: 'liftAndSlide' }, // Changed to EN
  { slug: 'softline-hs', url: 'https://www.drutex.eu/en/products/softline-hs.html', catKey: 'liftAndSlide' },
  { slug: 'duoline-hs', url: 'https://www.drutex.eu/en/products/duoline-hs.html', catKey: 'liftAndSlide' },
  
  // SLIDE (iglo-edge-slide is done)
  { slug: 'iglo-slide', url: 'https://www.drutex.eu/en/products/iglo-slide.html', catKey: 'slide' },
  { slug: 'mb-slide', url: 'https://www.drutex.eu/en/products/mb-slide.html', catKey: 'slide' },
  { slug: 'cor-vision', url: 'https://www.drutex.eu/en/products/cor-vision.html', catKey: 'slide' },
  { slug: 'cor-vision-plus', url: 'https://www.drutex.eu/en/products/cor-vision-plus.html', catKey: 'slide' },

  // FOLDING DOORS
  { slug: 'mb-86-fold-line', url: 'https://www.drutex.eu/en/products/mb-86-fold-line.html', catKey: 'foldingDoors' },
  { slug: 'softline-68-folding', url: 'https://www.drutex.eu/en/products/softline-68.html', catKey: 'foldingDoors' },

  // TILT AND SLIDE PSK
  { slug: 'iglo-energy-psk', url: 'https://www.drutex.eu/en/products/iglo-energy-psk.html', catKey: 'tiltAndSlide' },
  { slug: 'iglo-energy-classic-psk', url: 'https://www.drutex.eu/en/products/iglo-energy-classic-psk.html', catKey: 'tiltAndSlide' },
  { slug: 'iglo5-psk', url: 'https://www.drutex.eu/en/products/iglo5-psk.html', catKey: 'tiltAndSlide' },
  { slug: 'iglo5-classic-psk', url: 'https://www.drutex.eu/en/products/iglo-5-classic-psk.html', catKey: 'tiltAndSlide' },
  { slug: 'iglo-light-psk', url: 'https://www.drutex.eu/en/products/iglo-light-psk.html', catKey: 'tiltAndSlide' },
  { slug: 'mb-70-psk', url: 'https://www.drutex.eu/en/products/mb-70-mb-70hi-psk.html', catKey: 'tiltAndSlide' },
  { slug: 'softline-psk', url: 'https://www.drutex.eu/en/products/softline-psk.html', catKey: 'tiltAndSlide' },
  { slug: 'duoline-psk', url: 'https://www.drutex.eu/en/products/duoline-psk.html', catKey: 'tiltAndSlide' }
];

async function scrape() {
  let productsOutput = ``;
  let detailsOutput = ``;

  for (const item of URLS) {
    console.log(`Scraping ${item.url}...`);
    try {
      const res = await fetch(item.url);
      if (!res.ok) {
        console.log(`Failed to fetch ${item.url}`);
        continue;
      }
      const html = await res.text();
      const $ = cheerio.load(html);

      const name = $('h1').first().text().trim() || item.slug.toUpperCase().replace(/-/g, ' ');
      
      // Look for description in typical div
      let description = '';
      $('p').each((i, el) => {
        const text = $(el).text().trim();
        if (text.length > 50 && text.length < 500 && !description) {
          description = text;
        }
      });
      if (!description) description = "Premium terrace system offering excellent thermal insulation and modern design.";

      const equipment = [];
      $('ul li').each((i, el) => {
        const text = $(el).text().trim();
        if (text.length > 5 && text.length < 100) {
           // simple heuristic for equipment lists
           if (text.toLowerCase().includes('glass') || text.toLowerCase().includes('weld') || text.toLowerCase().includes('gasket') || text.toLowerCase().includes('hardware') || text.toLowerCase().includes('handle') || text.toLowerCase().includes('profile')) {
             if (!equipment.includes(text)) equipment.push(text);
           }
        }
      });
      if (equipment.length === 0) {
        equipment.push('Advanced thermal insulation');
        equipment.push('Premium hardware system');
        equipment.push('Durable perimeter gaskets');
      }

      // Generate the TS strings
      const prodVarName = item.slug.replace(/-/g, '_').toUpperCase() + '_DETAIL';

      productsOutput += `
  {
    id: 'p_${item.slug}',
    slug: '${item.slug}',
    name: '${name.replace(/'/g, "\\'")}',
    tagline: 'Technology That Impresses',
    description: '${description.replace(/'/g, "\\'")}',
    category: CATEGORIES[2], // Terrace Systems
    material: '${item.slug.includes('mb-') || item.slug.includes('cor') ? 'aluminum' : item.slug.includes('softline') ? 'wood' : 'pvc'}',
    type: 'window',
    isNew: false,
    specs: [
      { label: 'Thermal Transmittance', value: 'High Efficiency' },
    ],
    images: ['/assets/placeholder-window.jpg'],
  },`;

      detailsOutput += `
export const ${prodVarName}: ProductDetailData = {
  id: 'p_${item.slug}',
  slug: '${item.slug}',
  name: '${name.replace(/'/g, "\\'")}',
  tagline: 'Technology That Impresses',
  description: '${description.replace(/'/g, "\\'")}',
  heroImage: '/assets/placeholder-window.jpg',
  windowPhoto: '/assets/placeholder-window.jpg',
  profileImage: '/assets/placeholder-window.jpg',
  blueprintImage: '/assets/placeholder-window.jpg',
  videoSrc: '',
  modalVideoSrc: '',
  disableHeroFilter: true,
  standardEquipment: ${JSON.stringify(equipment, null, 4)},
  keySpecs: [
    { label: 'Thermal Transmittance', value: 'High Efficiency' }
  ],
  hardware: [],
  accessories: []
};
`;

    } catch (err) {
      console.log(`Error scraping ${item.url}: ${err.message}`);
    }
  }

  fs.writeFileSync('scripts/out_products.ts', productsOutput);
  fs.writeFileSync('scripts/out_details.ts', detailsOutput);
  console.log("Done scraping!");
}

scrape();
