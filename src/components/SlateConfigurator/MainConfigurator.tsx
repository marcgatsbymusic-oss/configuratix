import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfigurator } from './useConfigurator';
import { CONFIG_SCHEMA, WINDOW_TYPES, OPENING_TYPES, COLOR_LOCALE, GLASS_LOCALE } from './types';
import { Ruler, Layers, Check, ChevronLeft, ChevronRight, ShoppingCart, Download } from 'lucide-react';
import { BlueprintPreview } from './BlueprintPreview';
import { WindowTypeGraphic } from './WindowTypeGraphic';
import { useCartStore } from '../../store/useCartStore';
import { generateBlueprintPayload, downloadBlueprint } from '../../utils/exportConfig';

const TiltProfileCard = ({ profile, isActive, onClick, tags }: { profile: any, isActive: boolean, onClick: () => void, tags: any[] }) => {
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
        className={`w-full h-full flex flex-col rounded-2xl border-2 transition-all duration-200 overflow-visible shadow-sm group-hover/btn:shadow-xl ${isActive ? 'border-indigo-600 ring-4 ring-indigo-600/10 bg-indigo-50/10' : 'border-slate-200 group-hover/btn:border-slate-300 bg-white'}`}
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${isActive ? 1.02 : 1})`,
          transformStyle: 'preserve-3d'
        }}
      >
        <div className="h-44 flex items-center justify-center bg-slate-50 p-4 border-b border-slate-100 relative rounded-t-xl" style={{ transformStyle: 'preserve-3d' }}>
          <img 
            src={profile.image} 
            alt={profile.name} 
            className="max-h-full max-w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover/btn:scale-110" 
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
        <div className="p-4 bg-white rounded-b-xl relative z-20" style={{ transform: 'translateZ(20px)' }}>
          <div className="font-bold text-lg text-slate-800">{profile.name}</div>
        </div>
        {isActive && (
          <div className="absolute bottom-4 right-4 w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-md z-30" style={{ transform: 'translateZ(40px)' }}>
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
  const [activeStep, setActiveStep] = useState(1);
  const [colorTab, setColorTab] = useState<'interior'|'exterior'>('interior');



  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans overflow-x-hidden max-w-[100vw] w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-32 lg:pt-40 w-full overflow-hidden sm:overflow-visible">
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          
          {/* LEFT: Configure Wizard */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Contextual Headers aligned with Accordions */}
            <div className="px-2 pt-2 pb-2">
              <p className="text-slate-300 text-sm md:text-lg lg:text-xl font-medium max-w-2xl relative z-10 leading-relaxed break-words">{t('configurator.title')}</p>
              <p className="text-slate-400 text-sm mt-1">{t('configurator.subtitle')}</p>
            </div>
            
            {/* Step 1: Material */}
            <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200/60 transition-all duration-300">
              <div 
                className={`flex items-center justify-between cursor-pointer ${activeStep === 1 ? 'mb-6' : ''}`}
                onClick={() => setActiveStep(1)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors ${activeStep === 1 ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>1</div>
                  <h2 className={`text-xl font-bold transition-colors ${activeStep === 1 ? 'text-slate-800' : 'text-slate-400'}`}>{t('configurator.steps.material')}</h2>
                </div>
                {activeStep !== 1 && <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full uppercase tracking-wider">{state.material}</div>}
              </div>
              
              <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${activeStep === 1 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  {/* Horizontal Slider */}
                  <div className="relative group pt-2">
                    <button 
                      onClick={() => materialScrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' })}
                      className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-10 text-amber-500 hover:scale-110 transition-transform drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] bg-white/50 backdrop-blur-sm rounded-full p-1 opacity-0 group-hover:opacity-100 hidden md:block"
                    >
                      <ChevronLeft size={40} strokeWidth={2.5} />
                    </button>
                    
                    <div ref={materialScrollRef} className="flex overflow-x-auto gap-5 pb-4 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                      {(Object.keys(CONFIG_SCHEMA.materials) as Array<keyof typeof CONFIG_SCHEMA.materials>).map(mat => (
                        <button
                          key={mat}
                          onClick={() => { dispatch({ type: 'SET_MATERIAL', payload: mat }); setTimeout(() => setActiveStep(2), 350); }}
                          className={`group/btn relative w-56 shrink-0 snap-start rounded-2xl border-2 text-left transition-all overflow-hidden bg-white shadow-sm hover:shadow-md ${state.material === mat ? 'border-indigo-600 ring-4 ring-indigo-600/10 scale-[1.02]' : 'border-slate-200 hover:border-slate-300'}`}
                        >
                          <div className="h-48 flex items-center justify-center bg-slate-50 p-4 border-b border-slate-100 overflow-hidden">
                            <img src={CONFIG_SCHEMA.materials[mat].image} alt={mat} className="max-h-full max-w-full object-contain drop-shadow-md mix-blend-multiply transition-transform duration-500 group-hover/btn:scale-110" />
                          </div>
                          <div className="p-5">
                            <div className="font-bold text-lg text-slate-800">{mat}</div>
                            <div className="text-[10px] font-bold text-indigo-500 mt-1 uppercase tracking-widest">+€{CONFIG_SCHEMA.materials[mat].basePricePerSqm}/m²</div>
                          </div>
                          
                          {state.material === mat && (
                            <div className="absolute top-3 right-3 w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-md">
                              <Check size={14} strokeWidth={4} />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>

                    <button 
                      onClick={() => materialScrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' })}
                      className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-10 text-amber-500 hover:scale-110 transition-transform drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] bg-white/50 backdrop-blur-sm rounded-full p-1 opacity-0 group-hover:opacity-100 hidden md:block"
                    >
                      <ChevronRight size={40} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>
            </section>
            {/* Step 2: System Profile */}
            <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200/60 transition-all duration-300">
              <div 
                className={`flex items-center justify-between cursor-pointer ${activeStep === 2 ? 'mb-6' : ''}`}
                onClick={() => setActiveStep(2)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors ${activeStep === 2 ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>2</div>
                  <h2 className={`text-xl font-bold transition-colors ${activeStep === 2 ? 'text-slate-800' : 'text-slate-400'}`}>{t('configurator.steps.system')}</h2>
                </div>
                {state.profile && <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full uppercase tracking-wider transition-opacity">{CONFIG_SCHEMA.materials[state.material].profiles.find(p => p.id === state.profile)?.name || state.profile}</div>}
              </div>
              
              <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${activeStep === 2 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  <div className="pt-2">
                    {CONFIG_SCHEMA.materials[state.material].profiles.length === 0 ? (
                      <div className="text-sm text-slate-500 font-medium italic p-5 bg-slate-50 border border-slate-100 rounded-xl text-center">No specific profiles available for this material.</div>
                    ) : (
                      <div className="relative group">
                        <button 
                          onClick={() => profileScrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' })}
                          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-10 text-amber-500 hover:scale-110 transition-transform drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] bg-white/50 backdrop-blur-sm rounded-full p-1 opacity-0 group-hover:opacity-100 hidden md:block"
                        >
                          <ChevronLeft size={40} strokeWidth={2.5} />
                        </button>

                        <div ref={profileScrollRef} className="flex overflow-x-auto gap-5 pb-4 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                          {CONFIG_SCHEMA.materials[state.material].profiles.map(profile => (
                            <TiltProfileCard 
                              key={profile.id} 
                              profile={profile} 
                              tags={profile.tags}
                              isActive={state.profile === profile.id}
                              onClick={() => { dispatch({ type: 'SET_PROFILE', payload: profile.id }); setTimeout(() => setActiveStep(3), 350); }}
                            />
                          ))}
                        </div>

                        <button 
                          onClick={() => profileScrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' })}
                          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-10 text-amber-500 hover:scale-110 transition-transform drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] bg-white/50 backdrop-blur-sm rounded-full p-1 opacity-0 group-hover:opacity-100 hidden md:block"
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
            <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200/60 transition-all duration-300">
              <div 
                className={`flex items-center justify-between cursor-pointer ${activeStep === 3 ? 'mb-6' : ''}`}
                onClick={() => setActiveStep(3)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors ${activeStep === 3 ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>3</div>
                  <h2 className={`text-xl font-bold transition-colors ${activeStep === 3 ? 'text-slate-800' : 'text-slate-400'}`}>{t('configurator.steps.windowType')}</h2>
                </div>
                {activeStep !== 3 && <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full uppercase tracking-wider">{WINDOW_TYPES.find(w => w.id === state.windowTypeId)?.name || state.windowTypeId}</div>}
              </div>
              
              <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${activeStep === 3 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {WINDOW_TYPES.map(wt => (
                      <button
                        key={wt.id}
                        onClick={() => { dispatch({ type: 'SET_WINDOW_TYPE', payload: wt.id }); setTimeout(() => setActiveStep(4), 350); }}
                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-between gap-3 min-h-[140px] ${state.windowTypeId === wt.id ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-md ring-4 ring-indigo-600/10' : 'border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md group bg-white'}`}
                      >
                        <div className="w-full h-20 flex items-center justify-center relative p-2">
                          <WindowTypeGraphic 
                            id={wt.id} 
                            className={`transition-all duration-300 ${state.windowTypeId === wt.id ? 'text-indigo-600 scale-110 drop-shadow-md opacity-100' : 'text-slate-400 group-hover:text-slate-500 group-hover:scale-105 opacity-80 group-hover:opacity-100 drop-shadow-sm'}`}
                          />
                        </div>
                        <div className="font-bold text-xs text-center leading-tight whitespace-pre-wrap">{wt.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Step 4: Opening Types (Öffnungsart) */}
            <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200/60 transition-all duration-300">
              <div 
                className={`flex items-center justify-between cursor-pointer ${activeStep === 4 ? 'mb-6' : ''}`}
                onClick={() => setActiveStep(4)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors ${activeStep === 4 ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>4</div>
                  <h2 className={`text-xl font-bold transition-colors ${activeStep === 4 ? 'text-slate-800' : 'text-slate-400'}`}>{t('configurator.steps.openingType')}</h2>
                </div>
                {activeStep !== 4 && <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full uppercase tracking-wider">{t('configurator.state.sashes', { count: state.sashOpenings.length })}</div>}
              </div>
              
              <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${activeStep === 4 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  <div className="pt-2 space-y-6">
                    {(WINDOW_TYPES.find(w => w.id === state.windowTypeId)?.sashes || 1) > 1 && (
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Configure each sash independently (Left to Right):</div>
                    )}
                    
                    <div className="grid gap-6">
                      {Array.from({ length: WINDOW_TYPES.find(w => w.id === state.windowTypeId)?.sashes || 1 }).map((_, sashIndex) => (
                        <div key={sashIndex} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                          <div className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">{sashIndex + 1}</span>
                            Sash {sashIndex + 1}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {OPENING_TYPES.map(ot => (
                              <button
                                key={ot.id}
                                onClick={() => dispatch({ type: 'SET_SASH_OPENING', payload: { index: sashIndex, openingId: ot.shortCode } })}
                                className={`px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all ${state.sashOpenings[sashIndex] === ot.shortCode ? 'border-indigo-600 bg-indigo-600 text-white shadow-md' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}
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
                        onClick={() => setActiveStep(5)}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 text-sm uppercase tracking-wider"
                      >
                        {t('configurator.steps.color')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Step 5: Color & Decor */}
            <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200/60 transition-all duration-300">
              <div 
                className={`flex items-center justify-between cursor-pointer ${activeStep === 5 ? 'mb-6' : ''}`}
                onClick={() => setActiveStep(5)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors ${activeStep === 5 ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>5</div>
                  <h2 className={`text-xl font-bold transition-colors ${activeStep === 5 ? 'text-slate-800' : 'text-slate-400'}`}>{t('configurator.steps.color')}</h2>
                </div>
                {activeStep !== 5 && <div className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full uppercase tracking-wider">In: {COLOR_LOCALE.colors[state.interiorColor]?.name} | Ex: {COLOR_LOCALE.colors[state.exteriorColor]?.name}</div>}
              </div>
              
              <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${activeStep === 5 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  <div className="pt-2">

                    {/* Dual Color Tabs */}
                    <div className="flex gap-2 w-full mb-6 p-1 bg-slate-100 rounded-xl">
                      <button 
                        onClick={() => setColorTab('interior')} 
                        className={`flex-1 py-3 text-sm tracking-widest uppercase font-bold rounded-lg transition-all shadow-sm ${colorTab === 'interior' ? 'bg-white text-indigo-600 ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'}`}
                      >
                        Interior Color
                      </button>
                      <button 
                        onClick={() => setColorTab('exterior')} 
                        className={`flex-1 py-3 text-sm tracking-widest uppercase font-bold rounded-lg transition-all shadow-sm ${colorTab === 'exterior' ? 'bg-white text-indigo-600 ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'}`}
                      >
                        Exterior Color
                      </button>
                    </div>

                    {/* Color Group Selector */}
                    <div className="flex flex-wrap gap-2 mb-6 p-1 bg-slate-50 border border-slate-100 rounded-xl inline-flex w-full md:w-auto">
                      {(Object.keys(COLOR_LOCALE.colorGroups) as Array<string>).map(grp => {
                        const activeGrp = colorTab === 'interior' ? state.interiorColorGroup : state.exteriorColorGroup;
                        return (
                          <button
                            key={grp}
                            onClick={() => {
                              dispatch({ type: colorTab === 'interior' ? 'SET_INTERIOR_COLOR_GROUP' : 'SET_EXTERIOR_COLOR_GROUP', payload: grp });
                            }}
                            className={`flex-1 md:flex-none px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${activeGrp === grp ? 'bg-white text-indigo-700 shadow shadow-indigo-600/10' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
                          >
                            {COLOR_LOCALE.colorGroups[grp]}
                          </button>
                        );
                      })}
                    </div>

                    {/* Color Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
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
                                    setTimeout(() => setActiveStep(6), 350); 
                                }
                              }}
                              className={`relative group h-28 rounded-xl border-2 overflow-hidden flex flex-col items-center justify-center transition-all duration-300 ${isActive ? 'border-indigo-600 ring-4 ring-indigo-600/20 shadow-md' : 'border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md'}`}
                            >
                              <div
                                className={`absolute inset-0 bg-cover bg-center transition-all duration-500 ease-out ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-125 group-hover:opacity-100 group-hover:scale-100'}`}
                                style={{ backgroundImage: colorData.swatch }}
                              />
                              <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                              <div 
                                className={`w-12 h-12 rounded-full shadow-inner border border-slate-900/20 z-10 bg-cover bg-center transition-all duration-500 ease-out ${isActive ? 'scale-[2.5] opacity-0' : 'scale-100 opacity-100 group-hover:scale-[2.5] group-hover:opacity-0'}`}
                                style={{ backgroundImage: colorData.swatch }}
                              />
                              <div className={`absolute bottom-3 font-bold text-xs leading-tight z-20 px-2 text-center w-full transition-all duration-300 ${isActive ? 'text-white drop-shadow-md translate-y-0' : 'text-slate-800 drop-shadow-sm group-hover:text-white group-hover:drop-shadow-md group-hover:translate-y-0 translate-y-2'}`}>
                                {colorData.name}
                              </div>
                            </button>
                          );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Step 6: Dimensions */}
            <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200/60 transition-all duration-300">
              <div 
                className={`flex items-center justify-between cursor-pointer ${activeStep === 6 ? 'mb-6' : ''}`}
                onClick={() => setActiveStep(6)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors ${activeStep === 6 ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>6</div>
                  <h2 className={`text-xl font-bold transition-colors ${activeStep === 6 ? 'text-slate-800' : 'text-slate-400'}`}>{t('configurator.steps.dimensions')}</h2>
                </div>
                {activeStep !== 6 && <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full uppercase tracking-wider">{state.dimensions.width} x {state.dimensions.height}</div>}
              </div>
              
              <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${activeStep === 6 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  <div className="pt-2 grid md:grid-cols-2 gap-8">
                    {/* Width Control */}
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                      <div className="flex justify-between items-start mb-4">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2 uppercase tracking-widest leading-none">
                          <Ruler size={16} className="text-indigo-500"/> {t('configurator.inputs.w')}
                        </label>
                        <div className="flex flex-col items-end gap-0.5">
                          <div className="flex items-center gap-1.5 focus-within:ring-2 ring-indigo-500/30 rounded px-1 -mr-1 transition-all">
                            <input
                              type="number"
                              value={state.dimensions.width || ''}
                              onChange={(e) => dispatch({ type: 'SET_DIMENSIONS', payload: { width: Number(e.target.value) || 0, height: state.dimensions.height }})}
                              onBlur={(e) => {
                                let val = Number(e.target.value) || CONFIG_SCHEMA.materials[state.material].minWidth;
                                val = Math.max(CONFIG_SCHEMA.materials[state.material].minWidth, Math.min(CONFIG_SCHEMA.materials[state.material].maxWidth, val));
                                dispatch({ type: 'SET_DIMENSIONS', payload: { width: val, height: state.dimensions.height }});
                              }}
                              className="w-[60px] bg-transparent text-right font-black text-indigo-700 focus:outline-none"
                            />
                            <span className="text-xs font-bold text-indigo-400">{t('configurator.inputs.mm')}</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 tracking-wider">({(state.dimensions.width / 10).toFixed(0)} {t('configurator.inputs.cm')}</span>
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
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-300">
                        <span>{CONFIG_SCHEMA.materials[state.material].minWidth}</span>
                        <span>{CONFIG_SCHEMA.materials[state.material].maxWidth}</span>
                      </div>
                    </div>

                    {/* Height Control */}
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                      <div className="flex justify-between items-start mb-4">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2 uppercase tracking-widest leading-none">
                          <Ruler size={16} className="rotate-90 text-indigo-500"/> {t('configurator.inputs.h')}
                        </label>
                        <div className="flex flex-col items-end gap-0.5">
                          <div className="flex items-center gap-1.5 focus-within:ring-2 ring-indigo-500/30 rounded px-1 -mr-1 transition-all">
                            <input
                              type="number"
                              value={state.dimensions.height || ''}
                              onChange={(e) => dispatch({ type: 'SET_DIMENSIONS', payload: { width: state.dimensions.width, height: Number(e.target.value) || 0 }})}
                              onBlur={(e) => {
                                let val = Number(e.target.value) || CONFIG_SCHEMA.materials[state.material].minHeight;
                                val = Math.max(CONFIG_SCHEMA.materials[state.material].minHeight, Math.min(CONFIG_SCHEMA.materials[state.material].maxHeight, val));
                                dispatch({ type: 'SET_DIMENSIONS', payload: { width: state.dimensions.width, height: val }});
                              }}
                              className="w-[60px] bg-transparent text-right font-black text-indigo-700 focus:outline-none"
                            />
                            <span className="text-xs font-bold text-indigo-400">{t('configurator.inputs.mm')}</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 tracking-wider">({(state.dimensions.height / 10).toFixed(0)} {t('configurator.inputs.cm')}</span>
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
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-300">
                        <span>{CONFIG_SCHEMA.materials[state.material].minHeight}</span>
                        <span>{CONFIG_SCHEMA.materials[state.material].maxHeight}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 flex justify-end">
                    <button 
                      onClick={() => setActiveStep(7)}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 text-sm uppercase tracking-wider"
                    >
                      {t('configurator.steps.glazing')}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Step 7: Glazing Package */}
            <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200/60 transition-all duration-300">
              <div 
                className={`flex items-center justify-between cursor-pointer ${activeStep === 7 ? 'mb-6' : ''}`}
                onClick={() => setActiveStep(7)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors ${activeStep === 7 ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>7</div>
                  <h2 className={`text-xl font-bold transition-colors ${activeStep === 7 ? 'text-slate-800' : 'text-slate-400'}`}>{t('configurator.steps.glazing')}</h2>
                </div>
                {activeStep !== 7 && <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full uppercase tracking-wider">{GLASS_LOCALE[state.glazing] || state.glazing}</div>}
              </div>

              <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${activeStep === 7 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {CONFIG_SCHEMA.glazing.map(gl => (
                      <button
                        key={gl.id}
                        onClick={() => { dispatch({ type: 'SET_GLAZING', payload: gl.id }); setTimeout(() => setActiveStep(8), 300); }}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${state.glazing === gl.id ? 'border-indigo-600 bg-indigo-50 ring-4 ring-indigo-600/10' : 'border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md'}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-bold text-sm text-slate-800">{GLASS_LOCALE[gl.id] || gl.id}</div>
                          <Layers size={18} className={state.glazing === gl.id ? 'text-indigo-600' : 'text-slate-300'}/>
                        </div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Base Cost x {gl.priceMod}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Step 8: Accessories & Add-ons */}
            <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200/60 transition-all duration-300">
              <div 
                className={`flex items-center justify-between cursor-pointer ${activeStep === 8 ? 'mb-6' : ''}`}
                onClick={() => setActiveStep(8)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors ${activeStep === 8 ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>8</div>
                  <h2 className={`text-xl font-bold transition-colors ${activeStep === 8 ? 'text-slate-800' : 'text-slate-400'}`}>{t('configurator.steps.options')}</h2>
                </div>
                {activeStep !== 8 && state.addons.length > 0 && <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full uppercase tracking-wider">{state.addons.length} selected</div>}
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
                          className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all ${isActive ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md'}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${isActive ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'}`}>
                              {isActive && <Check size={14} strokeWidth={4}/>}
                            </div>
                            <span className="font-bold text-slate-700">{addon.name}</span>
                          </div>
                          <span className="text-sm font-black text-indigo-600">+€{addon.price}</span>
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
            <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-2xl shadow-indigo-900/5 rounded-3xl overflow-hidden">
              
              {/* Dynamic SVG Fensternorm-Style Blueprint Area */}
              <div className="bg-white w-full aspect-square flex items-center justify-center relative border-b border-indigo-100/50 overflow-hidden">
                <BlueprintPreview state={state} />
              </div>

              {/* Data Breakdown */}
              <div className="p-8 space-y-6">
                
                <div>
                  <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">{t('configurator.summary.title')}</h3>
                  <div className="space-y-1 text-sm">
                    {/* Input-Driven Dimensions Row */}
                    <div className="py-3 px-3 mb-3 -mx-2 bg-slate-50 border border-indigo-100/50 rounded-xl shadow-inner">
                      <div className="flex justify-between mb-3 border-b border-indigo-100/30 pb-2">
                        <span className="text-slate-500 font-bold text-xs uppercase tracking-wider flex items-center gap-2">{t('configurator.summary.dimensions')}</span>
                        <button onClick={() => setActiveStep(6)} className="text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-700">{t('configurator.summary.edit')}</button>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 flex flex-col items-center">
                          <div className="flex items-center justify-between w-full bg-white border border-slate-200 focus-within:border-indigo-500 focus-within:ring-2 ring-indigo-500/20 rounded px-2 py-1 transition-all">
                            <span className="text-[10px] font-bold text-slate-400">W</span>
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
                                className="w-[45px] text-right bg-transparent text-sm font-black text-slate-800 focus:outline-none"
                              />
                              <span className="text-[10px] font-bold text-slate-400">{t('configurator.inputs.mm')}</span>
                            </div>
                          </div>
                          <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">({(state.dimensions.width / 10).toFixed(0)} {t('configurator.inputs.cm')}</span>
                        </div>

                        <span className="text-slate-300 font-black text-xs">×</span>

                        <div className="flex-1 flex flex-col items-center">
                          <div className="flex items-center justify-between w-full bg-white border border-slate-200 focus-within:border-indigo-500 focus-within:ring-2 ring-indigo-500/20 rounded px-2 py-1 transition-all">
                            <span className="text-[10px] font-bold text-slate-400">H</span>
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
                                className="w-[45px] text-right bg-transparent text-sm font-black text-slate-800 focus:outline-none"
                              />
                              <span className="text-[10px] font-bold text-slate-400">{t('configurator.inputs.mm')}</span>
                            </div>
                          </div>
                          <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">({(state.dimensions.height / 10).toFixed(0)} {t('configurator.inputs.cm')}</span>
                        </div>
                      </div>
                    </div>

                    <button onClick={() => setActiveStep(1)} className="flex w-full text-left justify-between items-center group py-2 -mx-2 px-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <span className="text-slate-500 group-hover:text-indigo-600 font-medium text-xs uppercase tracking-wider transition-colors">{t('configurator.summary.material')}</span> 
                      <span className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{state.material}</span>
                    </button>
                    <button onClick={() => setActiveStep(2)} className="flex w-full text-left justify-between items-center group py-2 -mx-2 px-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <span className="text-slate-500 group-hover:text-indigo-600 font-medium text-xs uppercase tracking-wider transition-colors">{t('configurator.summary.system')}</span> 
                      <span className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors truncate max-w-[150px] text-right">{state.profile ? (CONFIG_SCHEMA.materials[state.material].profiles.find(p => p.id === state.profile)?.name || state.profile) : 'Standard System'}</span>
                    </button>
                    <button onClick={() => setActiveStep(3)} className="flex w-full text-left justify-between items-center group py-2 -mx-2 px-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <span className="text-slate-500 group-hover:text-indigo-600 font-medium text-xs uppercase tracking-wider transition-colors">{t('configurator.summary.windowType')}</span> 
                      <span className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{WINDOW_TYPES.find(w => w.id === state.windowTypeId)?.name || state.windowTypeId}</span>
                    </button>
                    <button onClick={() => { setActiveStep(5); setColorTab('interior'); }} className="flex w-full text-left justify-between items-center group py-2 -mx-2 px-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <span className="text-slate-500 group-hover:text-indigo-600 font-medium text-xs uppercase tracking-wider transition-colors">Interior Color</span> 
                      <span className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors line-clamp-1">{COLOR_LOCALE.colors[state.interiorColor]?.name || state.interiorColor}</span>
                    </button>
                    <button onClick={() => { setActiveStep(5); setColorTab('exterior'); }} className="flex w-full text-left justify-between items-center group py-2 -mx-2 px-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <span className="text-slate-500 group-hover:text-indigo-600 font-medium text-xs uppercase tracking-wider transition-colors">Exterior Color</span> 
                      <span className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors line-clamp-1">{COLOR_LOCALE.colors[state.exteriorColor]?.name || state.exteriorColor}</span>
                    </button>
                    <button onClick={() => setActiveStep(7)} className="flex w-full text-left justify-between items-center group py-2 -mx-2 px-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <span className="text-slate-500 group-hover:text-indigo-600 font-medium text-xs uppercase tracking-wider transition-colors">{t('configurator.summary.glazing')}</span> 
                      <span className="font-bold text-indigo-700 group-hover:text-white bg-indigo-50 group-hover:bg-indigo-600 px-2 py-0.5 rounded transition-colors truncate max-w-[150px] text-right">{GLASS_LOCALE[state.glazing] || state.glazing}</span>
                    </button>
                    {state.addons.length > 0 && (
                      <button onClick={() => setActiveStep(8)} className="flex w-full text-left justify-between items-center group py-2 -mx-2 px-2 rounded-lg hover:bg-slate-50 transition-colors">
                        <span className="text-slate-500 group-hover:text-indigo-600 font-medium text-xs uppercase tracking-wider transition-colors">Integrations</span> 
                        <span className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{state.addons.length} elements</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

                <div>
                  <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">{t('configurator.summary.financials')}</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">{t('configurator.summary.baseFramework')}</span> <span className="font-bold text-slate-900">€{pricing.base.toFixed(2)}</span></div>
                    <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">{t('configurator.summary.hardwareAssembly')}</span> <span className="font-bold text-slate-900">€{pricing.hardware.toFixed(2)}</span></div>
                    <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">{t('configurator.summary.accessories')}</span> <span className="font-bold text-slate-900">€{pricing.addons.toFixed(2)}</span></div>
                  </div>
                </div>

                <div className="pt-4 flex items-end justify-between">
                  <div>
                    <div className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-1">{t('configurator.summary.totalSystem')}</div>
                    <div className="text-4xl font-black text-slate-900 tracking-tighter">€{pricing.total.toFixed(2)}</div>
                  </div>
                </div>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={() => {
                      const payload = generateBlueprintPayload(state, pricing);
                      downloadBlueprint(payload, `drutex-blueprint-${Date.now()}.json`);
                    }}
                    className="flex-1 bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-900 py-4 rounded-xl flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest transition-all active:scale-[0.98]"
                  >
                    <Download size={18} /> {t('configurator.summary.exportJson')}
                  </button>
                  <button 
                    onClick={() => {
                      addItem({ config: state, pricing, quantity: 1 });
                    }}
                    className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98]"
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
  );
}
