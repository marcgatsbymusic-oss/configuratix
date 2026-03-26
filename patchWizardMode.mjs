import fs from 'fs';

const target = 'c:\\Users\\Shadow\\.gemini\\antigravity\\scratch\\fantastic-octo-giggle\\src\\components\\SlateConfigurator\\MainConfigurator.tsx';
let data = fs.readFileSync(target, 'utf8');

data = data.split('const [activeStep, setActiveStep] = useState<number | null>(null);').join('const [activeStep, setActiveStep] = useState<number | null>(1);');

const oldH = `            {/* Contextual Headers aligned with Accordions */}
            <div className="px-2 pt-2 pb-2" style={{ order: -1 }}>
              <p className="!text-white text-sm md:text-lg lg:text-xl md:text-2xl font-black max-w-2xl relative z-10 leading-relaxed break-words drop-shadow-md">{t('configurator.title')}</p>
              <p className="!text-[#f0f0f0] font-bold text-sm md:text-base mt-2 drop-shadow-sm">{t('configurator.subtitle')}</p>
            </div>`;

const newH = `            {/* Contextual Welcome Message */}
            {completedSteps.length === 0 && (
              <div className="bg-gradient-to-br from-[#1a1a1b] to-[#111112] border border-[#eab676]/30 p-8 rounded-3xl shadow-2xl mb-2 relative overflow-hidden group" style={{ order: -1 }}>
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[#eab676] to-transparent opacity-70" />
                <div className="flex flex-col items-center text-center gap-5 relative z-10">
                  <div className="w-20 h-20 bg-[#eab676]/10 rounded-full flex items-center justify-center text-[#eab676] shadow-[0_0_30px_rgba(234,182,118,0.15)] outline outline-1 outline-white/5">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                  </div>
                  <h1 className="!text-white text-2xl md:text-3xl lg:text-4xl font-black drop-shadow-md tracking-tight">Welcome to our AI powered windows configurator</h1>
                  <p className="text-white/70 font-medium text-sm md:text-base lg:text-lg max-w-3xl leading-relaxed">
                    Selecting windows is not an easy task, there are many options and everybody's needs differ, that's why our configurator will guide and help you make the best choice that suits your needs and budget.
                  </p>
                </div>
              </div>
            )}`;

data = data.split(oldH).join(newH);

for (let i = 1; i <= 8; i++) {
  const oldSec = '<section className="bg-[#1a1a1b] p-6 md:p-8 rounded-2xl shadow-sm border border-[#2a2a2b] transition-all duration-300" style={{ order: stepOrder.indexOf(' + i + ') }}>';
  const newSec = '<section className={`bg-[#1a1a1b] p-6 md:p-8 rounded-2xl shadow-sm border border-[#2a2a2b] transition-all duration-500 ${activeStep !== ' + i + ' ? "hidden opacity-0 scale-95" : "block opacity-100 scale-100"}`} style={{ order: stepOrder.indexOf(' + i + ') }}>';
  data = data.split(oldSec).join(newSec);
}

const oldMenu = '<div className="lg:col-span-4 sticky top-10">';
const newMenu = '<div className={`lg:col-span-4 sticky top-10 transition-all duration-700 ${completedSteps.length === 0 ? "opacity-0 translate-x-10 pointer-events-none hidden lg:block" : "opacity-100 translate-x-0"}`}>';
data = data.split(oldMenu).join(newMenu);

fs.writeFileSync(target, data);
console.log("Wizard UI completely synced");
