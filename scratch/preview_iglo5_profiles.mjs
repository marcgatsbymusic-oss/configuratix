/**
 * preview_iglo5_profiles.mjs
 * 
 * Reads IG5_iglo5_all_profiles.json and renders an SVG showing all
 * extracted profiles color-coded and labelled, at a consistent scale.
 * Each profile is shown both in its original coordinate space (composite view)
 * and individually normalised (per-profile row).
 */

import fs from 'fs';

const JSON_PATH = 'src/data/profiles/IG5_iglo5_all_profiles.json';
const OUT_SVG   = 'scratch/preview_iglo5_profiles.svg';

const data = JSON.parse(fs.readFileSync(JSON_PATH, 'utf-8'));
const profiles = data.profiles;

// Color palette per profile name
const COLORS = {
  FRM_EXT: { fill: '#4A90D9', stroke: '#1A5FA8', label: '#fff' },
  FRM_INT: { fill: '#7EC8E3', stroke: '#1A5FA8', label: '#1A3A6B' },
  SSH_EXT: { fill: '#F5A623', stroke: '#C47A00', label: '#fff' },
  SSH_INT: { fill: '#F8D070', stroke: '#C47A00', label: '#7A4A00' },
  SPACER:  { fill: '#B8B8B8', stroke: '#555',    label: '#fff' },
  GSK_EXT: { fill: '#8A2BE2', stroke: '#5A009A', label: '#fff' },  // purple = EPDM
  GSK_INT: { fill: '#DA70D6', stroke: '#8A2BE2', label: '#3A003A' },
  BZD:     { fill: '#50C878', stroke: '#217A3A', label: '#fff' },
};

// ── Find global raw bounding box across all profiles ─────────────────────
let globalMinX = Infinity, globalMaxX = -Infinity;
let globalMinY = Infinity, globalMaxY = -Infinity;

for (const [, prof] of Object.entries(profiles)) {
  if (!prof.rawVertices?.length) continue;
  prof.rawVertices.forEach(p => {
    if (p.x < globalMinX) globalMinX = p.x;
    if (p.x > globalMaxX) globalMaxX = p.x;
    if (p.y < globalMinY) globalMinY = p.y;
    if (p.y > globalMaxY) globalMaxY = p.y;
  });
}

const SCALE   = 3.5;    // px per mm
const PADDING = 40;
const W = (globalMaxX - globalMinX) * SCALE + PADDING * 2;
const H = (globalMaxY - globalMinY) * SCALE + PADDING * 2;

function tx(x) { return (x - globalMinX) * SCALE + PADDING; }
function ty(y) { return H - ((y - globalMinY) * SCALE + PADDING); }  // flip Y

function ptsToPolyline(rawVerts) {
  return rawVerts.map(p => `${tx(p.x).toFixed(2)},${ty(p.y).toFixed(2)}`).join(' ');
}

function ptsToPath(rawVerts) {
  if (!rawVerts?.length) return '';
  const [first, ...rest] = rawVerts;
  return `M${tx(first.x).toFixed(2)},${ty(first.y).toFixed(2)} ` +
    rest.map(p => `L${tx(p.x).toFixed(2)},${ty(p.y).toFixed(2)}`).join(' ') + ' Z';
}

// ── SVG composite view ────────────────────────────────────────────────────
let svgParts = [];
svgParts.push(`<?xml version="1.0" encoding="UTF-8"?>`);
svgParts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W + 400}" height="${H + 300}" font-family="monospace" font-size="11">`);

// Background
svgParts.push(`<rect width="${W+400}" height="${H+300}" fill="#1a1a2e"/>`);

// Title
svgParts.push(`<text x="20" y="28" fill="#eee" font-size="16" font-weight="bold">IGLO 5 — Cross-Section Profile Map</text>`);
svgParts.push(`<text x="20" y="46" fill="#aaa" font-size="11">${data.source} · Generated ${data.generated}</text>`);

// Composite drawing area (all profiles overlaid in original coords)
svgParts.push(`<g transform="translate(0, 60)">`);

// Grid lines at 10mm intervals
for (let y = Math.ceil(globalMinY/10)*10; y <= globalMaxY; y += 10) {
  const sy = ty(y);
  svgParts.push(`<line x1="${PADDING/2}" y1="${sy}" x2="${W - PADDING/2}" y2="${sy}" stroke="#ffffff08" stroke-width="0.5"/>`);
  if (y % 50 === 0) svgParts.push(`<text x="${PADDING/2}" y="${sy+4}" fill="#555" font-size="9">${y}</text>`);
}
for (let x = Math.ceil(globalMinX/10)*10; x <= globalMaxX; x += 10) {
  const sx = tx(x);
  svgParts.push(`<line x1="${sx}" y1="${PADDING/2}" x2="${sx}" y2="${H - PADDING/2}" stroke="#ffffff08" stroke-width="0.5"/>`);
}

