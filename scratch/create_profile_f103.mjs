import fs from 'fs';
import DxfParser from 'dxf-parser';

// Paths
const dxfFile = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG to DXF conversion tests\\IGLO 5 Drawing1.dxf";
const ig5F100File = "src/data/profiles/IG5_F100.json";
const outFile = "src/data/profiles/IG5_F103.json";

// Read DXF
const fileText = fs.readFileSync(dxfFile, 'utf-8');
const parser = new DxfParser();
const dxf = parser.parseSync(fileText);

// Read IG5_F100 (for Sash profile coordinates)
const ig5F100 = JSON.parse(fs.readFileSync(ig5F100File, 'utf-8'));

// Affine transform helper
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

// Sutherland-Hodgman Polygon Clipping for vertical cuts
function clipPolygonLeft(vertices, cutX) {
  const output = [];
  for (let i = 0; i < vertices.length; i++) {
    const current = vertices[i];
    const prev = vertices[(i + vertices.length - 1) % vertices.length];
    
    const isCurrentIn = current.x <= cutX;
    const isPrevIn = prev.x <= cutX;
    
    if (isCurrentIn) {
      if (!isPrevIn) {
        const t = (cutX - prev.x) / (current.x - prev.x);
        const iy = prev.y + t * (current.y - prev.y);
        output.push({ x: cutX, y: iy });
      }
      output.push(current);
    } else if (isPrevIn) {
      const t = (cutX - prev.x) / (current.x - prev.x);
      const iy = prev.y + t * (current.y - prev.y);
      output.push({ x: cutX, y: iy });
    }
  }
  return output;
}

function clipPolygonRight(vertices, cutX) {
  const output = [];
  for (let i = 0; i < vertices.length; i++) {
    const current = vertices[i];
    const prev = vertices[(i + vertices.length - 1) % vertices.length];
    
    const isCurrentIn = current.x >= cutX;
    const isPrevIn = prev.x >= cutX;
    
    if (isCurrentIn) {
      if (!isPrevIn) {
        const t = (cutX - prev.x) / (current.x - prev.x);
        const iy = prev.y + t * (current.y - prev.y);
        output.push({ x: cutX, y: iy });
      }
      output.push(current);
    } else if (isPrevIn) {
      const t = (cutX - prev.x) / (current.x - prev.x);
      const iy = prev.y + t * (current.y - prev.y);
      output.push({ x: cutX, y: iy });
    }
  }
  return output;
}

function interpolateVertices(vertices, stepDeg = 4) {
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
        const steps = Math.max(2, Math.ceil(Math.abs(angleDiff) * 180 / (Math.PI * stepDeg)));
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

function smoothFacetedCorners(vertices) {
  if (vertices.length < 3) return vertices;
  const result = [];
  const n = vertices.length;
  for (let i = 0; i < n; i++) {
    const prev = vertices[(i - 1 + n) % n];
    const curr = vertices[i];
    const next = vertices[(i + 1) % n];
    const dx1 = curr.x - prev.x;
    const dy1 = curr.y - prev.y;
    const len1 = Math.hypot(dx1, dy1);
    const dx2 = next.x - curr.x;
    const dy2 = next.y - curr.y;
    const len2 = Math.hypot(dx2, dy2);
    let isFaceted = false;
    if (len1 > 0.001 && len2 > 0.001) {
      const dot = dx1 * dx2 + dy1 * dy2;
      const cosTheta = dot / (len1 * len2);
      const angleRad = Math.acos(Math.max(-1, Math.min(1, cosTheta)));
      const angleDeg = angleRad * 180 / Math.PI;
      if (angleDeg >= 10 && angleDeg <= 80) {
        isFaceted = true;
      }
    }
    if (isFaceted) {
      const m1x = (prev.x + curr.x) / 2;
      const m1y = (prev.y + curr.y) / 2;
      const m2x = (curr.x + next.x) / 2;
      const m2y = (curr.y + next.y) / 2;
      const steps = 3;
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const mt = 1 - t;
        const px = mt * mt * m1x + 2 * mt * t * curr.x + t * t * m2x;
        const py = mt * mt * m1y + 2 * mt * t * curr.y + t * t * m2y;
        result.push({ x: px, y: py });
      }
    } else {
      result.push({ x: curr.x, y: curr.y });
    }
  }
  const unique = [];
  for (let i = 0; i < result.length; i++) {
    const p = result[i];
    const nextP = result[(i + 1) % result.length];
    if (Math.hypot(p.x - nextP.x, p.y - nextP.y) > 0.001) {
      unique.push(p);
    }
  }
  return unique;
}

