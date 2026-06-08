import fs from 'fs';
import path from 'path';

const INPUT_FILE = 'C:/Users/Shadow/Cloud-Drive/Web dev Drutex Product Content/CAD Files Drutex/DWG_TO_DXF_PIPELINE/Monday 8th experiment/Library 3D Processed DXF/IGLO 5/2_IGLO 5 FRAME_AND_ SASH_FUSION PROCESSED.dxf';
const OUT_FILE = 'c:/Users/Shadow/.gemini/antigravity/scratch/fantastic-octo-giggle/src/data/profiles/IGLO5/IG5_F1XXX_1FRM_1SSH.json';

const SNAP_TOLERANCE = 0.05; // mm
const ARC_SEGMENTS = 24;
const SIMPLIFY_TOLERANCE = 0.05; // mm

// Mapping from raw prefixed DXF layers to standard layer names
const LAYER_MAPPING = {
  '2_IGLO 5 FRAME_AND_ SASH V1_IGL5_FRM_EXT':     'FRM_EXT',
  '2_IGLO 5 FRAME_AND_ SASH V1_IGL5_FRM_INT':     'FRM_INT',
  '2_IGLO 5 FRAME_AND_ SASH V1_IGL5_GSK_FRM_EXT': 'GSK_FRM_EXT',
  '2_IGLO 5 FRAME_AND_ SASH V1_IGL5_SSH_EXT':     'SSH_EXT',
  '2_IGLO 5 FRAME_AND_ SASH V1_IGL5_SSH_INT':     'SSH_INT',
  '2_IGLO 5 FRAME_AND_ SASH V1_IGL5_GSK_SSH_INT': 'GSK_SSH_INT',
  '2_IGLO 5 FRAME_AND_ SASH V1_IGL5_BZD':         'BZD',
  '2_IGLO 5 FRAME_AND_ SASH V1_IGL5_GSK_BZD':     'GSK_BZD',
  '2_IGLO 5 FRAME_AND_ SASH V1_IGL5_SPACER':      'SPACER',
  '2_IGLO 5 FRAME_AND_ SASH V1_IGL5_GLS_EXT':     'GLS_EXT',
  '2_IGLO 5 FRAME_AND_ SASH V1_IGL5_GLS_INT':     'GLS_INT',
};

// Groups mapping: CHILD1 (Sash, Glass, Spacer, Bead), CHILD2 (Frame, Frame Gaskets)
const GROUP_MAPPING = {
  CHILD1: ['SSH_EXT', 'SSH_INT', 'GSK_SSH_INT', 'GSK_SSH_EXT', 'GLS_EXT', 'GLS_INT', 'SPACER', 'BZD', 'GSK_BZD'],
  CHILD2: ['FRM_EXT', 'FRM_INT', 'GSK_FRM_EXT'],
};

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
  const mx    = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
  const dx    = p2.x - p1.x, dy = p2.y - p1.y;
  const len   = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return [];
  const px    = -dy / len, py = dx / len;
  const ss    = Math.sqrt(Math.max(0, r * r - d * d));
  const sign  = bulge > 0 ? 1 : -1;
  const cx    = mx + sign * ss * px, cy = my + sign * ss * py;
  let startA  = Math.atan2(p1.y - cy, p1.x - cx);
  let endA    = Math.atan2(p2.y - cy, p2.x - cx);
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

function perpendicularDistance(point, lineStart, lineEnd) {
  let dx = lineEnd.x - lineStart.x, dy = lineEnd.y - lineStart.y;
  const mag = Math.hypot(dx, dy);
  if (mag > 0.0) { dx /= mag; dy /= mag; }
  const pvx = point.x - lineStart.x, pvy = point.y - lineStart.y;
  const pvdot = dx * pvx + dy * pvy;
  return Math.hypot(pvx - pvdot * dx, pvy - pvdot * dy);
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
    const r1 = simplifyDouglasPeucker(points.slice(0, index + 1), epsilon);
    const r2 = simplifyDouglasPeucker(points.slice(index), epsilon);
    return r1.slice(0, -1).concat(r2);
  }
  return [points[0], points[end]];
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

