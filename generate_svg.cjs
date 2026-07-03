const fs = require('fs');
const path = require('path');

function transformLoop(loop, offset, rotDeg) {
  const rad = (rotDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return {
    closed: loop.closed,
    pts: loop.pts.map(p => {
       const x = p[0] ?? p.x ?? 0;
       const y = p[1] ?? p.y ?? 0;
       const rx = x * cos - y * sin;
       const ry = x * sin + y * cos;
       return { x: rx + offset[0], y: ry + offset[1] };
    })
  };
}

const dataDir = path.join(__dirname, 'data', 'profiles');
const frame = JSON.parse(fs.readFileSync(path.join(dataDir, 'frame__50001_rama_66mm.json'), 'utf-8'));
const bead = JSON.parse(fs.readFileSync(path.join(dataDir, 'glazing_bead__50924_listwa_22mm.json'), 'utf-8'));
const spacer = JSON.parse(fs.readFileSync(path.join(dataDir, 'spacer_bridge__mostek_podszybowy.json'), 'utf-8'));
const glass = JSON.parse(fs.readFileSync(path.join(dataDir, 'glass__szyba_24mm.json'), 'utf-8'));

const transformed = [];

frame.loops.forEach(l => transformed.push({ color: '#cccccc', ...transformLoop(l, [0, 0], 0) }));
bead.loops.forEach(l => transformed.push({ color: '#ffaaaa', ...transformLoop(l, [66, 55], -90) }));
spacer.loops.forEach(l => transformed.push({ color: '#444444', ...transformLoop(l, [66, 45], -90) }));

// Glass is X=depth, Y=face.
// If we map it to X=face, Y=depth...
// Recipe had glass at [-55.0, 66.0].
// In our mapped coords: Our X = 66.0, Our Y = 70 + (-55.0) = 15.0
// Wait, if we use rot=-90:
glass.loops.forEach(l => transformed.push({ color: '#add8e6', ...transformLoop(l, [66, 15], -90) }));

let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

const paths = transformed.map(loop => {
  if (loop.pts.length === 0) return '';
  const d = loop.pts.map((p, i) => {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
    return `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
  }).join(' ') + (loop.closed ? ' Z' : '');
  return `<path d="${d}" fill="${loop.closed ? loop.color : 'none'}" stroke="black" stroke-width="0.3" opacity="0.8" />`;
});

const padding = 10;
const w = maxX - minX + padding * 2;
const h = maxY - minY + padding * 2;
const vb = `${minX - padding} ${minY - padding} ${w} ${h}`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="100%" height="400px" style="background: white">
  <g transform="scale(1, -1) translate(0, -${maxY + minY})">
    ${paths.join('\n    ')}
  </g>
</svg>`;

console.log(svg);