// Traverse DXF to collect all leaf paths with their transforms
const shapes = {};

function traverse(ent, tx = 0, ty = 0, rot = 0, sx = 1, sy = 1, name = "") {
  const currentName = name || ent.layer;
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
        traverse(child, absPos.x, absPos.y, rot + irot, sx * isx, sy * isy, ent.name);
      });
    }
  } else if (ent.type.includes('POLYLINE') && ent.vertices) {
    const isGasket = ent.layer === 'Warstwa6' || ent.layer === 'EPDM' || currentName.includes('U-') || currentName.includes('gasket');
    const stepDeg = isGasket ? 15 : 4;
    const interpolatedLocal = interpolateVertices(ent.vertices, stepDeg);
    const abs = interpolatedLocal.map(v => transformPoint(v, tx, ty, rot, sx, sy));
    if (!shapes[currentName]) shapes[currentName] = [];
    shapes[currentName].push({ type: 'POLYLINE', layer: ent.layer, colorIndex: ent.colorIndex, vertices: abs });
  } else if (ent.type === 'LINE') {
    const p1 = transformPoint(ent.vertices[0], tx, ty, rot, sx, sy);
    const p2 = transformPoint(ent.vertices[1], tx, ty, rot, sx, sy);
    if (!shapes[currentName]) shapes[currentName] = [];
    shapes[currentName].push({ type: 'LINE', layer: ent.layer, colorIndex: ent.colorIndex, vertices: [p1, p2] });
  }
}

dxf.entities.forEach(ent => {
  traverse(ent, 0, 0, 0, 1, 1);
});

// Helper to make SVG path
function getSvgPath(vertices) {
  if (!vertices || vertices.length === 0) return "";
  let p = `M ${vertices[0].x.toFixed(4)} ${vertices[0].y.toFixed(4)} `;
  for (let i = 1; i < vertices.length; i++) {
    p += `L ${vertices[i].x.toFixed(4)} ${vertices[i].y.toFixed(4)} `;
  }
  p += 'Z';
  return p;
}

// Compile result profiles
const profiles = {};

// 1. Frame: FRM_EXT and FRM_INT
const frameBlockShapes = shapes["50001 - rama 66mm"] || [];
const framePoly = frameBlockShapes[0].vertices; // Polyline #0 is outer frame loop
const cutX = 35.0; // Frame width goes from x=0 to x=70, so 35 is the middle
const frmExtVertices = clipPolygonLeft(framePoly, cutX);
const frmIntVertices = clipPolygonRight(framePoly, cutX);

profiles["FRM_EXT"] = {
  svgPath: getSvgPath(frmExtVertices),
  vertices: frmExtVertices
};

profiles["FRM_INT"] = {
  svgPath: getSvgPath(frmIntVertices),
  vertices: frmIntVertices
};

// 2. Sash: SSH_EXT and SSH_INT (translated from IG5_F100)
// Translation offset: dx = -8037.73, dy = -4546.80
const dx = -8037.73;
const dy = -4546.80;

const sshExtOrig = ig5F100.profiles.SSH_EXT.vertices;
const sshIntOrig = ig5F100.profiles.SSH_INT.vertices;

const sshExtVertices = smoothFacetedCorners(sshExtOrig.map(v => ({ x: v.x + dx, y: v.y + dy })));
const sshIntVertices = smoothFacetedCorners(sshIntOrig.map(v => ({ x: v.x + dx, y: v.y + dy })));

profiles["SSH_EXT"] = {
  svgPath: getSvgPath(sshExtVertices),
  vertices: sshExtVertices
};

