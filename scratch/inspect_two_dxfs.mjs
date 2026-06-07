import fs from 'fs';
import DxfParser from 'dxf-parser';

const files = [
  'C:/Users/Shadow/Cloud-Drive/Web dev Drutex Product Content/CAD Files Drutex/DWG to DXF conversion tests/Iglo Edge Slide/Door post on moving door with external gaskets.dxf',
  'C:/Users/Shadow/Cloud-Drive/Web dev Drutex Product Content/CAD Files Drutex/DWG to DXF conversion tests/Iglo Edge Slide/IGLO_EDGE_SLIDE_BLOCK_FIX_PART.dxf',
];

for (const filePath of files) {
  const text = fs.readFileSync(filePath, 'utf8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(text);

  console.log(`\n${'='.repeat(70)}`);
  console.log(`FILE: ${filePath.split('/').pop()}`);
  console.log(`Top-level entities: ${dxf.entities.length}`);
  console.log(`Block count: ${Object.keys(dxf.blocks).length}`);

  // Collect all layers via recursive scan
  const layerInfo = {};
  function scan(entities, depth = 0) {
    for (const e of entities || []) {
      if (e.layer) {
        if (!layerInfo[e.layer]) layerInfo[e.layer] = { types: new Set(), depth };
        layerInfo[e.layer].types.add(e.type);
        layerInfo[e.layer].depth = Math.min(layerInfo[e.layer].depth, depth);
      }
      if (e.type === 'INSERT' && dxf.blocks[e.name]) {
        scan(dxf.blocks[e.name].entities, depth + 1);
      }
    }
  }
  scan(dxf.entities, 0);

  console.log('\nAll layers (recursive):');
  for (const [layer, info] of Object.entries(layerInfo).sort()) {
    console.log(`  "${layer}" — types: [${[...info.types].join(', ')}]  (min depth: ${info.depth})`);
  }

  // Show top-level blocks
  const userBlocks = Object.keys(dxf.blocks).filter(b => !b.startsWith('*'));
  if (userBlocks.length > 0) {
    console.log('\nUser-defined blocks:');
    for (const b of userBlocks) {
      const block = dxf.blocks[b];
      const blockLayers = [...new Set((block.entities || []).map(e => e.layer).filter(Boolean))];
      console.log(`  Block "${b}" — layers: [${blockLayers.join(', ')}]`);
    }
  }
}
