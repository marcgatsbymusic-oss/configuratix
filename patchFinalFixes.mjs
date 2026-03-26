import fs from 'fs';

// 1. Fix dimensions input width
const mainFile = 'c:\\Users\\Shadow\\.gemini\\antigravity\\scratch\\fantastic-octo-giggle\\src\\components\\SlateConfigurator\\MainConfigurator.tsx';
let mainContent = fs.readFileSync(mainFile, 'utf8');
mainContent = mainContent.replace(/w-\[45px\]/g, 'w-[55px]');
fs.writeFileSync(mainFile, mainContent);

// 2. Add Mammut Logo to SVG
const svgFile = 'c:\\Users\\Shadow\\.gemini\\antigravity\\scratch\\fantastic-octo-giggle\\src\\components\\SlateConfigurator\\BlueprintPreview.tsx';
let svgContent = fs.readFileSync(svgFile, 'utf8');
if (!svgContent.includes('mammut-logo-icon.png')) {
  svgContent = svgContent.replace(
    /          \}\)\}\n        <\/g>\n      <\/svg>/,
    `          })}\n          <image href="/assets/mammut-logo-icon.png" x={(frameW - Math.min(frameW, frameH) * 0.3) / 2} y={(frameH - Math.min(frameW, frameH) * 0.3) / 2} width={Math.min(frameW, frameH) * 0.3} height={Math.min(frameW, frameH) * 0.3} opacity="0.15" style={{ pointerEvents: 'none' }} />\n        </g>\n      </svg>`
  );
  fs.writeFileSync(svgFile, svgContent);
}

// 3. Fix HelpContents translations and visibility
const helpFile = 'c:\\Users\\Shadow\\.gemini\\antigravity\\scratch\\fantastic-octo-giggle\\src\\components\\SlateConfigurator\\HelpContents.tsx';
let helpContent = fs.readFileSync(helpFile, 'utf8');
helpContent = helpContent.replace(/Cerrar <X/g, "{t('help.close', 'Cerrar')} <X");
// Force text to be perfectly white and visible
helpContent = helpContent.replace(/text-\[#f1f5f9\]/g, 'text-white !text-white opacity-95');
fs.writeFileSync(helpFile, helpContent);

console.log('All final fixes patched successfully!');
