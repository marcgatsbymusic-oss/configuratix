import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Grid3X3 } from 'lucide-react'
import type { ProfileSystem, WindowType } from '../../types'

interface MatrixCell {
  width_mm: number
  height_mm: number
  price_eur: number
}

export function PricingManager() {
  const [loading, setLoading] = useState(true)
  const [systems, setSystems] = useState<ProfileSystem[]>([])
  const [types, setTypes] = useState<WindowType[]>([])
  
  const [selectedSystem, setSelectedSystem] = useState<string>('')
  const [selectedType, setSelectedType] = useState<string>('')
  
  const [matrixData, setMatrixData] = useState<MatrixCell[]>([])
  
  const widths = Array.from({ length: 21 }, (_, i) => 500 + i * 100)
  const heights = Array.from({ length: 21 }, (_, i) => 500 + i * 100)

  useEffect(() => {
    async function loadFilters() {
      const [{ data: sData }, { data: tData }] = await Promise.all([
        supabase.from('profile_systems').select('*').order('sort_order'),
        supabase.from('window_types').select('*').order('sort_order')
      ])
      
      setSystems(sData || [])
      setTypes(tData || [])
      
      if (sData?.length) setSelectedSystem((sData as ProfileSystem[])[0].id)
      if (tData?.length) setSelectedType((tData as WindowType[])[0].id)
      
      setLoading(false)
    }
    loadFilters()
  }, [])

  useEffect(() => {
    async function loadMatrix() {
      if (!selectedSystem || !selectedType) return
      
      // Load price_matrices for selected combination
      const { data, error } = await supabase
        .from('price_matrices')
        .select('*')
        .eq('profile_system_id', selectedSystem)
        .eq('window_type_id', selectedType)
        
      if (!error && data) {
        setMatrixData(data)
      } else {
        setMatrixData([])
      }
    }
    
    loadMatrix()
  }, [selectedSystem, selectedType])

  if (loading) return <div>Loading...</div>

  // Helper to find price for W/H
  const getPrice = (w: number, h: number) => {
    const cell = matrixData.find(c => c.width_mm === w && c.height_mm === h)
    return cell ? `€${cell.price_eur}` : '-'
  }

  return (
    <div className="space-y-8 animate-fade-in text-mammut-white pt-4 px-4 font-sans h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-light tracking-tight">Pricing Matrices</h2>
          <p className="text-zinc-400 mt-2">View grid pricing based on Profile System and Window Type combinations.</p>
        </div>
      </div>

      <div className="flex space-x-4 mb-6">
        <select 
          className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-mammut-white outline-none focus:border-mammut-gold"
          value={selectedSystem}
          onChange={(e) => setSelectedSystem(e.target.value)}
        >
          {systems.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        
        <select 
          className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-mammut-white outline-none focus:border-mammut-gold"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          {types.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
      </div>

      <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden overflow-x-auto overflow-y-auto max-h-[70vh]">
        <table className="w-full text-sm text-center min-w-max">
          <thead className="sticky top-0 bg-zinc-950 z-10 border-b border-zinc-800">
            <tr>
              <th className="p-3 font-medium text-zinc-400 border-r border-zinc-800">H \ W</th>
              {widths.map(w => (
                <th key={w} className="p-3 font-medium text-mammut-gold min-w-[80px] border-r border-zinc-800">{w}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {heights.map(h => (
              <tr key={h} className="border-b border-zinc-800 hover:bg-zinc-800/30">
                <td className="p-3 font-medium text-mammut-gold sticky left-0 bg-zinc-950 border-r border-zinc-800 z-10">{h}</td>
                {widths.map(w => (
                  <td key={`${w}-${h}`} className="p-3 text-zinc-300 border-r border-zinc-800/50 hover:bg-zinc-700/50 cursor-crosshair">
                    {getPrice(w, h)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        
        {matrixData.length === 0 && (
          <div className="p-12 text-center text-zinc-500">
            <Grid3X3 className="mx-auto mb-4 opacity-50" size={48} />
            <p>No matrix data found for this combination.</p>
          </div>
        )}
      </div>
    </div>
  )
}
