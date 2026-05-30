/**
 * preview_raw_unsplit.mjs
 * Renders the raw, unsplit LWPOLYLINEs for Frame and Sash directly to SVG
 * to verify that the extraction from DXF is correct before any splitting logic.
 */

import fs from 'fs';
import DxfParser from 'dxf-parser';

const DXF_PATH = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\system\\systemy Drutex\\Processed DWGs by Marc\\Iglo5_for Antigravity processing.dxf";
const text  = fs.readFileSync(DXF_PATH, 'utf-8');
const dxf   = new DxfParser().parseSync(text);
const blocks = dxf.blocks;

// Same bulgToPoints and expandPolyline as before
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

function offset(pts, tx, ty) { return pts.map(p => ({ x: p.x + tx, y: p.y + ty })); }

function collectFromBlock(blockName, tx = 0, ty = 0, visited = new Set()) {
  const block = blocks[blockName];
  if (!block || visited.has(blockName)) return [];
  const newVisited = new Set(visited).add(blockName);
  const results = [];
  for (const ent of (block.entities || [])) {
    if (ent.type === 'INSERT') {
      const bx = tx + (ent.position?.x || 0);
      const by = ty + (ent.position?.y || 0);
      results.push(...collectFromBlock(ent.name, bx, by, newVisited));
    } else {
      results.push({ ent, tx, ty });
    }
  }
  return results;
}

const ROOT_TX = 70, ROOT_TY = 0;
const FRAME_TX = ROOT_TX + 0, FRAME_TY = ROOT_TY + 0;
const SASH_TX  = ROOT_TX + 0, SASH_TY  = ROOT_TY + 45;

const sashInsertInSkel = (blocks['skrzydło 01']?.entities || []).find(e => e.type === 'INSERT' && e.name === '50924 - listwa 22mm');
const SASH_STRIP_TX = SASH_TX + (sashInsertInSkel?.position?.x || 0);
const SASH_STRIP_TY = SASH_TY + (sashInsertInSkel?.position?.y || 0);

const frameEntities = collectFromBlock('50001 - rama 66mm', FRAME_TX, FRAME_TY);
const sashEntities = collectFromBlock('50924 - listwa 22mm', SASH_STRIP_TX, SASH_STRIP_TY);

const polylines = [];

for (const { ent, tx, ty } of frameEntities) {
  if (ent.type === 'LWPOLYLINE' && ent.vertices) {
    polylines.push({ type: 'FRAME', pts: offset(expandPolyline(ent.vertices, ent.shape), tx, ty) });
  }
}
for (const { ent, tx, ty } of sashEntities) {
  if (ent.type === 'LWPOLYLINE' && ent.vertices) {
    polylines.push({ type: 'SASH', pts: offset(expandPolyline(ent.vertices, ent.shape), tx, ty) });
  }
}

let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
polylines.forEach(pl => pl.pts.forEach(p => {
  if(p.x < minX) minX = p.x; if(p.x > maxX) maxX = p.x;
  if(p.y < minY) minY = p.y; if(p.y > maxY) maxY = p.y;
}));

const SCALE = 4;
const PADDING = 20;
const W = (maxX - minX) * SCALE + PADDING * 2;
const H = (maxY - minY) * SCALE + PADDING * 2;
function tx(x) { return (x - minX) * SCALE + PADDING; }
function ty(y) { return H - ((y - minY) * SCALE + PADDING); }

let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" style="background:#111;">\n`;
const colors = ['#f00', '#0f0', '#00f', '#ff0', '#0ff', '#f0f'];
polylines.forEach((pl, i) => {
  const d = 'M ' + pl.pts.map(p => `${tx(p.x)},${ty(p.y)}`).join(' L ');
  svg += `<path d="${d}" fill="none" stroke="${colors[i % colors.length]}" stroke-width="2" />\n`;
});
svg += `</svg>`;

fs.writeFileSync('scratch/preview_raw_unsplit.svg', svg);
console.log('Done.');
