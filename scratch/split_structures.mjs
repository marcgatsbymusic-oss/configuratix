import fs from 'fs';

let tsFile = fs.readFileSync('src/data/productDetails.ts', 'utf8');

// Find the IGLO5_DOORS_DETAIL block
const startIndex = tsFile.indexOf('export const IGLO5_DOORS_DETAIL: ProductDetailData = {');
const endIndex = tsFile.indexOf('export const IGLO_ENERGY_DOORS_PVC_DETAIL: ProductDetailData = {', startIndex);

if (startIndex > -1 && endIndex > -1) {
    let block = tsFile.slice(startIndex, endIndex);
    
    // We want to extract the Example entries from infills array and create a doorStructures array
    const infillsRegex = /infills:\s*\[([\s\S]*?)\]\s*,/g;
    const match = infillsRegex.exec(block);
    if (match) {
        const infillsContent = match[1];
        const lines = infillsContent.split('\n');
        
        let newInfills = [];
        let newStructures = [];
        
        for (const line of lines) {
            if (line.trim() === '') continue;
            if (line.includes("'Example ")) {
                // it's an example, let's parse out name and image
                const nameMatch = line.match(/name:\s*'([^']+)'/);
                const imageMatch = line.match(/image:\s*'([^']+)'/);
                if (nameMatch && imageMatch) {
                    newStructures.push(`    { name: '${nameMatch[1]}', image: '${imageMatch[1]}' },`);
                }
            } else {
                newInfills.push(line);
            }
        }
        
        const newInfillsStr = `infills: [\n${newInfills.join('\n')}\n  ],`;
        const newStructuresStr = `doorStructures: [\n${newStructures.join('\n')}\n  ],`;
        
        // Replace the infills block with both
        block = block.replace(match[0], newInfillsStr + '\n  ' + newStructuresStr);
        
        tsFile = tsFile.slice(0, startIndex) + block + tsFile.slice(endIndex);
        fs.writeFileSync('src/data/productDetails.ts', tsFile);
        console.log("Successfully extracted doorStructures!");
    } else {
        console.log("Could not find infills array in IGLO5_DOORS_DETAIL.");
    }
} else {
    console.log("Could not find IGLO5_DOORS_DETAIL block.");
}
