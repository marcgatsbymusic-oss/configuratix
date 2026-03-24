import { useState } from 'react'
import { useConfiguratorStore } from '../store/configuratorStore'
import { useCatalog } from '../hooks/useCatalog'
import { useConstraints } from '../hooks/useConstraints'

import { StepProgress } from '../components/configurator/StepProgress'
import { ProfileSelector } from '../components/configurator/ProfileSelector'
import { WindowTypeSelector } from '../components/configurator/WindowTypeSelector'
import { DimensionInput } from '../components/configurator/DimensionInput'
import { OptionGroup } from '../components/configurator/OptionGroup'
import { WindowPreview } from '../components/configurator/WindowPreview'
import { PriceSidebar } from '../components/configurator/PriceSidebar'
import { QuoteRequestForm } from '../components/configurator/QuoteRequestForm'
import '../components/configurator/configurator.css'

// ── Option groups rendered on step 3 ─────────────────────────────────────────
const DETAIL_GROUPS = [
  { groupName: 'glazing', label: 'Glazing' },
  { groupName: 'color_exterior', label: 'Exterior Colour' },
  { groupName: 'color_interior', label: 'Interior Colour' },
  { groupName: 'security', label: 'Security Level' },
  { groupName: 'handle', label: 'Handle' },
  { groupName: 'spacer', label: 'Spacer Bar' },
]

export function ConfiguratorPage() {
  const { step, setStep, windowType } = useConfiguratorStore()
  const { profileSystems, windowTypes, options, isLoading, error } = useCatalog()
  const [quoteOpen, setQuoteOpen] = useState(false)

  // Reactive constraint fetch whenever profile × window type changes
  useConstraints()

  // ── navigation helpers ──────────────────────────────────────────────────
  function goToStep(s: 1 | 2 | 3 | 4) {
    setQuoteOpen(false)
    setStep(s)
  }

  function handleProfileSelect() {
    if (step === 1) setStep(2)
  }

  function handleWindowTypeSelect() {
    if (step === 2) setStep(3)
  }

  // ── render ──────────────────────────────────────────────────────────────
  return (
    <div className="cfg-page">
      {/* ── Header ── */}
      <header className="cfg-header">
        <h1 className="cfg-title">Configure Your Window</h1>
        <p className="cfg-subtitle">
          Build your ideal window step by step — profile, type, dimensions, and options.
        </p>
      </header>

      {/* ── Step breadcrumb ── */}
      <div className="cfg-progress">
        <StepProgress />
      </div>

      {/* ── Main layout: content + sidebar ── */}
      <div className="cfg-layout">
        {/* ── Left: step content ── */}
        <main className="cfg-main">
          {error && (
            <div className="cfg-inline-error" role="alert">
              ⚠️ Could not load catalog data — {error}. Check your Supabase connection.
            </div>
          )}
          {isLoading ? (
            <div className="cfg-loading">
              <div className="cfg-spinner" />
              <span>Loading catalog…</span>
            </div>
          ) : quoteOpen ? (
            <QuoteRequestForm />
          ) : step === 1 ? (
            <ProfileSelector
              profiles={profileSystems}
              onSelect={handleProfileSelect}
            />
          ) : step === 2 ? (
            <WindowTypeSelector
              windowTypes={windowTypes}
              onSelect={handleWindowTypeSelect}
            />
          ) : step === 3 ? (
            <div className="details-step">
              {/* Dimension inputs */}
              <div className="dimension-inputs">
                <DimensionInput field="width" label="Width" />
                <DimensionInput field="height" label="Height" />
              </div>

              {/* Live window preview */}
              {windowType && (
                <div className="preview-section">
                  <h3 className="section-label">Preview</h3>
                  <WindowPreview
                    sashCount={windowType.sash_count}
                    openingType={windowType.opening_type}
                    width={320}
                    height={260}
                  />
                </div>
              )}

              {/* Option groups */}
              {DETAIL_GROUPS.map(({ groupName, label }) => (
                <OptionGroup
                  key={groupName}
                  groupName={groupName}
                  label={label}
                  options={options}
                />
              ))}
            </div>
          ) : step === 4 ? (
            <QuoteRequestForm />
          ) : null}

          {/* ── Prev / Next navigation (mobile-friendly) ── */}
          {!quoteOpen && (
            <div className="cfg-nav">
              {step > 1 && (
                <button
                  className="cfg-nav-back"
                  onClick={() => goToStep((step - 1) as 1 | 2 | 3 | 4)}
                >
                  ← Back
                </button>
              )}
            </div>
          )}
        </main>

        {/* ── Right: sticky price sidebar ── */}
        <aside className="cfg-sidebar-wrap">
          <PriceSidebar onRequestQuote={() => { setQuoteOpen(true); setStep(4) }} />
        </aside>
      </div>
    </div>
  )
}
