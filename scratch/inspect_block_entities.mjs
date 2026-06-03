import fs from 'fs';
import DxfParser from 'dxf-parser';

const dxfPath = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG to DXF conversion tests\\Iglo Edge Slide\\Profile 1 Edge Slide top and bottom movable door for Three JS.dxf";
try {
    const fileText = fs.readFileSync(dxfPath, 'utf-8');
    const parser = new DxfParser();
    const dxf = parser.parseSync(fileText);

    const block = dxf.blocks['ramka 18mm + butyl'];
    console.log("Entities inside block 'ramka 18mm + butyl':");
    block.entities.forEach((ent, i) => {
        console.log(`- Entity ${i}: type=${ent.type}, layer=${ent.layer}`);
        if (ent.vertices) {
            console.log(`  vertices:`, ent.vertices.map(v => `(${v.x}, ${v.y})`).join(', '));
        }
    });
} catch (err) {
    console.error(err);
}
