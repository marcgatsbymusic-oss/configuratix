import { buildContext } from './src/utils/cantorPricing/context.js';
import golden from './tests/pricing/goldens/auf_1500045_1.json' assert { type: 'json' };
import { CantorMirror } from './src/utils/cantorPricing/index.js';
import { evaluateSchema } from './src/utils/cantorPricing/schema.js';

const mirror = new CantorMirror('./tests/pricing/fixtures/cantor.fixture.sqlite');
const c = buildContext(golden.input, mirror);
c.vars.set('FELDNR', 1);
c.vars.set('B', 600);
c.vars.set('H', 1300);

import { parse } from './src/utils/cantorFormula/parser.js';
import { evalExpr } from './src/utils/cantorFormula/evaluator.js';

console.log('MAX(ROUND) = ', evalExpr(parse(`MAX(ROUND(B/1000 * H/1000,2), 0.5)`), c));
console.log('PMATALL = ', evalExpr(parse(`PMATALL("ALL_DOD", "SZYBY", "INNE", "ZatepienieKr", 1, 1)`), c));
console.log('ANZAHL = ', c.vars.get('ANZAHL_SCHEIBEN'), 'ES1201=', c.vars.get('ES1201'), 'SCHEIBE_TYP_1=', c.vars.get('SCHEIBE_TYP_1'));

console.log('PART1 = ', evalExpr(parse(`IIF(ANZAHL_SCHEIBEN>=1 AND SCHEIBE_TYP_1<>8 AND ES1201="J",1,0)`), c));
console.log('PART2 = ', evalExpr(parse(`IIF(ANZAHL_SCHEIBEN>=2 AND SCHEIBE_TYP_2<>8 AND ES1202="J",1,0)`), c));

mirror.close();
