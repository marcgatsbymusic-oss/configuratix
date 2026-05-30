/**
 * preview_clean_profile.mjs
 *
 * Parses "Iglo5_FRM_AND_SASH_clean profile.dxf"
 * and renders a detailed SVG + PNG showing all discovered layers,
 * including bulge-accurate arc segments.
 *
 * Output: scratch/iglo5_clean_profile_preview.svg  +  .png
 */

import fs from 'fs';
import { execSync } from 'child_process';
import DxfParser from 'dxf-parser';

const DXF_PATH =
  "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\system\\systemy Drutex\\Processed DWGs by Marc\\Iglo5_FRM_AND_SASH_clean profile.dxf";

const OUT_SVG = 'scratch/iglo5_clean_profile_preview.svg';
const OUT_PNG = 'scratch/iglo5_clean_profile_preview.png';

// ── Parse ──────────────────────────────────────────────────────────────────
console.log(`Reading: ${DXF_PATH}\n`);
const text = fs.readFileSync(DXF_PATH, 'utf-8');
const parser = new DxfParser();
const dxf = parser.parseSync(text);

// ── Collect all entities by layer ─────────────────────────────────────────
const layerData = {};   // layerName → { points: [{x,y}], arcs: [{cx,cy,r,startAngle,endAngle}] }

function ensureLayer(name) {
  const key = (name || '0').toUpperCase();
  if (!layerData[key]) layerData[key] = { points: [], arcs: [], rawEntities: [] };
  return key;
}

/**
 * Convert LWPOLYLINE with bulges to a series of [x,y] sample points
 * (straight segments + interpolated arc segments for bulge ≠ 0).
 */
function lwpolylineToPoints(vertices, isClosed) {
  const pts = [];
  const n = vertices.length;
  for (let i = 0; i < n; i++) {
    const p1 = vertices[i];
    const p2 = vertices[(i + 1) % n];
    if (i === n - 1 && !isClosed) {
      pts.push({ x: p1.x, y: p1.y });
      break;
    }
    const bulge = p1.bulge || 0;
    pts.push({ x: p1.x, y: p1.y });
    if (Math.abs(bulge) > 1e-6) {
      // Convert bulge to arc and sample it
      const arcPts = bulgeToArcPoints(p1.x, p1.y, p2.x, p2.y, bulge);
      pts.push(...arcPts);
    }
  }
  if (isClosed && pts.length > 0) pts.push({ ...pts[0] }); // close
  return pts;
}

function bulgeToArcPoints(x1, y1, x2, y2, bulge, samples = 12) {
  // Compute arc center from chord + bulge
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const d = len / 2;
  const r = d * (1 + bulge * bulge) / (2 * Math.abs(bulge));
  const s = bulge > 0 ? 1 : -1; // CCW / CW
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const h = Math.sqrt(Math.max(0, r * r - d * d));
  const cx = midX - s * h * (dy / len);
  const cy = midY + s * h * (dx / len);

  const startAngle = Math.atan2(y1 - cy, x1 - cx);
  const endAngle   = Math.atan2(y2 - cy, x2 - cx);

  // Determine arc sweep
  let sweep = endAngle - startAngle;
  if (bulge > 0 && sweep < 0) sweep += 2 * Math.PI;
  if (bulge < 0 && sweep > 0) sweep -= 2 * Math.PI;

  const pts = [];
  for (let i = 1; i < samples; i++) {
    const angle = startAngle + (sweep * i) / samples;
    pts.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
  }
  return pts;
}

