import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import product data
import { PRODUCTS } from './src/data/products.js';
import { IGLO_EDGE_DETAIL, IGLO_ENERGY_DETAIL } from './src/data/productDetails.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const enLocalesPath = path.join(__dirname, 'src', 'locales', 'en.json');

async function extract() {
  const enData = JSON.parse(fs.readFileSync(enLocalesPath, 'utf8'));
  
  // Ensure productData namespace exists
  if (!enData.productData) enData.productData = {};

  // Extract from PRODUCTS array (for list views)
  PRODUCTS.forEach(p => {
    if (!enData.productData[p.slug]) enData.productData[p.slug] = {};
    enData.productData[p.slug].name = p.name;
    enData.productData[p.slug].tagline = p.tagline;
    enData.productData[p.slug].description = p.description;
    
    // Tech Specs
    if (p.specs && p.specs.length > 0) {
      if (!enData.productData[p.slug].specs) enData.productData[p.slug].specs = {};
      p.specs.forEach((s, idx) => {
        enData.productData[p.slug].specs[`label_${idx}`] = s.label;
        enData.productData[p.slug].specs[`value_${idx}`] = s.value;
      });
    }
  });

  // Extract from Detailed Products
  const details = [IGLO_EDGE_DETAIL, IGLO_ENERGY_DETAIL];
  details.forEach(d => {
    if (d) {
      if (!enData.productData[d.slug]) enData.productData[d.slug] = {};
      enData.productData[d.slug].name = d.name;
      enData.productData[d.slug].tagline = d.tagline;
      enData.productData[d.slug].description = d.description;
      
      if (d.standardEquipment) {
        if (!enData.productData[d.slug].standardEquipment) enData.productData[d.slug].standardEquipment = {};
        d.standardEquipment.forEach((eq, idx) => {
          enData.productData[d.slug].standardEquipment[`eq_${idx}`] = eq;
        });
      }
      
      if (d.keySpecs) {
        if (!enData.productData[d.slug].keySpecs) enData.productData[d.slug].keySpecs = {};
        d.keySpecs.forEach((ks, idx) => {
          enData.productData[d.slug].keySpecs[`label_${idx}`] = ks.label;
          enData.productData[d.slug].keySpecs[`value_${idx}`] = ks.value;
        });
      }
      
      if (d.hardware) {
        if (!enData.productData[d.slug].hardware) enData.productData[d.slug].hardware = {};
        d.hardware.forEach((hw, idx) => {
          enData.productData[d.slug].hardware[`name_${idx}`] = hw.name;
          enData.productData[d.slug].hardware[`type_${idx}`] = hw.type;
        });
      }

      if (d.accessories) {
        if (!enData.productData[d.slug].accessories) enData.productData[d.slug].accessories = {};
        d.accessories.forEach((acc, idx) => {
          enData.productData[d.slug].accessories[`name_${idx}`] = acc.name;
          enData.productData[d.slug].accessories[`description_${idx}`] = acc.description;
        });
      }
    }
  });

  fs.writeFileSync(enLocalesPath, JSON.stringify(enData, null, 2));
  console.log('Successfully extracted product data to en.json');
}

extract().catch(console.error);
