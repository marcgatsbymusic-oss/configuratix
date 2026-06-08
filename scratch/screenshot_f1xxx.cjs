const puppeteer = require('puppeteer');

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  
  console.log("Navigating to F1XXX page...");
  await page.goto('http://localhost:5173/f1xxx', { waitUntil: 'networkidle2' }).catch(err => {
    console.error("Navigation failed:", err.message);
  });
  
  console.log("Waiting 3 seconds for rendering...");
  await new Promise(r => setTimeout(r, 3000));
  
  const screenshotPath = 'C:\\Users\\Shadow\\.gemini\\antigravity\\brain\\f765fd4e-f0e3-4cc0-a0be-3daa66d21b3d\\screenshot_f1xxx_debug.png';
  await page.screenshot({ path: screenshotPath });
  console.log("Screenshot saved to:", screenshotPath);
  
  await browser.close();
})().catch(err => {
  console.error("Fatal error:", err);
});
