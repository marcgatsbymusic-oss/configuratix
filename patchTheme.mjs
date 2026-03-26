import fs from 'fs';
const filepath = 'c:\\Users\\Shadow\\.gemini\\antigravity\\scratch\\fantastic-octo-giggle\\src\\components\\SlateConfigurator\\MainConfigurator.tsx';
let content = fs.readFileSync(filepath, 'utf8');

// Container backgrounds
content = content.replace(/bg-slate-50/g, 'bg-[#111112]');
content = content.replace(/bg-white/g, 'bg-[#1a1a1b]');
content = content.replace(/bg-slate-100/g, 'bg-[#111112]'); // Changed from 2a2a2b to avoid gray boxes
content = content.replace(/bg-slate-200/g, 'bg-[#2a2a2b]');

// Text colors
content = content.replace(/text-slate-900/g, 'text-white');
content = content.replace(/text-slate-800/g, 'text-white/90');
content = content.replace(/text-slate-700/g, 'text-white/80');
content = content.replace(/text-slate-600/g, 'text-white/70');
content = content.replace(/text-slate-500/g, 'text-white/50');
content = content.replace(/text-slate-400/g, 'text-white/40');
content = content.replace(/text-slate-300/g, 'text-white/30');

// Borders
content = content.replace(/border-slate-100/g, 'border-[#2a2a2b]');
content = content.replace(/border-slate-200\/60/g, 'border-[#2a2a2b]');
content = content.replace(/border-slate-200/g, 'border-[#2a2a2b]');
content = content.replace(/border-slate-300/g, 'border-[#3a3a3b]');
content = content.replace(/hover:border-slate-300/g, 'hover:border-[#dca95c]/50');

// Indigos to Gold (#dca95c)
content = content.replace(/text-indigo-700/g, 'text-[#dca95c]');
content = content.replace(/text-indigo-600/g, 'text-[#dca95c]');
content = content.replace(/text-indigo-500/g, 'text-[#dca95c]');
content = content.replace(/bg-indigo-600/g, 'bg-[#dca95c] !text-black');
content = content.replace(/hover:bg-indigo-700/g, 'hover:bg-[#eab676]');
content = content.replace(/bg-indigo-50\/50/g, 'bg-[#dca95c]/10');
content = content.replace(/bg-indigo-50/g, 'bg-[#dca95c]/10');
content = content.replace(/bg-indigo-100/g, 'bg-[#dca95c]/20');
content = content.replace(/border-indigo-600/g, 'border-[#dca95c]');
content = content.replace(/border-indigo-500/g, 'border-[#dca95c]');
content = content.replace(/ring-indigo-600/g, 'ring-[#dca95c]');
content = content.replace(/ring-indigo-500/g, 'ring-[#dca95c]');
content = content.replace(/shadow-indigo-600/g, 'shadow-[#dca95c]');
content = content.replace(/text-indigo-400/g, 'text-[#dca95c]/70');
content = content.replace(/border-indigo-100\/50/g, 'border-[#dca95c]/20');
content = content.replace(/border-indigo-100\/30/g, 'border-[#dca95c]/20');

// Fix conflicting classes like "!text-black text-white"
content = content.replace(/ !text-black text-white/g, ' !text-black');

fs.writeFileSync(filepath, content);
console.log('Theme patched successfully!');
