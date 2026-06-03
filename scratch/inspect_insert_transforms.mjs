import fs from 'fs';
import DxfParser from 'dxf-parser';

const dxfPath = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG to DXF conversion tests\\Iglo Edge Slide\\Profile 1 Edge Slide top and bottom movable door for Three JS.dxf";
try {
    const fileText = fs.readFileSync(dxfPath, 'utf-8');
    const parser = new DxfParser();
    const dxf = parser.parseSync(fileText);

    function checkBlock(blockName) {
        const block = dxf.blocks[blockName];
        if (!block || !block.entities) return;
        block.entities.forEach(ent => {
            if (ent.type === 'INSERT') {
                console.log(`INSERT: layer=${ent.layer}, block=${ent.name}, pos=(${ent.position?.x}, ${ent.position?.y}), scale=(${ent.scaleFactorX}, ${ent.scaleFactorY}), rot=${ent.rotation}`);
                checkBlock(ent.name);
            }
        });
    }

    console.log("Top-level INSERTs:");
    dxf.entities.forEach(ent => {
        if (ent.type === 'INSERT') {
            console.log(`INSERT: layer=${ent.layer}, block=${ent.name}, pos=(${ent.position?.x}, ${ent.position?.y}), scale=(${ent.scaleFactorX}, ${ent.scaleFactorY}), rot=${ent.rotation}`);
            checkBlock(ent.name);
        }
    });
} catch (err) {
    console.error(err);
}
