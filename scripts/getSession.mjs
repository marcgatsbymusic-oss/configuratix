import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
    try {
        const browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();
        
        console.log("Navigating to login...");
        await page.goto('https://e-portal.drutex.pl/login');
        await page.fill('input[type="text"]', 'marc@ventanas.shop');
        await page.fill('input[type="password"]', 'Lasmatas2025!*!1');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(6000);
        
        console.log("Transitioning to secure Outlet module...");
        await page.goto('https://e-portal.drutex.pl/outlet');
        await page.waitForTimeout(5000);
        
        const ls = await page.evaluate(() => JSON.stringify(localStorage));
        const ss = await page.evaluate(() => JSON.stringify(sessionStorage));
        const cookies = await page.evaluate(() => document.cookie);
        
        fs.writeFileSync('auth_dump.json', JSON.stringify({ 
            localStorageKeys: Object.keys(JSON.parse(ls)),
            sessionStorageKeys: Object.keys(JSON.parse(ss)),
            localStorage: JSON.parse(ls),
            sessionStorage: JSON.parse(ss),
            cookies
        }, null, 2));
        
        console.log("Session memory safely dumped to disk!");
        await browser.close();
    } catch (e) {
        console.error("Scraper failed:", e);
    }
})();