function angleBetween(v1, v2) {
  const dot = v1.x * v2.x + v1.y * v2.y;
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
  if (mag1 === 0 || mag2 === 0) return 0;
  return Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2))));
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
      let bestIdx = -1, bestIsRev = false, bestDist = Infinity, bestAngleDiff = Infinity;
      for (let i = 0; i < unused.length; i++) {
        const s = unused[i];
        let d = dist(chainEnd, s.start);
        if (d <= tol) {
          const nd = { x: s.end.x - s.start.x, y: s.end.y - s.start.y };
          const aDiff = angleBetween(currentDir, nd);
          if (d < bestDist - 0.001 || (Math.abs(d - bestDist) <= 0.001 && aDiff < bestAngleDiff)) {
            bestDist = d; bestAngleDiff = aDiff; bestIdx = i; bestIsRev = false;
          }
        }
        const rev = { start: s.end, end: s.start, pts: [...s.pts].reverse() };
        d = dist(chainEnd, rev.start);
        if (d <= tol) {
          const nd = { x: rev.end.x - rev.start.x, y: rev.end.y - rev.start.y };
          const aDiff = angleBetween(currentDir, nd);
          if (d < bestDist - 0.001 || (Math.abs(d - bestDist) <= 0.001 && aDiff < bestAngleDiff)) {
            bestDist = d; bestAngleDiff = aDiff; bestIdx = i; bestIsRev = true;
          }
        }
      }
      if (bestIdx !== -1) {
        const s = unused.splice(bestIdx, 1)[0];
        const pts = bestIsRev ? [...s.pts].reverse() : s.pts;
        chain.push(...pts.slice(1));
        chainEnd = pts[pts.length - 1];
        const bl = pts[pts.length - 2];
        currentDir = { x: chainEnd.x - bl.x, y: chainEnd.y - bl.y };
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

function processLayer(rawLayerName, entities) {
  const upper = rawLayerName.toUpperCase();
  const lwpolys = entities.filter(e => e.type === 'LWPOLYLINE' && e.layer.toUpperCase() === upper);
  const lines = entities.filter(e => e.type === 'LINE' && e.layer.toUpperCase() === upper);
  const arcs = entities.filter(e => e.type === 'ARC' && e.layer.toUpperCase() === upper);

  const contours = [];

  // LWPOLYLINEs
  for (const ent of lwpolys) {
    const dxfClosed = (ent.flag & 1) !== 0;
    const verts = ent.vertices;
    let pts = [];
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
      contours.push({ source: 'LWPOLYLINE', dxfClosed, points: pts });
    }
  }

  // LINEs and ARCs
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

    const chains = chainSegments(segments, 1.5);
    for (const chain of chains) {
      const pts = closeAndSnap(chain, SNAP_TOLERANCE, true);
      if (pts.length > 2) {
        contours.push({ source: 'LINE+ARC', dxfClosed: true, points: pts });
      }
    }
  }

  // Special for glass/spacer layers drawn as open lines
  const upperStd = LAYER_MAPPING[upper];
  if ((upperStd === 'GLS_EXT' || upperStd === 'GLS_INT' || upperStd === 'SPACER') && contours.length === 0) {
    const allPts = [];
    lines.forEach(l => allPts.push({ x: l.x1, y: l.y1 }, { x: l.x2, y: l.y2 }));
    if (allPts.length >= 2) {
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      allPts.forEach(p => {
        if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
      });
      const rect = [
        { x: minX, y: minY }, { x: maxX, y: minY },
        { x: maxX, y: maxY }, { x: minX, y: maxY },
      ];
      contours.push({ source: 'RECT_FROM_LINES', dxfClosed: true, points: rect });
    }
  }

  return contours.map(c => ({
    ...c,
    points: simplifyContour(c.points, SIMPLIFY_TOLERANCE)
  }));
}

function toSvgPath(points) {
  if (!points.length) return '';
  const [first, ...rest] = points;
  return `M ${first.x} ${first.y} ` + rest.map(p => `L ${p.x} ${p.y}`).join(' ') + ' Z';
}

function toThreeShapeCommands(points) {
  if (!points.length) return [];
  const cmds = [{ cmd: 'moveTo', x: points[0].x, y: points[0].y }];
  for (let i = 1; i < points.length; i++) cmds.push({ cmd: 'lineTo', x: points[i].x, y: points[i].y });
  return cmds;
}

