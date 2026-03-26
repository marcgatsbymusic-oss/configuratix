import fs from 'fs';

// 1. Fix MainConfigurator
const mainFile = 'c:\\Users\\Shadow\\.gemini\\antigravity\\scratch\\fantastic-octo-giggle\\src\\components\\SlateConfigurator\\MainConfigurator.tsx';
let mc = fs.readFileSync(mainFile, 'utf8');

// Subtitle text is too dark
mc = mc.replace(/text-white\/30 text-sm md:text-lg lg:text-xl/g, 'text-white/70 text-sm md:text-lg lg:text-xl');
mc = mc.replace(/text-white\/40 text-sm mt-1/g, 'text-white/60 text-sm mt-1');

// Complete border visible when selected (add padding to horizontal scrollers to avoid clipping `ring-4` and `scale-[1.02]`)
mc = mc.replace(/flex overflow-x-auto gap-5 pb-4 snap-x hide-scrollbar/g, 'flex overflow-x-auto gap-5 py-4 px-2 snap-x hide-scrollbar');

// Images are not visible (mix-blend-multiply on dark backgrounds causes images to disappear)
mc = mc.replace(/mix-blend-multiply /g, '');

// Translate dynamic system text labels
mc = mc.replace(/<div className="font-bold text-lg text-white\/90">\{mat\}<\/div>/g, '<div className="font-bold text-lg text-white/90">{t(`configurator.materials.${mat}`, mat)}</div>');
mc = mc.replace(/<div className="font-bold text-lg text-white\/90">\{profile\.name\}<\/div>/g, '<div className="font-bold text-lg text-white/90">{t(`configurator.profiles.${profile.id}`, profile.name)}</div>');

fs.writeFileSync(mainFile, mc);


// 2. Fix BlueprintPreview
const bpFile = 'c:\\Users\\Shadow\\.gemini\\antigravity\\scratch\\fantastic-octo-giggle\\src\\components\\SlateConfigurator\\BlueprintPreview.tsx';
let bc = fs.readFileSync(bpFile, 'utf8');

// Translate drag to rotate text
bc = bc.replace(/Drag to rotate freely in 3D/g, "{t('configurator.blueprint.dragToRotate', 'Drag to rotate freely in 3D')}");

fs.writeFileSync(bpFile, bc);
console.log('UI Bugs patched successfully');
