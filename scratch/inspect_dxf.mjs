import fs from 'fs';
import DxfParser from 'dxf-parser';

const file = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG to DXF conversion tests\\IGLO 5 Drawing1.dxf";
const fileText = fs.readFileSync(file, 'utf-8');
const parser = new DxfParser();
const dxf = parser.parseSync(fileText);

console.log("Insert entities details:");
dxf.entities.forEach((ent, idx) => {
  if (ent.type === 'INSERT') {
    console.log(`- Insert #${idx}: block name = "${ent.name}" at position:`, ent.position);
  }
});

console.log("\nBlocks list:");
const blockNames = Object.keys(dxf.blocks || {});
console.log(blockNames);

blockNames.forEach(name => {
  const block = dxf.blocks[name];
  console.log(`\nBlock "${name}" has ${block.entities ? block.entities.length : 0} entities.`);
  if (block.entities && block.entities.length > 0) {
    const blockLayers = new Set();
    const blockEntTypes = new Set();
    block.entities.forEach(e => {
      blockLayers.add(e.layer);
      blockEntTypes.add(e.type);
    });
    console.log(`  Layers in block:`, Array.from(blockLayers));
    console.log(`  Entity types in block:`, Array.from(blockEntTypes));
    
    // Let's print first few entities of the block
    console.log(`  Sample entity:`, JSON.stringify(block.entities[0], null, 2));
  }
});
