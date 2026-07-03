import fs from 'fs';
import DxfParser from 'dxf-parser';

const INPUT_FILE = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG_TO_DXF_PIPELINE\\IGLO EDGE SERIES\\IGE_Movable_post_section_cleaned.dxf";

const text = fs.readFileSync(INPUT_FILE, 'utf8');
const parser = new DxfParser();
const dxf = parser.parseSync(text);

console.log("=== DXF LAYERS ===");
console.log(Object.keys(dxf.tables.layer.layers));
