// Request handler for POST /api/price.
//
// Lives in scripts/ (Node-only) so the browser bundle never imports
// better-sqlite3. Called by the Vite dev middleware plugin (see vite.config.ts)
// and by the Supabase Edge Function adapter in prod — both pass a raw request
// body and expect a JSON response payload.

import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { CantorMirror } from '../../src/utils/cantorPricing/mirror';
import { priceConfiguration } from '../../src/utils/cantorPricing/index';
import type { PricingApiRequest, PricingApiResponse, PricingApiError } from '../../src/utils/cantorPricing/pricingApi';

// Singleton mirror — sqlite is threadsafe for reads and much cheaper to reuse.
let mirror: CantorMirror | null = null;

function getMirror(): CantorMirror {
  if (mirror) return mirror;
  const dbPath = resolve(process.cwd(), 'src', 'data', 'cantor', 'cantor.sqlite');
  if (!existsSync(dbPath)) {
    throw new Error(`cantor.sqlite missing at ${dbPath}. Run: npm run cantor:sync`);
  }
  mirror = new CantorMirror(dbPath);
  return mirror;
}

export async function handlePriceRequest(body: string): Promise<PricingApiResponse | PricingApiError> {
  let req: PricingApiRequest;
  try {
    req = JSON.parse(body);
  } catch {
    return { ok: false, error: 'invalid JSON body' };
  }
  if (!req?.input) return { ok: false, error: 'missing "input" field' };

  try {
    const breakdown = priceConfiguration(req.input, getMirror());
    return {
      ok: true,
      ek_pln: breakdown.ek_pln,
      vk_pln: breakdown.vk_pln,
      vk_local: breakdown.vk_local,
      currency: breakdown.currency,
      faktor: breakdown.faktor,
      baseTotal: breakdown.baseLine.total,
      panesTotal: breakdown.panes.total,
      lines: breakdown.baseLine.lines.map(l => ({
        formelText: l.formelText,
        preisgruppe: l.preisgruppe,
        value: l.value,
      })),
      paneLines: breakdown.panes.lines.map(p => ({
        code: p.code,
        articleId: p.articleId,
        value: p.value,
      })),
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
