const fs = require('fs');

let txt = fs.readFileSync('src/data/productDetails.ts', 'utf8');

txt = txt.replace('outdoorWindowPhoto?: string', 'outdoorWindowPhoto?: string\n  inlineVideoSrc?: string');
txt = txt.replace(
  "modalVideoSrc: '/assets/products/iglo-energy-classic-alu-cover.mp4',",
  "modalVideoSrc: '/assets/products/iglo-energy-classic-alu-cover.mp4',\n  inlineVideoSrc: '/assets/products/iglo-energy-classic-alu-cover.mp4',"
);

fs.writeFileSync('src/data/productDetails.ts', txt);

let tsx = fs.readFileSync('src/pages/ProductDetailPage.tsx', 'utf8');
tsx = tsx.replace(
  'src="/assets/iglo-edge-okno-window-opening.mp4"',
  'src={detailData.inlineVideoSrc || "/assets/iglo-edge-okno-window-opening.mp4"}'
);
fs.writeFileSync('src/pages/ProductDetailPage.tsx', tsx);
console.log('Updated details and component');
