const fs = require('fs');

let pd = fs.readFileSync('src/data/productDetails.ts', 'utf8');

// IGLO EDGE is 'p1' and slug 'iglo-edge'
// We replace its hero video
pd = pd.replace(
  "  videoSrc: '/assets/heroes/okna-iglo-energy-cover.mp4',\n  modalVideoSrc: '/assets/products/iglo-edge-en.mp4',",
  "  videoSrc: '/assets/heroes/iglo-edge-header-cover.mp4',\n  modalVideoSrc: '/assets/products/iglo-edge-en.mp4',"
);
pd = pd.replace(
  "  videoSrc: '/assets/heroes/okna-iglo-energy-cover.mp4',\r\n  modalVideoSrc: '/assets/products/iglo-edge-en.mp4',",
  "  videoSrc: '/assets/heroes/iglo-edge-header-cover.mp4',\r\n  modalVideoSrc: '/assets/products/iglo-edge-en.mp4',"
);

fs.writeFileSync('src/data/productDetails.ts', pd);
console.log('Updated videoSrc for IGLO_EDGE_DETAIL');
