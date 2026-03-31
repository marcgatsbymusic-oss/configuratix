import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  console.log('Launching interactive Chromium...');
  const browser = await puppeteer.launch({ 
      headless: false, 
      defaultViewport: null,
      args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  let interceptedData = [];
  const outputFile = path.join(__dirname, '../src/data/raw_drutex_intercept.json');
  
  // Wipe old file
  if (fs.existsSync(outputFile)) {
      fs.unlinkSync(outputFile);
  }

  // Intercept all background JSON requests the portal makes
  page.on('response', async (res) => {
    const url = res.url();
    // Only capture API requests related to grids/products
    if (res.request().resourceType() === 'fetch' || res.request().resourceType() === 'xhr') {
       if (url.includes('drutex') && !url.includes('.css') && !url.includes('.js')) {
           try {
               const json = await res.json();
               console.log(`\n[API DATA INTERCEPTED] -> ${url.split('/').pop()}`);
               interceptedData.push({ timestamp: new Date().toISOString(), url, data: json });
               
               // Save progressively so nothing is lost
               fs.writeFileSync(outputFile, JSON.stringify(interceptedData, null, 2));
               console.log(`Saved intercept stream to src/data/raw_drutex_intercept.json! (${interceptedData.length} total payloads)`);
           } catch(e) {
               // Non-JSON response or missing body, safely ignore
           }
       }
    }
  });

  console.log('\n======================================================');
  console.log('1. Please log in with marc@ventanas.shop using the browser window.');
  console.log('2. Navigate to the Outlet section.');
  console.log('3. SLOWLY click through the "Next Page" pagination buttons on the grid.');
  console.log('4. Look at this terminal: you will see "API DATA INTERCEPTED" as it harvests.');
  console.log('5. Once you have clicked through all pages, simply CLOSE the browser.');
  console.log('======================================================\n');

  await page.goto('https://e-portal.drutex.pl/login');

  browser.on('disconnected', () => {
     console.log('\nBrowser explicitly closed by User. Harvesting complete.');
     console.log(`Data permanently saved to: ${outputFile}`);
     process.exit(0);
  });
})();
