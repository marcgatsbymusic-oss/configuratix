import fs from 'fs';

let content = fs.readFileSync('src/pages/ProductDetailPage.tsx', 'utf8');

// Replace specific imports with a wildcard import
content = content.replace(
  /import\s+{\s*IGLO_EDGE_DETAIL.*?type\s+GlassOption\s*}\s*from\s*'..\/data\/productDetails'/,
  "import * as ProductDetails from '../data/productDetails';\nimport type { GlassOption } from '../data/productDetails';"
);

// We need to build a map. It's easier to just match slug to var name dynamically.
// varName = slug.replace(/-/g, '_').toUpperCase() + '_DETAIL'
const detailMapLogic = `
  const varName = slug ? slug.replace(/-/g, '_').toUpperCase() + '_DETAIL' : '';
  const detailData = slug && (ProductDetails as any)[varName] ? (ProductDetails as any)[varName] : null;
  const isDetailed = !!detailData;
`;

// Replace the old detailMap logic
content = content.replace(
  /const detailMap: Record<string,.*?> = {[\s\S]*?const basicData/m,
  detailMapLogic + "\n  const basicData"
);

fs.writeFileSync('src/pages/ProductDetailPage.tsx', content);
console.log("Updated ProductDetailPage.tsx mapping logic!");
