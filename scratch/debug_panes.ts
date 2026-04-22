import { readFileSync } from 'fs';
import { resolve } from 'path';
import { CantorMirror, priceConfiguration } from '../src/utils/cantorPricing';

const mirror = new CantorMirror('tests/pricing/fixtures/cantor.fixture.sqlite');
const golden = JSON.parse(readFileSync('tests/pricing/goldens/auf_1500008_2.json', 'utf8'));

// Apply the same fix as the test
golden.input.openings = ['R-SBP-L', 'UR-L', 'UR-P', 'UR-SC-P'];

const result = priceConfiguration(golden.input, mirror);
console.log('Result total:', result.panes.total);
console.log('Result lines:', JSON.stringify(result.panes.lines, null, 2));

mirror.close();
