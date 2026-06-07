const puppeteer = require('puppeteer');

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log("Navigating to SLE201 page...");
  await page.goto('http://localhost:5173/viewer?typology=SLE201&w=2000&h=2100', { waitUntil: 'networkidle2' });

  console.log("Waiting 2 seconds for page to stabilize...");
  await new Promise(r => setTimeout(r, 2000));

  console.log("Stopping auto-rotation by clicking canvas...");
  await page.click('canvas').catch((e) => console.log("Canvas click failed:", e.message));

  console.log("Waiting 3 seconds for assets to fully load...");
  await new Promise(r => setTimeout(r, 3000));

  // Screenshot 1: Closed state
  await page.screenshot({ path: 'scratch/screenshot_sle201_closed.jpg' });
  console.log("Closed state screenshot saved.");

  // Click the hotspot to open sash
  console.log("Clicking the hotspot to start opening animation...");
  const hotspotSelector = 'div[title="Open sash"]';
  await page.waitForSelector(hotspotSelector);
  await page.click(hotspotSelector);

  // Wait 0.4 seconds to capture handle rotating mid-way
  console.log("Waiting 0.4 seconds for mid-rotation...");
  await new Promise(r => setTimeout(r, 4000 * 0.4 * 0.2)); // 0.8 seconds total duration for handle rotation (phase 1), 0.4s is halfway
  // Actually, handle rotation is phase 1, which has duration 0.8s.
  // Wait, let's wait 0.4 seconds:
  await new Promise(r => setTimeout(r, 400));
  
  await page.screenshot({ path: 'scratch/screenshot_sle201_rotating.jpg' });
  console.log("Rotating state screenshot saved.");

  // Wait 4 seconds for full open
  console.log("Waiting 4 seconds for sash to fully open...");
  await new Promise(r => setTimeout(r, 4000));

  await page.screenshot({ path: 'scratch/screenshot_sle201_open.jpg' });
  console.log("Open state screenshot saved.");

  await browser.close();
  console.log("Browser closed.");
})().catch(err => {
  console.error("Fatal error:", err);
});
