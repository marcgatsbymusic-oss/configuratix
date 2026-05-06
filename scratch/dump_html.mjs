import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('Navigating to the Vercel URL and waiting for network to be idle...');
  await page.goto('https://fantastic-octo-giggle-five.vercel.app/products/iglo-edge', { waitUntil: 'networkidle' });
  
  // Wait an extra 3 seconds to ensure all React components (like the visualizer) have fully mounted
  console.log('Waiting 3s for React hydration...');
  await page.waitForTimeout(3000);
  
  console.log('Extracting fully rendered HTML...');
  const html = await page.content(); // Captures the fully evaluated DOM
  
  const outputPath = './iglo-edge-rendered.html';
  fs.writeFileSync(outputPath, html, 'utf8');
  
  console.log(`Saved successfully to ${outputPath}`);
  await browser.close();
})();
