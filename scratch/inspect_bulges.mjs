import fs from 'fs';
import DxfParser from 'dxf-parser';

const dxfPath = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG to DXF conversion tests\\Iglo Edge Slide\\Profile 1 Edge Slide top and bottom movable door for Three JS.dxf";
try {
    const fileText = fs.readFileSync(dxfPath, 'utf-8');
    const parser = new DxfParser();
    const dxf = parser.parseSync(fileText);

    function findBulges(entities, name) {
        entities.forEach(ent => {
            if (ent.type === 'INSERT') {
                const b = dxf.blocks[ent.name];
                if (b && b.entities) findBulges(b.entities, ent.name);
            } else if (ent.type === 'LWPOLYLINE' || ent.type === 'POLYLINE') {
                const hasBulge = ent.vertices?.some(v => v.bulge && v.bulge !== 0);
                if (hasBulge) {
                    console.log(`LWPOLYLINE in ${name} has bulges on layer ${ent.layer}`);
                    ent.vertices.forEach((v, idx) => {
                        if (v.bulge) console.log(`  v[${idx}]: bulge=${v.bulge}`);
                    });
                }
            }
        });
    }

    findBulges(dxf.entities, 'main');
} catch (err) {
    console.error(err);
}
