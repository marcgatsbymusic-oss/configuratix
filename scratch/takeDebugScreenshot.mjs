import puppeteer from 'puppeteer';

(async () => {
  try {
    console.log("Launching browser...");
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1200 });

    console.log("Navigating to http://localhost:5173/debug-pricing ...");
    await page.goto('http://localhost:5173/debug-pricing', { waitUntil: 'networkidle2' });

    console.log("Waiting for Accordion #colors...");
    const accordionSelector = '#colors > div';
    await page.waitForSelector(accordionSelector);
    console.log("Clicking Accordion...");
    const accordion = await page.$(accordionSelector);
    await accordion.click();

    console.log("Waiting for W-DEK button...");
    const wdekSelector = 'xpath///button[contains(text(), "W-DEK")]';
    await page.waitForSelector(wdekSelector);
    console.log("Clicking W-DEK button...");
    const wdekButton = await page.$(wdekSelector);
    await wdekButton.click();

    console.log("Waiting for color squares to load...");
    await new Promise(r => setTimeout(r, 2000));

    console.log("Taking screenshot...");
    await page.screenshot({ path: 'c:/Users/Shadow/.gemini/antigravity/brain/4a8f0948-401a-4e05-9d95-ef9fc97dba92/colors_grid_screenshot.png', fullPage: true });

    await browser.close();
    console.log("Done. Screenshot saved successfully.");
  } catch (err) {
    console.error("Error occurred:", err);
  }
})();
