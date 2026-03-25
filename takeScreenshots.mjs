import puppeteer from 'puppeteer';

(async () => {
  try {
    console.log("Launching browser...");
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
    
    console.log("Navigating to Home...");
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: 'c:/Users/Shadow/.gemini/antigravity/brain/c8c0377b-f134-4ec6-a06b-90bd792ad2b9/mobile_home.png', fullPage: true });
    
    console.log("Navigating to Configurator...");
    await page.goto('http://localhost:5173/slate-configurator', { waitUntil: 'networkidle2' });
    // Click some things or just wait to ensure full layout
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: 'c:/Users/Shadow/.gemini/antigravity/brain/c8c0377b-f134-4ec6-a06b-90bd792ad2b9/mobile_configurator.png', fullPage: true });
    
    await browser.close();
    console.log("Done.");
  } catch (err) {
    console.error(err);
  }
})();
