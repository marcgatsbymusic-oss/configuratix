import fs from 'fs';

const content = fs.readFileSync('public/IGE_MOVABLE_POST_LEFT_OPENING_FULL_COLORED.svg', 'utf-8');
const paths = content.match(/<path[^>]*>/g) || [];
console.log(`Total paths found: ${paths.length}`);
paths.forEach((p, idx) => {
  const fill = p.match(/fill="([^"]*)"/)?.[1] || 'none';
  const stroke = p.match(/stroke="([^"]*)"/)?.[1] || 'none';
  const id = p.match(/id="([^"]*)"/)?.[1] || 'no-id';
  const dMatch = p.match(/d="([^"]*)"/)?.[1] || '';
  console.log(`Path ${idx}: id=${id}, fill=${fill}, stroke=${stroke}, points=${dMatch.split('L').length}`);
});
