import { buildContext } from './src/utils/cantorPricing/context.js';
import golden from './tests/pricing/goldens/auf_1500045_1.json' assert { type: 'json' };
import { CantorMirror } from './src/utils/cantorPricing/index.js';
import { evaluateSchema } from './src/utils/cantorPricing/schema.js';

const mirror = new CantorMirror('./tests/pricing/fixtures/cantor.fixture.sqlite');
console.log('Running detailed test evaluation...');

const c = buildContext(golden.input, mirror);
c.vars.set('FELDNR', 1);

const schema45 = evaluateSchema(45, 2301, 'E', c, mirror);
console.log('SCHEMA 45:', schema45.lines);

mirror.close();