function processEntity(ent, offX = 0, offY = 0) {
  const key = ensureLayer(ent.layer);
  const L = layerData[key];

  if (ent.type === 'LWPOLYLINE' || ent.type === 'POLYLINE') {
    const pts = lwpolylineToPoints(
      ent.vertices || [],
      ent.shape || ent.closed || false
    ).map(p => ({ x: p.x + offX, y: p.y + offY }));
    L.points.push(...pts);
    L.rawEntities.push({ type: ent.type, points: pts, closed: ent.shape || ent.closed || false });
  } else if (ent.type === 'LINE') {
    if (ent.start) L.points.push({ x: ent.start.x + offX, y: ent.start.y + offY });
    if (ent.end)   L.points.push({ x: ent.end.x + offX,   y: ent.end.y + offY });
  } else if (ent.type === 'ARC') {
    if (ent.center) {
      const cx = ent.center.x + offX, cy = ent.center.y + offY, r = ent.radius || 0;
      L.arcs.push({ cx, cy, r, startAngle: ent.startAngle || 0, endAngle: ent.endAngle || 0 });
      L.points.push({ x: cx - r, y: cy - r }, { x: cx + r, y: cy + r });
    }
  } else if (ent.type === 'CIRCLE') {
    if (ent.center) {
      const cx = ent.center.x + offX, cy = ent.center.y + offY, r = ent.radius || 0;
      L.arcs.push({ cx, cy, r, startAngle: 0, endAngle: 360 });
      L.points.push({ x: cx - r, y: cy - r }, { x: cx + r, y: cy + r });
    }
  } else if (ent.type === 'SPLINE') {
    const pts = (ent.controlPoints || ent.fitPoints || []).map(p => ({ x: p.x + offX, y: p.y + offY }));
    L.points.push(...pts);
  }
}

// Top-level
dxf.entities.forEach(ent => {
  processEntity(ent);
  if (ent.type === 'INSERT') {
    const block = dxf.blocks?.[ent.name];
    if (block?.entities) {
      const ox = ent.position?.x || 0;
      const oy = ent.position?.y || 0;
      block.entities.forEach(be => processEntity(be, ox, oy));
    }
  }
});

// Remove empty layers
for (const [k, v] of Object.entries(layerData)) {
  if (v.points.length === 0 && v.rawEntities.length === 0 && v.arcs.length === 0) {
    delete layerData[k];
  }
}

const layerNames = Object.keys(layerData);
console.log(`Found ${layerNames.length} non-empty layers: ${layerNames.join(', ')}\n`);

// ── Global bounding box ────────────────────────────────────────────────────
let gMinX = Infinity, gMaxX = -Infinity, gMinY = Infinity, gMaxY = -Infinity;
for (const L of Object.values(layerData)) {
  for (const p of L.points) {
    if (p.x < gMinX) gMinX = p.x;
    if (p.x > gMaxX) gMaxX = p.x;
    if (p.y < gMinY) gMinY = p.y;
    if (p.y > gMaxY) gMaxY = p.y;
  }
}
const dataW = gMaxX - gMinX || 1;
const dataH = gMaxY - gMinY || 1;
console.log(`Global bounding box: X[${gMinX.toFixed(2)}, ${gMaxX.toFixed(2)}]  Y[${gMinY.toFixed(2)}, ${gMaxY.toFixed(2)}]`);
console.log(`Data dimensions: ${dataW.toFixed(2)}mm × ${dataH.toFixed(2)}mm\n`);

// ── SVG layout ─────────────────────────────────────────────────────────────
const SCALE   = 4.5;    // px per mm
const PAD     = 60;
const LEGEND_H = 40 + layerNames.length * 22;
const svgW = dataW * SCALE + PAD * 2;
const svgH = dataH * SCALE + PAD * 2 + LEGEND_H;

function tx(x) { return (x - gMinX) * SCALE + PAD; }
function ty(y) { return PAD + (gMaxY - y) * SCALE; }  // Y-flip

// Color palette (cycle through distinct colors)
const PALETTE = [
  { fill: '#4A90D9', stroke: '#1A5FA8' },  // blue
  { fill: '#F5A623', stroke: '#C47A00' },  // orange
  { fill: '#7ED321', stroke: '#4A8C00' },  // green
  { fill: '#D0021B', stroke: '#8B0000' },  // red
  { fill: '#9B59B6', stroke: '#6C3483' },  // purple
  { fill: '#00BCD4', stroke: '#00838F' },  // cyan
  { fill: '#FF69B4', stroke: '#C2185B' },  // pink
  { fill: '#FF8C00', stroke: '#D2691E' },  // dark-orange
  { fill: '#50C878', stroke: '#217A3A' },  // emerald
  { fill: '#B8860B', stroke: '#7B5E00' },  // dark-goldenrod
];

