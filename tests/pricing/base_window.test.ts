// Phase A + B golden: AUFNR 1500041 / pos 1 — F104 IGLO5 white fixed window.
//
// Verifies that the formula interpreter reproduces what Cantor stored in
// AUFPREIS for a real order, including pane line items (SCHEMA 51).

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { resolve } from 'node:path';
import { readFileSync, existsSync } from 'node:fs';
import { CantorMirror, priceConfiguration, type ConfiguratorInput } from '../../src/utils/cantorPricing';

const DB_PATH = resolve(__dirname, '..', '..', 'src', 'data', 'cantor', 'cantor.sqlite');
const GOLDEN_PATH = resolve(__dirname, 'goldens', 'auf_1500041_1.json');

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

describe('AUFNR 1500041 — F104 IGLO5 white fixed', () => {
  let mirror: CantorMirror;
  let golden: Golden;

  beforeAll(() => {
    if (!existsSync(DB_PATH)) {
      throw new Error(`SQLite mirror missing at ${DB_PATH}. Run: npm run cantor:sync`);
    }
    mirror = new CantorMirror(DB_PATH);
    golden = JSON.parse(readFileSync(GOLDEN_PATH, 'utf8'));
  });

  afterAll(() => mirror?.close());

  it('SCHEMA 41 base EK matches Cantor', () => {
    const result = priceConfiguration(golden.input, mirror);
    expect(result.baseLine.total).toBe(golden.expected.ek_pln_baseSchema41);
  });

  it('Pane sub-total matches Cantor', () => {
    const result = priceConfiguration(golden.input, mirror);
    expect(result.panes.total).toBeCloseTo(golden.expected.panes_ek_delta, 2);
  });

  it('Total EK matches AUFPOS.EKPOSPREIS', () => {
    const result = priceConfiguration(golden.input, mirror);
    expect(result.ek_pln).toBeCloseTo(golden.expected.ek_pln_total_with_panes, 2);
  });

  it('Total VK matches AUFPOS.VKPOSPREIS within €0.05', () => {
    const result = priceConfiguration(golden.input, mirror);
    expect(result.currency).toBe('EUR');
    expect(result.vk_local).toBeCloseTo(golden.expected.vk_eur_total_with_panes_approx, 1);
  });
});
