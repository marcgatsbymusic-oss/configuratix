import { useRef, useState } from 'react';
import { useConfigurator } from './useConfigurator';
import { CONFIG_SCHEMA, WINDOW_TYPES, OPENING_TYPES, COLOR_LOCALE, GLASS_LOCALE } from './types';
import { Ruler, Layers, Check, ChevronLeft, ChevronRight, ShoppingCart, Download } from 'lucide-react';
import { BlueprintPreview } from './BlueprintPreview';
import { WindowTypeGraphic } from './WindowTypeGraphic';
import { useCartStore } from '../../store/useCartStore';
import { generateBlueprintPayload, downloadBlueprint } from '../../utils/exportConfig';

export function MainConfigurator() {
  const { state, dispatch, pricing } = useConfigurator();
  const { items, addItem } = useCartStore();
  const materialScrollRef = useRef<HTMLDivElement>(null);
  const profileScrollRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(1);



  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-6 pt-12">
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          
          {/* LEFT: Configure Wizard */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Contextual Headers aligned with Accordions */}
            <div className="px-2 pt-2 pb-2">
              <h1 className="text-slate-700 font-medium text-lg tracking-wide">Design your custom window system.</h1>
              <p className="text-slate-400 text-sm mt-1">Pick the material and configure your exact architectural specifications below.</p>
            </div>
            
            {/* Step 1: Material */}
            <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200/60 transition-all duration-300">
              <div 
                className={`flex items-center justify-between cursor-pointer ${activeStep === 1 ? 'mb-6' : ''}`}
                onClick={() => setActiveStep(1)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors ${activeStep === 1 ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>1</div>
                  <h2 className={`text-xl font-bold transition-colors ${activeStep === 1 ? 'text-slate-800' : 'text-slate-400'}`}>Material Profile</h2>
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
                            <div className="text-[10px] font-bold text-indigo-500 mt-1 uppercase tracking-widest">+${CONFIG_SCHEMA.materials[mat].basePricePerSqm}/m²</div>
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
                  <h2 className={`text-xl font-bold transition-colors ${activeStep === 2 ? 'text-slate-800' : 'text-slate-400'}`}>System Profile</h2>
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
                            <button
                              key={profile.id}
                              onClick={() => { dispatch({ type: 'SET_PROFILE', payload: profile.id }); setTimeout(() => setActiveStep(3), 350); }}
                              className={`group/btn relative w-56 shrink-0 snap-start rounded-2xl border-2 text-left transition-all overflow-hidden bg-white shadow-sm hover:shadow-md ${state.profile === profile.id ? 'border-indigo-600 ring-4 ring-indigo-600/10 scale-[1.02]' : 'border-slate-200 hover:border-slate-300'}`}
                            >
                              <div className="h-44 flex items-center justify-center bg-slate-50 p-4 border-b border-slate-100 relative overflow-hidden">
                                <img src={profile.image} alt={profile.name} className="max-h-full max-w-full object-contain drop-shadow-md mix-blend-multiply transition-transform duration-500 group-hover/btn:scale-110" />
                                <div className="absolute top-3 left-3 flex flex-col gap-1 items-start z-10">
                                  {profile.tags.map((tag, i) => (
                                    <span key={i} className={`text-[9px] font-bold text-white px-2 py-0.5 rounded shadow-sm tracking-wider uppercase ${tag.color === 'emerald' ? 'bg-emerald-500' : 'bg-blue-600'}`}>
                                      {tag.text}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="p-4">
                                <div className="font-bold text-lg text-slate-800">{profile.name}</div>
                              </div>
                              
                              {state.profile === profile.id && (
                                <div className="absolute bottom-4 right-4 w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-md">
                                  <Check size={14} strokeWidth={4} />
                                </div>
                              )}
                            </button>
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
                  <h2 className={`text-xl font-bold transition-colors ${activeStep === 3 ? 'text-slate-800' : 'text-slate-400'}`}>Window Type</h2>
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
                  <h2 className={`text-xl font-bold transition-colors ${activeStep === 4 ? 'text-slate-800' : 'text-slate-400'}`}>Opening Type</h2>
                </div>
                {activeStep !== 4 && <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full uppercase tracking-wider">{state.sashOpenings.length} Sashes Configured</div>}
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
                            Sash Position {sashIndex + 1}
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
                        Continue to Color & Decor
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
                  <h2 className={`text-xl font-bold transition-colors ${activeStep === 5 ? 'text-slate-800' : 'text-slate-400'}`}>Color & Decor</h2>
                </div>
                {activeStep !== 5 && <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full uppercase tracking-wider">{COLOR_LOCALE.colors[state.color]?.name || state.color}</div>}
              </div>
              
              <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${activeStep === 5 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  <div className="pt-2">
                    {/* Color Group Selector */}
                    <div className="flex flex-wrap gap-2 mb-6 p-1 bg-slate-100/50 rounded-xl inline-flex w-full md:w-auto">
                      {(Object.keys(COLOR_LOCALE.colorGroups) as Array<string>).map(grp => (
                        <button
                          key={grp}
                          onClick={() => {
                            dispatch({ type: 'SET_COLOR_GROUP', payload: grp });
                            // Hardcode fallback: just let them select manually or stay on previous color visually
                          }}
                          className={`flex-1 md:flex-none px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${state.colorGroup === grp ? 'bg-white text-indigo-700 shadow shadow-indigo-600/10' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
                        >
                          {COLOR_LOCALE.colorGroups[grp]}
                        </button>
                      ))}
                    </div>

                    {/* Color Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {Object.keys(COLOR_LOCALE.colors)
                        .filter(colorId => COLOR_LOCALE.colors[colorId].group === COLOR_LOCALE.colorGroups[state.colorGroup])
                        .map(colorId => {
                          const colorData = COLOR_LOCALE.colors[colorId];
                          const isActive = state.color === colorId;
                          return (
                            <button
                              key={colorId}
                              onClick={() => { dispatch({ type: 'SET_COLOR', payload: colorId }); setTimeout(() => setActiveStep(6), 350); }}
                              className={`relative group h-28 rounded-xl border-2 overflow-hidden flex flex-col items-center justify-center transition-all duration-300 ${isActive ? 'border-indigo-600 ring-4 ring-indigo-600/20 shadow-md' : 'border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md'}`}
                            >
                              {/* Expanding full-box background image for hover/active state */}
                              <div
                                className={`absolute inset-0 bg-cover bg-center transition-all duration-500 ease-out ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-125 group-hover:opacity-100 group-hover:scale-100'}`}
                                style={{ backgroundImage: colorData.swatch }}
                              />
                              
                              {/* Dark wash overlay ensuring text legibility */}
                              <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />

                              {/* Static center swatch thumbnail that explodes out on interaction */}
                              <div 
                                className={`w-12 h-12 rounded-full shadow-inner border border-slate-900/20 z-10 bg-cover bg-center transition-all duration-500 ease-out ${isActive ? 'scale-[2.5] opacity-0' : 'scale-100 opacity-100 group-hover:scale-[2.5] group-hover:opacity-0'}`}
                                style={{ backgroundImage: colorData.swatch }}
                              />
                              
                              {/* Title label that tracks interaction state */}
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
                  <h2 className={`text-xl font-bold transition-colors ${activeStep === 6 ? 'text-slate-800' : 'text-slate-400'}`}>Dimensions (mm)</h2>
                </div>
                {activeStep !== 6 && <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full uppercase tracking-wider">{state.dimensions.width} x {state.dimensions.height}</div>}
              </div>
              
              <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${activeStep === 6 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  <div className="pt-2 grid md:grid-cols-2 gap-8">
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                      <label className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2 uppercase tracking-widest"><Ruler size={16} className="text-indigo-500"/> Width</label>
                      <input
                        type="range"
                        min={CONFIG_SCHEMA.materials[state.material].minWidth}
                        max={CONFIG_SCHEMA.materials[state.material].maxWidth}
                        step="10"
                        value={state.dimensions.width}
                        onChange={(e) => dispatch({ type: 'SET_DIMENSIONS', payload: { width: Number(e.target.value) } })}
                        className="w-full accent-indigo-600 mb-2 cursor-pointer"
                      />
                      <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                        <span>{CONFIG_SCHEMA.materials[state.material].minWidth}</span>
                        <span className="text-lg text-indigo-600">{state.dimensions.width} mm</span>
                        <span>{CONFIG_SCHEMA.materials[state.material].maxWidth}</span>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                      <label className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2 uppercase tracking-widest"><Ruler size={16} className="rotate-90 text-indigo-500"/> Height</label>
                      <input
                        type="range"
                        min={CONFIG_SCHEMA.materials[state.material].minHeight}
                        max={CONFIG_SCHEMA.materials[state.material].maxHeight}
                        step="10"
                        value={state.dimensions.height}
                        onChange={(e) => dispatch({ type: 'SET_DIMENSIONS', payload: { height: Number(e.target.value) } })}
                        className="w-full accent-indigo-600 mb-2 cursor-pointer"
                      />
                      <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                        <span>{CONFIG_SCHEMA.materials[state.material].minHeight}</span>
                        <span className="text-lg text-indigo-600">{state.dimensions.height} mm</span>
                        <span>{CONFIG_SCHEMA.materials[state.material].maxHeight}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 flex justify-end">
                    <button 
                      onClick={() => setActiveStep(7)}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95 text-sm uppercase tracking-wider"
                    >
                      Continue to Glazing
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
                  <h2 className={`text-xl font-bold transition-colors ${activeStep === 7 ? 'text-slate-800' : 'text-slate-400'}`}>Glazing Package</h2>
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
                  <h2 className={`text-xl font-bold transition-colors ${activeStep === 8 ? 'text-slate-800' : 'text-slate-400'}`}>Accessories & Add-ons</h2>
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
                          <span className="text-sm font-black text-indigo-600">+${addon.price}</span>
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
                  <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Specs Overview</h3>
                  <div className="space-y-1 text-sm">
                    <button onClick={() => setActiveStep(1)} className="flex w-full text-left justify-between items-center group py-2 -mx-2 px-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <span className="text-slate-500 group-hover:text-indigo-600 font-medium text-xs uppercase tracking-wider transition-colors">Material Profile</span> 
                      <span className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{state.material}</span>
                    </button>
                    <button onClick={() => setActiveStep(2)} className="flex w-full text-left justify-between items-center group py-2 -mx-2 px-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <span className="text-slate-500 group-hover:text-indigo-600 font-medium text-xs uppercase tracking-wider transition-colors">System Profile</span> 
                      <span className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors truncate max-w-[150px] text-right">{state.profile ? (CONFIG_SCHEMA.materials[state.material].profiles.find(p => p.id === state.profile)?.name || state.profile) : 'Standard System'}</span>
                    </button>
                    <button onClick={() => setActiveStep(3)} className="flex w-full text-left justify-between items-center group py-2 -mx-2 px-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <span className="text-slate-500 group-hover:text-indigo-600 font-medium text-xs uppercase tracking-wider transition-colors">Window Type</span> 
                      <span className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">{WINDOW_TYPES.find(w => w.id === state.windowTypeId)?.name || state.windowTypeId}</span>
                    </button>
                    <button onClick={() => setActiveStep(5)} className="flex w-full text-left justify-between items-center group py-2 -mx-2 px-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <span className="text-slate-500 group-hover:text-indigo-600 font-medium text-xs uppercase tracking-wider transition-colors">Color & Decor</span> 
                      <span className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors line-clamp-1">{COLOR_LOCALE.colors[state.color]?.name || state.color}</span>
                    </button>
                    <button onClick={() => setActiveStep(7)} className="flex w-full text-left justify-between items-center group py-2 -mx-2 px-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <span className="text-slate-500 group-hover:text-indigo-600 font-medium text-xs uppercase tracking-wider transition-colors">Glazing</span> 
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
                  <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Financials</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Base Framework</span> <span className="font-bold text-slate-900">${pricing.base.toFixed(2)}</span></div>
                    <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Hardware Assembly</span> <span className="font-bold text-slate-900">${pricing.hardware.toFixed(2)}</span></div>
                    <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Accessories</span> <span className="font-bold text-slate-900">${pricing.addons.toFixed(2)}</span></div>
                  </div>
                </div>

                <div className="pt-4 flex items-end justify-between">
                  <div>
                    <div className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-1">Total System</div>
                    <div className="text-4xl font-black text-slate-900 tracking-tighter">${pricing.total.toFixed(2)}</div>
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
                    <Download size={18} /> JSON
                  </button>
                  <button 
                    onClick={() => {
                      addItem({ config: state, pricing, quantity: 1 });
                    }}
                    className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98]"
                  >
                    <ShoppingCart size={18} /> Save to Cart {items.length > 0 && `(${items.length})`}
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
