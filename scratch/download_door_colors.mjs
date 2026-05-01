import fs from 'fs';
import path from 'path';

const colors = JSON.parse(fs.readFileSync('scratch/extracted_door_colors.json', 'utf8'));
const assetsDir = path.resolve('public/assets/iglo5-doors/colors');
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
}

const downloadImage = async (url, filepath) => {
    try {
        const res = await fetch("https://www.drutex.eu" + url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
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
        // Convert to safe filename
        const safeName = c.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
        
        let localBg = '';
        let localImg = '';
        
        if (c.bg) {
            const ext = '.webp';
            const bgName = `${safeName}-swatch${ext}`;
            const bgPath = path.join(assetsDir, bgName);
            await downloadImage(c.bg, bgPath);
            localBg = `/assets/iglo5-doors/colors/${bgName}`;
        }
        
        if (c.img) {
            const ext = '.webp';
            const imgName = `${safeName}-door${ext}`;
            const imgPath = path.join(assetsDir, imgName);
            await downloadImage(c.img, imgPath);
            localImg = `/assets/iglo5-doors/colors/${imgName}`;
        }
        
        tsContent += `  { name: '${c.name}', hex: '#cccccc', image: '${localBg}', windowImage: '${localImg}' },\n`;
    }
    
    tsContent += `];\n`;
    
    fs.writeFileSync('scratch/iglo_door_colors.ts', tsContent);
    console.log("Finished downloading and generating TS file!");
})();
