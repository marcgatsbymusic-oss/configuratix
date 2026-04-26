const fs = require('fs');
let txt = fs.readFileSync('src/pages/ProductDetailPage.tsx', 'utf8');

txt = txt.replace(
  "const [selectedColorId, setSelectedColorId] = useState(detailData?.colors[0]?.id || '')",
  "const [selectedColorId, setSelectedColorId] = useState(detailData?.colors[0]?.id || '')\n  const [viewMode, setViewMode] = useState<'indoor' | 'outdoor'>('indoor')"
);

txt = txt.replace(
  "const selectedColor = detailData.colors.find(c => c.id === selectedColorId)",
  "const activeColors = viewMode === 'indoor' ? detailData.colors : (detailData.outdoorColors || detailData.colors)\n  const selectedColor = activeColors.find(c => c.id === selectedColorId) || activeColors[0]"
);

// Add toggle buttons above ColorSwatch
const colorSwatchSectionTarget = "{/* Color Selector (Right) */}";
const toggleCode = `
            {/* Color Selector (Right) */}
            <div className="lg:w-1/2 mt-12 lg:mt-0 flex flex-col items-center lg:items-start lg:pl-16">
              
              {detailData.outdoorColors && (
                <div className="flex bg-[#1a1a1b] rounded-full p-1 mb-8 w-full max-w-sm">
                  <button
                    onClick={() => { setViewMode('indoor'); setSelectedColorId(detailData.colors[0]?.id || ''); }}
                    className={\`flex-1 py-2 px-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 \${
                      viewMode === 'indoor'
                        ? 'bg-mammut-gold text-black shadow-lg shadow-mammut-gold/20'
                        : 'text-mammut-white/60 hover:text-mammut-white'
                    }\`}
                  >
                    Indoor View (PVC)
                  </button>
                  <button
                    onClick={() => { setViewMode('outdoor'); setSelectedColorId(detailData.outdoorColors?.[0]?.id || ''); }}
                    className={\`flex-1 py-2 px-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 \${
                      viewMode === 'outdoor'
                        ? 'bg-mammut-gold text-black shadow-lg shadow-mammut-gold/20'
                        : 'text-mammut-white/60 hover:text-mammut-white'
                    }\`}
                  >
                    Outdoor View (RAL)
                  </button>
                </div>
              )}`;

txt = txt.replace(
  `            {/* Color Selector (Right) */}\n            <div className="lg:w-1/2 mt-12 lg:mt-0 flex flex-col items-center lg:items-start lg:pl-16">`,
  toggleCode
);

txt = txt.replace(
  `<ColorSwatch \n                colors={detailData.colors}`,
  `<ColorSwatch \n                colors={activeColors}`
);

txt = txt.replace(
  `src={selectedColor?.windowImage || "/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp"}`,
  `src={viewMode === 'outdoor' && detailData.outdoorWindowPhoto ? detailData.outdoorWindowPhoto : (selectedColor?.windowImage || "/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp")}`
);

fs.writeFileSync('src/pages/ProductDetailPage.tsx', txt);
console.log('Updated ProductDetailPage.tsx');
