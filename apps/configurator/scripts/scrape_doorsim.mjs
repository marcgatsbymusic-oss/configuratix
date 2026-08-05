import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://wizualizator.drutex.pl';
const OUTPUT_DIR = './public/doorsim-assets/scraped_doors';

async function executeScraper() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('response', async (response) => {
    const url = response.url();
    // Catch anything that looks like JSON or config
    if (response.headers()['content-type']?.includes('application/json')) {
       console.log(`[JSON] ${url}`);
       try {
           const body = await response.text();
           if (body.includes('model') || body.length > 5000) {
               fs.mkdirSync(OUTPUT_DIR, { recursive: true });
               fs.writeFileSync(path.join(OUTPUT_DIR, 'drutex_config.json'), body);
               console.log('✅ SAVED LARGE JSON PAYLOAD!');
           }
       } catch (e) {}
    }
  });

  console.log(`Navigating to ${BASE_URL}...`);
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  
  // Wait for the app to initialize
  await page.waitForTimeout(5000);

  // Take a screenshot to see what it's rendering
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'debug_screenshot.png') });
  
  console.log('Done!');
  await browser.close();
}

executeScraper().catch(console.error);
