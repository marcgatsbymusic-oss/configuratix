import { useState } from 'react'
import type { SwatchColor } from '../../data/productDetails'
import { useTranslation } from 'react-i18next'

interface DoorColorPresenterProps {
  colors: SwatchColor[]
  selectedColorId: string
  onColorSelect: (color: SwatchColor) => void
}

export function DoorColorPresenter({ colors, selectedColorId, onColorSelect }: DoorColorPresenterProps) {
  const { t } = useTranslation()
  const selectedColor = colors.find(c => c.id === selectedColorId) || colors[0]

  return (
    <section className="bg-white">
      {/* Header block (black box) */}
      <div className="bg-[#1a1a1a] p-10 lg:p-14 relative w-full lg:w-2/3 xl:w-1/2">
        <div className="absolute -top-6 left-10 w-[2px] h-12 bg-mammut-gold" />
        <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
          PVC door colour range
        </h2>
        <p className="text-gray-400 text-sm">
          Choose the colour that suits you Over 30 veneer colours to choose from.
        </p>
      </div>

      {/* Main content grid */}
      <div className="container mx-auto px-6 lg:px-16 max-w-7xl py-12">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          
          {/* Left: Door Image Preview */}
          <div className="w-full lg:w-1/3 flex justify-center items-center min-h-[500px] relative">
            <div className="relative w-full max-w-sm h-auto flex justify-center">
              <img 
                src={selectedColor?.windowImage || '/assets/iglo5-doors/colors/white-fx-door.webp'} 
                alt={selectedColor?.name}
                className="w-full max-w-sm h-auto object-contain transition-opacity duration-300 relative z-10"
              />
              {!selectedColor?.windowImage && selectedColor?.image && (
                <div 
                  className="absolute inset-0 z-20 pointer-events-none mix-blend-multiply opacity-90 transition-colors duration-500"
                  style={{
                    backgroundImage: `url(${selectedColor.image})`,
                    backgroundSize: '30%', // tile the texture
                    maskImage: `url(/assets/iglo5-doors/door-mask.png)`,
                    WebkitMaskImage: `url(/assets/iglo5-doors/door-mask.png)`,
                    maskSize: 'contain',
                    WebkitMaskSize: 'contain',
                    maskRepeat: 'no-repeat',
                    WebkitMaskRepeat: 'no-repeat',
                    maskPosition: 'center',
                    WebkitMaskPosition: 'center',
                  }}
                />
              )}
            </div>
          </div>

          {/* Right: Color Swatches Grid */}
          <div className="w-full lg:w-2/3 flex flex-wrap gap-2 content-center justify-center lg:justify-start">
             {colors.map((color) => {
               const isSelected = color.id === selectedColorId
               return (
                 <button
                   key={color.id}
                   onClick={() => onColorSelect(color)}
                   className={`relative w-12 h-12 transition-all duration-200 outline outline-offset-2 ${
                     isSelected ? 'outline-[#eab676] scale-110 z-10' : 'outline-transparent hover:outline-black/20 hover:scale-105'
                   }`}
                   title={t(`colors.${color.id}`, { defaultValue: color.name })}
                 >
                   {color.image ? (
                     <div 
                       className="w-full h-full bg-cover bg-center border border-gray-200"
                       style={{ backgroundImage: `url(${color.image})` }}
                     />
                   ) : (
                     <div
                       className="w-full h-full border border-gray-200"
                       style={{ backgroundColor: color.hex }}
                     />
                   )}
                 </button>
               )
             })}
          </div>
        </div>
      </div>

      {/* Bottom Info Bar */}
      <div className="bg-[#111827] w-full py-8 mt-8 flex flex-col items-center justify-center text-center">
         <span className="text-gray-400 text-sm mb-2">Change the infill:</span>
         <span className="text-white font-bold text-lg">{t(`colors.${selectedColor.id}`, { defaultValue: selectedColor.name })}</span>
         {/* If we have a code we could display it, but hex is good enough for a proxy */}
         <span className="text-gray-400 text-xs mt-1 uppercase">{selectedColor.id}</span>
      </div>
    </section>
  )
}
