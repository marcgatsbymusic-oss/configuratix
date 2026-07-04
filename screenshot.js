import puppeteer from 'puppeteer';

(async () => {
    console.log("Launching browser...");
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    page.on('console', msg => {
        console.log(`PAGE LOG [${msg.type()}]: ${msg.text()}`);
    });
    page.on('pageerror', error => {
        console.log(`PAGE ERROR: ${error.message}`);
    });
    
    console.log("Navigating to http://localhost:5173/f252-v2...");
    try {
        await page.goto('http://localhost:5173/f252-v2', { waitUntil: 'networkidle2' });
        console.log("Saving screenshot...");
        await page.screenshot({ path: 'screenshot.png' });
        console.log("Screenshot saved to screenshot.png");
    } catch (e) {
        console.log("Failed:", e.message);
    }
    
    await browser.close();
})();
