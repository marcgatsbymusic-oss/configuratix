import fs from 'fs';
import DxfParser from 'dxf-parser';

const dxfPath = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\Monday 8th experiment\\Roller_Blind_225.dxf";

try {
  const fileText = fs.readFileSync(dxfPath, 'utf-8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(fileText);

  // We want to find all entities on layer 'profil pcw' or 'Sichtbare Kanten(DIN)' or '0'
  // inside the blocks R0021-A, R0022-A, R0023, R0024-A, R0027-A, R0029-A
  const blocksToInspect = ['R0021-A', 'R0022-A', 'R0023', 'R0024-A', 'R0027-A', 'R0029-A'];

  blocksToInspect.forEach(blockName => {
    const block = dxf.blocks[blockName];
    if (!block) {
      console.log(`Block ${blockName} not found`);
      return;
    }
    console.log(`\n--- Block: ${blockName} ---`);
    block.entities?.forEach((ent, idx) => {
      console.log(`  Entity ${idx}: Type=${ent.type}, Layer=${ent.layer}`);
      if (ent.type === 'LWPOLYLINE' || ent.type === 'POLYLINE') {
        console.log(`    Vertices count: ${ent.vertices?.length}`);
        ent.vertices?.forEach((v, vIdx) => {
          if (vIdx < 5 || vIdx >= ent.vertices.length - 5) {
            console.log(`      v[${vIdx}]: x=${v.x.toFixed(2)}, y=${v.y.toFixed(2)}, bulge=${v.bulge ?? 0}`);
          }
        });
      } else if (ent.type === 'LINE') {
        console.log(`    Line: (${ent.x1.toFixed(2)}, ${ent.y1.toFixed(2)}) -> (${ent.x2.toFixed(2)}, ${ent.y2.toFixed(2)})`);
      }
    });
  });

} catch (err) {
  console.error(err);
}
