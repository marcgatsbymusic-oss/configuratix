import fs from 'fs';

const target = 'c:\\Users\\Shadow\\.gemini\\antigravity\\scratch\\fantastic-octo-giggle\\src\\components\\SlateConfigurator\\MainConfigurator.tsx';
let data = fs.readFileSync(target, 'utf8');

// Helper for exact replacement (first occurrence only, or all, but split.join does all)
function replaceAll(str, find, replace) {
  return str.split(find).join(replace);
}

// 1. Initial State Hooks
data = replaceAll(data, 
  'const [activeStep, setActiveStep] = useState<number | null>(1);', 
  "const hasProduct = typeof window !== 'undefined' && window.location.search.includes('product=');\n  const [activeStep, setActiveStep] = useState<number | null>(hasProduct ? 3 : 1);"
);

data = replaceAll(data, 
  'const [completedSteps, setCompletedSteps] = useState<number[]>([]);', 
  "const [completedSteps, setCompletedSteps] = useState<number[]>(hasProduct ? [1, 2] : []);"
);

// 2. Material Active States
data = replaceAll(data, 
  "state.material === mat ? 'border-[#eab676] ring-4 ring-[#eab676]/10 scale-[1.02]'", 
  "(completedSteps.includes(1) && state.material === mat) ? 'border-[#eab676] ring-4 ring-[#eab676]/10 scale-[1.02]'"
);
data = replaceAll(data, 
  "{state.material === mat && (", 
  "{(completedSteps.includes(1) && state.material === mat) && ("
);

// 3. Profile Active States
data = replaceAll(data, 
  "isActive={state.profile === profile.id}", 
  "isActive={completedSteps.includes(2) && state.profile === profile.id}"
);

// 4. Window Type Active States
data = replaceAll(data, 
  "state.windowTypeId === wt.id ? 'border-[#eab676]' : 'border-transparent opacity-50 hover:opacity-100 ring-1 ring-white/10'", 
  "(completedSteps.includes(3) && state.windowTypeId === wt.id) ? 'border-[#eab676]' : 'border-transparent opacity-50 hover:opacity-100 ring-1 ring-white/10'"
);
data = replaceAll(data, 
  "{state.windowTypeId === wt.id && (", 
  "{(completedSteps.includes(3) && state.windowTypeId === wt.id) && ("
);

// 5. Opening Type Active States
data = replaceAll(data, 
  "state.sashOpenings[sashIndex] === ot.shortCode ? 'border-[#eab676] bg-[#eab676]/10 text-[#eab676] shadow-md shadow-[#eab676]/5 ring-1 ring-[#eab676]/50' : 'border-[#2a2a2b] bg-[#1a1a1b] text-white/50 hover:border-[#3a3a3b] hover:text-white/80'", 
  "(completedSteps.includes(4) && state.sashOpenings[sashIndex] === ot.shortCode) ? 'border-[#eab676] bg-[#eab676]/10 text-[#eab676] shadow-md shadow-[#eab676]/5 ring-1 ring-[#eab676]/50' : 'border-[#2a2a2b] bg-[#1a1a1b] text-white/50 hover:border-[#3a3a3b] hover:text-white/80'"
);
data = replaceAll(data, 
  "state.sashOpenings[sashIndex] === ot.shortCode ? 'text-[#eab676]' : 'text-white/20 group-hover:text-white/40'", 
  "(completedSteps.includes(4) && state.sashOpenings[sashIndex] === ot.shortCode) ? 'text-[#eab676]' : 'text-white/20 group-hover:text-white/40'"
);

// 6. Color Active States
data = replaceAll(data, 
  "const isActive = colorTab === 'interior' ? state.interiorColor === colorId : state.exteriorColor === colorId;", 
  "const isActive = completedSteps.includes(5) && (colorTab === 'interior' ? state.interiorColor === colorId : state.exteriorColor === colorId);"
);

