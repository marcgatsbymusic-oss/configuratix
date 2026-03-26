import fs from 'fs';
const filepath = 'c:\\Users\\Shadow\\.gemini\\antigravity\\scratch\\fantastic-octo-giggle\\src\\components\\SlateConfigurator\\BlueprintPreview.tsx';
let content = fs.readFileSync(filepath, 'utf8');

content = content.replace(/bg-white\/80/g, 'bg-[#1a1a1b]/80');
content = content.replace(/border-slate-200\/50/g, 'border-[#2a2a2b]');
content = content.replace(/bg-indigo-600/g, 'bg-[#dca95c] !text-black');
content = content.replace(/text-slate-500/g, 'text-white/60');
content = content.replace(/text-slate-400/g, 'text-white/50');
content = content.replace(/hover:bg-slate-100/g, 'hover:bg-[#2a2a2b]');

// SVG strokes & fills
content = content.replace(/stroke="#e2e8f0"/g, 'stroke="#2a2a2b"');
content = content.replace(/fill="#94a3b8"/g, 'fill="#ffffff" opacity="0.6"');
content = content.replace(/fill="#ffffff"/g, 'fill="#1a1a1b"'); // window frames
content = content.replace(/stroke="#64748b"/g, 'stroke="#3a3a3b"');
content = content.replace(/fill="#e2e8f0"/g, 'fill="#111112"'); // glass
content = content.replace(/stroke="#94a3b8"/g, 'stroke="#2a2a2b"');
content = content.replace(/fill="#0f172a"/g, 'fill="#0e0e0f"');
content = content.replace(/fill="#cffafe"/g, 'fill="#1a1a1b"'); // glass
content = content.replace(/fill="#f8fafc"/g, 'fill="#3a3a3b"'); // hardware base
content = content.replace(/stroke="#475569"/g, 'stroke="#4a4a4b"'); // hardware edge
content = content.replace(/stroke="#ef4444"/g, 'stroke="#dca95c" opacity="0.6"');

// Fix !text-black text-white
content = content.replace(/ !text-black text-white/g, ' !text-black');

fs.writeFileSync(filepath, content);
console.log('Blueprint theme patched successfully!');
