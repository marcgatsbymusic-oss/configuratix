import { chromium } from 'playwright';
import fs from 'fs';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log("Navigating...");
  await page.goto('https://fensternorm.com/konfigurator/fenster/kunststoff/trocal-70-eco/c1', { waitUntil: 'networkidle' });

  console.log("Waiting 4s...");
  await page.waitForTimeout(4000);

  const text = await page.evaluate(() => document.body.innerText);
  fs.writeFileSync('fensternorm_text.txt', text);
  
  // Also dump window.__INITIAL_STATE__ if it exists
  const state = await page.evaluate(() => {
    for (let key of Object.keys(window)) {
      if (key.toLowerCase().includes('state') || typeof window[key] === 'object' && window[key] !== null && window[key].products) {
        return { key, data: window[key] };
      }
    }
    return null;
  });
  
  if (state) {
    fs.writeFileSync('fensternorm_state.json', JSON.stringify(state, null, 2));
  }

  console.log("Done");
  await browser.close();
}

run().catch(console.error);
