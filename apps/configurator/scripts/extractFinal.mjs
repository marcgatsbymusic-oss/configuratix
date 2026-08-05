import fs from 'fs';
import { chromium } from 'playwright';

(async () => {
    try {
        const browser = await chromium.launch({ headless: true });
        const context = await browser.newContext();
        const page = await context.newPage();
        
        let token = null;
        page.on('request', req => {
            const h = req.headers();
            if (h['authorization'] && h['authorization'].includes('Bearer')) {
                token = h['authorization'];
            }
        });

        console.log("Logging in...");
        await page.goto('https://e-portal.drutex.pl/login');
        await page.fill('input[type="text"]', 'marc@ventanas.shop');
        await page.fill('input[type="password"]', 'Lasmatas2025!*!1');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(6000);
        
        console.log("Executing precise human coordinate clicks to trigger React Router...");
        const outletElements = await page.$$('text="Outlet"');
        if (outletElements.length > 0) {
            await outletElements[outletElements.length - 1].click();
            await page.waitForTimeout(2000);
        }

        const productListElements = await page.$$('text="Product list"');
        if (productListElements.length > 0) {
            await productListElements[0].click();
            await page.waitForTimeout(5000);
        }
        
        if (token) {
            console.log("SUCCESS! Encrypted Token manually intercepted.");
            fs.writeFileSync('secret_token.txt', token);
        } else {
            console.log("FAILED to trigger router token exchange.");
        }
        await browser.close();
    } catch(e) {
        console.error(e);
    }
})();
