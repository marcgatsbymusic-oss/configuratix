const puppeteer = require('puppeteer');
const path = require('path');

const ARTIFACTS_DIR = 'C:\\Users\\Shadow\\.gemini\\antigravity\\brain\\23f845a7-6cd8-4874-8c5b-e9aead900fcf';

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  console.log("Navigating to debug-pricing page on port 5174...");
  await page.goto('http://localhost:5174/debug-pricing', { waitUntil: 'networkidle2' });

  console.log("Waiting 4 seconds for 3D visualizer to load...");
  await new Promise(r => setTimeout(r, 4000));

  // Take first screenshot (default layout)
  console.log("Saving default view screenshot...");
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'debug_pricing_default.jpg') });

  // Click on the paint deck trigger
  console.log("Locating and clicking paint-deck trigger...");
  const paintDeckClicked = await page.evaluate(() => {
    const btn = document.querySelector('[title="Toggle Dual-Color Palette Overlay"]');
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log(`Paint-deck trigger clicked: ${paintDeckClicked}`);

  console.log("Waiting 1.5 seconds for wheel fan transition...");
  await new Promise(r => setTimeout(r, 1500));

  // Take second screenshot (wheels fanned open)
  console.log("Saving wheels-open view screenshot...");
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'debug_pricing_wheels_open.jpg') });

  // Click paint deck again to close it
  console.log("Closing paint-deck...");
  await page.evaluate(() => {
    const btn = document.querySelector('[title="Toggle Dual-Color Palette Overlay"]');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // Hover/Click on the AR button options to expand it
  console.log("Locating and clicking AR options...");
  const arClicked = await page.evaluate(() => {
    const btn = document.querySelector('[title="AR Preview Options"]');
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log(`AR options clicked: ${arClicked}`);

  console.log("Waiting 1 second for AR menu expansion...");
  await new Promise(r => setTimeout(r, 1000));

  // Click on scenery backdrop button inside AR options
  console.log("Locating and clicking Scenery backdrop button...");
  const sceneryClicked = await page.evaluate(() => {
    const btn = document.querySelector('[title="Scenery backdrop"]');
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log(`Scenery button clicked: ${sceneryClicked}`);

  console.log("Waiting 1 second for scenery overlay backdrop to render...");
  await new Promise(r => setTimeout(r, 1000));

  // Take third screenshot (scenery options overlay visible)
  console.log("Saving scenery-open view screenshot...");
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'debug_pricing_scenery_open.jpg') });

  await browser.close();
  console.log("Puppeteer workflow completed successfully!");
})().catch(err => {
  console.error("Puppeteer run failed:", err);
  process.exit(1);
});
