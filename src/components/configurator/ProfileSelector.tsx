import { useMemo } from 'react'
import { CheckCircle2, Layers } from 'lucide-react'
import type { ProfileSystem } from '../../types'
import { useConfiguratorStore } from '../../store/configuratorStore'

const MATERIAL_LABELS: Record<string, string> = {
  pvc: 'uPVC',
  aluminum: 'Aluminium',
  wood: 'Wood',
  'wood-aluminum': 'Wood-Alu',
}

interface ProfileSelectorProps {
  profiles: ProfileSystem[]
  onSelect: () => void // callback to advance to next step
}

export function ProfileSelector({ profiles, onSelect }: ProfileSelectorProps) {
  const { profileSystem, setProfileSystem, productCategory } = useConfiguratorStore()

  // Filter profiles that support this product category (window/door/…)
  const filtered = useMemo(
    () => profiles.filter((p) => p.allowed_types.includes(productCategory)),
    [profiles, productCategory]
  )

  // Group by material
  const grouped = useMemo(() => {
    const map = new Map<string, ProfileSystem[]>()
    for (const p of filtered) {
      const list = map.get(p.material) ?? []
      list.push(p)
      map.set(p.material, list)
    }
    return map
  }, [filtered])

  function handleSelect(profile: ProfileSystem) {
    setProfileSystem(profile)
    onSelect()
  }

  return (
    <div className="selector-container">
      <h2 className="selector-title">Choose your profile system</h2>
      <p className="selector-subtitle">
        The profile determines frame depth, thermal performance, and available window types.
      </p>

      {Array.from(grouped.entries()).map(([material, items]) => (
        <div key={material} className="material-group">
          <div className="material-label">
            <Layers size={14} />
            {MATERIAL_LABELS[material] ?? material}
          </div>
          <div className="profile-grid">
            {items.map((profile) => {
              const selected = profileSystem?.id === profile.id
              return (
                <button
                  key={profile.id}
                  className={`profile-card ${selected ? 'profile-card-selected' : ''}`}
                  onClick={() => handleSelect(profile)}
                  aria-pressed={selected}
                >
                  {selected && (
                    <CheckCircle2 size={18} className="profile-check" aria-hidden />
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
                      <span className="profile-badge">{profile.depth_mm} mm</span>
                    )}
                    {profile.description && (
                      <p className="profile-desc">{profile.description}</p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