profiles["SSH_INT"] = {
  svgPath: getSvgPath(sshIntVertices),
  vertices: sshIntVertices
};

// 3. Bead: BZD
const beadBlockShapes = shapes["50924 - listwa 22mm"] || [];
const beadPoly = beadBlockShapes[0].vertices; // Polyline #0 is outer loop of bead

profiles["BZD"] = {
  svgPath: getSvgPath(beadPoly),
  vertices: beadPoly
};

// 4. Spacer: SPCR
const spacerVertices = [
  { x: 42.00, y: 100.00 },
  { x: 58.00, y: 100.00 },
  { x: 58.00, y: 114.00 },
  { x: 42.00, y: 114.00 }
];
profiles["SPCR"] = {
  svgPath: getSvgPath(spacerVertices),
  vertices: spacerVertices
};

// 5. Glass: GLS_EXT and GLS_INT
const glsExtVertices = [
  { x: 38.00, y: 100.00 },
  { x: 42.00, y: 100.00 },
  { x: 42.00, y: 139.00 },
  { x: 38.00, y: 139.00 }
];
profiles["GLS_EXT"] = {
  svgPath: getSvgPath(glsExtVertices),
  vertices: glsExtVertices
};

const glsIntVertices = [
  { x: 58.00, y: 100.00 },
  { x: 62.00, y: 100.00 },
  { x: 62.00, y: 139.00 },
  { x: 58.00, y: 139.00 }
];
profiles["GLS_INT"] = {
  svgPath: getSvgPath(glsIntVertices),
  vertices: glsIntVertices
};

// 6. Gaskets
// A. Gasket Frame Exterior: GSK_FRM_EXT
let frameGasketPoly = null;
// B. Gasket Sash Exterior: GSK_SSH_EXT
let sashGasketPoly = null;

const allU001 = shapes["U-001"] || [];
allU001.forEach(s => {
  let minX = Math.min(...s.vertices.map(v => v.x));
  let minY = Math.min(...s.vertices.map(v => v.y));
  if (minX > 5 && minX < 25 && minY > 50 && minY < 65) {
    frameGasketPoly = s.vertices;
  }
  if (minX > 25 && minX < 35 && minY > 100 && minY < 110) {
    sashGasketPoly = s.vertices;
  }
});

if (!frameGasketPoly) {
  console.warn("Could not find frame gasket dynamically, using fallback shape.");
  frameGasketPoly = allU001[1] ? allU001[1].vertices : [];
}
if (!sashGasketPoly) {
  console.warn("Could not find sash gasket dynamically, using fallback shape.");
  sashGasketPoly = allU001[4] ? allU001[4].vertices : [];
}

profiles["GSK_FRM_EXT"] = {
  svgPath: getSvgPath(frameGasketPoly),
  vertices: frameGasketPoly
};

profiles["GSK_SSH_EXT"] = {
  svgPath: getSvgPath(sashGasketPoly),
  vertices: sashGasketPoly
};

// C. Gasket Sash Bottom: GSK_SSH_BTM (U-002 HATCH boundary, absolute offset tx=74.00, ty=38.00)
const u002Local = JSON.parse(fs.readFileSync("scratch/u002_vertices.json", 'utf-8'));
// Translate by (74, 38)
const gskSshBtmVertices = u002Local.map(v => ({ x: v.x + 74.00, y: v.y + 38.00 }));

profiles["GSK_SSH_BTM"] = {
  svgPath: getSvgPath(gskSshBtmVertices),
  vertices: gskSshBtmVertices
};

// D. Gasket Bead: GSK_BZD (U- listwy przyszybowej)
const beadGasketShapes = shapes["U- listwy przyszybowej"] || [];
const beadGasketPoly = beadGasketShapes[0].vertices;

profiles["GSK_BZD"] = {
  svgPath: getSvgPath(beadGasketPoly),
  vertices: beadGasketPoly
};

// Save result
const resultJson = {
  system: "IGLO_5",
  type: "F103",
  profiles: profiles
};

fs.writeFileSync(outFile, JSON.stringify(resultJson, null, 2));
console.log(`Successfully generated profile data: ${outFile}`);
