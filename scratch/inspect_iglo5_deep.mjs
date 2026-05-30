/**
 * inspect_iglo5_deep.mjs
 * 
 * Recursively unwraps all nested INSERT → BLOCK chains, then maps
 * every entity (LWPOLYLINE, LINE, ARC, CIRCLE, HATCH, etc.) to its
 * layer name, ACI color, and bounding box.
 * 
 * This gives us the true layer layout of the Iglo5 cross-section.
 */

import fs from 'fs';
import DxfParser from 'dxf-parser';

const DXF_PATH = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\system\\systemy Drutex\\Processed DWGs by Marc\\Iglo5_for Antigravity processing.dxf";

console.log(`Reading: ${DXF_PATH}\n`);
const text = fs.readFileSync(DXF_PATH, 'utf-8');
const parser = new DxfParser();
const dxf = parser.parseSync(text);

// ── ACI color name helper ──────────────────────────────────────────────────
const ACI_NAMES = {
  1: 'Red', 2: 'Yellow', 3: 'Green', 4: 'Cyan',
  5: 'Blue', 6: 'Magenta/Purple', 7: 'White/Black',
  0: 'ByBlock', 256: 'ByLayer',
};
function aciName(c) { return ACI_NAMES[c] ? `${c} (${ACI_NAMES[c]})` : `${c}`; }

// ── Layer info from tables ─────────────────────────────────────────────────
const layerTable = dxf.tables?.layer?.layers || {};

function getLayerColor(layerName) {
  const entry = layerTable[layerName] || layerTable[layerName?.toUpperCase()];
  return entry?.color ?? null;
}

// ── Accumulator ───────────────────────────────────────────────────────────
const layerMap = {};

function ensureLayer(name) {
  if (!layerMap[name]) {
    layerMap[name] = {
      entities: 0,
      vertexCount: 0,
      types: new Set(),
      colorCodes: new Set(),
      minX: Infinity, maxX: -Infinity,
      minY: Infinity, maxY: -Infinity,
    };
  }
  return layerMap[name];
}

function addPoint(L, x, y) {
  if (x < L.minX) L.minX = x;
  if (x > L.maxX) L.maxX = x;
  if (y < L.minY) L.minY = y;
  if (y > L.maxY) L.maxY = y;
}

// ── Recursive entity processor ────────────────────────────────────────────
// visitedBlocks prevents infinite loops from circular INSERT references
function processEntity(ent, tx = 0, ty = 0, parentColor = null, visitedBlocks = new Set()) {
  if (!ent) return;

  if (ent.type === 'INSERT') {
    const block = dxf.blocks?.[ent.name];
    if (!block || visitedBlocks.has(ent.name)) return;
    const newVisited = new Set(visitedBlocks);
    newVisited.add(ent.name);

    const bx = tx + (ent.position?.x || 0);
    const by = ty + (ent.position?.y || 0);
    const inheritColor = ent.colorIndex ?? parentColor;

    (block.entities || []).forEach(be => processEntity(be, bx, by, inheritColor, newVisited));
    return;
  }

  // Resolve layer name
  const layerName = (ent.layer || '0').toUpperCase();
  const L = ensureLayer(layerName);
  L.entities++;
  L.types.add(ent.type);

  // Resolve color: entity → inherited (from INSERT) → layer table
  const colorCode = ent.colorIndex !== undefined
    ? ent.colorIndex
    : parentColor !== null
      ? parentColor
      : getLayerColor(ent.layer);
  if (colorCode !== null) L.colorCodes.add(colorCode);

  // Bounding box
  if (ent.vertices?.length) {
    ent.vertices.forEach(v => {
      addPoint(L, (v.x || 0) + tx, (v.y || 0) + ty);
      L.vertexCount++;
    });
  }

  if (ent.type === 'LINE') {
    [ent.start, ent.end].filter(Boolean).forEach(pt => {
      addPoint(L, (pt.x || 0) + tx, (pt.y || 0) + ty);
      L.vertexCount++;
    });
  }

  if (ent.type === 'ARC' || ent.type === 'CIRCLE') {
    const r = ent.radius || 0;
    const cx = (ent.center?.x || 0) + tx;
    const cy = (ent.center?.y || 0) + ty;
    addPoint(L, cx - r, cy - r);
    addPoint(L, cx + r, cy + r);
    L.vertexCount++;
  }

  if (ent.type === 'HATCH') {
    // HATCH boundary paths contain loop arrays of edges
    (ent.boundaryPaths || []).forEach(path => {
      (path.edges || []).forEach(edge => {
        if (edge.type === 'LineEdge') {
          addPoint(L, (edge.start?.x || 0) + tx, (edge.start?.y || 0) + ty);
          addPoint(L, (edge.end?.x || 0) + tx, (edge.end?.y || 0) + ty);
        }
        if (edge.type === 'ArcEdge') {
          const r = edge.radius || 0;
          const cx = (edge.center?.x || 0) + tx;
          const cy = (edge.center?.y || 0) + ty;
          addPoint(L, cx - r, cy - r);
          addPoint(L, cx + r, cy + r);
        }
      });
      (path.bulgeVertices || []).forEach(v => {
        addPoint(L, (v.x || 0) + tx, (v.y || 0) + ty);
      });
    });
  }
}

