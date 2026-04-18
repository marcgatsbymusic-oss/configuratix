import fs from 'fs';
import path from 'path';

const outDir = 'public/assets/fitting_variants';
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

// Function to generate standard opening type SVGs with realistic styling
function generateSVG(variantId) {
    const width = 200;
    const height = 200;
    const lineStroke = "#333333";
    const lineStrokeWidth = "1";
    
    const svgHeader = `<svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">`;
    const svgFooter = `</svg>`;
    
    // Base Frame and Glass Setup
    const base = `
        <!-- Outer white frame -->
        <rect x="0" y="0" width="200" height="200" fill="#fcfcfc" stroke="#e0e0e0" stroke-width="1" />
        <!-- Inner glass area with inset bevel effect using polygon paths -->
        <rect x="15" y="15" width="170" height="170" fill="#a4c2d6" />
        
        <!-- Top bevel shadow -->
        <path d="M15 15 L185 15 L180 20 L20 20 Z" fill="rgba(0,0,0,0.15)" />
        <!-- Left bevel shadow -->
        <path d="M15 15 L15 185 L20 180 L20 20 Z" fill="rgba(0,0,0,0.08)" />
        <!-- Bottom bevel highlight -->
        <path d="M15 185 L185 185 L180 180 L20 180 Z" fill="rgba(255,255,255,0.7)" />
        <!-- Right bevel highlight -->
        <path d="M185 15 L185 185 L180 180 L180 20 Z" fill="rgba(255,255,255,0.4)" />
        
        <!-- Fine inset border line -->
        <rect x="15" y="15" width="170" height="170" fill="none" stroke="#888888" stroke-width="0.5" />
    `;
    
    // Sash frame for FIX-S etc.
    const innerRect = `
        <rect x="30" y="30" width="140" height="140" fill="#fcfcfc" stroke="#b0b0b0" stroke-width="1" />
        <rect x="40" y="40" width="120" height="120" fill="#a4c2d6" />
        <!-- inner bevel -->
        <path d="M40 40 L160 40 L155 45 L45 45 Z" fill="rgba(0,0,0,0.15)" />
        <path d="M40 40 L40 160 L45 155 L45 45 Z" fill="rgba(0,0,0,0.08)" />
        <path d="M40 160 L160 160 L155 155 L45 155 Z" fill="rgba(255,255,255,0.7)" />
        <path d="M160 40 L160 160 L155 155 L155 45 Z" fill="rgba(255,255,255,0.4)" />
        <rect x="40" y="40" width="120" height="120" fill="none" stroke="#888888" stroke-width="0.5" />
    `;

    let lines = '';
    
    // Drawing box coordinates for the lines
    const lx1 = 50, lx2 = 150;
    const ly1 = 50, ly2 = 150;
    
    if (variantId === 'FIX') {
        lines = base + `
            <line x1="${lx1}" y1="100" x2="${lx2}" y2="100" stroke="${lineStroke}" stroke-width="${lineStrokeWidth}" />
            <line x1="100" y1="${ly1}" x2="100" y2="${ly2}" stroke="${lineStroke}" stroke-width="${lineStrokeWidth}" />
            <text x="103" y="97" font-weight="bold" font-family="Arial, sans-serif" font-size="12" fill="${lineStroke}">1</text>
        `;
    } else if (variantId === 'FIX-S') {
        lines = base + innerRect + `
            <line x1="70" y1="100" x2="130" y2="100" stroke="${lineStroke}" stroke-width="${lineStrokeWidth}" />
            <line x1="100" y1="70" x2="100" y2="130" stroke="${lineStroke}" stroke-width="${lineStrokeWidth}" />
            <text x="103" y="97" font-weight="bold" font-family="Arial, sans-serif" font-size="12" fill="${lineStroke}">1</text>
        `;
    } else if (variantId === 'RD-L' || variantId === 'R-L') {
        lines = base + `
            <line x1="15" y1="15" x2="185" y2="100" stroke="${lineStroke}" stroke-width="${lineStrokeWidth}" />
            <line x1="15" y1="185" x2="185" y2="100" stroke="${lineStroke}" stroke-width="${lineStrokeWidth}" />
        `;
    } else if (variantId === 'RD-P' || variantId === 'R-P') {
        lines = base + `
            <line x1="185" y1="15" x2="15" y2="100" stroke="${lineStroke}" stroke-width="${lineStrokeWidth}" />
            <line x1="185" y1="185" x2="15" y2="100" stroke="${lineStroke}" stroke-width="${lineStrokeWidth}" />
        `;
    } else if (variantId === 'U' || variantId === 'U-2K-B' || variantId === 'U-2K-G') {
        lines = base + `
            <line x1="15" y1="185" x2="100" y2="15" stroke="${lineStroke}" stroke-width="${lineStrokeWidth}" />
            <line x1="185" y1="185" x2="100" y2="15" stroke="${lineStroke}" stroke-width="${lineStrokeWidth}" />
        `;
    } else if (variantId === 'U-D') {
        lines = base + `
            <line x1="15" y1="15" x2="100" y2="185" stroke="${lineStroke}" stroke-width="${lineStrokeWidth}" />
            <line x1="185" y1="15" x2="100" y2="185" stroke="${lineStroke}" stroke-width="${lineStrokeWidth}" />
        `;
    } else if (variantId === 'U-L' || variantId === 'U-N-L') {
        lines = base + `
            <line x1="185" y1="15" x2="15" y2="100" stroke="${lineStroke}" stroke-width="${lineStrokeWidth}" />
            <line x1="185" y1="185" x2="15" y2="100" stroke="${lineStroke}" stroke-width="${lineStrokeWidth}" />
        `;
    } else if (variantId === 'U-P' || variantId === 'U-N-P') {
        lines = base + `
            <line x1="15" y1="15" x2="185" y2="100" stroke="${lineStroke}" stroke-width="${lineStrokeWidth}" />
            <line x1="15" y1="185" x2="185" y2="100" stroke="${lineStroke}" stroke-width="${lineStrokeWidth}" />
        `;
    } else if (variantId === 'UR-L') {
        lines = base + `
            <line x1="15" y1="15" x2="185" y2="100" stroke="${lineStroke}" stroke-width="${lineStrokeWidth}" />
            <line x1="15" y1="185" x2="185" y2="100" stroke="${lineStroke}" stroke-width="${lineStrokeWidth}" />
            <line x1="15" y1="185" x2="100" y2="15" stroke="${lineStroke}" stroke-width="${lineStrokeWidth}" />
            <line x1="185" y1="185" x2="100" y2="15" stroke="${lineStroke}" stroke-width="${lineStrokeWidth}" />
        `;
    } else if (variantId === 'UR-P') {
        lines = base + `
            <line x1="185" y1="15" x2="15" y2="100" stroke="${lineStroke}" stroke-width="${lineStrokeWidth}" />
            <line x1="185" y1="185" x2="15" y2="100" stroke="${lineStroke}" stroke-width="${lineStrokeWidth}" />
            <line x1="15" y1="185" x2="100" y2="15" stroke="${lineStroke}" stroke-width="${lineStrokeWidth}" />
            <line x1="185" y1="185" x2="100" y2="15" stroke="${lineStroke}" stroke-width="${lineStrokeWidth}" />
        `;
    } else {
        lines = base + `
            <line x1="25" y1="100" x2="175" y2="100" stroke="${lineStroke}" stroke-dasharray="5,5" stroke-width="${lineStrokeWidth}" />
            <line x1="100" y1="25" x2="100" y2="175" stroke="${lineStroke}" stroke-dasharray="5,5" stroke-width="${lineStrokeWidth}" />
        `;
    }

    return svgHeader + lines + svgFooter;
}

const variantsFile = 'src/data/fitting_variants.json';
const variants = JSON.parse(fs.readFileSync(variantsFile, 'utf8'));

variants.forEach(variant => {
    const safeId = variant.id.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const fileName = `${safeId}.svg`;
    const fullPath = path.join(outDir, fileName);
    
    fs.writeFileSync(fullPath, generateSVG(variant.id));
    
    // Add image relation back to the JSON
    variant.image = `/assets/fitting_variants/${fileName}`;
});

fs.writeFileSync(variantsFile, JSON.stringify(variants, null, 2));
console.log("Successfully generated realistic SVGs matching uploaded style.");
