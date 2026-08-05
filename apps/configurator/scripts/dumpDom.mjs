import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  try {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();

    console.log("Logging in...");
    await page.goto('https://e-portal.drutex.pl/login');
    await page.locator('input[type="text"], input[type="email"]').first().fill('marc@ventanas.shop');
    await page.locator('input[type="password"]').first().fill('Lasmatas2025!*!1');
    await page.locator('button[type="submit"], .btn-login, .btn-primary').first().click();

    await page.waitForTimeout(5000);
    console.log("Navigating to Outlet...");
    
    await page.goto('https://e-portal.drutex.pl/outlet', { waitUntil: 'networkidle' });
    await page.waitForTimeout(8000); // Wait for the SPA to hydrate products
    
    fs.writeFileSync('dom.html', await page.content());
    console.log("DOM dumped to dom.html successfully.");
    
    await browser.close();
  } catch (error) {
    console.error("Diagnostic script failed:", error);
    process.exit(1);
  }
})();
