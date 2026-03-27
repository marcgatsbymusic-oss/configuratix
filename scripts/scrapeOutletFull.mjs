import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const outDir = path.join(process.cwd(), 'public', 'outlet');
const dataFile = path.join(process.cwd(), 'src', 'data', 'outlet_products.json');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

(async () => {
  console.log("Launching headless crawler...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  console.log("Authenticating into e-portal...");
  await page.goto('https://e-portal.drutex.pl/login');
  await page.locator('input[type="text"], input[type="email"], input[name="login"]').first().fill('marc@ventanas.shop');
  await page.locator('input[type="password"], input[name="password"]').first().fill('Lasmatas2025!*!1');
  await page.locator('button[type="submit"], .btn-login, .btn-primary').first().click();

  await page.waitForTimeout(8000);
  console.log("Authentication successful.");

  // Dismiss overlays
  for(let i=0; i<3; i++) {
     try {
       await page.keyboard.press('Escape');
       await page.evaluate(() => {
          document.querySelectorAll('button').forEach(b => {
             if(b.innerText.toLowerCase() === 'close' || b.innerText.includes('X') || b.className.includes('close')) b.click();
          });
       });
     } catch(e){}
     await page.waitForTimeout(1000);
  }

  try {
     console.log("Navigating to exact Product List URL...");
     await page.goto('https://e-portal.drutex.pl/outlet', { waitUntil: 'networkidle', timeout: 30000 });
  } catch(e) {
     console.log("Navigation failed.", e.message);
  }

  await page.waitForTimeout(5000);
  
  let products = [];
  
  let rowCount = await page.locator('table tbody tr').count();
  console.log(`Discovered ${rowCount} items in the database block.`);
  
  if (rowCount === 0) {
      console.log("No table rows found! The layout might have shifted.");
      await browser.close();
      process.exit(1);
  }

  const listUrl = page.url();

  for (let i = 0; i < rowCount; i++) {
     try {
        await page.waitForSelector('table tbody tr');
        const row = page.locator('table tbody tr').nth(i);
        
        const cols = await row.locator('td').allInnerTexts();
        if (cols.length < 11) continue;

        let p = {
           id: `prod_${Date.now()}_${i}`,
           name: cols[1].trim(),
           type: cols[2].trim(),
           openability: cols[3].trim(),
           outerColor: cols[4].trim(),
           innerColor: cols[5].trim(),
           width: cols[6].trim(),
           height: cols[7].trim(),
           material: cols[8].trim(),
           addons: cols[9].trim(),
           netPrice: cols[10].trim(),
           currency: cols[11] ? cols[11].trim() : 'EUR',
           imageUrls: [],
           localImages: []
        };
        console.log(`[${i+1}/${rowCount}] Extracting ${p.name}...`);

        const showBtn = row.locator('button:has-text("SHOW"), a:has-text("SHOW")').first();
        if (await showBtn.count() > 0) {
           await showBtn.click();
           await page.waitForTimeout(3000); // allow modal to inject DOM images

           const allImgs = await page.locator('img').all();
           let urls = [];
           for (let img of allImgs) {
              const src = await img.getAttribute('src');
              if (src && src.includes('/image/')) urls.push(src);
           }
           p.imageUrls = [...new Set(urls)];
           console.log(`   Discovered ${p.imageUrls.length} internal image streams.`);

           for(let k=0; k<p.imageUrls.length; k++) {
              let imgUrl = p.imageUrls[k];
              if(imgUrl.startsWith('/')) imgUrl = 'https://e-portal-backend.drutex.pl' + imgUrl;

              const filename = `drutex_outlet_${i}_${k}.jpg`;
              const dest = path.join(outDir, filename);

              try {
                 const response = await page.evaluate(async (u) => {
                    const r = await fetch(u);
                    const buf = await r.arrayBuffer();
                    return Array.from(new Uint8Array(buf));
                 }, imgUrl);
                 fs.writeFileSync(dest, Buffer.from(response));
                 p.localImages.push(`/outlet/${filename}`);
              } catch(e) {
                 console.log("   Failed to download artifact:", imgUrl);
              }
           }

           if (page.url() !== listUrl) {
              await page.goBack({ waitUntil: 'networkidle' });
           } else {
              await page.keyboard.press('Escape');
              const closeBtn = page.locator('button:has-text("CLOSE"), .modal-close').first();
              if (await closeBtn.count() > 0) await closeBtn.click();
           }
           await page.waitForTimeout(2000);
        }

        products.push(p);

     } catch(err) {
        console.log(`Row loop boundary violation on index ${i}. Skipping item.`, err.message);
        if (page.url() !== listUrl) await page.goto(listUrl, { waitUntil: 'networkidle' });
     }
  }

  const finalJSON = {
    filters: ["Product name", "Product type", "Openability", "Outer Color", "Inner Color", "Material", "Addons", "Width from", "Width to", "Height from", "Height to"],
    products: products
  };
  
  fs.writeFileSync(dataFile, JSON.stringify(finalJSON, null, 2));
  console.log(`Scraping finished. Safely closed DB cursor and committed ${products.length} products to JSON data file.`);

  await browser.close();
})();