// Draw each profile
for (const [name, prof] of Object.entries(profiles)) {
  const col = COLORS[name] || { fill: '#888', stroke: '#444', label: '#fff' };
  const pts = prof.rawVertices;
  if (!pts?.length) continue;

  const d = ptsToPath(pts);
  svgParts.push(`<g id="profile-${name}" opacity="0.75">`);
  svgParts.push(`  <path d="${d}" fill="${col.fill}" stroke="${col.stroke}" stroke-width="0.8" fill-opacity="0.6"/>`);
  svgParts.push(`</g>`);
}

// Labels over each profile centroid
for (const [name, prof] of Object.entries(profiles)) {
  const col = COLORS[name] || { fill: '#888', stroke: '#444', label: '#fff' };
  const pts = prof.rawVertices;
  if (!pts?.length) continue;
  const cx = pts.reduce((s,p) => s+p.x, 0) / pts.length;
  const cy = pts.reduce((s,p) => s+p.y, 0) / pts.length;
  svgParts.push(`<rect x="${tx(cx)-22}" y="${ty(cy)-10}" width="44" height="14" rx="3" fill="${col.fill}" opacity="0.9"/>`);
  svgParts.push(`<text x="${tx(cx)}" y="${ty(cy)+2}" fill="${col.label}" text-anchor="middle" font-size="10" font-weight="bold">${name}</text>`);
}

svgParts.push(`</g>`); // end transform(0,60)

// ── Per-profile individual panels (right column) ─────────────────────────
const panelW = 160, panelH = 120, panelPad = 10;
const panelStartX = W + 20;
let panelY = 60;

svgParts.push(`<text x="${panelStartX}" y="${panelY - 12}" fill="#ccc" font-size="12" font-weight="bold">Individual Profiles (normalised)</text>`);

for (const [name, prof] of Object.entries(profiles)) {
  const col = COLORS[name] || { fill: '#888', stroke: '#444', label: '#fff' };
  const verts = prof.vertices;  // already normalised to 0,0 origin with Y-flipped
  if (!verts?.length) {
    panelY += panelH + 8;
    continue;
  }

  // Scale to fit panel
  let minX=Infinity, maxX=-Infinity, minY=Infinity, maxY=-Infinity;
  verts.forEach(p => {
    if(p.x<minX)minX=p.x; if(p.x>maxX)maxX=p.x;
    if(p.y<minY)minY=p.y; if(p.y>maxY)maxY=p.y;
  });
  const usableW = panelW - panelPad * 2;
  const usableH = panelH - panelPad * 2 - 18;
  const scaleX = usableW / Math.max(maxX - minX, 0.001);
  const scaleY = usableH / Math.max(maxY - minY, 0.001);
  const sc = Math.min(scaleX, scaleY);

  const ptx = x => panelStartX + panelPad + (x - minX) * sc;
  const pty = y => panelY + panelPad + 16 + (maxY - y) * sc;

  const d = 'M' + verts.map(p => `${ptx(p.x).toFixed(1)},${pty(p.y).toFixed(1)}`).join('L') + 'Z';
  const bboxW = (maxX - minX).toFixed(1);
  const bboxH = (maxY - minY).toFixed(1);

  svgParts.push(`<rect x="${panelStartX}" y="${panelY}" width="${panelW}" height="${panelH}" rx="4" fill="#ffffff08" stroke="#ffffff18"/>`);
  svgParts.push(`<text x="${panelStartX + panelPad}" y="${panelY + 13}" fill="${col.fill}" font-weight="bold" font-size="11">${name}</text>`);
  svgParts.push(`<text x="${panelStartX + panelW - panelPad}" y="${panelY + 13}" fill="#888" font-size="9" text-anchor="end">${bboxW}×${bboxH}mm  ${prof.pointCount}pts</text>`);
  svgParts.push(`<path d="${d}" fill="${col.fill}" fill-opacity="0.5" stroke="${col.stroke}" stroke-width="1"/>`);

  panelY += panelH + 8;
}

// ── Legend ────────────────────────────────────────────────────────────────
const legX = 20, legY = H + 70;
svgParts.push(`<text x="${legX}" y="${legY}" fill="#ccc" font-size="12" font-weight="bold">Legend</text>`);
let lx = legX;
for (const [name, col] of Object.entries(COLORS)) {
  svgParts.push(`<rect x="${lx}" y="${legY + 8}" width="14" height="14" rx="2" fill="${col.fill}" stroke="${col.stroke}"/>`);
  svgParts.push(`<text x="${lx + 17}" y="${legY + 19}" fill="#ccc" font-size="10">${name}</text>`);
  lx += 80;
}

svgParts.push(`</svg>`);

fs.writeFileSync(OUT_SVG, svgParts.join('\n'));
console.log(`✓ SVG preview written: ${OUT_SVG}`);
console.log(`  Canvas: ${W+400}×${H+300}px  |  Scale: ${SCALE}px/mm`);
