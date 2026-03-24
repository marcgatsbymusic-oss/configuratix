import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useConfiguratorStore } from '../store/configuratorStore'

/**
 * Reactive hook — re-fetches dimension constraints whenever
 * the (profileSystemId, windowTypeId) pair changes, then updates
 * the store's dimensionBounds so DimensionInput shows live labels.
 */
export function useConstraints() {
  const profileSystem = useConfiguratorStore((s) => s.profileSystem)
  const windowType = useConfiguratorStore((s) => s.windowType)

  useEffect(() => {
    if (!profileSystem || !windowType) return

    let cancelled = false

    supabase
      .from('constraints')
      .select('*')
      .eq('profile_system_id', profileSystem.id)
      .eq('window_type_id', windowType.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled || error || !data) return

        useConfiguratorStore.setState({
          dimensionBounds: {
            min_width_mm: data.min_width_mm,
            max_width_mm: data.max_width_mm,
            min_height_mm: data.min_height_mm,
            max_height_mm: data.max_height_mm,
          },
          // Clamp stored dimensions into new bounds
          dimensions: {
            width: Math.min(
              Math.max(
                useConfiguratorStore.getState().dimensions.width,
                data.min_width_mm
              ),
              data.max_width_mm
            ),
            height: Math.min(
              Math.max(
                useConfiguratorStore.getState().dimensions.height,
                data.min_height_mm
              ),
              data.max_height_mm
            ),
          },
        })
      })

    return () => {
      cancelled = true
    }
  }, [profileSystem?.id, windowType?.id])
}
