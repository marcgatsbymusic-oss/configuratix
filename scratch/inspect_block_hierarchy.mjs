import fs from 'fs';
import DxfParser from 'dxf-parser';

const INPUT_FILE = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO EDGE SERIES\\IGE_FRM_SSH.dxf";

try {
  const text = fs.readFileSync(INPUT_FILE, 'utf8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(text);

  function printTree(blockName, indent = "") {
    const block = dxf.blocks[blockName];
    if (!block) return;
    
    // Find all insert entities inside the block
    const inserts = (block.entities || []).filter(e => e.type === 'INSERT');
    inserts.forEach(ins => {
      console.log(`${indent}└── INSERT Block "${ins.name}" at x=${ins.position?.x}, y=${ins.position?.y}, scaleX=${ins.xScale}, scaleY=${ins.yScale}, rotation=${ins.rotation}`);
      printTree(ins.name, indent + "    ");
    });
  }

  console.log("Top-level inserts in Model_Space:");
  dxf.entities.filter(e => e.type === 'INSERT').forEach(ins => {
    console.log(`INSERT Block "${ins.name}" at x=${ins.position?.x}, y=${ins.position?.y}, scaleX=${ins.xScale}, scaleY=${ins.yScale}, rotation=${ins.rotation}`);
    printTree(ins.name, "    ");
  });

} catch (err) {
  console.error(err);
}
