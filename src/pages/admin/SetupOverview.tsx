import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Layers, ChevronRight, ChevronDown, Wrench } from 'lucide-react'
import type { ProfileSystem, WindowType } from '../../types'

export function SetupOverview() {
  const [loading, setLoading] = useState(true)
  const [profileSystems, setProfileSystems] = useState<ProfileSystem[]>([])
  
  // Maps profile_system id to array of valid window types based on constraints
  const [systemTypesMap, setSystemTypesMap] = useState<Record<string, WindowType[]>>({})
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  useEffect(() => {
    async function loadData() {
      const [{ data: systems }, { data: types }, { data: constraints }] = await Promise.all([
        supabase.from('profile_systems').select('*').order('sort_order'),
        supabase.from('window_types').select('*').order('sort_order'),
        supabase.from('constraints').select('*')
      ])

      const validSystems = (systems as ProfileSystem[]) || []
      const validTypes = (types as WindowType[]) || []
      const validConstraints = (constraints as any[]) || []

      // Create mapping of valid window types for each profile system
      const map: Record<string, WindowType[]> = {}
      
      validConstraints.forEach(c => {
        if (!map[c.profile_system_id]) map[c.profile_system_id] = []
        const type = validTypes.find(t => t.id === c.window_type_id)
        if (type && !map[c.profile_system_id].some(t => t.id === type.id)) {
          map[c.profile_system_id].push(type)
        }
      })

      setProfileSystems(validSystems)
      setSystemTypesMap(map)
      
      // Auto-expand first item
      if (validSystems.length > 0) {
        setExpanded({ [validSystems[0].id]: true })
      }
      
      setLoading(false)
    }
    loadData()
  }, [])

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  if (loading) return <div>Loading setup...</div>

  return (
    <div className="space-y-8 animate-fade-in text-white pt-4 px-4 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-light tracking-tight">Window Setup</h2>
          <p className="text-zinc-400 mt-2">Manage Profile Systems, Window Types, and Structural Constraints.</p>
        </div>
        <button className="bg-[#eab676] hover:bg-[#d9a465] text-zinc-950 px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
          <Wrench size={18} />
          <span>New Profile</span>
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 bg-zinc-800/50 border-b border-zinc-800 font-medium text-zinc-300">
          Hierarchical Setup View
        </div>
        
        <div className="divide-y divide-zinc-800">
          {profileSystems.map(system => {
            const isExpanded = expanded[system.id]
            const types = systemTypesMap[system.id] || []

            return (
              <div key={system.id} className="flex flex-col">
                <div 
                  className="flex items-center justify-between px-6 py-4 hover:bg-zinc-800/30 cursor-pointer transition-colors"
                  onClick={() => toggleExpand(system.id)}
                >
                  <div className="flex items-center space-x-4">
                    <button className="text-zinc-500 hover:text-white transition-colors">
                      {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </button>
                    <Layers className="text-[#eab676]" size={20} />
                    <div className="flex flex-col">
                      <span className="font-medium text-lg">{system.name}</span>
                      <span className="text-sm text-zinc-500 uppercase tracking-widest">{system.material}</span>
                    </div>
                  </div>
                  <div className="flex space-x-4 text-sm text-zinc-400">
                    <span>{types.length} window types linked</span>
                  </div>
                </div>

                {/* Sub Menu / Nested Types */}
                {isExpanded && (
                  <div className="bg-zinc-950 px-12 py-4 space-y-2 border-t border-zinc-800 border-dashed">
                    {types.length === 0 ? (
                      <p className="text-zinc-500 text-sm py-2">No window types or constraints linked yet.</p>
                    ) : (
                      types.map(type => (
                        <div key={type.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-800 transition-colors">
                          <div className="flex items-center space-x-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#eab676]"></span>
                            <span className="font-medium">{type.label}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                              {type.sash_count} Sash • {type.opening_type}
                            </span>
                          </div>
                          <button className="text-sm text-[#eab676] hover:underline">
                            Edit Constraints
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
