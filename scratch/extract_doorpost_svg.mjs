import fs from 'fs';
import path from 'path';

const jsonPath = 'src/data/profiles/IgloEdge/SLE201_DoorPost.json';
const rawData = fs.readFileSync(jsonPath, 'utf8');
const doorPost = JSON.parse(rawData);

const bounds = doorPost.meta.bounds.normalised;
const width = bounds.maxX;
const height = bounds.maxY;

// Clean and format layers into SVG path elements
const colors = {
  'DOOR_POST_FRM_INT': '#e2e8f0', // Interior PVC (Light Slate)
  'DOOR_POST_FRM_EXT': '#cbd5e1', // Exterior PVC (Medium Slate)
  'Cover_panel_Door_INT': '#94a3b8', // Cover panel
  'BZD': '#cbd5e1', // Glazing bead
  'GLS_EXT': 'rgba(56, 189, 248, 0.4)', // Glass Outer
  'GLS_INT': 'rgba(56, 189, 248, 0.4)', // Glass Inner
  'GLS_MD': 'rgba(56, 189, 248, 0.4)',  // Glass Mid
  'GSK_BZD': '#0f172a', // Bead gasket (Dark Charcoal)
  'GSK_DOOR_POST_EXT_GLS_EXT': '#0f172a', // External glass gasket
  'GSK_DOOR_VERTICAL_EXTERIOR': '#0f172a', // Vertical exterior gasket
  'PROFILE FOR EXTERNAL GASKET': '#64748b', // Carrier profile
  'SPACER': '#475569', // Glass spacer
};

const strokes = {
  'DOOR_POST_FRM_INT': '#475569',
  'DOOR_POST_FRM_EXT': '#475569',
  'Cover_panel_Door_INT': '#334155',
  'BZD': '#475569',
  'GLS_EXT': '#0284c7',
  'GLS_INT': '#0284c7',
  'GLS_MD': '#0284c7',
  'GSK_BZD': '#000000',
  'GSK_DOOR_POST_EXT_GLS_EXT': '#000000',
  'GSK_DOOR_VERTICAL_EXTERIOR': '#000000',
  'PROFILE FOR EXTERNAL GASKET': '#334155',
  'SPACER': '#1e293b',
};

let svgPaths = '';

// Loop through each layer to get contours
for (const [layerName, layerData] of Object.entries(doorPost.layers)) {
  const fillColor = colors[layerName] || '#cccccc';
  const strokeColor = strokes[layerName] || '#333333';
  
  if (layerData.contours) {
    layerData.contours.forEach((contour) => {
      svgPaths += `  <!-- ${layerName} (${contour.id}) -->\n`;
      svgPaths += `  <path d="${contour.svgPath}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="0.3" stroke-linejoin="round" />\n`;
    });
  }
}

// Generate the final SVG wrapped in a responsive viewBox
const svg = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg viewBox="-5 -5 ${width + 10} ${height + 10}" width="${width * 4}px" height="${height * 4}px" xmlns="http://www.w3.org/2000/svg">
  <rect x="-5" y="-5" width="${width + 10}" height="${height + 10}" fill="#f8fafc" rx="8" />
  <g transform="scale(1, -1) translate(0, -${height})">
    <!-- SVG Paths from JSON -->
${svgPaths}
  </g>
</svg>
`;

const outPath = 'scratch/doorpost.svg';
fs.writeFileSync(outPath, svg);
console.log(`Generated: ${outPath}`);
