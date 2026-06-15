import fs from 'fs';
import DxfParser from 'dxf-parser';

const dxfPath = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\Monday 8th experiment\\Roller_Blind_225.dxf";

try {
  const fileText = fs.readFileSync(dxfPath, 'utf-8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(fileText);

  const layerName = 'Sichtbare Kanten(DIN)';
  const layerEnts = dxf.entities.filter(e => e.layer === layerName);
  console.log(`Total entities on layer "${layerName}": ${layerEnts.length}`);

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  layerEnts.forEach(ent => {
    if (ent.type === 'LINE') {
      const v0 = ent.vertices[0];
      const v1 = ent.vertices[1];
      minX = Math.min(minX, v0.x, v1.x);
      maxX = Math.max(maxX, v0.x, v1.x);
      minY = Math.min(minY, v0.y, v1.y);
      maxY = Math.max(maxY, v0.y, v1.y);
    } else if (ent.type === 'ARC') {
      const cx = ent.center.x;
      const cy = ent.center.y;
      const r = ent.radius;
      minX = Math.min(minX, cx - r);
      maxX = Math.max(maxX, cx + r);
      minY = Math.min(minY, cy - r);
      maxY = Math.max(maxY, cy + r);
    }
  });

  console.log(`Bounds of "${layerName}": X=[${minX.toFixed(2)}, ${maxX.toFixed(2)}], Y=[${minY.toFixed(2)}, ${maxY.toFixed(2)}]`);

  // Let's print some of these entities to see what they look like
  console.log("\nSample entities:");
  layerEnts.slice(0, 15).forEach((ent, idx) => {
    if (ent.type === 'LINE') {
      console.log(`  Line ${idx}: (${ent.vertices[0].x.toFixed(2)}, ${ent.vertices[0].y.toFixed(2)}) -> (${ent.vertices[1].x.toFixed(2)}, ${ent.vertices[1].y.toFixed(2)})`);
    } else if (ent.type === 'ARC') {
      console.log(`  Arc ${idx}: Center=(${ent.center.x.toFixed(2)}, ${ent.center.y.toFixed(2)}), Radius=${ent.radius.toFixed(2)}`);
    }
  });

} catch (err) {
  console.error(err);
}
