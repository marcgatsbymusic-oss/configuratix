import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BBox225MosquitoViewer } from '../components/configurator/BBox225MosquitoViewer';
import { ArrowLeft, Layers, Grid, Sliders, Palette, RefreshCw } from 'lucide-react';

export const BBox225MosquitoPage: React.FC = () => {
  const navigate = useNavigate();

  // Dimensions
  const [width, setWidth] = useState(1200);
  const [height, setHeight] = useState(1200);

  // Deploy States
  const [blindDeployed, setBlindDeployed] = useState(true);
  const [mosquitoDeployed, setMosquitoDeployed] = useState(true);

  // Colors
  const [colours, setColours] = useState({
    boxExterior: '#3a3f44', // Anthracite
    boxInterior: '#ece9e1', // Creamy White
    guides: '#9aa1a7',      // Silver Gray
    blind: '#c8bfa8',       // Sand Beige
    mosquitoNet: '#333333', // Dark Charcoal Mesh
  });

  const presetColors = [
    { label: 'Anthracite', hex: '#3a3f44' },
    { label: 'Signal White', hex: '#ece9e1' },
    { label: 'Anodic Gray', hex: '#9aa1a7' },
    { label: 'Cream Beige', hex: '#c8bfa8' },
    { label: 'Dark Oak', hex: '#5c4021' },
    { label: 'Jet Black', hex: '#111111' },
  ];

  const handleColorChange = (key: keyof typeof colours, value: string) => {
    setColours(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setWidth(1200);
    setHeight(1200);
    setBlindDeployed(true);
    setMosquitoDeployed(true);
    setColours({
      boxExterior: '#3a3f44',
      boxInterior: '#ece9e1',
      guides: '#9aa1a7',
      blind: '#c8bfa8',
      mosquitoNet: '#333333',
    });
  };

  return (
    <div className="fixed inset-0 flex bg-[#080810] overflow-hidden text-white font-sans">
      {/* 3D Viewport */}
      <div className="relative flex-1 h-full">
        <BBox225MosquitoViewer
          width={width}
          height={height}
          blindDeployed={blindDeployed}
          mosquitoDeployed={mosquitoDeployed}
          colours={colours}
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

        {/* floating watermark specs */}
        <div className="absolute bottom-4 left-4 z-20 pointer-events-none select-none hidden md:block">
          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Casing Profile</div>
          <h2 className="text-xl font-black text-[#eab676] tracking-tight">BLIND BOX 225</h2>
          <p className="text-xs text-white/50">Parametric Window Header Attachment</p>
        </div>
      </div>

      {/* Sidebar Controls */}
      <div
        className="flex flex-col gap-5 p-6 shrink-0 h-full overflow-y-auto"
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
          <p className="text-xs text-white/40 mt-1">Integrated insect protection & slats</p>
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

        {/* Section: Deploy State */}
        <div className="flex flex-col gap-3 border-b border-white/5 pb-4">
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-white/60 mb-1">
            Retraction Controls
          </div>

          <div className="flex flex-col gap-2">
            {/* Blind Switch */}
            <button
              onClick={() => setBlindDeployed(!blindDeployed)}
              className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl border transition-all text-xs font-bold uppercase tracking-wider select-none cursor-pointer"
              style={{
                background: blindDeployed ? 'rgba(234, 182, 118, 0.08)' : 'transparent',
                borderColor: blindDeployed ? 'rgba(234, 182, 118, 0.4)' : 'rgba(255, 255, 255, 0.06)',
                color: blindDeployed ? '#eab676' : 'rgba(255, 255, 255, 0.6)',
              }}
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span>Roller Blind Curtain</span>
              </div>
              <span className="text-[10px] font-black uppercase">
                {blindDeployed ? 'Deployed' : 'Retracted'}
              </span>
            </button>

            {/* Mosquito Switch */}
            <button
              onClick={() => setMosquitoDeployed(!mosquitoDeployed)}
              className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl border transition-all text-xs font-bold uppercase tracking-wider select-none cursor-pointer"
              style={{
                background: mosquitoDeployed ? 'rgba(234, 182, 118, 0.08)' : 'transparent',
                borderColor: mosquitoDeployed ? 'rgba(234, 182, 118, 0.4)' : 'rgba(255, 255, 255, 0.06)',
                color: mosquitoDeployed ? '#eab676' : 'rgba(255, 255, 255, 0.6)',
              }}
            >
              <div className="flex items-center gap-2">
                <Grid className="w-4 h-4" />
                <span>Mosquito Net Screen</span>
              </div>
              <span className="text-[10px] font-black uppercase">
                {mosquitoDeployed ? 'Deployed' : 'Retracted'}
              </span>
            </button>
          </div>
        </div>

        {/* Section: Colors */}
        <div className="flex flex-col gap-4 border-b border-white/5 pb-4">
          <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-white/60">
            <Palette className="w-3.5 h-3.5 text-[#eab676]" />
            <span>Colours & Materials</span>
          </div>

          {[
            { key: 'boxExterior' as const, label: 'Box Exterior', hint: 'Outside street face' },
            { key: 'boxInterior' as const, label: 'Box Interior', hint: 'Inside & end lids' },
            { key: 'guides' as const, label: 'Guide Rails', hint: 'Side track profiles' },
            { key: 'blind' as const, label: 'Blind Curtain', hint: 'Shutter slats & bottom bar' },
            { key: 'mosquitoNet' as const, label: 'Mosquito Net', hint: 'Mesh screen' },
          ].map(item => (
            <div key={item.key} className="flex flex-col gap-1.5 bg-[#121222]/50 p-2.5 rounded-xl border border-white/5">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs font-semibold">{item.label}</div>
                  <div className="text-[9px] text-white/40">{item.hint}</div>
                </div>

                {/* Custom Color Picker Swatch */}
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

              {/* Preset Row */}
              <div className="flex gap-1.5 mt-1.5 overflow-x-auto pb-0.5">
                {presetColors.map(preset => (
                  <button
                    key={preset.label}
                    onClick={() => handleColorChange(item.key, preset.hex)}
                    className="w-4 h-4 rounded-full border shrink-0 transition-transform active:scale-90 hover:scale-110 cursor-pointer"
                    style={{
                      backgroundColor: preset.hex,
                      borderColor: colours[item.key] === preset.hex ? '#eab676' : 'rgba(255, 255, 255, 0.2)',
                      boxShadow: colours[item.key] === preset.hex ? '0 0 4px #eab676' : 'none',
                    }}
                    title={preset.label}
                  />
                ))}
              </div>
            </div>
          ))}
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
