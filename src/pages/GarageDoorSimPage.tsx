import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGarageDoorStore } from '../store/useGarageDoorStore';
import type { EmbossingType, DriveType, SpringType } from '../store/useGarageDoorStore';
import { GarageDoorCanvas } from '../components/configurator/GarageDoorViewer';
import { 
  Play, Pause, RotateCcw, Info, Shield, Search 
} from 'lucide-react';
import { ColorSwatch } from '../components/products/ColorSwatch';
import { FULL_RAL_COLORS } from '../data/productDetails';



const WOOD_FOILS = [
  { name: 'Golden Oak', hex: '#ffffff', texture: '/assets/texturesbaked/zaoty-dab_kk/diffuse.jpg' },
  { name: 'Walnut', hex: '#ffffff', texture: '/assets/texturesbaked/orzech-a/diffuse.jpg' },
  { name: 'Turner Oak', hex: '#ffffff', texture: '/assets/texturesbaked/turner_oak_toffee_470-3004/diffuse.jpg' },
  { name: 'Dark Oak', hex: '#ffffff', texture: '/assets/texturesbaked/ciemny-dab_kk/diffuse.jpg' },
];



export function GarageDoorSimPage() {
  const { t } = useTranslation();
  const {
    width, height, lintelHeight, revealLeft, revealRight, installationDepth,
    extColor, extTexture, embossing, driveType, springType,
    animationProgress, isAnimating, casingColor,
    setWidth, setHeight, setExtColor, setExtTexture, setEmbossing,
    setDriveType, setSpringType, setAnimationProgress, setIsAnimating, resetToPdfSpecs, setCasingColor
  } = useGarageDoorStore();

  const [activeTab, setActiveTab] = useState<'dimensions' | 'design' | 'hardware'>('dimensions');

  // Animation Toggle
  const handlePlayToggle = () => {
    if (animationProgress === 1) {
      setAnimationProgress(0); // reset if at the end
    }
    setIsAnimating(!isAnimating);
  };

  // Automatically pause if user drags slider manually
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsAnimating(false);
    setAnimationProgress(parseFloat(e.target.value));
  };

  return (
    <main className="min-h-screen bg-mammut-darker pt-24 pb-12 text-mammut-white flex flex-col xl:flex-row">
      {/* 3D Visualizer Viewport (Left Side) */}
      <div className="flex-1 p-6 flex flex-col items-center justify-center border-r border-white/5 min-h-[500px] xl:h-[calc(100vh-8rem)]">
        <div className="w-full h-[650px] xl:h-full rounded-2xl overflow-hidden shadow-2xl relative">
          <GarageDoorCanvas />
          
          {/* Visualizer Floating Quick Controls */}
          <div className="absolute bottom-6 left-6 right-6 bg-mammut-black/85 backdrop-blur-md px-6 py-4 rounded-xl border border-white/5 flex flex-wrap gap-4 items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-4">
              <button
                onClick={handlePlayToggle}
                className="bg-mammut-gold hover:bg-mammut-gold/90 text-mammut-black p-3 rounded-lg font-bold transition-all hover:scale-105 flex items-center gap-2"
              >
                {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span className="text-xs uppercase tracking-widest hidden sm:inline">
                  {animationProgress === 1 ? t('garageDoorSim.rewind', 'Close Door') : isAnimating ? t('garageDoorSim.pause', 'Pause') : t('garageDoorSim.open', 'Open Door')}
                </span>
              </button>
              
              <button
                onClick={resetToPdfSpecs}
                className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-lg transition-colors flex items-center gap-1.5"
                title="Reset to PDF Order Specs"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-xs uppercase tracking-widest hidden sm:inline">Valdemorillo Specs</span>
              </button>
            </div>

            <div className="flex-1 max-w-md flex items-center gap-3">
              <span className="text-[10px] text-gray-400 uppercase tracking-widest">Closed</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.005"
                value={animationProgress}
                onChange={handleSliderChange}
                className="flex-1 accent-mammut-gold cursor-pointer"
              />
              <span className="text-[10px] text-gray-400 uppercase tracking-widest">Open</span>
              <span className="text-xs font-mono text-mammut-gold min-w-[36px] text-right">
                {Math.round(animationProgress * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Options & Config Panel (Right Side) */}
      <div className="w-full xl:w-[480px] p-8 overflow-y-auto bg-mammut-black border-l border-white/5 xl:max-h-[calc(100vh-6rem)] custom-scrollbar">
        <div className="mb-8 border-b border-white/5 pb-6">
          <div className="flex items-center gap-2 text-mammut-gold text-[10px] uppercase font-black tracking-widest mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Premium Series</span>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-wider mb-2">
            Sectional Garage Door
          </h1>
          <p className="text-sm text-gray-400 font-medium">
            Model: Brama Segmentowa DRUTEX
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/5 mb-8">
          {(['dimensions', 'design', 'hardware'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-xs uppercase tracking-widest font-black transition-colors relative ${
                activeTab === tab ? 'text-mammut-gold' : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'dimensions' && '1. Dimensions'}
              {tab === 'design' && '2. Design & Color'}
              {tab === 'hardware' && '3. Drive & Specs'}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-mammut-gold" />
              )}
            </button>
          ))}
        </div>

        {/* TAB 1: DIMENSIONS */}
        {activeTab === 'dimensions' && (
          <div className="space-y-6">
            {/* Width */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs uppercase tracking-wider">
                <span className="font-bold text-gray-300">Width (W0)</span>
                <span className="font-mono text-mammut-gold font-bold">{width} mm</span>
              </div>
              <input
                type="range"
                min="2000"
                max="5000"
                step="5"
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value))}
                className="w-full accent-mammut-gold"
              />
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>Min: 2000 mm</span>
                <span>Max: 5000 mm</span>
              </div>
            </div>

            {/* Height */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs uppercase tracking-wider">
                <span className="font-bold text-gray-300">Height (H0)</span>
                <span className="font-mono text-mammut-gold font-bold">{height} mm</span>
              </div>
              <input
                type="range"
                min="1800"
                max="3000"
                step="5"
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value))}
                className="w-full accent-mammut-gold"
              />
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>Min: 1800 mm</span>
                <span>Max: 3000 mm</span>
              </div>
            </div>

            {/* Lintel Height */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs uppercase tracking-wider">
                <span className="font-bold text-gray-300">Lintel Height (C)</span>
                <span className="font-mono text-mammut-gold font-bold">{lintelHeight} mm</span>
              </div>
              <input
                type="range"
                min="80"
                max="500"
                step="5"
                value={lintelHeight}
                onChange={(e) => useGarageDoorStore.setState({ lintelHeight: parseInt(e.target.value) })}
                className="w-full accent-mammut-gold"
              />
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>Min: 80 mm</span>
                <span>Max: 500 mm</span>
              </div>
            </div>

            {/* Left and Right Reveals */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-300">
                  Left Reveal (A)
                </label>
                <input
                  type="number"
                  min="50"
                  max="300"
                  value={revealLeft}
                  onChange={(e) => useGarageDoorStore.setState({ revealLeft: Math.max(50, parseInt(e.target.value) || 50) })}
                  className="w-full bg-mammut-dark border border-white/10 rounded-lg p-2.5 text-center text-sm font-semibold text-mammut-gold"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider font-bold text-gray-300">
                  Right Reveal (B)
                </label>
                <input
                  type="number"
                  min="50"
                  max="300"
                  value={revealRight}
                  onChange={(e) => useGarageDoorStore.setState({ revealRight: Math.max(50, parseInt(e.target.value) || 50) })}
                  className="w-full bg-mammut-dark border border-white/10 rounded-lg p-2.5 text-center text-sm font-semibold text-mammut-gold"
                />
              </div>
            </div>
            
            {/* Info Notice */}
            <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex gap-3 text-xs text-gray-400">
              <Info className="w-5 h-5 text-mammut-gold shrink-0 mt-0.5" />
              <p>
                Dimensions are based on standard opening clearances. The presets configured align perfectly with the original Order Report: 1500066.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: DESIGN & COLOR */}
        {activeTab === 'design' && (
          <div className="space-y-8">
            {/* Embossing Type */}
            <div className="space-y-3">
              <h3 className="text-xs uppercase tracking-wider font-black text-gray-400">
                1. Panel Structure (Embossing)
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { id: 'smooth', label: 'Smooth' },
                  { id: 'grooves', label: 'Ribbed' },
                  { id: 'woodgrain', label: 'Woodgrain' }
                ] as const).map((emb) => (
                  <button
                    key={emb.id}
                    onClick={() => setEmbossing(emb.id as EmbossingType)}
                    className={`px-4 py-3 rounded-lg border text-xs uppercase tracking-widest font-black transition-colors ${
                      embossing === emb.id
                        ? 'border-mammut-gold bg-mammut-gold/10 text-mammut-gold'
                        : 'border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    {emb.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Exterior Colors */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs uppercase tracking-wider font-black text-gray-400">
                  2. Exterior Color (RAL)
                </h3>
                {/* Search Box */}
                <div className="relative w-full max-w-[200px]">
                  <input 
                    type="text" 
                    placeholder="Search RAL..." 
                    className="w-full bg-white/10 border border-white/10 text-white placeholder-white/40 px-3 py-1.5 pr-8 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-mammut-gold transition-all"
                    onChange={(e) => {
                      const term = e.target.value.toLowerCase().trim();
                      if (term.length >= 3) {
                        const matchedColor = FULL_RAL_COLORS.find(c => {
                          const translatedName = t(`colors.${c.id}`).toLowerCase();
                          return translatedName.includes(term) || c.id.toLowerCase().includes(term.replace(/\s+/g, '-'));
                        });
                        if (matchedColor) {
                          setExtColor(matchedColor.hex);
                          setExtTexture(undefined);
                        }
                      }
                    }}
                  />
                  <Search className="absolute right-2.5 top-2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Selected Color Info */}
              {(() => {
                const matched = FULL_RAL_COLORS.find(c => c.hex === extColor) || FULL_RAL_COLORS[0];
                return (
                  <div className="text-xs bg-white/5 border border-white/5 px-4 py-2.5 rounded-lg flex justify-between items-center">
                    <span className="text-gray-400 font-medium">Selected:</span>
                    <span className="text-mammut-gold font-bold uppercase tracking-wider">
                      {extTexture ? 'Wood Veneer' : t(`colors.${matched.id}`, matched.name)}
                    </span>
                  </div>
                );
              })()}

              <ColorSwatch 
                colors={FULL_RAL_COLORS}
                selectedColorId={extTexture ? '' : (FULL_RAL_COLORS.find(c => c.hex === extColor)?.id || '')}
                onColorSelect={(color) => {
                  setExtColor(color.hex);
                  setExtTexture(undefined);
                }}
              />
            </div>

            {/* Wood Grain Foils */}
            <div className="space-y-4">
              <h3 className="text-xs uppercase tracking-wider font-black text-gray-400">
                3. Wood Veneer Foils (Exterior)
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {WOOD_FOILS.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setExtColor(c.hex);
                      setExtTexture(c.texture);
                    }}
                    className={`relative h-12 rounded-lg border-2 overflow-hidden ${
                      extTexture === c.texture
                        ? 'border-mammut-gold scale-105 shadow-md'
                        : 'border-white/10 hover:border-white/20'
                    } transition-all`}
                    title={c.name}
                  >
                    <div 
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${c.texture})` }}
                    />
                    <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                      <span className="text-[10px] uppercase font-bold text-white tracking-widest text-center px-1">
                        {c.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Outer Frame / Casing Colors */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs uppercase tracking-wider font-black text-gray-400">
                  4. {t('garageDoorSim.outerFrameCasing', 'Outer Frame / Casing')} (RAL)
                </h3>
                {/* Search Box */}
                <div className="relative w-full max-w-[200px]">
                  <input 
                    type="text" 
                    placeholder="Search RAL..." 
                    className="w-full bg-white/10 border border-white/10 text-white placeholder-white/40 px-3 py-1.5 pr-8 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-mammut-gold transition-all"
                    onChange={(e) => {
                      const term = e.target.value.toLowerCase().trim();
                      if (term.length >= 3) {
                        const matchedColor = FULL_RAL_COLORS.find(c => {
                          const translatedName = t(`colors.${c.id}`).toLowerCase();
                          return translatedName.includes(term) || c.id.toLowerCase().includes(term.replace(/\s+/g, '-'));
                        });
                        if (matchedColor) {
                          setCasingColor(matchedColor.hex);
                        }
                      }
                    }}
                  />
                  <Search className="absolute right-2.5 top-2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Selected Casing Color Info */}
              {(() => {
                const matched = FULL_RAL_COLORS.find(c => c.hex === casingColor) || { id: 'custom', name: 'Custom' };
                return (
                  <div className="text-xs bg-white/5 border border-white/5 px-4 py-2.5 rounded-lg flex justify-between items-center">
                    <span className="text-gray-400 font-medium">Selected:</span>
                    <span className="text-mammut-gold font-bold uppercase tracking-wider">
                      {matched.id === 'custom' ? casingColor : t(`colors.${matched.id}`, matched.name)}
                    </span>
                  </div>
                );
              })()}

              <ColorSwatch 
                colors={FULL_RAL_COLORS}
                selectedColorId={FULL_RAL_COLORS.find(c => c.hex === casingColor)?.id || ''}
                onColorSelect={(color) => {
                  setCasingColor(color.hex);
                }}
              />
            </div>


          </div>
        )}

        {/* TAB 3: HARDWARE & TECHNICAL SPECS */}
        {activeTab === 'hardware' && (
          <div className="space-y-8">
            {/* Drive Unit */}
            <div className="space-y-3">
              <h3 className="text-xs uppercase tracking-wider font-black text-gray-400">
                Drive System
              </h3>
              <div className="flex gap-4">
                {([
                  { id: 'manual', label: 'Manual' },
                  { id: 'beninca_jim3', label: 'BENINCA JIM.3' }
                ] as const).map((drv) => (
                  <button
                    key={drv.id}
                    onClick={() => setDriveType(drv.id as DriveType)}
                    className={`flex-1 py-3.5 rounded-lg border text-xs uppercase tracking-widest font-black transition-colors ${
                      driveType === drv.id
                        ? 'border-mammut-gold bg-mammut-gold/10 text-mammut-gold'
                        : 'border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    {drv.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Springs */}
            <div className="space-y-3">
              <h3 className="text-xs uppercase tracking-wider font-black text-gray-400">
                Spring System
              </h3>
              <div className="flex gap-4">
                {([
                  { id: 'extension', label: 'Extension Springs (D-Gate-T)' },
                  { id: 'torsion', label: 'Torsion Springs' }
                ] as const).map((spg) => (
                  <button
                    key={spg.id}
                    onClick={() => setSpringType(spg.id as SpringType)}
                    className={`flex-1 py-3.5 rounded-lg border text-[11px] uppercase tracking-wider font-black transition-colors ${
                      springType === spg.id
                        ? 'border-mammut-gold bg-mammut-gold/10 text-mammut-gold'
                        : 'border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    {spg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Technical Specifications Matrix */}
            <div className="space-y-4">
              <h3 className="text-xs uppercase tracking-wider font-black text-gray-400 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-mammut-gold" />
                <span>Technical Specifications</span>
              </h3>
              <div className="border border-white/5 rounded-xl overflow-hidden text-xs">
                {[
                  { name: 'System Type', value: 'Brama Segmentowa DRUTEX' },
                  { name: 'Clear Opening (W x H)', value: `${width} x ${height} mm` },
                  { name: 'Lintel Clearance (C)', value: `${lintelHeight} mm` },
                  { name: 'Install Depth (D)', value: `${installationDepth} mm` },
                  { name: 'Spring Tension Type', value: springType === 'extension' ? 'D-Gate-T Extension (up to 11.25 m²)' : 'Torsion Bar (front overhead)' },
                  { name: 'Automatic Motor Drive', value: driveType === 'beninca_jim3' ? 'BENINCA JIM.3 (Single Steel Strip Rail)' : 'None (Manual pull bar)' },
                  { name: 'Panel Thickness', value: '40 mm' },
                  { name: 'Heat Transfer Coef (U-value)', value: '1.10 W/m²*K' },
                  { name: 'Guides Finish', value: 'Galvanised Steel' },
                ].map((spec, i) => (
                  <div key={i} className={`flex justify-between p-3 ${i % 2 === 0 ? 'bg-white/[0.02]' : 'bg-transparent'} border-b border-white/5 last:border-b-0`}>
                    <span className="text-gray-400 font-medium">{spec.name}</span>
                    <span className="font-bold text-gray-200">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="mt-12 pt-6 border-t border-white/5 flex gap-4">
          <button
            onClick={() => alert(`Saved configuration: Sectional Garage Door ${width}x${height} mm`)}
            className="flex-1 bg-mammut-gold hover:bg-mammut-gold/90 text-mammut-black py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-transform hover:scale-[1.02]"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </main>
  );
}
