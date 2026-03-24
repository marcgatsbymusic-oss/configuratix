import React from 'react'
import { Check, ChevronRight } from 'lucide-react'
import { useConfiguratorStore } from '../../store/configuratorStore'

const STEPS = [
  { id: 1, label: 'Profile System' },
  { id: 2, label: 'Window Type' },
  { id: 3, label: 'Details' },
  { id: 4, label: 'Summary' },
] as const

export function StepProgress() {
  const { step, setStep, profileSystem, windowType } = useConfiguratorStore()

  // A step is navigable if previous required selections are complete
  function isAccessible(target: number) {
    if (target === 1) return true
    if (target === 2) return !!profileSystem
    if (target === 3) return !!profileSystem && !!windowType
    if (target === 4) return !!profileSystem && !!windowType
    return false
  }

  return (
    <nav className="configurator-steps" aria-label="Configuration progress">
      {STEPS.map((s, idx) => {
        const done = step > s.id
        const active = step === s.id
        const accessible = isAccessible(s.id)

        return (
          <React.Fragment key={s.id}>
            <button
              className={`step-item ${active ? 'step-active' : ''} ${done ? 'step-done' : ''} ${!accessible ? 'step-locked' : ''}`}
              onClick={() => accessible && setStep(s.id as 1 | 2 | 3 | 4)}
              disabled={!accessible}
              aria-current={active ? 'step' : undefined}
              aria-label={`Step ${s.id}: ${s.label}`}
            >
              <span className="step-bubble">
                {done ? <Check size={14} strokeWidth={3} /> : s.id}
              </span>
              <span className="step-label">{s.label}</span>
            </button>
            {idx < STEPS.length - 1 && (
              <ChevronRight size={16} className="step-divider" aria-hidden />
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
