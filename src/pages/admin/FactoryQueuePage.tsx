import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuotationsStore } from '../../store/useQuotationsStore'
import { QuotationStatusBadge } from '../../components/admin/QuotationStatusBadge'
import { Factory, CheckSquare, RefreshCw, ArrowRight } from 'lucide-react'

export function FactoryQueuePage() {
  const navigate = useNavigate()
  const { quotations, loading, fetchQuotations, updateStatus } = useQuotationsStore()
  const queue = quotations.filter((q) => q.status === 'factory')

  useEffect(() => {
    fetchQuotations()
  }, [])

  const handleMarkExported = async (id: string) => {
    await updateStatus(id, 'exported')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-mammut-white tracking-tight flex items-center gap-3">
            <Factory size={24} className="text-emerald-400" />
            Factory Queue
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Approved quotations ready for Cantor ERP upload</p>
        </div>
        <button onClick={fetchQuotations}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-zinc-300 text-sm transition-colors">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Batch Export Banner */}
      {queue.length > 0 && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-emerald-400 font-bold">{queue.length} order{queue.length !== 1 ? 's' : ''} ready for factory</p>
            <p className="text-emerald-400/60 text-sm mt-0.5">Cantor batch upload will be available in a future update.</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 rounded-xl text-sm font-bold hover:bg-emerald-600/60 transition-colors opacity-50 cursor-not-allowed" disabled>
            <Factory size={16} /> Upload to Cantor
          </button>
        </div>
      )}

      {/* Queue Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[1.5fr_2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 bg-zinc-950 border-b border-zinc-800">
          {['Quotation #', 'Customer', 'Approved', 'Items', 'Total', 'Actions'].map((h) => (
            <div key={h} className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{h}</div>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400" />
          </div>
        ) : queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <CheckSquare size={48} className="text-zinc-700" strokeWidth={1} />
            <p className="text-zinc-500 text-sm">No orders in the factory queue.</p>
            <p className="text-zinc-600 text-xs">Approve quotations to send them here.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {queue.map((q) => (
              <div key={q.id} className="grid grid-cols-[1.5fr_2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 hover:bg-zinc-800/20 transition-colors items-center">
                <button onClick={() => navigate(`/admin/quotations/${q.id}`)} className="text-mammut-gold font-bold text-sm hover:underline text-left">
                  {q.quotation_number}
                </button>
                <div>
                  <p className="text-mammut-white font-medium text-sm">{q.customer_name}</p>
                  <p className="text-zinc-500 text-xs mt-0.5">{q.company_name || q.customer_email}</p>
                </div>
                <div className="text-zinc-400 text-sm">
                  {q.approved_at ? new Date(q.approved_at).toLocaleDateString('en-GB') : '—'}
                </div>
                <div className="text-zinc-300 text-sm font-medium">
                  {Array.isArray(q.items) ? q.items.length : 0} unit{(Array.isArray(q.items) ? q.items.length : 0) !== 1 ? 's' : ''}
                </div>
                <div className="font-bold text-mammut-white text-sm">€{Number(q.total_price).toFixed(2)}</div>
                <div className="flex items-center gap-2">
                  <QuotationStatusBadge status={q.status} />
                  <button
                    onClick={() => handleMarkExported(q.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-emerald-600 text-zinc-400 hover:text-mammut-white border border-zinc-700 hover:border-emerald-500 rounded-lg text-xs font-bold transition-all"
                    title="Mark as exported to Cantor"
                  >
                    <CheckSquare size={13} /> Exported
                  </button>
                  <button
                    onClick={() => navigate(`/admin/quotations/${q.id}`)}
                    className="p-1.5 text-zinc-600 hover:text-mammut-gold transition-colors"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
