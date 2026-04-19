import { CantorMirror } from './src/utils/cantorPricing/mirror.ts';
import { priceConfiguration } from './src/utils/cantorPricing/index.ts';
import { resolve } from 'node:path';

const mirror = new CantorMirror(resolve(process.cwd(), 'src', 'data', 'cantor', 'cantor.sqlite'));
const input = {
  article: 'F100', profilsatz: 'IGECL', materialart: 2, beschvar: 'FIX',
  width_mm: 1500, height_mm: 1500, sashCount: 1, openings: ['F'],
  color: { code: 'W-W' },
  frameProfile: '50001', sashProfile: '50011',
  glazing: { code: '2-24', panes: ['FL4', 'T4'], spacer: 'S16' },
  schwelle: 0,
  dealer: { kundenNr: 1008, pricelistKurzbez: 'EUR23011', land: 'CH' },
};
const r = priceConfiguration(input, mirror);
console.log('Base SCHEMA 41 total:', r.baseLine.total);
for (const line of r.baseLine.lines) {
  console.log(`  Formula [${line.sortIndex}] ${line.formelText}: ${line.value}`);
  console.log(`     Raw Formel: ${line.formel}`);
}
mirror.close();
