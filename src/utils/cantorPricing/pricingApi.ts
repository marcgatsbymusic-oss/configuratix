// HTTP request/response contract for the pricing service.
//
// Same shape will be served by the Vite dev middleware today and a Supabase
// Edge Function in production. Keeping the contract in one file means the
// only thing that changes is the URL + auth header.

import type { ConfiguratorInput } from './input';

export interface PricingApiRequest {
  input: ConfiguratorInput;
}

export interface PricingApiResponse {
  ok: true;
  ek_pln: number;
  vk_pln: number;
  vk_local: number;
  currency: string;
  faktor: number;
  baseTotal: number;       // SCHEMA 41 base window subtotal in PLN
  panesTotal: number;      // SCHEMA 51 panes subtotal in PLN
  lines: Array<{
    formelText: string | null;
    preisgruppe: string | null;
    value: number;
  }>;
  paneLines: Array<{
    code: string;
    articleId: number;
    value: number;
  }>;
}

export interface PricingApiError {
  ok: false;
  error: string;
}

// Default endpoint used by the browser client. Override via the
// VITE_PRICING_API_URL env var (e.g. Supabase Edge Function URL in prod).
export const DEFAULT_PRICING_ENDPOINT =
  (typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_PRICING_API_URL)
    || '/api/price';

export async function fetchPrice(req: PricingApiRequest, endpoint = DEFAULT_PRICING_ENDPOINT): Promise<PricingApiResponse> {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(req),
  });
  const json = (await res.json()) as PricingApiResponse | PricingApiError;
  if (!res.ok || !json.ok) {
    const msg = (json as PricingApiError).error ?? res.statusText;
    throw new Error(`pricing API: ${msg}`);
  }
  return json;
}
