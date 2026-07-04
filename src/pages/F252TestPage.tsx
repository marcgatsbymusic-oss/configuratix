import React, { useState } from 'react';
import { F252Viewer } from '../components/configurator/F252Viewer';
import { ChevronLeft, ShoppingCart, PackagePlus } from 'lucide-react';
import { ColorPaletteOverlay } from '../components/configurator/ColorPaletteOverlay';
import { IGLO_EDGE_COLORS } from '../data/productDetails';
import { AddToStagingModal } from '../components/configurator/AddToStagingModal';

const HANDLE_TYPES = [
  { id: 'standard', name: 'Standard Dublin Handle' },
  { id: 'premium', name: 'Premium Metal Handle' },
  { id: 'locked', name: 'Key-Locked Safety Handle' }
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

const BLIND_COLORS = [
  { id: '#383e42', name: 'Anthracite' },
  { id: '#f3f4f6', name: 'White' },
  { id: '#8a939e', name: 'Gray' },
  { id: '#a67c45', name: 'Golden Oak' },
  { id: '#5c4021', name: 'Dark Oak' },
  { id: '#111111', name: 'Deep Black' },
];

export function F252TestPage() {
  const [width, setWidth] = useState(1200);
  const [height, setHeight] = useState(1400);
  const [bottomHeight, setBottomHeight] = useState(430);
  const [colorExt, setColorExt] = useState('#383e42');
  const [colorInt, setColorInt] = useState('#ffffff');
  const [colorExtTexture, setColorExtTexture] = useState<string | undefined>();
  const [colorIntTexture, setColorIntTexture] = useState<string | undefined>();
  const [isColorWheelOpen, setIsColorWheelOpen] = useState(false);
  const [isStagingModalOpen, setIsStagingModalOpen] = useState(false);
  const [solarTreatment, setSolarTreatment] = useState(false);
  const [thermalTreatment, setThermalTreatment] = useState(false);
  const [handleType, setHandleType] = useState('standard');
  const [handleColor, setHandleColor] = useState('F1');
  const [preSales, setPreSales] = useState(false);
  const [blindBox, setBlindBox] = useState(false);
  const [mosquito, setMosquito] = useState(false);
  const [blindDeployed, setBlindDeployed] = useState(false);
  const [mosquitoDeployed, setMosquitoDeployed] = useState(false);
  const [blindColorExt, setBlindColorExt] = useState('#383e42');
  const [blindColorInt, setBlindColorInt] = useState('#f3f4f6');
  const [blindColorGuides, setBlindColorGuides] = useState('#383e42');
  const [blindColorSlats, setBlindColorSlats] = useState('#8a939e');

  const MIN_SECTION = 250;

  // Safe boundaries
  const safeBottom = Math.max(MIN_SECTION, Math.min(bottomHeight, height - MIN_SECTION));
  const safeTop = height - safeBottom;

  const [typedWidth, setTypedWidth] = useState(String(width));
  const [typedHeight, setTypedHeight] = useState(String(height));
  const [typedTop, setTypedTop] = useState(String(safeTop));
  const [typedBottom, setTypedBottom] = useState(String(safeBottom));

  React.useEffect(() => {
    setTypedWidth(String(width));
  }, [width]);

  React.useEffect(() => {
    setTypedHeight(String(height));
  }, [height]);

  React.useEffect(() => {
    setTypedTop(String(safeTop));
    setTypedBottom(String(safeBottom));
  }, [safeTop, safeBottom]);

  const handleBottomChange = (newBottom: number) => {
    const valid = Math.max(MIN_SECTION, Math.min(newBottom, height - MIN_SECTION));
    setBottomHeight(valid);
  };

  const handleTopChange = (newTop: number) => {
    const valid = Math.max(MIN_SECTION, Math.min(newTop, height - MIN_SECTION));
    setBottomHeight(height - valid);
  };

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    // Adjust bottom if it exceeds new bounds
    if (safeBottom > newHeight - MIN_SECTION) {
      setBottomHeight(Math.max(MIN_SECTION, newHeight - MIN_SECTION));
    }
  };

  const activeHandleColorHex = HANDLE_COLORS.find(c => c.id === handleColor)?.hex || '#aaaaaa';

  return (
    <div className="w-screen h-screen overflow-hidden bg-white text-gray-800 relative shadow-[inset_0_0_100px_rgba(0,0,0,0.05)]">
      {/* Subtle radial gradient to make the window pop */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-gray-200/50 pointer-events-none" />

      {/* 3D Canvas Full Screen */}
      <div className="absolute inset-0">
        <F252Viewer 
          width={width}
          height={height}
          bottomHeight={safeBottom}
          colorExt={colorExt}
          colorInt={colorInt}
          colorExtTexture={colorExtTexture}
          colorIntTexture={colorIntTexture}
          isColorPaletteOpen={isColorWheelOpen}
          solarTreatment={solarTreatment}
          thermalTreatment={thermalTreatment}
          handleColor={activeHandleColorHex}
          blindBox={blindBox}
          mosquito={mosquito}
          blindDeployed={blindDeployed}
          mosquitoDeployed={mosquitoDeployed}
          blindColorExt={blindColorExt}
          blindColorInt={blindColorInt}
          blindColorGuides={blindColorGuides}
          blindColorSlats={blindColorSlats}
          onToggleBlind={() => setBlindDeployed(prev => !prev)}
          onToggleMosquito={() => setMosquitoDeployed(prev => !prev)}
        />
      </div>

      {/* Top Left Navigation & Actions */}
      <div className="absolute top-4 left-4 z-50 flex flex-wrap items-center gap-4">
        <a 
          href="/debug-pricing"
          className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-mammut-gold hover:bg-gray-100 transition-colors border border-gray-200 shadow-sm"
        >
          <ChevronLeft size={20} />
          <span className="font-bold text-sm">Back to Pricing</span>
        </a>

        <button
          onClick={() => setIsStagingModalOpen(true)}
          className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-mammut-gold hover:bg-mammut-gold hover:text-black transition-colors border border-gray-200 shadow-sm group"
        >
          <ShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
          <span className="font-bold text-sm">Add to Staging</span>
        </button>

        <a
          href="/staging"
          className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-mammut-gold hover:bg-mammut-gold hover:text-black transition-colors border border-gray-200 shadow-sm group"
        >
          <PackagePlus size={20} className="group-hover:scale-110 transition-transform" />
          <span className="font-bold text-sm">View Staging Area</span>
        </a>
      </div>

      {/* Dimension Controls Panel */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-white/90 backdrop-blur-xl p-6 rounded-2xl border border-gray-200 w-96 shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-mammut-gold mb-6 border-b border-gray-200 pb-4">F252 CONFIGURATION</h2>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 font-medium">Total Width</span>
              <div className="flex items-center gap-1">
                <input 
                  type="text"
                  value={typedWidth}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTypedWidth(val);
                    const num = Number(val);
                    if (!isNaN(num) && num >= 500 && num <= 2500) {
                      setWidth(num);
                    }
                  }}
                  onBlur={() => {
                    const num = Math.max(500, Math.min(2500, Number(typedWidth) || 1200));
                    setWidth(num);
                    setTypedWidth(String(num));
                  }}
                  className="w-20 bg-white border border-gray-300 rounded px-2 py-0.5 text-right font-bold text-mammut-gold outline-none focus:border-mammut-gold"
                />
                <span className="text-gray-500 font-bold text-xs">mm</span>
              </div>
            </div>
            <input 
              type="range" min="500" max="2500" step="10"
              value={width} onChange={(e) => setWidth(Number(e.target.value))}
              className="w-full accent-mammut-gold"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 font-medium">Total Height</span>
              <div className="flex items-center gap-1">
                <input 
                  type="text"
                  value={typedHeight}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTypedHeight(val);
                    const num = Number(val);
                    if (!isNaN(num) && num >= 500 && num <= 3000) {
                      handleHeightChange(num);
                    }
                  }}
                  onBlur={() => {
                    const num = Math.max(500, Math.min(3000, Number(typedHeight) || 1400));
                    handleHeightChange(num);
                    setTypedHeight(String(num));
                  }}
                  className="w-20 bg-white border border-gray-300 rounded px-2 py-0.5 text-right font-bold text-mammut-gold outline-none focus:border-mammut-gold"
                />
                <span className="text-gray-500 font-bold text-xs">mm</span>
              </div>
            </div>
            <input 
              type="range" min="500" max="3000" step="10"
              value={height} onChange={(e) => handleHeightChange(Number(e.target.value))}
              className="w-full accent-mammut-gold"
            />
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 font-medium">Top Section</span>
                <div className="flex items-center gap-1">
                  <input 
                    type="text"
                    value={typedTop}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTypedTop(val);
                      const num = Number(val);
                      if (!isNaN(num) && num >= MIN_SECTION && num <= height - MIN_SECTION) {
                        handleTopChange(num);
                      }
                    }}
                    onBlur={() => {
                      const num = Math.max(MIN_SECTION, Math.min(height - MIN_SECTION, Number(typedTop) || MIN_SECTION));
                      handleTopChange(num);
                      setTypedTop(String(num));
                    }}
                    className="w-20 bg-white border border-gray-300 rounded px-2 py-0.5 text-right font-bold text-blue-500 outline-none focus:border-blue-300"
                  />
                  <span className="text-gray-500 font-bold text-xs">mm</span>
                </div>
              </div>
              <input 
                type="range" min={MIN_SECTION} max={height - MIN_SECTION} step="10"
                value={safeTop} onChange={(e) => handleTopChange(Number(e.target.value))}
                className="w-full accent-blue-300"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 font-medium">Bottom Section</span>
                <div className="flex items-center gap-1">
                  <input 
                    type="text"
                    value={typedBottom}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTypedBottom(val);
                      const num = Number(val);
                      if (!isNaN(num) && num >= MIN_SECTION && num <= height - MIN_SECTION) {
                        handleBottomChange(num);
                      }
                    }}
                    onBlur={() => {
                      const num = Math.max(MIN_SECTION, Math.min(height - MIN_SECTION, Number(typedBottom) || MIN_SECTION));
                      handleBottomChange(num);
                      setTypedBottom(String(num));
                    }}
                    className="w-20 bg-white border border-gray-300 rounded px-2 py-0.5 text-right font-bold text-green-600 outline-none focus:border-green-300"
                  />
                  <span className="text-gray-500 font-bold text-xs">mm</span>
                </div>
              </div>
              <input 
                type="range" min={MIN_SECTION} max={height - MIN_SECTION} step="10"
                value={safeBottom} onChange={(e) => handleBottomChange(Number(e.target.value))}
                className="w-full accent-green-300"
              />
            </div>
          </div>
          
          <hr className="border-gray-200" />
          <hr className="border-gray-200" />

          {/* Custom Color Inputs */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-800">PVC Colors</h3>
            
            <div className="space-y-2">
              <label className="text-xs text-gray-500 font-medium block">Exterior Profile</label>
              <div className="flex gap-2 items-center">
                <div 
                  className="w-8 h-8 rounded border border-white/20 shadow-inner bg-cover bg-center" 
                  style={{ backgroundColor: colorExt, backgroundImage: colorExtTexture ? `url(${colorExtTexture})` : 'none' }} 
                />
                <select 
                  value={IGLO_EDGE_COLORS.find(c => c.hex === colorExt && (c.image === colorExtTexture || (!c.image && !colorExtTexture)))?.id || ''}
                  onChange={(e) => {
                    const col = IGLO_EDGE_COLORS.find(c => c.id === e.target.value);
                    if (col) {
                      setColorExt(col.hex);
                      setColorExtTexture(col.image || undefined);
                    }
                  }}
                  className="bg-white border border-gray-300 rounded px-3 py-1.5 text-sm w-full outline-none focus:border-mammut-gold focus:ring-1 focus:ring-mammut-gold text-gray-900 shadow-sm"
                >
                  <option value="" disabled>Select exterior color...</option>
                  {IGLO_EDGE_COLORS.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-500 font-medium block">Interior Profile</label>
              <div className="flex gap-2 items-center">
                <div 
                  className="w-8 h-8 rounded border border-gray-300 shadow-inner bg-cover bg-center" 
                  style={{ backgroundColor: colorInt, backgroundImage: colorIntTexture ? `url(${colorIntTexture})` : 'none' }} 
                />
                <select 
                  value={IGLO_EDGE_COLORS.find(c => c.hex === colorInt && (c.image === colorIntTexture || (!c.image && !colorIntTexture)))?.id || ''}
                  onChange={(e) => {
                    const col = IGLO_EDGE_COLORS.find(c => c.id === e.target.value);
                    if (col) {
                      setColorInt(col.hex);
                      setColorIntTexture(col.image || undefined);
                    }
                  }}
                  className="bg-white border border-gray-300 rounded px-3 py-1.5 text-sm w-full outline-none focus:border-mammut-gold focus:ring-1 focus:ring-mammut-gold text-gray-900 shadow-sm"
                >
                  <option value="" disabled>Select interior color...</option>
                  {IGLO_EDGE_COLORS.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 italic mt-2">
              You can also click the palette icon in the bottom right for a visual grid view.
            </p>
          </div>

          <hr className="border-gray-200" />

          {/* Glass Treatments */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-800">Glass Treatments</h3>
            
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={solarTreatment} 
                  onChange={(e) => setSolarTreatment(e.target.checked)}
                  className="w-4 h-4 rounded text-mammut-gold focus:ring-mammut-gold border-gray-300 accent-mammut-gold"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">Solar Treatment</span>
                  <span className="text-xs text-gray-500">Reflective exterior shield (Sun icon)</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={thermalTreatment} 
                  onChange={(e) => setThermalTreatment(e.target.checked)}
                  className="w-4 h-4 rounded text-mammut-gold focus:ring-mammut-gold border-gray-300 accent-mammut-gold"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">Thermal Treatment</span>
                  <span className="text-xs text-gray-500">Enhanced interior insulation (Thermometer)</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={preSales} 
                  onChange={(e) => setPreSales(e.target.checked)}
                  className="w-4 h-4 rounded text-mammut-gold focus:ring-mammut-gold border-gray-300 accent-mammut-gold"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">Pre-sales Lock</span>
                  <span className="text-xs text-gray-500">Lock measurements with lock icon in staging</span>
                </div>
              </label>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Hardware & Handles */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-800">Hardware & Handles</h3>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-gray-500 font-medium block">Handle Type</label>
                <select 
                  value={handleType}
                  onChange={(e) => setHandleType(e.target.value)}
                  className="bg-white border border-gray-300 rounded px-3 py-1.5 text-sm w-full outline-none focus:border-mammut-gold focus:ring-1 focus:ring-mammut-gold text-gray-900 shadow-sm"
                >
                  {HANDLE_TYPES.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-500 font-medium block">Handle Color</label>
                <div className="flex gap-2 items-center">
                  <div 
                    className="w-8 h-8 rounded border border-gray-300 shadow-inner" 
                    style={{ backgroundColor: HANDLE_COLORS.find(c => c.id === handleColor)?.hex || '#ffffff' }} 
                  />
                  <select 
                    value={handleColor}
                    onChange={(e) => setHandleColor(e.target.value)}
                    className="bg-white border border-gray-300 rounded px-3 py-1.5 text-sm w-full outline-none focus:border-mammut-gold focus:ring-1 focus:ring-mammut-gold text-gray-900 shadow-sm"
                  >
                    {HANDLE_COLORS.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Roller Blinds & Mosquito Net */}
          <div className="space-y-4 pb-6">
            <h3 className="text-sm font-bold text-gray-800">Roller Blinds & Mosquito</h3>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={blindBox} 
                  onChange={(e) => {
                    setBlindBox(e.target.checked);
                    if (e.target.checked) setBlindDeployed(true);
                  }}
                  className="w-4 h-4 rounded text-mammut-gold focus:ring-mammut-gold border-gray-300 accent-mammut-gold"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">Roller Blinds</span>
                  <span className="text-xs text-gray-500">225mm box casing (BBOX_225_W_MSQTO)</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={mosquito} 
                  onChange={(e) => {
                    setMosquito(e.target.checked);
                    if (e.target.checked) setMosquitoDeployed(true);
                  }}
                  className="w-4 h-4 rounded text-mammut-gold focus:ring-mammut-gold border-gray-300 accent-mammut-gold"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">Mosquito Net</span>
                  <span className="text-xs text-gray-500">Integrated protective insect screen mesh</span>
                </div>
              </label>

              {/* Deployment sliders */}
              {blindBox && (
                <div className="space-y-1 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                  <div className="flex justify-between text-xs text-gray-600 font-medium">
                    <span>Deploy Blinds</span>
                    <span>{blindDeployed ? 'Deployed' : 'Retracted'}</span>
                  </div>
                  <button
                    onClick={() => setBlindDeployed(!blindDeployed)}
                    className={`w-full py-1 text-xs font-bold rounded transition-colors ${blindDeployed ? 'bg-mammut-gold text-black' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    {blindDeployed ? 'Retract Blinds' : 'Deploy Blinds'}
                  </button>
                </div>
              )}

              {mosquito && (
                <div className="space-y-1 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                  <div className="flex justify-between text-xs text-gray-600 font-medium">
                    <span>Deploy Mosquito Net</span>
                    <span>{mosquitoDeployed ? 'Deployed' : 'Retracted'}</span>
                  </div>
                  <button
                    onClick={() => setMosquitoDeployed(!mosquitoDeployed)}
                    className={`w-full py-1 text-xs font-bold rounded transition-colors ${mosquitoDeployed ? 'bg-mammut-gold text-black' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    {mosquitoDeployed ? 'Retract Screen' : 'Deploy Screen'}
                  </button>
                </div>
              )}
              {/* Color Selectors for Blinds */}
              {(blindBox || mosquito) && (
                <div className="space-y-3 bg-gray-50 p-2.5 rounded-lg border border-gray-200 mt-2">
                  <div className="text-[10px] font-bold text-[#eab676] uppercase tracking-wider mb-1">Blind Color Customizer</div>
                  
                  {/* Casing Ext */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Casing Exterior</label>
                    <div className="flex gap-2 items-center">
                      <div 
                        className="w-6 h-6 rounded border border-gray-300 shadow-inner shrink-0" 
                        style={{ backgroundColor: blindColorExt }} 
                      />
                      <select 
                        value={blindColorExt}
                        onChange={(e) => setBlindColorExt(e.target.value)}
                        className="bg-white border border-gray-300 rounded px-2 py-1 text-xs w-full outline-none focus:border-mammut-gold text-gray-900 shadow-sm"
                      >
                        {BLIND_COLORS.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Casing Int */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Casing Interior</label>
                    <div className="flex gap-2 items-center">
                      <div 
                        className="w-6 h-6 rounded border border-gray-300 shadow-inner shrink-0" 
                        style={{ backgroundColor: blindColorInt }} 
                      />
                      <select 
                        value={blindColorInt}
                        onChange={(e) => setBlindColorInt(e.target.value)}
                        className="bg-white border border-gray-300 rounded px-2 py-1 text-xs w-full outline-none focus:border-mammut-gold text-gray-900 shadow-sm"
                      >
                        {BLIND_COLORS.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Guide Rails */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Side Guide Rails</label>
                    <div className="flex gap-2 items-center">
                      <div 
                        className="w-6 h-6 rounded border border-gray-300 shadow-inner shrink-0" 
                        style={{ backgroundColor: blindColorGuides }} 
                      />
                      <select 
                        value={blindColorGuides}
                        onChange={(e) => setBlindColorGuides(e.target.value)}
                        className="bg-white border border-gray-300 rounded px-2 py-1 text-xs w-full outline-none focus:border-mammut-gold text-gray-900 shadow-sm"
                      >
                        {BLIND_COLORS.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Curtain Slats */}
                  {blindBox && (
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Shutter Slats</label>
                      <div className="flex gap-2 items-center">
                        <div 
                          className="w-6 h-6 rounded border border-gray-300 shadow-inner shrink-0" 
                          style={{ backgroundColor: blindColorSlats }} 
                        />
                        <select 
                          value={blindColorSlats}
                          onChange={(e) => setBlindColorSlats(e.target.value)}
                          className="bg-white border border-gray-300 rounded px-2 py-1 text-xs w-full outline-none focus:border-mammut-gold text-gray-900 shadow-sm"
                        >
                          {BLIND_COLORS.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Color Palette Overlay widget */}
      <ColorPaletteOverlay
        colorExt={colorExt}
        colorInt={colorInt}
        onChangeExt={(col) => {
          setColorExt(col.hex);
          setColorExtTexture(col.image || undefined);
        }}
        onChangeInt={(col) => {
          setColorInt(col.hex);
          setColorIntTexture(col.image || undefined);
        }}
        onOpenChange={setIsColorWheelOpen}
        className="absolute bottom-4 right-4 z-[60]"
      />

      <AddToStagingModal 
        isOpen={isStagingModalOpen}
        onClose={() => setIsStagingModalOpen(false)}
        defaultProfile="IGLO 5 F252"
        config={{
          width,
          height,
          bottomHeight: safeBottom,
          colorExt,
          colorInt,
          colorExtTexture,
          colorIntTexture,
          solarTreatment,
          thermalTreatment,
          handleType,
          handleColor,
          preSales,
          blindBox,
          mosquito,
          blindColorExt,
          blindColorInt,
          blindColorGuides,
          blindColorSlats
        }}
      />
    </div>
  );
}
