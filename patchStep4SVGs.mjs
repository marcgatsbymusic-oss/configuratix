import fs from 'fs';

const target = 'c:\\Users\\Shadow\\.gemini\\antigravity\\scratch\\fantastic-octo-giggle\\src\\components\\SlateConfigurator\\MainConfigurator.tsx';
let data = fs.readFileSync(target, 'utf8');

const svgComponent = `
const SashSymbol = ({ shortCode, className = "w-6 h-6" }: { shortCode: string, className?: string }) => {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="6 8" strokeLinecap="round" strokeLinejoin="round" opacity="0.9">
      <rect x="5" y="5" width="90" height="90" fill="none" strokeDasharray="none" strokeWidth="3" stroke="currentColor" opacity="0.4" />
      {shortCode === 'F' && <path d="M 5,5 L 95,95 M 5,95 L 95,5" strokeDasharray="none" strokeWidth="2" opacity="0.5" />}
      {shortCode === 'DKL' && <><polyline points="5,5 95,50 5,95" /><polyline points="5,95 50,5 95,95" /></>}
      {shortCode === 'DKR' && <><polyline points="95,5 5,50 95,95" /><polyline points="5,95 50,5 95,95" /></>}
      {shortCode === 'DL' && <polyline points="5,5 95,50 5,95" />}
      {shortCode === 'DR' && <polyline points="95,5 5,50 95,95" />}
      {shortCode === 'K' && <polyline points="5,95 50,5 95,95" />}
    </svg>
  );
};

export function MainConfigurator`;

// 1. Inject SashSymbol before MainConfigurator standard export
data = data.replace('export function MainConfigurator', svgComponent);

// 2. Inject the Window Type Mini Thumbnail
data = data.replace(
  '<h2 className={`text-xl font-bold transition-colors ${activeStep === 4 ? \'text-white/90\' : \'text-white/40\'}`}>{t(\'configurator.steps.openingType\')}</h2>\n                </div>',
  '<h2 className={`text-xl font-bold transition-colors ${activeStep === 4 ? \'text-white/90\' : \'text-white/40\'}`}>{t(\'configurator.steps.openingType\')}</h2>\n                  <img src={WINDOW_TYPES.find(w => w.id === state.windowTypeId)?.imgUrl} alt="Active Layout" className="w-14 h-14 object-contain ml-auto border border-white/10 rounded-lg p-1 bg-black/40 drop-shadow-md hidden sm:block" />\n                </div>'
);

// 3. Update the OPENING_TYPES buttons visually to hold the SVG and i18next translation map
const buttonOld = `<button
                                key={ot.id}
                                onClick={() => { dispatch({ type: 'SET_SASH_OPENING', payload: { index: sashIndex, openingId: ot.shortCode } }); const count = WINDOW_TYPES.find(w => w.id === state.windowTypeId)?.sashes || 1; if (sashIndex === count - 1) { advanceStep(4, 5); } }}
                                className={\`px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all \${state.sashOpenings[sashIndex] === ot.shortCode ? 'border-[#eab676] bg-[#eab676] !text-black shadow-md' : 'border-[#2a2a2b] bg-[#1a1a1b] text-white/70 hover:border-[#3a3a3b]'}\`}
                              >
                                {ot.name}
                              </button>`;

const buttonNew = `<button
                                key={ot.id}
                                onClick={() => { dispatch({ type: 'SET_SASH_OPENING', payload: { index: sashIndex, openingId: ot.shortCode } }); const count = WINDOW_TYPES.find(w => w.id === state.windowTypeId)?.sashes || 1; if (sashIndex === count - 1) { advanceStep(4, 5); } }}
                                className={\`group flex flex-col items-center justify-center gap-3 p-3 w-32 rounded-xl border-2 transition-all \${state.sashOpenings[sashIndex] === ot.shortCode ? 'border-[#eab676] bg-[#eab676]/10 text-[#eab676] shadow-md shadow-[#eab676]/5 ring-1 ring-[#eab676]/50' : 'border-[#2a2a2b] bg-[#1a1a1b] text-white/50 hover:border-[#3a3a3b] hover:text-white/80'}\`}
                              >
                                <SashSymbol shortCode={ot.shortCode} className={\`w-10 h-10 transition-colors \${state.sashOpenings[sashIndex] === ot.shortCode ? 'text-[#eab676]' : 'text-white/20 group-hover:text-white/40'}\`} />
                                <span className="text-[10px] sm:text-[11px] font-bold text-center leading-tight">
                                  {t(\`configurator.openingTypes.\${ot.shortCode}\`, ot.name)}
                                </span>
                              </button>`;

// Replace via split+join or regex because string match might have indent issues
// Using a regex to find the map block
data = data.replace(/{OPENING_TYPES\.map\(ot => \([\s\S]*?<\/button>\s*\)\)}/g, `{OPENING_TYPES.map(ot => (${buttonNew}))}`);

// Make sure the flex container wraps nice
data = data.replace('<div className="flex flex-wrap gap-2">', '<div className="flex flex-wrap gap-3">');

// We also need the flex parent of the header to expand properly
data = data.replace(
  '<div className="flex items-center gap-3">',
  '<div className="flex items-center gap-3 w-full relative">'
);

fs.writeFileSync(target, data);
console.log('MainConfigurator patched with SVG Architectural Engine and Layout Thumbnails!');
