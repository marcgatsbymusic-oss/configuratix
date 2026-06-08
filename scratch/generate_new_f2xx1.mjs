import fs from 'fs';
import path from 'path';

const dxfPath = 'C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\Monday 8th experiment\\IGL5_Vertical Mullion_Fusion_Processed.dxf';
const baseJsonPath = 'src/data/profiles/IGLO5/IG5_F103.json';
const outputJsonPath = 'src/data/profiles/IGLO5/IG5_F2XX1.json';

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

function parseDxf(text) {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  function peek(i) { return (lines[i] || '').trim(); }
  function seekSection(name, start = 0) {
    for (let i = start; i < lines.length - 1; i++) {
      if (peek(i) === '2' && peek(i + 1) === name) return i + 2;
    }
    return -1;
  }

  const entities = [];
  const entStart = seekSection('ENTITIES');
  if (entStart < 0) throw new Error('No ENTITIES section found in DXF');

  let i = entStart;
  while (i < lines.length) {
    if (peek(i) === '0') {
      const type = peek(i + 1);
      if (type === 'ENDSEC' || type === 'EOF') break;

      if (type === 'LWPOLYLINE') {
        const ent = { type: 'LWPOLYLINE', layer: '', flag: 0, vertices: [] };
        i += 2;
        let curX = null;
        while (i < lines.length) {
          const code = peek(i);
          const val  = peek(i + 1);
          if (code === '0') break;
          if (code === '8')  ent.layer = val;
          if (code === '70') ent.flag  = parseInt(val, 10);
          if (code === '10') curX = parseFloat(val);
          if (code === '20' && curX !== null) {
            ent.vertices.push({ x: curX, y: parseFloat(val), bulge: 0 });
            curX = null;
          }
          if (code === '42' && ent.vertices.length > 0) {
            ent.vertices[ent.vertices.length - 1].bulge = parseFloat(val);
          }
          i += 2;
        }
        entities.push(ent);

      } else if (type === 'LINE') {
        const ent = { type: 'LINE', layer: '', x1: 0, y1: 0, x2: 0, y2: 0 };
        i += 2;
        while (i < lines.length) {
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
        while (i < lines.length) {
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
  return entities;
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

// --- Douglas-Peucker Simplification ---
function perpendicularDistance(point, lineStart, lineEnd) {
  let dx = lineEnd.x - lineStart.x;
  let dy = lineEnd.y - lineStart.y;
  const mag = Math.hypot(dx, dy);
  if (mag > 0.0) { dx /= mag; dy /= mag; }
  const pvx = point.x - lineStart.x;
  const pvy = point.y - lineStart.y;
  const pvdot = dx * pvx + dy * pvy;
  const rx = pvx - pvdot * dx;
  const ry = pvy - pvdot * dy;
  return Math.hypot(rx, ry);
}

function simplifyDouglasPeucker(points, epsilon) {
  if (points.length <= 2) return points;
  let dmax = 0, index = 0;
  const end = points.length - 1;
  for (let i = 1; i < end; i++) {
    const d = perpendicularDistance(points[i], points[0], points[end]);
    if (d > dmax) { index = i; dmax = d; }
  }
  if (dmax > epsilon) {
    const rec1 = simplifyDouglasPeucker(points.slice(0, index + 1), epsilon);
    const rec2 = simplifyDouglasPeucker(points.slice(index), epsilon);
    return rec1.slice(0, -1).concat(rec2);
  } else {
    return [points[0], points[end]];
  }
}

function simplifyContour(points, epsilon) {
  if (points.length <= 3) return points;
  let dmax = 0, splitIdx = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const d = Math.hypot(points[i].x - points[0].x, points[i].y - points[0].y);
    if (d > dmax) { dmax = d; splitIdx = i; }
  }
  if (splitIdx === 0) return points;
  const half1 = simplifyDouglasPeucker(points.slice(0, splitIdx + 1), epsilon);
  const half2 = simplifyDouglasPeucker(points.slice(splitIdx), epsilon);
  return half1.slice(0, -1).concat(half2);
}

function getSvgPath(vertices) {
  if (!vertices || vertices.length === 0) return "";
  let p = `M ${vertices[0].x.toFixed(4)} ${vertices[0].y.toFixed(4)} `;
  for (let i = 1; i < vertices.length; i++) {
    p += `L ${vertices[i].x.toFixed(4)} ${vertices[i].y.toFixed(4)} `;
  }
  p += 'Z';
  return p;
}

try {
  console.log(`Reading DXF from: ${dxfPath}`);
  const fileText = fs.readFileSync(dxfPath, 'utf-8');
  const entities = parseDxf(fileText);

  const targetLayer = 'IGL5_Vertical Mullion v1_0'.toUpperCase();
  const lines = entities.filter(e => e.type === 'LINE' && e.layer.toUpperCase() === targetLayer);
  const arcs = entities.filter(e => e.type === 'ARC' && e.layer.toUpperCase() === targetLayer);

  console.log(`Found ${lines.length} lines and ${arcs.length} arcs on layer ${targetLayer}.`);

  const segments = [];
  for (const l of lines) {
    segments.push({ start: { x: l.x1, y: l.y1 }, end: { x: l.x2, y: l.y2 }, pts: [{ x: l.x1, y: l.y1 }, { x: l.x2, y: l.y2 }] });
  }
  for (const a of arcs) {
    const pts = arcToPolyline(a.cx, a.cy, a.r, a.startAngle, a.endAngle);
    segments.push({ start: pts[0], end: pts[pts.length - 1], pts });
  }

  const chains = chainSegments(segments, 1.5);
  console.log(`Chained into ${chains.length} contours.`);

  const processedChains = chains.map(chain => {
    const first = chain[0];
    const last = chain[chain.length - 1];
    const d = dist(first, last);
    if (d > 0 && d <= 1.5) {
      const copy = [...chain];
      copy.pop();
      return copy;
    }
    return chain;
  });

  const sorted = processedChains.map((chain, idx) => {
    const xs = chain.map(p => p.x);
    const ys = chain.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    return {
      pts: chain,
      minX, maxX, minY, maxY,
      width: maxX - minX,
      depth: maxY - minY
    };
  }).sort((a, b) => b.width - a.width);

  const cWide = sorted[0];
  const cNarrow = sorted[1];

  console.log(`Selected wide contour (PST_INT): width=${cWide.width.toFixed(3)}mm, depth=${cWide.depth.toFixed(3)}mm`);
  console.log(`Selected narrow contour (PST_EXT): width=${cNarrow.width.toFixed(3)}mm, depth=${cNarrow.depth.toFixed(3)}mm`);

  const centerY = 42.605;
  const depthLimit = 70.0;

  const transformPoints = (pts) => {
    return pts.map(p => ({
      x: parseFloat((depthLimit - p.x).toFixed(4)),
      y: parseFloat((p.y - centerY).toFixed(4))
    }));
  };

  const pstIntRaw = transformPoints(cWide.pts);
  const pstExtRaw = transformPoints(cNarrow.pts);

  const epsilon = 0.05;
  const pstIntVerts = simplifyContour(pstIntRaw, epsilon);
  const pstExtVerts = simplifyContour(pstExtRaw, epsilon);

  console.log(`PST_INT simplified: ${pstIntRaw.length} -> ${pstIntVerts.length} pts`);
  console.log(`PST_EXT simplified: ${pstExtRaw.length} -> ${pstExtVerts.length} pts`);

  console.log(`Loading base profiles from: ${baseJsonPath}`);
  const baseJson = JSON.parse(fs.readFileSync(baseJsonPath, 'utf-8'));
  const targetProfiles = { ...baseJson.profiles };

  targetProfiles['PST_EXT'] = {
    svgPath: getSvgPath(pstExtVerts),
    vertices: pstExtVerts
  };

  targetProfiles['PST_INT'] = {
    svgPath: getSvgPath(pstIntVerts),
    vertices: pstIntVerts
  };

  const outputData = {
    system: "IGLO_5",
    type: "F2XX1",
    profiles: targetProfiles
  };

  fs.mkdirSync(path.dirname(outputJsonPath), { recursive: true });
  fs.writeFileSync(outputJsonPath, JSON.stringify(outputData, null, 2));
  console.log(`Successfully generated and written output file: ${outputJsonPath}`);

} catch (err) {
  console.error('Error during profile processing:', err);
}
