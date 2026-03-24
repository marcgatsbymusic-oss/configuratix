import { useMemo, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import type { ProfileSystem, ProductMaterial } from '../../types'
import { useConfiguratorStore } from '../../store/configuratorStore'

const MATERIAL_TABS: { key: ProductMaterial | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pvc', label: 'uPVC' },
  { key: 'aluminum', label: 'Aluminium' },
  { key: 'wood', label: 'Wood' },
  { key: 'wood-aluminum', label: 'Wood-Alu' },
]

interface ProfileSelectorProps {
  profiles: ProfileSystem[]
  onSelect: () => void
}

export function ProfileSelector({ profiles, onSelect }: ProfileSelectorProps) {
  const { profileSystem, setProfileSystem, productCategory } = useConfiguratorStore()
  const [activeMaterial, setActiveMaterial] = useState<ProductMaterial | 'all'>('all')

  // Filter by category first, then by active material tab
  const filtered = useMemo(() => {
    const byCategory = profiles.filter((p) => p.allowed_types.includes(productCategory))
    if (activeMaterial === 'all') return byCategory
    return byCategory.filter((p) => p.material === (activeMaterial as ProductMaterial))
  }, [profiles, productCategory, activeMaterial])

  // Only show tabs that have at least one profile
  const availableMaterials = useMemo(() => {
    const byCategory = profiles.filter((p) => p.allowed_types.includes(productCategory))
    const existing = new Set(byCategory.map((p) => p.material))
    return MATERIAL_TABS.filter((t) => t.key === 'all' || existing.has(t.key))
  }, [profiles, productCategory])

  function handleSelect(profile: ProfileSystem) {
    setProfileSystem(profile)
    onSelect()
  }

  return (
    <div className="selector-container">
      {/* Material filter tabs */}
      <div className="step-instruction">
        <p className="step-instruction-text">
          Please first select the desired window profile system
        </p>
        <div className="mat-filter-tabs">
          {availableMaterials.map((tab) => (
            <button
              key={tab.key}
              className={`mat-tab ${activeMaterial === tab.key ? 'mat-tab-active' : ''}`}
              onClick={() => setActiveMaterial(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Profile grid */}
      <div className="profile-grid" style={{ marginTop: '1.5rem' }}>
        {filtered.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic', gridColumn: '1/-1' }}>
            No profiles available for this selection.
          </p>
        ) : (
          filtered.map((profile) => {
            const selected = profileSystem?.id === profile.id
            return (
              <button
                key={profile.id}
                className={`profile-card ${selected ? 'profile-card-selected' : ''}`}
                onClick={() => handleSelect(profile)}
                aria-pressed={selected}
              >
                {selected && (
                  <CheckCircle2 size={20} className="profile-check" aria-hidden />
                )}
                <div className="profile-img-wrap">
                  {profile.image_url ? (
                    <img src={profile.image_url} alt={profile.name} />
                  ) : (
                    <div className="profile-img-placeholder" />
                  )}
                </div>
                <div className="profile-info">
                  <strong>{profile.name}</strong>
                  {profile.uw_value != null && (
                    <span className="profile-badge">
                      U<sub>w</sub> {profile.uw_value} W/m²K
                    </span>
                  )}
                  {profile.depth_mm != null && (
                    <span className="profile-badge">{profile.depth_mm} mm depth</span>
                  )}
                  {profile.description && (
                    <p className="profile-desc">{profile.description}</p>
                  )}
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
