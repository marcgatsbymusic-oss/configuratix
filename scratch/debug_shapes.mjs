import fs from 'fs';

const file = 'src/data/profiles/IgloEdge/IGE_MOVABLE_POST_LEFT_OPENING.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

const gskBzd = data.layers.GSK_BZD.contours;
const poly0 = gskBzd[0].points;
const poly1 = gskBzd[1].points;

const minX = Math.min(...poly0.map(p => p.x));
const maxX = Math.max(...poly0.map(p => p.x));
const minY = Math.min(...poly0.map(p => p.y));
const maxY = Math.max(...poly0.map(p => p.y));

const W = maxX - minX;
const H = maxY - minY;

const scale = 40;
const PAD = 20;
const svgW = W * scale + PAD * 2;
const svgH = H * scale + PAD * 2;

function tx(x) { return (x - minX) * scale + PAD; }
function ty(y) { return svgH - ((y - minY) * scale + PAD); }

function toPath(pts) {
  return 'M ' + pts.map(p => `${tx(p.x)},${ty(p.y)}`).join(' L ') + ' Z';
}

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" style="background:#111;">
  <path d="${toPath(poly0)}" fill="rgba(255, 0, 0, 0.4)" stroke="red" stroke-width="1" />
  <path d="${toPath(poly1)}" fill="rgba(0, 0, 255, 0.6)" stroke="blue" stroke-width="1" />
  <circle cx="${tx(149.5024)}" cy="${ty(18.8630)}" r="4" fill="yellow" />
</svg>
`;

fs.writeFileSync('public/debug_shapes.svg', svg);
console.log('Saved public/debug_shapes.svg');
