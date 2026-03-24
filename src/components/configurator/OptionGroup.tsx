import { useMemo } from 'react'
import { CheckCircle2 } from 'lucide-react'
import type { OptionItem } from '../../types'
import { useConfiguratorStore } from '../../store/configuratorStore'

interface OptionGroupProps {
  groupName: string
  label: string
  options: OptionItem[]
}

export function OptionGroup({ groupName, label, options }: OptionGroupProps) {
  const { options: selected, profileSystem, setOption } = useConfiguratorStore()

  const filtered = useMemo(() => {
    if (!profileSystem) return options.filter((o) => o.group_name === groupName)
    return options.filter(
      (o) =>
        o.group_name === groupName &&
        (o.allowed_materials.length === 0 ||
          o.allowed_materials.includes(profileSystem.material))
    )
  }, [options, groupName, profileSystem])

  if (filtered.length === 0) return null

  const current = selected[groupName]

  return (
    <div className="option-group">
      <h3 className="option-group-title">{label}</h3>
      <div className="option-grid">
        {filtered.map((opt) => {
          const isSelected = current === opt.key
          // Special rendering for colour swatches
          const hex = (opt.value_json as { hex?: string | null }).hex

          return (
            <button
              key={opt.key}
              className={`option-card ${isSelected ? 'option-card-selected' : ''} ${hex ? 'option-card-swatch' : ''}`}
              onClick={() => setOption(groupName, opt.key)}
              aria-pressed={isSelected}
              title={opt.description ?? opt.label}
            >
              {isSelected && (
                <CheckCircle2 size={14} className="option-check" aria-hidden />
              )}
              {hex ? (
                <span
                  className="option-swatch"
                  style={{ background: hex }}
                  aria-hidden
                />
              ) : opt.icon_url ? (
                <img src={opt.icon_url} alt="" className="option-icon" aria-hidden />
              ) : null}
              <span className="option-label">{opt.label}</span>
              {opt.description && (
                <span className="option-desc">{opt.description}</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
