import fs from 'fs';

let content = fs.readFileSync('src/pages/ProductDetailPage.tsx', 'utf8');
let lines = content.split('\n');

function lightMode(str) {
  return str
    .replace(/bg-mammut-darker/g, 'bg-white')
    .replace(/bg-mammut-dark/g, 'bg-gray-50')
    .replace(/border-mammut-border/g, 'border-gray-200')
    .replace(/text-mammut-white\/70/g, 'text-gray-600')
    .replace(/text-mammut-white\/60/g, 'text-gray-500')
    .replace(/text-mammut-white\/50/g, 'text-gray-500')
    .replace(/text-mammut-white\/40/g, 'text-gray-400')
    .replace(/text-mammut-white\/30/g, 'text-gray-400')
    .replace(/text-mammut-white\/20/g, 'text-gray-300')
    .replace(/!text-mammut-white/g, '!text-black')
    .replace(/text-mammut-white/g, 'text-black')
    .replace(/bg-mammut-black\/95/g, 'bg-white/95')
    .replace(/bg-mammut-black\/90/g, 'bg-white/90')
    .replace(/bg-mammut-black\/80/g, 'bg-gray-50/90')
    .replace(/bg-mammut-black\/50/g, 'bg-white/80')
    .replace(/bg-\\[#0e0e0f\\]/g, 'bg-gray-100')
    .replace(/bg-mammut-black/g, 'bg-white')
    .replace(/linear-gradient\(180deg,\s*#[0-9a-f]+\s+0%,\s*#[0-9a-f]+\s+100%\)/gi, 'white')
    .replace(/border-white\/10/g, 'border-black/10')
    .replace(/rgba\(255,255,255,0\.2\)/g, 'rgba(0,0,0,0.2)')
    .replace(/style={{ background: '#111112' }}/g, "style={{ background: '#e5e7eb' }}")
    .replace(/#1a1a1b/g, '#f9fafb')
    .replace(/textShadow:[^}]+/g, '');
}

for (let i = 0; i < lines.length; i++) {
  // Skip the hero sections for both detailed and standard layouts
  if (i >= 414 && i <= 455) continue; 
  if (i >= 392 && i <= 405) continue;
  if (i >= 381 && i <= 390) continue;
  
  lines[i] = lightMode(lines[i]);
}

fs.writeFileSync('src/pages/ProductDetailPage.tsx', lines.join('\n'));
console.log('ProductDetailPage.tsx updated successfully.');
