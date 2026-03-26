import fs from 'fs';

const target = 'c:\\Users\\Shadow\\.gemini\\antigravity\\scratch\\fantastic-octo-giggle\\src\\components\\SlateConfigurator\\MainConfigurator.tsx';
let data = fs.readFileSync(target, 'utf8');

// 1. Imports
const importSearch = "import { useSessionStore } from '../../store/useSessionStore';";
const importReplace = `import { useSessionStore } from '../../store/useSessionStore';
import { Sparkles } from 'lucide-react';
import { AIGuidedAssistant } from './AIGuidedAssistant';`;
data = data.split(importSearch).join(importReplace);

// 2. State hooks
const stateSearch = "  const [showCartDashboard, setShowCartDashboard] = useState(false);";
const stateReplace = `  const [showCartDashboard, setShowCartDashboard] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);`;
data = data.split(stateSearch).join(stateReplace);

// 3. Modals JSX
const jsxSearch = `      <FloatingHelpMenu />`;
const jsxReplace = `      <FloatingHelpMenu />
      
      {showAIAssistant && (
        <AIGuidedAssistant 
          onClose={() => setShowAIAssistant(false)}
          onComplete={(recommendedMaterial, recommendedProfile, recommendedGlazing) => {
            setShowAIAssistant(false);
            dispatch({ type: 'SET_MATERIAL', payload: recommendedMaterial.toLowerCase() });
            
            setTimeout(() => {
              // @ts-ignore
              dispatch({ type: 'SET_PROFILE', payload: recommendedProfile.toLowerCase() });
              // @ts-ignore
              dispatch({ type: 'SET_GLAZING', payload: recommendedGlazing });
              
              setActiveStep(1); 
              setCompletedSteps([1, 2]); 
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 100);
          }}
        />
      )}`;
data = data.split(jsxSearch).join(jsxReplace);

// 4. Start Button Replacement
const btnSearch = `                  <button 
                    onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setActiveStep(1); }}
                    className="bg-[#eab676] !text-black font-black text-xl md:text-2xl px-14 py-5 rounded-full hover:bg-[#ffc882] hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_30px_rgba(234,182,118,0.4)] flex items-center gap-3 uppercase tracking-[0.2em]"
                  >
                    {t('configurator.steps.start', 'Start')} <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                  </button>`;
const btnReplace = `                  <div className="flex flex-col md:flex-row gap-4 w-full justify-center mt-2">
                    <button 
                      onClick={() => setShowAIAssistant(true)}
                      className="flex-[3] bg-[#eab676] !text-black font-black text-sm lg:text-base px-6 py-5 rounded-2xl hover:bg-[#ffc882] hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-[0_0_30px_rgba(234,182,118,0.3)] flex items-center justify-center gap-3 uppercase tracking-[0.1em]"
                    >
                      <Sparkles size={20} className="shrink-0" /> Recommended: Intelligent Guided Assistant
                    </button>
                    <button 
                      onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setActiveStep(1); }}
                      className="flex-[2] bg-[#111112] text-white border-2 border-[#2a2a2b] font-bold text-xs lg:text-sm px-6 py-5 rounded-2xl hover:border-[#eab676] hover:bg-[#1a1a1b] active:scale-95 transition-all duration-300 flex flex-col items-center justify-center uppercase tracking-widest text-center"
                    >
                      Take me directly to the configurator
                      <span className="text-[9px] text-[#eab676] tracking-widest mt-1 opacity-70">(Complex Setup)</span>
                    </button>
                  </div>`;
data = data.split(btnSearch).join(btnReplace);

fs.writeFileSync(target, data);
console.log('AI Assistant Modals and Interstitial dual-routing buttons injected into MainConfigurator');
