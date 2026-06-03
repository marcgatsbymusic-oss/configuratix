import fs from 'fs';
import DxfParser from 'dxf-parser';

const dxfPath = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG to DXF conversion tests\\Iglo Edge Slide\\Profile 1 Edge Slide top and bottom movable door for Three JS.dxf";
try {
    const fileText = fs.readFileSync(dxfPath, 'utf-8');
    const parser = new DxfParser();
    const dxf = parser.parseSync(fileText);

    dxf.entities.forEach((ent, i) => {
        if (ent.type === 'INSERT') {
            findInserts(ent, `entity_${i}`);
        }
    });

    function findInserts(ent, path) {
        if (ent.name === 'U000BEC030_B') {
            console.log(`Found U000BEC030_B insert at path ${path}:`, JSON.stringify(ent, null, 2));
        }
        const block = dxf.blocks[ent.name];
        if (block && block.entities) {
            block.entities.forEach((child, j) => {
                if (child.type === 'INSERT') {
                    findInserts(child, `${path} -> ${ent.name}[${j}]`);
                }
            });
        }
    }
} catch (err) {
    console.error(err);
}
