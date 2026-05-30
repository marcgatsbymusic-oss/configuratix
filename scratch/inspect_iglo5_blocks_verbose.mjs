/**
 * inspect_iglo5_blocks_verbose.mjs
 * 
 * For each block that is not a model/paper space placeholder,
 * print every entity with its layer, type, colorIndex, and 
 * the first few vertices / start-end points so we can understand
 * the spatial arrangement.
 */

import fs from 'fs';
import DxfParser from 'dxf-parser';

const DXF_PATH = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\system\\systemy Drutex\\Processed DWGs by Marc\\Iglo5_for Antigravity processing.dxf";

const text = fs.readFileSync(DXF_PATH, 'utf-8');
const parser = new DxfParser();
const dxf = parser.parseSync(text);

const ACI = { 1:'Red', 2:'Yellow', 3:'Green', 4:'Cyan', 5:'Blue', 6:'PURPLE', 7:'White/Black', 0:'ByBlock', 256:'ByLayer' };
const aciStr = c => ACI[c] ? `${c}(${ACI[c]})` : `${c}`;

function describeEntity(ent, indent = '    ') {
  const color = ent.colorIndex !== undefined ? aciStr(ent.colorIndex) : 'ByLayer';
  let desc = `${indent}[${ent.type}] layer="${ent.layer || '0'}" color=${color}`;
  
  if (ent.type === 'INSERT') {
    desc += `  → block="${ent.name}" at (${ent.position?.x?.toFixed(3)||0}, ${ent.position?.y?.toFixed(3)||0})`;
  }
  
  if (ent.vertices?.length) {
    // Print bounding box + first 4 vertices
    let minX=Infinity, maxX=-Infinity, minY=Infinity, maxY=-Infinity;
    ent.vertices.forEach(v => {
      if(v.x<minX)minX=v.x; if(v.x>maxX)maxX=v.x;
      if(v.y<minY)minY=v.y; if(v.y>maxY)maxY=v.y;
    });
    const sample = ent.vertices.slice(0, 4).map(v => `(${v.x?.toFixed(2)},${v.y?.toFixed(2)})`).join(' ');
    desc += `\n${indent}  verts=${ent.vertices.length}  bbox=[${minX.toFixed(2)}..${maxX.toFixed(2)}, ${minY.toFixed(2)}..${maxY.toFixed(2)}]`;
    desc += `\n${indent}  sample: ${sample}${ent.vertices.length>4?` ...+${ent.vertices.length-4} more`:''}`;
    if (ent.vertices.some(v => v.bulge && v.bulge !== 0)) {
      const bulged = ent.vertices.filter(v=>v.bulge && v.bulge !== 0);
      desc += `\n${indent}  ⚠ HAS BULGE/ARC at ${bulged.length} vertex(es): ${bulged.slice(0,3).map(v=>`bulge=${v.bulge?.toFixed(3)}`).join(', ')}`;
    }
  }
  
  if (ent.type === 'LINE' && ent.start) {
    desc += `  from (${ent.start.x?.toFixed(2)},${ent.start.y?.toFixed(2)}) to (${ent.end?.x?.toFixed(2)},${ent.end?.y?.toFixed(2)})`;
  }
  
  if (ent.type === 'ARC' && ent.center) {
    desc += `  center(${ent.center.x?.toFixed(2)},${ent.center.y?.toFixed(2)}) r=${ent.radius?.toFixed(3)} ang=[${ent.startAngle?.toFixed(1)}°..${ent.endAngle?.toFixed(1)}°]`;
  }
  
  return desc;
}

Object.entries(dxf.blocks || {}).forEach(([bname, block]) => {
  if (bname.startsWith('*')) return;
  console.log(`\n${'═'.repeat(80)}`);
  console.log(`BLOCK: "${bname}"  (${block.entities?.length || 0} entities)`);
  if (block.position) console.log(`  base point: (${block.position.x}, ${block.position.y})`);
  console.log('─'.repeat(80));
  (block.entities || []).forEach((ent, i) => {
    console.log(`  [${i}] ${describeEntity(ent, '      ')}`);
  });
});

// Also show the top-level entities
console.log(`\n${'═'.repeat(80)}`);
console.log(`TOP-LEVEL ENTITIES (${dxf.entities?.length || 0} total)`);
console.log('─'.repeat(80));
(dxf.entities || []).forEach((ent, i) => {
  console.log(`  [${i}] ${describeEntity(ent, '      ')}`);
});
