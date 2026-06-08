import fs from 'fs';
import DxfParser from 'dxf-parser';

const dxfPath = 'C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\Monday 8th experiment\\IGL5_Vertical Mullion_Fusion_Processed.dxf';

function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function arcToPolyline(cx, cy, r, startDeg, endDeg, segments = 24) {
  let s = (startDeg % 360 + 360) % 360;
  let e = (endDeg   % 360 + 360) % 360;
  if (e <= s) e += 360;
  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const a = ((s + (e - s) * (i / segments)) * Math.PI) / 180;
    pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  }
  return pts;
}

function angleBetween(v1, v2) {
  const dot = v1.x * v2.x + v1.y * v2.y;
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
  if (mag1 === 0 || mag2 === 0) return 0;
  const cosTheta = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
  return Math.acos(cosTheta);
}

function chainSegments(segments, tol = 0.05) {
  if (segments.length === 0) return [];
  const unused = [...segments];
  const chains = [];

  while (unused.length > 0) {
    let seg = unused.splice(0, 1)[0];
    let chain = [...seg.pts];
    let chainEnd = seg.end;
    let currentDir = { x: seg.end.x - seg.start.x, y: seg.end.y - seg.start.y };

    let changed = true;
    while (changed) {
      changed = false;
      let bestIdx = -1;
      let bestIsRev = false;
      let bestDist = Infinity;
      let bestAngleDiff = Infinity;

      for (let i = 0; i < unused.length; i++) {
        const s = unused[i];
        
        let d = dist(chainEnd, s.start);
        if (d <= tol) {
          let nextDir = { x: s.end.x - s.start.x, y: s.end.y - s.start.y };
          let aDiff = angleBetween(currentDir, nextDir);
          if (d < bestDist - 0.001 || (Math.abs(d - bestDist) <= 0.001 && aDiff < bestAngleDiff)) {
              bestDist = d;
              bestAngleDiff = aDiff;
              bestIdx = i;
              bestIsRev = false;
          }
        }
        
        const rev = { start: s.end, end: s.start, pts: [...s.pts].reverse() };
        d = dist(chainEnd, rev.start);
        if (d <= tol) {
          let nextDir = { x: rev.end.x - rev.start.x, y: rev.end.y - rev.start.y };
          let aDiff = angleBetween(currentDir, nextDir);
          if (d < bestDist - 0.001 || (Math.abs(d - bestDist) <= 0.001 && aDiff < bestAngleDiff)) {
              bestDist = d;
              bestAngleDiff = aDiff;
              bestIdx = i;
              bestIsRev = true;
          }
        }
      }

      if (bestIdx !== -1) {
          const s = unused.splice(bestIdx, 1)[0];
          const pts = bestIsRev ? [...s.pts].reverse() : s.pts;
          chain.push(...pts.slice(1));
          chainEnd = pts[pts.length - 1];
          const beforeLast = pts[pts.length - 2];
          currentDir = { x: chainEnd.x - beforeLast.x, y: chainEnd.y - beforeLast.y };
          changed = true;
      }
    }
    chains.push(chain);
  }
  return chains;
}

try {
  const fileText = fs.readFileSync(dxfPath, 'utf-8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(fileText);

  const targetLayer = 'IGL5_Vertical Mullion v1_0'.toUpperCase();
  const lines = dxf.entities.filter(e => e.type === 'LINE' && e.layer.toUpperCase() === targetLayer);
  const arcs = dxf.entities.filter(e => e.type === 'ARC' && e.layer.toUpperCase() === targetLayer);

  console.log(`Found ${lines.length} lines and ${arcs.length} arcs on layer IGL5_Vertical Mullion v1_0.`);

  const segments = [];
  for (const l of lines) {
    segments.push({ start: { x: l.x1, y: l.y1 }, end: { x: l.x2, y: l.y2 }, pts: [{ x: l.x1, y: l.y1 }, { x: l.x2, y: l.y2 }] });
  }
  for (const a of arcs) {
    const pts = arcToPolyline(a.cx, a.cy, a.r, a.startAngle, a.endAngle);
    segments.push({ start: pts[0], end: pts[pts.length - 1], pts });
  }

  // Chain segments with tolerance = 1.5mm (as in dxf_prepare_geometry.mjs)
  const chains = chainSegments(segments, 1.5);
  console.log(`Chained into ${chains.length} contours.`);

  chains.forEach((chain, idx) => {
    const xs = chain.map(p => p.x);
    const ys = chain.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const first = chain[0];
    const last = chain[chain.length - 1];
    const gap = dist(first, last);
    console.log(`Contour ${idx}: ${chain.length} points.`);
    console.log(`  X: ${minX.toFixed(3)} to ${maxX.toFixed(3)} (width: ${(maxX - minX).toFixed(3)} mm)`);
    console.log(`  Y: ${minY.toFixed(3)} to ${maxY.toFixed(3)} (depth: ${(maxY - minY).toFixed(3)} mm)`);
    console.log(`  First: (${first.x.toFixed(3)}, ${first.y.toFixed(3)}), Last: (${last.x.toFixed(3)}, ${last.y.toFixed(3)}), Gap: ${gap.toFixed(3)} mm`);
  });

} catch (err) {
  console.error(err);
}
