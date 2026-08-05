import { CantorMirror } from '../../src/utils/cantorPricing/mirror.ts';
import { priceConfiguration } from '../../src/utils/cantorPricing/index.ts';
import { resolve } from 'node:path';

const mirror = new CantorMirror(resolve(process.cwd(), 'src', 'data', 'cantor', 'cantor.sqlite'));
const input = {
  article: 'F104', profilsatz: 'IG5', materialart: 2, beschvar: 'FIX',
  width_mm: 3200, height_mm: 700, sashCount: 1, openings: ['F'],
  color: { code: 'W-W' },
  frameProfile: '50001', sashProfile: '50011',
  glazing: { code: '2-24', panes: ['FL4', 'T4'], spacer: 'S16' },
  schwelle: 0,
  dealer: { kundenNr: 1008, pricelistKurzbez: 'EUR23011', land: 'CH' },
};
const r = priceConfiguration(input, mirror);
console.log('Base SCHEMA 41 total:', r.baseLine.total);
console.log('Pane total:', r.panes.total);
for (const p of r.panes.lines) {
  console.log(`  ${p.code} (ARTIKELID=${p.articleId}): ${p.value.toFixed(2)} PLN`);
  console.log(`    PREISFELDS:`, p.preisfelds);
}
mirror.close();
