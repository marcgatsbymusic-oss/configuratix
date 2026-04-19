// Stage 3 Golden: AUFNR 1500044 / pos 1 — F100 IGLO5 DEK-DEK (Golden Oak on both sides) fixed window.
//
// Verifies that the color classification handles the core (fn_CenaDopRdzen) and foil (fn_CenaDopKolor)
// percentage lookups properly and resolves the correct final EK/VK pricing.

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { resolve } from 'node:path';
import { readFileSync, existsSync } from 'node:fs';
import { CantorMirror, priceConfiguration, type ConfiguratorInput } from '../../src/utils/cantorPricing';

const FIXTURE_PATH = resolve(__dirname, 'fixtures', 'cantor.fixture.sqlite');
const FULL_PATH = resolve(__dirname, '..', '..', 'src', 'data', 'cantor', 'cantor.sqlite');
const GOLDEN_PATH = resolve(__dirname, 'goldens', 'auf_1500044_1.json');

interface Golden {
  input: ConfiguratorInput;
  expected: {
    ek_pln_baseSchema41: number;
    vk_eur_baseSchema41_approx: number;
    ek_pln_total_with_panes: number;
    vk_eur_total_with_panes_approx: number;
    panes_ek_delta: number;
    tolerance_eur: number;
  };
}

describe('AUFNR 1500044 — F100 IGLO5 DEK-DEK fixed', () => {
  let mirror: CantorMirror;
  let golden: Golden;

  beforeAll(() => {
    const dbPath = existsSync(FIXTURE_PATH) ? FIXTURE_PATH : FULL_PATH;
    if (!existsSync(dbPath)) {
      throw new Error(
        `No Cantor SQLite DB available at ${FIXTURE_PATH} or ${FULL_PATH}. ` +
        `Run: npm run cantor:fixture (needs full mirror from npm run cantor:sync)`,
      );
    }
    mirror = new CantorMirror(dbPath);
    golden = JSON.parse(readFileSync(GOLDEN_PATH, 'utf8'));
  });

  afterAll(() => mirror?.close());

  it('Color Core/Surcharge (SCHEMA 41) applies correctly', () => {
    const result = priceConfiguration(golden.input, mirror);
    expect(result.baseLine.total).toBe(1064.46); // 942 + 2% + 11%
  });

  it('Pane sub-total matches Cantor', () => {
    const result = priceConfiguration(golden.input, mirror);
    expect(result.panes.total).toBeCloseTo(golden.expected.panes_ek_delta, 2);
  });

  it('Total EK matches AUFPOS.EKPOSPREIS', () => {
    const result = priceConfiguration(golden.input, mirror);
    expect(result.ek_pln).toBeCloseTo(golden.expected.ek_pln_total_with_panes, 2);
  });

  it('Total VK matches AUFPOS.VKPOSPREIS', () => {
    const result = priceConfiguration(golden.input, mirror);
    expect(result.currency).toBe('EUR');
    expect(result.vk_local).toBeCloseTo(golden.expected.vk_eur_total_with_panes_approx, 1);
  });
});
