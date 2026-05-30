/**
 * extract_iglo5_profiles.mjs
 * 
 * Extracts and names all cross-section components from:
 *   Iglo5_for Antigravity processing.dxf
 * 
 * Outputs:
 *   FRM_EXT  - left half of frame profile  (exterior face)
 *   FRM_INT  - right half of frame profile (interior face)
 *   SSH_EXT  - left half of sash profile   (exterior face)
 *   SSH_INT  - right half of sash profile  (interior face)
 *   SPACER   - warm-edge spacer bar        (arcs → line segments)
 *   GSK_EXT  - sash-side EPDM gasket      (bulges flattened)
 *   GSK_INT  - frame-side U-001 gasket    (bulges flattened)
 *   BZD      - glazing bead U-channel     (WARSTWA6)
 * 
 * Strategy: topology-based (block name + INSERT layer), not layer-name-based,
 * because all geometry lives on DXF default layer "0".
 */

import fs   from 'fs';
import path from 'path';
import DxfParser from 'dxf-parser';

const DXF_PATH = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\system\\systemy Drutex\\Processed DWGs by Marc\\Iglo5_for Antigravity processing.dxf";

const text  = fs.readFileSync(DXF_PATH, 'utf-8');
const dxf   = new DxfParser().parseSync(text);
const blocks = dxf.blocks;

// ── Helpers ───────────────────────────────────────────────────────────────

/** Convert bulge arc segment to polyline approximation (N segments) */
function bulgToPoints(x1, y1, x2, y2, bulge, segments = 12) {
  if (Math.abs(bulge) < 1e-9) return [{ x: x2, y: y2 }];

  const angle = 4 * Math.atan(Math.abs(bulge));
  const d = Math.hypot(x2 - x1, y2 - y1);
  const r = d / (2 * Math.sin(angle / 2));
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const perpDist = Math.sqrt(Math.max(0, r * r - (d / 2) * (d / 2)));
  const perpAngle = Math.atan2(y2 - y1, x2 - x1) + Math.PI / 2;
  const sign = bulge < 0 ? -1 : 1;
  const cx = midX + sign * perpDist * Math.cos(perpAngle);
  const cy = midY + sign * perpDist * Math.sin(perpAngle);
  const startAngle = Math.atan2(y1 - cy, x1 - cx);
  const endAngle   = Math.atan2(y2 - cy, x2 - cx);

  const pts = [];
  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    let a = startAngle + t * (bulge > 0 ? angle : -angle);
    pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  }
  return pts;
}

/** Expand LWPOLYLINE vertices (honoring bulge arcs) into flat point array */
function expandPolyline(vertices, closed = false, flattenBulge = false) {
  const pts = [];
  const verts = closed ? [...vertices, vertices[0]] : vertices;
  for (let i = 0; i < verts.length - 1; i++) {
    const v  = verts[i];
    const v2 = verts[i + 1];
    pts.push({ x: v.x, y: v.y });
    if (!flattenBulge && v.bulge && Math.abs(v.bulge) > 1e-9) {
      pts.push(...bulgToPoints(v.x, v.y, v2.x, v2.y, v.bulge));
    }
  }
  if (verts.length) pts.push({ x: verts[verts.length - 1].x, y: verts[verts.length - 1].y });
  return pts;
}

/** Expand ARC entity into line segments */
function arcToPoints(cx, cy, r, startDeg, endDeg, segments = 24) {
  const pts = [];
  let sa = (startDeg * Math.PI) / 180;
  let ea = (endDeg   * Math.PI) / 180;
  if (ea < sa) ea += 2 * Math.PI;
  for (let i = 0; i <= segments; i++) {
    const a = sa + (i / segments) * (ea - sa);
    pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  }
  return pts;
}

/** Apply TX,TY offset to all points */
function offset(pts, tx, ty) { return pts.map(p => ({ x: p.x + tx, y: p.y + ty })); }

/** Bounding box of a point array */
function bbox(pts) {
  let minX=Infinity, maxX=-Infinity, minY=Infinity, maxY=-Infinity;
  pts.forEach(p => {
    if(p.x<minX)minX=p.x; if(p.x>maxX)maxX=p.x;
    if(p.y<minY)minY=p.y; if(p.y>maxY)maxY=p.y;
  });
  return { minX, maxX, minY, maxY };
}

