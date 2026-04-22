import { useEffect, useState } from 'react';
import { fetchPrice, type PricingApiResponse } from '../utils/cantorPricing/pricingApi';
import type { ConfiguratorInput } from '../utils/cantorPricing/input';
import { CONFIG_SCHEMA, WINDOW_TYPES, COLOR_LOCALE, SINGLE_PANES, PROFILE_GLAZING_LIMITS } from '../components/SlateConfigurator/types';
import { WindowVisualizer } from '../components/SlateConfigurator/WindowVisualizer';

const getPaneImage = (paneCode: string) => {
  if (!paneCode) return null;
  if (paneCode.includes('B1') || paneCode.includes('B2') || paneCode.includes('VSG') || paneCode.includes('33.1') || paneCode.includes('33.2')) return 'segura-331.webp';
  if (paneCode.includes('M4') || paneCode.includes('SAT')) return 'segura-332-mat.webp';
  if (paneCode.includes('ADB')) return 'antisol-blue-6.webp';
  if (paneCode.includes('SR')) return 'float-6.webp';
  return 'float-4.webp'; // fallback for FL, T, etc.
};

export function DebugPricing() {
  // 1) & 2) Profile System & Typology
  const [typology, setTypology] = useState<string>('F100');
  const [isTypologyOpen, setIsTypologyOpen] = useState(false);
  const [opening] = useState<string>('UR');
  const [profilsatz, setProfilsatz] = useState('IG5');

  // 3) Dimensions
  const [width, setWidth] = useState(1000);
  const [height, setHeight] = useState(1000);

  // 4) Glazing Options
  const [infills, setInfills] = useState([
    { code: '2-24', pane1: 'FL4', pane2: 'T4', pane3: '', frameStyle: 'S', width: '', height: '' },
    { code: '2-24', pane1: 'FL4', pane2: 'T4', pane3: '', frameStyle: 'S', width: '', height: '' }
  ]);

  // 5) Joinery colors
  const [colorType, setColorType] = useState('DEK-DEK');
  const [colorCode, setColorCode] = useState('0006');
  const [isColorCodeOpen, setIsColorCodeOpen] = useState(false);
  const [interiorColorCode, setInteriorColorCode] = useState('');
  const [isInteriorColorCodeOpen, setIsInteriorColorCodeOpen] = useState(false);
  const [overwriteCoreColor, setOverwriteCoreColor] = useState(false);
  const [coreColor, setCoreColor] = useState('');
  const [isCoreColorOpen, setIsCoreColorOpen] = useState(false);

  // 6) Window options
  const [windowUnit, setWindowUnit] = useState('');
  const [safetyClass, setSafetyClass] = useState('');
  const [model, setModel] = useState('');
  const [hardwareSystem, setHardwareSystem] = useState('');
  const [handleType, setHandleType] = useState('');
  const [handleColor, setHandleColor] = useState('');
  const [coverColor, setCoverColor] = useState('');

  // 7) Profile options
  const [frameProfile, setFrameProfile] = useState('50001');
  const [weld, setWeld] = useState('standard');
  const [glazingBeadStyle, setGlazingBeadStyle] = useState('Z');
  const [frameReinforcement, setFrameReinforcement] = useState('standard');

  // 8) Seals
  const [sealColor, setSealColor] = useState('');

  // 10) Shutter options
  const [rollerBlindType, setRollerBlindType] = useState('');
  const [windowScreen, setWindowScreen] = useState('');

  // 11) Pancerz
  const [curtainType, setCurtainType] = useState('');
  const [finsPerforation, setFinsPerforation] = useState('');
  const [curtainColor, setCurtainColor] = useState('');
  const [bottomSlatColor, setBottomSlatColor] = useState('');

  // 12) Service - Field I
  const [driveType, setDriveType] = useState('');
  const [controlSide, setControlSide] = useState('');

  // 13) Service
  const [doorChecksTypeI, setDoorChecksTypeI] = useState('');
  const [imposeArbour, setImposeArbour] = useState('');

  // 14) Box
  const [boxType, setBoxType] = useState('');
  const [outerBoxColor, setOuterBoxColor] = useState('');
  const [otherBoxColor, setOtherBoxColor] = useState('');
  const [plasterCarrier, setPlasterCarrier] = useState('');
  const [flushMountedSlatIn, setFlushMountedSlatIn] = useState('');
  const [flushMountedSlatOut, setFlushMountedSlatOut] = useState('');
  const [review, setReview] = useState('');
  const [sideCoverCapColor, setSideCoverCapColor] = useState('');

  // 15) Guide rails
  const [guideRailsColor, setGuideRailsColor] = useState('');
  const [guideRailsCutting, setGuideRailsCutting] = useState('');
  const [extremeLeftGuideRail, setExtremeLeftGuideRail] = useState('');
  const [extremeRightGuideRail, setExtremeRightGuideRail] = useState('');
  const [guideRailsTypes, setGuideRailsTypes] = useState('');

  // 16) Other
  const [guideRailGasketing, setGuideRailGasketing] = useState('');
  const [soundproofMat, setSoundproofMat] = useState('');

  // 17) Dowel holes
  const [dowelHoles, setDowelHoles] = useState('');

  // 18) Grilles/Door infills
  const [grilleType, setGrilleType] = useState('');
  const [grilleFields, setGrilleFields] = useState(4);


  const [result, setResult] = useState<PricingApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Debounce input changes so we don't spam the API on every keypress.
  useEffect(() => {
    const input: ConfiguratorInput = {
      article: typology,
      profilsatz,
      materialart: 2,
      beschvar: opening === 'UR' ? 'UR-P' : 'FIX',
      width_mm: width,
      height_mm: height,
      sashCount: 1,
      openings: [opening as any],
      windowUnit: windowUnit || undefined,
      model: model || undefined,
      color: { 
        type: colorType, 
        code: colorCode, 
        exteriorRal: colorCode, 
        interiorRal: interiorColorCode || undefined,
        overwriteCoreColor,
        coreColor: coreColor || undefined
      },
      frameProfile: frameProfile || '50001',
      sashProfile: '50011',
      infills: (typology.match(/^F2[0-5][0-9]$/) ? infills : [infills[0]]).map(inf => ({
        code: inf.code,
        panes: inf.code.startsWith('3-') ? [inf.pane1, inf.pane2, inf.pane3].filter(Boolean) : [inf.pane1, inf.pane2].filter(Boolean),
        spacer: inf.frameStyle || 'S',
        width_mm: inf.width ? Number(inf.width) : undefined,
        height_mm: inf.height ? Number(inf.height) : undefined
      })),
      options: {
        grilleType: grilleType || undefined,
        grilleFields: grilleType ? grilleFields : undefined,
        sealColor: sealColor || undefined,
        beadStyle: glazingBeadStyle as 'Z'|'P',
        weldType: weld as 'standard'|'v-perfect',
        frameReinforcement: frameReinforcement as 'standard'|'full',
        dowelHoles: dowelHoles || undefined,
      },
      hardware: {
        safetyClass: safetyClass || undefined,
        handleType: handleType || undefined,
        handleColor: handleColor || undefined,
        coverColor: coverColor || undefined
      },
      schwelle: 0,
      dealer: { kundenNr: 1008, pricelistKurzbez: 'EUR23011', land: 'CH' },
    };
    const t = setTimeout(() => {
      setLoading(true);
      setError(null);
      fetchPrice({ input })
        .then(r => { setResult(r); setLoading(false); })
        .catch(e => { setError(e.message); setLoading(false); });
    }, 200);
    return () => clearTimeout(t);
  }, [
    typology, width, height, profilsatz, colorType, colorCode, JSON.stringify(infills), 
    safetyClass, handleType, handleColor, 
    coverColor, opening, frameProfile, interiorColorCode, overwriteCoreColor,
    coreColor, windowUnit, model
  ]);

  // Group colors for dropdowns
  const groupedColors = Object.entries(COLOR_LOCALE.colors || {}).reduce((acc: any, [key, val]: any) => {
    const group = val.group || 'Other';
    if (!acc[group]) acc[group] = [];
    const cantorCode = key.replace('c', '').padStart(4, '0');
    let bgUrl = '';
    if (val.swatch && val.swatch.includes('url(')) {
      bgUrl = val.swatch.match(/url\(['"]?(.*?)['"]?\)/)?.[1] || '';
    }
    acc[group].push({ code: cantorCode, name: val.name, originalKey: key, swatchUrl: bgUrl });
    return acc;
  }, {});

  const HARDWARE_COLORS = [
    { code: 'bialy', name: 'White (biały)' },
    { code: 'braz', name: 'Brown (brąz)' },
    { code: 'srebrny', name: 'Silver (srebrny)' },
    { code: 'tytan', name: 'Titanium (tytan)' },
    { code: 'szampan', name: 'Champagne (szampan)' },
    { code: 'zloty', name: 'Gold (złoty)' },
    { code: 'F9', name: 'F9 (Titanium / Silver)' }
  ];

  const FRAME_STYLES = [
    { code: 'BI', name: 'Ultimate white (RAL 9016)', hex: '#f4f8f4', ext: 'jpg' },
    { code: 'JB', name: 'Ultimate light brown (RAL 8003)', hex: '#8a5a44', ext: 'jpg' },
    { code: 'JS', name: 'Ultimate light grey (RAL 7035)', hex: '#c5c7c4', ext: 'jpg' },
    { code: 'S', name: 'Steel', hex: '#b0b5b9', ext: 'jpg' },
    { code: 'U', name: 'Ultimate grey (RAL 9023)', hex: '#797b7a', ext: 'webp' },
    { code: 'UC', name: 'Ultimate black (RAL 9005)', hex: '#0a0a0a', ext: 'jpg' },
    { code: 'X', name: 'Ultimate brown', hex: '#59351f', ext: 'jpg' }
  ];

  const TYPOLOGY_GROUPS = [
    {
      category: "Windows",
      subgroups: [
        { name: "TYPE 1 Window", ids: ["F100","F101","F103","F104","F105","F106","F200","F201","F203","F204","F205","F206","F207","F208","F250","F251","F252","F253","F254","F255","F300","F301","F302","F303","F304","F350","F351","F352","F353","F309","F400","F401","F402","F403","F450","F451","F542","F453"] },
      ]
    }
  ];

  const PROFILE_SYSTEMS = [
    {
      group: "Available Systems",
      options: [
        { val: "CVP", label: "CVP" },
        { val: "IG5", label: "IGLO 5" },
        { val: "IG5 PP PSK", label: "IGLO 5 PP PSK" },
        { val: "IG5CL", label: "IGLO 5 CLASSIC" },
        { val: "IGE", label: "IGLO ENERGY" },
        { val: "IGECL", label: "IGLO ENERGY CLASSIC" },
        { val: "MB86N", label: "MB-86N" }
      ]
    }
  ];

  // Helper for generic unmapped dropdowns
  const GenericSelect = ({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) => (
    <div>
      <label className="block text-[10px] font-bold mb-1 text-gray-400 uppercase">{label}</label>
      <select className="w-full bg-black border border-gray-800 rounded p-2 text-white text-sm focus:border-[#eab676] focus:outline-none"
        value={value} onChange={e => onChange(e.target.value)}>
        <option value="">-- Select option --</option>
        <option value="opt1">Option 1</option>
        <option value="opt2">Option 2</option>
      </select>
    </div>
  );

  // Helper for color dropdowns with swatches
  const ColorSelect = ({ label, value, onChange, isOpen, setIsOpen, groupedOptions }: { label: string, value: string, onChange: (v: string) => void, isOpen: boolean, setIsOpen: (v: boolean) => void, groupedOptions: any }) => {
    const flatOpts = Object.values(groupedOptions).flat() as any[];
    const activeOpt = flatOpts.find(o => o.code === value);

    return (
      <div className="relative z-20">
        <label className="block text-[10px] font-bold mb-1 text-gray-400 uppercase">{label}</label>
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-black border border-gray-800 rounded p-2 text-white text-sm cursor-pointer flex items-center justify-between hover:border-[#eab676] transition-colors h-[38px]"
        >
          <div className="flex items-center gap-3">
             {activeOpt && activeOpt.swatchUrl ? (
                <div className="w-5 h-5 rounded-sm border border-gray-600 shadow-inner" style={{ backgroundImage: `url(${activeOpt.swatchUrl})`, backgroundSize: 'cover' }}></div>
             ) : (
                <div className="w-5 h-5 rounded-sm border border-gray-600 shadow-inner bg-gray-800"></div>
             )}
             <span>{activeOpt ? `${activeOpt.code} - ${activeOpt.name}` : '-- Default --'}</span>
          </div>
          <span className="text-gray-500 text-xs">▼</span>
        </div>
        
        {isOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)}></div>
            <div className="absolute top-full left-0 mt-1 w-full bg-[#151515] border border-gray-700 rounded-lg shadow-2xl z-40 max-h-[300px] overflow-y-auto">
              <div 
                onClick={() => { onChange(''); setIsOpen(false); }} 
                className="p-2 hover:bg-[#eab676]/20 cursor-pointer flex items-center gap-3 border-b border-gray-800 text-sm"
              >
                 <div className="w-5 h-5 rounded-sm border border-gray-600 shadow-inner bg-gray-800"></div>
                 <span>-- Default --</span>
              </div>
              {Object.entries(groupedOptions).map(([group, opts]: any) => (
                <div key={group}>
                  <div className="p-1 px-2 bg-[#0a0a0a] text-[10px] text-[#eab676] font-bold uppercase tracking-wide border-y border-gray-800 sticky top-0 z-10 shadow-sm">
                    {group}
                  </div>
                  {opts.map((opt: any) => (
                    <div 
                      key={opt.code} 
                      onClick={() => { onChange(opt.code); setIsOpen(false); }} 
                      className="p-2 hover:bg-[#eab676]/20 cursor-pointer flex items-center gap-3 border-b border-gray-800 transition-colors text-sm"
                    >
                       {opt.swatchUrl ? (
                         <div className="w-5 h-5 rounded-sm border border-gray-600 shadow-inner shrink-0" style={{ backgroundImage: `url(${opt.swatchUrl})`, backgroundSize: 'cover' }}></div>
                       ) : (
                         <div className="w-5 h-5 rounded-sm border border-gray-600 shadow-inner shrink-0 bg-gray-800"></div>
                       )}
                       <div className="flex flex-col">
                         <span>{opt.code} - {opt.name}</span>
                       </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 pt-32">
      <div className="max-w-7xl mx-auto grid md:grid-cols-[1fr_400px] gap-8">
        
        {/* LEFT COLUMN: Configurator Options */}
        <div className="bg-[#111] p-6 rounded-xl border border-gray-800 shadow-2xl flex flex-col gap-6 overflow-y-auto max-h-[85vh]">
          
          <h2 className="text-[#eab676] font-bold text-xl uppercase border-b border-gray-800 pb-2">Configurator Options</h2>

          <div className="flex justify-center items-center gap-8 mb-6 relative">
            <div className="absolute top-0 left-0 text-[#eab676] font-bold text-sm tracking-widest uppercase">1) Image of profile (eg Iglo 5 etc.)</div>
            {/* Image of the chosen profile system above Option 1 */}
            <div className="h-32 flex-1 flex justify-end mt-6">
              <img 
                src={`/assets/profiles/${profilsatz}.png`} 
                alt={profilsatz} 
                className="max-h-32 object-contain"
                onError={(e) => { 
                  e.currentTarget.style.display = 'none'; 
                  if (!e.currentTarget.parentElement?.querySelector('.fallback')) {
                    e.currentTarget.parentElement!.innerHTML += `<div class="fallback h-32 w-48 flex items-center justify-center border border-gray-800 rounded bg-black text-gray-500 font-bold">${profilsatz}</div>`;
                  }
                }}
              />
            </div>
            
            <div className="text-gray-600 font-bold text-2xl">+</div>

            {/* Image of the window opening/type */}
            <div className="flex-[2] flex justify-center w-full max-w-sm">
              <WindowVisualizer width={width} height={height} typology={typology} infills={infills} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 items-end">
            {/* 1) Product Number (Window opening/type) */}
            <div>
              <label className="block text-[10px] font-bold mb-1 text-gray-400 uppercase">1) Product Number (Window opening/type)</label>
              <div 
                onClick={() => setIsTypologyOpen(!isTypologyOpen)}
                className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white cursor-pointer flex items-center justify-between hover:border-[#eab676] transition-colors h-[68px]"
              >
                <div className="flex items-center gap-3">
                   <img 
                     src={`/assets/windowtypes/${typology}.jpg`} 
                     className="w-10 h-10 object-contain rounded bg-white shrink-0 p-1"
                     onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.children[1].classList.remove('hidden'); }}
                     alt={typology} 
                   />
                   <div className="w-10 h-10 rounded border border-gray-600 shadow-inner shrink-0 hidden items-center justify-center bg-gray-800 text-[10px]">{typology}</div>
                   <div className="flex flex-col">
                     <span className="font-bold text-sm leading-tight">{typology}</span>
                   </div>
                </div>
                <span className="text-gray-500 text-xs">▼</span>
              </div>
              
              {isTypologyOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsTypologyOpen(false)}></div>
                  <div className="absolute top-1/2 left-1/4 w-[400px] mt-1 bg-[#151515] border border-gray-700 rounded-lg shadow-2xl z-50 pb-1 max-h-[500px] overflow-y-auto">
                    {TYPOLOGY_GROUPS.map((group, gIdx) => (
                      <div key={gIdx}>
                        <div className="p-2 border-b border-gray-800 bg-[#0a0a0a] sticky top-0 z-10 text-xs text-[#eab676] font-bold uppercase tracking-widest shadow-sm">
                          {group.category}
                        </div>
                        {group.subgroups.map((subg, sIdx) => (
                          <div key={sIdx}>
                            <div className="p-1 px-3 bg-[#111] text-[10px] text-gray-500 font-bold uppercase tracking-wide border-b border-gray-800">
                              {subg.name}
                            </div>
                            {subg.ids.map(id => {
                                const wt = WINDOW_TYPES.find(w => w.id === id) || { id, sashes: 1, name: 'Frame' };
                                return (
                                  <div 
                                    key={id} 
                                    onClick={() => { setTypology(id); setIsTypologyOpen(false); }} 
                                    className="p-3 hover:bg-[#eab676]/20 cursor-pointer flex items-center gap-4 border-b border-gray-800 transition-colors"
                                  >
                                     <img 
                                       src={`/assets/windowtypes/${id}.jpg`} 
                                       className="w-16 h-16 object-contain rounded bg-white p-1 shrink-0"
                                       onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.children[1].classList.remove('hidden'); }}
                                       alt={id} 
                                     />
                                     <div className="w-16 h-16 rounded border border-gray-600 shadow-inner shrink-0 hidden items-center justify-center bg-gray-800 font-bold">{id}</div>
                                     <div className="flex flex-col">
                                       <span className="font-bold text-white mb-1">{id}</span>
                                       <span className="text-xs text-gray-400 leading-tight">{wt.name || 'Window'}</span>
                                       <span className="text-[10px] text-gray-500 uppercase mt-1">{wt.sashes} sash{wt.sashes !== 1 ? 'es' : ''}</span>
                                     </div>
                                  </div>
                                );
                            })}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* 2) Profile System */}
            <div>
              <label className="block text-[10px] font-bold mb-1 text-gray-400 uppercase">2) Profile System</label>
              <select className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-[#eab676] focus:outline-none h-[68px]"
                value={profilsatz} onChange={e => setProfilsatz(e.target.value)}>
                {PROFILE_SYSTEMS.map((psGroup, idx) => (
                  <optgroup key={idx} label={psGroup.group}>
                    {psGroup.options.map(opt => (
                      <option key={opt.val} value={opt.val}>{opt.val} — {opt.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          {/* 3) Dimensions */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold mb-1 text-gray-400 uppercase">3) Width (mm)</label>
              <input type="number" className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-[#eab676] focus:outline-none"
                value={width} onChange={e => setWidth(Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-[10px] font-bold mb-1 text-gray-400 uppercase">Height (mm)</label>
              <input type="number" className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-[#eab676] focus:outline-none"
                value={height} onChange={e => setHeight(Number(e.target.value))} />
            </div>
          </div>

          <hr className="border-gray-800 my-2" />

          {/* 4) Glazing Options / Infills */}
          {(typology.match(/^F2[0-5][0-9]$/) ? [0, 1] : [0]).map((infillIdx) => {
            const inf = infills[infillIdx];
            const updateInf = (field: string, val: string | number) => {
              const newInf = [...infills];
              newInf[infillIdx] = { ...newInf[infillIdx], [field]: val };
              setInfills(newInf);
            };
            return (
              <div key={infillIdx}>
                <h3 className="text-[#eab676] font-bold mt-6 mb-4 uppercase tracking-wider text-sm">
                  4) Glazing Options / Infill {typology.match(/^F2[0-5][0-9]$/) ? infillIdx + 1 : ''}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold mb-1 text-gray-400 uppercase">a) Package Code</label>
                    <select className="w-full bg-black border border-gray-800 rounded p-2 text-white text-sm"
                      value={inf.code} onChange={e => updateInf('code', e.target.value)}>
                      <optgroup label="Standard Glazing">
                        {CONFIG_SCHEMA.glazing
                          .filter(g => g.group !== 'Non Glazing')
                          .filter(g => {
                            const limits = PROFILE_GLAZING_LIMITS[profilsatz] || PROFILE_GLAZING_LIMITS['DEFAULT'];
                            return limits.packages.includes(g.id);
                          })
                          .map(g => (
                            <option key={g.id} value={g.id}>{g.id} ({g.name})</option>
                        ))}
                      </optgroup>
                      <optgroup label="Non Glazing / Blinds">
                        {CONFIG_SCHEMA.glazing.filter(g => g.group === 'Non Glazing').map(g => (
                            <option key={g.id} value={g.id}>{g.id} ({g.name})</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                  
                  {typology.match(/^F2[0-5][0-9]$/) && (
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold mb-1 text-gray-400 uppercase">Width (mm)</label>
                        <input type="number" className="w-full bg-black border border-gray-800 rounded p-2 text-white text-sm"
                          value={inf.width} onChange={e => updateInf('width', e.target.value)} placeholder="Auto" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold mb-1 text-gray-400 uppercase">Height (mm)</label>
                        <input type="number" className="w-full bg-black border border-gray-800 rounded p-2 text-white text-sm"
                          value={inf.height} onChange={e => updateInf('height', e.target.value)} placeholder="Auto" />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold mb-1 text-gray-400 uppercase">b) Pane 1 (Outside)</label>
                      <select className="w-full bg-black border border-gray-800 rounded p-2 text-white text-sm"
                        value={inf.pane1} onChange={e => updateInf('pane1', e.target.value)}>
                        <option value="">-- None --</option>
                        {SINGLE_PANES.map(p => <option key={p.code} value={p.code}>{p.code} - {p.name}</option>)}
                      </select>
                    </div>
                    {inf.pane1 && (
                      <div className="flex-none bg-white border border-gray-800 rounded overflow-hidden flex items-center justify-center min-w-[60px] max-w-[60px]">
                        <img src={`/assets/glass/thumbs/${getPaneImage(inf.pane1)}`} alt={`Pane ${inf.pane1}`} className="max-h-16 w-full object-cover mix-blend-multiply" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold mb-1 text-gray-400 uppercase">c) Pane 2 (Middle)</label>
                      <select className="w-full bg-black border border-gray-800 rounded p-2 text-white text-sm"
                        value={inf.pane2} onChange={e => updateInf('pane2', e.target.value)}>
                        <option value="">-- None --</option>
                        {SINGLE_PANES.map(p => <option key={p.code} value={p.code}>{p.code} - {p.name}</option>)}
                      </select>
                    </div>
                    {inf.pane2 && (
                      <div className="flex-none bg-white border border-gray-800 rounded overflow-hidden flex items-center justify-center min-w-[60px] max-w-[60px]">
                        <img src={`/assets/glass/thumbs/${getPaneImage(inf.pane2)}`} alt={`Pane ${inf.pane2}`} className="max-h-16 w-full object-cover mix-blend-multiply" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold mb-1 text-gray-400 uppercase">d) Pane 3 (Inside)</label>
                      <select className="w-full bg-black border border-gray-800 rounded p-2 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        value={inf.pane3} onChange={e => updateInf('pane3', e.target.value)} disabled={inf.code.startsWith('2-')}>
                        <option value="">-- None --</option>
                        {SINGLE_PANES.map(p => <option key={p.code} value={p.code}>{p.code} - {p.name}</option>)}
                      </select>
                    </div>
                    {inf.pane3 && inf.code.startsWith('3-') && (
                      <div className="flex-none bg-white border border-gray-800 rounded overflow-hidden flex items-center justify-center min-w-[60px] max-w-[60px]">
                        <img src={`/assets/glass/thumbs/${getPaneImage(inf.pane3)}`} alt={`Pane ${inf.pane3}`} className="max-h-16 w-full object-cover mix-blend-multiply" />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4 mt-4">           
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold mb-1 text-gray-400 uppercase">e) Frame Style (Spacer / Frame Style)</label>
                      <select className="w-full bg-black border border-gray-800 rounded p-2 text-white text-sm"
                        value={inf.frameStyle} onChange={e => updateInf('frameStyle', e.target.value)}>
                        <option value="">-- None --</option>
                        {FRAME_STYLES.map(fs => <option key={fs.code} value={fs.code}>{fs.code} - {fs.name}</option>)}
                      </select>
                    </div>
                    {inf.frameStyle && (
                      <div className="flex-none bg-white border border-gray-800 rounded overflow-hidden flex items-center justify-center min-w-[120px] max-w-[120px]">
                        <img 
                          src={`/assets/spacers/${inf.frameStyle === 'U' ? 'U.webp' : inf.frameStyle + '.jpg'}`} 
                          alt={`Spacer ${inf.frameStyle}`} 
                          className="max-h-24 w-full object-contain mix-blend-multiply" 
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <hr className="border-gray-800 my-2" />

          {/* 5) Joinery colors */}
          <div>
            <h3 className="text-[#eab676] font-bold mb-4 uppercase tracking-wider text-sm">5) ---Joinery colors---</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold mb-1 text-gray-400 uppercase">a) Color (options W-W etc.)</label>
                <select className="w-full bg-black border border-gray-800 rounded p-2 text-white text-sm"
                  value={colorType} onChange={e => setColorType(e.target.value)}>
                  <option value="W-W">W-W (White / White)</option>
                  <option value="DEK-DEK">DEK-DEK (Decor / Decor)</option>
                  <option value="W-DEK">W-DEK (White / Decor)</option>
                  <option value="DEK-W">DEK-W (Decor / White)</option>
                </select>
              </div>
              <ColorSelect label="b) Exterior color code" value={colorCode} onChange={setColorCode} isOpen={isColorCodeOpen} setIsOpen={setIsColorCodeOpen} groupedOptions={groupedColors} />
              <ColorSelect label="c) Interior color code" value={interiorColorCode} onChange={setInteriorColorCode} isOpen={isInteriorColorCodeOpen} setIsOpen={setIsInteriorColorCodeOpen} groupedOptions={groupedColors} />
              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 text-sm text-gray-300 pb-2">
                  <input type="checkbox" checked={overwriteCoreColor} onChange={e => setOverwriteCoreColor(e.target.checked)} className="rounded border-gray-700 bg-black text-[#eab676] focus:ring-[#eab676]" />
                  d) Overwrite the default core colour
                </label>
              </div>
              <ColorSelect label="e) Core color" value={coreColor} onChange={setCoreColor} isOpen={isCoreColorOpen} setIsOpen={setIsCoreColorOpen} groupedOptions={groupedColors} />
            </div>
          </div>

          <hr className="border-gray-800 my-2" />

          {/* 6) Window options */}
          <div>
            <h3 className="text-[#eab676] font-bold mb-4 uppercase tracking-wider text-sm">6) ---Window options---</h3>
            <div className="grid grid-cols-2 gap-4">
              <GenericSelect label="a) Window options - unit" value={windowUnit} onChange={setWindowUnit} />
              
              <div>
                <label className="block text-[10px] font-bold mb-1 text-gray-400 uppercase">b) Fitting safety class (options)</label>
                <select className="w-full bg-black border border-gray-800 rounded p-2 text-white text-sm"
                  value={safetyClass} onChange={e => setSafetyClass(e.target.value)}>
                   <option value="">STD (Standard)</option>
                   <option value="RC1">RC1</option>
                   <option value="RC2">RC2</option>
                   <option value="RC2N">RC2N</option>
                   <option value="4ZA">4ZA</option>
                </select>
              </div>

              <GenericSelect label="c) Model (options)" value={model} onChange={setModel} />
              <GenericSelect label="d) Hardware system (options)" value={hardwareSystem} onChange={setHardwareSystem} />
              
              <div>
                <label className="block text-[10px] font-bold mb-1 text-gray-400 uppercase">e) Handle type (options)</label>
                <select className="w-full bg-black border border-gray-800 rounded p-2 text-white text-sm"
                  value={handleType} onChange={e => setHandleType(e.target.value)}>
                   <option value="">STD (Standard)</option>
                   <option value="-">- (No holes)</option>
                   <option value="Kwadrat">Kwadrat (Aluminium handle Square)</option>
                   <option value="Atlanta">Atlanta (Hoppe handle Secustic Atlanta)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-[10px] font-bold mb-1 text-gray-400 uppercase">f) Interior handle color (options)</label>
                <select className="w-full bg-black border border-gray-800 rounded p-2 text-white text-sm"
                  value={handleColor} onChange={e => setHandleColor(e.target.value)}>
                   <option value="">-- Default --</option>
                   {HARDWARE_COLORS.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-[10px] font-bold mb-1 text-gray-400 uppercase">g) Fitting covers color (options)</label>
                <select className="w-full bg-black border border-gray-800 rounded p-2 text-white text-sm"
                  value={coverColor} onChange={e => setCoverColor(e.target.value)}>
                   <option value="">-- Default --</option>
                   {HARDWARE_COLORS.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <hr className="border-gray-800 my-2" />

          {/* 7) Profile options */}
          <div>
            <h3 className="text-[#eab676] font-bold mb-4 uppercase tracking-wider text-sm">7) ---Profile options---</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold mb-1 text-gray-400 uppercase">a) Frame profile</label>
                <select className="w-full bg-black border border-gray-800 rounded p-2 text-white text-sm"
                  value={frameProfile} onChange={e => setFrameProfile(e.target.value)}>
                   <option value="50001">50001 (Standard Frame)</option>
                   <option value="50002">50002 (Renovation Frame)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold mb-1 text-gray-400 uppercase">b) Weld type</label>
                <select className="w-full bg-black border border-gray-800 rounded p-2 text-white text-sm"
                  value={weld} onChange={e => setWeld(e.target.value)}>
                   <option value="standard">Standard Weld</option>
                   <option value="v-perfect">V-Perfect (Invisible)</option>
                </select>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-[10px] font-bold mb-1 text-gray-400 uppercase">c) Glazing bead style</label>
                  <select className="w-full bg-black border border-gray-800 rounded p-2 text-white text-sm"
                    value={glazingBeadStyle} onChange={e => setGlazingBeadStyle(e.target.value)}>
                     <option value="Z">Rounded (Z)</option>
                     <option value="P">Rectangular (P)</option>
                  </select>
                </div>
                {glazingBeadStyle && (
                  <div className="flex-none bg-white border border-gray-800 rounded overflow-hidden flex items-center justify-center min-w-[120px] max-w-[120px]">
                    <img 
                      src={`/assets/beads/bead_${glazingBeadStyle}.png`} 
                      alt={`Bead ${glazingBeadStyle}`} 
                      className="max-h-24 w-full object-contain mix-blend-multiply" 
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-bold mb-1 text-gray-400 uppercase">d) Frame reinforcement</label>
                <select className="w-full bg-black border border-gray-800 rounded p-2 text-white text-sm"
                  value={frameReinforcement} onChange={e => setFrameReinforcement(e.target.value)}>
                   <option value="standard">Standard / U-shape</option>
                   <option value="full">Full Closed Steel</option>
                </select>
              </div>
            </div>
          </div>

          <hr className="border-gray-800 my-2" />

          {/* 8) Seals */}
          <div>
            <h3 className="text-[#eab676] font-bold mb-4 uppercase tracking-wider text-sm">8) ---Seals---</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-[10px] font-bold mb-1 text-gray-400 uppercase">a) Gaskets color</label>
                <select className="w-full bg-black border border-gray-800 rounded p-2 text-white text-sm"
                  value={sealColor} onChange={e => setSealColor(e.target.value)}>
                   <option value="">Default / Standard</option>
                   <option value="mix">Mix</option>
                   <option value="czarny/sz">Out black / in grey</option>
                   <option value="czarny">Black</option>
                   <option value="szary">Gray</option>
                   <option value="szary/czar">Out grey / in black</option>
                </select>
              </div>
              {sealColor && (
                <div className="flex-none bg-white border border-gray-800 rounded overflow-hidden flex items-center justify-center min-w-[120px] max-w-[120px]">
                  <img 
                    src={`/assets/seals/${sealColor === 'czarny/sz' ? 'czarny_szary' : sealColor === 'szary/czar' ? 'szary_czarny' : sealColor}.png`} 
                    alt={sealColor} 
                    className="max-h-24 w-full object-contain mix-blend-multiply" 
                  />
                </div>
              )}
            </div>
          </div>

          <hr className="border-gray-800 my-2" />

          {/* 9) Shutter options */}
          <div>
            <h3 className="text-[#eab676] font-bold mb-4 uppercase tracking-wider text-sm">9) ---Shutter options---</h3>
            <div className="grid grid-cols-2 gap-4">
              <GenericSelect label="a) Roller blind Type (options)" value={rollerBlindType} onChange={setRollerBlindType} />
              <GenericSelect label="b) Window screen (options)" value={windowScreen} onChange={setWindowScreen} />
            </div>
          </div>

          <hr className="border-gray-800 my-2" />

          {/* 10) Pancerz */}
          <div>
            <h3 className="text-[#eab676] font-bold mb-4 uppercase tracking-wider text-sm">10) ---Pancerz---</h3>
            <div className="grid grid-cols-2 gap-4">
              <GenericSelect label="a) Curtain type (options)" value={curtainType} onChange={setCurtainType} />
              <GenericSelect label="b) Fins perforation (options)" value={finsPerforation} onChange={setFinsPerforation} />
              <GenericSelect label="c) Curtain color (options)" value={curtainColor} onChange={setCurtainColor} />
              <GenericSelect label="d) Bottom slat colour (options)" value={bottomSlatColor} onChange={setBottomSlatColor} />
            </div>
          </div>

          <hr className="border-gray-800 my-2" />

          {/* 11) Service - Field I */}
          <div>
            <h3 className="text-[#eab676] font-bold mb-4 uppercase tracking-wider text-sm">11) ---Service - Field I---</h3>
            <div className="grid grid-cols-2 gap-4">
              <GenericSelect label="a) Drive Type (options)" value={driveType} onChange={setDriveType} />
              <GenericSelect label="b) Control side (options)" value={controlSide} onChange={setControlSide} />
            </div>
          </div>

          <hr className="border-gray-800 my-2" />

          {/* 12) Service */}
          <div>
            <h3 className="text-[#eab676] font-bold mb-4 uppercase tracking-wider text-sm">12) ---Service---</h3>
            <div className="grid grid-cols-2 gap-4">
              <GenericSelect label="a) Door checks Type I (options)" value={doorChecksTypeI} onChange={setDoorChecksTypeI} />
              <GenericSelect label="b) Impose 60mm arbour (options)" value={imposeArbour} onChange={setImposeArbour} />
            </div>
          </div>

          <hr className="border-gray-800 my-2" />

          {/* 13) Box */}
          <div>
            <h3 className="text-[#eab676] font-bold mb-4 uppercase tracking-wider text-sm">13) ---Box---</h3>
            <div className="grid grid-cols-2 gap-4">
              <GenericSelect label="a) Box Type (options)" value={boxType} onChange={setBoxType} />
              <GenericSelect label="b) Outer box colour (options)" value={outerBoxColor} onChange={setOuterBoxColor} />
              <GenericSelect label="c) otherr box colour (options)" value={otherBoxColor} onChange={setOtherBoxColor} />
              <GenericSelect label="d) Plaster carrier (options)" value={plasterCarrier} onChange={setPlasterCarrier} />
              <GenericSelect label="e) Flush-mounted slat (in) (options)" value={flushMountedSlatIn} onChange={setFlushMountedSlatIn} />
              <GenericSelect label="f) Flush-mounted slat (out) (options)" value={flushMountedSlatOut} onChange={setFlushMountedSlatOut} />
              <GenericSelect label="g) Review (options)" value={review} onChange={setReview} />
              <GenericSelect label="h) Side cover cap colour (options)" value={sideCoverCapColor} onChange={setSideCoverCapColor} />
            </div>
          </div>

          <hr className="border-gray-800 my-2" />

          {/* 14) Guide rails */}
          <div>
            <h3 className="text-[#eab676] font-bold mb-4 uppercase tracking-wider text-sm">14) ---Guide rails---</h3>
            <div className="grid grid-cols-2 gap-4">
              <GenericSelect label="a) Guide rails colour (options)" value={guideRailsColor} onChange={setGuideRailsColor} />
              <GenericSelect label="b) Guide rails cutting (options)" value={guideRailsCutting} onChange={setGuideRailsCutting} />
              <GenericSelect label="c) Extreme left guide rail (options)" value={extremeLeftGuideRail} onChange={setExtremeLeftGuideRail} />
              <GenericSelect label="d) Extreme right guide rail (options)" value={extremeRightGuideRail} onChange={setExtremeRightGuideRail} />
              <GenericSelect label="e) Guide rails Types (options)" value={guideRailsTypes} onChange={setGuideRailsTypes} />
            </div>
          </div>

          <hr className="border-gray-800 my-2" />

          {/* 15) Other */}
          <div>
            <h3 className="text-[#eab676] font-bold mb-4 uppercase tracking-wider text-sm">15) ---Other---</h3>
            <div className="grid grid-cols-2 gap-4">
              <GenericSelect label="a) Guide rail gasketing (options)" value={guideRailGasketing} onChange={setGuideRailGasketing} />
              <GenericSelect label="b) Soundproof mat + gasket (options)" value={soundproofMat} onChange={setSoundproofMat} />
            </div>
          </div>

          <hr className="border-gray-800 my-2" />

          {/* 16) Dowel holes */}
          <div>
            <h3 className="text-[#eab676] font-bold mb-4 uppercase tracking-wider text-sm">16) ---Dowel holes---</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold mb-1 text-gray-400 uppercase">a) Dowel holes</label>
                <select className="w-full bg-black border border-gray-800 rounded p-2 text-white text-sm"
                  value={dowelHoles} onChange={e => setDowelHoles(e.target.value)}>
                   <option value="">None</option>
                   <option value="O_14-16">Standard Holes (14-16mm)</option>
                   <option value="ADJUFIX_14/18">Adjufix 14/18</option>
                </select>
              </div>
            </div>
          </div>

          <hr className="border-gray-800 my-2" />

          {/* 17) Grilles / Muntins */}
          <div>
            <h3 className="text-[#eab676] font-bold mb-4 uppercase tracking-wider text-sm">17) ---Grilles & Muntins---</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold mb-1 text-gray-400 uppercase">a) Grille Type</label>
                <select className="w-full bg-black border border-gray-800 rounded p-2 text-white text-sm"
                  value={grilleType} onChange={e => setGrilleType(e.target.value)}>
                   <option value="">None</option>
                   <optgroup label="Internal Grilles (Międzyszybowe)">
                     <option value="SPR08">SPR08 (8mm Internal)</option>
                     <option value="SPR18">SPR18 (18mm Internal)</option>
                     <option value="SPR26">SPR26 (26mm Internal)</option>
                     <option value="SPR45">SPR45 (45mm Internal)</option>
                   </optgroup>
                   <optgroup label="Stick-on Grilles (Naklejane)">
                     <option value="SPRN27">SPRN27 (27mm Stick-on)</option>
                     <option value="SPRN45">SPRN45 (45mm Stick-on)</option>
                   </optgroup>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold mb-1 text-gray-400 uppercase">b) Number of Fields</label>
                <input type="number" className="w-full bg-black border border-gray-800 rounded p-2 text-white text-sm disabled:opacity-50"
                  value={grilleFields} onChange={e => setGrilleFields(Number(e.target.value))} disabled={!grilleType} min={1} max={30} />
              </div>
            </div>
          </div>

        </div>


        {/* RIGHT COLUMN: Current pricing information */}
        <div className="flex flex-col gap-6 max-h-[85vh]">
          {/* Pricing Summary Card */}
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl border border-[#eab676]/30 shadow-lg p-6 font-mono shrink-0">
            <div className="border-b border-gray-800 pb-3 mb-3">
              <h1 className="text-xl font-bold text-[#eab676] uppercase tracking-tighter">Cantor Pricing Engine</h1>
              <p className="text-[10px] text-gray-500 mt-1">Live calculation via SCHEMA 41 PREISE rules</p>
            </div>

            {loading && <div className="text-gray-500 text-sm py-4">Evaluating formulas...</div>}
            {error && <div className="text-red-400 text-sm py-4">Error: {error}</div>}
            {result && !error && (
              <>
                <div className="flex justify-between items-baseline pb-2">
                  <span className="text-xs text-gray-500 uppercase tracking-widest">SCHEMA 41 base (EK)</span>
                  <span className="text-lg text-gray-300">{result.ek_pln.toFixed(2)} PLN</span>
                </div>
                <div className="flex justify-between items-baseline pb-3 border-b border-gray-800">
                  <span className="text-xs text-gray-500 uppercase tracking-widest">PREISZYK × FAKTOR {result.faktor}</span>
                  <span className="text-lg text-gray-300">{result.vk_pln.toFixed(2)} PLN</span>
                </div>
                <div className="flex justify-between items-center pt-3">
                  <span className="text-white font-bold tracking-widest uppercase">Dealer price ({result.currency}):</span>
                  <span className="text-3xl text-emerald-400 font-black">{result.vk_local.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          {/* Pricing Ledger Card */}
          <div className="bg-white text-black p-6 rounded-xl shadow-2xl font-mono text-xs overflow-y-auto flex-1">
            <div className="border-b-2 border-black pb-2 mb-4 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold uppercase tracking-tighter">SCHEMA 41 ledger</h2>
              <div className="text-gray-500 mt-1 text-[10px]">One row per PREISE formula. GRPRS accumulates.</div>
            </div>

            {result && !error && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-black">
                    <th className="py-1 pr-2">#</th>
                    <th className="py-1 pr-2">Description</th>
                    <th className="py-1 pr-2">Gruppe</th>
                    <th className="py-1 text-right">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {result.lines.map((l, i) => (
                    <tr key={i} className={`border-b border-gray-200 ${l.value !== 0 ? 'font-bold' : 'text-gray-400'}`}>
                      <td className="py-1 pr-2">{i + 1}</td>
                      <td className="py-1 pr-2">{l.formelText ?? '(no label)'}</td>
                      <td className="py-1 pr-2">{l.preisgruppe ?? '—'}</td>
                      <td className="py-1 text-right">{l.value.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-black font-black">
                    <td colSpan={3} className="py-2">GRPRS total (EK PLN)</td>
                    <td className="py-2 text-right">{result.ek_pln.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            )}
            {!result && !error && !loading && <div className="text-gray-500">Waiting for first response...</div>}
          </div>
        </div>

      </div>
    </div>
  );
}
