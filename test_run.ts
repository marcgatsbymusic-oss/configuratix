import { handlePriceRequest } from './scripts/cantor/pricingServer.ts';
import { CantorMirror } from './src/utils/cantorPricing/mirror.ts';
import { buildContext } from './src/utils/cantorPricing/context.ts';

async function run() {
  const input = {
      article: 'F200',
      profilsatz: 'IG5',
      materialart: 2,
      beschvar: 'R; UR-P',
      width_mm: 1200,
      height_mm: 1300,
      sashCount: 2,
      openings: ['R', 'UR'],
      color: { code: 'W-W' },
      frameProfile: '50001',
      sashProfile: '50011',
      glazing: { code: '3-40', panes: ['T4', 'FL6', 'ADB6H'], spacer: 'S16' },
      hardware: {
        safetyClass: '4ZA',
        handleType: 'KwadratK',
        handleColor: 'bialy',
        coverColor: 'bialy'
      },
      schwelle: 0,
      dealer: { kundenNr: 1008, pricelistKurzbez: 'EUR23011', land: 'CH' },
  };
  const mirror = new CantorMirror('src/data/cantor/cantor.sqlite');
  const ctx = buildContext(input as any, mirror);
  console.log("MacierzOku is", ctx.resolve('ART_1199_MacierzOku'));
  console.log("BRB", ctx.resolve('BRB'), "BRH", ctx.resolve('BRH'));
  console.log("FELDB", ctx.resolve('FELDB'));
  
  const { handlePriceRequest } = await import('./scripts/cantor/pricingServer.ts');
  const req = JSON.stringify({
    input: {
      article: 'F200',
      profilsatz: 'IG5',
      width_mm: 1200,
      height_mm: 1300,
      color: { code: 'W-W' },
      sashCount: 2,
      openings: ['R', 'UR'],
      glazing: { code: '3-40' },
      hardware: { safetyClass: '4ZA' }
    }
  });
  
  const res = await handlePriceRequest(req);
  console.dir(res, {depth: null});
}
run();
