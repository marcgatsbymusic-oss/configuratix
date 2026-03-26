import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfigurator } from './useConfigurator';
import { CONFIG_SCHEMA, WINDOW_TYPES, OPENING_TYPES, COLOR_LOCALE, GLASS_LOCALE } from './types';
import { Ruler, Layers, Check, ChevronLeft, ChevronRight, ShoppingCart, Download, HelpCircle } from 'lucide-react';
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

export function MainConfigurator() {
  const { t } = useTranslation();
  const { state, dispatch, pricing } = useConfigurator();
  const { items, addItem } = useCartStore();
  const materialScrollRef = useRef<HTMLDivElement>(null);
  const profileScrollRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [stepOrder, setStepOrder] = useState<number[]>([1,2,3,4,5,6,7,8]);
  const advanceStep = (current: number, next: number) => { setTimeout(() => { setActiveStep(next); setStepOrder(prev => { const n = prev.filter(s => s !== current); n.push(current); return n; }); }, 350); };
  const [expandedHelpSection, setExpandedHelpSection] = useState<number | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);

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
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* Contextual Headers aligned with Accordions */}
            <div className="px-2 pt-2 pb-2" style={{ order: -1 }}>
              <p className="text-white text-sm md:text-lg lg:text-xl font-bold max-w-2xl relative z-10 leading-relaxed break-words">{t('configurator.title')}</p>
              <p className="text-white/90 font-medium text-sm mt-1">{t('configurator.subtitle')}</p>
            </div>
            
            {/* Step 1: Material */}
            <section className="bg-[#1a1a1b] p-6 md:p-8 rounded-2xl shadow-sm border border-[#2a2a2b] transition-all duration-300" style={{ order: stepOrder.indexOf(1) }}>
              <div 
                className={`flex items-center justify-between cursor-pointer ${activeStep === 1 ? 'mb-6' : ''}`}
                onClick={() => setActiveStep(1)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors ${activeStep === 1 ? 'bg-[#eab676]/20 text-[#eab676]' : 'bg-[#111112] text-white/40'}`}>1</div>
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
                          className={`group/btn relative w-56 shrink-0 snap-start rounded-2xl border-2 text-left transition-all overflow-hidden bg-[#1a1a1b] shadow-sm hover:shadow-md ${state.material === mat ? 'border-[#eab676] ring-4 ring-[#eab676]/10 scale-[1.02]' : 'border-[#2a2a2b] hover:border-[#3a3a3b]'}`}
                        >
                          <div className="h-48 flex items-center justify-center bg-[#111112] p-4 border-b border-[#2a2a2b] overflow-hidden">
                            <img src={CONFIG_SCHEMA.materials[mat].image} alt={mat} className="max-h-full max-w-full object-contain drop-shadow-md transition-transform duration-500 group-hover/btn:scale-110" />
                          </div>
                          <div className="p-5">
                            <div className="font-bold text-lg text-white/90">{t(`configurator.materials.${mat}`, mat)}</div>
                          </div>
                          
                          {state.material === mat && (
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
            <section className="bg-[#1a1a1b] p-6 md:p-8 rounded-2xl shadow-sm border border-[#2a2a2b] transition-all duration-300" style={{ order: stepOrder.indexOf(2) }}>
              <div 
                className={`flex items-center justify-between cursor-pointer ${activeStep === 2 ? 'mb-6' : ''}`}
                onClick={() => setActiveStep(2)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors ${activeStep === 2 ? 'bg-[#eab676]/20 text-[#eab676]' : 'bg-[#111112] text-white/40'}`}>2</div>
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
                              isActive={state.profile === profile.id}
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
            <section className="bg-[#1a1a1b] p-6 md:p-8 rounded-2xl shadow-sm border border-[#2a2a2b] transition-all duration-300" style={{ order: stepOrder.indexOf(3) }}>
              <div 
                className={`flex items-center justify-between cursor-pointer ${activeStep === 3 ? 'mb-6' : ''}`}
                onClick={() => setActiveStep(3)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors ${activeStep === 3 ? 'bg-[#eab676]/20 text-[#eab676]' : 'bg-[#111112] text-white/40'}`}>3</div>
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
            <section className="bg-[#1a1a1b] p-6 md:p-8 rounded-2xl shadow-sm border border-[#2a2a2b] transition-all duration-300" style={{ order: stepOrder.indexOf(4) }}>
              <div 
                className={`flex items-center justify-between cursor-pointer ${activeStep === 4 ? 'mb-6' : ''}`}
                onClick={() => setActiveStep(4)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors ${activeStep === 4 ? 'bg-[#eab676]/20 text-[#eab676]' : 'bg-[#111112] text-white/40'}`}>4</div>
                  <h2 className={`text-xl font-bold transition-colors ${activeStep === 4 ? 'text-white/90' : 'text-white/40'}`}>{t('configurator.steps.openingType')}</h2>
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
                          <div className="flex flex-wrap gap-2">
                            {OPENING_TYPES.map(ot => (
                              <button
                                key={ot.id}
                                onClick={() => dispatch({ type: 'SET_SASH_OPENING', payload: { index: sashIndex, openingId: ot.shortCode } })}
                                className={`px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all ${state.sashOpenings[sashIndex] === ot.shortCode ? 'border-[#eab676] bg-[#eab676] !text-black shadow-md' : 'border-[#2a2a2b] bg-[#1a1a1b] text-white/70 hover:border-[#3a3a3b]'}`}
                              >
                                {ot.name}
                              </button>
                            ))}
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
            <section className="bg-[#1a1a1b] p-6 md:p-8 rounded-2xl shadow-sm border border-[#2a2a2b] transition-all duration-300" style={{ order: stepOrder.indexOf(5) }}>
              <div 
                className={`flex items-center justify-between cursor-pointer ${activeStep === 5 ? 'mb-6' : ''}`}
                onClick={() => advanceStep(4, 5)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors ${activeStep === 5 ? 'bg-[#eab676]/20 text-[#eab676]' : 'bg-[#111112] text-white/40'}`}>5</div>
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
                          const isActive = colorTab === 'interior' ? state.interiorColor === colorId : state.exteriorColor === colorId;
                          return (
                            <button
                              key={colorId}
                              onClick={() => { 
                                dispatch({ type: colorTab === 'interior' ? 'SET_INTERIOR_COLOR' : 'SET_EXTERIOR_COLOR', payload: colorId }); 
                                if (colorTab === 'interior') {
                                    setColorTab('exterior');
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
            <section className="bg-[#1a1a1b] p-6 md:p-8 rounded-2xl shadow-sm border border-[#2a2a2b] transition-all duration-300" style={{ order: stepOrder.indexOf(6) }}>
              <div 
                className={`flex items-center justify-between cursor-pointer ${activeStep === 6 ? 'mb-6' : ''}`}
                onClick={() => setActiveStep(6)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors ${activeStep === 6 ? 'bg-[#eab676]/20 text-[#eab676]' : 'bg-[#111112] text-white/40'}`}>6</div>
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
            <section className="bg-[#1a1a1b] p-6 md:p-8 rounded-2xl shadow-sm border border-[#2a2a2b] transition-all duration-300" style={{ order: stepOrder.indexOf(7) }}>
              <div 
                className={`flex items-center justify-between cursor-pointer ${activeStep === 7 ? 'mb-6' : ''}`}
                onClick={() => advanceStep(6, 7)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors ${activeStep === 7 ? 'bg-[#eab676]/20 text-[#eab676]' : 'bg-[#111112] text-white/40'}`}>7</div>
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
            <section className="bg-[#1a1a1b] p-6 md:p-8 rounded-2xl shadow-sm border border-[#2a2a2b] transition-all duration-300" style={{ order: stepOrder.indexOf(8) }}>
              <div 
                className={`flex items-center justify-between cursor-pointer ${activeStep === 8 ? 'mb-6' : ''}`}
                onClick={() => setActiveStep(8)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors ${activeStep === 8 ? 'bg-[#eab676]/20 text-[#eab676]' : 'bg-[#111112] text-white/40'}`}>8</div>
                  <h2 className={`text-xl font-bold transition-colors ${activeStep === 8 ? 'text-white/90' : 'text-white/40'}`}>{t('configurator.steps.options')}</h2>
                </div>
                {activeStep !== 8 && state.addons.length > 0 && <div className="text-xs font-bold text-[#eab676] bg-[#eab676]/10 px-3 py-1.5 rounded-full uppercase tracking-wider">{state.addons.length} selected</div>}
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
          <div className="lg:col-span-4 sticky top-10">
            
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
                        <button onClick={() => setActiveStep(6)} className="text-[10px] font-black uppercase tracking-widest text-[#eab676] hover:text-[#eab676]">{t('configurator.summary.edit')}</button>
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

                    <button onClick={() => setActiveStep(1)} className="flex w-full text-left justify-between items-center group py-2 -mx-2 px-2 rounded-lg hover:bg-[#111112] transition-colors">
                      <span className="text-white/50 group-hover:text-[#eab676] font-medium text-xs uppercase tracking-wider transition-colors">{t('configurator.summary.material')}</span> 
                      <span className="font-bold text-white group-hover:text-[#eab676] transition-colors">{state.material}</span>
                    </button>
                    <button onClick={() => setActiveStep(2)} className="flex w-full text-left justify-between items-center group py-2 -mx-2 px-2 rounded-lg hover:bg-[#111112] transition-colors">
                      <span className="text-white/50 group-hover:text-[#eab676] font-medium text-xs uppercase tracking-wider transition-colors">{t('configurator.summary.system')}</span> 
                      <span className="font-bold text-white group-hover:text-[#eab676] transition-colors truncate max-w-[150px] text-right">{state.profile ? (CONFIG_SCHEMA.materials[state.material].profiles.find(p => p.id === state.profile)?.name || state.profile) : 'Standard System'}</span>
                    </button>
                    <button onClick={() => setActiveStep(3)} className="flex w-full text-left justify-between items-center group py-2 -mx-2 px-2 rounded-lg hover:bg-[#111112] transition-colors">
                      <span className="text-white/50 group-hover:text-[#eab676] font-medium text-xs uppercase tracking-wider transition-colors">{t('configurator.summary.windowType')}</span> 
                      <span className="font-bold text-white group-hover:text-[#eab676] transition-colors">{t(`configurator.windowTypes.${state.windowTypeId}`, WINDOW_TYPES.find(w => w.id === state.windowTypeId)?.name || state.windowTypeId)}</span>
                    </button>
                    <button onClick={() => { setActiveStep(5); setColorTab('interior'); }} className="flex w-full text-left justify-between items-center group py-2 -mx-2 px-2 rounded-lg hover:bg-[#111112] transition-colors">
                      <span className="text-white/50 group-hover:text-[#eab676] font-medium text-xs uppercase tracking-wider transition-colors">Interior Color</span> 
                      <span className="font-bold text-white group-hover:text-[#eab676] transition-colors line-clamp-1">{COLOR_LOCALE.colors[state.interiorColor]?.name || state.interiorColor}</span>
                    </button>
                    <button onClick={() => { setActiveStep(5); setColorTab('exterior'); }} className="flex w-full text-left justify-between items-center group py-2 -mx-2 px-2 rounded-lg hover:bg-[#111112] transition-colors">
                      <span className="text-white/50 group-hover:text-[#eab676] font-medium text-xs uppercase tracking-wider transition-colors">Exterior Color</span> 
                      <span className="font-bold text-white group-hover:text-[#eab676] transition-colors line-clamp-1">{COLOR_LOCALE.colors[state.exteriorColor]?.name || state.exteriorColor}</span>
                    </button>
                    <button onClick={() => advanceStep(6, 7)} className="flex w-full text-left justify-between items-center group py-2 -mx-2 px-2 rounded-lg hover:bg-[#111112] transition-colors">
                      <span className="text-white/50 group-hover:text-[#eab676] font-medium text-xs uppercase tracking-wider transition-colors">{t('configurator.summary.glazing')}</span> 
                      <span className="font-bold text-[#eab676] group-hover:text-white bg-[#eab676]/10 group-hover:bg-[#eab676] !text-black px-2 py-0.5 rounded transition-colors truncate max-w-[150px] text-right">{GLASS_LOCALE[state.glazing] || state.glazing}</span>
                    </button>
                    {state.addons.length > 0 && (
                      <button onClick={() => setActiveStep(8)} className="flex w-full text-left justify-between items-center group py-2 -mx-2 px-2 rounded-lg hover:bg-[#111112] transition-colors">
                        <span className="text-white/50 group-hover:text-[#eab676] font-medium text-xs uppercase tracking-wider transition-colors">Integrations</span> 
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
