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
          <h4 className="text-[#dca95c] text-[10px] font-bold uppercase tracking-[0.2em] mb-4 pb-2 border-b border-[#2a2a2b]">
            {t(`colorGroups.${groupName}`)}
          </h4>
          <div className="flex flex-wrap gap-3">
            {groupColors.map((color) => {
              const isSelected = color.id === selectedColorId
              return (
                <button
                  key={color.id}
                  onClick={() => onColorSelect(color)}
                  className={`relative group w-10 h-10 transition-all duration-200 outline outline-offset-2 ${
                    isSelected ? 'outline-[#dca95c]' : 'outline-transparent hover:outline-white/30'
                  }`}
                  aria-label={`Select color ${t(`colors.${color.id}`)}`}
                  title={t(`colors.${color.id}`)}
                >
                  {color.image ? (
                    <div 
                      className="w-full h-full border border-white/10 bg-cover bg-center"
                      style={{ backgroundImage: `url(${color.image})` }}
                    />
                  ) : (
                    <div
                      className="w-full h-full border border-white/10"
                      style={{ backgroundColor: color.hex }}
                    />
                  )}
                  {/* Tooltip on hover */}
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-[#1a1a1b] border border-[#2a2a2b] text-white text-[10px] uppercase font-semibold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg shadow-black/50">
                    {t(`colors.${color.id}`)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
