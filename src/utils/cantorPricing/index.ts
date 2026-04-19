// Cantor pricing engine — public entry point.
//
// priceConfiguration() takes a configurator input and returns a breakdown
// that mirrors what Cantor would store in AUFPREIS. Currency conversion via
// PREISZYK is applied on the VK total so the dealer-facing number is in
// their pricelist currency (typically EUR/CHF).

import { buildContext } from './context';
import { evaluateSchema, type SchemaResult, type SchemaLine } from './schema';
import { evaluatePanes, type PaneResult, type PaneLine } from './panes';
import { CantorMirror } from './mirror';
import type { ConfiguratorInput } from './input';

export type { ConfiguratorInput, SchemaResult, SchemaLine, PaneResult, PaneLine };
export { CantorMirror };

export interface PriceBreakdown {
  ek_pln: number;          // EK total in PLN (base + panes + ...)
  vk_pln: number;          // VK total in PLN
  vk_local: number;        // VK total in dealer currency
  currency: string;        // dealer currency code (EUR, CHF, ...)
  faktor: number;          // PREISZYK.FAKTOR applied
  baseLine: SchemaResult;  // SCHEMA 41 (base window) breakdown
  panes: PaneResult;       // SCHEMA 51 per-pane breakdown
}

export function priceConfiguration(input: ConfiguratorInput, mirror: CantorMirror): PriceBreakdown {
  // Base window (SCHEMA 41) — evaluate EK and VK independently. In practice
  // all SCHEMA 41 formulas are PREISART='E' only (VK is derived via PREISZYK),
  // so vkResult is empty and we fall through to the PLN × FAKTOR conversion.
  const ctxE = buildContext(input, mirror);
  const ekResult = evaluateSchema(41, 2301, 'E', ctxE, mirror);

  const ctxV = buildContext(input, mirror);
  const vkResult = evaluateSchema(41, 2301, 'V', ctxV, mirror);

  // Panes (SCHEMA 51) — PREISART='E' only; Cantor uses the same PLN value for
  // both EK and VK in AUFPREIS, then applies PREISZYK.FAKTOR to derive the
  // dealer-currency VK.
  const panes = evaluatePanes(input, 'E', mirror);

  // Pricelist resolution: explicit KURZBEZ wins (for reproducing historical
  // orders). Otherwise auto-pick the active pricelist for the dealer's
  // currency on the current date — no hardcoded KURZBEZ required.
  const zyk = input.dealer.pricelistKurzbez
    ? mirror.preiszyk(input.dealer.pricelistKurzbez)
    : mirror.activePreiszyk(input.dealer.currency ?? 'EUR');
  if (!zyk) {
    throw new Error(
      `No PREISZYK row resolved: ${input.dealer.pricelistKurzbez ?? `active ${input.dealer.currency ?? 'EUR'} pricelist`}`,
    );
  }

  const ek_pln_total = ekResult.total + panes.total;
  const vk_pln_total = (vkResult.total > 0 ? vkResult.total : ekResult.total) + panes.total;
  const vk_local = vk_pln_total * zyk.FAKTOR;

  return {
    ek_pln: ek_pln_total,
    vk_pln: vk_pln_total,
    vk_local,
    currency: zyk.WAEHRUNG,
    faktor: zyk.FAKTOR,
    baseLine: ekResult,
    panes,
  };
}
