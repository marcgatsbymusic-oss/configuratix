import fs from 'fs';
import DxfParser from 'dxf-parser';

const dxfPath = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG to DXF conversion tests\\Iglo Edge Slide\\Profile 1 Edge Slide top and bottom movable door for Three JS.dxf";
try {
    const fileText = fs.readFileSync(dxfPath, 'utf-8');
    const parser = new DxfParser();
    const dxf = parser.parseSync(fileText);

    const block = dxf.blocks['ramka 18mm + butyl'];
    console.log(JSON.stringify(block, (key, value) => {
        if (key === 'entities') return `[${value.length} entities]`;
        return value;
    }, 2));
} catch (err) {
    console.error(err);
}
