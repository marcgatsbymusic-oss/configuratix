import fs from 'fs';

const data = JSON.parse(fs.readFileSync('src/data/profiles/IGLO5/IG5_F101C.json', 'utf8'));

let svg = '<svg viewBox="-50 -50 200 200" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="white" stroke-width="0.5">\n';

Object.entries(data.layers).forEach(([layer, lData]) => {
  const color = layer.includes('EXT') ? '#ff4444' : (layer.includes('INT') ? '#4444ff' : '#44ff44');
  lData.contours.forEach(c => {
    svg += '  <path d="' + c.svgPath + '" stroke="'+color+'" />\n';
  });
});

svg += '</svg>';

fs.writeFileSync('preview_F101C.svg', svg);
