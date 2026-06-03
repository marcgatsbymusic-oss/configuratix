import fs from 'fs';
import DxfParser from 'dxf-parser';

const dxfPath = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG to DXF conversion tests\\Iglo Edge Slide\\Profile 1 Edge Slide top and bottom movable door for Three JS.dxf";
try {
    const fileText = fs.readFileSync(dxfPath, 'utf-8');
    const parser = new DxfParser();
    const dxf = parser.parseSync(fileText);

    console.log("Block base points:");
    Object.keys(dxf.blocks).forEach(name => {
        const b = dxf.blocks[name];
        console.log(`- Block: ${name}, BasePoint: (${b.x}, ${b.y}, ${b.z})`);
    });
} catch (err) {
    console.error(err);
}
