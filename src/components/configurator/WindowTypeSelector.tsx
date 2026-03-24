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
      <h2 className="selector-title">Choose window type</h2>
      <p className="selector-subtitle">
        Select a sash configuration. Available options depend on your chosen profile.
      </p>
      <div className="window-type-grid">
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
                  width={120}
                  height={90}
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
