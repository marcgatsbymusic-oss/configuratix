import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const outputDir = path.join(process.cwd(), 'public/outlet');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

async function getAuthToken() {
    return new Promise(async (resolve, reject) => {
        let found = false;
        try {
            const browser = await chromium.launch({ headless: true });
            const page = await browser.newPage();

            page.on('request', req => {
                const h = req.headers();
                if (h['authorization'] && h['authorization'].includes('Bearer') && !found) {
                    found = true;
                    resolve({ token: h['authorization'], browser });
                }
            });

            console.log("Logging into Drutex Portal natively...");
            await page.goto('https://e-portal.drutex.pl/login');
            await page.fill('input[type="text"]', 'marc@ventanas.shop');
            await page.fill('input[type="password"]', 'Lasmatas2025!*!1');
            await page.click('button[type="submit"]');
            await page.waitForTimeout(5000);
            
            console.log("Forcing synthetic API Call to expose Auth Headers...");
            await page.evaluate(() => {
                fetch('https://e-portal-backend.drutex.pl/pages/outlet/list/?limit=1');
            }).catch(console.error);

            setTimeout(() => { if (!found) reject("Timeout finding auth"); }, 15000);
        } catch(e) { reject(e); }
    });
}

async function extract() {
    console.log("Authenticating via headless browser to secure fresh token...");
    let AUTH_TOKEN;
    try {
        const authData = await getAuthToken();
        AUTH_TOKEN = authData.token;
        await authData.browser.close();
        console.log("Token secured natively.");
    } catch(e) {
        console.error("Auth failed", e);
        process.exit(1);
    }

    let allProducts = [];
    const totalItems = 293;
    const limit = 30; 
    
    console.log("Extracting massive 293-item JSON payload...");
    for (let offset = 0; offset <= totalItems; offset += limit) {
        const url = `https://e-portal-backend.drutex.pl/pages/outlet/list/?limit=${limit}&offset=${offset}`;
        try {
            const res = await fetch(url, { headers: { authorization: AUTH_TOKEN } });
            if (res.ok) {
                const json = await res.json();
                allProducts = allProducts.concat(json.results);
                console.log(`Payload chunk ${offset} successful -> Extracted: ${allProducts.length}`);
            } else {
                console.error("Failed API offset", offset, res.status);
            }
        } catch(e) { console.error(e) }
    }
    
    const mappedProducts = allProducts.map(p => ({
        id: p.id,
        name: p.product_name,
        type: p.product_type === 'Okno' ? 'Window' : (p.product_type === 'Balkon' ? 'Balcony' : (p.product_type === 'Drzwi' ? 'Door' : p.product_type)),
        height: parseInt(p.height, 10) || 0,
        width: parseInt(p.width, 10) || 0,
        material: p.material === 'PCV' || p.material === 'PVC' ? 'PVC' : (p.material === 'Drewno' ? 'Wood' : (p.material === 'Aluminium' ? 'Aluminum' : p.material)),
        openability: p.openability === 'Do wewnątrz' ? 'Inward' : (p.openability === 'Na zewnątrz' ? 'Outward' : p.openability),
        innerColor: p.color_inside,
        outerColor: p.color_outside,
        price: p.price_netto,
        currency: p.price_currency,
        imageHashes: p.image_hashes || [],
        localImages: (p.image_hashes || []).map(hash => `/outlet/${hash}.jpg`)
    }));

    const uniqueMap = new Map();
    mappedProducts.forEach(p => uniqueMap.set(p.id, p));
    const finalProducts = Array.from(uniqueMap.values());

    const outPath = path.join(process.cwd(), 'src/data/outlet_products.json');
    fs.writeFileSync(outPath, JSON.stringify(finalProducts, null, 2));
    console.log(`Saved ${finalProducts.length} unique items directly to database.`);

    console.log("Evaluating High-Res Images Sync...");
    let imagesToDownload = [];
    finalProducts.forEach(p => imagesToDownload.push(...p.imageHashes));
    imagesToDownload = [...new Set(imagesToDownload)];

    console.log(`Need to resolve ${imagesToDownload.length} unique image blob hashes.`);
    
    let index = 0;
    for (const hash of imagesToDownload) {
        const filepath = path.join(outputDir, `${hash}.jpg`);
        if (fs.existsSync(filepath)) {
            index++;
            continue;
        }

        const imgUrl = `https://e-portal-backend.drutex.pl/pages/outlet/${hash}/image/`;
        try {
            const r = await fetch(imgUrl, { headers: { authorization: AUTH_TOKEN } });
            if (r.ok) {
                const buffer = Buffer.from(await r.arrayBuffer());
                fs.writeFileSync(filepath, buffer);
            }
        } catch(e) {}
        index++;
        if (index % 50 === 0) console.log(`Persisted ${index}/${imagesToDownload.length} images...`);
    }
    console.log("Full architecture sync complete!");
}
extract();
