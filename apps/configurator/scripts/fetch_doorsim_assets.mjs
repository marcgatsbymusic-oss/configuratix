import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../scratch/doors_config.json'), 'utf8'));

// We only want to focus on MB-86N SI for the MVP to avoid downloading thousands of images.
// Or we can just find all image strings in the JSON and filter them.
const allStrings = new Set();

function traverse(obj) {
    if (typeof obj === 'string') {
        if (obj.match(/\.(webp|png|jpg|jpeg|svg)$/i)) {
            allStrings.add(obj);
        }
    } else if (Array.isArray(obj)) {
        obj.forEach(traverse);
    } else if (typeof obj === 'object' && obj !== null) {
        Object.values(obj).forEach(traverse);
    }
}

traverse(config);

console.log(`Found ${allStrings.size} image assets in the config!`);

// Let's print out some to see what they look like
const arr = Array.from(allStrings);
console.log("Samples:", arr.slice(0, 20));

// Create directories and download script
const downloadDir = path.join(__dirname, '../public/doorsim-assets');
if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir, { recursive: true });
}

// We will only download a subset for MVP. For example, things containing "MB86N", "ALASKA", "RAL7016", "klamki", "glass"
const mvpAssets = arr.filter(url => {
    const u = url.toLowerCase();
    return u.includes('mb86n') || 
           u.includes('alaska') || 
           u.includes('ral-7016') ||
           u.includes('pochwyt') ||
           u.includes('klamka') ||
           u.includes('szyba') ||
           u.includes('icon');
});

console.log(`\nFiltered ${mvpAssets.length} assets for MVP.`);

async function download(url) {
    const fullUrl = url.startsWith('http') ? url : `https://wizualizator.drutex.pl/${url.startsWith('/') ? url.slice(1) : url}`;
    
    // Clean URL for file system
    let relativePath = url.replace('https://wizualizator.drutex.pl/', '');
    if (relativePath.startsWith('/')) relativePath = relativePath.slice(1);
    
    const filePath = path.join(downloadDir, relativePath);
    const dir = path.dirname(filePath);
    
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    
    if (fs.existsSync(filePath)) {
        return; // Skip existing
    }
    
    try {
        const res = await fetch(fullUrl);
        if (res.ok) {
            const buffer = await res.arrayBuffer();
            fs.writeFileSync(filePath, Buffer.from(buffer));
            console.log(`Downloaded: ${relativePath}`);
        } else {
            console.log(`Failed to download: ${fullUrl} - ${res.statusText}`);
        }
    } catch (e) {
        console.error(`Error downloading ${fullUrl}:`, e.message);
    }
}

async function run() {
    for (const asset of mvpAssets) {
        await download(asset);
    }
    console.log("MVP Assets download complete!");
}

run();
