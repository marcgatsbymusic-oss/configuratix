import fs from 'fs';

// 1. Inject products
const productsStr = fs.readFileSync('scripts/out_products.ts', 'utf8');
let productsTs = fs.readFileSync('src/data/products.ts', 'utf8');
// Find the end of PRODUCTS array. It ends with:
//   }
// ];
productsTs = productsTs.replace(/\s*}\s*\];\s*$/, `\n${productsStr}\n];`);
fs.writeFileSync('src/data/products.ts', productsTs);

// 2. Inject product details
const detailsStr = fs.readFileSync('scripts/out_details.ts', 'utf8');
fs.appendFileSync('src/data/productDetails.ts', `\n${detailsStr}\n`);

console.log("Injected successfully!");
