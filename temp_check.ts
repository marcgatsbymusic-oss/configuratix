import { priceConfiguration, CantorMirror } from './src/utils/cantorPricing/index.js';
import { buildContext } from './src/utils/cantorPricing/context.js';
import golden from './tests/pricing/goldens/auf_1500041_1.json' assert { type: 'json' };
import { evaluateSchema } from './src/utils/cantorPricing/schema.js';

const mirror = new CantorMirror('./tests/pricing/fixtures/cantor.fixture.sqlite');
console.log('Running detailed test evaluation...');

const c = buildContext(golden.input, mirror);
console.log('vars:', JSON.stringify(Object.fromEntries(c.vars.entries()), null, 2));

const schema41 = evaluateSchema(41, 2301, 'E', c, mirror);
console.log('SCHEMA 41:', schema41.lines);

mirror.close();
