import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
    console.log('Parsing local product database...');
    const catalogPath = path.join(__dirname, '../src/data/outlet_products.json');
    const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

    const allHashes = new Set();
    catalog.forEach(p => {
        if (p.imageHashes) p.imageHashes.forEach(h => allHashes.add(h));
    });

    const missingHashes = Array.from(allHashes).filter(hash => {
        return !fs.existsSync(path.join(__dirname, '../public/outlet', `${hash}.jpg`));
    });

    console.log(`\nCatalog contains ${allHashes.size} unique image references.`);
    console.log(`Found ${missingHashes.length} missing image targets to physically download.\n`);

    if (missingHashes.length === 0) {
        process.exit(0);
    }

    console.log('Automated visible login sequence initiating...');
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });
    const page = await browser.newPage();

    // Hook network requests to capture the exact Authorization header Drutex uses!
    let bearerToken = null;
    await page.setRequestInterception(true);
    page.on('request', req => {
        const headers = req.headers();
        if (headers['authorization']) {
            bearerToken = headers['authorization'];
        }
        req.continue();
    });

    await page.goto('https://e-portal.drutex.pl/login');

    // Type credentials into the confirmed Vue DOM IDs simulating human delays
    await page.waitForSelector('#login');
    await page.type('#login', 'marc@ventanas.shop', { delay: 45 });
    await page.type('#password', 'Lasmatas2025!*!1', { delay: 60 });

    // Submit and explicitly wait for Vue transitions skipping networkidle traps
    await new Promise(r => setTimeout(r, 1000));
    await page.click('button[type="submit"]');

    console.log('Waiting for authentication portal to accept credentials...');
    
    // Poll for up to 30 seconds
    let attempts = 0;
    while (page.url().includes('login') && attempts < 30) {
        await new Promise(r => setTimeout(r, 1000));
        attempts++;
    }
    
    if (page.url().includes('login')) {
         console.log('❌ FATAL: Login failed or stalled.');
         await browser.close();
         process.exit(1);
    }

    await page.goto('https://e-portal.drutex.pl/outlet', { waitUntil: 'networkidle2' });
    console.log('✅ Reached outlet dashboard!');
    console.log(`🔐 Subverted API Token: ${bearerToken ? 'YES' : 'NO'}`);

    console.log('Injecting massive download sequence using subverted token...\n');

    let successCount = 0;
    
    // We will do batches of 5 to speed it up but not crash the page
    for (let i = 0; i < missingHashes.length; i++) {
        const hash = missingHashes[i];
        try {
            const base64Data = await page.evaluate(async ({h, token}) => {
                const headers = {};
                if (token) headers['Authorization'] = token;
                
                try {
                    const res = await fetch(`https://e-portal.drutex.pl/api/file/${h}`, { headers });
                    if (res.ok) {
                        const blob = await res.blob();
                        if (blob.size < 100) return null;
                        return await new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result.split(',')[1]);
                            reader.readAsDataURL(blob);
                        });
                    }
                } catch(e) {}
                
                return null;
            }, { h: hash, token: bearerToken });
            
            if (base64Data) {
                const outPath = path.join(__dirname, '../public/outlet', `${hash}.jpg`);
                fs.writeFileSync(outPath, Buffer.from(base64Data, 'base64'));
                console.log(`[OK] (${i + 1}/${missingHashes.length}) Downloaded payload -> ${hash}.jpg`);
                successCount++;
            } else {
                console.log(`[FAILED] (${i + 1}/${missingHashes.length}) 404/401 -> ${hash}`);
            }
        } catch (err) {
            console.log(`[ERROR] Processing hash ${hash}: ${err.message}`);
        }
    }

    console.log(`\n=============================================`);
    console.log(`Extraction Tunnel Complete!`);
    console.log(`✓ Successful Downloads: ${successCount}`);
    console.log(`=============================================\n`);

    console.log('Auto-mapping local database to new files...');
    catalog.forEach(p => {
        if (p.imageHashes) {
            const validHashes = p.imageHashes.filter(h => {
                return fs.existsSync(path.join(__dirname, '../public/outlet', `${h}.jpg`));
            });
            validHashes.forEach(h => {
                const url = `/outlet/${h}.jpg`;
                if (!p.localImages.includes(url)) p.localImages.push(url);
            });
        }
    });

    fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));

    await browser.close();
    process.exit(0);

})();
