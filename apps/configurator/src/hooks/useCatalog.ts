import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import type { ProfileSystem, WindowType, OptionItem } from '../types'

interface CatalogData {
  profileSystems: ProfileSystem[]
  windowTypes: WindowType[]
  options: OptionItem[]
  isLoading: boolean
  error: string | null
}

const cache: Partial<CatalogData> = {}

export function useCatalog(): CatalogData {
  const [state, setState] = useState<CatalogData>({
    profileSystems: cache.profileSystems ?? [],
    windowTypes: cache.windowTypes ?? [],
    options: cache.options ?? [],
    isLoading: !cache.profileSystems,
    error: null,
  })

  const hasFetched = useRef(!!cache.profileSystems)

  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true

    async function fetchCatalog() {
      try {
        const [profilesRes, typesRes, optionsRes] = await Promise.all([
          supabase
            .from('profile_systems')
            .select('*')
            .eq('is_active', true)
            .order('sort_order'),
          supabase
            .from('window_types')
            .select('*')
            .eq('is_active', true)
            .order('sort_order'),
          supabase
            .from('options')
            .select('*')
            .eq('is_active', true)
            .order('sort_order'),
        ])

        if (profilesRes.error) throw profilesRes.error
        if (typesRes.error) throw typesRes.error
        if (optionsRes.error) throw optionsRes.error

        const profileSystems = (profilesRes.data as ProfileSystem[]) ?? []
        const windowTypes = (typesRes.data as WindowType[]) ?? []
        const options = (optionsRes.data as OptionItem[]) ?? []

        // Populate module-level cache
        cache.profileSystems = profileSystems
        cache.windowTypes = windowTypes
        cache.options = options

        setState({ profileSystems, windowTypes, options, isLoading: false, error: null })
      } catch (err) {
        setState((s) => ({
          ...s,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Failed to load catalog',
        }))
      }
    }

    fetchCatalog()
  }, [])

  return state
}
