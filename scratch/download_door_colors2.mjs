import fs from 'fs';
import path from 'path';

const colors = JSON.parse(fs.readFileSync('scratch/extracted_door_colors.json', 'utf8'));
const assetsDir = path.resolve('public/assets/iglo5-doors/colors');

const downloadImage = async (url, filepath) => {
    try {
        let res = await fetch("https://www.drutex.eu" + url);
        if (!res.ok) {
            // Try to extract the base64 part and decode it
            // Format: /media/webp/80/BASE64.webp
            const parts = url.split('/');
            const base64withExt = parts[parts.length - 1];
            if (base64withExt.endsWith('.webp')) {
                const base64 = base64withExt.replace('.webp', '');
                const decodedPath = Buffer.from(base64, 'base64').toString('utf8');
                console.log(`Fallback to original path: ${decodedPath}`);
                res = await fetch("https://www.drutex.eu" + decodedPath);
                if (!res.ok) throw new Error(`HTTP ${res.status} on fallback`);
            } else {
                throw new Error(`HTTP ${res.status}`);
            }
        }
        const buf = await res.arrayBuffer();
        fs.writeFileSync(filepath, Buffer.from(buf));
        return true;
    } catch(e) {
        console.error(`Failed to download ${url}: ${e}`);
        return false;
    }
};

(async () => {
    let tsContent = `export const IGLO_DOOR_COLORS: SwatchColor[] = [\n`;

    for (const c of colors) {
        const safeName = c.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
        let localBg = '';
        let localImg = '';
        
        if (c.bg) {
            const ext = '.webp';
            const bgName = `${safeName}-swatch${ext}`;
            const bgPath = path.join(assetsDir, bgName);
            // Only download if it doesn't exist
            if (!fs.existsSync(bgPath)) {
                await downloadImage(c.bg, bgPath);
            }
            localBg = `/assets/iglo5-doors/colors/${bgName}`;
        }
        
        if (c.img) {
            const ext = '.webp';
            const imgName = `${safeName}-door${ext}`;
            const imgPath = path.join(assetsDir, imgName);
            if (!fs.existsSync(imgPath)) {
                await downloadImage(c.img, imgPath);
            }
            localImg = `/assets/iglo5-doors/colors/${imgName}`;
        }
        
        tsContent += `  { name: '${c.name}', hex: '#cccccc', image: '${localBg}', windowImage: '${localImg}' },\n`;
    }
    
    tsContent += `];\n`;
    
    fs.writeFileSync('scratch/iglo_door_colors.ts', tsContent);
    console.log("Finished downloading and generating TS file with fallbacks!");
})();
