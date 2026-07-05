import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { F252Viewer } from '../components/configurator/F252Viewer';
import { ArrowLeft, Sliders, Palette, ShoppingCart, PackagePlus, HelpCircle, Box, Settings2, ShieldCheck, Sun, ThermometerSun, RefreshCw } from 'lucide-react';
import { IGLO_EDGE_COLORS, FULL_RAL_COLORS } from '../data/productDetails';
import { CONFIG_SCHEMA, PROFILE_GLAZING_LIMITS } from '../components/SlateConfigurator/types';
import { AddToStagingModal } from '../components/configurator/AddToStagingModal';
import { useStagingStore } from '../store/useStagingStore';

const COLOR_HEX_MAP: Record<string, string> = {
  'c197': '#ffffff', // White
  'c214': '#3b3c3f', // Anthracite
  'c217': '#0a0a0a', // Jet Black
  'c231': '#3e2b23', // Chocolate Brown
  'c205': '#878c93', // Grey
  'c209': '#4f5358', // Basalt Grey
  'c236': '#163e63', // Brilliant Blue
  'c234': '#0d2d1e', // Dark Green
  'c235': '#461515', // Dark Red
  'c206': '#9e9e9e', // Concrete Grey
  'c200': '#f5f5dc', // Cream
  'c233': '#4b5320', // Moss Green
  'c204': '#d3d3d3', // Light Grey
  'c211': '#708090', // Slate
  'c202': '#d2b48c', // Bleached Oak
  'c227': '#3e2723', // Dark Oak
  'c225': '#8d6e63', // Douglas Fir
  'c229': '#5d4037', // Macore
  'c230': '#4e342e', // Mahogany
  'c203': '#a1887f', // Natural Oak
  'c224': '#8d6e63', // Oregon
  'c220': '#bcaaa4', // Turner Oak
  'c226': '#3e2723', // Walnut
  'c223': '#a1887f', // Winchester
  'c219': '#bcaaa4', // Golden Oak
  'c199': '#5a5a5a', // Croviu Platynium
  'c201': '#8c8c8c', // Piryt
  'c210': '#4f5358', // Basalt Grey Gadki
  'c207': '#757a7d', // Grey Quartz
  'c208': '#757a7d', // Grey Quartz Smooth
  'c237': '#4682b4', // Steel Blue
  'c216': '#3b3c3f', // Anthracite Ulti Matt
  'c215': '#3b3c3f', // Anthracite Smooth
  'c218': '#0a0a0a', // Black Ulti Matt
  'c212': '#708090', // Slate Smooth
  'c198': '#f5f5f0', // White Sand Matt
  'c232': '#554433', // Deep Bronze
  'c213': '#41424c', // Graphite Sandblasted
  'c228': '#4a2f26', // Palisander
  'c221': '#a57850', // Turner Oak Toffee
  'c222': '#704730', // Turner Oak Walnut
  'c0': '#ffffff',   // System White
};

const HANDLE_TYPES = [
  { id: 'standard', name: 'Standard Dublin' },
  { id: 'premium', name: 'Premium Metal' },
  { id: 'locked', name: 'Key-Locked Safety' }
];

const HANDLE_COLORS = [
  { id: 'bialy', name: 'White', hex: '#ffffff' },
  { id: 'czarny', name: 'Black', hex: '#111111' },
  { id: 'antracyt', name: 'Anthracite', hex: '#383e42' },
  { id: 'braz', name: 'Brown', hex: '#5c4033' },
  { id: 'F1', name: 'Silver F1', hex: '#c0c0c0' },
  { id: 'F9', name: 'Tytan F9', hex: '#8a9597' },
  { id: 'kremowy', name: 'Creamy', hex: '#f5f5dc' },
  { id: 'st_zloto', name: 'Old Gold', hex: '#b8860b' }
];

