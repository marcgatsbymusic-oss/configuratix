import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
    try {
        const browser = await chromium.launch({ headless: true });
        const context = await browser.newContext();
        const page = await context.newPage();

        page.on('response', async (response) => {
            const url = response.url();
            if (response.request().resourceType() === 'fetch' || response.request().resourceType() === 'xhr') {
                try {
                    const text = await response.text();
                    if (text.includes('DUOLINE') || text.includes('netPrice') || text.includes('Iglo')) {
                        console.log(">>> FOUND API PAYLOAD:", url);
                        fs.writeFileSync('api_target.json', JSON.stringify({
                            url,
                            method: response.request().method(),
                            postData: response.request().postData(),
                            payload_preview: text.substring(0, 1000)
                        }, null, 2));
                    }
                } catch(e) {}
            }
        });

        console.log("Starting interception sequence...");
        await page.goto('https://e-portal.drutex.pl/login');
        await page.fill('input[name="login"]', 'marc@ventanas.shop').catch(()=> page.fill('input[type="text"]', 'marc@ventanas.shop'));
        await page.fill('input[name="password"]', 'Lasmatas2025!*!1').catch(()=> page.fill('input[type="password"]', 'Lasmatas2025!*!1'));
        await page.click('button[type="submit"]');
        await page.waitForTimeout(4000);
        
        console.log("Navigating to Outlet Router...");
        await page.goto('https://e-portal.drutex.pl/outlet', { waitUntil: 'networkidle' });
        await page.waitForTimeout(5000);
        
        console.log("Closing...");
        await browser.close();
    } catch (e) {
        console.error("Fatal:", e);
        process.exit(1);
    }
})();
