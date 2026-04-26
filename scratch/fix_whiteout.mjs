import fs from 'fs';

// 1. Fix index.css
let css = fs.readFileSync('src/index.css', 'utf8');
css = css.replace('.product-overview-description {\r\n  color: #ffffff !important;\r\n  opacity: 1 !important;\r\n}', '');
css = css.replace('.product-overview-description {\n  color: #ffffff !important;\n  opacity: 1 !important;\n}', '');
// Or just remove `.product-overview-description,` from the selector block:
css = css.replace(',\r\n.product-overview-description', '');
css = css.replace(',\n.product-overview-description', '');
fs.writeFileSync('src/index.css', css);

// 2. Fix ProductDetailPage.tsx
let tsx = fs.readFileSync('src/pages/ProductDetailPage.tsx', 'utf8');
tsx = tsx.replace(/bg-gray-50\/90/g, 'bg-white/90');
tsx = tsx.replace(/bg-gray-50/g, 'bg-white');
tsx = tsx.replace(/bg-gray-100/g, 'bg-white');
tsx = tsx.replace(/rgba\(255,255,255,0\.6\)/g, 'rgba(0,0,0,0.6)');
tsx = tsx.replace(/text-gray-500/g, 'text-gray-600'); // increase contrast for small texts
tsx = tsx.replace(/text-gray-400/g, 'text-gray-600');
tsx = tsx.replace(/!text-gray-500/g, '!text-gray-600');
fs.writeFileSync('src/pages/ProductDetailPage.tsx', tsx);

// 3. Fix ColorSwatch.tsx
let swatch = fs.readFileSync('src/components/products/ColorSwatch.tsx', 'utf8');
swatch = swatch.replace(/bg-mammut-dark/g, 'bg-white');
swatch = swatch.replace(/text-mammut-white/g, 'text-black');
swatch = swatch.replace(/border-mammut-border/g, 'border-gray-200');
swatch = swatch.replace(/border-white\/10/g, 'border-black/10');
swatch = swatch.replace(/outline-white\/30/g, 'outline-black/20');
fs.writeFileSync('src/components/products/ColorSwatch.tsx', swatch);

console.log('Fixed whiteout issues.');
