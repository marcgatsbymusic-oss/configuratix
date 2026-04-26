import fs from 'fs';
import path from 'path';
import https from 'https';

const BASE_URL = 'https://wizualizator.drutex.pl/';
const CONFIG_FILE = 'public/doorsim-assets/scraped_doors/drutex_config.json';
const OUTPUT_DIR = 'public/doorsim-assets/scraped_doors';

// Custom https agent to prevent socket hangups on large concurrent requests
const agent = new https.Agent({ keepAlive: true, maxSockets: 10 });

async function downloadFile(urlPath) {
    const fullUrl = BASE_URL + urlPath;
    const localPath = path.join(OUTPUT_DIR, urlPath);
    
    // Skip if exists
    if (fs.existsSync(localPath)) return;
    
    fs.mkdirSync(path.dirname(localPath), { recursive: true });

    return new Promise((resolve, reject) => {
        https.get(fullUrl, { agent }, (res) => {
            if (res.statusCode !== 200) {
                console.error(`Failed to get ${fullUrl}: ${res.statusCode}`);
                resolve();
                return;
            }
            const file = fs.createWriteStream(localPath);
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
            file.on('error', (err) => {
                fs.unlink(localPath, () => {});
                console.error(`Error saving ${localPath}:`, err);
                resolve();
            });
        }).on('error', (err) => {
            console.error(`Request error for ${fullUrl}:`, err);
            resolve();
        });
    });
}

async function main() {
    console.log('Loading config...');
    const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    
    const urls = new Set();
    const extract = (obj) => {
        if (typeof obj === 'string') {
            if (obj.startsWith('assets/') && (obj.endsWith('.png') || obj.endsWith('.svg') || obj.endsWith('.webp'))) {
                urls.add(obj);
            }
        } else if (Array.isArray(obj)) {
            obj.forEach(extract);
        } else if (typeof obj === 'object' && obj !== null) {
            Object.values(obj).forEach(extract);
        }
    };
    
    extract(data);
    const urlArray = Array.from(urls);
    console.log(`Found ${urlArray.length} unique asset URLs to download.`);
    
    // Download in batches of 10
    const concurrency = 10;
    for (let i = 0; i < urlArray.length; i += concurrency) {
        const batch = urlArray.slice(i, i + concurrency);
        await Promise.all(batch.map(downloadFile));
        if (i % 100 === 0 && i > 0) {
            console.log(`Downloaded ${i} / ${urlArray.length}`);
        }
    }
    
    console.log('All assets downloaded successfully!');
}

main().catch(console.error);
