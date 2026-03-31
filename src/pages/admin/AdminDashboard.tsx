import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Package, LayoutTemplate, SquareChartGantt } from 'lucide-react'

export function AdminDashboard() {
  const [stats, setStats] = useState({ profiles: 0, types: 0, matrices: 0 })

  useEffect(() => {
    async function loadStats() {
      // Fetch some basic counts
      const [profilesRes, typesRes] = await Promise.all([
        supabase.from('profile_systems').select('*', { count: 'exact', head: true }),
        supabase.from('window_types').select('*', { count: 'exact', head: true })
      ])
      
      // Attempt to load matrix count if table exists
      const matricesRes = await supabase.from('price_matrices').select('*', { count: 'exact', head: true })
      
      setStats({
        profiles: profilesRes.count || 0,
        types: typesRes.count || 0,
        matrices: matricesRes.count || 0
      })
    }
    loadStats()
  }, [])

  return (
    <div className="space-y-8 animate-fade-in text-white pt-4 px-4 font-sans">
      <h2 className="text-3xl font-light tracking-tight">Overview</h2>
      <p className="text-zinc-400">Welcome to the complete company control panel.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <h3 className="text-zinc-400">Profile Systems</h3>
            <Package className="text-[#eab676]" size={24} />
          </div>
          <div className="mt-4">
            <span className="text-4xl font-light">{stats.profiles}</span>
            <p className="text-sm text-zinc-500 mt-1">Active materials and systems</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <h3 className="text-zinc-400">Window Types</h3>
            <LayoutTemplate className="text-[#eab676]" size={24} />
          </div>
          <div className="mt-4">
            <span className="text-4xl font-light">{stats.types}</span>
            <p className="text-sm text-zinc-500 mt-1">Sash configurations</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <h3 className="text-zinc-400">Pricing Matrices</h3>
            <SquareChartGantt className="text-[#eab676]" size={24} />
          </div>
          <div className="mt-4">
            <span className="text-4xl font-light">{stats.matrices}</span>
            <p className="text-sm text-zinc-500 mt-1">Total active pricing cells</p>
          </div>
        </div>
      </div>
    </div>
  )
}
