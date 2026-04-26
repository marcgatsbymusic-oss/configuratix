import fs from 'fs';

let css = fs.readFileSync('src/index.css', 'utf8');

// The bottom of the file is broken, it looks like:
// /* ─── Product Hero Typography ──────────────────────────────── */
// .product-hero-title,
// .product-hero-tagline,
// .product-hero-spec-value,
// .product-hero-spec-label,

// We'll chop it off and replace it
const marker = '/* ─── Product Hero Typography ──────────────────────────────── */';
const index = css.indexOf(marker);

if (index !== -1) {
  css = css.substring(0, index);
  css += marker + '\n';
  css += '.product-hero-title,\n';
  css += '.product-hero-tagline,\n';
  css += '.product-hero-spec-value,\n';
  css += '.product-hero-spec-label {\n';
  css += '  color: #ffffff !important;\n';
  css += '  opacity: 1 !important;\n';
  css += '}\n';
  
  fs.writeFileSync('src/index.css', css);
  console.log('Fixed index.css');
} else {
  console.log('Marker not found');
}
