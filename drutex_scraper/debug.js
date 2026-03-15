const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 1000 });
  
  console.log("Navigating...");
  await page.goto('https://www.drutex.es/es/produkty/iglo-edge.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000); // Wait 5s for any heavy scripts
  
  console.log("Scrolling...");
  await page.evaluate(() => window.scrollTo(0, 3000));
  await page.waitForTimeout(2000);
  await page.evaluate(() => window.scrollTo(0, 5000));
  await page.waitForTimeout(2000);

  console.log("Taking screenshot...");
  await page.screenshot({ path: '/Users/marckeller/Desktop/antigravravity/drutex_scraper/debug.png', fullPage: true });

  const html = await page.content();
  const fs = require('fs');
  fs.writeFileSync('page_dump.html', html);
  
  console.log("Done");
  await browser.close();
})();
