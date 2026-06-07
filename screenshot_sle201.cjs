const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  
  console.log("Navigating to SLE201 viewer page...");
  await page.goto('http://localhost:5173/viewer?typology=SLE201', { waitUntil: 'networkidle2' });
  
  // Wait for 3D components and environment textures to load fully
  await new Promise(r => setTimeout(r, 6000));
  
  const outputPath = 'C:/Users/Shadow/.gemini/antigravity/brain/af46a84c-1c35-4a88-ab83-e672a5b9a9e3/screenshot_sle201_fixed_3.jpg';
  await page.screenshot({ path: outputPath });
  console.log("Screenshot saved to: " + outputPath);
  
  await browser.close();
})();
