import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://www.drutex.eu/en/products/iglo5-doors-pvc.html');
  
  // Wait for the colors section to load
  await page.waitForSelector('#colors');
  
  const colors = await page.evaluate(() => {
    // Let's just find the big image that changes when colors are clicked
    // and let's find the color swatches.
    const swatches = Array.from(document.querySelectorAll('.product-color-item'));
    return swatches.map(s => {
      return {
        code: s.getAttribute('data-code'),
        name: s.getAttribute('data-name'),
        img: s.getAttribute('data-img'),
        bg: s.getAttribute('data-bg')
      };
    });
  });

  console.log(JSON.stringify(colors, null, 2));
  await browser.close();
})();