async function main() {
  console.log(`\n📂 Reading: ${INPUT_FILE}`);
  const text = fs.readFileSync(INPUT_FILE, 'utf8');
  const entities = parseDxf(text);
  console.log(`   Parsed ${entities.length} entities`);

  const layerResults = {};
  const foundLayers = new Set(entities.map(e => e.layer?.toUpperCase()).filter(Boolean));
  
  const processRawLayers = Object.keys(LAYER_MAPPING).filter(l => foundLayers.has(l));
  console.log(`\n🔍 Found target layers in DXF: ${processRawLayers.join(', ')}`);

  for (const rawLayer of processRawLayers) {
    const stdLayer = LAYER_MAPPING[rawLayer];
    let contours = processLayer(rawLayer, entities);
    
    // Filter out stray contours (e.g. at raw x < -1.0mm)
    contours = contours.filter(c => {
      const hasStray = c.points.some(p => p.x < -1.0);
      if (hasStray) {
        console.log(`      ⚠️ Ignoring stray contour in raw layer [${rawLayer}] (points have x < -1.0)`);
      }
      return !hasStray;
    });

    if (contours.length > 0) {
      if (stdLayer === 'GSK_FRM_EXT') {
        const frmContours = [];
        const sshContours = [];
        for (const c of contours) {
          let minC = Infinity;
          for (const p of c.points) {
            if (p.x < minC) minC = p.x;
          }
          if (minC > 20.0) {
            sshContours.push(c);
          } else {
            frmContours.push(c);
          }
        }
        if (frmContours.length > 0) {
          layerResults['GSK_FRM_EXT'] = frmContours;
          const totalPts = frmContours.reduce((s, c) => s + c.points.length, 0);
          console.log(`   Split GSK_FRM_EXT (frame part) → Mapped to [GSK_FRM_EXT] (${frmContours.length} contour(s), ${totalPts} points)`);
        }
        if (sshContours.length > 0) {
          layerResults['GSK_SSH_EXT'] = sshContours;
          const totalPts = sshContours.reduce((s, c) => s + c.points.length, 0);
          console.log(`   Split GSK_FRM_EXT (sash part) → Mapped to [GSK_SSH_EXT] (${sshContours.length} contour(s), ${totalPts} points)`);
        }
      } else {
        layerResults[stdLayer] = contours;
        const totalPts = contours.reduce((s, c) => s + c.points.length, 0);
        console.log(`   ${rawLayer.padEnd(42)} → Mapped to [${stdLayer}] (${contours.length} contour(s), ${totalPts} points)`);
      }
    }
  }

  // ── Compute global bounds ──
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  for (const contours of Object.values(layerResults)) {
    for (const c of contours) {
      for (const p of c.points) {
        if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
      }
    }
  }

  console.log(`\n📐 Raw bounding box:`);
  console.log(`   X: ${minX.toFixed(4)} → ${maxX.toFixed(4)} mm (width: ${(maxX - minX).toFixed(4)} mm)`);
  console.log(`   Y: ${minY.toFixed(4)} → ${maxY.toFixed(4)} mm (height: ${(maxY - minY).toFixed(4)} mm)`);

  // ── Normalize coordinates ──
  const normalised = {};
  for (const [stdLayer, contours] of Object.entries(layerResults)) {
    normalised[stdLayer] = contours.map(c => ({
      ...c,
      points: c.points.map(p => ({
        x: parseFloat((p.x - minX).toFixed(6)),
        y: parseFloat((p.y - minY).toFixed(6)),
      })),
    }));
  }

  // ── Build JSON payload ──
  const output = {
    meta: {
      source: path.basename(INPUT_FILE),
      system: 'IGLO_5',
      type: 'F1XXX_1FRM_1SSH',
      bounds: {
        raw: { minX, minY, maxX, maxY },
        normalised: {
          minX: 0, minY: 0,
          maxX: parseFloat((maxX - minX).toFixed(4)),
          maxY: parseFloat((maxY - minY).toFixed(4)),
        },
      },
    },
    groups: GROUP_MAPPING,
    layers: {},
  };

  for (const [stdLayer, contours] of Object.entries(normalised)) {
    // Find which group this layer belongs to
    const groupName = Object.entries(GROUP_MAPPING).find(([, members]) =>
      members.includes(stdLayer)
    )?.[0] ?? null;

    output.layers[stdLayer] = {
      group: groupName,
      contours: contours.map((c, idx) => {
        const firstPt = c.points[0];
        const lastPt = c.points[c.points.length - 1];
        const residGap = dist(firstPt, lastPt);
        const verified = residGap < SNAP_TOLERANCE;
        return {
          id: `${stdLayer}_${idx}`,
          source: c.source,
          dxfClosed: c.dxfClosed ?? false,
          closed: true,
          verified,
          residualGap: parseFloat(residGap.toFixed(6)),
          pointCount: c.points.length,
          svgPath: toSvgPath(c.points),
          threeShape: toThreeShapeCommands(c.points),
          points: c.points,
        };
      }),
    };
  }

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`\n✅ Written output JSON: ${OUT_FILE}`);

  // Summary
  console.log('\n📊 Layer summary:');
  for (const [layer, data] of Object.entries(output.layers)) {
    const cList = data.contours.map(c => `${c.pointCount}pts`).join(' | ');
    console.log(`   ${layer.padEnd(14)} [${(data.group||'?').padEnd(6)}]  ${cList}`);
  }
}

main().catch(err => { console.error('❌', err); process.exit(1); });
