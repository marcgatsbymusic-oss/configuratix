const fs = require('fs');

const inputFile = process.argv[2] || 'src/data/profiles/IGLO5/zlozenie_07_shapes.json';
const outputFile = process.argv[3] || 'scratch/zlozenie_07_solid.svg';

const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

Object.values(data.layers).forEach(layer => {
  layer.contours.forEach(contour => {
    contour.points.forEach(p => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });
  });
});

const width = maxX - minX + 20;
const height = maxY - minY + 20;
const viewBox = `${minX - 10} ${minY - 10} ${width} ${height}`;

// No clip paths needed anymore because the polygons are physically split in JS
let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="800" height="800" style="background: #f0f0f0;">\n`;
svg += `  <g transform="scale(1, -1) translate(0, ${-(minY + maxY)})">\n`; // Flip Y axis to match standard CAD view

const colors = {
  FRM_EXT: '#1e3a8a', // Dark blue
  FRM_INT: '#ffffff', // White
  GSK_FRM_EXT: '#000000', // Black
  BZD: '#ffffff', // White
  GSK_BZD: '#000000', // Black
  GLS_EXT: '#bae6fd', // Light blue
  SPACER: '#9ca3af', // Gray
  POST_EXT: '#1e3a8a',
  POST_INT: '#ffffff',
  GLS_INT: '#bae6fd',
  SSH_EXT: '#1e3a8a',
  SSH_INT: '#ffffff',
  GSK_SSH_EXT: '#000000',
  GSK_SSH_INT: '#000000',
  GSK_POST_EXT: '#000000',
};

for (const [layerName, layer] of Object.entries(data.layers)) {
  const color = colors[layerName] || 'gray';
  const stroke = '#333';
  
  for (const contour of layer.contours) {
    if (contour.svgPath) {
      svg += `    <path d="${contour.svgPath}" fill="${color}" stroke="${stroke}" stroke-width="0.3" opacity="0.9" />\n`;
    } else if (contour.points && contour.points.length > 0) {
      const d = "M " + contour.points.map(p => p.x + "," + p.y).join(" L ") + (contour.closed ? " Z" : "");
      svg += `    <path d="${d}" fill="${color}" stroke="${stroke}" stroke-width="0.3" opacity="0.9" />\n`;
    }
  }
}

svg += `  </g>\n`;
svg += `</svg>`;

fs.writeFileSync(outputFile, svg);
console.log(`SVG written to ${outputFile}`);