// Known layer color hints
const LAYER_HINTS = {
  FRM_EXT: 0, FRM_INT: 1,
  SSH_EXT: 2, SSH_INT: 3,
  GSK_EXT: 4, GSK_INT: 4,
  BZD: 5, GLS: 6, GLS_EXT: 7, GLS_INT: 8,
  SPACER: 9, SPACER1: 9,
};
const colorFor = (name) => {
  const idx = LAYER_HINTS[name] !== undefined ? LAYER_HINTS[name] : (Object.keys(layerData).indexOf(name) % PALETTE.length);
  return PALETTE[idx % PALETTE.length];
};

// ── Build SVG ─────────────────────────────────────────────────────────────
let svg = [];
svg.push(`<?xml version="1.0" encoding="UTF-8"?>`);
svg.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${svgW.toFixed(0)}" height="${svgH.toFixed(0)}" font-family="'Segoe UI',Arial,sans-serif">`);

// Dark background
svg.push(`<rect width="${svgW.toFixed(0)}" height="${svgH.toFixed(0)}" fill="#0f1117"/>`);

// Title
svg.push(`<text x="${PAD}" y="26" fill="#e8e8e8" font-size="18" font-weight="bold">IGLO 5 — FRM &amp; SASH Clean Profile</text>`);
svg.push(`<text x="${PAD}" y="44" fill="#888" font-size="11">Source: Iglo5_FRM_AND_SASH_clean profile.dxf  ·  Layers: ${layerNames.length}  ·  Scale: ${SCALE}px/mm  ·  ${dataW.toFixed(1)}mm × ${dataH.toFixed(1)}mm</text>`);

// Grid (10mm intervals)
svg.push(`<g id="grid" opacity="0.12">`);
for (let x = Math.ceil(gMinX / 10) * 10; x <= gMaxX; x += 10) {
  const sx = tx(x).toFixed(1);
  svg.push(`<line x1="${sx}" y1="${PAD}" x2="${sx}" y2="${PAD + dataH * SCALE}" stroke="#ffffff" stroke-width="0.4"/>`);
}
for (let y = Math.ceil(gMinY / 10) * 10; y <= gMaxY; y += 10) {
  const sy = ty(y).toFixed(1);
  svg.push(`<line x1="${PAD}" y1="${sy}" x2="${PAD + dataW * SCALE}" y2="${sy}" stroke="#ffffff" stroke-width="0.4"/>`);
}
svg.push(`</g>`);

// Axis labels (50mm intervals)
svg.push(`<g fill="#4a4a4a" font-size="9">`);
for (let x = Math.ceil(gMinX / 50) * 50; x <= gMaxX; x += 50) {
  svg.push(`<text x="${tx(x).toFixed(1)}" y="${PAD + dataH * SCALE + 14}" text-anchor="middle">${x.toFixed(0)}</text>`);
}
for (let y = Math.ceil(gMinY / 50) * 50; y <= gMaxY; y += 50) {
  svg.push(`<text x="${PAD - 8}" y="${ty(y).toFixed(1)}" text-anchor="end" dominant-baseline="middle">${y.toFixed(0)}</text>`);
}
svg.push(`</g>`);

// Draw geometry — each layer in its own group
for (const [name, L] of Object.entries(layerData)) {
  const col = colorFor(name);
  svg.push(`<g id="layer-${name}" opacity="0.82">`);

  // Render each raw entity as a closed/open path
  for (const ent of L.rawEntities) {
    if (!ent.points || ent.points.length < 2) continue;
    const d = 'M' + ent.points.map(p => `${tx(p.x).toFixed(2)},${ty(p.y).toFixed(2)}`).join('L') + (ent.closed ? 'Z' : '');
    svg.push(`<path d="${d}" fill="${ent.closed ? col.fill : 'none'}" fill-opacity="0.35" stroke="${col.stroke}" stroke-width="1.2" stroke-linejoin="round"/>`);
  }

  // Arcs
  for (const arc of L.arcs) {
    if (arc.startAngle === 0 && arc.endAngle === 360) {
      // Full circle
      svg.push(`<circle cx="${tx(arc.cx).toFixed(2)}" cy="${ty(arc.cy).toFixed(2)}" r="${(arc.r * SCALE).toFixed(2)}" fill="none" stroke="${col.stroke}" stroke-width="1.2"/>`);
    } else {
      const sa = (arc.startAngle * Math.PI) / 180;
      const ea = (arc.endAngle   * Math.PI) / 180;
      const x1 = arc.cx + arc.r * Math.cos(sa);
      const y1 = arc.cy + arc.r * Math.sin(sa);
      const x2 = arc.cx + arc.r * Math.cos(ea);
      const y2 = arc.cy + arc.r * Math.sin(ea);
      const large = (arc.endAngle - arc.startAngle + 360) % 360 > 180 ? 1 : 0;
      svg.push(`<path d="M${tx(x1).toFixed(2)},${ty(y1).toFixed(2)} A${(arc.r * SCALE).toFixed(2)},${(arc.r * SCALE).toFixed(2)} 0 ${large},0 ${tx(x2).toFixed(2)},${ty(y2).toFixed(2)}" fill="none" stroke="${col.stroke}" stroke-width="1.2"/>`);
    }
  }

  svg.push(`</g>`);
}

