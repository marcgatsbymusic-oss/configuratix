import fs from 'fs';
import DxfParser from 'dxf-parser';

const INPUT_FILE = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO EDGE SERIES\\IGE_FRM_SSH.dxf";

try {
  const text = fs.readFileSync(INPUT_FILE, 'utf8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(text);

  console.log(`Blocks in IGE_FRM_SSH.dxf (${Object.keys(dxf.blocks).length}):`);
  for (const [name, block] of Object.entries(dxf.blocks)) {
    console.log(`  Block: "${name}" (${block.entities?.length || 0} entities)`);
  }
} catch (err) {
  console.error(err);
}
