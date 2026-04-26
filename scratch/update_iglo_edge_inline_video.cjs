const fs = require('fs');

let pd = fs.readFileSync('src/data/productDetails.ts', 'utf8');

// IGLO EDGE is 'p1' and slug 'iglo-edge'
// We append inlineVideoSrc below modalVideoSrc
pd = pd.replace(
  "  modalVideoSrc: '/assets/products/iglo-edge-en.mp4',\n  relatedProductLink",
  "  modalVideoSrc: '/assets/products/iglo-edge-en.mp4',\n  inlineVideoSrc: '/assets/products/iglo-edge-okno-window-opening.mp4',\n  relatedProductLink"
);
pd = pd.replace(
  "  modalVideoSrc: '/assets/products/iglo-edge-en.mp4',\r\n  relatedProductLink",
  "  modalVideoSrc: '/assets/products/iglo-edge-en.mp4',\r\n  inlineVideoSrc: '/assets/products/iglo-edge-okno-window-opening.mp4',\r\n  relatedProductLink"
);

fs.writeFileSync('src/data/productDetails.ts', pd);
console.log('Updated inlineVideoSrc for IGLO_EDGE_DETAIL');