// Start recursion from top-level entities
dxf.entities.forEach(ent => processEntity(ent));

// ── Print sorted results ──────────────────────────────────────────────────
const sorted = Object.entries(layerMap).sort(([, a], [, b]) => {
  const aCy = (a.minY + a.maxY) / 2;
  const bCy = (b.minY + b.maxY) / 2;
  return bCy - aCy; // Descending Y → top of drawing first
});

console.log('='.repeat(100));
console.log('DEEP LAYER MAP — Iglo5_for Antigravity processing.dxf');
console.log('='.repeat(100));

sorted.forEach(([name, L]) => {
  const w  = L.maxX === -Infinity ? 'n/a' : (L.maxX - L.minX).toFixed(2);
  const h  = L.maxY === -Infinity ? 'n/a' : (L.maxY - L.minY).toFixed(2);
  const cx = L.maxX === -Infinity ? 'n/a' : ((L.minX + L.maxX) / 2).toFixed(2);
  const cy = L.maxY === -Infinity ? 'n/a' : ((L.minY + L.maxY) / 2).toFixed(2);
  const colors = [...L.colorCodes].map(aciName).join(', ') || '(no color info)';
  const isPurple = [...L.colorCodes].includes(6);
  const tag = isPurple ? '  ← GASKET candidate (ACI 6 = purple)' : '';

  console.log(`\nLAYER: ${name}${tag}`);
  console.log(`  Entity types : ${[...L.types].join(', ')}`);
  console.log(`  Colors (ACI) : ${colors}`);
  console.log(`  Entities     : ${L.entities}   Vertices: ${L.vertexCount}`);
  console.log(`  BBox X       : [${L.minX?.toFixed(3)} → ${L.maxX?.toFixed(3)}]  width=${w}`);
  console.log(`  BBox Y       : [${L.minY?.toFixed(3)} → ${L.maxY?.toFixed(3)}]  height=${h}`);
  console.log(`  Center       : (${cx}, ${cy})`);
});

// ── Compact summary table ─────────────────────────────────────────────────
console.log('\n' + '='.repeat(100));
console.log('COMPACT SUMMARY (sorted top→bottom by Y center)');
console.log('='.repeat(100));
console.log(
  'LAYER'.padEnd(28),
  'ENT'.padEnd(6),
  'W'.padEnd(10),
  'H'.padEnd(10),
  'Cy'.padEnd(10),
  'TYPES / COLORS'
);
console.log('-'.repeat(100));
sorted.forEach(([name, L]) => {
  const w  = L.maxX === -Infinity ? 'n/a' : (L.maxX - L.minX).toFixed(1);
  const h  = L.maxY === -Infinity ? 'n/a' : (L.maxY - L.minY).toFixed(1);
  const cy = L.maxY === -Infinity ? 'n/a' : ((L.minY + L.maxY) / 2).toFixed(1);
  const colors = [...L.colorCodes].map(c => c === 6 ? '6(PURPLE)' : aciName(c)).join(',');
  const types = [...L.types].join(',');
  const isPurple = [...L.colorCodes].includes(6) ? ' ← GSK' : '';
  console.log(
    (name + isPurple).padEnd(28),
    String(L.entities).padEnd(6),
    w.padEnd(10),
    h.padEnd(10),
    cy.padEnd(10),
    `${types} | ${colors}`
  );
});

// ── List all blocks with their layer composition ──────────────────────────
console.log('\n' + '='.repeat(100));
console.log('BLOCK INVENTORY (nested structure)');
console.log('='.repeat(100));
Object.entries(dxf.blocks || {}).forEach(([bname, block]) => {
  if (bname.startsWith('*')) return; // skip model/paper space
  const layers = new Set((block.entities || []).map(e => (e.layer || '0').toUpperCase()));
  const types  = new Set((block.entities || []).map(e => e.type));
  const inserts = (block.entities || []).filter(e => e.type === 'INSERT').map(e => e.name);
  console.log(`\n  BLOCK: "${bname}"`);
  console.log(`    Entities : ${block.entities?.length || 0}`);
  console.log(`    Layers   : ${[...layers].join(', ')}`);
  console.log(`    Types    : ${[...types].join(', ')}`);
  if (inserts.length) console.log(`    INSERTs  : ${inserts.join(', ')}`);
});
