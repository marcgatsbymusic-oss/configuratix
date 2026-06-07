/**
 * Inspect the actual coordinate ranges per layer in IGLO_EDGE_SLIDE_BLOCK_FIX_PART.dxf
 * to understand why bounds are enormous
 */
import fs from 'fs';
import DxfParser from 'dxf-parser';

const INPUT_FILE = 'C:/Users/Shadow/Cloud-Drive/Web dev Drutex Product Content/CAD Files Drutex/DWG to DXF conversion tests/Iglo Edge Slide/IGLO_EDGE_SLIDE_BLOCK_FIX_PART.dxf';

const text = fs.readFileSync(INPUT_FILE, 'utf8');
const parser = new DxfParser();
const dxf = parser.parseSync(text);

const TARGET = ['BLOCK_FIX_INT', 'BLOCK_FIX_EXT', 'Aluminium Rail', 'BZD', 'SPACER', 'GSK_BLOCK_FIX_EXT', 'GSK_FIX_INT', 'GSK_BZD', 'Profil stal', 'GLS_EXT', 'GLS_INT', 'GLS_MDL'];

const layerCoords = {};
const layerDepth = {};

function getLayerKey(name) {
  return TARGET.find(t => t.toUpperCase() === name?.toUpperCase()) || null;
}

function transformPt(pt, tx) {
  let xs = pt.x * tx.scaleX, ys = pt.y * tx.scaleY;
  return {
    x: xs * Math.cos(tx.rotation) - ys * Math.sin(tx.rotation) + tx.x,
    y: xs * Math.sin(tx.rotation) + ys * Math.cos(tx.rotation) + tx.y,
  };
}

function scan(entities, tx, depth) {
  for (const ent of entities || []) {
    if (ent.type === 'INSERT') {
      const block = dxf.blocks[ent.name];
      if (block && block.entities) {
        const rot = (ent.rotation || 0) * Math.PI / 180;
        const sx = (ent.xScale === undefined || ent.xScale === 0) ? 1 : ent.xScale;
        const sy = (ent.yScale === undefined || ent.yScale === 0) ? 1 : ent.yScale;
        const posT = transformPt({ x: ent.position.x || 0, y: ent.position.y || 0 }, tx);
        scan(block.entities, { x: posT.x, y: posT.y, rotation: tx.rotation + rot, scaleX: tx.scaleX * sx, scaleY: tx.scaleY * sy }, depth + 1);
      }
    } else {
      const key = getLayerKey(ent.layer);
      if (!key) continue;
      if (!layerCoords[key]) layerCoords[key] = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity, depths: new Set() };
      layerCoords[key].depths.add(depth);
      const info = layerCoords[key];

      const trackPt = (p) => {
        const wp = transformPt(p, tx);
        if (wp.x < info.minX) info.minX = wp.x;
        if (wp.x > info.maxX) info.maxX = wp.x;
        if (wp.y < info.minY) info.minY = wp.y;
        if (wp.y > info.maxY) info.maxY = wp.y;
      };

      if ((ent.type === 'LWPOLYLINE' || ent.type === 'POLYLINE') && ent.vertices) {
        for (const v of ent.vertices) trackPt({ x: v.x, y: v.y });
      } else if (ent.type === 'LINE' && ent.vertices?.length >= 2) {
        trackPt(ent.vertices[0]); trackPt(ent.vertices[1]);
      } else if (ent.type === 'ARC' && ent.center) {
        trackPt({ x: ent.center.x - ent.radius, y: ent.center.y - ent.radius });
        trackPt({ x: ent.center.x + ent.radius, y: ent.center.y + ent.radius });
      }
    }
  }
}

scan(dxf.entities, { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 }, 0);

console.log('\nLayer coordinate ranges:');
for (const [layer, info] of Object.entries(layerCoords)) {
  const w = (info.maxX - info.minX).toFixed(2);
  const h = (info.maxY - info.minY).toFixed(2);
  console.log(`  "${layer}" → X: ${info.minX.toFixed(2)} to ${info.maxX.toFixed(2)} (${w}mm wide) | Y: ${info.minY.toFixed(2)} to ${info.maxY.toFixed(2)} (${h}mm tall) | depths: [${[...info.depths]}]`);
}

// Also check top-level entities
console.log('\nTop-level entity details:');
for (const ent of dxf.entities) {
  const key = getLayerKey(ent.layer);
  if (key) {
    console.log(`  Layer: "${ent.layer}", type: ${ent.type}, pos: ${JSON.stringify(ent.position || ent.center || ent.vertices?.[0])}`);
  }
  if (ent.type === 'INSERT') {
    console.log(`  INSERT block "${ent.name}" at pos ${JSON.stringify(ent.position)} scale(${ent.xScale},${ent.yScale}) rot:${ent.rotation||0}`);
  }
}
