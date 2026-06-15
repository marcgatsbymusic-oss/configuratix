import fs from 'fs';
import path from 'path';
import DxfParser from 'dxf-parser';

const dxfPath = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\Monday 8th experiment\\Roller_Blind_225.dxf";
const outDir = "c:\\Users\\Shadow\\.gemini\\antigravity\\scratch\\fantastic-octo-giggle\\src\\data\\profiles";
const outPath = path.join(outDir, "ROLLER_BLIND_BOX_225.json");

const SIMPLIFY_TOLERANCE = 0.05; // mm
const SNAP_TOLERANCE = 0.05; // mm

function dist(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function arcToPolyline(cx, cy, r, startAngleRad, endAngleRad, segments = 16) {
  let s = startAngleRad;
  let e = endAngleRad;
  if (e <= s) e += 2 * Math.PI;
  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const a = s + (e - s) * (i / segments);
    pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  }
  return pts;
}

function angleBetween(v1, v2) {
  const dot = v1.x * v2.x + v1.y * v2.y;
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
  if (mag1 === 0 || mag2 === 0) return 0;
  return Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2))));
}

function chainSegments(segments, tol = 1.5) {
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
        
        // Forward
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
        
        // Reverse
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

function extractBlockContours(block) {
  const segments = [];
  const polys = [];

  block.entities?.forEach(ent => {
    if (ent.type === 'LINE') {
      const s = ent.vertices[0];
      const e = ent.vertices[1];
      segments.push({ start: s, end: e, pts: [s, e] });
    } else if (ent.type === 'ARC') {
      const pts = arcToPolyline(ent.center.x, ent.center.y, ent.radius, ent.startAngle, ent.endAngle);
      segments.push({ start: pts[0], end: pts[pts.length - 1], pts });
    } else if (ent.type === 'LWPOLYLINE' || ent.type === 'POLYLINE') {
      const pts = ent.vertices.map(v => ({ x: v.x, y: v.y }));
      const isClosed = ent.shape || (ent.flag & 1) !== 0;
      polys.push({ points: pts, closed: isClosed });
    }
  });

  const contours = [];
  
  // Process existing closed polylines
  polys.forEach(p => {
    let pts = [...p.points];
    if (p.closed && dist(pts[0], pts[pts.length - 1]) > 0.001) {
      // snap check or close
      if (dist(pts[0], pts[pts.length - 1]) <= SNAP_TOLERANCE) {
        pts.pop();
      }
    }
    if (pts.length > 2) {
      contours.push(pts);
    }
  });

  // Chain line/arc segments
  if (segments.length > 0) {
    const chains = chainSegments(segments, 1.5);
    chains.forEach(chain => {
      let pts = [...chain];
      if (dist(pts[0], pts[pts.length - 1]) <= SNAP_TOLERANCE) {
        pts.pop();
      } else {
        // force close
        pts.pop();
      }
      if (pts.length > 2) {
        contours.push(pts);
      }
    });
  }

  // Simplify all contours
  return contours.map(c => simplifyContour(c, SIMPLIFY_TOLERANCE));
}

function toSvgPath(points) {
  if (!points.length) return '';
  const [first, ...rest] = points;
  return `M ${first.x} ${first.y} ` +
         rest.map(p => `L ${p.x} ${p.y}`).join(' ') +
         ' Z';
}

function toThreeShapeCommands(points) {
  if (!points.length) return [];
  const cmds = [{ cmd: 'moveTo', x: points[0].x, y: points[0].y }];
  for (let i = 1; i < points.length; i++) {
    cmds.push({ cmd: 'lineTo', x: points[i].x, y: points[i].y });
  }
  return cmds;
}

try {
  const fileText = fs.readFileSync(dxfPath, 'utf-8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(fileText);

  // 1. Process box casing profiles
  // We want to translate them by: X - 669.89, Y - 200.00
  const BOX_X_REF = 669.89;
  const BOX_Y_REF = 200.00;

  const boxProfileNames = ['R0021-A', 'R0022-A', 'R0023', 'R0024-A', 'R0027-A', 'R0029-A'];
  const boxProfiles = {};

  boxProfileNames.forEach(name => {
    const block = dxf.blocks[name];
    if (!block) return;
    
    // Find the insert of this block to get its global position
    const insert = dxf.entities.find(e => e.type === 'INSERT' && e.name === name);
    if (!insert) return;

    // Extract raw contours from block definition
    const rawContours = extractBlockContours(block);

    // Apply insert rotation, scale, and translation, then subtract references
    const resolvedContours = rawContours.map(contour => {
      return contour.map(p => {
        let x = p.x;
        let y = p.y;
        
        // Rotate
        if (insert.rotation) {
          const rad = (insert.rotation * Math.PI) / 180;
          const cos = Math.cos(rad);
          const sin = Math.sin(rad);
          const rx = x * cos - y * sin;
          const ry = x * sin + y * cos;
          x = rx;
          y = ry;
        }

        // Translate
        x += insert.position.x;
        y += insert.position.y;

        // Translate to box relative coordinates
        const rx = parseFloat((x - BOX_X_REF).toFixed(4));
        const ry = parseFloat((y - BOX_Y_REF).toFixed(4));
        return { x: rx, y: ry };
      });
    });

    boxProfiles[name] = resolvedContours.map((c, idx) => ({
      id: `${name}_${idx}`,
      svgPath: toSvgPath(c),
      threeShape: toThreeShapeCommands(c),
      points: c
    }));
  });

  // 2. Process slat profile (póro 37mm)
  // We normalize so center of bounding box in X is 0, and Y is from 0 to H
  const slatBlock = dxf.blocks['póro 37mm'];
  const slatRawContours = extractBlockContours(slatBlock);
  
  // Find bounds of raw contours
  let sMinX = Infinity, sMaxX = -Infinity, sMinY = Infinity, sMaxY = -Infinity;
  slatRawContours.forEach(contour => {
    contour.forEach(p => {
      sMinX = Math.min(sMinX, p.x);
      sMaxX = Math.max(sMaxX, p.x);
      sMinY = Math.min(sMinY, p.y);
      sMaxY = Math.max(sMaxY, p.y);
    });
  });
  
  const slatCenterX = (sMinX + sMaxX) / 2;
  const slatMinY = sMinY;

  const slatContours = slatRawContours.map(contour => {
    return contour.map(p => ({
      x: parseFloat((p.x - slatCenterX).toFixed(4)),
      y: parseFloat((p.y - slatMinY).toFixed(4)) // Y goes from 0 to H
    }));
  });

  const slatProfile = slatContours.map((c, idx) => ({
    id: `slat_${idx}`,
    svgPath: toSvgPath(c),
    threeShape: toThreeShapeCommands(c),
    points: c
  }));

  // 3. Process bottom bar profile (listwa końcowa)
  // We normalize similarly
  const bottomBarBlock = dxf.blocks['listwa końcowa'];
  const bbRawContours = extractBlockContours(bottomBarBlock);

  let bMinX = Infinity, bMaxX = -Infinity, bMinY = Infinity, bMaxY = -Infinity;
  bbRawContours.forEach(contour => {
    contour.forEach(p => {
      bMinX = Math.min(bMinX, p.x);
      bMaxX = Math.max(bMaxX, p.x);
      bMinY = Math.min(bMinY, p.y);
      bMaxY = Math.max(bMaxY, p.y);
    });
  });

  const bbCenterX = (bMinX + bMaxX) / 2;
  const bbMinY = bMinY;

  const bottomBarContours = bbRawContours.map(contour => {
    return contour.map(p => ({
      x: parseFloat((p.x - bbCenterX).toFixed(4)),
      y: parseFloat((p.y - bbMinY).toFixed(4)) // Y goes from 0 to H
    }));
  });

  const bottomBarProfile = bottomBarContours.map((c, idx) => ({
    id: `bottomBar_${idx}`,
    svgPath: toSvgPath(c),
    threeShape: toThreeShapeCommands(c),
    points: c
  }));

  // Assemble the output payload
  const payload = {
    meta: {
      source: 'Roller_Blind_225.dxf',
      boxWidth: 240.0,
      boxHeight: 245.5,
      slatThickness: parseFloat((sMaxX - sMinX).toFixed(2)),
      slatHeight: parseFloat((sMaxY - sMinY).toFixed(2)),
      bottomBarThickness: parseFloat((bMaxX - bMinX).toFixed(2)),
      bottomBarHeight: parseFloat((bMaxY - bMinY).toFixed(2)),
      slotX: 17.80 // Center of slot relative to BOX_X_REF
    },
    boxProfiles,
    slatProfile,
    bottomBarProfile
  };

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2));
  console.log(`Successfully generated profile JSON at: ${outPath}`);

} catch (err) {
  console.error("Error during parsing:", err);
}
