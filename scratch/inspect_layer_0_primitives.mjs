import fs from 'fs';
import DxfParser from 'dxf-parser';

const dxfPath = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\Monday 8th experiment\\Roller_Blind_225.dxf";

try {
  const fileText = fs.readFileSync(dxfPath, 'utf-8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(fileText);

  const layerName = '0';
  const layerEnts = dxf.entities.filter(e => e.layer === layerName && e.type !== 'INSERT');
  console.log(`Total non-insert entities on layer "${layerName}": ${layerEnts.length}`);

  layerEnts.forEach((ent, idx) => {
    console.log(`Entity ${idx}: Type=${ent.type}`);
    if (ent.type === 'LINE') {
      console.log(`  Line: (${ent.vertices[0].x.toFixed(2)}, ${ent.vertices[0].y.toFixed(2)}) -> (${ent.vertices[1].x.toFixed(2)}, ${ent.vertices[1].y.toFixed(2)})`);
    } else if (ent.type === 'ARC') {
      console.log(`  Arc: Center=(${ent.center.x.toFixed(2)}, ${ent.center.y.toFixed(2)}), Radius=${ent.radius.toFixed(2)}`);
    } else if (ent.type === 'LWPOLYLINE' || ent.type === 'POLYLINE') {
      console.log(`  Polyline: closed=${ent.shape || (ent.flag & 1) !== 0}, vertices=${ent.vertices?.length}`);
      ent.vertices?.forEach((v, vIdx) => {
        console.log(`    v[${vIdx}]: x=${v.x.toFixed(2)}, y=${v.y.toFixed(2)}`);
      });
    } else if (ent.type === 'CIRCLE') {
      console.log(`  Circle: Center=(${ent.center.x.toFixed(2)}, ${ent.center.y.toFixed(2)}), Radius=${ent.radius.toFixed(2)}`);
    }
  });

} catch (err) {
  console.error(err);
}
