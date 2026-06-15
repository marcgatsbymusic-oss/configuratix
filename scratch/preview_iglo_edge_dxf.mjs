/**
 * preview_iglo_edge_dxf.mjs  (v2 - isolated block rendering)
 * Renders each named profile block in its own panel, color-coded.
 * No transform chaining — each block is rendered in its own coordinate space.
 */
import fs from 'fs';
import DxfParser from 'dxf-parser';

const DXF_PATH = 'C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\Monday 8th experiment\\Iglo_Edge_Movable_Mullion_AI_TEST.dxf';
const OUT_PATH  = 'scratch/iglo_edge_preview.svg';

const dxf = new DxfParser().parseSync(fs.readFileSync(DXF_PATH, 'utf-8'));

// Blocks to render, with display label and color
const BLOCKS = [
  { name: '80013A',                  label: '80013A — Frame (FRM)',       color: '#00BFFF' },
  { name: '80029',                   label: '80029 — Sash (SSH)',         color: '#FF6B35' },
  { name: '50930A - listwa 16mm_A',  label: '50930A — Glazing Bead (BZD)',color: '#FFD700' },
  { name: 'uszczelka centralna_3',   label: 'Central Gasket (GSK_CTR)',   color: '#FF1493' },
  { name: 'szyba 48mm',             label: 'szyba 48mm — Glass (GLS)',   color: '#44FF99' },
  { name: 'U-001',                   label: 'U-001 — Frame EPDM (GSK_FRM)',color: '#FF4444' },
  { name: 'U-009',                   label: 'U-009 — Sash EPDM (GSK_SSH)',color: '#FF8844' },
];

const SCALE = 7;   // px per mm
const PAD   = 8;   // mm padding per panel
const COLS  = 3;

// ── helpers ──────────────────────────────────────────────────────────────────
function getBlockBbox(blockName) {
  const block = dxf.blocks[blockName];
  if (!block) return null;
  let minX=Infinity, maxX=-Infinity, minY=Infinity, maxY=-Infinity;

  function processEntity(e) {
    if (e.type === 'INSERT') {
      // Flatten sub-blocks inline with position only (no rotation for bbox)
      const sub = dxf.blocks[e.name];
      if (sub) sub.entities.forEach(se => processEntity(se));
      return;
    }
    const pts = [];
    if (e.vertices) pts.push(...e.vertices);
    if (e.start)    pts.push(e.start, e.end);
    if (e.center)   {
      pts.push(
        { x: e.center.x - e.radius, y: e.center.y - e.radius },
        { x: e.center.x + e.radius, y: e.center.y + e.radius }
      );
    }
    pts.forEach(p => {
      if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
    });
  }
  block.entities.forEach(processEntity);
  if (!isFinite(minX)) return null;
  return { minX, maxX, minY, maxY, w: maxX-minX, h: maxY-minY };
}

function arcPts(cx, cy, r, startAngle, endAngle) {
  let sa = startAngle, ea = endAngle;
  while (ea < sa) ea += Math.PI * 2;
  const steps = Math.max(8, Math.ceil((ea - sa) / (Math.PI / 16)));
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const a = sa + (ea - sa) * i / steps;
    pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  }
  return pts;
}

function entityToSegments(e) {
  // Returns array of {pts:[{x,y}]} line segments to render
  if (e.type === 'LINE' && e.vertices && e.vertices.length >= 2) {
    return [{ pts: e.vertices }];
  }
  if (e.type === 'ARC' && e.center) {
    return [{ pts: arcPts(e.center.x, e.center.y, e.radius, e.startAngle, e.endAngle) }];
  }
  if ((e.type === 'LWPOLYLINE' || e.type === 'POLYLINE') && e.vertices) {
    const pts = [...e.vertices];
    if (e.shape || e.closed) pts.push(e.vertices[0]);
    return [{ pts }];
  }
  return [];
}

