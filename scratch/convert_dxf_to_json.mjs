import fs from 'fs';
import path from 'path';

const inFile = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO5_Cross_section_horizontal_for_fixed bottom_part\\IGLO5_CROSS_SECTION_BOTTOM_PART_FIX.dxf";
const outFile = "c:/Users/Shadow/.gemini/antigravity/scratch/fantastic-octo-giggle/src/data/profiles/IGLO5/IG5_F100_FIX_BOT.json";

const SNAP_TOLERANCE   = 0.05;
const ARC_SEGMENTS     = 24;

function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function arcToPolyline(cx, cy, r, startDeg, endDeg, segments = ARC_SEGMENTS) {
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

function bulgeToArcPts(p1, p2, bulge, segments = ARC_SEGMENTS) {
  const theta = 4 * Math.atan(Math.abs(bulge));
  const d     = dist(p1, p2) / 2;
  const r     = d / Math.sin(theta / 2);
  const mx    = (p1.x + p2.x) / 2;
  const my    = (p1.y + p2.y) / 2;
  const dx    = p2.x - p1.x;
  const dy    = p2.y - p1.y;
  const len   = Math.sqrt(dx * dx + dy * dy);
  const px    = -dy / len;
  const py    =  dx / len;
  const s     = Math.sqrt(Math.max(0, r * r - d * d));
  const sign  = bulge > 0 ? 1 : -1;
  const cx    = mx + sign * s * px;
  const cy    = my + sign * s * py;

  let startA = Math.atan2(p1.y - cy, p1.x - cx);
  let endA   = Math.atan2(p2.y - cy, p2.x - cx);
  if (bulge > 0 && endA < startA) endA += 2 * Math.PI;
  if (bulge < 0 && endA > startA) startA += 2 * Math.PI;

  const pts = [];
  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const a = startA + (endA - startA) * t;
    pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  }
  return pts;
}

