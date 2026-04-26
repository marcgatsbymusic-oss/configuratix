const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../src/pages/ProductDetailPage.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

// Replace main wrapper
content = content.replace(
  /<main className="bg-mammut-darker min-h-screen pt-16">/,
  '<main className="bg-white min-h-screen pt-16">'
);

// Replace Section 2 wrapper
content = content.replace(
  /<section className="border-b border-mammut-border" style={{ background: 'linear-gradient\(180deg, #111112 0%, #161617 100%\)' }}>/,
  '<section className="border-b border-gray-200 bg-white">'
);

// Text colors in Section 2
content = content.replace(
  /<h2 className="text-4xl font-black text-mammut-white uppercase mb-6 leading-tight">/,
  '<h2 className="text-4xl font-black text-black uppercase mb-6 leading-tight">'
);
content = content.replace(
  /<p className="product-overview-description leading-relaxed mb-8">/,
  '<p className="product-overview-description text-gray-800 leading-relaxed mb-8">'
);
content = content.replace(
  /<span className="text-mammut-white\/70 text-sm leading-snug">\{t\(`igloEdge.equipment\.\$\{i\}`\)\}<\/span>/g,
  '<span className="text-gray-600 text-sm leading-snug">{t(`igloEdge.equipment.${i}`)}</span>'
);
content = content.replace(
  /className="flex items-center gap-3 text-sm text-mammut-white\/70 hover:text-mammut-gold transition-colors duration-200 group"/,
  'className="flex items-center gap-3 text-sm text-gray-600 hover:text-mammut-gold transition-colors duration-200 group"'
);
content = content.replace(
  /<div className="overflow-hidden border border-mammut-border bg-\[#0e0e0f\]">/,
  '<div className="overflow-hidden border border-gray-200 bg-gray-50">'
);
content = content.replace(
  /<p className="text-mammut-white\/70 text-xs uppercase tracking-widest mb-4 text-center">/,
  '<p className="text-gray-600 text-xs uppercase tracking-widest mb-4 text-center">'
);
content = content.replace(
  /className="absolute inset-0 bg-mammut-dark border border-mammut-border flex items-center justify-center p-10"/,
  'className="absolute inset-0 bg-gray-50 border border-gray-200 flex items-center justify-center p-10"'
);
content = content.replace(
  /<span className="absolute bottom-4 right-4 text-\[10px\] text-mammut-white\/30 uppercase tracking-widest">/,
  '<span className="absolute bottom-4 right-4 text-[10px] text-gray-400 uppercase tracking-widest">'
);

// Section 3: Profile Specs Section
content = content.replace(
  /<section className="max-w-7xl mx-auto px-6 py-24 border-b border-mammut-border">/,
  '<section className="max-w-7xl mx-auto px-6 py-24 border-b border-gray-200 bg-white">'
);
content = content.replace(
  /<h2 className="text-4xl font-black text-mammut-white uppercase mb-6 leading-tight">/,
  '<h2 className="text-4xl font-black text-black uppercase mb-6 leading-tight">'
);
content = content.replace(
  /className="flex items-center gap-3 border-b border-mammut-border pb-3"/g,
  'className="flex items-center gap-3 border-b border-gray-200 pb-3"'
);
content = content.replace(
  /<span className="text-mammut-white\/70 text-sm">\{t\(`igloEdge\.specs\.\$\{spec\.label\}`\)\}<\/span>/g,
  '<span className="text-gray-600 text-sm">{t(`igloEdge.specs.${spec.label}`)}</span>'
);
content = content.replace(
  /<span className="text-mammut-white font-bold text-sm ml-auto">\{spec\.value\}<\/span>/g,
  '<span className="text-black font-bold text-sm ml-auto">{spec.value}</span>'
);

// Section 3: Interactive Color Swatch
content = content.replace(
  /<section className="bg-mammut-dark border-b border-mammut-border py-24">/,
  '<section className="bg-white border-b border-gray-200 py-24">'
);
content = content.replace(
  /<h2 className="text-3xl font-black text-mammut-white uppercase tracking-widest mb-4">/,
  '<h2 className="text-3xl font-black text-black uppercase tracking-widest mb-4">'
);
content = content.replace(
  /<p className="!text-mammut-white\/50 max-w-2xl mx-auto">/,
  '<p className="!text-gray-500 max-w-2xl mx-auto">'
);
content = content.replace(
  /<div className="lg:col-span-5 bg-mammut-darker border border-mammut-border flex flex-col items-center justify-center p-12 min-h-\[500px\] relative overflow-hidden">/,
  '<div className="lg:col-span-5 bg-gray-50 border border-gray-200 flex flex-col items-center justify-center p-12 min-h-[500px] relative overflow-hidden">'
);
content = content.replace(
  /<div className="absolute text-mammut-white\/20 text-xs font-bold tracking-widest z-30 bg-mammut-black\/50 px-3 py-1 uppercase rounded-sm backdrop-blur-sm -bottom-4">/,
  '<div className="absolute text-gray-500 text-xs font-bold tracking-widest z-30 bg-white\/50 px-3 py-1 uppercase rounded-sm backdrop-blur-sm -bottom-4">'
);
content = content.replace(
  /<span className="text-mammut-white\/40 uppercase tracking-widest border border-white\/10 px-3 py-1 bg-mammut-black\/80 rounded-sm">/,
  '<span className="text-gray-500 uppercase tracking-widest border border-gray-200 px-3 py-1 bg-white\/80 rounded-sm">'
);
content = content.replace(
  /<div className="lg:col-span-7 bg-mammut-darker border border-mammut-border p-8 lg:p-12">/,
  '<div className="lg:col-span-7 bg-gray-50 border border-gray-200 p-8 lg:p-12">'
);

