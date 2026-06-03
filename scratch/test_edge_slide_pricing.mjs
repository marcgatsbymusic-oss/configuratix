import { resolve } from 'node:path';
import { CantorMirror } from '../src/utils/cantorPricing/mirror.js';
import { priceConfiguration } from '../src/utils/cantorPricing/index.js';

const mirror = new CantorMirror(resolve(process.cwd(), 'src/data/cantor/cantor.sqlite'));

const input = {
  article: 'SLE201',
  profilsatz: 'IGEDGE SL',
  materialart: 2,
  beschvar: 'F',
  width_mm: 1500,
  height_mm: 2000,
  sashCount: 1,
  openings: ['F'],
  color: { type: 'W-W', code: '0001' },
  frameProfile: '50001',
  sashProfile: '50011',
  infills: [{ 
    code: '3-40', 
    panes: ['FL4', 'T4', 'T4'], 
    frameStyle: 'S' 
  }],
  hardware: {},
  schwelle: 0,
  dealer: { kundenNr: 1008, pricelistKurzbez: 'EUR23011', land: 'CH' }
};

try {
  const result = priceConfiguration(input, mirror);
  console.log("SUCCESS!");
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error("FAILED WITH ERROR:", e);
}
mirror.close();
