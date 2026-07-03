import fs from 'fs';

const content = fs.readFileSync('public/IGE_MOVABLE_POST_LEFT_OPENING_FULL_COLORED.svg', 'utf-8');
const paths = content.match(/<path[^>]*>/g) || [];
console.log("=== Existing Glass Paths in Colored SVG ===");
paths.forEach((p, idx) => {
  const fill = p.match(/fill="([^"]*)"/)?.[1] || 'none';
  if (fill === '#a0c8f0') {
    console.log(`Path ${idx}: ${p}`);
  }
});
