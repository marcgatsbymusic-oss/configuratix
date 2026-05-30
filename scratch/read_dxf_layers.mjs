import fs from 'fs';
import DxfParser from 'dxf-parser';

const dxfPath = 'C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG to DXF conversion tests\\testing new layers.dxf';
try {
    const fileText = fs.readFileSync(dxfPath, 'utf-8');
    const parser = new DxfParser();
    const dxf = parser.parseSync(fileText);
    const layers = {};
    dxf.entities.forEach(ent => {
        if (!layers[ent.layer]) {
            layers[ent.layer] = { count: 0, types: new Set() };
        }
        layers[ent.layer].count++;
        layers[ent.layer].types.add(ent.type);
    });
    
    console.log(JSON.stringify(
        Object.fromEntries(
            Object.entries(layers).map(([k, v]) => [k, { count: v.count, types: Array.from(v.types) }])
        ), null, 2
    ));
} catch (err) {
    console.error(err);
}