// ── Legend ─────────────────────────────────────────────────────────────────
const legY = PAD + dataH * SCALE + PAD + 10;
svg.push(`<text x="${PAD}" y="${legY}" fill="#ccc" font-size="13" font-weight="bold">Layer Legend</text>`);

layerNames.forEach((name, i) => {
  const col = colorFor(name);
  const L = layerData[name];
  const bbox = L.points.length > 0 ? (() => {
    let mnX=Infinity,mxX=-Infinity,mnY=Infinity,mxY=-Infinity;
    L.points.forEach(p=>{ if(p.x<mnX)mnX=p.x; if(p.x>mxX)mxX=p.x; if(p.y<mnY)mnY=p.y; if(p.y>mxY)mxY=p.y; });
    return `${(mxX-mnX).toFixed(1)}×${(mxY-mnY).toFixed(1)}mm`;
  })() : 'no pts';

  const row = legY + 18 + i * 22;
  const col2Start = PAD + 220;
  svg.push(`<rect x="${PAD}" y="${row - 10}" width="14" height="14" rx="2" fill="${col.fill}" stroke="${col.stroke}"/>`);
  svg.push(`<text x="${PAD + 20}" y="${row + 2}" fill="#ddd" font-size="11" font-weight="bold">${name}</text>`);
  svg.push(`<text x="${col2Start}" y="${row + 2}" fill="#777" font-size="10">${L.points.length} pts · ${bbox} · ${L.rawEntities.length} entities</text>`);
});

svg.push(`</svg>`);

// ── Write SVG ─────────────────────────────────────────────────────────────
fs.writeFileSync(OUT_SVG, svg.join('\n'), 'utf-8');
console.log(`✓ SVG written: ${OUT_SVG}`);

// ── Convert to PNG via Inkscape or Sharp ─────────────────────────────────
console.log(`Converting SVG → PNG ...`);

// Try Inkscape first (best quality), then fall back to sharp or warn
let pngDone = false;

try {
  execSync(`inkscape --export-type=png --export-filename="${OUT_PNG}" --export-dpi=150 "${OUT_SVG}" 2>&1`, { stdio: 'inherit' });
  if (fs.existsSync(OUT_PNG)) { pngDone = true; console.log(`✓ PNG written (Inkscape): ${OUT_PNG}`); }
} catch {}

if (!pngDone) {
  // Try sharp via node
  try {
    const sharpMod = await import('sharp').catch(() => null);
    if (sharpMod) {
      const svgBuf = fs.readFileSync(OUT_SVG);
      await sharpMod.default(svgBuf).png().toFile(OUT_PNG);
      pngDone = true;
      console.log(`✓ PNG written (sharp): ${OUT_PNG}`);
    }
  } catch {}
}

if (!pngDone) {
  // Try svg2png via npx
  try {
    execSync(`npx -y svg2png-cli "${OUT_SVG}" -o "${OUT_PNG}" 2>&1`, { stdio: 'inherit', timeout: 30000 });
    if (fs.existsSync(OUT_PNG)) { pngDone = true; console.log(`✓ PNG written (svg2png-cli): ${OUT_PNG}`); }
  } catch {}
}

if (!pngDone) {
  console.log(`⚠ Could not auto-convert to PNG. SVG is ready at: ${OUT_SVG}`);
  console.log(`  Manual: open ${OUT_SVG} in a browser and screenshot, or run:`);
  console.log(`    inkscape --export-type=png --export-filename="${OUT_PNG}" "${OUT_SVG}"`);
}
