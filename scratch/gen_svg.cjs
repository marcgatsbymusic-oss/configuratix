const fs = require('fs');
const z30 = JSON.parse(fs.readFileSync('src/data/profiles/IGLO5/zlozenie_30.json', 'utf8'));

let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
let paths = [];

const colors = {
  'POST_EXT': 'cyan',
  'POST_INT': 'white',
  'SSH_EXT': 'cyan',
  'SSH_INT': 'white',
  'BZD_SSH': 'white',
  'GSK_POST_EXT': 'black',
  'GSK_SSH_INT': 'black',
  'GSK_SSH_EXT': 'black',
  'GSK_BZD_SSH': 'black',
  'GLS_EXT': 'rgba(100, 200, 255, 0.5)',
  'GLS_INT': 'rgba(100, 200, 255, 0.5)',
  'SPACER_SSH': 'gray',
  'STEEL_POST': 'silver',
  'STEEL_SSH': 'silver'
};

for (const [layerName, layer] of Object.entries(z30.layers)) {
  for (const contour of layer.contours) {
    let d = '';
    contour.points.forEach((p, i) => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
      
      d += i === 0 ? 'M ' + p.x + ' ' + (-p.y) + ' ' : 'L ' + p.x + ' ' + (-p.y) + ' ';
    });
    if (contour.closed) d += 'Z';
    
    const color = colors[layerName] || 'magenta';
    paths.push({ d, color, layerName });
  }
}

// Add some padding
const padding = 10;
minX -= padding;
maxX += padding;
// Y is flipped!
const origMinY = minY;
const origMaxY = maxY;
minY = -origMaxY - padding;
maxY = -origMinY + padding;

const width = maxX - minX;
const height = maxY - minY;

let svg = '<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"' + minX + ' ' + minY + ' ' + width + ' ' + height + '\" style=\"background-color:#1e1e1e; width:100%; height:auto;\">\n';
paths.forEach(path => {
  svg += '  <path d=\"' + path.d + '\" fill=\"' + path.color + '\" stroke=\"#555\" stroke-width=\"0.5\"><title>' + path.layerName + '</title></path>\n';
});
svg += '</svg>';

fs.writeFileSync('public/zlozenie_30.svg', svg);
console.log('Done SVG public!');
