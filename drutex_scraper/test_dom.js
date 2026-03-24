const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  
  await page.goto('https://www.drutex.es/es/produkty/iglo-edge.html', { waitUntil: 'load' });
  await page.waitForTimeout(2000);

  // Scroll down to load all swatches
  for (let i = 0; i < 5; i++) {
     await page.evaluate(() => window.scrollBy(0, 1000));
     await page.waitForTimeout(500);
  }

  const swatches = await page.$$('.color-sample');
  console.log(`Found ${swatches.length} swatches.`);

  if (swatches.length > 0) {
      // Click first swatch
      await swatches[0].click({ force: true });
      await page.waitForTimeout(2000);
      
      // Look for the main window image container
      const html = await page.evaluate(() => {
          // Find the container that has the window image
          const container = document.querySelector('.system-presentation, .window-presentation-wrapper, .product-presentation');
          return container ? container.outerHTML : 'Could not find presentation container';
      });
      console.log(html.substring(0, 1500)); // Log a snippet
  }

  await browser.close();
})();
