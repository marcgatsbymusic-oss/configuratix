import { useMemo } from 'react'
import { CheckCircle2 } from 'lucide-react'
import type { WindowType } from '../../types'
import { useConfiguratorStore } from '../../store/configuratorStore'
import { WindowPreview } from './WindowPreview'

interface WindowTypeSelectorProps {
  windowTypes: WindowType[]
  onSelect: () => void
}

export function WindowTypeSelector({ windowTypes, onSelect }: WindowTypeSelectorProps) {
  const { windowType: selected, profileSystem, setWindowType } = useConfiguratorStore()

  // Only show types compatible with selected profile's material
  const filtered = useMemo(() => {
    if (!profileSystem) return windowTypes
    return windowTypes.filter(
      (t) =>
        t.allowed_materials.includes(profileSystem.material) ||
        t.allowed_materials.length === 0
    )
  }, [windowTypes, profileSystem])

  function handleSelect(wt: WindowType) {
    setWindowType(wt)
    onSelect()
  }

  return (
    <div className="selector-container">
      {/* Instruction bar */}
      <div className="step-instruction">
        <p className="step-instruction-text">
          Please select a window type for your chosen profile
        </p>
      </div>

      {/* Window type grid — fensternorm style: seamless grid with dividing lines */}
      <div className="window-type-grid" style={{ marginTop: '1.5rem' }}>
        {filtered.map((wt) => {
          const isSelected = selected?.id === wt.id
          return (
            <button
              key={wt.id}
              className={`window-type-card ${isSelected ? 'window-type-selected' : ''}`}
              onClick={() => handleSelect(wt)}
              aria-pressed={isSelected}
            >
              {isSelected && (
                <CheckCircle2 size={16} className="wt-check" aria-hidden />
              )}
              <div className="wt-preview">
                <WindowPreview
                  sashCount={wt.sash_count}
                  openingType={wt.opening_type}
                  width={130}
                  height={100}
                  mini
                />
              </div>
              <span className="wt-label">{wt.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
