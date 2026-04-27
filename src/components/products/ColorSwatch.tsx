import type { SwatchColor } from '../../data/productDetails'
import { useTranslation } from 'react-i18next'

interface ColorSwatchProps {
  colors: SwatchColor[]
  selectedColorId: string
  onColorSelect: (color: SwatchColor) => void
}

export function ColorSwatch({ colors, selectedColorId, onColorSelect }: ColorSwatchProps) {
  const { t } = useTranslation()
  // Group colors by category (Solid, Wood Effect, Metal Effect)
  const groupedColors = colors.reduce((acc, color) => {
    if (!acc[color.group]) {
      acc[color.group] = []
    }
    acc[color.group].push(color)
    return acc
  }, {} as Record<string, SwatchColor[]>)

  return (
    <div className="w-full space-y-8">
      {Object.entries(groupedColors).map(([groupName, groupColors]) => (
        <div key={groupName}>
          {groupColors.length <= 20 && (
            <h4 className="text-mammut-gold text-[10px] font-bold uppercase tracking-[0.2em] mb-4 pb-2 border-b border-gray-200">
              {t(`colorGroups.${groupName}`)}
            </h4>
          )}
          {groupColors.length > 20 ? (
            /* Spectrum Layout for massive color sets (e.g. RAL 200+ colors) */
            <div className="flex flex-nowrap overflow-x-auto w-full gap-0 pb-6 pt-2 px-2 custom-scrollbar">
              {groupColors.map((color) => {
                const isSelected = color.id === selectedColorId
                return (
                  <button
                    key={color.id}
                    onClick={() => onColorSelect(color)}
                    className={`relative group flex-shrink-0 transition-all duration-200 ${
                      isSelected 
                        ? 'w-20 h-16 z-20 scale-y-110 shadow-xl border-2 border-white outline outline-1 outline-black/20' 
                        : 'w-2 h-14 hover:w-16 hover:z-10 hover:h-16 hover:-translate-y-1'
                    }`}
                    aria-label={`Select color ${t(`colors.${color.id}`)}`}
                    title={t(`colors.${color.id}`)}
                  >
                    {color.image ? (
                      <div 
                        className="w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${color.image})` }}
                      />
                    ) : (
                      <div
                        className="w-full h-full"
                        style={{ backgroundColor: color.hex }}
                      />
                    )}
                    {/* Tooltip on hover */}
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-max px-2 py-1 bg-white border border-gray-200 text-black text-[10px] uppercase font-semibold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 shadow-lg shadow-black/50">
                      {t(`colors.${color.id}`)}
                    </span>
                  </button>
                )
              })}
            </div>
          ) : (
            /* Standard Grid Layout for small color sets */
            <div className="flex flex-wrap gap-3">
              {groupColors.map((color) => {
                const isSelected = color.id === selectedColorId
                return (
                  <button
                    key={color.id}
                    onClick={() => onColorSelect(color)}
                    className={`relative group w-10 h-10 transition-all duration-200 outline outline-offset-2 ${
                      isSelected ? 'outline-[#eab676]' : 'outline-transparent hover:outline-black/20'
                    }`}
                    aria-label={`Select color ${t(`colors.${color.id}`)}`}
                    title={t(`colors.${color.id}`)}
                  >
                    {color.image ? (
                      <div 
                        className="w-full h-full border border-black/10 bg-cover bg-center"
                        style={{ backgroundImage: `url(${color.image})` }}
                      />
                    ) : (
                      <div
                        className="w-full h-full border border-black/10"
                        style={{ backgroundColor: color.hex }}
                      />
                    )}
                    {/* Tooltip on hover */}
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-white border border-gray-200 text-black text-[10px] uppercase font-semibold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg shadow-black/50">
                      {t(`colors.${color.id}`)}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
