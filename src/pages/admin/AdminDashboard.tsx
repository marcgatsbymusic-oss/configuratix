import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Package, SquareChartGantt, FileText, Factory } from 'lucide-react'

export function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ profiles: 0, types: 0, matrices: 0, pending: 0, factory: 0 })

  useEffect(() => {
    async function loadStats() {
      const [profilesRes, typesRes] = await Promise.all([
        supabase.from('profile_systems').select('*', { count: 'exact', head: true }),
        supabase.from('window_types').select('*', { count: 'exact', head: true })
      ])
      const matricesRes = await supabase.from('price_matrices').select('*', { count: 'exact', head: true })
      const pendingRes = await supabase.from('quotations').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      const factoryRes = await supabase.from('quotations').select('*', { count: 'exact', head: true }).eq('status', 'factory')

      setStats({
        profiles: profilesRes.count || 0,
        types: typesRes.count || 0,
        matrices: matricesRes.count || 0,
        pending: pendingRes.count || 0,
        factory: factoryRes.count || 0,
      })
    }
    loadStats()
  }, [])

  return (
    <div className="space-y-8 animate-fade-in text-mammut-white pt-4 px-4 font-sans">
      <h2 className="text-3xl font-light tracking-tight">Overview</h2>
      <p className="text-zinc-400">Welcome to the complete company control panel.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <button onClick={() => navigate('/admin/quotations?tab=pending')}
          className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 flex flex-col justify-between text-left hover:border-amber-500/40 transition-colors">
          <div className="flex justify-between items-start">
            <h3 className="text-amber-400 font-semibold">Pending Quotations</h3>
            <FileText className="text-amber-400" size={24} />
          </div>
          <div className="mt-4">
            <span className="text-4xl font-light text-mammut-white">{stats.pending}</span>
            <p className="text-sm text-amber-400/60 mt-1">Awaiting review</p>
          </div>
        </button>

        <button onClick={() => navigate('/admin/factory')}
          className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 flex flex-col justify-between text-left hover:border-emerald-500/40 transition-colors">
          <div className="flex justify-between items-start">
            <h3 className="text-emerald-400 font-semibold">Factory Queue</h3>
            <Factory className="text-emerald-400" size={24} />
          </div>
          <div className="mt-4">
            <span className="text-4xl font-light text-mammut-white">{stats.factory}</span>
            <p className="text-sm text-emerald-400/60 mt-1">Ready for Cantor upload</p>
          </div>
        </button>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <h3 className="text-zinc-400">Profile Systems</h3>
            <Package className="text-mammut-gold" size={24} />
          </div>
          <div className="mt-4">
            <span className="text-4xl font-light">{stats.profiles}</span>
            <p className="text-sm text-zinc-500 mt-1">Active materials and systems</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <h3 className="text-zinc-400">Pricing Matrices</h3>
            <SquareChartGantt className="text-mammut-gold" size={24} />
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
