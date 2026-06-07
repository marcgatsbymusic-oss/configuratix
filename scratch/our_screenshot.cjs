const puppeteer = require('puppeteer');

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: true });
  
  // Capture F100T
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    console.log("Navigating to F100T viewer page...");
    await page.goto('http://localhost:5173/viewer?typology=F100T&w=1000&h=1000', { waitUntil: 'networkidle2' }).catch(err => {
      console.error("Navigation failed:", err.message);
    });
    console.log("Waiting 1 second before clicking to stop auto-rotation...");
    await new Promise(r => setTimeout(r, 1000));
    console.log("Stopping auto-rotation for F100T...");
    await page.click('canvas').catch((e) => console.log("Click failed:", e.message));
    console.log("Waiting 5 seconds for F100T assets to load...");
    await new Promise(r => setTimeout(r, 5000));
    await page.screenshot({ path: 'scratch/screenshot_f100t_direct.jpg' });
    console.log("F100T screenshot saved.");
    await page.close();
  }

  // Capture SLE201
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    console.log("Navigating to SLE201 viewer page...");
    await page.goto('http://localhost:5173/viewer?typology=SLE201&w=2000&h=2100', { waitUntil: 'networkidle2' }).catch(err => {
      console.error("Navigation failed:", err.message);
    });
    console.log("Waiting 1 second before clicking to stop auto-rotation...");
    await new Promise(r => setTimeout(r, 1000));
    console.log("Stopping auto-rotation for SLE201...");
    await page.click('canvas').catch((e) => console.log("Click failed:", e.message));
    console.log("Waiting 5 seconds for SLE201 assets to load...");
    await new Promise(r => setTimeout(r, 5000));
    await page.screenshot({ path: 'scratch/screenshot_sle201_direct.jpg' });
    console.log("SLE201 screenshot saved.");
    await page.close();
  }
  
  await browser.close();
  console.log("Browser closed.");
})().catch(err => {
  console.error("Fatal error:", err);
});
