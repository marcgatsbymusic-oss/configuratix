import fs from 'fs';

const target = 'c:\\Users\\Shadow\\.gemini\\antigravity\\scratch\\fantastic-octo-giggle\\src\\components\\SlateConfigurator\\MainConfigurator.tsx';
let data = fs.readFileSync(target, 'utf8');

function replaceAll(str, find, replace) {
  return str.split(find).join(replace);
}

// 1. Initial State
data = replaceAll(data, 
  "const [activeStep, setActiveStep] = useState<number | null>(hasProduct ? 3 : 1);", 
  "const [activeStep, setActiveStep] = useState<number | null>(hasProduct ? 3 : 0);"
);

// 2. Left Column width mapping
data = replaceAll(data, 
  '<div className="lg:col-span-8 flex flex-col gap-8">', 
  '<div className={`flex flex-col gap-8 transition-all duration-700 ${activeStep === 0 ? "lg:col-span-12 max-w-4xl mx-auto w-full pt-10" : "lg:col-span-8"}`}>'
);

// 3. Welcome Banner wrapper + Start Button
const searchBanner = `            {/* Contextual Welcome Message */}
            {completedSteps.length === 0 && (
              <div className="bg-gradient-to-br from-[#1a1a1b] to-[#111112] border border-[#eab676]/30 p-8 rounded-3xl shadow-2xl mb-2 relative overflow-hidden group" style={{ order: -1 }}>
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[#eab676] to-transparent opacity-70" />
                <div className="flex flex-col items-center text-center gap-5 relative z-10">
                  <div className="w-20 h-20 bg-[#eab676]/10 rounded-full flex items-center justify-center text-[#eab676] shadow-[0_0_30px_rgba(234,182,118,0.15)] outline outline-1 outline-white/5">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                  </div>
                  <h1 className="!text-white text-2xl md:text-3xl lg:text-4xl font-black drop-shadow-md tracking-tight">Welcome to our AI powered windows configurator</h1>
                  <p className="!text-[#f0f0f0] font-bold text-sm md:text-base lg:text-lg max-w-3xl leading-relaxed drop-shadow-md pb-2">
                    Selecting windows is not an easy task, there are many options and everybody's needs differ, that's why our configurator will guide and help you make the best choice that suits your needs and budget.
                  </p>
                </div>
              </div>
            )}`;

const replaceBanner = `            {/* Contextual Welcome Message */}
            {activeStep === 0 && (
              <div className="bg-gradient-to-br from-[#1a1a1b] to-[#111112] border border-[#eab676]/30 p-10 md:p-14 rounded-3xl shadow-2xl mb-2 relative overflow-hidden group w-full" style={{ order: -1 }}>
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[#eab676] to-transparent opacity-70" />
                <div className="flex flex-col items-center text-center gap-6 relative z-10">
                  <div className="w-24 h-24 bg-[#eab676]/10 rounded-full flex items-center justify-center text-[#eab676] shadow-[0_0_40px_rgba(234,182,118,0.15)] outline outline-1 outline-white/5 mb-2">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                  </div>
                  <h1 className="!text-white text-3xl md:text-4xl lg:text-5xl font-black drop-shadow-md tracking-tight uppercase">Welcome to our AI powered windows configurator</h1>
                  <p className="!text-[#f0f0f0] font-bold text-base md:text-lg lg:text-xl max-w-4xl leading-relaxed drop-shadow-md pb-6 pt-2">
                    Selecting windows is not an easy task, there are many options and everybody's needs differ, that's why our configurator will guide and help you make the best choice that suits your needs and budget.
                  </p>
                  <button 
                    onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setActiveStep(1); }}
                    className="bg-[#eab676] !text-black font-black text-xl md:text-2xl px-14 py-5 rounded-full hover:bg-[#ffc882] hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_30px_rgba(234,182,118,0.4)] flex items-center gap-3 uppercase tracking-[0.2em]"
                  >
                    Start <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                  </button>
                </div>
              </div>
            )}`;

data = replaceAll(data, searchBanner, replaceBanner);

// 4. Hide Right Menu on Step 0
data = replaceAll(data, 
  '<div className={`lg:col-span-4 sticky top-10 transition-all duration-700 ${completedSteps.length === 0 ? "opacity-0 translate-x-10 pointer-events-none hidden lg:block" : "opacity-100 translate-x-0"}`}>', 
  '<div className={`lg:col-span-4 sticky top-10 transition-all duration-700 ${activeStep === 0 ? "hidden" : completedSteps.length === 0 ? "opacity-0 translate-x-10 pointer-events-none hidden lg:block" : "opacity-100 translate-x-0"}`}>'
);

fs.writeFileSync(target, data);
console.log('Step 0 Start Button isolation patched via Node hook');
