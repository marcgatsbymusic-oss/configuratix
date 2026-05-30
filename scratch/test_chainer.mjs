import fs from 'fs';
import path from 'path';

// Copied subset from dxf_prepare_geometry.mjs to test chainer

const SNAP_TOLERANCE = 1.5;

function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function angleBetween(v1, v2) {
    const dot = v1.x * v2.x + v1.y * v2.y;
    const mag1 = Math.sqrt(v1.x*v1.x + v1.y*v1.y);
    const mag2 = Math.sqrt(v2.x*v2.x + v2.y*v2.y);
    if (mag1 === 0 || mag2 === 0) return 0;
    const cosTheta = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
    return Math.acos(cosTheta);
}

function chainSegments(segments, tol = SNAP_TOLERANCE) {
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
        
        // Forward check
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
        
        // Reverse check
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
          // Update currentDir based on last segment of the new addition
          const beforeLast = pts[pts.length - 2];
          currentDir = { x: chainEnd.x - beforeLast.x, y: chainEnd.y - beforeLast.y };
          changed = true;
      }
    }
    chains.push(chain);
  }
  return chains;
}

// Minimal DXF parser just for LINE and ARC
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

const text = fs.readFileSync('C:/Users/Shadow/Cloud-Drive/Web dev Drutex Product Content/CAD Files Drutex/DWG to DXF conversion tests/testing new layers.dxf', 'utf8');
const linesText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

function peek(i) { return (linesText[i] || '').trim(); }
function seekSection(name, start = 0) {
  for (let i = start; i < linesText.length - 1; i++) {
    if (peek(i) === '2' && peek(i + 1) === name) return i + 2;
  }
  return -1;
}

const entities = [];
const entStart = seekSection('ENTITIES');
let i = entStart;
while (i < linesText.length) {
  if (peek(i) === '0') {
    const type = peek(i + 1);
    if (type === 'ENDSEC' || type === 'EOF') break;
    
    if (type === 'LINE') {
        const ent = { type: 'LINE', layer: '', x1: 0, y1: 0, x2: 0, y2: 0 };
        i += 2;
        while (i < linesText.length) {
          const code = peek(i);
          const val  = peek(i + 1);
          if (code === '0') break;
          if (code === '8')  ent.layer = val;
          if (code === '10') ent.x1 = parseFloat(val);
          if (code === '20') ent.y1 = parseFloat(val);
          if (code === '11') ent.x2 = parseFloat(val);
          if (code === '21') ent.y2 = parseFloat(val);
          i += 2;
        }
        entities.push(ent);
    } else if (type === 'ARC') {
        const ent = { type: 'ARC', layer: '', cx: 0, cy: 0, r: 0, startAngle: 0, endAngle: 360 };
        i += 2;
        while (i < linesText.length) {
          const code = peek(i);
          const val  = peek(i + 1);
          if (code === '0') break;
          if (code === '8')  ent.layer      = val;
          if (code === '10') ent.cx         = parseFloat(val);
          if (code === '20') ent.cy         = parseFloat(val);
          if (code === '40') ent.r          = parseFloat(val);
          if (code === '50') ent.startAngle = parseFloat(val);
          if (code === '51') ent.endAngle   = parseFloat(val);
          i += 2;
        }
        entities.push(ent);
    } else {
        i += 2;
    }
  } else {
    i += 2;
  }
}

const frmExt = entities.filter(e => e.layer === 'FRM_EXT');
const frmInt = entities.filter(e => e.layer === 'FRM_INT');

function testLayer(name, ents) {
    const segments = [];
    for (const l of ents) {
      if (l.type === 'LINE') {
          const s = { x: l.x1, y: l.y1 };
          const e = { x: l.x2, y: l.y2 };
          segments.push({ start: s, end: e, pts: [s, e] });
      } else if (l.type === 'ARC') {
          const pts = arcToPolyline(l.cx, l.cy, l.r, l.startAngle, l.endAngle);
          segments.push({ start: pts[0], end: pts[pts.length - 1], pts });
      }
    }
    const chains = chainSegments(segments);
    console.log(`${name}: ${chains.length} chains formed.`);
    chains.forEach((c, idx) => {
        const gap = dist(c[0], c[c.length-1]);
        console.log(`  Chain ${idx}: ${c.length} pts, gap = ${gap.toFixed(3)}mm`);
    });
}

testLayer('FRM_EXT', frmExt);
testLayer('FRM_INT', frmInt);
