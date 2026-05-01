import fs from 'fs';

const structures = JSON.parse(fs.readFileSync('scratch/door_structures.json', 'utf8'));

let str = `  doorStructures: [\n`;
for (const s of structures) {
   str += `    { name: '${s.name}', image: '${s.image}' },\n`;
}
str += `  ],`;

let tsFile = fs.readFileSync('src/data/productDetails.ts', 'utf8');

// The file currently has a doorStructures block right after infills inside IGLO5_DOORS_DETAIL
const targetStart = "doorStructures: [";
// We want to replace the old block (which had the wrong example_1.webp etc) with the new one
// The block ends at "  ],"
const startIndex = tsFile.indexOf('export const IGLO5_DOORS_DETAIL');
const blockIndex = tsFile.indexOf(targetStart, startIndex);

if (blockIndex > -1) {
    const endIndex = tsFile.indexOf('],', blockIndex) + 2;
    const oldBlock = tsFile.substring(blockIndex, endIndex);
    
    tsFile = tsFile.substring(0, blockIndex) + str.trim() + tsFile.substring(endIndex);
    fs.writeFileSync('src/data/productDetails.ts', tsFile);
    console.log("Updated doorStructures successfully.");
} else {
    console.log("Could not find doorStructures block");
}
