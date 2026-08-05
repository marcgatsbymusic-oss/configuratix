import fs from 'fs/promises';
import path from 'path';

const SRC_BASES = [
    'C:\\ProgramData\\DRUTEX\\Environment',
    'C:\\ProgramData\\DRUTEX\\Environment\\ZUBBMP',
    'C:\\ProgramData\\DRUTEX\\Environment\\TEXTUREN'
];

const DEST_DIR = 'public/drutex_assets';
const MANIFEST_FILE = 'drutex_image_list_all.json';

async function copyAssets() {
    console.log(`Loading manifest from ${MANIFEST_FILE}...`);
    const manifestRaw = await fs.readFile(MANIFEST_FILE, 'utf8');
    const manifest = JSON.parse(manifestRaw);
    
    // Combine images and dxfs
    const allFiles = [...manifest.images, ...manifest.dxfs];
    
    let foundCount = 0;
    let missingCount = 0;
    
    // Ensure destination base exists
    await fs.mkdir(DEST_DIR, { recursive: true });
    
    for (const relPath of allFiles) {
        if (!relPath) continue;
        
        let found = false;
        
        for (const base of SRC_BASES) {
            const srcPath = path.join(base, relPath);
            const destPath = path.join(DEST_DIR, relPath);
            
            try {
                // Check if file exists
                await fs.access(srcPath);
                
                // Exists, copy it
                await fs.mkdir(path.dirname(destPath), { recursive: true });
                await fs.copyFile(srcPath, destPath);
                found = true;
                foundCount++;
                break; // Stop searching once found
            } catch (err) {
                // Not found in this base, continue trying
            }
        }
        
        if (!found) {
            console.log(`MISSING: ${relPath}`);
            missingCount++;
        }
    }
    
    console.log('--- SUMMARY ---');
    console.log(`Successfully copied: ${foundCount}`);
    console.log(`Missing: ${missingCount}`);
}

copyAssets().catch(console.error);
