import { resolve } from 'node:path';
import { CantorMirror } from './src/utils/cantorPricing/mirror.js';
import { priceConfiguration } from './src/utils/cantorPricing/index.js';

const mirror = new CantorMirror(resolve(process.cwd(), 'src/data/cantor/cantor.sqlite'));

const input = {
  article: 'F100',
  profilsatz: 'IG5',
  materialart: 2,
  beschvar: 'UR-P',
  width_mm: 1000,
  height_mm: 1000,
  sashCount: 1,
  openings: ['UR-P'],
  color: { type: 'DEK-DEK', code: '0006' },
  frameProfile: '50001',
  sashProfile: '50011',
  glazing: { 
    code: '2-24', 
    panes: ['FL4', 'T4'], 
    spacer: 'S' 
  },
  hardware: {},
  schwelle: 0,
  dealer: { kundenNr: 1008, pricelistKurzbez: 'EUR23011', land: 'CH' }
};

try {
  const result = priceConfiguration(input, mirror);
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(e);
}
