import fs from 'fs';
import DxfParser from 'dxf-parser';

// Read DXF
const file = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG to DXF conversion tests\\IGLO 5 Drawing1.dxf";
const fileText = fs.readFileSync(file, 'utf-8');
const parser = new DxfParser();
const dxf = parser.parseSync(fileText);

function transformPoint(p, tx, ty, rotDeg, sx, sy) {
  let x = p.x * sx;
  let y = p.y * sy;
  if (rotDeg !== 0) {
    const rad = rotDeg * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const rx = x * cos - y * sin;
    const ry = x * sin + y * cos;
    x = rx;
    y = ry;
  }
  return { x: x + tx, y: y + ty };
}

const shapes = [];

function traverse(ent, tx = 0, ty = 0, rot = 0, sx = 1, sy = 1, name = "") {
  const currentName = name || ent.name || ent.layer;
  if (ent.type === 'INSERT') {
    const block = dxf.blocks[ent.name];
    if (block && block.entities) {
      const itx = ent.position.x || 0;
      const ity = ent.position.y || 0;
      const irot = ent.rotation || 0;
      const isx = ent.xScale ?? 1;
      const isy = ent.yScale ?? 1;
      const absPos = transformPoint({ x: itx, y: ity }, tx, ty, rot, sx, sy);
      block.entities.forEach(child => {
        traverse(child, absPos.x, absPos.y, rot + irot, sx * isx, sy * isy, currentName);
      });
    }
  } else if (ent.type.includes('POLYLINE') && ent.vertices) {
    const abs = ent.vertices.map(v => transformPoint(v, tx, ty, rot, sx, sy));
    shapes.push({ type: 'POLYLINE', name: currentName, layer: ent.layer, colorIndex: ent.colorIndex, vertices: abs });
  } else if (ent.type === 'LINE') {
    const p1 = transformPoint(ent.vertices[0], tx, ty, rot, sx, sy);
    const p2 = transformPoint(ent.vertices[1], tx, ty, rot, sx, sy);
    shapes.push({ type: 'LINE', name: currentName, layer: ent.layer, colorIndex: ent.colorIndex, vertices: [p1, p2] });
  }
}

dxf.entities.forEach(ent => {
  traverse(ent, 0, 0, 0, 1, 1);
});

// Build SVG
let svg = `<svg viewBox="-20 -50 200 250" width="800" height="1000" xmlns="http://www.w3.org/2000/svg" style="background:#111;">`;

// We flip Y-axis for SVG rendering (CAD y goes up, SVG y goes down)
// Min Y is around -30, Max Y is around 150
// So we map Y to 120 - Y
const mapY = (y) => 120 - y;

shapes.forEach(s => {
  if (s.vertices.length < 2) return;
  let stroke = '#888';
  let fill = 'none';
  if (s.name.includes('rama')) stroke = '#ff4444';
  else if (s.name.includes('listwa')) stroke = '#44ff44';
  else if (s.name.includes('szyba')) stroke = '#4444ff';
  else if (s.name.includes('U-001')) stroke = '#ff00ff';
  else if (s.name.includes('wzmocnienie')) stroke = '#ffff00';
  else if (s.name.includes('mostek')) stroke = '#00ffff';

  if (s.type === 'POLYLINE') {
    const points = s.vertices.map(v => `${v.x.toFixed(2)},${mapY(v.y).toFixed(2)}`).join(' ');
    svg += `<polygon points="${points}" stroke="${stroke}" fill="${fill}" stroke-width="0.5" />`;
  } else {
    const p1 = s.vertices[0];
    const p2 = s.vertices[1];
    svg += `<line x1="${p1.x.toFixed(2)}" y1="${mapY(p1.y).toFixed(2)}" x2="${p2.x.toFixed(2)}" y2="${mapY(p2.y).toFixed(2)}" stroke="${stroke}" stroke-width="0.5" />`;
  }
});

svg += `</svg>`;
fs.writeFileSync("scratch/preview.svg", svg);
console.log("Successfully generated scratch/preview.svg");
