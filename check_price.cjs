const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('http://localhost:5173/debug-pricing');
    
    // Fill out the inputs
    const inputs = await page.$$('input[type="number"]');
    await inputs[0].fill('1490'); // Width
    await inputs[1].fill('1700'); // Height
    
    // Wait for price calculation
    await page.waitForTimeout(500);
    
    // Get all text content
    const content = await page.innerText('.max-w-4xl');
    
    console.log(content);
    
    await browser.close();
})();
