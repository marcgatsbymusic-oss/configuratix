import fs from 'fs';
import path from 'path';

const jsonPath = 'src/data/profiles/IgloEdge/SLE201.json';
const svgPath = 'src/data/profiles/IgloEdge/SLE201_preview.svg';

try {
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const bounds = data.meta.bounds.normalised;
    const width = bounds.maxX;
    const height = bounds.maxY;

    // Define colors for each layer to make a beautiful, professional, easy-to-read cross-section preview
    const colors = {
        // Child1
        'BZD': { fill: '#3b3b44', stroke: '#1a1a20' }, // Glazing bead
        'DOOR_FRM_EXT': { fill: '#25252b', stroke: '#0e0e11' }, // Main sash frame ext
        'DOOR_FRM_INT': { fill: '#2d2d35', stroke: '#0e0e11' }, // Main sash frame int
        'GLS_EXT': { fill: 'rgba(100, 180, 255, 0.4)', stroke: '#2e90ff' }, // Glass outer
        'GLS_INT': { fill: 'rgba(100, 180, 255, 0.4)', stroke: '#2e90ff' }, // Glass inner
        'GLS_MDL': { fill: 'rgba(100, 180, 255, 0.3)', stroke: '#2e90ff' }, // Glass middle
        'GSK_BZD': { fill: '#111', stroke: '#000' }, // Bead seal
        'GSK_SEAL_DOOR': { fill: '#151515', stroke: '#000' }, // Main door seal
        'Spacer': { fill: '#44444c', stroke: '#222' }, // Glass spacer
        'GSK_EXT_DOOR_GLS': { fill: '#1c1c1c', stroke: '#000' }, // Glass edge seals
        'Profil stal': { fill: '#c0c0d0', stroke: '#555566' }, // Steel reinforcing chamber
        
        // Child2
        'Aluminium Rail': { fill: '#e6e6fa', stroke: '#8a8ab0' }, // Sliding track guide rail
        'BottomTop_EXT': { fill: '#4a4a55', stroke: '#22222a' }, // Outer frame covers
        'BottomTop_INT': { fill: '#555562', stroke: '#22222a' }, // Inner frame covers
        'External hidden support piece': { fill: '#b8860b', stroke: '#554400' }, // Hidden support structural pieces
        'Hidden Piece': { fill: '#cd853f', stroke: '#6b4422' }, // Internal clips/bridges
        'GSK_HIDDEN_PIECE_EXT': { fill: '#0a0a0a', stroke: '#000' }, // Clip seals
        'GSK_LARGE_UNDERNEATH_DOOR': { fill: '#121212', stroke: '#000' }, // Bottom sliding seal gaskets
        'Profile cover exterior': { fill: '#33333b', stroke: '#111115' } // Extra PVC cover profiles
    };

    // Default fallback
    const defaultColor = { fill: 'rgba(200, 200, 200, 0.2)', stroke: '#888888' };

    let svgContent = `<svg viewBox="0 0 ${width} ${height}" width="${width * 4}" height="${height * 4}" xmlns="http://www.w3.org/2000/svg" style="background:#181822; padding: 20px; border-radius: 12px; border: 1px solid #2d2d3d;">
  <defs>
    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#252538" stroke-width="0.5"/>
    </pattern>
  </defs>
  
  <!-- Background Grid -->
  <rect width="100%" height="100%" fill="url(#grid)" />
  
  <g id="geometry">
`;

    // Render layers
    Object.entries(data.layers).forEach(([layerName, lData]) => {
        const cStyle = colors[layerName] || defaultColor;
        
        svgContent += `    <!-- Layer: ${layerName} (${lData.group}) -->\n`;
        lData.contours.forEach((c) => {
            // Flip Y-axis so CAD (Y up) becomes SVG (Y down)
            const flippedPts = c.points.map(p => ({
                x: p.x,
                y: height - p.y
            }));
            
            const [first, ...rest] = flippedPts;
            let dPath = `M ${first.x.toFixed(3)} ${first.y.toFixed(3)}`;
            rest.forEach(p => {
                dPath += ` L ${p.x.toFixed(3)} ${p.y.toFixed(3)}`;
            });
            dPath += ' Z';
            
            svgContent += `    <path d="${dPath}" fill="${cStyle.fill}" stroke="${cStyle.stroke}" stroke-width="0.8" opacity="0.9" id="${c.id}" />\n`;
        });
    });

    // Add a legend
    svgContent += `  </g>\n`;
    svgContent += `</svg>`;

    fs.mkdirSync(path.dirname(svgPath), { recursive: true });
    fs.writeFileSync(svgPath, svgContent);
    console.log(`\n🎉 Successfully generated preview SVG at: ${svgPath}`);
} catch (e) {
    console.error(e);
}