export function F252TestPage() {
  const navigate = useNavigate();

  const clonedWindow = useStagingStore(state => state.clonedWindow);
  const setClonedWindow = useStagingStore(state => state.setClonedWindow);
  const f252Memory = useStagingStore(state => state.f252Memory);
  const setF252Memory = useStagingStore(state => state.setF252Memory);
  
  const initialConfig = (clonedWindow?.profile === 'IGLO 5 F252' ? clonedWindow.config : null) || f252Memory;

  const ig5GlazingIds = PROFILE_GLAZING_LIMITS['IG5']?.packages || [];
  const ig5Glazings = CONFIG_SCHEMA.glazing.filter(g => ig5GlazingIds.includes(g.id));

  // Dimensions
  const [width, setWidth] = useState(initialConfig?.width ?? 1200);
  const [height, setHeight] = useState(initialConfig?.height ?? 1400);
  const [bottomHeight, setBottomHeight] = useState(initialConfig?.bottomHeight ?? 430);
  
  const MIN_SECTION = 250;
  const safeBottom = Math.max(MIN_SECTION, Math.min(bottomHeight, height - MIN_SECTION));
  const safeTop = height - safeBottom;

  // Window Foils
  const [colorExt, setColorExt] = useState(initialConfig?.colorExt ?? '#3b3c3f');
  const [colorInt, setColorInt] = useState(initialConfig?.colorInt ?? '#ffffff');
  const [colorExtTexture, setColorExtTexture] = useState<string | undefined>(initialConfig?.colorExtTexture);
  const [colorIntTexture, setColorIntTexture] = useState<string | undefined>(initialConfig?.colorIntTexture);

  // Hardware
  const [handleType, setHandleType] = useState(initialConfig?.handleType ?? 'standard');
  const [handleColor, setHandleColor] = useState(initialConfig?.handleColor ?? 'F1');

  // Treatments
  const [solarTreatment, setSolarTreatment] = useState(initialConfig?.solarTreatment ?? false);
  const [thermalTreatment, setThermalTreatment] = useState(initialConfig?.thermalTreatment ?? false);
  const [preSales, setPreSales] = useState(initialConfig?.preSales ?? false);

  // Glazing
  const [glazing, setGlazing] = useState(initialConfig?.glazing || ig5Glazings[0]?.name || ig5Glazings[0]?.id || '');

  // Blinds & Mosquito
  const [blindBox, setBlindBox] = useState(initialConfig?.blindBox ?? true);
  const [mosquito, setMosquito] = useState(initialConfig?.mosquito ?? true);
  const [blindDeployed, setBlindDeployed] = useState(true);
  const [mosquitoDeployed, setMosquitoDeployed] = useState(true);
  
  const [colours, setColours] = useState({
    boxExterior: initialConfig?.blindColorExt ?? initialConfig?.colours?.boxExterior ?? '#3b3c3f',
    boxInterior: initialConfig?.blindColorInt ?? initialConfig?.colours?.boxInterior ?? '#ffffff',
    guides: initialConfig?.blindColorGuides ?? initialConfig?.colours?.guides ?? '#3b3c3f',
    blind: initialConfig?.blindColorSlats ?? initialConfig?.colours?.blind ?? 'rgb(198, 166, 100)',
    mosquitoNet: '#333333',
  });

  // Consume cloned window on mount so it doesn't stick around
  useEffect(() => {
    if (clonedWindow) {
      setClonedWindow(null);
    }
  }, []); // Only run once on mount

  // Sync memory continuously
  useEffect(() => {
    setF252Memory({
      width, height, bottomHeight: safeBottom,
      colorExt, colorInt, colorExtTexture, colorIntTexture,
      handleType, handleColor,
      solarTreatment, thermalTreatment, preSales,
      glazing,
      blindBox, mosquito,
      colours
    });
  }, [
    width, height, safeBottom,
    colorExt, colorInt, colorExtTexture, colorIntTexture,
    handleType, handleColor,
    solarTreatment, thermalTreatment, preSales,
    glazing,
    blindBox, mosquito,
    colours,
    setF252Memory
  ]);

  // Staging Modal
  const [isStagingModalOpen, setIsStagingModalOpen] = useState(false);

  // Searches
  const [pvcSearches, setPvcSearches] = useState({ ext: '', int: '' });
  const [blindSearches, setBlindSearches] = useState({ boxExterior: '', boxInterior: '', guides: '' });
  const [ralSearch, setRalSearch] = useState('');
  const [mosquitoSearch, setMosquitoSearch] = useState('');

  // Handlers for Window Foils
  const handleFoilChange = (side: 'ext' | 'int', hex: string, texture?: string) => {
    if (side === 'ext') {
      setColorExt(hex);
      setColorExtTexture(texture);
    } else {
      setColorInt(hex);
      setColorIntTexture(texture);
    }
  };

  const handleColorChange = (key: keyof typeof colours, value: string) => {
    setColours(prev => ({ ...prev, [key]: value }));
  };

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    if (safeBottom > newHeight - MIN_SECTION) {
      setBottomHeight(Math.max(MIN_SECTION, newHeight - MIN_SECTION));
    }
  };

  const activeHandleColorHex = HANDLE_COLORS.find(c => c.id === handleColor)?.hex || '#aaaaaa';

  const pvcColors = IGLO_EDGE_COLORS.map(c => ({
    id: c.id,
    label: c.name,
    hex: COLOR_HEX_MAP[c.id] || c.hex || '#404040',
    image: c.image
  }));

  const filteredRalColors = FULL_RAL_COLORS.filter(c =>
    c.name.toLowerCase().includes(ralSearch.toLowerCase()) ||
    c.id.toLowerCase().includes(ralSearch.toLowerCase())
  );

  const mosquitoOptions = [
    { label: 'Black', hex: '#111111' },
    { label: 'Charcoal', hex: '#333333' },
    { label: 'Grey', hex: '#666666' },
    { label: 'White', hex: '#ffffff' },
  ];
  const filteredMosquitoOptions = mosquitoOptions.filter(preset =>
    preset.label.toLowerCase().includes(mosquitoSearch.toLowerCase())
  );

  const handleReset = () => {
    setWidth(1200);
    setHeight(1400);
    setBottomHeight(430);
    setColorExt('#3b3c3f');
    setColorInt('#ffffff');
    setColorExtTexture(undefined);
    setColorIntTexture(undefined);
    setHandleType('standard');
    setHandleColor('F1');
    setSolarTreatment(false);
    setThermalTreatment(false);
    setBlindBox(true);
    setMosquito(true);
    setBlindDeployed(true);
    setMosquitoDeployed(true);
    setColours({
      boxExterior: '#3b3c3f',
      boxInterior: '#ffffff',
      guides: '#3b3c3f',
      blind: 'rgb(198, 166, 100)',
      mosquitoNet: '#333333',
    });
  };

  return (
    <div className="fixed inset-0 flex bg-[#080810] overflow-hidden text-white font-sans">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(234,182,118,0.4); }
      `}</style>

      {/* 3D Viewport */}
      <div className="relative flex-1 h-full">
        <F252Viewer 
          width={Math.max(width, 400)}
          height={Math.max(height, 500)}
          bottomHeight={Math.max(safeBottom, 250)}
          colorExt={colorExt}
          colorInt={colorInt}
          colorExtTexture={colorExtTexture}
          colorIntTexture={colorIntTexture}
          isColorPaletteOpen={false}
          solarTreatment={solarTreatment}
          thermalTreatment={thermalTreatment}
          handleColor={activeHandleColorHex}
          blindBox={blindBox}
          mosquito={mosquito}
          blindDeployed={blindDeployed}
          mosquitoDeployed={mosquitoDeployed}
          blindColorExt={colours.boxExterior}
          blindColorInt={colours.boxInterior}
          blindColorGuides={colours.guides}
          blindColorSlats={colours.blind}
          onToggleBlind={() => setBlindDeployed(prev => !prev)}
          onToggleMosquito={() => setMosquitoDeployed(prev => !prev)}
        />

        {/* Floating Top Left Controls */}
        <div className="absolute top-4 left-4 z-30 flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('/debug-pricing')}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-[#0c0c16]/80 text-white/80 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all active:scale-95 backdrop-blur-md cursor-pointer shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-wider">Back</span>
          </button>

          <button
            onClick={() => setIsStagingModalOpen(true)}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-[#eab676]/30 bg-[#eab676]/10 text-[#eab676] hover:bg-[#eab676]/20 hover:border-[#eab676]/50 transition-all active:scale-95 backdrop-blur-md cursor-pointer shadow-lg group"
          >
            <ShoppingCart className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-wider">Add to Staging</span>
          </button>

          <button
            onClick={() => navigate('/staging')}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-[#0c0c16]/80 text-white/80 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all active:scale-95 backdrop-blur-md cursor-pointer shadow-lg group"
          >
            <PackagePlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-wider">Staging Area</span>
          </button>
        </div>

        {/* Dynamic Watermark */}
        <div className="absolute bottom-4 left-4 z-20 pointer-events-none select-none hidden md:block">
          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Window Profile</div>
          <h2 className="text-xl font-black text-[#eab676] tracking-tight">IGLO 5 F252</h2>
          <p className="text-xs text-white/50">Double-light transom window with bottom fixed pane</p>
        </div>

        {/* Hotspot Instructions Overlay */}
        <div className="absolute top-4 right-[340px] z-20 pointer-events-none hidden md:flex items-center gap-2 bg-[#0c0c16]/85 border border-[#eab676]/30 px-3 py-2 rounded-xl backdrop-blur-md shadow-lg max-w-[280px]">
          <HelpCircle className="w-5 h-5 text-[#eab676] shrink-0" />
          <div className="text-[10.5px] text-white/80 leading-normal font-medium">
            Click the <span className="text-[#eab676] font-bold">3D hotspots (pulsing circles)</span> directly inside the scene to toggle blind or insect screen deployment, and to open the sash.
          </div>
        </div>
      </div>

      {/* Sidebar Controls */}
      <div
        className="flex flex-col gap-6 p-6 shrink-0 h-full overflow-y-auto custom-scrollbar"
        style={{
          width: 340,
          background: 'rgba(10, 10, 20, 0.9)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(24px)',
          boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Header */}
        <div className="border-b border-white/10 pb-4 shrink-0">
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#eab676] mb-1">
            Component Configurator
          </div>
          <h1 className="text-lg font-black tracking-tight text-white leading-none">
            IGLO 5 F252
          </h1>
          <p className="text-xs text-white/40 mt-1">Unified Foils & RAL Library</p>
        </div>

        {/* Section: Dimensions */}
        <div className="flex flex-col gap-4 border-b border-white/5 pb-5 shrink-0">
          <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-white/60 mb-1">
            <Sliders className="w-3.5 h-3.5 text-[#eab676]" />
            <span>Dimensions</span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-white/50">Total Width</span>
              <div className="flex items-center gap-1">
                <input
                  type="number" min={500} max={2500}
                  value={width} onChange={e => setWidth(Number(e.target.value))}
                  onBlur={() => setWidth(Math.max(500, Math.min(2500, width)))}
                  className="w-16 bg-[#121222] text-[#eab676] font-bold text-right border border-white/10 rounded px-1.5 py-0.5 focus:outline-none focus:border-[#eab676]/50"
                />
                <span className="text-[#eab676] font-bold">mm</span>
              </div>
            </div>
            <input
              type="range" min={500} max={2500} step={10}
              value={width} onChange={e => setWidth(Number(e.target.value))}
              className="w-full accent-[#eab676] cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-white/50">Total Height</span>
              <div className="flex items-center gap-1">
                <input
                  type="number" min={500} max={3000}
                  value={height} onChange={e => handleHeightChange(Number(e.target.value))}
                  onBlur={() => handleHeightChange(Math.max(500, Math.min(3000, height)))}
                  className="w-16 bg-[#121222] text-[#eab676] font-bold text-right border border-white/10 rounded px-1.5 py-0.5 focus:outline-none focus:border-[#eab676]/50"
                />
                <span className="text-[#eab676] font-bold">mm</span>
              </div>
            </div>
            <input
              type="range" min={500} max={3000} step={10}
              value={height} onChange={e => handleHeightChange(Number(e.target.value))}
              className="w-full accent-[#eab676] cursor-pointer"
            />
          </div>

          <div className="bg-[#121222]/50 rounded-xl border border-white/5 p-3 space-y-3 mt-1">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[10px] font-semibold text-white/60">
                <span>Top Sash Height</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number" min={MIN_SECTION} max={height - MIN_SECTION}
                    value={height - bottomHeight} onChange={e => setBottomHeight(height - Number(e.target.value))}
                    onBlur={() => setBottomHeight(safeBottom)}
                    className="w-14 bg-transparent text-white font-bold text-right border border-white/10 rounded px-1 py-0.5 focus:outline-none focus:border-white/30"
                  />
                  <span>mm</span>
                </div>
              </div>
              <input 
                type="range" min={MIN_SECTION} max={height - MIN_SECTION} step="10"
                value={safeTop} onChange={e => setBottomHeight(height - Number(e.target.value))}
                className="w-full accent-[#eab676] cursor-pointer h-1"
              />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[10px] font-semibold text-white/60">
                <span>Bottom Fixed Height</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number" min={MIN_SECTION} max={height - MIN_SECTION}
                    value={bottomHeight} onChange={e => setBottomHeight(Number(e.target.value))}
                    onBlur={() => setBottomHeight(safeBottom)}
                    className="w-14 bg-transparent text-white font-bold text-right border border-white/10 rounded px-1 py-0.5 focus:outline-none focus:border-white/30"
                  />
                  <span>mm</span>
                </div>
              </div>
              <input 
                type="range" min={MIN_SECTION} max={height - MIN_SECTION} step="10"
                value={safeBottom} onChange={e => setBottomHeight(Number(e.target.value))}
                className="w-full accent-[#eab676] cursor-pointer h-1"
              />
            </div>
          </div>
        </div>

        {/* Section: Window Foils & Colors */}
        <div className="flex flex-col gap-4 border-b border-white/5 pb-5 shrink-0">
          <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-white/60">
            <Palette className="w-3.5 h-3.5 text-[#eab676]" />
            <span>Profile Colors</span>
          </div>

          {[
            { key: 'ext' as const, label: 'Exterior Profile', value: colorExt, texture: colorExtTexture, hint: 'Outside street face' },
            { key: 'int' as const, label: 'Interior Profile', value: colorInt, texture: colorIntTexture, hint: 'Inside room face' },
          ].map(item => {
            const filteredPvc = pvcColors.filter(preset =>
              preset.label.toLowerCase().includes(pvcSearches[item.key].toLowerCase()) ||
              preset.id.toLowerCase().includes(pvcSearches[item.key].toLowerCase())
            );

            return (
              <div key={item.key} className="flex flex-col gap-2 bg-[#121222]/50 p-2.5 rounded-xl border border-white/5">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs font-semibold">{item.label}</div>
                    <div className="text-[9px] text-white/40">{item.hint}</div>
                  </div>
                  <div 
                    className="w-8 h-8 rounded-lg border border-white/10 shadow-lg bg-cover bg-center shrink-0 transition-transform hover:scale-105" 
                    style={{ backgroundColor: item.value, backgroundImage: item.texture ? `url(${item.texture})` : 'none' }} 
                  />
                </div>
                <input
                  type="text"
                  placeholder={`Search ${item.label.split(' ')[0]} foils...`}
                  value={pvcSearches[item.key]}
                  onChange={e => setPvcSearches(prev => ({ ...prev, [item.key]: e.target.value }))}
                  className="w-full bg-[#17172a] text-[10px] border border-white/10 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#eab676] text-white placeholder-white/30"
                />
                <div className="grid grid-cols-6 gap-1.5 max-h-[80px] overflow-y-auto mt-1 pr-1 custom-scrollbar">
                  {filteredPvc.map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => handleFoilChange(item.key, preset.hex, preset.image)}
                      className="w-8 h-8 rounded-full border hover:scale-110 active:scale-95 transition-transform cursor-pointer relative group shrink-0 bg-cover bg-center"
                      style={{
                        backgroundColor: preset.hex,
                        backgroundImage: preset.image ? `url(${preset.image})` : 'none',
                        borderColor: item.value === preset.hex && item.texture === preset.image ? '#eab676' : 'rgba(255, 255, 255, 0.15)',
                        boxShadow: item.value === preset.hex && item.texture === preset.image ? '0 0 4px #eab676' : 'none',
                      }}
                      title={preset.label}
                    >
                      {item.value === preset.hex && item.texture === preset.image && (
                        <div className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white drop-shadow-md bg-black/20 rounded-full">✓</div>
                      )}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-black/95 text-[8px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap z-50 pointer-events-none border border-white/10 shadow-lg">
                        {preset.label}
                      </div>
                    </button>
                  ))}
                  {filteredPvc.length === 0 && (
                    <div className="col-span-6 text-center text-[10px] text-white/30 py-2">No matching colors</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Section: Hardware & Handles */}
        <div className="flex flex-col gap-4 border-b border-white/5 pb-5 shrink-0">
          <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-white/60">
            <Settings2 className="w-3.5 h-3.5 text-[#eab676]" />
            <span>Hardware</span>
          </div>

          <div className="bg-[#121222]/50 p-2.5 rounded-xl border border-white/5 space-y-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-white/60 uppercase tracking-wider">Handle Type</label>
              <select 
                value={handleType}
                onChange={e => setHandleType(e.target.value)}
                className="bg-[#17172a] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs w-full outline-none focus:border-[#eab676] text-white"
              >
                {HANDLE_TYPES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold text-white/60 uppercase tracking-wider">Handle Color</label>
              <div className="flex gap-2 flex-wrap">
                {HANDLE_COLORS.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setHandleColor(c.id)}
                    className="w-7 h-7 rounded-full border hover:scale-110 active:scale-95 transition-transform cursor-pointer relative group"
                    style={{
                      backgroundColor: c.hex,
                      borderColor: handleColor === c.id ? '#eab676' : 'rgba(255, 255, 255, 0.15)',
                      boxShadow: handleColor === c.id ? '0 0 4px #eab676' : 'none',
                    }}
                  >
                    {handleColor === c.id && <div className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-white mix-blend-difference">✓</div>}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-black/95 text-[8px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap z-50 pointer-events-none border border-white/10">
                      {c.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section: Glazing */}
        <div className="flex flex-col gap-4 border-b border-white/5 pb-5 shrink-0">
          <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-white/60">
            <Box className="w-3.5 h-3.5 text-[#eab676]" />
            <span>Glazing Package</span>
          </div>
          <div className="bg-[#121222]/50 p-2.5 rounded-xl border border-white/5 space-y-3">
            <div className="flex flex-col gap-1">
              <select 
                value={glazing}
                onChange={e => setGlazing(e.target.value)}
                className="bg-[#17172a] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs w-full outline-none focus:border-[#eab676] text-white"
              >
                {ig5Glazings.map(pkg => (
                  <option key={pkg.id} value={pkg.name || pkg.id}>{pkg.name || pkg.id}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section: Treatments */}
        <div className="flex flex-col gap-3 border-b border-white/5 pb-5 shrink-0">
          <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-white/60 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#eab676]" />
            <span>Treatments & Options</span>
          </div>

          <label className="flex items-center gap-3 cursor-pointer group bg-[#121222]/50 p-2.5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
            <div className={`flex items-center justify-center w-5 h-5 rounded border ${solarTreatment ? 'bg-[#eab676] border-[#eab676]' : 'border-white/20 bg-black/20'}`}>
              {solarTreatment && <div className="text-black text-xs font-bold">✓</div>}
            </div>
            <input type="checkbox" checked={solarTreatment} onChange={e => setSolarTreatment(e.target.checked)} className="hidden" />
            <div className="flex flex-col">
              <span className="text-xs font-medium text-white/90 flex items-center gap-1.5"><Sun className="w-3 h-3 text-orange-400" /> Solar Treatment</span>
              <span className="text-[9px] text-white/40">Reflective exterior shield</span>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group bg-[#121222]/50 p-2.5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
            <div className={`flex items-center justify-center w-5 h-5 rounded border ${thermalTreatment ? 'bg-[#eab676] border-[#eab676]' : 'border-white/20 bg-black/20'}`}>
              {thermalTreatment && <div className="text-black text-xs font-bold">✓</div>}
            </div>
            <input type="checkbox" checked={thermalTreatment} onChange={e => setThermalTreatment(e.target.checked)} className="hidden" />
            <div className="flex flex-col">
              <span className="text-xs font-medium text-white/90 flex items-center gap-1.5"><ThermometerSun className="w-3 h-3 text-red-400" /> Thermal Treatment</span>
              <span className="text-[9px] text-white/40">Enhanced interior insulation</span>
            </div>
          </label>
        </div>

        {/* Section: Roller Blinds & Mosquito */}
        <div className="flex flex-col gap-4 border-b border-white/5 pb-5 shrink-0">
          <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-white/60">
            <Box className="w-3.5 h-3.5 text-[#eab676]" />
            <span>Add-ons</span>
          </div>

          <label className="flex items-center gap-3 cursor-pointer group bg-[#121222]/50 p-2.5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
            <div className={`flex items-center justify-center w-5 h-5 rounded border ${blindBox ? 'bg-[#eab676] border-[#eab676]' : 'border-white/20 bg-black/20'}`}>
              {blindBox && <div className="text-black text-xs font-bold">✓</div>}
            </div>
            <input type="checkbox" checked={blindBox} onChange={e => {
              setBlindBox(e.target.checked);
              if (e.target.checked) setBlindDeployed(true);
            }} className="hidden" />
            <div className="flex flex-col">
              <span className="text-xs font-medium text-white/90">Roller Blind System</span>
              <span className="text-[9px] text-white/40">225mm box casing & shutter</span>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group bg-[#121222]/50 p-2.5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
            <div className={`flex items-center justify-center w-5 h-5 rounded border ${mosquito ? 'bg-[#eab676] border-[#eab676]' : 'border-white/20 bg-black/20'}`}>
              {mosquito && <div className="text-black text-xs font-bold">✓</div>}
            </div>
            <input type="checkbox" checked={mosquito} onChange={e => {
              setMosquito(e.target.checked);
              if (e.target.checked) setMosquitoDeployed(true);
            }} className="hidden" />
            <div className="flex flex-col">
              <span className="text-xs font-medium text-white/90">Mosquito Net</span>
              <span className="text-[9px] text-white/40">Integrated insect screen</span>
            </div>
          </label>

          {(blindBox || mosquito) && (
            <>
              {/* PVC Foils for Blinds */}
              {[
                { key: 'boxExterior' as const, label: 'Box Exterior', hint: 'Outside street face (PVC Foils)' },
                { key: 'boxInterior' as const, label: 'Box Interior', hint: 'Inside casing & lids (PVC Foils)' },
                { key: 'guides' as const, label: 'Guide Rails (R0003-A)', hint: 'Side guides (PVC Foils)' },
              ].map(item => {
                const filteredPvc = pvcColors.filter(preset =>
                  preset.label.toLowerCase().includes(blindSearches[item.key].toLowerCase()) ||
                  preset.id.toLowerCase().includes(blindSearches[item.key].toLowerCase())
                );

                return (
                  <div key={item.key} className="flex flex-col gap-1.5 bg-[#121222]/50 p-2.5 rounded-xl border border-white/5">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs font-semibold">{item.label}</div>
                        <div className="text-[9px] text-white/40">{item.hint}</div>
                      </div>
                      <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/10 cursor-pointer transition-transform hover:scale-105">
                        <input
                          type="color"
                          value={colours[item.key]}
                          onChange={e => handleColorChange(item.key, e.target.value)}
                          className="absolute inset-[-6px] w-[200%] h-[200%] cursor-pointer border-none p-0 bg-transparent"
                        />
                        <div className="w-full h-full pointer-events-none" style={{ backgroundColor: colours[item.key] }} />
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder={`Search ${item.label.split(' (')[0]}...`}
                      value={blindSearches[item.key]}
                      onChange={e => setBlindSearches(prev => ({ ...prev, [item.key]: e.target.value }))}
                      className="w-full bg-[#17172a] text-[10px] border border-white/10 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#eab676] text-white placeholder-white/30"
                    />
                    <div className="grid grid-cols-6 gap-1.5 max-h-[90px] overflow-y-auto mt-1 pr-1 custom-scrollbar">
                      {filteredPvc.map(preset => (
                        <button
                          key={preset.id}
                          onClick={() => handleColorChange(item.key, preset.hex)}
                          className="w-8 h-8 rounded-full border hover:scale-110 active:scale-95 transition-transform cursor-pointer relative group shrink-0"
                          style={{
                            backgroundColor: preset.hex,
                            borderColor: colours[item.key] === preset.hex ? '#eab676' : 'rgba(255, 255, 255, 0.15)',
                            boxShadow: colours[item.key] === preset.hex ? '0 0 4px #eab676' : 'none',
                          }}
                          title={preset.label}
                        >
                          {colours[item.key] === preset.hex && (
                            <div className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white drop-shadow">✓</div>
                          )}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-black/95 text-[8px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap z-50 pointer-events-none border border-white/10 shadow-lg">
                            {preset.label}
                          </div>
                        </button>
                      ))}
                      {filteredPvc.length === 0 && <div className="col-span-6 text-center text-[10px] text-white/30 py-2">No matching colors</div>}
                    </div>
                  </div>
                );
              })}

              {/* Shutter Slats (RAL) */}
              {blindBox && (
                <div className="flex flex-col gap-2 bg-[#121222]/50 p-2.5 rounded-xl border border-white/5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs font-semibold">Blind Shutter Curtain</div>
                      <div className="text-[9px] text-white/40">Aluminium slats & bottom bar (RAL Library)</div>
                    </div>
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/10 cursor-pointer transition-transform hover:scale-105">
                      <input
                        type="color"
                        value={colours.blind}
                        onChange={e => handleColorChange('blind', e.target.value)}
                        className="absolute inset-[-6px] w-[200%] h-[200%] cursor-pointer border-none p-0 bg-transparent"
                      />
                      <div className="w-full h-full pointer-events-none" style={{ backgroundColor: colours.blind }} />
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Search 200+ RAL colors..."
                    value={ralSearch}
                    onChange={e => setRalSearch(e.target.value)}
                    className="w-full bg-[#17172a] text-xs border border-white/10 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#eab676] text-white placeholder-white/30"
                  />
                  <div className="grid grid-cols-6 gap-1.5 max-h-[140px] overflow-y-auto mt-1 pr-1 custom-scrollbar">
                    {filteredRalColors.map(c => (
                      <button
                        key={c.id}
                        onClick={() => handleColorChange('blind', c.hex)}
                        className="w-8 h-8 rounded-full border hover:scale-110 active:scale-95 transition-transform cursor-pointer relative group shrink-0"
                        style={{
                          backgroundColor: c.hex,
                          borderColor: colours.blind === c.hex ? '#eab676' : 'rgba(255, 255, 255, 0.15)',
                          boxShadow: colours.blind === c.hex ? '0 0 4px #eab676' : 'none',
                        }}
                        title={c.name}
                      >
                        {colours.blind === c.hex && <div className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white drop-shadow">✓</div>}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-black/95 text-[8px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap z-50 pointer-events-none border border-white/10 shadow-lg">
                          {c.name}
                        </div>
                      </button>
                    ))}
                    {filteredRalColors.length === 0 && <div className="col-span-6 text-center text-[10px] text-white/30 py-3">No matching RAL colors</div>}
                  </div>
                </div>
              )}

              {/* Mosquito Net Screen */}
              {mosquito && (
                <div className="flex flex-col gap-1.5 bg-[#121222]/50 p-2.5 rounded-xl border border-white/5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs font-semibold">Mosquito Net Screen</div>
                      <div className="text-[9px] text-white/40">Charcoal net frame & screen mesh</div>
                    </div>
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/10 cursor-pointer transition-transform hover:scale-105">
                      <input
                        type="color"
                        value={colours.mosquitoNet}
                        onChange={e => handleColorChange('mosquitoNet', e.target.value)}
                        className="absolute inset-[-6px] w-[200%] h-[200%] cursor-pointer border-none p-0 bg-transparent"
                      />
                      <div className="w-full h-full pointer-events-none" style={{ backgroundColor: colours.mosquitoNet }} />
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Search Mosquito Net..."
                    value={mosquitoSearch}
                    onChange={e => setMosquitoSearch(e.target.value)}
                    className="w-full bg-[#17172a] text-[10px] border border-white/10 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#eab676] text-white placeholder-white/30"
                  />
                  <div className="flex gap-2 mt-1.5 flex-wrap">
                    {filteredMosquitoOptions.map(preset => (
                      <button
                        key={preset.label}
                        onClick={() => handleColorChange('mosquitoNet', preset.hex)}
                        className="px-2 py-1 rounded-md border text-[9px] font-bold tracking-wider uppercase transition-all hover:scale-105 active:scale-95 cursor-pointer"
                        style={{
                          backgroundColor: preset.hex,
                          color: preset.hex === '#ffffff' ? '#111111' : '#ffffff',
                          borderColor: colours.mosquitoNet === preset.hex ? '#eab676' : 'rgba(255,255,255,0.1)',
                        }}
                      >
                        {preset.label}
                      </button>
                    ))}
                    {filteredMosquitoOptions.length === 0 && <div className="text-[10px] text-white/30 py-1">No matching options</div>}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* reset */}
        <div className="mt-auto pt-6 border-t border-white/10 shrink-0 mb-6">
          <button
            onClick={handleReset}
            className="flex items-center justify-center gap-2 w-full py-2 border border-white/10 hover:border-[#eab676]/50 hover:bg-[#eab676]/5 rounded-xl text-white/70 hover:text-white transition-all text-xs font-bold uppercase tracking-wider select-none cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Config</span>
          </button>
        </div>
      </div>

      <AddToStagingModal 
        isOpen={isStagingModalOpen}
        onClose={() => setIsStagingModalOpen(false)}
        defaultProfile="IGLO 5 F252"
        config={{
          width, height, bottomHeight: safeBottom,
          colorExt, colorInt, colorExtTexture, colorIntTexture,
          solarTreatment, thermalTreatment, handleType, handleColor,
          preSales, blindBox, mosquito, glazing,
          blindDeployed, mosquitoDeployed,
          blindColorExt: colours.boxExterior, 
          blindColorInt: colours.boxInterior,
          blindColorGuides: colours.guides, 
          blindColorSlats: colours.blind
        }}
      />
    </div>
  );
}
