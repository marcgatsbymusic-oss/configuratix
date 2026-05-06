const fs = require('fs');

const ralColors = JSON.parse(fs.readFileSync('./scratch/ral_colors.json', 'utf8'));

const componentCode = `import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const LATH_COLORS = [
  { id: 'ral9016', name: 'RAL9016', hex: '#FFFFFF', thumb: '/assets/products/external-venetian-blinds/colors/thumb_ral9016.webp', mask: '/assets/products/external-venetian-blinds/colors/mask_ral9016.webp' },
  { id: 'ral9005', name: 'RAL9005', hex: '#000000', thumb: '/assets/products/external-venetian-blinds/colors/thumb_ral9005.webp', mask: '/assets/products/external-venetian-blinds/colors/mask_ral9005.webp' },
  { id: 'ral7016', name: 'RAL7016', hex: '#293133', thumb: '/assets/products/external-venetian-blinds/colors/thumb_ral7016.webp', mask: '/assets/products/external-venetian-blinds/colors/mask_ral7016.webp' },
  { id: 'ral9006', name: 'RAL9006', hex: '#A5A5A5', thumb: '/assets/products/external-venetian-blinds/colors/thumb_ral9006.webp', mask: '/assets/products/external-venetian-blinds/colors/mask_ral9006.webp' },
  { id: 'ral9007', name: 'RAL9007', hex: '#8F8F8F', thumb: '/assets/products/external-venetian-blinds/colors/thumb_ral9007.webp', mask: '/assets/products/external-venetian-blinds/colors/mask_ral9007.webp' },
  { id: 'db703',   name: 'DB 703',  hex: '#474A51', thumb: '/assets/products/external-venetian-blinds/colors/thumb_db703.webp',  mask: '/assets/products/external-venetian-blinds/colors/mask_db703.webp' },
];

const RAL_PALETTE = ${JSON.stringify(ralColors, null, 2)};

export function VenetianBlindsColorPicker() {
  const { t } = useTranslation();
  const [selectedLath, setSelectedLath] = useState(LATH_COLORS[0]);
  const [selectedBox, setSelectedBox] = useState(RAL_PALETTE.find(c => c.name === 'Orange brown') || RAL_PALETTE[0]);

  return (
    <section className="bg-white pt-24 pb-0" id="colors">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-[#1a1a1a] p-10 lg:p-14 relative mb-12">
          <div className="absolute -top-6 left-10 lg:left-14 w-[2px] h-12 bg-mammut-gold" />
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Venetian blind colour range
          </h2>
          <p className="text-white max-w-5xl leading-relaxed text-sm lg:text-base opacity-80">
            We use matt paints as standard.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-16 w-full items-start mt-6">
          {/* Left Panel: Preview Image */}
          <div className="w-full lg:w-1/2 flex items-center justify-center min-h-[400px] relative bg-gray-50 border border-gray-200">
            {/* The background color of the box */}
            <div 
              className="absolute inset-0 transition-colors duration-500" 
              style={{ backgroundColor: selectedBox.hex }} 
            />
            {/* The transparent mask with the laths */}
            <img 
              src={selectedLath.mask} 
              alt="Venetian Blinds Mask" 
              className="relative z-10 w-full h-auto max-h-[500px] object-contain transition-opacity duration-300"
            />
          </div>

          {/* Right Panel: Color Selectors */}
          <div className="w-full lg:w-1/2 flex flex-col gap-12">
            
            {/* Lath Colors (Small Palette) */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-black mb-6 flex justify-between">
                <span>Choose lath colour:</span>
                <span className="text-mammut-gold">{selectedLath.name}</span>
              </h3>
              <div className="flex flex-wrap gap-4">
                {LATH_COLORS.map(color => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedLath(color)}
                    className={\`relative w-16 h-16 rounded-sm overflow-hidden transition-all duration-300 \${
                      selectedLath.id === color.id ? 'ring-2 ring-mammut-gold ring-offset-2 scale-110 z-10' : 'ring-1 ring-gray-200 hover:ring-mammut-gold hover:scale-105'
                    }\`}
                    title={color.name}
                  >
                    <img src={color.thumb} alt={color.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Box and Guide Colors (RAL Palette) */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-black mb-6 flex justify-between border-t border-gray-100 pt-8">
                <span>Choose box & roller guide colour:</span>
                <span className="text-mammut-gold">RAL {selectedBox.code} - {selectedBox.name}</span>
              </h3>
              <div className="grid grid-cols-10 sm:grid-cols-12 md:grid-cols-14 gap-2 h-64 overflow-y-auto pr-4 custom-scrollbar">
                {RAL_PALETTE.map(color => (
                  <button
                    key={color.code}
                    onClick={() => setSelectedBox(color)}
                    className={\`w-full aspect-square rounded-sm transition-all duration-200 \${
                      selectedBox.code === color.code ? 'ring-2 ring-mammut-gold ring-offset-2 scale-110 z-10 shadow-lg' : 'hover:scale-110 hover:shadow-md border border-gray-200'
                    }\`}
                    style={{ backgroundColor: color.hex }}
                    title={\`\${color.name} (RAL \${color.code})\`}
                  />
                ))}
              </div>
            </div>
            
          </div>
        </div>
      </div>
      
      {/* Selected Color Banner (Bottom) */}
      <div className="w-full border-t border-gray-100 mt-16 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-8 flex items-center justify-between border-b md:border-b-0 md:border-r border-gray-100 relative overflow-hidden group">
            <div className="absolute inset-0 z-0">
               <img src={selectedLath.thumb} className="w-full h-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-700" alt="bg" />
            </div>
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-800 mb-1">Choose lath colour:</p>
              <p className="text-xl font-black text-mammut-gold">{selectedLath.name}</p>
            </div>
          </div>
          <div className="p-8 flex items-center justify-between relative overflow-hidden group" style={{ backgroundColor: selectedBox.hex }}>
            <div className="relative z-10 bg-white/90 backdrop-blur-sm p-4 border-l-4 border-mammut-gold">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-800 mb-1">Choose box & guide colour:</p>
              <p className="text-xl font-black text-black">{selectedBox.name}</p>
              <p className="text-xs font-bold text-gray-500 mt-1">RAL-{selectedBox.code}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
`;

fs.writeFileSync('./src/components/products/VenetianBlindsColorPicker.tsx', componentCode);
console.log('Component generated!');
