import { Loader2, ArrowRight } from 'lucide-react'
import { useConfiguratorStore } from '../../store/configuratorStore'

interface PriceSidebarProps {
  onRequestQuote: () => void
}

export function PriceSidebar({ onRequestQuote }: PriceSidebarProps) {
  const {
    profileSystem,
    windowType,
    dimensions,
    options,
    price,
    isPricingLoading,
    step,
    validateDimensions,
    setStep,
  } = useConfiguratorStore()

  const isConfigured = !!profileSystem && !!windowType

  function handleNext() {
    if (step < 4) {
      if (step === 3 && !validateDimensions()) return
      setStep((step + 1) as 1 | 2 | 3 | 4)
    } else {
      onRequestQuote()
    }
  }

  return (
    <aside className="price-sidebar">
      {/* Selection summary */}
      <div className="sidebar-section">
        <h3 className="sidebar-heading">Your Selection</h3>
        {profileSystem ? (
          <p className="sidebar-item">
            <span className="sidebar-item-key">Profile</span>
            <span>{profileSystem.name}</span>
          </p>
        ) : (
          <p className="sidebar-empty">No profile selected yet</p>
        )}
        {windowType && (
          <p className="sidebar-item">
            <span className="sidebar-item-key">Type</span>
            <span>{windowType.label}</span>
          </p>
        )}
        {isConfigured && (
          <p className="sidebar-item">
            <span className="sidebar-item-key">Size</span>
            <span>{dimensions.width} × {dimensions.height} mm</span>
          </p>
        )}
      </div>

      {/* Price breakdown */}
      {isConfigured && (
        <div className="sidebar-section">
          <h3 className="sidebar-heading">Price Estimate</h3>
          {isPricingLoading ? (
            <div className="sidebar-loader">
              <Loader2 size={18} className="spin" />
              <span>Calculating…</span>
            </div>
          ) : price ? (
            <>
              {price.line_items.map((item, i) => (
                <p key={i} className="sidebar-item">
                  <span className="sidebar-item-key">{item.label}</span>
                  <span>€{item.price_eur.toFixed(2)}</span>
                </p>
              ))}
              <div className="sidebar-total">
                <span>Total (excl. VAT)</span>
                <strong>€{price.total_eur.toFixed(2)}</strong>
              </div>
            </>
          ) : (
            <p className="sidebar-empty">Price will appear here</p>
          )}
        </div>
      )}

      {/* Active options quick summary */}
      {isConfigured && Object.keys(options).length > 0 && (
        <div className="sidebar-section sidebar-options">
          {Object.entries(options)
            .filter(([, v]) => v)
            .map(([group, key]) => (
              <span key={group} className="sidebar-tag">
                {key.replace(/-/g, ' ')}
              </span>
            ))}
        </div>
      )}

      {/* CTA */}
      <button
        className="sidebar-cta"
        onClick={handleNext}
        disabled={!profileSystem}
        aria-label={step < 4 ? 'Continue to next step' : 'Request a quote'}
      >
        {step < 4 ? 'Continue' : 'Request Quote'}
        <ArrowRight size={16} aria-hidden />
      </button>

      <p className="sidebar-disclaimer">
        *Prices are indicative estimates and exclude installation, delivery, and VAT.
      </p>
    </aside>
  )
}
