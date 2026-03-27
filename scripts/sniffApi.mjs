import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
    try {
        const browser = await chromium.launch({ headless: true });
        const context = await browser.newContext();
        const page = await context.newPage();

        if (fs.existsSync('network.log')) fs.unlinkSync('network.log');

        page.on('response', async (response) => {
            const url = response.url();
            if (response.request().resourceType() === 'fetch' || response.request().resourceType() === 'xhr') {
                try {
                    const text = await response.text();
                    if (text.includes('DUOLINE') || text.includes('netPrice') || url.includes('outlet')) {
                        fs.appendFileSync('network.log', `URL: ${url}\n${text.substring(0, 2000)}\n\n`);
                    }
                } catch(e) {}
            }
        });

        console.log("Authorizing...");
        await page.goto('https://e-portal.drutex.pl/login');
        await page.locator('input[type="text"]').fill('marc@ventanas.shop');
        await page.locator('input[type="password"]').fill('Lasmatas2025!*!1');
        await page.locator('button[type="submit"]').first().click();
        
        await page.waitForTimeout(5000);
        console.log("Jumping to specific SPA Route...");
        await page.goto('https://e-portal.drutex.pl/outlet', { waitUntil: 'networkidle' });
        await page.waitForTimeout(8000);
        
        console.log("Sniffing sequence concluded.");
        await browser.close();
    } catch (e) {
        console.log("Sniffer failed:", e);
        process.exit(1);
    }
})();
