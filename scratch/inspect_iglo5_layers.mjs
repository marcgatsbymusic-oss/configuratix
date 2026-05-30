/**
 * inspect_iglo5_layers.mjs
 * 
 * Reads the Iglo5 DXF file and produces a detailed layer map:
 * - Layer name
 * - Entity types on that layer
 * - ACI color code (used to identify gaskets = purple = ACI 6)
 * - Number of entities & total vertex count
 * - Bounding box (minX, maxX, minY, maxY)
 */

import fs from 'fs';
import DxfParser from 'dxf-parser';

const DXF_PATH = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\system\\systemy Drutex\\Processed DWGs by Marc\\Iglo5_for Antigravity processing.dxf";

console.log(`Reading: ${DXF_PATH}\n`);
const text = fs.readFileSync(DXF_PATH, 'utf-8');
const parser = new DxfParser();
const dxf = parser.parseSync(text);

// ── Collect layer table info ────────────────────────────────────────────────
const layerTable = dxf.tables?.layer?.layers || {};

// ── Walk all entities (top-level + inside BLOCKs) ──────────────────────────
const layerMap = {};   // layerName → { entities, colors, types, bbox }

function processEntity(ent, offsetX = 0, offsetY = 0) {
  const name = (ent.layer || '0').toUpperCase();
  if (!layerMap[name]) {
    layerMap[name] = {
      entities: 0,
      vertexCount: 0,
      types: new Set(),
      colors: new Set(),  // ACI color codes seen on entities of this layer
      minX: Infinity, maxX: -Infinity,
      minY: Infinity, maxY: -Infinity,
    };
  }
  const L = layerMap[name];
  L.entities++;
  L.types.add(ent.type);

  // Color — prefer entity color, fall back to layer color
  const aciColor = ent.colorIndex ??
    layerTable[ent.layer]?.color ??
    layerTable[ent.layer?.toUpperCase()]?.color ??
    null;
  if (aciColor !== null) L.colors.add(aciColor);

  // Collect bounding box from vertices
  const pts = ent.vertices || [];
  pts.forEach(v => {
    const x = (v.x || 0) + offsetX;
    const y = (v.y || 0) + offsetY;
    if (x < L.minX) L.minX = x;
    if (x > L.maxX) L.maxX = x;
    if (y < L.minY) L.minY = y;
    if (y > L.maxY) L.maxY = y;
    L.vertexCount++;
  });

  // LINE entities have start/end instead of vertices array
  if (ent.type === 'LINE') {
    [ent.start, ent.end].forEach(pt => {
      if (!pt) return;
      const x = (pt.x || 0) + offsetX;
      const y = (pt.y || 0) + offsetY;
      if (x < L.minX) L.minX = x;
      if (x > L.maxX) L.maxX = x;
      if (y < L.minY) L.minY = y;
      if (y > L.maxY) L.maxY = y;
      L.vertexCount++;
    });
  }

  // ARC / CIRCLE bounding box estimate
  if ((ent.type === 'ARC' || ent.type === 'CIRCLE') && ent.center) {
    const r = ent.radius || 0;
    const cx = (ent.center.x || 0) + offsetX;
    const cy = (ent.center.y || 0) + offsetY;
    if (cx - r < L.minX) L.minX = cx - r;
    if (cx + r > L.maxX) L.maxX = cx + r;
    if (cy - r < L.minY) L.minY = cy - r;
    if (cy + r > L.maxY) L.maxY = cy + r;
    L.vertexCount++;
  }
}

// Top-level entities
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

// ── ACI color name helper ──────────────────────────────────────────────────
const ACI_NAMES = {
  1: 'Red', 2: 'Yellow', 3: 'Green', 4: 'Cyan',
  5: 'Blue', 6: 'Magenta/Purple', 7: 'White/Black',
  0: 'ByBlock', 256: 'ByLayer',
};
function aciName(c) { return ACI_NAMES[c] ? `${c} (${ACI_NAMES[c]})` : `${c}`; }

// ── Print results ──────────────────────────────────────────────────────────
console.log('='.repeat(90));
console.log('LAYER MAP — Iglo5_for Antigravity processing.dxf');
console.log('='.repeat(90));

// Sort layers by bounding-box Y center (top to bottom visually)
const sorted = Object.entries(layerMap).sort(([, a], [, b]) => {
  const aYc = (a.minY + a.maxY) / 2;
  const bYc = (b.minY + b.maxY) / 2;
  return bYc - aYc; // Descending Y = top first
});

sorted.forEach(([name, L]) => {
  const w = L.maxX === -Infinity ? 'n/a' : (L.maxX - L.minX).toFixed(2);
  const h = L.maxY === -Infinity ? 'n/a' : (L.maxY - L.minY).toFixed(2);
  const cx = L.maxX === -Infinity ? 'n/a' : ((L.minX + L.maxX) / 2).toFixed(2);
  const cy = L.maxY === -Infinity ? 'n/a' : ((L.minY + L.maxY) / 2).toFixed(2);
  const colors = [...L.colors].map(aciName).join(', ') || 'ByLayer';
  const types = [...L.types].join(', ');
  const isGasket = [...L.colors].includes(6) ? '  ← GASKET (purple ACI 6)' : '';
  console.log(`\nLAYER: ${name}${isGasket}`);
  console.log(`  Types      : ${types}`);
  console.log(`  Colors(ACI): ${colors}`);
  console.log(`  Entities   : ${L.entities}  |  Vertices: ${L.vertexCount}`);
  console.log(`  BBox       : X[${L.minX?.toFixed(2)} → ${L.maxX?.toFixed(2)}] (w=${w})  Y[${L.minY?.toFixed(2)} → ${L.maxY?.toFixed(2)}] (h=${h})`);
  console.log(`  Center     : (${cx}, ${cy})`);
});

// ── Summary table ──────────────────────────────────────────────────────────
console.log('\n' + '='.repeat(90));
console.log('SUMMARY: layers by Y position (highest Y = top of drawing)');
console.log('='.repeat(90));
console.log(`${'LAYER'.padEnd(22)} ${'ENTITIES'.padEnd(10)} ${'TYPES'.padEnd(30)} ${'COLORS'}` );
console.log('-'.repeat(90));
sorted.forEach(([name, L]) => {
  const colors = [...L.colors].map(aciName).join(', ') || 'ByLayer';
  console.log(`${name.padEnd(22)} ${String(L.entities).padEnd(10)} ${[...L.types].join(', ').padEnd(30)} ${colors}`);
});

// ── List all block names ───────────────────────────────────────────────────
if (dxf.blocks) {
  console.log('\n' + '='.repeat(90));
  console.log('BLOCKS defined in file:');
  console.log('='.repeat(90));
  Object.keys(dxf.blocks).forEach(b => {
    const blk = dxf.blocks[b];
    console.log(`  ${b}  (${blk.entities?.length || 0} entities)`);
  });
}
