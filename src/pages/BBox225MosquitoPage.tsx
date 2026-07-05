import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BBox225MosquitoViewer } from '../components/configurator/BBox225MosquitoViewer';
import { IGLO_EDGE_COLORS, FULL_RAL_COLORS } from '../data/productDetails';
import { ArrowLeft, Sliders, Palette, RefreshCw, HelpCircle } from 'lucide-react';

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

export const BBox225MosquitoPage: React.FC = () => {
  const navigate = useNavigate();

  // Dimensions
  const [width, setWidth] = useState(1200);
  const [height, setHeight] = useState(1200);

  // Deploy States
  const [blindDeployed, setBlindDeployed] = useState(true);
  const [mosquitoDeployed, setMosquitoDeployed] = useState(true);

  // Search filters for all color options
  const [pvcSearches, setPvcSearches] = useState({
    boxExterior: '',
    boxInterior: '',
    guides: '',
  });
  const [ralSearch, setRalSearch] = useState('');
  const [mosquitoSearch, setMosquitoSearch] = useState('');

  // Colors
  const [colours, setColours] = useState({
    boxExterior: '#3b3c3f', // PVC Anthracite c214
    boxInterior: '#ffffff', // PVC White c197
    guides: '#3b3c3f',      // Guides match box exterior
    blind: 'rgb(198, 166, 100)', // Sand Yellow RAL 1002
    mosquitoNet: '#333333', // Dark charcoal mesh
  });

  const handleColorChange = (key: keyof typeof colours, value: string) => {
    setColours(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setWidth(1200);
    setHeight(1200);
    setBlindDeployed(true);
    setMosquitoDeployed(true);
    setPvcSearches({
      boxExterior: '',
      boxInterior: '',
      guides: '',
    });
    setRalSearch('');
    setMosquitoSearch('');
    setColours({
      boxExterior: '#3b3c3f',
      boxInterior: '#ffffff',
      guides: '#3b3c3f',
      blind: 'rgb(198, 166, 100)',
      mosquitoNet: '#333333',
    });
  };

  // Build the PVC foils catalog
  const pvcColors = IGLO_EDGE_COLORS.map(c => ({
    id: c.id,
    label: c.name,
    hex: COLOR_HEX_MAP[c.id] || c.hex || '#404040',
  }));

  // Build the RAL catalog
  const filteredRalColors = FULL_RAL_COLORS.filter(c =>
    c.name.toLowerCase().includes(ralSearch.toLowerCase()) ||
    c.id.toLowerCase().includes(ralSearch.toLowerCase())
  );

  // Build the Mosquito Net catalog
  const mosquitoOptions = [
    { label: 'Black', hex: '#111111' },
    { label: 'Charcoal', hex: '#333333' },
    { label: 'Grey', hex: '#666666' },
    { label: 'White', hex: '#ffffff' },
  ];
  const filteredMosquitoOptions = mosquitoOptions.filter(preset =>
    preset.label.toLowerCase().includes(mosquitoSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 flex bg-[#080810] overflow-hidden text-white font-sans">
      {/* Style overrides for custom scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.12);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(234,182,118,0.4);
        }
      `}</style>

      {/* 3D Viewport */}
      <div className="relative flex-1 h-full">
        <BBox225MosquitoViewer
          width={width}
          height={height}
          blindDeployed={blindDeployed}
          mosquitoDeployed={mosquitoDeployed}
          colours={colours}
          onToggleBlind={() => setBlindDeployed(prev => !prev)}
          onToggleMosquito={() => setMosquitoDeployed(prev => !prev)}
        />

        {/* Floating Back Button */}
        <button
          onClick={() => navigate('/configurator-test')}
          className="absolute top-4 left-4 z-30 flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-[#0c0c16]/80 text-white/80 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all active:scale-95 backdrop-blur-md cursor-pointer shadow-lg"
          title="Back to Configurator Test"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-wider">Back</span>
        </button>

        {/* Dynamic Watermark and Tutorial Overlay */}
        <div className="absolute bottom-4 left-4 z-20 pointer-events-none select-none hidden md:block">
          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Casing Profile</div>
          <h2 className="text-xl font-black text-[#eab676] tracking-tight">BLIND BOX 225</h2>
          <p className="text-xs text-white/50">Parametric Window Header Attachment</p>
        </div>

        {/* Hotspot Instructions Overlay */}
        <div className="absolute top-4 right-[340px] z-20 pointer-events-none hidden md:flex items-center gap-2 bg-[#0c0c16]/85 border border-[#eab676]/30 px-3 py-2 rounded-xl backdrop-blur-md shadow-lg max-w-[280px]">
          <HelpCircle className="w-5 h-5 text-[#eab676] shrink-0" />
          <div className="text-[10.5px] text-white/80 leading-normal font-medium">
            Click the <span className="text-[#eab676] font-bold">3D hotspots (pulsing circles)</span> directly inside the scene to toggle blind or insect screen deployment.
          </div>
        </div>
      </div>

      {/* Sidebar Controls */}
      <div
        className="flex flex-col gap-5 p-6 shrink-0 h-full overflow-y-auto custom-scrollbar"
        style={{
          width: 320,
          background: 'rgba(10, 10, 20, 0.9)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(24px)',
          boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Header */}
        <div className="border-b border-white/10 pb-4">
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#eab676] mb-1">
            Component Configurator
          </div>
          <h1 className="text-lg font-black tracking-tight text-white leading-none">
            Blind Box 225
          </h1>
          <p className="text-xs text-white/40 mt-1">Unified PVC Foils & RAL Curtains</p>
        </div>

        {/* Section: Dimensions */}
        <div className="flex flex-col gap-4 border-b border-white/5 pb-4">
          <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-white/60 mb-1">
            <Sliders className="w-3.5 h-3.5 text-[#eab676]" />
            <span>Dimensions</span>
          </div>

          {/* Width */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs">
              <span className="text-white/50">Box Width</span>
              <span className="text-[#eab676] font-bold">{width} mm</span>
            </div>
            <input
              type="range"
              min={500}
              max={3000}
              step={10}
              value={width}
              onChange={e => setWidth(Number(e.target.value))}
              className="w-full accent-[#eab676] cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-white/30">
              <span>500 mm</span>
              <span>3000 mm</span>
            </div>
          </div>

          {/* Height (Drop) */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs">
              <span className="text-white/50">Opening Height (Drop)</span>
              <span className="text-[#eab676] font-bold">{height} mm</span>
            </div>
            <input
              type="range"
              min={500}
              max={2500}
              step={10}
              value={height}
              onChange={e => setHeight(Number(e.target.value))}
              className="w-full accent-[#eab676] cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-white/30">
              <span>500 mm</span>
              <span>2500 mm</span>
            </div>
          </div>
        </div>

        {/* Section: Colors */}
        <div className="flex flex-col gap-4 border-b border-white/5 pb-4">
          <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-white/60">
            <Palette className="w-3.5 h-3.5 text-[#eab676]" />
            <span>Colours & Materials</span>
          </div>

          {/* PVC color selectors */}
          {[
            { key: 'boxExterior' as const, label: 'Box Exterior', hint: 'Outside street face (PVC Foils)' },
            { key: 'boxInterior' as const, label: 'Box Interior', hint: 'Inside casing & lids (PVC Foils)' },
            { key: 'guides' as const, label: 'Guide Rails (R0003-A)', hint: 'Side guides (PVC Foils)' },
          ].map(item => {
            const filteredPvc = pvcColors.filter(preset =>
              preset.label.toLowerCase().includes(pvcSearches[item.key].toLowerCase()) ||
              preset.id.toLowerCase().includes(pvcSearches[item.key].toLowerCase())
            );

            return (
              <div key={item.key} className="flex flex-col gap-1.5 bg-[#121222]/50 p-2.5 rounded-xl border border-white/5">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-xs font-semibold">{item.label}</div>
                    <div className="text-[9px] text-white/40">{item.hint}</div>
                  </div>

                  {/* Custom Color Swatch */}
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/10 cursor-pointer transition-transform hover:scale-105">
                    <input
                      type="color"
                      value={colours[item.key]}
                      onChange={e => handleColorChange(item.key, e.target.value)}
                      className="absolute inset-[-6px] w-[200%] h-[200%] cursor-pointer border-none p-0 bg-transparent"
                    />
                    <div
                      className="w-full h-full pointer-events-none"
                      style={{ backgroundColor: colours[item.key] }}
                    />
                  </div>
                </div>

                {/* PVC Search input */}
                <input
                  type="text"
                  placeholder={`Search ${item.label.split(' (')[0]}...`}
                  value={pvcSearches[item.key]}
                  onChange={e => setPvcSearches(prev => ({ ...prev, [item.key]: e.target.value }))}
                  className="w-full bg-[#17172a] text-[10px] border border-white/10 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#eab676] text-white placeholder-white/30"
                />

                {/* Grid list of PVC colors */}
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
                        <div className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white drop-shadow">
                          ✓
                        </div>
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

          {/* Aluminium / Shutter Blind Curtain (RAL library) */}
          <div className="flex flex-col gap-2 bg-[#121222]/50 p-2.5 rounded-xl border border-white/5">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs font-semibold">Blind Shutter Curtain</div>
                <div className="text-[9px] text-white/40">Aluminium slats & bottom bar (RAL Library)</div>
              </div>

              {/* Custom Swatch */}
              <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/10 cursor-pointer transition-transform hover:scale-105">
                <input
                  type="color"
                  value={colours.blind}
                  onChange={e => handleColorChange('blind', e.target.value)}
                  className="absolute inset-[-6px] w-[200%] h-[200%] cursor-pointer border-none p-0 bg-transparent"
                />
                <div
                  className="w-full h-full pointer-events-none"
                  style={{ backgroundColor: colours.blind }}
                />
              </div>
            </div>

            {/* RAL Search box */}
            <input
              type="text"
              placeholder="Search 200+ RAL colors..."
              value={ralSearch}
              onChange={e => setRalSearch(e.target.value)}
              className="w-full bg-[#17172a] text-xs border border-white/10 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#eab676] text-white placeholder-white/30"
            />

            {/* RAL Grid container */}
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
                  {colours.blind === c.hex && (
                    <div className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white drop-shadow">
                      ✓
                    </div>
                  )}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-black/95 text-[8px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap z-50 pointer-events-none border border-white/10 shadow-lg">
                    {c.name}
                  </div>
                </button>
              ))}
              {filteredRalColors.length === 0 && (
                <div className="col-span-6 text-center text-[10px] text-white/30 py-3">No matching RAL colors</div>
              )}
            </div>
          </div>

          {/* Mosquito Net (Charcoal grid presets) */}
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
                <div
                  className="w-full h-full pointer-events-none"
                  style={{ backgroundColor: colours.mosquitoNet }}
                />
              </div>
            </div>

            {/* Mosquito Search Input */}
            <input
              type="text"
              placeholder="Search Mosquito Net..."
              value={mosquitoSearch}
              onChange={e => setMosquitoSearch(e.target.value)}
              className="w-full bg-[#17172a] text-[10px] border border-white/10 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#eab676] text-white placeholder-white/30"
            />

            {/* Mesh preset toggles */}
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
              {filteredMosquitoOptions.length === 0 && (
                <div className="text-[10px] text-white/30 py-1">No matching options</div>
              )}
            </div>
          </div>
        </div>

        {/* reset & specs */}
        <div className="mt-auto flex flex-col gap-3">
          <div className="text-[9px] text-white/30 leading-relaxed font-mono">
            <div>Box Height: 225 mm</div>
            <div>Box Depth: 247 mm</div>
            <div>Curtain Pitch: 37 mm</div>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center justify-center gap-2 w-full py-2 border border-white/10 hover:border-[#eab676]/50 hover:bg-[#eab676]/5 rounded-xl text-white/70 hover:text-white transition-all text-xs font-bold uppercase tracking-wider select-none cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Config</span>
          </button>
        </div>
      </div>
    </div>
  );
};