// 7. Glazing Active States
data = replaceAll(data, 
  "state.glazing === gp.id ? 'border-[#eab676] bg-[#eab676]/10'", 
  "(completedSteps.includes(7) && state.glazing === gp.id) ? 'border-[#eab676] bg-[#eab676]/10'"
);
data = replaceAll(data, 
  "{state.glazing === gp.id && (", 
  "{(completedSteps.includes(7) && state.glazing === gp.id) && ("
);

// 8. Right Menu Summaries
data = replaceAll(data, 
  '<span className="font-bold text-white group-hover:text-[#eab676] transition-colors">{state.material}</span>', 
  '<span className="font-bold text-white group-hover:text-[#eab676] transition-colors">{completedSteps.includes(1) ? state.material : \'---\'}</span>'
);

data = replaceAll(data, 
  '<span className="font-bold text-white group-hover:text-[#eab676] transition-colors truncate max-w-[150px] text-right">{state.profile ? (CONFIG_SCHEMA.materials[state.material].profiles.find(p => p.id === state.profile)?.name || state.profile) : \'Standard System\'}</span>', 
  '<span className="font-bold text-white group-hover:text-[#eab676] transition-colors truncate max-w-[150px] text-right">{completedSteps.includes(2) && state.profile ? (CONFIG_SCHEMA.materials[state.material].profiles.find(p => p.id === state.profile)?.name || state.profile) : \'---\'}</span>'
);

data = replaceAll(data, 
  '<span className="font-bold text-white group-hover:text-[#eab676] transition-colors">{t(`configurator.windowTypes.${state.windowTypeId}`, WINDOW_TYPES.find(w => w.id === state.windowTypeId)?.name || state.windowTypeId)}</span>', 
  '<span className="font-bold text-white group-hover:text-[#eab676] transition-colors">{completedSteps.includes(3) ? t(`configurator.windowTypes.${state.windowTypeId}`, WINDOW_TYPES.find(w => w.id === state.windowTypeId)?.name || state.windowTypeId) : \'---\'}</span>'
);

// The Interior Color Line
data = replaceAll(data, 
  '<span className="font-bold text-white group-hover:text-[#eab676] transition-colors line-clamp-1">{COLOR_LOCALE.colors[state.interiorColor]?.name || state.interiorColor}</span>', 
  '<span className="font-bold text-white group-hover:text-[#eab676] transition-colors line-clamp-1">{completedSteps.includes(5) ? (COLOR_LOCALE.colors[state.interiorColor]?.name || state.interiorColor) : \'---\'}</span>'
);

// The Exterior Color Line
data = replaceAll(data, 
  '<span className="font-bold text-white group-hover:text-[#eab676] transition-colors line-clamp-1">{COLOR_LOCALE.colors[state.exteriorColor]?.name || state.exteriorColor}</span>', 
  '<span className="font-bold text-white group-hover:text-[#eab676] transition-colors line-clamp-1">{completedSteps.includes(5) ? (COLOR_LOCALE.colors[state.exteriorColor]?.name || state.exteriorColor) : \'---\'}</span>'
);

// The Glazing
data = replaceAll(data, 
  '<span className="font-bold text-white group-hover:text-[#eab676] transition-colors truncate max-w-[150px] text-right">{CONFIG_SCHEMA.glazing[state.glazing]?.name || state.glazing}</span>', 
  '<span className="font-bold text-white group-hover:text-[#eab676] transition-colors truncate max-w-[150px] text-right">{completedSteps.includes(7) ? (CONFIG_SCHEMA.glazing[state.glazing]?.name || state.glazing) : \'---\'}</span>'
);

// Let's also verify Step 4 Opening Type summary!
// Actually I don't see an explicit summary line for Step 4 Opening Type in Right Menu. 
// Let's replace Step 4 Opening Type thumbnail logic in the header:
// <img src={WINDOW_TYPES.find(w => w.id === state.windowTypeId)?.imgUrl} alt="Active Layout" className="w-14 h-14 object-contain ml-auto border border-white/10 rounded-lg p-1 bg-black/40 drop-shadow-md hidden sm:block" />
// No need to hide thumbnail since Step 3 WindowType defines it, and if they are on Step 4 they have completed Step 3.

fs.writeFileSync(target, data);
console.log('Unselected UX mappings applied successfully');
