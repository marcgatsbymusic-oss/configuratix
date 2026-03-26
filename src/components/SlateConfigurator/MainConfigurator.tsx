import { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfigurator } from './useConfigurator';
import { CONFIG_SCHEMA, WINDOW_TYPES, OPENING_TYPES, COLOR_LOCALE, GLASS_LOCALE } from './types';
import { Ruler, Layers, Check, ChevronLeft, ChevronRight, ShoppingCart, Download, HelpCircle, X } from 'lucide-react';
import { FloatingHelpMenu } from './FloatingHelpMenu';
import { ExitIntentModal } from './ExitIntentModal';
import { MaterialHelp, WindowTypeHelp } from './HelpContents';
import { BlueprintPreview } from './BlueprintPreview';
import { WindowTypeGraphic } from './WindowTypeGraphic';
import { useCartStore } from '../../store/useCartStore';
import { generateBlueprintPayload, downloadBlueprint } from '../../utils/exportConfig';

const TiltProfileCard = ({ profile, isActive, onClick, tags }: { profile: any, isActive: boolean, onClick: () => void, tags: any[] }) => {
  const { t } = useTranslation();
  const cardRef = useRef<HTMLButtonElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -12; 
    const rotateY = ((x - centerX) / centerX) * 12;
    setRotation({ x: rotateX, y: rotateY });
  };

  const handlePointerLeave = () => setRotation({ x: 0, y: 0 });

  return (
    <button
      ref={cardRef}
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="group/btn relative w-56 shrink-0 snap-start bg-transparent text-left outline-none"
      style={{ perspective: '1200px' }}
    >
      <div 
        className={`w-full h-full flex flex-col rounded-2xl border-2 transition-all duration-200 overflow-visible shadow-sm group-hover/btn:shadow-xl ${isActive ? 'border-[#eab676] ring-4 ring-[#eab676]/10 bg-[#eab676]/10/10' : 'border-[#2a2a2b] group-hover/btn:border-[#3a3a3b] bg-[#1a1a1b]'}`}
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${isActive ? 1.02 : 1})`,
          transformStyle: 'preserve-3d'
        }}
      >
        <div className="h-44 flex items-center justify-center bg-[#111112] p-4 border-b border-[#2a2a2b] relative rounded-t-xl" style={{ transformStyle: 'preserve-3d' }}>
          <img 
            src={profile.image} 
            alt={profile.name} 
            className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover/btn:scale-110" 
            style={{ 
              transform: 'translateZ(50px)', 
              filter: `drop-shadow(${rotation.y * -0.5}px ${rotation.x * 0.5 + 10}px 15px rgba(0,0,0,0.25))`
            }}
          />
          <div className="absolute top-3 left-3 flex flex-col gap-1 items-start z-10" style={{ transform: 'translateZ(30px)' }}>
            {tags.map((tag: any, i: number) => (
              <span key={i} className={`text-[9px] font-bold text-white px-2 py-0.5 rounded shadow-sm tracking-wider uppercase ${tag.color === 'emerald' ? 'bg-emerald-500' : 'bg-blue-600'}`}>
                {tag.text}
              </span>
            ))}
          </div>
        </div>
        <div className="p-4 bg-[#1a1a1b] rounded-b-xl relative z-20" style={{ transform: 'translateZ(20px)' }}>
          <div className="font-bold text-lg text-white/90">{String(t(`configurator.profiles.${profile.id}`, profile.name))}</div>
        </div>
        {isActive && (
          <div className="absolute bottom-4 right-4 w-7 h-7 bg-[#eab676] !text-black rounded-full flex items-center justify-center text-white shadow-md z-30" style={{ transform: 'translateZ(40px)' }}>
            <Check size={14} strokeWidth={4} />
          </div>
        )}
      </div>
    </button>
  );
};


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

export function MainConfigurator() {
  const { t } = useTranslation();
  const { state, dispatch, pricing } = useConfigurator();
  const { items, addItem } = useCartStore();
  const materialScrollRef = useRef<HTMLDivElement>(null);
  const profileScrollRef = useRef<HTMLDivElement>(null);
  const hasProduct = typeof window !== 'undefined' && window.location.search.includes('product=');
  const [activeStep, setActiveStep] = useState<number | null>(hasProduct ? 3 : 0);
  const [stepOrder, setStepOrder] = useState<number[]>([1,2,3,4,5,6,7,8]);
  const [completedSteps, setCompletedSteps] = useState<number[]>(hasProduct ? [1, 2] : []);
  const openStep = (step: number) => { setActiveStep(step); setStepOrder(prev => [step, ...prev.filter(s => s !== step)]); };
  const advanceStep = (current: number, next: number) => { setTimeout(() => { setActiveStep(next); setCompletedSteps(prev => Array.from(new Set([...prev, current]))); setStepOrder(prev => { const n = prev.filter(s => s !== current); n.push(current); return n; }); }, 350); };
  const [expandedHelpSection, setExpandedHelpSection] = useState<number | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [activeStep]);

  const toggleHelp = (step: number) => {
    setExpandedHelpSection(prev => prev === step ? null : step);
  };
  const [colorTab, setColorTab] = useState<'interior'|'exterior'>('interior');



  return (
    <>
      <FloatingHelpMenu />
      {showExitModal && <ExitIntentModal onClose={() => setShowExitModal(false)} onConfirmExit={() => window.location.href = '/'} />}
      <div className="min-h-screen bg-[#111112] text-white pb-20 font-sans overflow-x-hidden max-w-[100vw] w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-32 lg:pt-40 w-full overflow-hidden sm:overflow-visible">
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          
          {/* LEFT: Configure Wizard */}
          <div className={`flex flex-col gap-8 transition-all duration-700 ${activeStep === 0 ? "lg:col-span-12 max-w-4xl mx-auto w-full pt-10" : "lg:col-span-8"}`}>
            
            {/* Contextual Welcome Message */}
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
            )}
            
            {/* Step 1: Material */}
            <section className={`bg-[#1a1a1b] p-6 md:p-8 rounded-2xl shadow-sm border border-[#2a2a2b] transition-all duration-500 ${activeStep !== 1 ? "hidden opacity-0 scale-95" : "block opacity-100 scale-100"}`} style={{ order: stepOrder.indexOf(1) }}>
              <div 
                className={`flex items-center justify-between cursor-pointer ${activeStep === 1 ? 'mb-6' : ''}`}
                onClick={() => openStep(1)}
              >
                <div className="flex items-center gap-3 w-full relative">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors ${activeStep === 1 ? 'bg-[#eab676]/20 text-[#eab676]' : 'bg-[#111112] text-white/40'}`}>1</div> 
 {completedSteps.includes(1) && <Check size={20} className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" strokeWidth={3} />}
                  <h2 className={`text-xl font-bold transition-colors ${activeStep === 1 ? 'text-white/90' : 'text-white/40'}`}>{t('configurator.steps.material')}</h2>
                  <button onClick={(e) => { e.stopPropagation(); toggleHelp(1); }} className="text-white/40 hover:text-[#eab676] transition-colors ml-1" title="Toggle Help"><HelpCircle size={18} /></button>
                </div>
                {expandedHelpSection === 1 && <MaterialHelp onClose={() => setExpandedHelpSection(null)} />}
                {activeStep !== 1 && <div className="text-xs font-bold text-[#eab676] bg-[#eab676]/10 px-3 py-1.5 rounded-full uppercase tracking-wider">{state.material}</div>}
              </div>
              
              <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${activeStep === 1 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  {/* Horizontal Slider */}
                  <div className="relative group pt-2">
                    <button 
                      onClick={() => materialScrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' })}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-20 text-amber-500 hover:scale-110 transition-transform drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] bg-[#1a1a1b]/80 backdrop-blur-sm rounded-full p-1 opacity-0 group-hover:opacity-100 hidden md:block"
                    >
                      <ChevronLeft size={40} strokeWidth={2.5} />
                    </button>
                    
                    <div ref={materialScrollRef} className="flex overflow-x-auto gap-5 py-4 px-2 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                      {(Object.keys(CONFIG_SCHEMA.materials) as Array<keyof typeof CONFIG_SCHEMA.materials>).map(mat => (
                        <button
                          key={mat}
                          onClick={() => { dispatch({ type: 'SET_MATERIAL', payload: mat }); advanceStep(1, 2); }}
                          className={`group/btn relative w-56 shrink-0 snap-start rounded-2xl border-2 text-left transition-all overflow-hidden bg-[#1a1a1b] shadow-sm hover:shadow-md ${(completedSteps.includes(1) && state.material === mat) ? 'border-[#eab676] ring-4 ring-[#eab676]/10 scale-[1.02]' : 'border-[#2a2a2b] hover:border-[#3a3a3b]'}`}
                        >
                          <div className="h-48 flex items-center justify-center bg-[#111112] p-4 border-b border-[#2a2a2b] overflow-hidden">
                            <img src={CONFIG_SCHEMA.materials[mat].image} alt={mat} className="max-h-full max-w-full object-contain drop-shadow-md transition-transform duration-500 group-hover/btn:scale-110" />
                          </div>
                          <div className="p-5">
                            <div className="font-bold text-lg text-white/90">{t(`configurator.materials.${mat}`, mat)}</div>
                          </div>
                          
                          {(completedSteps.includes(1) && state.material === mat) && (
                            <div className="absolute top-3 right-3 w-7 h-7 bg-[#eab676] !text-black rounded-full flex items-center justify-center text-white shadow-md">
                              <Check size={14} strokeWidth={4} />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>

                    <button 
                      onClick={() => materialScrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' })}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-20 text-amber-500 hover:scale-110 transition-transform drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] bg-[#1a1a1b]/80 backdrop-blur-sm rounded-full p-1 opacity-0 group-hover:opacity-100 hidden md:block"
                    >
                      <ChevronRight size={40} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>
            </section>
            {/* Step 2: System Profile */}
            <section className={`bg-[#1a1a1b] p-6 md:p-8 rounded-2xl shadow-sm border border-[#2a2a2b] transition-all duration-500 ${activeStep !== 2 ? "hidden opacity-0 scale-95" : "block opacity-100 scale-100"}`} style={{ order: stepOrder.indexOf(2) }}>
              <div 
                className={`flex items-center justify-between cursor-pointer ${activeStep === 2 ? 'mb-6' : ''}`}
                onClick={() => openStep(2)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors ${activeStep === 2 ? 'bg-[#eab676]/20 text-[#eab676]' : 'bg-[#111112] text-white/40'}`}>2</div> 
 {completedSteps.includes(2) && <Check size={20} className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" strokeWidth={3} />}
                  <h2 className={`text-xl font-bold transition-colors ${activeStep === 2 ? 'text-white/90' : 'text-white/40'}`}>{t('configurator.steps.system')}</h2>
                  <button onClick={(e) => { e.stopPropagation(); toggleHelp(2); }} className="text-white/40 hover:text-[#eab676] transition-colors ml-1" title="Toggle Help"><HelpCircle size={18} /></button>
                </div>
                {state.profile && <div className="text-xs font-bold text-[#eab676] bg-[#eab676]/10 px-3 py-1.5 rounded-full uppercase tracking-wider transition-opacity">{CONFIG_SCHEMA.materials[state.material].profiles.find(p => p.id === state.profile)?.name || state.profile}</div>}
              </div>
              
              <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${activeStep === 2 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  <div className="pt-2">
                    {CONFIG_SCHEMA.materials[state.material].profiles.length === 0 ? (
                      <div className="text-sm text-white/50 font-medium italic p-5 bg-[#111112] border border-[#2a2a2b] rounded-xl text-center">No specific profiles available for this material.</div>
                    ) : (
                      <div className="relative group">
                        <button 
                          onClick={() => profileScrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' })}
                          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 text-amber-500 hover:scale-110 transition-transform drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] bg-[#1a1a1b]/80 backdrop-blur-sm rounded-full p-1 opacity-0 group-hover:opacity-100 hidden md:block"
                        >
                          <ChevronLeft size={40} strokeWidth={2.5} />
                        </button>

                        <div ref={profileScrollRef} className="flex overflow-x-auto gap-5 py-4 px-2 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                          {CONFIG_SCHEMA.materials[state.material].profiles.map(profile => (
                            <TiltProfileCard 
                              key={profile.id} 
                              profile={profile} 
                              tags={profile.tags}
                              isActive={completedSteps.includes(2) && state.profile === profile.id}
                              onClick={() => { dispatch({ type: 'SET_PROFILE', payload: profile.id }); advanceStep(2, 3); }}
                            />
                          ))}
                        </div>

                        <button 
                          onClick={() => profileScrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' })}
                          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 text-amber-500 hover:scale-110 transition-transform drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] bg-[#1a1a1b]/80 backdrop-blur-sm rounded-full p-1 opacity-0 group-hover:opacity-100 hidden md:block"
                        >
                          <ChevronRight size={40} strokeWidth={2.5} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

        {/* Step 3: Window Type (Fenstertyp) */}
            <section className={`bg-[#1a1a1b] p-6 md:p-8 rounded-2xl shadow-sm border border-[#2a2a2b] transition-all duration-500 ${activeStep !== 3 ? "hidden opacity-0 scale-95" : "block opacity-100 scale-100"}`} style={{ order: stepOrder.indexOf(3) }}>
              <div 
                className={`flex items-center justify-between cursor-pointer ${activeStep === 3 ? 'mb-6' : ''}`}
                onClick={() => openStep(3)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors ${activeStep === 3 ? 'bg-[#eab676]/20 text-[#eab676]' : 'bg-[#111112] text-white/40'}`}>3</div> 
 {completedSteps.includes(3) && <Check size={20} className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" strokeWidth={3} />}
                  <h2 className={`text-xl font-bold transition-colors ${activeStep === 3 ? 'text-white/90' : 'text-white/40'}`}>{t('configurator.steps.windowType')}</h2>
                  <button onClick={(e) => { e.stopPropagation(); toggleHelp(3); }} className="text-white/40 hover:text-[#eab676] transition-colors ml-1" title="Toggle Help"><HelpCircle size={18} /></button>
                </div>
                {expandedHelpSection === 3 && <WindowTypeHelp onClose={() => setExpandedHelpSection(null)} />}
                {activeStep !== 3 && <div className="text-xs font-bold text-[#eab676] bg-[#eab676]/10 px-3 py-1.5 rounded-full uppercase tracking-wider">{t(`configurator.windowTypes.${state.windowTypeId}`, WINDOW_TYPES.find(w => w.id === state.windowTypeId)?.name || state.windowTypeId)}</div>}
              </div>
              
              <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${activeStep === 3 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {WINDOW_TYPES.map(wt => (
                      <button
                        key={wt.id}
                        onClick={() => { dispatch({ type: 'SET_WINDOW_TYPE', payload: wt.id }); advanceStep(3, 4); }}
                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-between gap-3 min-h-[140px] ${state.windowTypeId === wt.id ? 'border-[#eab676] bg-[#eab676]/10 text-[#eab676] shadow-md ring-4 ring-[#eab676]/10' : 'border-[#2a2a2b] hover:border-[#3a3a3b] shadow-sm hover:shadow-md group bg-[#1a1a1b]'}`}
                      >
                        <div className="w-full h-20 flex items-center justify-center relative p-2">
                          <WindowTypeGraphic 
                            id={wt.id} 
                            className={`transition-all duration-300 ${state.windowTypeId === wt.id ? 'text-[#eab676] scale-110 drop-shadow-md opacity-100' : 'text-white/40 group-hover:text-white/50 group-hover:scale-105 opacity-80 group-hover:opacity-100 drop-shadow-sm'}`}
                          />
                        </div>
                        <div className="font-bold text-xs text-center leading-tight whitespace-pre-wrap">{t(`configurator.windowTypes.${wt.id}`, wt.name)}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Step 4: Opening Types (Öffnungsart) */}
            <section className={`bg-[#1a1a1b] p-6 md:p-8 rounded-2xl shadow-sm border border-[#2a2a2b] transition-all duration-500 ${activeStep !== 4 ? "hidden opacity-0 scale-95" : "block opacity-100 scale-100"}`} style={{ order: stepOrder.indexOf(4) }}>
              <div 
                className={`flex items-center justify-between cursor-pointer ${activeStep === 4 ? 'mb-6' : ''}`}
                onClick={() => openStep(4)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors ${activeStep === 4 ? 'bg-[#eab676]/20 text-[#eab676]' : 'bg-[#111112] text-white/40'}`}>4</div> 
 {completedSteps.includes(4) && <Check size={20} className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" strokeWidth={3} />}
                  <h2 className={`text-xl font-bold transition-colors ${activeStep === 4 ? 'text-white/90' : 'text-white/40'}`}>{t('configurator.steps.openingType')}</h2>
                  <img src={WINDOW_TYPES.find(w => w.id === state.windowTypeId)?.imgUrl} alt="Active Layout" className="w-14 h-14 object-contain ml-auto border border-white/10 rounded-lg p-1 bg-black/40 drop-shadow-md hidden sm:block" />
                </div>
                {activeStep !== 4 && <div className="text-xs font-bold text-[#eab676] bg-[#eab676]/10 px-3 py-1.5 rounded-full uppercase tracking-wider">{t('configurator.state.sashes', { count: state.sashOpenings.length })}</div>}
              </div>
              
              <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${activeStep === 4 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  <div className="pt-2 space-y-6">
                    {(WINDOW_TYPES.find(w => w.id === state.windowTypeId)?.sashes || 1) > 1 && (
                      <div className="text-xs font-bold text-white/50 uppercase tracking-widest px-1">Configure each sash independently (Left to Right):</div>
                    )}
                    
                    <div className="grid gap-6">
                      {Array.from({ length: WINDOW_TYPES.find(w => w.id === state.windowTypeId)?.sashes || 1 }).map((_, sashIndex) => (
                        <div key={sashIndex} className="bg-[#111112] rounded-xl p-4 border border-[#2a2a2b]">
                          <div className="text-sm font-bold text-white/80 mb-3 flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-[#eab676]/20 text-[#eab676] flex items-center justify-center text-xs">{sashIndex + 1}</span>
                            Sash {sashIndex + 1}
                          </div>
                          <div className="flex flex-wrap gap-3">
                            {OPENING_TYPES.map(ot => (<button
                                key={ot.id}
                                onClick={() => { dispatch({ type: 'SET_SASH_OPENING', payload: { index: sashIndex, openingId: ot.shortCode } }); const count = WINDOW_TYPES.find(w => w.id === state.windowTypeId)?.sashes || 1; if (sashIndex === count - 1) { advanceStep(4, 5); } }}
                                className={`group flex flex-col items-center justify-center gap-3 p-3 w-32 rounded-xl border-2 transition-all ${(completedSteps.includes(4) && state.sashOpenings[sashIndex] === ot.shortCode) ? 'border-[#eab676] bg-[#eab676]/10 text-[#eab676] shadow-md shadow-[#eab676]/5 ring-1 ring-[#eab676]/50' : 'border-[#2a2a2b] bg-[#1a1a1b] text-white/50 hover:border-[#3a3a3b] hover:text-white/80'}`}
                              >
                                <SashSymbol shortCode={ot.shortCode} className={`w-10 h-10 transition-colors ${(completedSteps.includes(4) && state.sashOpenings[sashIndex] === ot.shortCode) ? 'text-[#eab676]' : 'text-white/20 group-hover:text-white/40'}`} />
                                <span className="text-[10px] sm:text-[11px] font-bold text-center leading-tight">
                                  {t(`configurator.openingTypes.${ot.shortCode}`, ot.name)}
                                </span>
                              </button>))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 flex justify-end">
                      <button 
                        onClick={() => advanceStep(4, 5)}
                        className="px-6 py-3 bg-[#eab676] !text-black hover:bg-[#F3C47F] text-white font-bold rounded-xl shadow-lg shadow-[#eab676]/20 transition-all active:scale-95 text-sm uppercase tracking-wider"
                      >
                        {t('configurator.steps.color')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Step 5: Color & Decor */}
            <section className={`bg-[#1a1a1b] p-6 md:p-8 rounded-2xl shadow-sm border border-[#2a2a2b] transition-all duration-500 ${activeStep !== 5 ? "hidden opacity-0 scale-95" : "block opacity-100 scale-100"}`} style={{ order: stepOrder.indexOf(5) }}>
              <div 
                className={`flex items-center justify-between cursor-pointer ${activeStep === 5 ? 'mb-6' : ''}`}
                onClick={() => openStep(5)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors ${activeStep === 5 ? 'bg-[#eab676]/20 text-[#eab676]' : 'bg-[#111112] text-white/40'}`}>5</div> 
 {completedSteps.includes(5) && <Check size={20} className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" strokeWidth={3} />}
                  <h2 className={`text-xl font-bold transition-colors ${activeStep === 5 ? 'text-white/90' : 'text-white/40'}`}>{t('configurator.steps.color')}</h2>
                  <button onClick={(e) => { e.stopPropagation(); toggleHelp(5); }} className="text-white/40 hover:text-[#eab676] transition-colors ml-1" title="Toggle Help"><HelpCircle size={18} /></button>
                </div>
                {activeStep !== 5 && <div className="text-[10px] font-bold text-[#eab676] bg-[#eab676]/10 px-3 py-1.5 rounded-full uppercase tracking-wider">In: {COLOR_LOCALE.colors[state.interiorColor]?.name} | Ex: {COLOR_LOCALE.colors[state.exteriorColor]?.name}</div>}
              </div>
              
              <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${activeStep === 5 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  <div className="pt-2">

                    {/* Dual Color Tabs */}
                    <div className="flex gap-2 w-full mb-6 p-1 bg-[#111112] rounded-xl">
                      <button 
                        onClick={() => setColorTab('interior')} 
                        className={`flex-1 py-3 text-sm tracking-widest uppercase font-bold rounded-lg transition-all shadow-sm ${colorTab === 'interior' ? 'bg-[#1a1a1b] text-[#eab676] ring-1 ring-slate-200' : 'text-white/50 hover:text-white/80 hover:bg-[#2a2a2b]'}`}
                      >
                        Interior Color
                      </button>
                      <button 
                        onClick={() => setColorTab('exterior')} 
                        className={`flex-1 py-3 text-sm tracking-widest uppercase font-bold rounded-lg transition-all shadow-sm ${colorTab === 'exterior' ? 'bg-[#1a1a1b] text-[#eab676] ring-1 ring-slate-200' : 'text-white/50 hover:text-white/80 hover:bg-[#2a2a2b]'}`}
                      >
                        Exterior Color
                      </button>
                    </div>

                    {/* Color Group Selector */}
                    <div className="flex flex-wrap gap-2 mb-6 p-1 bg-[#111112] border border-[#2a2a2b] rounded-xl inline-flex w-full md:w-auto">
                      {(Object.keys(COLOR_LOCALE.colorGroups) as Array<string>).map(grp => {
                        const activeGrp = colorTab === 'interior' ? state.interiorColorGroup : state.exteriorColorGroup;
                        return (
                          <button
                            key={grp}
                            onClick={() => {
                              dispatch({ type: colorTab === 'interior' ? 'SET_INTERIOR_COLOR_GROUP' : 'SET_EXTERIOR_COLOR_GROUP', payload: grp });
                            }}
                            className={`flex-1 md:flex-none px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${activeGrp === grp ? 'bg-[#1a1a1b] text-[#eab676] shadow shadow-[#eab676]/10' : 'text-white/50 hover:text-white/80 hover:bg-[#111112]'}`}
                          >
                            {COLOR_LOCALE.colorGroups[grp]}
                          </button>
                        );
                      })}
                    </div>

                    {/* Color Grid */}
                    <div className="flex flex-wrap gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar p-2">
                      {Object.keys(COLOR_LOCALE.colors)
                        .filter(colorId => COLOR_LOCALE.colors[colorId].group === COLOR_LOCALE.colorGroups[colorTab === 'interior' ? state.interiorColorGroup : state.exteriorColorGroup])
                        .map(colorId => {
                          const colorData = COLOR_LOCALE.colors[colorId];
                          const isActive = completedSteps.includes(5) && (colorTab === 'interior' ? state.interiorColor === colorId : state.exteriorColor === colorId);
                          return (
                            <button
                              key={colorId}
                              onClick={() => { 
                                dispatch({ type: colorTab === 'interior' ? 'SET_INTERIOR_COLOR' : 'SET_EXTERIOR_COLOR', payload: colorId }); 
                                if (colorTab === 'interior') {
                                    setTimeout(() => setColorTab('exterior'), 150);
                                } else {
                                    advanceStep(5, 6); 
                                }
                              }}
                              className={`relative group w-12 h-12 transition-all duration-200 outline outline-offset-2 ${
                                isActive ? 'outline-[#eab676] scale-105 z-10' : 'outline-transparent hover:outline-white/30'
                              }`}
                              title={colorData.name}
                            >
                              <div 
                                className="w-full h-full border border-white/10 bg-cover bg-center"
                                style={{ backgroundImage: colorData.swatch }}
                              />
                              {/* Tooltip on hover */}
                              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-[#1a1a1b] border border-[#2a2a2b] text-white/90 text-[10px] uppercase font-semibold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-lg shadow-black/50">
                                {colorData.name}
                              </span>
                            </button>
                          );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Step 6: Dimensions */}
            <section className={`bg-[#1a1a1b] p-6 md:p-8 rounded-2xl shadow-sm border border-[#2a2a2b] transition-all duration-500 ${activeStep !== 6 ? "hidden opacity-0 scale-95" : "block opacity-100 scale-100"}`} style={{ order: stepOrder.indexOf(6) }}>
              <div 
                className={`flex items-center justify-between cursor-pointer ${activeStep === 6 ? 'mb-6' : ''}`}
                onClick={() => openStep(6)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors ${activeStep === 6 ? 'bg-[#eab676]/20 text-[#eab676]' : 'bg-[#111112] text-white/40'}`}>6</div> 
 {completedSteps.includes(6) && <Check size={20} className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" strokeWidth={3} />}
                  <h2 className={`text-xl font-bold transition-colors ${activeStep === 6 ? 'text-white/90' : 'text-white/40'}`}>{t('configurator.steps.dimensions')}</h2>
                  <button onClick={(e) => { e.stopPropagation(); toggleHelp(6); }} className="text-white/40 hover:text-[#eab676] transition-colors ml-1" title="Toggle Help"><HelpCircle size={18} /></button>
                </div>
                {activeStep !== 6 && <div className="text-xs font-bold text-[#eab676] bg-[#eab676]/10 px-3 py-1.5 rounded-full uppercase tracking-wider">{state.dimensions.width} x {state.dimensions.height}</div>}
              </div>
              
              <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${activeStep === 6 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  <div className="pt-2 grid md:grid-cols-2 gap-8">
                    {/* Width Control */}
                    <div className="bg-[#111112] p-5 rounded-xl border border-[#2a2a2b]">
                      <div className="flex justify-between items-start mb-4">
                        <label className="text-sm font-bold text-white/80 flex items-center gap-2 uppercase tracking-widest leading-none">
                          <Ruler size={16} className="text-[#eab676]"/> {t('configurator.inputs.w')}
                        </label>
                        <div className="flex flex-col items-end gap-0.5">
                          <div className="flex items-center gap-1.5 focus-within:ring-2 ring-[#eab676]/30 rounded px-1 -mr-1 transition-all">
                            <input
                              type="number"
                              value={state.dimensions.width || ''}
                              onChange={(e) => dispatch({ type: 'SET_DIMENSIONS', payload: { width: Number(e.target.value) || 0, height: state.dimensions.height }})}
                              onBlur={(e) => {
                                let val = Number(e.target.value) || CONFIG_SCHEMA.materials[state.material].minWidth;
                                val = Math.max(CONFIG_SCHEMA.materials[state.material].minWidth, Math.min(CONFIG_SCHEMA.materials[state.material].maxWidth, val));
                                dispatch({ type: 'SET_DIMENSIONS', payload: { width: val, height: state.dimensions.height }});
                              }}
                              className="w-[60px] bg-transparent text-right font-black text-[#eab676] focus:outline-none"
                            />
                            <span className="text-xs font-bold text-[#eab676]/70">{t('configurator.inputs.mm')}</span>
                          </div>
                          <span className="text-[10px] font-bold text-white/40 tracking-wider">({(state.dimensions.width / 10).toFixed(0)} {t('configurator.inputs.cm')}</span>
                        </div>
                      </div>
                      
                      <input
                        type="range"
                        min={CONFIG_SCHEMA.materials[state.material].minWidth}
                        max={CONFIG_SCHEMA.materials[state.material].maxWidth}
                        step="10"
                        value={state.dimensions.width}
                        onChange={(e) => dispatch({ type: 'SET_DIMENSIONS', payload: { width: Number(e.target.value) } })}
                        className="w-full accent-indigo-600 mb-2 cursor-pointer"
                      />
                      <div className="flex justify-between items-center text-[10px] font-bold text-white/30">
                        <span>{CONFIG_SCHEMA.materials[state.material].minWidth}</span>
                        <span>{CONFIG_SCHEMA.materials[state.material].maxWidth}</span>
                      </div>
                    </div>

                    {/* Height Control */}
                    <div className="bg-[#111112] p-5 rounded-xl border border-[#2a2a2b]">
                      <div className="flex justify-between items-start mb-4">
                        <label className="text-sm font-bold text-white/80 flex items-center gap-2 uppercase tracking-widest leading-none">
                          <Ruler size={16} className="rotate-90 text-[#eab676]"/> {t('configurator.inputs.h')}
                        </label>
                        <div className="flex flex-col items-end gap-0.5">
                          <div className="flex items-center gap-1.5 focus-within:ring-2 ring-[#eab676]/30 rounded px-1 -mr-1 transition-all">
                            <input
                              type="number"
                              value={state.dimensions.height || ''}
                              onChange={(e) => dispatch({ type: 'SET_DIMENSIONS', payload: { width: state.dimensions.width, height: Number(e.target.value) || 0 }})}
                              onBlur={(e) => {
                                let val = Number(e.target.value) || CONFIG_SCHEMA.materials[state.material].minHeight;
                                val = Math.max(CONFIG_SCHEMA.materials[state.material].minHeight, Math.min(CONFIG_SCHEMA.materials[state.material].maxHeight, val));
                                dispatch({ type: 'SET_DIMENSIONS', payload: { width: state.dimensions.width, height: val }});
                              }}
                              className="w-[60px] bg-transparent text-right font-black text-[#eab676] focus:outline-none"
                            />
                            <span className="text-xs font-bold text-[#eab676]/70">{t('configurator.inputs.mm')}</span>
                          </div>
                          <span className="text-[10px] font-bold text-white/40 tracking-wider">({(state.dimensions.height / 10).toFixed(0)} {t('configurator.inputs.cm')}</span>
                        </div>
                      </div>
                      
                      <input
                        type="range"
                        min={CONFIG_SCHEMA.materials[state.material].minHeight}
                        max={CONFIG_SCHEMA.materials[state.material].maxHeight}
                        step="10"
                        value={state.dimensions.height}
                        onChange={(e) => dispatch({ type: 'SET_DIMENSIONS', payload: { height: Number(e.target.value) } })}
                        className="w-full accent-indigo-600 mb-2 cursor-pointer"
                      />
                      <div className="flex justify-between items-center text-[10px] font-bold text-white/30">
                        <span>{CONFIG_SCHEMA.materials[state.material].minHeight}</span>
                        <span>{CONFIG_SCHEMA.materials[state.material].maxHeight}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 flex justify-end">
                    <button 
                      onClick={() => advanceStep(6, 7)}
                      className="px-6 py-3 bg-[#eab676] !text-black hover:bg-[#F3C47F] text-white font-bold rounded-xl shadow-lg shadow-[#eab676]/20 transition-all active:scale-95 text-sm uppercase tracking-wider"
                    >
                      {t('configurator.steps.glazing')}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Step 7: Glazing Package */}
            <section className={`bg-[#1a1a1b] p-6 md:p-8 rounded-2xl shadow-sm border border-[#2a2a2b] transition-all duration-500 ${activeStep !== 7 ? "hidden opacity-0 scale-95" : "block opacity-100 scale-100"}`} style={{ order: stepOrder.indexOf(7) }}>
              <div 
                className={`flex items-center justify-between cursor-pointer ${activeStep === 7 ? 'mb-6' : ''}`}
                onClick={() => openStep(7)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors ${activeStep === 7 ? 'bg-[#eab676]/20 text-[#eab676]' : 'bg-[#111112] text-white/40'}`}>7</div> 
 {completedSteps.includes(7) && <Check size={20} className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" strokeWidth={3} />}
                  <h2 className={`text-xl font-bold transition-colors ${activeStep === 7 ? 'text-white/90' : 'text-white/40'}`}>{t('configurator.steps.glazing')}</h2>
                  <button onClick={(e) => { e.stopPropagation(); toggleHelp(7); }} className="text-white/40 hover:text-[#eab676] transition-colors ml-1" title="Toggle Help"><HelpCircle size={18} /></button>
                </div>
                {activeStep !== 7 && <div className="text-xs font-bold text-[#eab676] bg-[#eab676]/10 px-3 py-1.5 rounded-full uppercase tracking-wider">{GLASS_LOCALE[state.glazing] || state.glazing}</div>}
              </div>

              <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${activeStep === 7 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {CONFIG_SCHEMA.glazing.map(gl => (
                      <button
                        key={gl.id}
                        onClick={() => { dispatch({ type: 'SET_GLAZING', payload: gl.id }); advanceStep(7, 8); }}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${state.glazing === gl.id ? 'border-[#eab676] bg-[#eab676]/10 ring-4 ring-[#eab676]/10' : 'border-[#2a2a2b] hover:border-[#3a3a3b] shadow-sm hover:shadow-md'}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-bold text-sm text-white/90">{GLASS_LOCALE[gl.id] || gl.id}</div>
                          <Layers size={18} className={state.glazing === gl.id ? 'text-[#eab676]' : 'text-white/30'}/>
                        </div>
                        <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Base Cost x {gl.priceMod}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Step 8: Accessories & Add-ons */}
            <section className={`bg-[#1a1a1b] p-6 md:p-8 rounded-2xl shadow-sm border border-[#2a2a2b] transition-all duration-500 ${activeStep !== 8 ? "hidden opacity-0 scale-95" : "block opacity-100 scale-100"}`} style={{ order: stepOrder.indexOf(8) }}>
              <div 
                className={`flex items-center justify-between cursor-pointer ${activeStep === 8 ? 'mb-6' : ''}`}
                onClick={() => openStep(8)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors ${activeStep === 8 ? 'bg-[#eab676]/20 text-[#eab676]' : 'bg-[#111112] text-white/40'}`}>8</div> 
                  {completedSteps.includes(8) && <Check size={20} className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" strokeWidth={3} />}
                  <h2 className={`text-xl font-bold transition-colors ${activeStep === 8 ? 'text-white/90' : 'text-white/40'}`}>{t('configurator.steps.options')}</h2>
                </div>
                {activeStep === 8 ? (
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setActiveStep(-1); 
                      // Mark as completed even if no addons selected so it visually resolves
                      setCompletedSteps(prev => Array.from(new Set([...prev, 8]))); 
                      // Bump step order to bottom
                      setStepOrder(prev => { const n = prev.filter(s => s !== 8); n.push(8); return n; });
                    }}
                    className="p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-all transform hover:scale-110 active:scale-95"
                    title="Close"
                  >
                    <X size={22} strokeWidth={2.5} />
                  </button>
                ) : (
                  state.addons.length > 0 && <div className="text-xs font-bold text-[#eab676] bg-[#eab676]/10 px-3 py-1.5 rounded-full uppercase tracking-wider">{state.addons.length} selected</div>
                )}
              </div>

              <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${activeStep === 8 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  <div className="pt-2 grid gap-3">
                    {CONFIG_SCHEMA.addons.map(addon => {
                      const isActive = state.addons.includes(addon.id);
                      return (
                        <button
                          key={addon.id}
                          onClick={() => dispatch({ type: 'TOGGLE_ADDON', payload: addon.id })}
                          className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all ${isActive ? 'border-[#eab676] bg-[#eab676]/10' : 'border-[#2a2a2b] hover:border-[#3a3a3b] shadow-sm hover:shadow-md'}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${isActive ? 'bg-[#eab676] !text-black border-[#eab676] text-white' : 'border-[#3a3a3b] bg-[#1a1a1b]'}`}>
                              {isActive && <Check size={14} strokeWidth={4}/>}
                            </div>
                            <span className="font-bold text-white/80">{addon.name}</span>
                          </div>
                          <span className="text-sm font-black text-[#eab676]">+€{addon.price}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

          </div>

          {/* RIGHT: Sticky Summary */}
          <div className={`lg:col-span-4 sticky top-10 transition-all duration-700 ${activeStep === 0 ? "hidden" : completedSteps.length === 0 ? "opacity-0 translate-x-10 pointer-events-none hidden lg:block" : "opacity-100 translate-x-0"}`}>
            
            {/* Glassmorphism Summary Card */}
            <div className="bg-[#1a1a1b]/70 backdrop-blur-xl border border-white/60 shadow-2xl shadow-indigo-900/5 rounded-3xl overflow-hidden">
              
              {/* Dynamic SVG Fensternorm-Style Blueprint Area */}
              <div className="bg-[#1a1a1b] w-full aspect-square flex items-center justify-center relative border-b border-[#eab676]/20 overflow-hidden">
                <BlueprintPreview state={state} />
              </div>

              {/* Data Breakdown */}
              <div className="p-8 space-y-6">
                
                <div>
                  <h3 className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-4">{t('configurator.summary.title')}</h3>
                  <div className="space-y-1 text-sm">
                    {/* Input-Driven Dimensions Row */}
                    <div className="py-3 px-3 mb-3 -mx-2 bg-[#111112] border border-[#eab676]/20 rounded-xl shadow-inner">
                      <div className="flex justify-between mb-3 border-b border-[#eab676]/20 pb-2">
                        <span className="text-white/50 font-bold text-xs uppercase tracking-wider flex items-center gap-2">{t('configurator.summary.dimensions')}</span>
                        <button onClick={() => openStep(6)} className="text-[10px] font-black uppercase tracking-widest text-[#eab676] hover:text-[#eab676]">{t('configurator.summary.edit')}</button>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 flex flex-col items-center">
                          <div className="flex items-center justify-between w-full bg-[#1a1a1b] border border-[#2a2a2b] focus-within:border-[#eab676] focus-within:ring-2 ring-[#eab676]/20 rounded px-2 py-1 transition-all">
                            <span className="text-[10px] font-bold text-white/40">W</span>
                            <div className="flex items-center gap-1 w-full justify-end">
                              <input 
                                type="number"
                                value={state.dimensions.width || ''}
                                onChange={(e) => dispatch({ type: 'SET_DIMENSIONS', payload: { width: Number(e.target.value) || 0, height: state.dimensions.height }})}
                                onBlur={(e) => {
                                  let val = Number(e.target.value) || CONFIG_SCHEMA.materials[state.material].minWidth;
                                  val = Math.max(CONFIG_SCHEMA.materials[state.material].minWidth, Math.min(CONFIG_SCHEMA.materials[state.material].maxWidth, val));
                                  dispatch({ type: 'SET_DIMENSIONS', payload: { width: val, height: state.dimensions.height }});
                                }}
                                className="w-[55px] text-right bg-transparent text-sm font-black text-white/90 focus:outline-none"
                              />
                              <span className="text-[10px] font-bold text-white/40">{t('configurator.inputs.mm')}</span>
                            </div>
                          </div>
                          <span className="text-[9px] font-bold text-white/40 mt-1 uppercase tracking-widest">({(state.dimensions.width / 10).toFixed(0)} {t('configurator.inputs.cm')}</span>
                        </div>

                        <span className="text-white/30 font-black text-xs">×</span>

                        <div className="flex-1 flex flex-col items-center">
                          <div className="flex items-center justify-between w-full bg-[#1a1a1b] border border-[#2a2a2b] focus-within:border-[#eab676] focus-within:ring-2 ring-[#eab676]/20 rounded px-2 py-1 transition-all">
                            <span className="text-[10px] font-bold text-white/40">H</span>
                            <div className="flex items-center gap-1 w-full justify-end">
                              <input 
                                type="number"
                                value={state.dimensions.height || ''}
                                onChange={(e) => dispatch({ type: 'SET_DIMENSIONS', payload: { width: state.dimensions.width, height: Number(e.target.value) || 0 }})}
                                onBlur={(e) => {
                                  let val = Number(e.target.value) || CONFIG_SCHEMA.materials[state.material].minHeight;
                                  val = Math.max(CONFIG_SCHEMA.materials[state.material].minHeight, Math.min(CONFIG_SCHEMA.materials[state.material].maxHeight, val));
                                  dispatch({ type: 'SET_DIMENSIONS', payload: { width: state.dimensions.width, height: val }});
                                }}
                                className="w-[55px] text-right bg-transparent text-sm font-black text-white/90 focus:outline-none"
                              />
                              <span className="text-[10px] font-bold text-white/40">{t('configurator.inputs.mm')}</span>
                            </div>
                          </div>
                          <span className="text-[9px] font-bold text-white/40 mt-1 uppercase tracking-widest">({(state.dimensions.height / 10).toFixed(0)} {t('configurator.inputs.cm')}</span>
                        </div>
                      </div>
                    </div>

                    <button onClick={() => openStep(1)} className="flex w-full text-left justify-between items-center group py-2 -mx-2 px-2 rounded-lg hover:bg-[#111112] transition-colors">
                      <div className="flex items-center gap-2.5"><span className="w-5 h-5 rounded-md inline-flex items-center justify-center bg-[#2a2a2b] border border-white/5 shadow-inner text-[10px] font-black text-white/50 group-hover:bg-[#eab676] group-hover:text-black group-hover:border-[#eab676] transition-all duration-300 drop-shadow-sm">1</span><span className="text-white/50 group-hover:text-[#eab676] font-medium text-xs uppercase tracking-wider transition-colors">{t('configurator.summary.material')}</span></div> 
                      <span className="font-bold text-white group-hover:text-[#eab676] transition-colors">{completedSteps.includes(1) ? state.material : '---'}</span>
                    </button>
                    <button onClick={() => openStep(2)} className="flex w-full text-left justify-between items-center group py-2 -mx-2 px-2 rounded-lg hover:bg-[#111112] transition-colors">
                      <div className="flex items-center gap-2.5"><span className="w-5 h-5 rounded-md inline-flex items-center justify-center bg-[#2a2a2b] border border-white/5 shadow-inner text-[10px] font-black text-white/50 group-hover:bg-[#eab676] group-hover:text-black group-hover:border-[#eab676] transition-all duration-300 drop-shadow-sm">2</span><span className="text-white/50 group-hover:text-[#eab676] font-medium text-xs uppercase tracking-wider transition-colors">{t('configurator.summary.system')}</span></div> 
                      <span className="font-bold text-white group-hover:text-[#eab676] transition-colors truncate max-w-[150px] text-right">{completedSteps.includes(2) && state.profile ? (CONFIG_SCHEMA.materials[state.material].profiles.find(p => p.id === state.profile)?.name || state.profile) : '---'}</span>
                    </button>
                    <button onClick={() => openStep(3)} className="flex w-full text-left justify-between items-center group py-2 -mx-2 px-2 rounded-lg hover:bg-[#111112] transition-colors">
                      <div className="flex items-center gap-2.5"><span className="w-5 h-5 rounded-md inline-flex items-center justify-center bg-[#2a2a2b] border border-white/5 shadow-inner text-[10px] font-black text-white/50 group-hover:bg-[#eab676] group-hover:text-black group-hover:border-[#eab676] transition-all duration-300 drop-shadow-sm">3</span><span className="text-white/50 group-hover:text-[#eab676] font-medium text-xs uppercase tracking-wider transition-colors">{t('configurator.summary.windowType')}</span></div> 
                      <span className="font-bold text-white group-hover:text-[#eab676] transition-colors">{completedSteps.includes(3) ? t(`configurator.windowTypes.${state.windowTypeId}`, WINDOW_TYPES.find(w => w.id === state.windowTypeId)?.name || state.windowTypeId) : '---'}</span>
                    </button>
                    <button onClick={() => openStep(4)} className="flex w-full text-left justify-between items-center group py-2 -mx-2 px-2 rounded-lg hover:bg-[#111112] transition-colors">
                      <div className="flex items-center gap-2.5"><span className="w-5 h-5 rounded-md inline-flex items-center justify-center bg-[#2a2a2b] border border-white/5 shadow-inner text-[10px] font-black text-white/50 group-hover:bg-[#eab676] group-hover:text-black group-hover:border-[#eab676] transition-all duration-300 drop-shadow-sm">4</span><span className="text-white/50 group-hover:text-[#eab676] font-medium text-xs uppercase tracking-wider transition-colors">{t('configurator.steps.openingType')}</span></div> 
                      <span className="font-bold text-white group-hover:text-[#eab676] transition-colors truncate max-w-[120px] text-right">
                        {completedSteps.includes(4) ? state.sashOpenings.map(s => t(`configurator.openingTypes.${OPENING_TYPES.find(o => o.shortCode === s)?.name || s}`, OPENING_TYPES.find(o => o.shortCode === s)?.name || s)).join(', ') : '---'}
                      </span>
                    </button>
                    <button onClick={() => { openStep(5); setColorTab('interior'); }} className="flex w-full text-left justify-between items-center group py-2 -mx-2 px-2 rounded-lg hover:bg-[#111112] transition-colors">
                      <div className="flex items-center gap-2.5"><span className="w-5 h-5 rounded-md inline-flex items-center justify-center bg-[#2a2a2b] border border-white/5 shadow-inner text-[10px] font-black text-white/50 group-hover:bg-[#eab676] group-hover:text-black group-hover:border-[#eab676] transition-all duration-300 drop-shadow-sm">5</span><span className="text-white/50 group-hover:text-[#eab676] font-medium text-xs uppercase tracking-wider transition-colors">Interior Color</span></div> 
                      <span className="font-bold text-white group-hover:text-[#eab676] transition-colors line-clamp-1">{completedSteps.includes(5) ? (COLOR_LOCALE.colors[state.interiorColor]?.name || state.interiorColor) : '---'}</span>
                    </button>
                    <button onClick={() => { openStep(5); setColorTab('exterior'); }} className="flex w-full text-left justify-between items-center group py-2 -mx-2 px-2 rounded-lg hover:bg-[#111112] transition-colors">
                      <div className="flex items-center gap-2.5"><span className="w-5 h-5 rounded-md inline-flex items-center justify-center bg-[#2a2a2b] border border-white/5 shadow-inner text-[10px] font-black text-white/50 group-hover:bg-[#eab676] group-hover:text-black group-hover:border-[#eab676] transition-all duration-300 drop-shadow-sm">5</span><span className="text-white/50 group-hover:text-[#eab676] font-medium text-xs uppercase tracking-wider transition-colors">Exterior Color</span></div> 
                      <span className="font-bold text-white group-hover:text-[#eab676] transition-colors line-clamp-1">{completedSteps.includes(5) ? (COLOR_LOCALE.colors[state.exteriorColor]?.name || state.exteriorColor) : '---'}</span>
                    </button>
                    <button onClick={() => openStep(7)} className="flex w-full text-left justify-between items-center group py-2 -mx-2 px-2 rounded-lg hover:bg-[#111112] transition-colors">
                      <div className="flex items-center gap-2.5"><span className="w-5 h-5 rounded-md inline-flex items-center justify-center bg-[#2a2a2b] border border-white/5 shadow-inner text-[10px] font-black text-white/50 group-hover:bg-[#eab676] group-hover:text-black group-hover:border-[#eab676] transition-all duration-300 drop-shadow-sm">7</span><span className="text-white/50 group-hover:text-[#eab676] font-medium text-xs uppercase tracking-wider transition-colors">{t('configurator.summary.glazing')}</span></div> 
                      <span className="font-bold text-[#eab676] group-hover:text-white bg-[#eab676]/10 group-hover:bg-[#eab676] !text-black px-2 py-0.5 rounded transition-colors truncate max-w-[150px] text-right">{GLASS_LOCALE[state.glazing] || state.glazing}</span>
                    </button>
                    {state.addons.length > 0 && (
                      <button onClick={() => openStep(8)} className="flex w-full text-left justify-between items-center group py-2 -mx-2 px-2 rounded-lg hover:bg-[#111112] transition-colors">
                        <div className="flex items-center gap-2.5"><span className="w-5 h-5 rounded-md inline-flex items-center justify-center bg-[#2a2a2b] border border-white/5 shadow-inner text-[10px] font-black text-white/50 group-hover:bg-[#eab676] group-hover:text-black group-hover:border-[#eab676] transition-all duration-300 drop-shadow-sm">8</span><span className="text-white/50 group-hover:text-[#eab676] font-medium text-xs uppercase tracking-wider transition-colors">Integrations</span></div> 
                        <span className="font-bold text-white group-hover:text-[#eab676] transition-colors">{state.addons.length} elements</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

                <div>
                  <h3 className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-4">{t('configurator.summary.financials')}</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center"><span className="text-white/50 font-medium">{t('configurator.summary.baseFramework')}</span> <span className="font-bold text-white">€{pricing.base.toFixed(2)}</span></div>
                    <div className="flex justify-between items-center"><span className="text-white/50 font-medium">{t('configurator.summary.hardwareAssembly')}</span> <span className="font-bold text-white">€{pricing.hardware.toFixed(2)}</span></div>
                    <div className="flex justify-between items-center"><span className="text-white/50 font-medium">{t('configurator.summary.accessories')}</span> <span className="font-bold text-white">€{pricing.addons.toFixed(2)}</span></div>
                  </div>
                </div>

                <div className="pt-4 flex items-end justify-between">
                  <div>
                    <div className="text-[10px] font-black text-[#eab676] uppercase tracking-[0.2em] mb-1">{t('configurator.summary.totalSystem')}</div>
                    <div className="text-4xl font-black text-white tracking-tighter">€{pricing.total.toFixed(2)}</div>
                  </div>
                </div>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={() => {
                      const payload = generateBlueprintPayload(state, pricing);
                      downloadBlueprint(payload, `drutex-blueprint-${Date.now()}.json`);
                    }}
                    className="flex-1 bg-[#1a1a1b] hover:bg-[#111112] text-white border-2 border-slate-900 py-4 rounded-xl flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest transition-all active:scale-[0.98]"
                  >
                    <Download size={18} /> {t('configurator.summary.exportJson')}
                  </button>
                  <button 
                    onClick={() => {
                      addItem({ config: state, pricing, quantity: 1 });
                    }}
                    className="flex-[2] bg-[#eab676] !text-black hover:bg-[#F3C47F] text-white py-4 rounded-xl flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest shadow-lg shadow-[#eab676]/20 transition-all active:scale-[0.98]"
                  >
                    <ShoppingCart size={18} /> {t('configurator.summary.saveToCart')} {items.length > 0 && `(${items.length})`}
                  </button>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
    </>
  );
};
