const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../src/pages/ProductDetailPage.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

// The hero section is untouched because it explicitly uses mammut-black and custom styles.
// We only want to replace the classes we added for the light theme in the last step.

// Use regex with word boundaries to ensure we only replace exact tailwind classes
const replacements = {
  // Backgrounds
  'bg-white': 'bg-[#ffffff]',
  'bg-white/50': 'bg-[#ffffff]/50',
  'bg-white/80': 'bg-[#ffffff]/80',
  'bg-white/95': 'bg-[#ffffff]/95',
  'bg-gray-50': 'bg-[#f9fafb]',
  
  // Texts
  'text-black': 'text-[#000000]',
  'text-black/40': 'text-[#000000]/40',
  'text-gray-400': 'text-[#9ca3af]',
  'text-gray-500': 'text-[#6b7280]',
  'text-gray-600': 'text-[#4b5563]',
  'text-gray-800': 'text-[#1f2937]',

  // Borders
  'border-gray-100': 'border-[#f3f4f6]',
  'border-gray-200': 'border-[#e5e7eb]',
  'border-gray-300': 'border-[#d1d5db]',
};

// We must apply replacements. We will use a regex that matches the class name
// bounded by either space, quote, or backtick to avoid partial matches
for (const [cls, hexCls] of Object.entries(replacements)) {
  // e.g. /([ "'`])bg-white([ "'`])/g
  // Wait, the class might have modifiers like hover:bg-white. We only replace the exact utility.
  // Actually, replacing exactly bg-white with bg-[#ffffff] using word boundaries is tricky because hyphen is a boundary.
  // A better regex: lookbehind for space, quote, or colon (for hover:), and lookahead for space, quote, or slash (wait, slash is handled in the keys like bg-white/50).
  // Let's just use string replacement on className="..." strings? No, a simple global replace with padding works well enough.
  
  const regex = new RegExp(`(?<=[ "'\`:])${cls.replace(/\//g, '\\/')}(?=[ "'\`])`, 'g');
  content = content.replace(regex, hexCls);
}

fs.writeFileSync(targetFile, content);
console.log('Fixed inverted theme issues in ProductDetailPage.tsx');