function renderBlock(blockName, color, ox, oy, bbox) {
  const block = dxf.blocks[blockName];
  if (!block) return '';
  const lines = [];

  function toSvg(wx, wy) {
    // Normalize to 0,0 then scale, flip Y
    const nx = (wx - bbox.minX + PAD) * SCALE + ox;
    const ny = oy + (bbox.h + PAD * 2) * SCALE - (wy - bbox.minY + PAD) * SCALE;
    return { x: nx.toFixed(2), y: ny.toFixed(2) };
  }

  function renderEntity(e) {
    if (e.type === 'INSERT') {
      const sub = dxf.blocks[e.name];
      if (sub) sub.entities.forEach(renderEntity);
      return;
    }
    const segs = entityToSegments(e);
    const layerColor = e.layer === 'EPDM' ? '#FF6666' : (e.layer === 'Szklenie' ? '#88FFCC' : color);
    const sw = e.layer === 'EPDM' ? 1.5 : 0.8;
    segs.forEach(({ pts }) => {
      if (pts.length < 2) return;
      const d = pts.map((p, i) => {
        const s = toSvg(p.x, p.y);
        return `${i === 0 ? 'M' : 'L'} ${s.x} ${s.y}`;
      }).join(' ');
      lines.push(`<path d="${d}" fill="none" stroke="${layerColor}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`);
    });
  }

  block.entities.forEach(renderEntity);
  return lines.join('\n');
}

// ── Layout calculation ────────────────────────────────────────────────────────
const panels = BLOCKS.map(b => ({
  ...b,
  bbox: getBlockBbox(b.name)
})).filter(b => b.bbox);

const COL_W = 380;
const ROW_H = 440;
const ROWS  = Math.ceil(panels.length / COLS);
const SVG_W = COL_W * COLS + 40;
const SVG_H = ROW_H * ROWS + 80;

// ── Build SVG ─────────────────────────────────────────────────────────────────
let svgContent = panels.map((p, i) => {
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  const ox  = col * COL_W + 20;
  const oy  = row * ROW_H + 50;

  const bbox = p.bbox;
  const scaleW = (COL_W - 40) / ((bbox.w + PAD * 2) * SCALE);
  const scaleH = (ROW_H - 60) / ((bbox.h + PAD * 2) * SCALE);
  const panelScale = Math.min(scaleW, scaleH, 1);

  const panelW = (bbox.w + PAD * 2) * SCALE;
  const panelH = (bbox.h + PAD * 2) * SCALE;
  const pathsRaw = renderBlock(p.name, p.color, 0, 0, bbox);

  return `
  <!-- ===== ${p.label} ===== -->
  <g transform="translate(${ox}, ${oy})">
    <rect x="0" y="0" width="${COL_W - 20}" height="${ROW_H - 30}" fill="#0d1117" rx="6" stroke="#333355" stroke-width="1"/>
    <text x="${(COL_W-20)/2}" y="-6" fill="${p.color}" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle">${p.label}</text>
    <text x="${(COL_W-20)/2}" y="8" fill="#888888" font-family="monospace" font-size="9" text-anchor="middle">w:${bbox.w.toFixed(1)}mm  h:${bbox.h.toFixed(1)}mm</text>
    <g transform="translate(10, 20) scale(${panelScale.toFixed(4)})">
      ${pathsRaw}
    </g>
  </g>`;
}).join('\n');

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${SVG_W}" height="${SVG_H}" viewBox="0 0 ${SVG_W} ${SVG_H}">
  <rect width="100%" height="100%" fill="#0a0a1a"/>
  <text x="${SVG_W/2}" y="28" fill="#AAAAFF" font-family="monospace" font-size="16" font-weight="bold" text-anchor="middle">
    IGLO EDGE 82mm — Block Identity Preview
  </text>
  <text x="${SVG_W/2}" y="44" fill="#666688" font-family="monospace" font-size="11" text-anchor="middle">
    Each panel = one named DXF block, rendered in isolation. Used to confirm FRM / SSH / BZD / GSK / GLS mapping.
  </text>
  ${svgContent}
</svg>`;

fs.writeFileSync(OUT_PATH, svg, 'utf-8');

console.log(`✅ SVG written: ${OUT_PATH}`);
panels.forEach(p => {
  console.log(`  ${p.color}  ${p.label}   ${p.bbox.w.toFixed(1)} × ${p.bbox.h.toFixed(1)} mm`);
});
