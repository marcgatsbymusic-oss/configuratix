import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { finished } from 'stream/promises';

const colors = JSON.parse(fs.readFileSync('scripts/slide_colors.json', 'utf8'));
const destDir = 'public/assets/windowcolors/iglo-edge-slide';

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

async function downloadFile(url, dest) {
  if (fs.existsSync(dest)) return dest;
  console.log(`Downloading ${url}...`);
  const res = await fetch(url);
  if (!res.ok) {
     console.error(`Failed to fetch ${url}`);
     return null;
  }
  const fileStream = fs.createWriteStream(dest);
  await finished(Readable.fromWeb(res.body).pipe(fileStream));
  return dest;
}

// Read the existing colors to try to map them
const productDetails = fs.readFileSync('src/data/productDetails.ts', 'utf8');
// We can use a regex to extract the IGLO_EDGE_COLORS array string
const match = productDetails.match(/export const IGLO_EDGE_COLORS: SwatchColor\[\] = \[([\s\S]*?)\];/);

let existingColorsText = match ? match[1] : '';

async function run() {
  const localMap = {};
  for (const c of colors) {
    const filename = path.basename(c.frameUrl);
    const dest = path.join(destDir, filename);
    await downloadFile(c.frameUrl, dest);
    localMap[c.name.toLowerCase().replace(/[^a-z0-9]/g, '')] = `/assets/windowcolors/iglo-edge-slide/${filename}`;
  }
  
  console.log("Downloaded all frames!");

  // Simple script generation for the new array
  // We'll just read the existing IGLO_EDGE_COLORS array and replace the windowImage paths.
  let newColorsArray = [];
  
  // We'll use regex to parse the object literals from the string
  const objRegex = /\{([^}]+)\}/g;
  let objMatch;
  while ((objMatch = objRegex.exec(existingColorsText)) !== null) {
      let props = objMatch[1];
      let nameMatch = props.match(/name:\s*'([^']+)'/);
      let windowImageMatch = props.match(/windowImage:\s*'([^']+)'/);
      
      if (nameMatch) {
          let name = nameMatch[1];
          let cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
          let newImg = localMap[cleanName];
          
          if (!newImg) {
              // Try fuzzy match
              for (const key in localMap) {
                 if (key.includes(cleanName) || cleanName.includes(key)) {
                     newImg = localMap[key];
                     break;
                 }
              }
          }
          
          if (newImg) {
              props = props.replace(windowImageMatch[0], `windowImage: '${newImg}'`);
          }
      }
      
      newColorsArray.push(`  {${props}}`);
  }
  
  const tsCode = `\nexport const IGLO_EDGE_SLIDE_COLORS: SwatchColor[] = [\n${newColorsArray.join(',\n')}\n];\n`;
  fs.writeFileSync('scripts/slide_colors_code.ts', tsCode);
  console.log("Generated IGLO_EDGE_SLIDE_COLORS array to scripts/slide_colors_code.ts");
}

run();
