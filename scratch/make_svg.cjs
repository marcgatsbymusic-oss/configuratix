const fs = require('fs');
const data = JSON.parse(fs.readFileSync('scratch/temp_zlozenie_07_prepared.json', 'utf8'));

let svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 -10 100 120" width="800" height="800">';
svg += '<style>path { fill: none; stroke-width: 0.5; }</style>';

for (const [layer, lData] of Object.entries(data.layers)) {
    let color = 'black';
    if (layer.includes('_EXT')) color = 'red';
    if (layer.includes('_INT')) color = 'blue';
    if (layer.includes('GLS')) color = 'green';
    if (layer.includes('GSK')) color = 'purple';
    
    for (const c of lData.contours) {
        svg += `<path d="${c.svgPath}" stroke="${color}" />\n`;
    }
}
svg += '</svg>';
fs.writeFileSync('scratch/visualize.svg', svg);
