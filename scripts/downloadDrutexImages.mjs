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

    // Agglomerate unique hashes
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

    console.log('Launching interactive extraction tunnel...\n');
    const browser = await puppeteer.launch({ 
        headless: false, 
        defaultViewport: null,
        args: ['--start-maximized']
    });
  
    const page = await browser.newPage();
  
    // Intercept internal network requests to steal the Bearer Token generated AFTER organic login!
    let bearerToken = null;
    await page.setRequestInterception(true);
    page.on('request', req => {
        const headers = req.headers();
        if (headers['authorization']) {
            bearerToken = headers['authorization'];
        }
        req.continue();
    });

    console.log('================================================================================');
    console.log('1. Since auto-login is aggressively blocked by Drutex, please log in manually.');
    console.log('   Email: marc@ventanas.shop');
    console.log('   Password: Lasmatas2025!*!1');
    console.log('2. The script will dynamically sniff the resulting internal API tokens!');
    console.log('================================================================================\n');

    await page.goto('https://e-portal.drutex.pl/login');

    // Wait for user to organically bypass login
    while (true) {
        const currentUrl = page.url();
        if ((currentUrl.includes('outlet') || !currentUrl.includes('login')) && currentUrl !== 'about:blank') {
            break;
        }
        await new Promise(r => setTimeout(r, 2000));
    }

    console.log(`✅ Passed login portal!`);
  
    // Wait briefly for the dashboard to finish firing requests so our token interceptor snags it
    console.log('Waiting for internal token exchange...');
    let tokenAttempts = 0;
    while (!bearerToken && tokenAttempts < 10) {
        await new Promise(r => setTimeout(r, 1000));
        tokenAttempts++;
    }

    if (!bearerToken) {
        console.log('❌ FATAL: Could not intercept the internal Authorization Bearer token.');
        await browser.close();
        process.exit(1);
    }

    console.log(`🎯 Successfully intercepted Bearer Token! Injecting massive download sequence...\n`);

    let successCount = 0;
    
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
                        if (blob.size < 100) return null; // Ignore tiny ghost markers
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
                console.log(`[FAILED] (${i + 1}/${missingHashes.length}) Token rejected for hash -> ${hash}`);
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
