import fs from 'fs';
import DxfParser from 'dxf-parser';

const dxfPath = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\Monday 8th experiment\\Roller_Blind_225.dxf";
try {
  const fileText = fs.readFileSync(dxfPath, 'utf-8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(fileText);

  console.log(`Top-level entities total: ${dxf.entities.length}`);
  const entityTypes = {};
  dxf.entities.forEach(ent => {
    entityTypes[ent.type] = (entityTypes[ent.type] || 0) + 1;
  });
  console.log('Entity types:', entityTypes);

  // Let's filter INSERT entities
  const inserts = dxf.entities.filter(e => e.type === 'INSERT');
  console.log(`INSERT count: ${inserts.length}`);
  inserts.forEach((ins, idx) => {
    if (idx < 20 || ins.name.includes('listwa') || ins.name.includes('póro')) {
      console.log(`Insert ${idx}: Name="${ins.name}", Layer="${ins.layer}", Position=(${ins.position.x}, ${ins.position.y}, ${ins.position.z}), Scale=(${ins.scale?.x}, ${ins.scale?.y}, ${ins.scale?.z})`);
    }
  });

  // Let's see if there are other entities (like LINE, ARC, LWPOLYLINE) at top level
  const others = dxf.entities.filter(e => e.type !== 'INSERT');
  console.log(`Non-insert entities count: ${others.length}`);
  const otherLayers = {};
  others.forEach(ent => {
    otherLayers[ent.layer] = (otherLayers[ent.layer] || 0) + 1;
  });
  console.log('Non-insert layers:', otherLayers);

} catch (err) {
  console.error(err);
}
