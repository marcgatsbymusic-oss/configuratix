import fs from 'fs';
import DxfParser from 'dxf-parser';

const dxfPath = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG to DXF conversion tests\\Iglo Edge Slide\\Profile 1 Edge Slide top and bottom movable door for Three JS.dxf";
try {
    const fileText = fs.readFileSync(dxfPath, 'utf-8');
    const parser = new DxfParser();
    const dxf = parser.parseSync(fileText);

    function dumpBlock(blockName, depth = 0) {
        const indent = "  ".repeat(depth);
        const block = dxf.blocks[blockName];
        if (!block) {
            console.log(`${indent}- Block ${blockName} not found`);
            return;
        }
        console.log(`${indent}Block: ${blockName} (${block.entities?.length || 0} entities)`);
        if (block.entities) {
            block.entities.forEach(ent => {
                if (ent.type === 'INSERT') {
                    console.log(`${indent}  - INSERT: Layer ${ent.layer}, References block: ${ent.name}`);
                    dumpBlock(ent.name, depth + 2);
                } else {
                    console.log(`${indent}  - ${ent.type}: Layer ${ent.layer}, vertices: ${ent.vertices?.length || ent.x1 ? 'yes' : 'no'}`);
                }
            });
        }
    }

    console.log("--- RECURSIVE BLOCK DUMP FOR MAIN ENTITIES ---");
    dxf.entities.forEach(ent => {
        if (ent.type === 'INSERT') {
            console.log(`INSERT entity at top-level on layer ${ent.layer}`);
            dumpBlock(ent.name, 1);
        } else {
            console.log(`Top-level entity: ${ent.type} on layer ${ent.layer}`);
        }
    });
} catch (err) {
    console.error(err);
}
