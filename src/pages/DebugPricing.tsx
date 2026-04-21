import { useEffect, useState } from 'react';
import { fetchPrice, type PricingApiResponse } from '../utils/cantorPricing/pricingApi';
import type { ConfiguratorInput } from '../utils/cantorPricing/input';
import { CONFIG_SCHEMA, WINDOW_TYPES, COLOR_LOCALE } from '../components/SlateConfigurator/types';
export function DebugPricing() {
  const [typology, setTypology] = useState<string>('F100');
  const [isTypologyOpen, setIsTypologyOpen] = useState(false);
  const [opening, setOpening] = useState<string>('UR');
  const [width, setWidth] = useState(1000);
  const [height, setHeight] = useState(1000);
  const [profilsatz, setProfilsatz] = useState('IG5');
  const [colorType, setColorType] = useState('DEK-DEK');
  const [colorCode, setColorCode] = useState('0006');

  // Glazing Options
  const [glazingCode, setGlazingCode] = useState('2-24');
  const [pane1, setPane1] = useState('FL4');
  const [pane2, setPane2] = useState('T4');
  const [pane3, setPane3] = useState('');
  const [frameStyle, setFrameStyle] = useState('S');
  const [isFrameStyleOpen, setIsFrameStyleOpen] = useState(false);
  const [isColorCodeOpen, setIsColorCodeOpen] = useState(false);
  
  // Hardware Options
  const [safetyClass, setSafetyClass] = useState('');
  const [handleType, setHandleType] = useState('');
  const [handleColor, setHandleColor] = useState('');
  const [coverColor, setCoverColor] = useState('');

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
      color: { type: colorType, code: colorCode },
      frameProfile: '50001',
      sashProfile: '50011',
      glazing: { 
        code: glazingCode, 
        panes: glazingCode.startsWith('3-') ? [pane1, pane2, pane3].filter(Boolean) : [pane1, pane2].filter(Boolean), 
        spacer: 'S' 
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
  }, [typology, width, height, profilsatz, colorCode, glazingCode, pane1, pane2, pane3, frameStyle, safetyClass, handleType, handleColor, coverColor]);

  // Group colors for dropdowns
  const groupedColors = Object.entries(COLOR_LOCALE.colors || {}).reduce((acc: any, [key, val]: any) => {
    const group = val.group || 'Other';
    if (!acc[group]) acc[group] = [];
    // Convert 'c199' to '0199' etc for cantor
    const cantorCode = key.replace('c', '').padStart(4, '0');
    // Extract url('/...') to clean url, or fallback
    let bgUrl = '';
    if (val.swatch && val.swatch.includes('url(')) {
      bgUrl = val.swatch.match(/url\(['"]?(.*?)['"]?\)/)?.[1] || '';
    }
    acc[group].push({ code: cantorCode, name: val.name, originalKey: key, swatchUrl: bgUrl });
    return acc;
  }, {});

  // Flat array lookup for currently active color code
  const flatColors = Object.values(groupedColors).flat() as {code: string, name: string, swatchUrl: string}[];
  const activeColorObj = flatColors.find(c => c.code === colorCode);

  const isTripleGlazed = glazingCode.startsWith('3-');

  const PANE_OPTIONS = [
    { code: 'FL4', name: 'Float 4mm' },
    { code: 'FL6', name: 'Float 6mm' },
    { code: 'T4', name: 'Thermoline 4mm' },
    { code: 'ADB6H', name: 'Antisol Dark Blue 6mm' },
    { code: 'M4', name: 'Matte 4mm' },
    { code: '33.1', name: 'Safe 33.1' },
    { code: '44.4', name: 'Anti-burglary 44.4' },
    { code: 'VSG', name: 'VSG standard' }
  ];

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
        { name: "Type 01 Window", ids: ["F354","F355"] }
      ]
    },
    {
      category: "Balcony",
      subgroups: [
        { name: "Type 02", ids: ["F284","F285","F370","F372","F373","F380","F384"] },
        { name: "Type 2", ids: ["F150","F151","F152","F153","F210","F270","F271","F272","F273","F274","F280","F281","F282","F283"] }
      ]
    },
    {
      category: "PSK",
      subgroups: [
        { name: "Type 3 PSK", ids: ["P201","P202","P205","P206","P100","P101","P102","P103"] }
      ]
    },
    {
      category: "Door",
      subgroups: [
        { name: "Type 5 Door", ids: ["D100","D101","D102","D200","D201","D211","D212","D300"] }
      ]
    },
    {
      category: "Intermediate profile",
      subgroups: [
        { name: "Type 6", ids: ["R100","R200","R201","R300"] }
      ]
    },
    {
      category: "PSK Intermediate Profile",
      subgroups: [
        { name: "Type 7", ids: ["PP201","PP202","PP205","PP206","PP100","PP101","PP102","PP103"] }
      ]
    },
    {
      category: "Service Door",
      subgroups: [
        { name: "Type 08", ids: ["DS100","DS200"] }
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

  const activeTypologyGroups = TYPOLOGY_GROUPS;

  return (
    <div className="min-h-screen bg-black text-white p-10 pt-32">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">

        <div className="bg-[#111] p-8 rounded-xl border border-gray-800 shadow-2xl flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold text-[#eab676]">Cantor Pricing Engine</h1>
            <p className="text-xs text-gray-500 mt-1">Reads PREISE formulas from local Cantor mirror; evaluates via <code>src/utils/cantorFormula</code>.</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="relative">
              <label className="block text-sm font-bold mb-2">Typology</label>
              <div 
                onClick={() => setIsTypologyOpen(!isTypologyOpen)}
                className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white cursor-pointer flex items-center justify-between hover:border-[#eab676] transition-colors"
              >
                <div className="flex items-center gap-3">
                   <img 
                     src={`/assets/windowtypes/${typology}.jpg`} 
                     className="w-10 h-10 object-contain rounded bg-white shrink-0"
                     onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.children[1].classList.remove('hidden'); }}
                     alt={typology} 
                   />
                   <div className="w-10 h-10 rounded border border-gray-600 shadow-inner shrink-0 hidden items-center justify-center bg-gray-800 text-[10px]">{typology}</div>
                   <div className="flex flex-col">
                     <span className="font-bold text-sm leading-tight">{typology}</span>
                     <span className="text-[10px] text-gray-500">{WINDOW_TYPES.find(wt => wt.id === typology)?.name || 'Window'} ({WINDOW_TYPES.find(wt => wt.id === typology)?.sashes} sash)</span>
                   </div>
                </div>
                <span className="text-gray-500 text-xs">▼</span>
              </div>
              
              {isTypologyOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsTypologyOpen(false)}></div>
                  <div className="absolute top-[100%] left-0 w-full mt-1 bg-[#151515] border border-gray-700 rounded-lg shadow-2xl z-50 pb-1 max-h-[400px] overflow-y-auto">
                    {activeTypologyGroups.map((group, gIdx) => (
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
                                  key={wt.id} 
                                  onClick={() => { setTypology(wt.id); setIsTypologyOpen(false); }}
                                  className="p-3 hover:bg-[#eab676]/20 cursor-pointer flex items-center gap-4 border-b border-gray-800 transition-colors"
                                >
                                   <img 
                                     src={`/assets/windowtypes/${wt.id}.jpg`} 
                                     className="w-16 h-16 object-contain rounded bg-white p-1 shrink-0"
                                     onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.children[1].classList.remove('hidden'); }}
                                     alt={wt.id} 
                                   />
                                   <div className="w-16 h-16 rounded border border-gray-600 shadow-inner shrink-0 hidden items-center justify-center bg-gray-800 font-bold">{wt.id}</div>
                                   <div className="flex flex-col">
                                     <span className="font-bold text-white mb-1">{wt.id}</span>
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
            <div>
              <label className="block text-sm font-bold mb-2">Opening Type</label>
              <select className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-[#eab676] focus:outline-none"
                value={opening} onChange={e => setOpening(e.target.value)}>
                <option value="FIX">FIX (Fixed glazing)</option>
                <option value="DK">DK (Dreh-Kipp Standard)</option>
                <option value="UR-P">UR-P (Tilt & Turn)</option>
                <option value="UR">UR (Tilt & Turn Alternative)</option>
                <option value="U">U (Tilt Only?)</option>
                <option value="D">D (Turn / Dreh)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Profile System</label>
              <select className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-[#eab676] focus:outline-none"
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
            <div>
              <label className="block text-sm font-bold mb-2">Width (mm)</label>
              <input type="number" className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-[#eab676] focus:outline-none"
                value={width} onChange={e => setWidth(Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Height (mm)</label>
              <input type="number" className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-[#eab676] focus:outline-none"
                value={height} onChange={e => setHeight(Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Color Scheme</label>
              <select className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-[#eab676] focus:outline-none"
                value={colorType} onChange={e => setColorType(e.target.value)}>
                <option value="W-W">W-W (White / White)</option>
                <option value="DEK-DEK">DEK-DEK (Decor / Decor)</option>
                <option value="W-DEK">W-DEK (White / Decor)</option>
                <option value="DEK-W">DEK-W (Decor / White)</option>
              </select>
            </div>
            <div className="relative">
              <label className="block text-sm font-bold mb-2">Color code (e.g. 0006)</label>
              
              <div 
                onClick={() => setIsColorCodeOpen(!isColorCodeOpen)}
                className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white cursor-pointer flex items-center justify-between hover:border-[#eab676] transition-colors"
              >
                <div className="flex items-center gap-3">
                   {activeColorObj?.swatchUrl ? (
                     <div className="w-8 h-8 rounded border border-gray-600 shrink-0 bg-cover bg-center" style={{ backgroundImage: `url(${activeColorObj.swatchUrl})` }} />
                   ) : (
                     <div className="w-8 h-8 rounded border border-gray-600 shrink-0 bg-gray-800 flex items-center justify-center text-xs">?</div>
                   )}
                   <div className="flex flex-col">
                     <span className="font-bold text-sm leading-tight">{activeColorObj ? activeColorObj.name : '-- Manual/Default --'}</span>
                     {activeColorObj && <span className="text-[10px] text-gray-500 uppercase">{activeColorObj.code}</span>}
                   </div>
                </div>
                <span className="text-gray-500 text-xs">▼</span>
              </div>
              
              {isColorCodeOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsColorCodeOpen(false)}></div>
                  <div className="absolute top-[100%] left-0 w-full mt-1 bg-[#151515] border border-gray-700 rounded-lg shadow-2xl z-50 pb-1 max-h-[350px] overflow-y-auto">
                    <div 
                      onClick={() => { setColorCode(''); setIsColorCodeOpen(false); }}
                      className="p-3 hover:bg-[#eab676]/20 cursor-pointer flex items-center gap-3 transition-colors text-sm border-b border-gray-800"
                    >
                       <div className="w-8 h-8 rounded border border-gray-600 bg-gray-900 shrink-0 flex items-center justify-center">W-W</div>
                       <span className="text-gray-400">Default Setting</span>
                    </div>

                    {Object.entries(groupedColors).map(([group, colors]: any) => (
                      <div key={group}>
                         <div className="p-2 bg-[#111] sticky top-0 z-10 text-[10px] text-gray-400 font-bold uppercase tracking-widest border-y border-gray-800 shadow-sm">{group}</div>
                         {colors.map((c: any) => (
                            <div 
                              key={c.code} 
                              onClick={() => { setColorCode(c.code); setIsColorCodeOpen(false); }}
                              className="p-2 px-3 hover:bg-[#eab676]/20 cursor-pointer flex items-center gap-3 transition-colors"
                            >
                               {c.swatchUrl ? (
                                 <div className="w-8 h-8 rounded border border-gray-600 shrink-0 bg-cover bg-center" style={{ backgroundImage: `url(${c.swatchUrl})` }} />
                               ) : (
                                 <div className="w-8 h-8 rounded border border-gray-600 shrink-0 bg-gray-800" />
                               )}
                               <div className="flex flex-col">
                                 <span className="text-sm font-bold text-white leading-tight">{c.name}</span>
                                 <span className="text-[10px] text-gray-500 uppercase">Code: {c.code}</span>
                               </div>
                            </div>
                         ))}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="col-span-2 border-t border-gray-800 pt-4 mt-2">
              <h3 className="text-[#eab676] font-bold mb-4">Glazing Options</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1 text-gray-400">Package Code</label>
                  <select className="w-full bg-black border border-gray-800 rounded p-2 text-white text-sm"
                    value={glazingCode} onChange={e => setGlazingCode(e.target.value)}>
                    <optgroup label="Standard Glazing">
                      {CONFIG_SCHEMA.glazing.filter(g => g.group !== 'Non Glazing').map(g => (
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
                <div>
                  <label className="block text-xs font-bold mb-1 text-gray-400">Pane 1 (Outside)</label>
                  <select className="w-full bg-black border border-gray-800 rounded p-2 text-white text-sm"
                    value={pane1} onChange={e => setPane1(e.target.value)}>
                    <option value="">-- None --</option>
                    {PANE_OPTIONS.map(p => <option key={p.code} value={p.code}>{p.code} - {p.name}</option>)}
                  </select>
                </div>
                
                {isTripleGlazed && (
                  <div>
                    <label className="block text-xs font-bold mb-1 text-gray-400">Pane 2 (Middle)</label>
                    <select className="w-full bg-black border border-gray-800 rounded p-2 text-white text-sm"
                      value={pane2} onChange={e => setPane2(e.target.value)}>
                      <option value="">-- None --</option>
                      {PANE_OPTIONS.map(p => <option key={p.code} value={p.code}>{p.code} - {p.name}</option>)}
                    </select>
                  </div>
                )}
                
                <div>
                  <label className="block text-xs font-bold mb-1 text-gray-400">
                    {isTripleGlazed ? 'Pane 3 (Inside)' : 'Pane 2 (Inside)'}
                  </label>
                  <select className="w-full bg-black border border-gray-800 rounded p-2 text-white text-sm"
                    value={isTripleGlazed ? pane3 : pane2} 
                    onChange={e => isTripleGlazed ? setPane3(e.target.value) : setPane2(e.target.value)}>
                    <option value="">-- None --</option>
                    {PANE_OPTIONS.map(p => <option key={p.code} value={p.code}>{p.code} - {p.name}</option>)}
                  </select>
                </div>
                
                <div className="relative">
                  <label className="block text-xs font-bold mb-1 text-gray-400">Frame Style (Spacer)</label>
                  <div 
                    onClick={() => setIsFrameStyleOpen(!isFrameStyleOpen)}
                    className="w-full bg-black border border-gray-800 rounded p-2 text-white text-sm cursor-pointer flex items-center justify-between hover:border-gray-600 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                       <img 
                         src={`/assets/spacers/${frameStyle}.${FRAME_STYLES.find(s => s.code === frameStyle)?.ext || 'jpg'}`} 
                         className="w-8 h-8 object-cover rounded border border-gray-600 bg-gray-800/80 object-center"
                         onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.children[1].classList.remove('hidden'); }}
                         alt={frameStyle} 
                       />
                       <div className="w-8 h-8 rounded border border-gray-600 shadow-inner shrink-0 hidden items-center justify-center bg-gray-800 text-[10px]">{frameStyle}</div>
                       <span className="truncate ml-1">{FRAME_STYLES.find(s => s.code === frameStyle)?.code} - {FRAME_STYLES.find(s => s.code === frameStyle)?.name}</span>
                    </div>
                    <span className="text-gray-500 text-xs">▼</span>
                  </div>
                  
                  {isFrameStyleOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsFrameStyleOpen(false)}></div>
                      <div className="absolute top-[100%] left-0 w-full mt-1 bg-[#151515] border border-gray-700 rounded-lg shadow-2xl z-50 pb-1 max-h-[300px] overflow-y-auto">
                        <div className="p-2 border-b border-gray-800 bg-[#111] sticky top-0 z-10 text-xs text-gray-400 font-bold uppercase">Select Spacer Code</div>
                        {FRAME_STYLES.map(fs => (
                          <div 
                            key={fs.code} 
                            onClick={() => { setFrameStyle(fs.code); setIsFrameStyleOpen(false); }}
                            className="p-2 px-3 hover:bg-[#eab676]/20 cursor-pointer flex items-center gap-3 transition-colors text-sm"
                          >
                             <img 
                               src={`/assets/spacers/${fs.code}.${fs.ext}`} 
                               className="w-10 h-10 object-cover rounded border border-gray-600 bg-gray-800/80"
                               onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement!.children[1].classList.remove('hidden'); }}
                               alt={fs.code} 
                             />
                             <div className="w-10 h-10 rounded border border-gray-600 shadow-inner shrink-0 hidden items-center justify-center bg-gray-800 text-xs font-bold">{fs.code}</div>
                             <div className="flex flex-col">
                               <span className="font-bold text-white leading-tight">{fs.name}</span>
                               <span className="text-[10px] text-gray-500 uppercase">Code: {fs.code}</span>
                             </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

              </div>
            </div>

            <div className="col-span-2 border-t border-gray-800 pt-4 mt-2 mb-2">
              <h3 className="text-[#eab676] font-bold mb-4">Hardware Options</h3>
              <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-bold mb-1 text-gray-400">Safety Class</label>
                  <select className="w-full bg-black border border-gray-800 rounded p-2 text-white text-sm"
                    value={safetyClass} onChange={e => setSafetyClass(e.target.value)}>
                     <option value="">STD (Standard)</option>
                     <option value="RC1">RC1</option>
                     <option value="RC2">RC2</option>
                     <option value="RC2N">RC2N</option>
                     <option value="4ZA">4ZA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 text-gray-400">Handle Type</label>
                  <select className="w-full bg-black border border-gray-800 rounded p-2 text-white text-sm"
                    value={handleType} onChange={e => setHandleType(e.target.value)}>
                     <option value="">STD (Standard)</option>
                     <option value="-">- (No holes for spindle and mounting screws)</option>
                     <option value="ALU_A">ALU_A (Aluminum handle I5 / IL)</option>
                     <option value="ALU_AK">ALU_AK (Aluminum handle I5 / IL with key)</option>
                     <option value="ALU_AP">ALU_AP (Aluminum handle I5 with a button)</option>
                     <option value="Atlanta">Atlanta (Hoppe handle Secustic Atlanta)</option>
                     <option value="Kwadrat">Kwadrat (Aluminium handle Square)</option>
                     <option value="KwadratK">KwadratK (Aluminium handle Square with key)</option>
                     <option value="Mistral">Mistral (Aluminium handle Mistral)</option>
                     <option value="MistralK">MistralK (Aluminium handle Mistral with key)</option>
                     <option value="AtlantaK">AtlantaK (Hoppe handle Secustic Atlanta with key)</option>
                     <option value="AtlantaP">AtlantaP (Hoppe handle Secustic Atlanta with button)</option>
                     <option value="Toulon">Toulon (Hoppe handle Secustic Toulon)</option>
                     <option value="ToulonSF">ToulonSF (Hoppe handle Secuforte Toulon)</option>
                     <option value="Hamburg">Hamburg (Hoppe handle Secustic Hamburg)</option>
                     <option value="HamburgSF">HamburgSF (Hoppe handle Secuforte Hamburg)</option>
                     <option value="Tokyo">Tokyo (Hoppe Tokyo handle + KISI)</option>
                     <option value="ALU_B">ALU_B (Aluminium handle IE)</option>
                     <option value="ALU_BK">ALU_BK (Aluminium handle IE with key)</option>
                     <option value="Dublin">Dublin (Aluminium handle DUBLIN)</option>
                     <option value="DublinK">DublinK (Aluminium handle DUBLIN with key)</option>
                     <option value="DublinP">DublinP (Aluminium handle DUBLIN with button)</option>
                     <option value="ALUR">ALUR (Flat window handle (roller shutter))</option>
                     <option value="ATESTK">ATESTK (Window handle with key - ATEST)</option>
                     <option value="TBT">TBT (Window handle with key with TBT function)</option>
                     <option value="ALUW">ALUW (Aluminum pull handle "conductor")</option>
                     <option value="MA_1010">MA_1010 (MA 1010 stainless steel window handle)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 text-gray-400">Handle Color</label>
                  <select className="w-full bg-black border border-gray-800 rounded p-2 text-white text-sm"
                    value={handleColor} onChange={e => setHandleColor(e.target.value)}>
                     <option value="">-- Default --</option>
                     {HARDWARE_COLORS.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 text-gray-400">Cover Color</label>
                  <select className="w-full bg-black border border-gray-800 rounded p-2 text-white text-sm"
                    value={coverColor} onChange={e => setCoverColor(e.target.value)}>
                     <option value="">-- Default --</option>
                     {HARDWARE_COLORS.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-gray-900 to-black rounded-xl border border-[#eab676]/30 font-mono shadow-lg mt-auto">
            {loading && <div className="text-gray-500 text-sm">Evaluating formulas...</div>}
            {error && <div className="text-red-400 text-sm">Error: {error}</div>}
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
        </div>

        <div className="bg-white text-black p-8 rounded-xl shadow-2xl font-mono text-xs overflow-y-auto max-h-[85vh]">
          <div className="border-b-2 border-black pb-2 mb-4">
            <h2 className="text-xl font-bold uppercase tracking-tighter">SCHEMA 41 ledger</h2>
            <div className="text-gray-500 mt-1">One row per PREISE formula, in declared order. GRPRS accumulates.</div>
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
          {!result && !error && <div className="text-gray-500">Waiting for first response...</div>}
          {error && <div className="text-red-600">API error: {error}</div>}
        </div>

      </div>
    </div>
  );
}