/** Translate so that bounding-box lower-left = (0,0), flip Y for SVG */
function normalise(pts) {
  const b = bbox(pts);
  return pts.map(p => ({ x: p.x - b.minX, y: b.maxY - p.y }));
}

/** Build SVG path string from a flat point array */
function toSvgPath(pts) {
  if (!pts.length) return '';
  return 'M ' + pts.map((p,i) => `${p.x.toFixed(4)},${p.y.toFixed(4)}`).join(' L ') + ' Z';
}

// ── Recursive block collector ──────────────────────────────────────────────
/**
 * Returns array of { type, layer, colorIndex, vertices, start, end, center, radius, startAngle, endAngle }
 * for every geometry entity inside blockName (recursively following INSERTs).
 * 
 * @param {string}  blockName
 * @param {number}  tx          cumulative X offset
 * @param {number}  ty          cumulative Y offset
 * @param {string}  [filterBlockName]  if set, only collect from this specific child block
 * @param {Set}     visited
 * @returns {{ ent, tx, ty, insertLayer }[]}
 */
function collectFromBlock(blockName, tx = 0, ty = 0, visited = new Set()) {
  const block = blocks[blockName];
  if (!block || visited.has(blockName)) return [];
  const newVisited = new Set(visited).add(blockName);
  const results = [];

  for (const ent of (block.entities || [])) {
    if (ent.type === 'INSERT') {
      const bx = tx + (ent.position?.x || 0);
      const by = ty + (ent.position?.y || 0);
      results.push(...collectFromBlock(ent.name, bx, by, newVisited).map(r => ({
        ...r,
        insertLayer: r.insertLayer ?? ent.layer, // capture the INSERT's own layer label
      })));
    } else {
      results.push({ ent, tx, ty, insertLayer: null });
    }
  }
  return results;
}

/**
 * Collect only direct children of a block that are INSERTs of a specific block name.
 */
function getDirectInserts(parentBlock, childBlockName) {
  return (blocks[parentBlock]?.entities || [])
    .filter(e => e.type === 'INSERT' && e.name === childBlockName);
}

// ── Resolve full INSERT transform chain from top-level down ───────────────

// Top-level: INSERT → złożenie 01 at (70, 0)
const ROOT_TX = 70, ROOT_TY = 0;

// złożenie 01 → rama 01 at (0, 0),  skrzydło 01 at (0, 45)
const FRAME_TX = ROOT_TX + 0,   FRAME_TY = ROOT_TY + 0;
const SASH_TX  = ROOT_TX + 0,   SASH_TY  = ROOT_TY + 45;

// ── 1. FRAME — 50001 - rama 66mm ─────────────────────────────────────────
console.log('\n=== 1. Extracting FRAME (50001 - rama 66mm) ===');
const frameEntities = collectFromBlock('50001 - rama 66mm', FRAME_TX, FRAME_TY);
let framePoints = [];
for (const { ent, tx, ty } of frameEntities) {
  if (ent.type === 'LWPOLYLINE' && ent.vertices) {
    framePoints.push(...offset(expandPolyline(ent.vertices, ent.shape), tx, ty));
  }
}
console.log(`  Raw frame points: ${framePoints.length}`);

// Determine split midpoint X
const frameBbox = bbox(framePoints);
const frameMidX = (frameBbox.minX + frameBbox.maxX) / 2;
console.log(`  Frame bbox: X[${frameBbox.minX.toFixed(2)}..${frameBbox.maxX.toFixed(2)}]  midX=${frameMidX.toFixed(2)}`);
console.log(`  Frame bbox: Y[${frameBbox.minY.toFixed(2)}..${frameBbox.maxY.toFixed(2)}]`);

const frmExtPts = framePoints.filter(p => p.x <= frameMidX);
const frmIntPts = framePoints.filter(p => p.x >  frameMidX);
console.log(`  FRM_EXT: ${frmExtPts.length} pts  |  FRM_INT: ${frmIntPts.length} pts`);

// ── 2. SASH — 50924 - listwa 22mm ────────────────────────────────────────
console.log('\n=== 2. Extracting SASH (50924 - listwa 22mm) ===');

