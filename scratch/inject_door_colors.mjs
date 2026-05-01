import fs from 'fs';

const tsFile = fs.readFileSync('src/data/productDetails.ts', 'utf8');
const newColors = fs.readFileSync('scratch/iglo_door_colors.ts', 'utf8');

// Insert right before export const IGLO5_DOORS_DETAIL
const insertionPoint = tsFile.indexOf('export const IGLO5_DOORS_DETAIL');
const updatedTsFile = tsFile.slice(0, insertionPoint) + newColors + '\n' + tsFile.slice(insertionPoint);

const finalTsFile = updatedTsFile.replace(/colors: IGLO_EDGE_COLORS,/g, 'colors: IGLO_DOOR_COLORS,');

fs.writeFileSync('src/data/productDetails.ts', finalTsFile);
console.log("Injected IGLO_DOOR_COLORS into productDetails.ts!");
