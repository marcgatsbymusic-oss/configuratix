import fs from 'fs';
import DxfParser from 'dxf-parser';

const file = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG to DXF conversion tests\\IGLO 5 Drawing1.dxf";
const fileText = fs.readFileSync(file, 'utf-8');
const parser = new DxfParser();
const dxf = parser.parseSync(fileText);

const block = dxf.blocks["640301SEITE"];
console.log(`Analyzing block 640301SEITE. Total entities: ${block.entities.length}`);

// We want to reconstruct connected paths from the lines and arcs.
// Let's print all entities with their start and end points
const segments = [];
block.entities.forEach((ent, idx) => {
  if (ent.type === 'LINE') {
    segments.push({
      type: 'LINE',
      p1: { x: ent.vertices[0].x, y: ent.vertices[0].y },
      p2: { x: ent.vertices[1].x, y: ent.vertices[1].y }
    });
  } else if (ent.type === 'ARC') {
    // For ARC, dxf-parser gives center, radius, startAngle, endAngle
    // Let's approximate start and end points
    const r = ent.radius;
    const cx = ent.center.x;
    const cy = ent.center.y;
    const a1 = ent.startAngle * Math.PI / 180;
    const a2 = ent.endAngle * Math.PI / 180;
    segments.push({
      type: 'ARC',
      p1: { x: cx + r * Math.cos(a1), y: cy + r * Math.sin(a1) },
      p2: { x: cx + r * Math.cos(a2), y: cy + r * Math.sin(a2) },
      center: { x: cx, y: cy },
      radius: r,
      a1,
      a2
    });
  }
});

console.log("Segments:");
segments.forEach((s, idx) => {
  console.log(`Seg #${idx}: type=${s.type}, p1=(${s.p1.x.toFixed(2)}, ${s.p1.y.toFixed(2)}), p2=(${s.p2.x.toFixed(2)}, ${s.p2.y.toFixed(2)})`);
});

// Let's calculate the bounding box of the block relative to its insert
let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
segments.forEach(s => {
  [s.p1, s.p2].forEach(p => {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  });
});
console.log(`\nBlock 640301SEITE local bounding box:`);
console.log(`  min=(${minX.toFixed(2)}, ${minY.toFixed(2)}), max=(${maxX.toFixed(2)}, ${maxY.toFixed(2)}), size=(${ (maxX - minX).toFixed(2) } x ${ (maxY - minY).toFixed(2) })`);