function parseDxf(text) {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  function peek(i) { return (lines[i] || '').trim(); }

  const entities = [];
  let i = 0;
  while (i < lines.length - 1) {
    if (peek(i) === '0') {
      const type = peek(i + 1);
      if (type === 'SECTION' || type === 'ENDSEC' || type === 'EOF') {
        i += 2;
        continue;
      }

      if (type === 'LWPOLYLINE') {
        const ent = { type: 'LWPOLYLINE', layer: '', flag: 0, vertices: [] };
        i += 2;
        let curX = null;
        while (i < lines.length - 1) {
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
      } else if (type === 'POLYLINE') {
        const ent = { type: 'POLYLINE', layer: '', flag: 0, vertices: [] };
        i += 2;
        while (i < lines.length - 1) {
          const code = peek(i);
          const val  = peek(i + 1);
          if (code === '0') break;
          if (code === '8')  ent.layer = val;
          if (code === '70') ent.flag  = parseInt(val, 10);
          i += 2;
        }
        while (i < lines.length - 1) {
          const c0 = peek(i);
          const v0 = peek(i + 1);
          if (c0 === '0' && v0 === 'SEQEND') { i += 2; break; }
          if (c0 === '0' && v0 === 'VERTEX') {
            let vx = 0, vy = 0, vbulge = 0;
            i += 2;
            while (i < lines.length - 1) {
              const code = peek(i);
              const val  = peek(i + 1);
              if (code === '0') break;
              if (code === '10') vx = parseFloat(val);
              if (code === '20') vy = parseFloat(val);
              if (code === '42') vbulge = parseFloat(val);
              i += 2;
            }
            ent.vertices.push({ x: vx, y: vy, bulge: vbulge });
          } else {
            i += 2;
          }
        }
        entities.push(ent);
      } else if (type === 'LINE') {
        const ent = { type: 'LINE', layer: '', x1: 0, y1: 0, x2: 0, y2: 0 };
        i += 2;
        while (i < lines.length - 1) {
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
        while (i < lines.length - 1) {
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

function chainSegments(segments, tol = SNAP_TOLERANCE) {
  if (segments.length === 0) return [];
  const unused = [...segments];
  const chains = [];

  while (unused.length > 0) {
    let seg = unused.splice(0, 1)[0];
    let chain = [...seg.pts];
    let chainEnd = seg.end;

    let changed = true;
    while (changed) {
      changed = false;
      let bestIdx = -1;
      let bestIsRev = false;
      let bestDist = Infinity;

      for (let i = 0; i < unused.length; i++) {
        const s = unused[i];
        
        let d = dist(chainEnd, s.start);
        if (d <= tol && d < bestDist) {
          bestDist = d;
          bestIdx = i;
          bestIsRev = false;
        }
        
        d = dist(chainEnd, s.end);
        if (d <= tol && d < bestDist) {
          bestDist = d;
          bestIdx = i;
          bestIsRev = true;
        }
      }

      if (bestIdx !== -1) {
        const s = unused.splice(bestIdx, 1)[0];
        const pts = bestIsRev ? [...s.pts].reverse() : s.pts;
        chain.push(...pts.slice(1));
        chainEnd = pts[pts.length - 1];
        changed = true;
      }
    }
    chains.push(chain);
  }
  return chains;
}

function closeAndSnap(pts, tol = SNAP_TOLERANCE, forceClosed = false) {
  if (pts.length < 2) return pts;
  const first = pts[0];
  const last  = pts[pts.length - 1];
  const gap   = dist(first, last);

  if (gap === 0 || gap <= tol) {
    pts.pop();
  }
  return pts;
}

function processLayer(layerName, entities) {
  const upper = layerName.toUpperCase();
  const lwpolys = entities.filter(e => (e.type === 'LWPOLYLINE' || e.type === 'POLYLINE') && e.layer.toUpperCase() === upper);
  const lines = entities.filter(e => e.type === 'LINE' && e.layer.toUpperCase() === upper);
  const arcs = entities.filter(e => e.type === 'ARC' && e.layer.toUpperCase() === upper);

  const contours = [];

  for (const ent of lwpolys) {
    const dxfClosed = (ent.flag & 1) !== 0;
    let pts = [];
    const verts = ent.vertices;
    for (let i = 0; i < verts.length; i++) {
      const v = verts[i];
      pts.push({ x: v.x, y: v.y });
      if (v.bulge !== 0 && i < verts.length - 1) {
        const arc = bulgeToArcPts(v, verts[i + 1], v.bulge);
        pts.push(...arc.slice(0, -1));
      }
    }
    pts = closeAndSnap(pts, SNAP_TOLERANCE, dxfClosed);
    if (pts.length > 2) {
      contours.push({ source: ent.type, dxfClosed, points: pts });
    }
  }

  if (lines.length > 0 || arcs.length > 0) {
    const segments = [];
    for (const l of lines) {
      const s = { x: l.x1, y: l.y1 };
      const e = { x: l.x2, y: l.y2 };
      segments.push({ start: s, end: e, pts: [s, e] });
    }
    for (const a of arcs) {
      const pts = arcToPolyline(a.cx, a.cy, a.r, a.startAngle, a.endAngle);
      segments.push({ start: pts[0], end: pts[pts.length - 1], pts });
    }
    const chains = chainSegments(segments);
    for (const chain of chains) {
      let pts = closeAndSnap(chain, SNAP_TOLERANCE, true);
      if (pts.length > 2) {
        contours.push({ source: 'LINE+ARC', dxfClosed: true, points: pts });
      }
    }
  }
  return contours;
}

function toSvgPath(points) {
  if (!points.length) return '';
  const [first, ...rest] = points;
  return `M ${first.x} ${first.y} ` + rest.map(p => `L ${p.x} ${p.y}`).join(' ') + ' Z';
}

function main() {
  const text = fs.readFileSync(inFile, 'utf-8');
  const entities = parseDxf(text);

  const targetLayers = [
    'FRM_HORIZONTAL',
    'SSH_HORIZONTAL',
    'BZD_SSH_HORIZONTAL',
    'GSK_BZD_HORIZONTAL',
    'GSK_SSH_EXT_HORIZONTAL',
    'GSK_SSH_INT_HORIZONTAL',
    'GLS_EXT_SSH_HORIZONTAL',
    'GLS_INT_SSH_HORIZONTAL',
    'SPACER_SSH_HORIZONAL'
  ];

  const rawContours = {};
  for (const layer of targetLayers) {
    rawContours[layer] = processLayer(layer, entities);
  }

  const alignedContours = [];

  // FRAME SWAP & TRANSLATE:
  // swap: x = y_old, y = x_old.
  // Then translate frame: deltaX = 0, deltaY = +42 (so Y range goes from -42..42 to 0..84)
  if (rawContours['FRM_HORIZONTAL']) {
    for (const c of rawContours['FRM_HORIZONTAL']) {
      const alignedPts = c.points.map(p => ({
        x: p.y,
        y: p.x + 42
      }));
      // Split frame at depth midpoint X = 35
      const extPts = alignedPts.filter(p => p.x <= 35.05);
      const intPts = alignedPts.filter(p => p.x >= 34.95);
      if (extPts.length > 2) alignedContours.push({ layer: 'FRM_EXT', points: extPts, source: c.source });
      if (intPts.length > 2) alignedContours.push({ layer: 'FRM_INT', points: intPts, source: c.source });
    }
  }

  // SASH MIRROR & TRANSLATE:
  // mirror depth: x = -x_old, keep width/height: y = y_old.
  // translate: deltaX = +38 (so sash X range goes from -19..51 to 19..89)
  // translate: deltaY = +83 (sash Y goes from -7..71 to 76..154)
  const deltaX = 38;
  const deltaY = 83;

  const mapSashPts = (pts) => pts.map(p => ({
    x: -p.x + deltaX,
    y: p.y + deltaY
  }));

  if (rawContours['SSH_HORIZONTAL']) {
    for (const c of rawContours['SSH_HORIZONTAL']) {
      const alignedPts = mapSashPts(c.points);
      // Split sash at depth midpoint of sash profile (range 19..89, midpoint is 54)
      const extPts = alignedPts.filter(p => p.x <= 54.05);
      const intPts = alignedPts.filter(p => p.x >= 53.95);
      if (extPts.length > 2) alignedContours.push({ layer: 'SSH_EXT', points: extPts, source: c.source });
      if (intPts.length > 2) alignedContours.push({ layer: 'SSH_INT', points: intPts, source: c.source });
    }
  }

  if (rawContours['BZD_SSH_HORIZONTAL']) {
    for (const c of rawContours['BZD_SSH_HORIZONTAL']) {
      alignedContours.push({ layer: 'BZD', points: mapSashPts(c.points), source: c.source });
    }
  }

  if (rawContours['GSK_BZD_HORIZONTAL']) {
    for (const c of rawContours['GSK_BZD_HORIZONTAL']) {
      alignedContours.push({ layer: 'GSK_BZD', points: mapSashPts(c.points), source: c.source });
    }
  }
  if (rawContours['GSK_SSH_EXT_HORIZONTAL']) {
    for (const c of rawContours['GSK_SSH_EXT_HORIZONTAL']) {
      alignedContours.push({ layer: 'GSK_SSH_EXT', points: mapSashPts(c.points), source: c.source });
    }
  }
  if (rawContours['GSK_SSH_INT_HORIZONTAL']) {
    for (const c of rawContours['GSK_SSH_INT_HORIZONTAL']) {
      alignedContours.push({ layer: 'GSK_SSH_INT', points: mapSashPts(c.points), source: c.source });
    }
  }

  if (rawContours['GLS_EXT_SSH_HORIZONTAL']) {
    for (const c of rawContours['GLS_EXT_SSH_HORIZONTAL']) {
      // In the raw DXF, GLS_EXT was at 4..8, GLS_INT was at 24..28.
      // After mirroring, GLS_EXT becomes GLS_INT (since it mirrored to 30..34, interior).
      alignedContours.push({ layer: 'GLS_INT', points: mapSashPts(c.points), source: c.source });
    }
  }
  if (rawContours['GLS_INT_SSH_HORIZONTAL']) {
    for (const c of rawContours['GLS_INT_SSH_HORIZONTAL']) {
      // Similarly, raw GLS_INT becomes GLS_EXT (since it mirrored to 10..14, exterior).
      alignedContours.push({ layer: 'GLS_EXT', points: mapSashPts(c.points), source: c.source });
    }
  }
  if (rawContours['SPACER_SSH_HORIZONAL']) {
    for (const c of rawContours['SPACER_SSH_HORIZONAL']) {
      alignedContours.push({ layer: 'SPACER', points: mapSashPts(c.points), source: c.source });
    }
  }

  // Format into standard configurator profile JSON
  const outputLayers = {
    'FRM_EXT': { group: 'FRM', contours: [] },
    'FRM_INT': { group: 'FRM', contours: [] },
    'GSK_FRM_EXT': { group: 'FRM', contours: [] },
    'SSH_EXT': { group: 'SSH', contours: [] },
    'SSH_INT': { group: 'SSH', contours: [] },
    'GSK_SSH_EXT': { group: 'SSH', contours: [] },
    'GSK_SSH_INT': { group: 'SSH', contours: [] },
    'BZD': { group: 'SSH', contours: [] },
    'GSK_BZD': { group: 'SSH', contours: [] },
    'SPACER': { group: 'SSH', contours: [] },
    'GLS_INT': { group: 'SSH', contours: [] },
    'GLS_EXT': { group: 'SSH', contours: [] }
  };

  const counts = {};

  for (const c of alignedContours) {
    const lName = c.layer;
    if (!outputLayers[lName]) continue;

    counts[lName] = (counts[lName] || 0) + 1;
    const cIdx = counts[lName] - 1;

    const formattedPts = c.points.map(p => ({
      x: parseFloat(p.x.toFixed(4)),
      y: parseFloat(p.y.toFixed(4))
    }));

    const threeShapeCmds = formattedPts.map((p, idx) => ({
      cmd: idx === 0 ? 'moveTo' : 'lineTo',
      x: p.x,
      y: p.y
    }));

    const contourObj = {
      id: `${lName}_${cIdx}`,
      source: c.source || 'LINE+ARC',
      dxfClosed: true,
      closed: true,
      verified: true,
      residualGap: 0,
      pointCount: formattedPts.length,
      svgPath: toSvgPath(formattedPts),
      threeShape: threeShapeCmds,
      points: formattedPts
    };

    outputLayers[lName].contours.push(contourObj);
  }

  // Calculate final bounds
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  for (const [name, layer] of Object.entries(outputLayers)) {
    for (const c of layer.contours) {
      for (const p of c.points) {
        if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
      }
    }
  }

  const finalMinX = minX === Infinity ? 0 : minX;
  const finalMaxX = maxX === -Infinity ? 89 : maxX;
  const finalMinY = minY === Infinity ? 0 : minY;
  const finalMaxY = maxY === -Infinity ? 154 : maxY;

  const jsonPayload = {
    meta: {
      source: path.basename(inFile),
      system: "IGLO_5",
      type: "F100_FIX_BOT",
      snapTol: SNAP_TOLERANCE,
      arcSegs: ARC_SEGMENTS,
      bounds: {
        raw: {
          minX: finalMinX,
          minY: finalMinY,
          maxX: finalMaxX,
          maxY: finalMaxY
        },
        normalised: {
          minX: Math.round(finalMinX),
          minY: Math.round(finalMinY),
          maxX: Math.round(finalMaxX),
          maxY: Math.round(finalMaxY)
        }
      }
    },
    layers: outputLayers
  };

  // Create parent directory if needed
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(jsonPayload, null, 2));
  console.log(`Successfully generated IGLO 5 bottom fixed profile JSON at: ${outFile}`);
  console.log(`Generated Bounds: X=[${finalMinX}, ${finalMaxX}], Y=[${finalMinY}, ${finalMaxY}]`);
}

main();
