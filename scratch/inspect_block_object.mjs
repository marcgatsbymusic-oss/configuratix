import fs from 'fs';
import DxfParser from 'dxf-parser';

const dxfPath = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO_EDGE_SLIDE\\IGLS_OPENING_DOOR_SECTION_AND_FRAME.dxf";
try {
    const fileText = fs.readFileSync(dxfPath, 'utf-8');
    const parser = new DxfParser();
    const dxf = parser.parseSync(fileText);

    const block = dxf.blocks['U000BEC030_B'];
    console.log(JSON.stringify(block, (key, value) => {
        if (key === 'entities') return `[${value.length} entities]`;
        return value;
    }, 2));
} catch (err) {
    console.error(err);
}
