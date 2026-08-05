import fs from 'fs';
import path from 'path';

const outDir = 'public/images/typologies';
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

function generateGeometricSVG(id, sashes, name) {
    const isDoor = id.startsWith('D') || id.startsWith('T'); // TS, D
    const isBalkon = name.toLowerCase().includes('balkon') || name.toLowerCase().includes('okno balkonowe');
    const width = 200;
    const height = isDoor || isBalkon ? 280 : 200;

    const stroke = "#ffffff";
    const bg = "transparent";

    // Standard outer gap
    const margin = 10;
    const outerW = width - margin * 2;
    const outerH = height - margin * 2;
    
    // Sash count heuristic fallback
    let cols = sashes > 0 ? (sashes > 4 ? 4 : sashes) : 1;
    let rows = 1;

    // Check for specific layouts
    if (name.toLowerCase().includes('naświetle górne') || name.toLowerCase().includes('górne') || id.includes('N')) {
       rows = 2; // top transom
    }

    const svgHeader = `<svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" fill="${bg}" xmlns="http://www.w3.org/2000/svg">`;
    const svgFooter = `</svg>`;

    let content = `
        <!-- Main Frame -->
        <rect x="${margin}" y="${margin}" width="${outerW}" height="${outerH}" stroke="${stroke}" stroke-width="4" fill="none" rx="4" />
    `;

    // Draw inner divisions / sashes
    const sashW = outerW / cols;
    const sashH = rows === 2 ? outerH * 0.7 : outerH; // if 2 rows, bottom is 70%

    // Draw vertical mullions
    for (let c = 1; c < cols; c++) {
        content += `<line x1="${margin + (c * sashW)}" y1="${margin}" x2="${margin + (c * sashW)}" y2="${margin + outerH}" stroke="${stroke}" stroke-width="4" />`;
    }

    // Draw horizontal transoms
    if (rows === 2) {
        content += `<line x1="${margin}" y1="${margin + (outerH - sashH)}" x2="${margin + outerW}" y2="${margin + (outerH - sashH)}" stroke="${stroke}" stroke-width="4" />`;
    }

    // Draw sash frames inside the main regions
    for (let c = 0; c < cols; c++) {
        // Main window region
        const ix = margin + (c * sashW) + 6;
        const widthInner = sashW - 12;
        
        let iyMain = margin + 6;
        let heightMainInner = rows === 2 ? outerH - sashH - 12 : sashH - 12;
        
        // If 2 rows, draw top
        if (rows === 2) {
             content += `<rect x="${ix}" y="${iyMain}" width="${widthInner}" height="${heightMainInner}" stroke="${stroke}" stroke-width="2" fill="none" rx="2" stroke-opacity="0.6"/>`;
             // Move down for bottom row
             iyMain = margin + (outerH - sashH) + 6;
             heightMainInner = sashH - 12;
        }

        // Main sash
        content += `<rect x="${ix}" y="${iyMain}" width="${widthInner}" height="${heightMainInner}" stroke="${stroke}" stroke-width="2" fill="none" rx="2" stroke-opacity="0.6" />`;
        
        // Draw opening lines (fake, simplistic) Left Hinge (R-L / DKL style)
        if (cols <= 4) {
             content += `<polygon points="${ix},${iyMain} ${ix + widthInner},${iyMain + heightMainInner/2} ${ix},${iyMain + heightMainInner}" fill="none" stroke="${stroke}" stroke-width="1" stroke-dasharray="4" stroke-opacity="0.3" />`;
        }
    }

    // Add identifier text faintly
    content += `<text x="${width/2}" y="${height/2}" text-anchor="middle" font-family="sans-serif" font-size="24" font-weight="900" fill="${stroke}" opacity="0.1">${id}</text>`;

    return svgHeader + content + svgFooter;
}

const typologiesFile = 'src/data/window_typologies.json';
console.log(`Reading typologies from ${typologiesFile}`);
let typologies = JSON.parse(fs.readFileSync(typologiesFile, 'utf8'));

let generatedCount = 0;
typologies.forEach(typology => {
    // Generate valid filesystem file name
    const safeId = typology.id.replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `${safeId}.svg`;
    const fullPath = path.join(outDir, fileName);

    const svgString = generateGeometricSVG(typology.id, typology.sashes || 1, typology.name || '');
    fs.writeFileSync(fullPath, svgString);
    
    // ensure image path points properly
    typology.image = `/images/typologies/${fileName}`;
    
    generatedCount++;
});

fs.writeFileSync(typologiesFile, JSON.stringify(typologies, null, 2));

console.log(`Generated ${generatedCount} typologies SVG blocks in ${outDir}.`);
