import { useConfiguratorStore } from '../../store/configuratorStore'

interface DimensionInputProps {
  field: 'width' | 'height'
  label: string
}

export function DimensionInput({ field, label }: DimensionInputProps) {
  const { dimensions, dimensionBounds, validationErrors, setDimension } =
    useConfiguratorStore()

  const value = dimensions[field]
  const min = field === 'width' ? dimensionBounds.min_width_mm : dimensionBounds.min_height_mm
  const max = field === 'width' ? dimensionBounds.max_width_mm : dimensionBounds.max_height_mm
  const error = validationErrors[field]

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseInt(e.target.value, 10)
    if (!isNaN(v)) setDimension(field, v)
  }

  return (
    <div className={`dimension-input-wrap ${error ? 'dim-error' : ''}`}>
      <label className="dim-label" htmlFor={`dim-${field}`}>
        {label}
      </label>
      <div className="dim-input-row">
        <input
          id={`dim-${field}`}
          type="number"
          className="dim-input"
          value={value}
          min={min}
          max={max}
          step={10}
          onChange={handleChange}
          aria-describedby={`dim-${field}-hint ${error ? `dim-${field}-error` : ''}`}
        />
        <span className="dim-unit">mm</span>
      </div>
      <span id={`dim-${field}-hint`} className="dim-hint">
        Allowed: {min}–{max} mm
      </span>
      {error && (
        <span id={`dim-${field}-error`} className="dim-error-msg" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
