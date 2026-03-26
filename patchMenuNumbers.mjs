import fs from 'fs';

const target = 'c:\\Users\\Shadow\\.gemini\\antigravity\\scratch\\fantastic-octo-giggle\\src\\components\\SlateConfigurator\\MainConfigurator.tsx';
let data = fs.readFileSync(target, 'utf8');

// 1. Scroll Hook
data = data.split('const [showExitModal, setShowExitModal] = useState(false);').join(
  "const [showExitModal, setShowExitModal] = useState(false);\n  React.useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [activeStep]);"
);

// 2. Menu Numbers
const maps = [
  {
    old: `<span className="text-white/50 group-hover:text-[#eab676] font-medium text-xs uppercase tracking-wider transition-colors">{t('configurator.summary.material')}</span>`,
    new: `<div className="flex items-center gap-2.5"><span className="w-5 h-5 rounded-md inline-flex items-center justify-center bg-[#2a2a2b] border border-white/5 shadow-inner text-[10px] font-black text-white/50 group-hover:bg-[#eab676] group-hover:text-black group-hover:border-[#eab676] transition-all duration-300 drop-shadow-sm">1</span><span className="text-white/50 group-hover:text-[#eab676] font-medium text-xs uppercase tracking-wider transition-colors">{t('configurator.summary.material')}</span></div>`
  },
  {
    old: `<span className="text-white/50 group-hover:text-[#eab676] font-medium text-xs uppercase tracking-wider transition-colors">{t('configurator.summary.system')}</span>`,
    new: `<div className="flex items-center gap-2.5"><span className="w-5 h-5 rounded-md inline-flex items-center justify-center bg-[#2a2a2b] border border-white/5 shadow-inner text-[10px] font-black text-white/50 group-hover:bg-[#eab676] group-hover:text-black group-hover:border-[#eab676] transition-all duration-300 drop-shadow-sm">2</span><span className="text-white/50 group-hover:text-[#eab676] font-medium text-xs uppercase tracking-wider transition-colors">{t('configurator.summary.system')}</span></div>`
  },
  {
    old: `<span className="text-white/50 group-hover:text-[#eab676] font-medium text-xs uppercase tracking-wider transition-colors">{t('configurator.summary.windowType')}</span>`,
    new: `<div className="flex items-center gap-2.5"><span className="w-5 h-5 rounded-md inline-flex items-center justify-center bg-[#2a2a2b] border border-white/5 shadow-inner text-[10px] font-black text-white/50 group-hover:bg-[#eab676] group-hover:text-black group-hover:border-[#eab676] transition-all duration-300 drop-shadow-sm">3</span><span className="text-white/50 group-hover:text-[#eab676] font-medium text-xs uppercase tracking-wider transition-colors">{t('configurator.summary.windowType')}</span></div>`
  },
  {
    old: `<span className="text-white/50 group-hover:text-[#eab676] font-medium text-xs uppercase tracking-wider transition-colors">Interior Color</span>`,
    new: `<div className="flex items-center gap-2.5"><span className="w-5 h-5 rounded-md inline-flex items-center justify-center bg-[#2a2a2b] border border-white/5 shadow-inner text-[10px] font-black text-white/50 group-hover:bg-[#eab676] group-hover:text-black group-hover:border-[#eab676] transition-all duration-300 drop-shadow-sm">5</span><span className="text-white/50 group-hover:text-[#eab676] font-medium text-xs uppercase tracking-wider transition-colors">Interior Color</span></div>`
  },
  {
    old: `<span className="text-white/50 group-hover:text-[#eab676] font-medium text-xs uppercase tracking-wider transition-colors">Exterior Color</span>`,
    new: `<div className="flex items-center gap-2.5"><span className="w-5 h-5 rounded-md inline-flex items-center justify-center bg-[#2a2a2b] border border-white/5 shadow-inner text-[10px] font-black text-white/50 group-hover:bg-[#eab676] group-hover:text-black group-hover:border-[#eab676] transition-all duration-300 drop-shadow-sm">5</span><span className="text-white/50 group-hover:text-[#eab676] font-medium text-xs uppercase tracking-wider transition-colors">Exterior Color</span></div>`
  },
  {
    old: `<span className="text-white/50 group-hover:text-[#eab676] font-medium text-xs uppercase tracking-wider transition-colors">{t('configurator.summary.glazing')}</span>`,
    new: `<div className="flex items-center gap-2.5"><span className="w-5 h-5 rounded-md inline-flex items-center justify-center bg-[#2a2a2b] border border-white/5 shadow-inner text-[10px] font-black text-white/50 group-hover:bg-[#eab676] group-hover:text-black group-hover:border-[#eab676] transition-all duration-300 drop-shadow-sm">7</span><span className="text-white/50 group-hover:text-[#eab676] font-medium text-xs uppercase tracking-wider transition-colors">{t('configurator.summary.glazing')}</span></div>`
  },
  {
    old: `<span className="text-white/50 group-hover:text-[#eab676] font-medium text-xs uppercase tracking-wider transition-colors">Integrations</span>`,
    new: `<div className="flex items-center gap-2.5"><span className="w-5 h-5 rounded-md inline-flex items-center justify-center bg-[#2a2a2b] border border-white/5 shadow-inner text-[10px] font-black text-white/50 group-hover:bg-[#eab676] group-hover:text-black group-hover:border-[#eab676] transition-all duration-300 drop-shadow-sm">8</span><span className="text-white/50 group-hover:text-[#eab676] font-medium text-xs uppercase tracking-wider transition-colors">Integrations</span></div>`
  }
];

for (const map of maps) {
  data = data.split(map.old).join(map.new);
}

// 3. To perfectly address "Don't pre select material type in Option 'Material' when first openened" definitively:
// I've already hidden the visual golden borders on the UI with `completedSteps.includes(1)`.
// But the right window summary says "PVC" (or "---" because of my previous script replacing them with a ternary!).
// The exact string I replaced earlier was `{completedSteps.includes(1) ? state.material : '---'}`. 
// So the right window natively handles it visually. 

fs.writeFileSync(target, data);
console.log('Numerical Sidebar and Scroll Hooks injected cleanly');
