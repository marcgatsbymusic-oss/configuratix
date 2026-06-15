import fs from 'fs';
import path from 'path';

const JSON_FILE = "c:/Users/Shadow/.gemini/antigravity/scratch/fantastic-octo-giggle/src/data/profiles/IgloEdge/IGE_F104.json";
const OUT_SVG = "C:\\Users\\Shadow\\.gemini\\antigravity\\brain\\c20ad74c-b504-4f5c-a6e9-537cda9757c1\\finished_profile.svg";

try {
  const data = JSON.parse(fs.readFileSync(JSON_FILE, 'utf-8'));
  const bounds = data.meta.bounds.normalised;
  const width = bounds.maxX;
  const height = bounds.maxY;
  
  // Set up SVG container
  let svg = `<svg viewBox="-10 -10 ${width + 20} ${height + 20}" width="${(width + 20) * 4}" height="${(height + 20) * 4}" xmlns="http://www.w3.org/2000/svg" style="background: #111827; border-radius: 8px;">\n`;
  
  // Grid pattern for background
  svg += `  <defs>
    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#374151" stroke-width="0.5" opacity="0.3"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#grid)" />
  <rect x="-10" y="-10" width="${width + 20}" height="${height + 20}" fill="none" stroke="#374151" stroke-width="1" />
  
  <!-- Title -->
  <text x="10" y="20" fill="#9ca3af" font-family="sans-serif" font-size="6" font-weight="bold">${data.meta.system} - ${data.meta.type} Profile</text>
  <text x="10" y="30" fill="#6b7280" font-family="sans-serif" font-size="4">Source: ${data.meta.source}</text>
  \n`;

  // Define styling for each layer
  const STYLES = {
    // Frame
    'FRM_EXT': { fill: '#4b5563', stroke: '#9ca3af', strokeWidth: 0.5, label: 'Frame Ext' },
    'FRM_INT': { fill: '#6b7280', stroke: '#9ca3af', strokeWidth: 0.5, label: 'Frame Int' },
    // Sash
    'SSH_EXT': { fill: '#374151', stroke: '#4b5563', strokeWidth: 0.5, label: 'Sash Ext' },
    'SSH_INT': { fill: '#4b5563', stroke: '#4b5563', strokeWidth: 0.5, label: 'Sash Int' },
    // Glazing Bead
    'BZD': { fill: '#6b7280', stroke: '#9ca3af', strokeWidth: 0.5, label: 'Glazing Bead' },
    // Glass
    'GLS_EXT': { fill: 'rgba(96, 165, 250, 0.4)', stroke: '#60a5fa', strokeWidth: 0.5, label: 'Glass Ext' },
    'GLS_MD': { fill: 'rgba(96, 165, 250, 0.4)', stroke: '#60a5fa', strokeWidth: 0.5, label: 'Glass Mid' },
    'GLS_INT': { fill: 'rgba(96, 165, 250, 0.4)', stroke: '#60a5fa', strokeWidth: 0.5, label: 'Glass Int' },
    // Spacer
    'SPACER': { fill: '#1f2937', stroke: '#4b5563', strokeWidth: 0.5, label: 'Spacer' },
    // Gaskets (standout magenta color like in AutoCAD)
    'GSK_FRM_EXT': { fill: '#d946ef', stroke: '#ff00ff', strokeWidth: 0.7, label: 'Gasket Frame Ext' },
    'GSK_SSH_EXT': { fill: '#ec4899', stroke: '#ff00ff', strokeWidth: 0.7, label: 'Gasket Sash Ext' },
    'GSK_SSH_INT': { fill: '#f43f5e', stroke: '#ff00ff', strokeWidth: 0.8, label: 'Gasket Sash Int (Bottom Right)' },
    'GSK_BZD': { fill: '#be185d', stroke: '#ff00ff', strokeWidth: 0.7, label: 'Gasket Glazing Bead' }
  };

  // Draw layers in order (Frame, Gaskets, Sash, Spacers, Glass, Glazing Bead)
  const drawOrder = [
    'FRM_EXT', 'FRM_INT', 'SSH_EXT', 'SSH_INT', 'BZD', 'SPACER',
    'GLS_EXT', 'GLS_MD', 'GLS_INT',
    'GSK_FRM_EXT', 'GSK_SSH_EXT', 'GSK_SSH_INT', 'GSK_BZD'
  ];

  drawOrder.forEach(layerName => {
    const layer = data.layers[layerName];
    if (!layer || !layer.contours) return;
    
    const style = STYLES[layerName] || { fill: '#ffffff', stroke: '#000000', strokeWidth: 0.5 };
    
    layer.contours.forEach((contour, cIdx) => {
      // Invert Y axis for standard SVG display coordinate system where Y grows downwards,
      // but standard CAD coordinates have Y growing upwards.
      // So Y_svg = height - Y_cad.
      const pathPoints = contour.points.map(p => {
        const xSvg = p.x;
        const ySvg = height - p.y;
        return `${xSvg.toFixed(3)},${ySvg.toFixed(3)}`;
      });
      
      const pathD = `M ${pathPoints.join(' L ')} Z`;
      
      svg += `  <!-- Layer: ${layerName} (${style.label}) Contour ${cIdx} -->\n`;
      svg += `  <path d="${pathD}" fill="${style.fill}" stroke="${style.stroke}" stroke-width="${style.strokeWidth}" id="${layerName}_${cIdx}" />\n`;
    });
  });

  // Add a Legend
  svg += `  <!-- Legend -->
  <g transform="translate(10, ${height - 40})">
    <rect width="85" height="35" fill="#1f2937" rx="3" opacity="0.9" stroke="#374151" stroke-width="0.5"/>
    
    <rect x="5" y="5" width="4" height="4" fill="#d946ef" stroke="#ff00ff" stroke-width="0.5"/>
    <text x="12" y="9" fill="#e5e7eb" font-family="sans-serif" font-size="3">GSK_FRM_EXT</text>
    
    <rect x="5" y="12" width="4" height="4" fill="#ec4899" stroke="#ff00ff" stroke-width="0.5"/>
    <text x="12" y="16" fill="#e5e7eb" font-family="sans-serif" font-size="3">GSK_SSH_EXT</text>
    
    <rect x="5" y="19" width="4" height="4" fill="#f43f5e" stroke="#ff00ff" stroke-width="0.5"/>
    <text x="12" y="23" fill="#e5e7eb" font-family="sans-serif" font-size="3">GSK_SSH_INT (Corrected)</text>
    
    <rect x="5" y="26" width="4" height="4" fill="#be185d" stroke="#ff00ff" stroke-width="0.5"/>
    <text x="12" y="30" fill="#e5e7eb" font-family="sans-serif" font-size="3">GSK_BZD</text>
  </g>
  \n`;

  svg += '</svg>';
  
  fs.writeFileSync(OUT_SVG, svg, 'utf-8');
  console.log(`\n✅ Generated SVG at: ${OUT_SVG}`);
} catch (e) {
  console.error("❌ Error generating SVG:", e);
}
