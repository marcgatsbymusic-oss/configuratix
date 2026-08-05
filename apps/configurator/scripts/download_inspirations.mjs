import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.join(__dirname, '../parse_inspirations.mjs'); // Ensure this is right if needed, actually we just read the JSON
const jsonPath = path.join(__dirname, '../inspirations_data.json');
const targetDir = path.join(__dirname, '../public/assets/inspirations');

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

async function downloadImage(url, filename) {
    return new Promise((resolve, reject) => {
        const fullUrl = `https://www.drutex.eu${url}`;
        https.get(fullUrl, (res) => {
            if (res.statusCode !== 200) {
                console.error(`Failed to download ${fullUrl}: ${res.statusCode}`);
                resolve(null);
                return;
            }
            const fileStream = fs.createWriteStream(filename);
            res.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close();
                resolve(true);
            });
            fileStream.on('error', (err) => {
                reject(err);
            });
        }).on('error', (err) => reject(err));
    });
}

async function processInspirations() {
    console.log('Starting inspirations extraction...');
    
    const structuredData = {
        tabs: data.tabs,
        categories: {}
    };

    let totalImages = 0;
    
    for (const [catId, items] of Object.entries(data.galleries)) {
        console.log(`Processing Category ${catId} with ${items.length} items...`);
        structuredData.categories[catId] = [];
        
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const originalUrl = item.image;
            if (!originalUrl) continue;
            
            // Generate a safe local filename based on original URL or index
            const ext = '.webp';
            let safeName = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            if (!safeName) safeName = `insp-${catId}-${i}`;
            
            // To prevent duplicates, append index
            const localFileName = `${catId}-${i}-${safeName}${ext}`;
            const localPath = path.join(targetDir, localFileName);
            
            console.log(`Downloading ${localFileName}...`);
            await downloadImage(originalUrl, localPath);
            
            // Rewrite the product link to match local routes (e.g. /en/products/iglo-edge-slide.html -> /products/iglo-edge-slide)
            let localProductLink = item.productLink || '';
            if (localProductLink.includes('/products/')) {
                const slugMatch = localProductLink.match(/\/products\/(.+)\.html/);
                if (slugMatch) {
                    localProductLink = `/products/${slugMatch[1]}`;
                }
            }
            
            structuredData.categories[catId].push({
                image: `/assets/inspirations/${localFileName}`,
                name: item.name,
                productLink: localProductLink
            });
            totalImages++;
        }
    }
    
    // Write out the TS file
    const tsContent = `export interface InspirationItem {
  image: string;
  name: string;
  productLink?: string;
}

export interface InspirationCategory {
  [key: string]: InspirationItem[];
}

export interface InspirationTab {
  id: number;
  label: string;
  href: string;
}

export const INSPIRATION_TABS: InspirationTab[] = ${JSON.stringify(data.tabs, null, 2)};

export const INSPIRATIONS_DATA: InspirationCategory = ${JSON.stringify(structuredData.categories, null, 2)};
`;

    const outPath = path.join(__dirname, '../src/data/inspirations.ts');
    fs.writeFileSync(outPath, tsContent);
    console.log(`\nSuccessfully downloaded ${totalImages} images and created src/data/inspirations.ts`);
}

processInspirations().catch(console.error);
