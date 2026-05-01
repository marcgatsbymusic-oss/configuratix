import fs from 'fs';
import path from 'path';

const colors = JSON.parse(fs.readFileSync('scratch/extracted_door_colors.json', 'utf8'));
const assetsDir = path.resolve('public/assets/iglo5-doors/colors');

let tsContent = `export const IGLO_DOOR_COLORS: SwatchColor[] = [\n`;

for (const c of colors) {
    const safeName = c.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    
    const ext = '.webp';
    const bgName = `${safeName}-swatch${ext}`;
    const bgPath = path.join(assetsDir, bgName);
    
    let localBg = '';
    if (fs.existsSync(bgPath) && fs.statSync(bgPath).size > 100) {
        localBg = `/assets/iglo5-doors/colors/${bgName}`;
    } else {
        // Delete invalid file
        if (fs.existsSync(bgPath)) fs.unlinkSync(bgPath);
    }
    
    const imgName = `${safeName}-door${ext}`;
    const imgPath = path.join(assetsDir, imgName);
    let localImg = undefined;
    if (fs.existsSync(imgPath) && fs.statSync(imgPath).size > 100) {
        localImg = `'/assets/iglo5-doors/colors/${imgName}'`;
    } else {
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }
    
    tsContent += `  { name: '${c.name}', hex: '#cccccc', image: '${localBg}'${localImg ? `, windowImage: ${localImg}` : ''} },\n`;
}

tsContent += `];\n`;

fs.writeFileSync('scratch/iglo_door_colors.ts', tsContent);
console.log("Cleanup and TS generation complete.");
