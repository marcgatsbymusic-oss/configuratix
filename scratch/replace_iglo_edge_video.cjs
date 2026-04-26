const fs = require('fs');
let txt = fs.readFileSync('src/data/productDetails.ts', 'utf8');

const targetStr = "videoSrc: '/assets/iglo-edge-animation.mp4',";
const newStr = "videoSrc: '/assets/heroes/okna-iglo-energy-cover.mp4',";

if (txt.includes(targetStr)) {
  txt = txt.replace(targetStr, newStr);
  fs.writeFileSync('src/data/productDetails.ts', txt);
  console.log('Successfully updated videoSrc for Iglo Edge');
} else {
  console.log('Could not find target string');
}
