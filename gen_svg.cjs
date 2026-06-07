const fs = require('fs');
const data = JSON.parse(fs.readFileSync('src/data/profiles/IgloEdge/SLE201.json', 'utf8'));

let minX = Infinity, maxX = -Infinity;
let minY = Infinity, maxY = -Infinity;

['DOOR_FRM_EXT', 'DOOR_FRM_INT'].forEach(l => {
  if (data.layers[l]) {
    const contour = data.layers[l].contours[0]; // Bottom sash
    contour.points.forEach(p => {
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);
    });
  }
});

let svg = `<svg viewBox="${minX - 10} ${minY - 10} ${maxX - minX + 20} ${maxY - minY + 20}" width="500" height="500" xmlns="http://www.w3.org/2000/svg" style="background: white;">\n`;

['DOOR_FRM_EXT', 'DOOR_FRM_INT'].forEach((l, idx) => {
  const color = idx === 0 ? 'blue' : 'red';
  if (data.layers[l]) {
    const contour = data.layers[l].contours[0];
    let path = 'M ' + contour.points.map(p => `${p.x} ${p.y}`).join(' L ') + ' Z';
    svg += `  <path d="${path}" fill="${color}" fill-opacity="0.2" stroke="${color}" stroke-width="1.5" />\n`;
  }
});

svg += '</svg>';
fs.writeFileSync('C:\\Users\\Shadow\\.gemini\\antigravity\\brain\\e49a0e73-5ed5-4ad1-810b-a11a949791f9\\sash_profile.svg', svg);
