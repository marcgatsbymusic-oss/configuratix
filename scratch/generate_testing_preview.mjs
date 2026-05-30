import fs from 'fs';

const inFile = 'scratch/testing_new_layers_prepared.json';
const outFile = 'C:/Users/Shadow/.gemini/antigravity/brain/989a5b0a-51bb-46e5-a858-9c57e2106a71/geometry_preview.svg';

try {
  const data = JSON.parse(fs.readFileSync(inFile, 'utf8'));
  const bounds = data.meta.bounds.normalised;
  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;

  // Let's add some margin and scale
  const scale = 5;
  const pad = 20;
  const svgW = width * scale + pad * 2;
  const svgH = height * scale + pad * 2;

  // Group colors
  const colors = {
    FRM_EXT: '#e63946',
    FRM_INT: '#457b9d',
    GSK_FRM_EXT: '#1d3557',
    SSH_EXT: '#f4a261',
    SSH_INT: '#2a9d8f',
    GSK_SSH_EXT: '#e9c46a',
    GSK_SSH_INT: '#e76f51',
    BZD: '#8338ec',
    GSK_BZD: '#3a0ca3',
    SPACER: '#ffb703',
    GLS_INT: '#8ecae6',
    GLS_EXT: '#219ebc'
  };

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgW} ${svgH}" style="background:#f8f9fa;">\n`;
  
  // Add a simple legend
  let legendY = 20;
  for (const [layer, color] of Object.entries(colors)) {
      if (data.layers[layer]) {
          svg += `<rect x="20" y="${legendY - 10}" width="15" height="15" fill="${color}" />`;
          svg += `<text x="45" y="${legendY}" font-family="sans-serif" font-size="12" fill="#333">${layer}</text>`;
          legendY += 20;
      }
  }

  svg += `<g transform="translate(${pad}, ${pad}) scale(${scale})">\n`;
  // DXF has Y up, SVG has Y down. We flip Y and translate by height so it's upright.
  // We also translate to center in case bounds.minX > 0, but normalised minX is 0.
  svg += `<g transform="translate(0, ${height}) scale(1, -1)">\n`;

  for (const [layer, lData] of Object.entries(data.layers)) {
    const color = colors[layer] || '#000000';
    for (const contour of lData.contours) {
      // Draw closed shapes with a faint fill to show the auto-close lines clearly
      // We will also stroke them. 
      svg += `<path d="${contour.svgPath}" fill="${color}44" stroke="${color}" stroke-width="${1.5/scale}" />\n`;
    }
  }

  svg += `</g></g></svg>`;

  fs.writeFileSync(outFile, svg);
  console.log(`Generated SVG preview at ${outFile}`);
} catch (err) {
  console.error(err);
}