// Handles Slider
content = content.replace(
  /<section className="py-16 border-b border-mammut-border" style={{ background: 'linear-gradient\(180deg, #0e0e0f 0%, #161617 100%\)' }}>/,
  '<section className="py-16 border-b border-gray-200 bg-white">'
);
content = content.replace(
  /className="flex-shrink-0 w-10 h-10 flex items-center justify-center border border-mammut-border text-mammut-white\/60 hover:text-mammut-gold hover:border-mammut-gold transition-colors duration-200"/g,
  'className="flex-shrink-0 w-10 h-10 flex items-center justify-center border border-gray-200 text-gray-600 hover:text-mammut-gold hover:border-mammut-gold transition-colors duration-200"'
);
content = content.replace(
  /<div className="w-full aspect-square flex items-end justify-center overflow-hidden bg-mammut-darker">/,
  '<div className="w-full aspect-square flex items-end justify-center overflow-hidden bg-gray-50 border border-gray-100 p-2">'
);
content = content.replace(
  /<p className="!text-mammut-white\/70 text-\[11px\] text-center leading-tight px-1">\{handle\.label\}<\/p>/g,
  '<p className="!text-gray-600 text-[11px] text-center leading-tight px-1">{handle.label}</p>'
);

// Additional Options Slider
content = content.replace(
  /className="flex-shrink-0 w-8 h-8 flex items-center justify-center border border-mammut-border text-mammut-white\/60 hover:text-mammut-gold hover:border-mammut-gold transition-colors duration-200"/g,
  'className="flex-shrink-0 w-8 h-8 flex items-center justify-center border border-gray-200 text-gray-600 hover:text-mammut-gold hover:border-mammut-gold transition-colors duration-200"'
);
content = content.replace(
  /<div className="w-full aspect-square bg-mammut-darker border border-mammut-border overflow-hidden flex items-center justify-center p-3">/g,
  '<div className="w-full aspect-square bg-gray-50 border border-gray-200 overflow-hidden flex items-center justify-center p-3">'
);
content = content.replace(
  /<p className="!text-mammut-white\/60 text-\[11px\] text-center leading-tight px-1 whitespace-pre-line">\{item\.name\}<\/p>/g,
  '<p className="!text-gray-600 text-[11px] text-center leading-tight px-1 whitespace-pre-line">{item.name}</p>'
);

// Additional Options Section
content = content.replace(
  /<section className="py-16 border-b border-mammut-border" style={{ background: 'linear-gradient\(180deg, #111112 0%, #0e0e0f 100%\)' }}>/,
  '<section className="py-16 border-b border-gray-200 bg-white">'
);
content = content.replace(
  /className="flex gap-8 border-b border-mammut-border pb-10 last:border-0 last:pb-0"/g,
  'className="flex gap-8 border-b border-gray-200 pb-10 last:border-0 last:pb-0"'
);
content = content.replace(
  /<h3 className="text-mammut-white font-black text-lg uppercase leading-tight mb-2">\{group\.title\}<\/h3>/g,
  '<h3 className="text-black font-black text-lg uppercase leading-tight mb-2">{group.title}</h3>'
);
content = content.replace(
  /<p className="!text-mammut-white\/50 text-xs leading-relaxed mb-4">\{group\.description\}<\/p>/g,
  '<p className="!text-gray-500 text-xs leading-relaxed mb-4">{group.description}</p>'
);

// Glazing Section
content = content.replace(
  /<section className="py-16 border-b border-mammut-border">/,
  '<section className="py-16 border-b border-gray-200 bg-white">'
);
content = content.replace(
  /<p className="!text-mammut-white text-sm mb-10 max-w-2xl">/,
  '<p className="!text-gray-600 text-sm mb-10 max-w-2xl">'
);
content = content.replace(
  /style={{ color: selected\.id === glass\.id \? '#eab676' : 'rgba\(255,255,255,0\.6\)' }}/g,
  'style={{ color: selected.id === glass.id ? \'#eab676\' : \'rgba(0,0,0,0.6)\' }}'
);
content = content.replace(
  /<div className="lg:w-\[45%\] flex-shrink-0 bg-mammut-dark overflow-hidden">/,
  '<div className="lg:w-[45%] flex-shrink-0 bg-gray-50 overflow-hidden border border-gray-200">'
);


fs.writeFileSync(targetFile, content);
console.log('Replacements complete');
