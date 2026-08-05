import fs from 'fs';

let code = fs.readFileSync('./src/components/SlateConfigurator/MainConfigurator.tsx', 'utf-8');

// Also inject useState colorTab
if (!code.includes("const [colorTab")) {
  code = code.replace("const [activeStep, setActiveStep] = useState(1);", "const [activeStep, setActiveStep] = useState(1);\n  const [colorTab, setColorTab] = useState<'interior'|'exterior'>('interior');");
}

const step5Start = code.indexOf("{/* Step 5: Color & Decor */}");
const step6Start = code.indexOf("{/* Step 6: Dimensions */}");

if (step5Start === -1 || step6Start === -1) {
    console.error("Could not find boundaries for Step 5 and 6!");
    process.exit(1);
}

const newStep5 = `{/* Step 5: Color & Decor */}
            <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200/60 transition-all duration-300">
              <div 
                className={\`flex items-center justify-between cursor-pointer \${activeStep === 5 ? 'mb-6' : ''}\`}
                onClick={() => setActiveStep(5)}
              >
                <div className="flex items-center gap-3">
                  <div className={\`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors \${activeStep === 5 ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}\`}>5</div>
                  <h2 className={\`text-xl font-bold transition-colors \${activeStep === 5 ? 'text-slate-800' : 'text-slate-400'}\`}>{t('configurator.steps.color')}</h2>
                </div>
                {activeStep !== 5 && <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full uppercase tracking-wider">In: {COLOR_LOCALE.colors[state.interiorColor]?.name} | Ex: {COLOR_LOCALE.colors[state.exteriorColor]?.name}</div>}
              </div>
              
              <div className={\`grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] \${activeStep === 5 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}\`}>
                <div className="overflow-hidden">
                  <div className="pt-2">

                    {/* Dual Color Tabs */}
                    <div className="flex gap-2 w-full mb-6 p-1 bg-slate-100 rounded-xl">
                      <button 
                        onClick={() => setColorTab('interior')} 
                        className={\`flex-1 py-3 text-sm tracking-widest uppercase font-bold rounded-lg transition-all shadow-sm \${colorTab === 'interior' ? 'bg-white text-indigo-600 ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'}\`}
                      >
                        Interior Color
                      </button>
                      <button 
                        onClick={() => setColorTab('exterior')} 
                        className={\`flex-1 py-3 text-sm tracking-widest uppercase font-bold rounded-lg transition-all shadow-sm \${colorTab === 'exterior' ? 'bg-white text-indigo-600 ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'}\`}
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
                            className={\`flex-1 md:flex-none px-4 py-2.5 rounded-lg text-sm font-bold transition-all \${activeGrp === grp ? 'bg-white text-indigo-700 shadow shadow-indigo-600/10' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}\`}
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
                                // Auto advance ONLY if exterior is chosen, else swap tab
                                if (colorTab === 'interior') {
                                    setColorTab('exterior');
                                } else {
                                    setTimeout(() => setActiveStep(6), 350); 
                                }
                              }}
                              className={\`relative group h-28 rounded-xl border-2 overflow-hidden flex flex-col items-center justify-center transition-all duration-300 \${isActive ? 'border-indigo-600 ring-4 ring-indigo-600/20 shadow-md' : 'border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md'}\`}
                            >
                              <div
                                className={\`absolute inset-0 bg-cover bg-center transition-all duration-500 ease-out \${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-125 group-hover:opacity-100 group-hover:scale-100'}\`}
                                style={{ backgroundImage: colorData.swatch }}
                              />
                              <div className={\`absolute inset-0 bg-black/40 transition-opacity duration-300 \${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}\`} />
                              <div 
                                className={\`w-12 h-12 rounded-full shadow-inner border border-slate-900/20 z-10 bg-cover bg-center transition-all duration-500 ease-out \${isActive ? 'scale-[2.5] opacity-0' : 'scale-100 opacity-100 group-hover:scale-[2.5] group-hover:opacity-0'}\`}
                                style={{ backgroundImage: colorData.swatch }}
                              />
                              <div className={\`absolute bottom-3 font-bold text-xs leading-tight z-20 px-2 text-center w-full transition-all duration-300 \${isActive ? 'text-white drop-shadow-md translate-y-0' : 'text-slate-800 drop-shadow-sm group-hover:text-white group-hover:drop-shadow-md group-hover:translate-y-0 translate-y-2'}\`}>
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

            `;

code = code.substring(0, step5Start) + newStep5 + code.substring(step6Start);

// Now Sidebar Replacement via Regex to avoid invisible whitespace mismatches
const sidebarRegex = /<button onClick=\{\(\) => setActiveStep\(5\)\} className="flex w-full text-left justify-between items-center group py-2 -mx-2 px-2 rounded-lg hover:bg-slate-50 transition-colors">[\s\S]*?<\/button>/;

const sidebarNew = \`<button onClick={() => {setActiveStep(5); setColorTab('interior')}} className="flex w-full text-left justify-between items-center group py-2 -mx-2 px-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <span className="text-slate-500 group-hover:text-indigo-600 font-medium text-xs uppercase tracking-wider transition-colors">Interior Color</span> 
                      <span className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors line-clamp-1">{COLOR_LOCALE.colors[state.interiorColor]?.name || state.interiorColor}</span>
                    </button>
                    <button onClick={() => {setActiveStep(5); setColorTab('exterior')}} className="flex w-full text-left justify-between items-center group py-2 -mx-2 px-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <span className="text-slate-500 group-hover:text-indigo-600 font-medium text-xs uppercase tracking-wider transition-colors">Exterior Color</span> 
                      <span className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors line-clamp-1">{COLOR_LOCALE.colors[state.exteriorColor]?.name || state.exteriorColor}</span>
                    </button>\`;

code = code.replace(sidebarRegex, sidebarNew);

fs.writeFileSync('./src/components/SlateConfigurator/MainConfigurator.tsx', code);
console.log('MainConfigurator Step 5 and Summary structurally refactored successfully.');
