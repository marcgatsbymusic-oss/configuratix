import puppeteer from 'puppeteer';

(async () => {
  try {
    console.log("Launching browser...");
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1024 });

    console.log("Navigating to http://localhost:5173/igls-test-build ...");
    await page.goto('http://localhost:5173/igls-test-build', { waitUntil: 'networkidle2' });

    console.log("Waiting 3 seconds for 3D engine to render...");
    await new Promise(r => setTimeout(r, 3000));

    console.log("Taking screenshot...");
    await page.screenshot({ path: 'C:/Users/Shadow/.gemini/antigravity/brain/ec14721d-ab09-4ccb-b6ad-69c7a7663648/igls_3d_screenshot.png' });

    await browser.close();
    console.log("Screenshot saved to brain directory.");
  } catch (err) {
    console.error("Error occurred:", err);
  }
})();
