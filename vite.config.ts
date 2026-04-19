import { defineConfig, type Connect, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import type { IncomingMessage, ServerResponse } from 'node:http';

// Dev-time pricing endpoint. Mirrors the contract the Supabase Edge Function
// will serve in production so the browser client code does not change.
//
// Loads the Node-only engine lazily so the browser bundle never pulls in
// better-sqlite3.
function cantorPricingApi(): Plugin {
  return {
    name: 'cantor-pricing-api',
    apply: 'serve',
    configureServer(server) {
      const handler: Connect.NextHandleFunction = async (req: IncomingMessage, res: ServerResponse, next) => {
        if (req.url !== '/api/price' || req.method !== 'POST') return next();
        const chunks: Buffer[] = [];
        for await (const c of req) chunks.push(c as Buffer);
        const body = Buffer.concat(chunks).toString('utf8');
        try {
          const { handlePriceRequest } = await import('./scripts/cantor/pricingServer');
          const result = await handlePriceRequest(body);
          res.setHeader('content-type', 'application/json');
          res.statusCode = result.ok ? 200 : 400;
          res.end(JSON.stringify(result));
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err) }));
        }
      };
      server.middlewares.use(handler);
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    cantorPricingApi(),
  ],
});
