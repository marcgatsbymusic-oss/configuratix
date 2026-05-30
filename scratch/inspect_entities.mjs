import fs from 'fs';
import DxfParser from 'dxf-parser';

const file = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG to DXF conversion tests\\IGLO 5 Drawing1.dxf";
const fileText = fs.readFileSync(file, 'utf-8');
const parser = new DxfParser();
const dxf = parser.parseSync(fileText);

console.log("Analyzing nested structure recursively...");

const entitySummary = [];

function traverse(ent, offsetX = 0, offsetY = 0, depth = 0) {
  const prefix = "  ".repeat(depth);
  if (ent.type === 'INSERT') {
    const block = dxf.blocks[ent.name];
    console.log(`${prefix}- INSERT block "${ent.name}" at (${ent.position.x}, ${ent.position.y})`);
    if (block && block.entities) {
      block.entities.forEach(child => {
        traverse(child, offsetX + (ent.position.x || 0), offsetY + (ent.position.y || 0), depth + 1);
      });
    }
  } else {
    // Collect leaf entity
    entitySummary.push({
      type: ent.type,
      layer: ent.layer,
      colorIndex: ent.colorIndex,
      color: ent.color,
      verticesCount: ent.vertices ? ent.vertices.length : 0,
      firstVertex: ent.vertices ? ent.vertices[0] : null,
      offsetX,
      offsetY
    });
  }
}

dxf.entities.forEach(ent => {
  traverse(ent, 0, 0, 0);
});

console.log(`\nTotal leaf entities collected: ${entitySummary.length}`);

// Group by layer
const byLayer = {};
entitySummary.forEach(e => {
  if (!byLayer[e.layer]) byLayer[e.layer] = [];
  byLayer[e.layer].push(e);
});

console.log("\nLeaf entities grouped by layer:");
for (const [layer, list] of Object.entries(byLayer)) {
  console.log(`- Layer "${layer}": ${list.length} entities`);
  const types = new Set(list.map(e => e.type));
  console.log(`  Types:`, Array.from(types));
  
  // Show color index distribution
  const colors = {};
  list.forEach(e => {
    colors[e.colorIndex] = (colors[e.colorIndex] || 0) + 1;
  });
  console.log(`  Colors (index: count):`, colors);

  // If there are polylines, show vertex counts of some of them
  const polylines = list.filter(e => e.type.includes('POLYLINE') && e.verticesCount > 0);
  if (polylines.length > 0) {
    console.log(`  Sample Polyline verticesCount:`, polylines.map(p => p.verticesCount).slice(0, 5));
  }
}
