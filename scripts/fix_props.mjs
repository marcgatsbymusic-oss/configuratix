import fs from 'fs';

let content = fs.readFileSync('src/data/productDetails.ts', 'utf8');

content = content.replace(/accessories:\s*\[\]\r?\n\};/g, 'accessories: [],\n  colors: IGLO_EDGE_COLORS,\n  glassOptions: []\n};');

fs.writeFileSync('src/data/productDetails.ts', content);
console.log("Fixed missing properties!");
