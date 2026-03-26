import fs from 'fs';

const file = 'c:\\Users\\Shadow\\.gemini\\antigravity\\scratch\\fantastic-octo-giggle\\src\\components\\SlateConfigurator\\MainConfigurator.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add completedSteps state and openStep function, update advanceStep
content = content.replace(
  "const [activeStep, setActiveStep] = useState<number | null>(null);\n  const [stepOrder, setStepOrder] = useState<number[]>([1,2,3,4,5,6,7,8]);\n  const advanceStep = (current: number, next: number) => { setTimeout(() => { setActiveStep(next); setStepOrder(prev => { const n = prev.filter(s => s !== current); n.push(current); return n; }); }, 350); };",
  "const [activeStep, setActiveStep] = useState<number | null>(null);\n  const [stepOrder, setStepOrder] = useState<number[]>([1,2,3,4,5,6,7,8]);\n  const [completedSteps, setCompletedSteps] = useState<number[]>([]);\n  const openStep = (step: number) => { setActiveStep(step); setStepOrder(prev => [step, ...prev.filter(s => s !== step)]); };\n  const advanceStep = (current: number, next: number) => { setTimeout(() => { setActiveStep(next); setCompletedSteps(prev => Array.from(new Set([...prev, current]))); setStepOrder(prev => { const n = prev.filter(s => s !== current); n.push(current); return n; }); }, 350); };"
);

// 2. Wrap all onClick={() => setActiveStep(X)} with openStep(X)
content = content.replace(/onClick=\{\(\) => setActiveStep\((.*?)\)\}/g, "onClick={() => openStep($1)}");
// Also catch the ones with block braces like `onClick={() => { setActiveStep(5); setColorTab('interior'); }}`
content = content.replace(/setActiveStep\(/g, "openStep(");
// BUT we must revert it inside `advanceStep` definition! Wait!
// If I blanket replace `setActiveStep(`, the `advanceStep` body will break!
// Let's be surgical. Revert inside advanceStep:
content = content.replace(
  "const advanceStep = (current: number, next: number) => { setTimeout(() => { openStep(next);",
  "const advanceStep = (current: number, next: number) => { setTimeout(() => { setActiveStep(next);"
);
// Revert inside useEffect or other hooks if they exist? There are none.
// Revert inside useConfigurator logic? Wait, setActiveStep is local to MainConfigurator.

// 3. Inject Emerald Checkmarks into headers
// We find `<div className={\`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors \${activeStep === X...}\`}>X</div>`
for(let i=1; i<=8; i++) {
  const numRegex = new RegExp(`(<div className=\{\`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors \\\$\\{activeStep === ${i}.*?\`\\}>${i}<\\/div>)`, 'g');
  content = content.replace(numRegex, `$1 \n {completedSteps.includes(${i}) && <Check size={20} className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" strokeWidth={3} />}`);
}

// 4. Step 4 Auto-Advance Logic
// We need to inject the count check inside SET_SASH_OPENING
content = content.replace(
  "onClick={() => dispatch({ type: 'SET_SASH_OPENING', payload: { index: sashIndex, openingId: ot.shortCode } })}",
  "onClick={() => { dispatch({ type: 'SET_SASH_OPENING', payload: { index: sashIndex, openingId: ot.shortCode } }); const count = WINDOW_TYPES.find(w => w.id === state.windowTypeId)?.sashes || 1; if (sashIndex === count - 1) { advanceStep(4, 5); } }}"
);

// 5. Step 5 Color Tab Delay
content = content.replace(
  "if (colorTab === 'interior') {\n                                    setColorTab('exterior');\n                                } else {",
  "if (colorTab === 'interior') {\n                                    setTimeout(() => setColorTab('exterior'), 150);\n                                } else {"
);

// Optional: fix any double setActiveStep renames (if advanceStep logic was destroyed).
// Wait, the regex `setActiveStep\(` replaced the hook array `const [activeStep, setActiveStep]` -> `const [activeStep, openStep]`.
content = content.replace(
  "const [activeStep, openStep] = useState",
  "const [activeStep, setActiveStep] = useState"
);

fs.writeFileSync(file, content);
console.log("Interactions patched!");
