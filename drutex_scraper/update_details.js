const fs = require('fs');
const path = require('path');

const FILE_PATH = '/Users/marckeller/Desktop/antigravravity/src/data/productDetails.ts';
let content = fs.readFileSync(FILE_PATH, 'utf8');

const regex = /image:\s*['"]\/assets\/windowcolors\/imgi_\d+_(.+?)\.webp['"]/g;

content = content.replace(regex, (match, b64) => {
  const decodedPath = Buffer.from(b64, 'base64').toString('utf8');
  const filename = path.basename(decodedPath);
  return `image: '/assets/windowcolors/textures/${filename}'`;
});

fs.writeFileSync(FILE_PATH, content, 'utf8');
console.log("Updated productDetails.ts!");