// The sash INSERT is at (18, 51) inside skrzydło 01
const sashInsertInSkel = getDirectInserts('skrzydło 01', '50924 - listwa 22mm')[0];
const SASH_STRIP_TX = SASH_TX + (sashInsertInSkel?.position?.x || 0);
const SASH_STRIP_TY = SASH_TY + (sashInsertInSkel?.position?.y || 0);

const sashEntities = collectFromBlock('50924 - listwa 22mm', SASH_STRIP_TX, SASH_STRIP_TY);
let sashPoints = [];
for (const { ent, tx, ty } of sashEntities) {
  if (ent.type === 'LWPOLYLINE' && ent.vertices) {
    sashPoints.push(...offset(expandPolyline(ent.vertices, ent.shape), tx, ty));
  }
}
console.log(`  Raw sash points: ${sashPoints.length}`);

const sashBbox = bbox(sashPoints);
const sashMidX = (sashBbox.minX + sashBbox.maxX) / 2;
console.log(`  Sash bbox: X[${sashBbox.minX.toFixed(2)}..${sashBbox.maxX.toFixed(2)}]  midX=${sashMidX.toFixed(2)}`);
console.log(`  Sash bbox: Y[${sashBbox.minY.toFixed(2)}..${sashBbox.maxY.toFixed(2)}]`);

const sshExtPts = sashPoints.filter(p => p.x <= sashMidX);
const sshIntPts = sashPoints.filter(p => p.x >  sashMidX);
console.log(`  SSH_EXT: ${sshExtPts.length} pts  |  SSH_INT: ${sshIntPts.length} pts`);

// ── 3. SPACER — 640301SEITE (via mostek podszybowy) ──────────────────────
console.log('\n=== 3. Extracting SPACER (640301SEITE) ===');

// mostek podszybowy is at (-4.917, 46) inside skrzydło 01
const mostekInsert = getDirectInserts('skrzydło 01', 'mostek podszybowy')[0];
const MOSTEK_TX = SASH_TX + (mostekInsert?.position?.x || 0);
const MOSTEK_TY = SASH_TY + (mostekInsert?.position?.y || 0);

// Inside mostek, 640301SEITE is at (-19.396, 2.999)
const spacerInsert = getDirectInserts('mostek podszybowy', '640301SEITE')[0];
const SPACER_TX = MOSTEK_TX + (spacerInsert?.position?.x || 0);
const SPACER_TY = MOSTEK_TY + (spacerInsert?.position?.y || 0);

const spacerEntities = collectFromBlock('640301SEITE', SPACER_TX, SPACER_TY);
let spacerPoints = [];
for (const { ent, tx, ty } of spacerEntities) {
  if (ent.type === 'LINE') {
    spacerPoints.push({ x: (ent.start?.x||0)+tx, y: (ent.start?.y||0)+ty });
    spacerPoints.push({ x: (ent.end?.x||0)+tx,   y: (ent.end?.y||0)+ty });
  }
  if (ent.type === 'ARC') {
    const pts = arcToPoints(
      (ent.center?.x||0)+tx, (ent.center?.y||0)+ty,
      ent.radius||0, ent.startAngle||0, ent.endAngle||0
    );
    spacerPoints.push(...pts);
  }
}
console.log(`  Raw spacer points: ${spacerPoints.length}`);
const spacerBbox = bbox(spacerPoints);
console.log(`  Spacer bbox: X[${spacerBbox.minX.toFixed(2)}..${spacerBbox.maxX.toFixed(2)}]`);
console.log(`  Spacer bbox: Y[${spacerBbox.minY.toFixed(2)}..${spacerBbox.maxY.toFixed(2)}]`);

// ── 4. GASKETS — U-001 (EPDM-tagged INSERT = sash side GSK_EXT) ──────────
console.log('\n=== 4. Extracting GASKETS (U-001) ===');

// Sash-side gasket: INSERT layer = "EPDM" inside skrzydło 01
const epdmInsert = (blocks['skrzydło 01']?.entities || []).find(
  e => e.type === 'INSERT' && e.name === 'U-001' && e.layer?.toUpperCase() === 'EPDM'
);
const GSK_EXT_TX = SASH_TX + (epdmInsert?.position?.x || 0);
const GSK_EXT_TY = SASH_TY + (epdmInsert?.position?.y || 0);
const gskExtEntities = collectFromBlock('U-001', GSK_EXT_TX, GSK_EXT_TY);
let gskExtPoints = [];
for (const { ent, tx, ty } of gskExtEntities) {
  if (ent.type === 'LWPOLYLINE' && ent.vertices) {
    // Flatten bulge = no arcs, straight lines only
    gskExtPoints.push(...offset(expandPolyline(ent.vertices, ent.shape, true), tx, ty));
  }
}
console.log(`  GSK_EXT (sash EPDM): ${gskExtPoints.length} pts`);

