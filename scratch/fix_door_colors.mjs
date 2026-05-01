import fs from 'fs';

let tsFile = fs.readFileSync('src/data/productDetails.ts', 'utf8');

// Find the IGLO_DOOR_COLORS array and add id and group properties
const doorColorsStart = tsFile.indexOf('export const IGLO_DOOR_COLORS: SwatchColor[] = [');
const doorColorsEnd = tsFile.indexOf('];', doorColorsStart);

let doorColorsBlock = tsFile.slice(doorColorsStart, doorColorsEnd + 2);

let idCounter = 1;
doorColorsBlock = doorColorsBlock.replace(/\{ name:/g, () => {
  return `{ id: 'd${idCounter++}', group: 'Wood Effect', name:`;
});

tsFile = tsFile.slice(0, doorColorsStart) + doorColorsBlock + tsFile.slice(doorColorsEnd + 2);

fs.writeFileSync('src/data/productDetails.ts', tsFile);
console.log("Fixed missing id and group in IGLO_DOOR_COLORS.");
