import fs from 'fs';
import DxfParser from 'dxf-parser';

const file = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG to DXF conversion tests\\IGLO 5 Drawing1.dxf";
const fileText = fs.readFileSync(file, 'utf-8');
const parser = new DxfParser();
const dxf = parser.parseSync(fileText);

const beadBlock = dxf.blocks["50924 - listwa 22mm"];
const poly = beadBlock.entities[0];

function interpolateVertices(vertices) {
  const result = [];
  
  for (let i = 0; i < vertices.length; i++) {
    const current = vertices[i];
    const next = vertices[(i + 1) % vertices.length];
    
    result.push({ x: current.x, y: current.y });
    
    if (current.bulge && Math.abs(current.bulge) > 0.0001) {
      const b = current.bulge;
      const x1 = current.x;
      const y1 = current.y;
      const x2 = next.x;
      const y2 = next.y;
      
      const dx = x2 - x1;
      const dy = y2 - y1;
      const d = Math.hypot(dx, dy);
      
      if (d > 0.0001) {
        const s = b * d / 2;
        const r = (d * (1 + b * b)) / (4 * b);
        
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        
        const ux = -dy / d;
        const uy = dx / d;
        
        const h = r - s;
        
        const cx = mx + h * ux;
        const cy = my + h * uy;
        
        let a1 = Math.atan2(y1 - cy, x1 - cx);
        let a2 = Math.atan2(y2 - cy, x2 - cx);
        
        const isCcw = b > 0;
        
        if (isCcw) {
          if (a2 < a1) a2 += 2 * Math.PI;
        } else {
          if (a2 > a1) a2 -= 2 * Math.PI;
        }
        
        const angleDiff = a2 - a1;
        const steps = Math.max(1, Math.ceil(Math.abs(angleDiff) * 180 / (Math.PI * 10)));
        
        for (let sIdx = 1; sIdx < steps; sIdx++) {
          const t = sIdx / steps;
          const angle = a1 + angleDiff * t;
          const px = cx + Math.abs(r) * Math.cos(angle);
          const py = cy + Math.abs(r) * Math.sin(angle);
          result.push({ x: px, y: py });
        }
      }
    }
  }
  
  return result;
}

const interpolated = interpolateVertices(poly.vertices);
console.log(`Original vertices: ${poly.vertices.length}`);
console.log(`Interpolated vertices: ${interpolated.length}`);
console.log(`First 20 interpolated:`);
interpolated.slice(0, 20).forEach((v, idx) => {
  console.log(`  v[${idx}]: (${v.x.toFixed(4)}, ${v.y.toFixed(4)})`);
});
