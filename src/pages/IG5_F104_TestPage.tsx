import React, { useState } from 'react';
import { IG5_F104Viewer } from '../components/configurator/IG5_F104Viewer';
import { ChevronLeft, ShoppingCart, PackagePlus } from 'lucide-react';
import { ColorPaletteOverlay } from '../components/configurator/ColorPaletteOverlay';
import { IGLO_EDGE_COLORS } from '../data/productDetails';
import { AddToStagingModal } from '../components/configurator/AddToStagingModal';

export function IG5_F104_TestPage() {
  const [width, setWidth] = useState(1000);
  const [height, setHeight] = useState(1000);
  const [colorExt, setColorExt] = useState('#383e42');
  const [colorInt, setColorInt] = useState('#ffffff');
  const [colorExtTexture, setColorExtTexture] = useState<string | undefined>();
  const [colorIntTexture, setColorIntTexture] = useState<string | undefined>();
  const [isColorWheelOpen, setIsColorWheelOpen] = useState(false);
  const [isStagingModalOpen, setIsStagingModalOpen] = useState(false);
  const [solarTreatment, setSolarTreatment] = useState(false);
  const [thermalTreatment, setThermalTreatment] = useState(false);
  const [preSales, setPreSales] = useState(false);

  // Blind Box States
  const [hasBlind, setHasBlind] = useState(false);
  const [hasMosquito, setHasMosquito] = useState(false);
  const [blindDeployed, setBlindDeployed] = useState(false);
  const [mosquitoDeployed, setMosquitoDeployed] = useState(false);
  const [colorGuides, setColorGuides] = useState('#383e42');
  const [colorSlats, setColorSlats] = useState('#eab676');

  const [typedWidth, setTypedWidth] = useState(String(width));
  const [typedHeight, setTypedHeight] = useState(String(height));

  React.useEffect(() => {
    setTypedWidth(String(width));
  }, [width]);

  React.useEffect(() => {
    setTypedHeight(String(height));
  }, [height]);

  const handleWidthChange = (newWidth: number) => {
    const valid = Math.max(210, Math.min(newWidth, 1576));
    setWidth(valid);
  };

  const handleHeightChange = (newHeight: number) => {
    const valid = Math.max(210, Math.min(newHeight, 3078));
    setHeight(valid);
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-white text-gray-800 relative shadow-[inset_0_0_100px_rgba(0,0,0,0.05)]">
      {/* Subtle radial gradient to make the window pop */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-gray-200/50 pointer-events-none" />

      {/* 3D Canvas Full Screen */}
      <div className="absolute inset-0">
        <IG5_F104Viewer 
          width={width}
          height={height}
          colorExt={colorExt}
          colorInt={colorInt}
          colorExtTexture={colorExtTexture}
          colorIntTexture={colorIntTexture}
          isColorPaletteOpen={isColorWheelOpen}
          solarTreatment={solarTreatment}
          thermalTreatment={thermalTreatment}
          hasBlind={hasBlind}
          hasMosquito={hasMosquito}
          blindDeployed={blindDeployed}
          mosquitoDeployed={mosquitoDeployed}
          colorGuides={colorGuides}
          colorSlats={colorSlats}
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
        <h2 className="text-xl font-bold text-mammut-gold mb-6 border-b border-gray-200 pb-4">IG5 F104 CONFIGURATION</h2>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 font-medium">Width</span>
              <div className="flex items-center gap-1">
                <input 
                  type="text"
                  value={typedWidth}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTypedWidth(val);
                    const num = Number(val);
                    if (!isNaN(num) && num >= 210 && num <= 1576) {
                      setWidth(num);
                    }
                  }}
                  onBlur={() => {
                    const num = Math.max(210, Math.min(1576, Number(typedWidth) || 1000));
                    setWidth(num);
                    setTypedWidth(String(num));
                  }}
                  className="w-20 bg-white border border-gray-300 rounded px-2 py-0.5 text-right font-bold text-mammut-gold outline-none focus:border-mammut-gold"
                />
                <span className="text-gray-500 font-bold text-xs">mm</span>
              </div>
            </div>
            <input 
              type="range" min="210" max="1576" step="10"
              value={width} onChange={(e) => setWidth(Number(e.target.value))}
              className="w-full accent-mammut-gold"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 font-medium">Height</span>
              <div className="flex items-center gap-1">
                <input 
                  type="text"
                  value={typedHeight}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTypedHeight(val);
                    const num = Number(val);
                    if (!isNaN(num) && num >= 210 && num <= 3078) {
                      setHeight(num);
                    }
                  }}
                  onBlur={() => {
                    const num = Math.max(210, Math.min(3078, Number(typedHeight) || 1000));
                    setHeight(num);
                    setTypedHeight(String(num));
                  }}
                  className="w-20 bg-white border border-gray-300 rounded px-2 py-0.5 text-right font-bold text-mammut-gold outline-none focus:border-mammut-gold"
                />
                <span className="text-gray-500 font-bold text-xs">mm</span>
              </div>
            </div>
            <input 
              type="range" min="210" max="3078" step="10"
              value={height} onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full accent-mammut-gold"
            />
          </div>
          
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
          </div>

          <hr className="border-gray-200" />

          {/* Roller Blinds & Mosquito Net */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-800">Additional Options</h3>
            
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={hasBlind} 
                  onChange={(e) => setHasBlind(e.target.checked)}
                  className="w-4 h-4 rounded text-mammut-gold focus:ring-mammut-gold border-gray-300 accent-mammut-gold"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">Roller Blinds</span>
                  <span className="text-xs text-gray-500">Add integrated roller blind box</span>
                </div>
              </label>

              {hasBlind && (
                <div className="pl-7 space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={blindDeployed} 
                      onChange={(e) => setBlindDeployed(e.target.checked)}
                      className="w-4 h-4 rounded text-mammut-gold focus:ring-mammut-gold border-gray-300 accent-mammut-gold"
                    />
                    <span className="text-sm font-medium text-gray-700">Deploy Blinds (Default)</span>
                  </label>

                  <div className="space-y-2">
                    <label className="text-xs text-gray-500 font-medium block">Slats Color</label>
                    <div className="flex gap-2 items-center">
                      <div className="w-8 h-8 rounded border border-gray-300 shadow-inner" style={{ backgroundColor: colorSlats }} />
                      <input 
                        type="color" 
                        value={colorSlats}
                        onChange={(e) => setColorSlats(e.target.value)}
                        className="p-0 border-0 w-8 h-8 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={hasMosquito} 
                  onChange={(e) => setHasMosquito(e.target.checked)}
                  className="w-4 h-4 rounded text-mammut-gold focus:ring-mammut-gold border-gray-300 accent-mammut-gold"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">Mosquito Net</span>
                  <span className="text-xs text-gray-500">Integrated retractable screen</span>
                </div>
              </label>

              {hasMosquito && (
                <div className="pl-7">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={mosquitoDeployed} 
                      onChange={(e) => setMosquitoDeployed(e.target.checked)}
                      className="w-4 h-4 rounded text-mammut-gold focus:ring-mammut-gold border-gray-300 accent-mammut-gold"
                    />
                    <span className="text-sm font-medium text-gray-700">Deploy Mosquito Net (Default)</span>
                  </label>
                </div>
              )}
            </div>
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
        defaultProfile="IGLO 5 F104"
        config={{
          width,
          height,
          colorExt,
          colorInt,
          colorExtTexture,
          colorIntTexture,
          solarTreatment,
          thermalTreatment,
          preSales
        }}
      />
    </div>
  );
}
export default IG5_F104_TestPage;
