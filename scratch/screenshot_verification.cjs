const puppeteer = require('puppeteer');

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  
  console.log("Navigating to SLE201 viewer page on localhost with 2000x2100 dimensions...");
  // Explicitly set w=2000 and h=2100 in the query params
  await page.goto('http://localhost:5173/viewer?typology=SLE201&w=2000&h=2100', { waitUntil: 'networkidle2' }).catch(err => {
    console.error("Navigation failed:", err.message);
  });
  
  console.log("Waiting 8 seconds for 3D textures and assets to load...");
  await new Promise(r => setTimeout(r, 8000));
  
  const outputPath = 'C:/Users/Shadow/.gemini/antigravity/brain/757cee17-88d1-441b-a27b-f0f2dc12e81c/screenshot_sle201_verification.jpg';
  await page.screenshot({ path: outputPath });
  console.log("Screenshot successfully saved to: " + outputPath);
  
  await browser.close();
  console.log("Browser closed.");
})().catch(err => {
  console.error("Fatal error:", err);
});