// Frame-side gasket: U-001 inside rama 01 (layer "0" INSERT)
const frameU001Insert = (blocks['rama 01']?.entities || []).find(
  e => e.type === 'INSERT' && e.name === 'U-001'
);
const GSK_INT_TX = FRAME_TX + (frameU001Insert?.position?.x || 0);
const GSK_INT_TY = FRAME_TY + (frameU001Insert?.position?.y || 0);
const gskIntEntities = collectFromBlock('U-001', GSK_INT_TX, GSK_INT_TY);
let gskIntPoints = [];
for (const { ent, tx, ty } of gskIntEntities) {
  if (ent.type === 'LWPOLYLINE' && ent.vertices) {
    gskIntPoints.push(...offset(expandPolyline(ent.vertices, ent.shape, true), tx, ty));
  }
}
console.log(`  GSK_INT (frame U-001): ${gskIntPoints.length} pts`);

// ── 5. BZD — Glazing bead U-channel (WARSTWA6) ───────────────────────────
console.log('\n=== 5. Extracting GLAZING BEAD (WARSTWA6 via U- listwy przyszybowej) ===');

// U- listwy przyszybowej is nested inside 50924 - listwa 22mm
const bzdEntities = collectFromBlock('U- listwy przyszybowej', SASH_STRIP_TX, SASH_STRIP_TY);
let bzdPoints = [];
for (const { ent, tx, ty } of bzdEntities) {
  if (ent.type === 'LWPOLYLINE' && ent.vertices) {
    bzdPoints.push(...offset(expandPolyline(ent.vertices, ent.shape), tx, ty));
  }
}
console.log(`  BZD points: ${bzdPoints.length}`);

// ── Build output JSON ─────────────────────────────────────────────────────
console.log('\n=== Building output JSON ===');

function buildProfile(pts, label) {
  if (!pts.length) {
    console.warn(`  ⚠ WARNING: ${label} has 0 points!`);
    return { svgPath: '', vertices: [], bbox: null };
  }
  const b = bbox(pts);
  return {
    svgPath: toSvgPath(normalise(pts)),
    vertices: normalise(pts),
    rawVertices: pts,
    bbox: b,
    pointCount: pts.length,
  };
}

const output = {
  system:  'IGLO_5',
  type:    'F104',
  source:  'Iglo5_for Antigravity processing.dxf',
  generated: new Date().toISOString(),
  profiles: {
    FRM_EXT: buildProfile(frmExtPts, 'FRM_EXT'),
    FRM_INT: buildProfile(frmIntPts, 'FRM_INT'),
    SSH_EXT: buildProfile(sshExtPts, 'SSH_EXT'),
    SSH_INT: buildProfile(sshIntPts, 'SSH_INT'),
    SPACER:  buildProfile(spacerPoints, 'SPACER'),
    GSK_EXT: buildProfile(gskExtPoints, 'GSK_EXT'),
    GSK_INT: buildProfile(gskIntPoints, 'GSK_INT'),
    BZD:     buildProfile(bzdPoints,    'BZD'),
  }
};

// Print summary
console.log('\n── Profile summary ─────────────────────────────────────────────');
for (const [name, prof] of Object.entries(output.profiles)) {
  if (prof.bbox) {
    console.log(`  ${name.padEnd(8)} ${prof.pointCount} pts  bbox W=${(prof.bbox.maxX-prof.bbox.minX).toFixed(1)} H=${(prof.bbox.maxY-prof.bbox.minY).toFixed(1)}`);
  } else {
    console.log(`  ${name.padEnd(8)} ⚠ empty`);
  }
}

// Write output
const outDir  = 'src/data/profiles';
const outPath = `${outDir}/IG5_iglo5_all_profiles.json`;
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
console.log(`\n✓ Written: ${outPath}`);
