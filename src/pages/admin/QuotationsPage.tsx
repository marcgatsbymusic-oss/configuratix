import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuotationsStore } from '../../store/useQuotationsStore'
import { QuotationStatusBadge } from '../../components/admin/QuotationStatusBadge'
import { Search, RefreshCw, ChevronRight, FileText } from 'lucide-react'
import type { QuotationStatus } from '../../store/useQuotationsStore'

const TABS: { label: string; value: QuotationStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Factory', value: 'factory' },
  { label: 'Exported', value: 'exported' },
]

export function QuotationsPage() {
  const navigate = useNavigate()
  const { quotations, loading, fetchQuotations } = useQuotationsStore()
  const [activeTab, setActiveTab] = useState<QuotationStatus | 'all'>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchQuotations()
  }, [])

  const filtered = quotations.filter((q) => {
    const matchesTab = activeTab === 'all' || q.status === activeTab
    const s = search.toLowerCase()
    const matchesSearch = !s ||
      q.quotation_number?.toLowerCase().includes(s) ||
      q.customer_name?.toLowerCase().includes(s) ||
      q.customer_email?.toLowerCase().includes(s) ||
      q.company_name?.toLowerCase().includes(s)
    return matchesTab && matchesSearch
  })

  const tabCounts = TABS.reduce((acc, tab) => {
    acc[tab.value] = tab.value === 'all'
      ? quotations.length
      : quotations.filter((q) => q.status === tab.value).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-mammut-white tracking-tight">Quotations</h1>
          <p className="text-zinc-400 text-sm mt-1">Manage web-generated window quotation requests</p>
        </div>
        <button
          onClick={fetchQuotations}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-zinc-300 text-sm transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1.5 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.value
                ? 'bg-mammut-gold text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-mammut-white hover:bg-zinc-800'
            }`}
          >
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
              activeTab === tab.value ? 'bg-mammut-black/20 text-zinc-900' : 'bg-zinc-800 text-zinc-500'
            }`}>
              {tabCounts[tab.value] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          placeholder="Search by quotation #, customer name, email or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-mammut-white text-sm placeholder-zinc-600 focus:outline-none focus:border-mammut-gold/50 transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[1.5fr_2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 border-b border-zinc-800 bg-zinc-950">
          {['Quotation #', 'Customer', 'Date', 'Items', 'Total', ''].map((h) => (
            <div key={h} className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{h}</div>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mammut-gold" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <FileText size={48} className="text-zinc-700" strokeWidth={1} />
            <p className="text-zinc-500 text-sm">
              {search ? 'No quotations match your search' : 'No quotations yet'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {filtered.map((q) => (
              <button
                key={q.id}
                onClick={() => navigate(`/admin/quotations/${q.id}`)}
                className="grid grid-cols-[1.5fr_2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 w-full text-left hover:bg-zinc-800/40 transition-colors group"
              >
                <div>
                  <span className="text-mammut-gold font-bold text-sm">{q.quotation_number}</span>
                </div>
                <div>
                  <p className="text-mammut-white font-medium text-sm">{q.customer_name}</p>
                  <p className="text-zinc-500 text-xs mt-0.5">{q.company_name || q.customer_email}</p>
                </div>
                <div className="text-zinc-400 text-sm self-center">
                  {new Date(q.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
                <div className="text-zinc-300 text-sm self-center font-medium">
                  {Array.isArray(q.items) ? q.items.length : 0} unit{(Array.isArray(q.items) ? q.items.length : 0) !== 1 ? 's' : ''}
                </div>
                <div className="text-mammut-white font-bold text-sm self-center">
                  €{Number(q.total_price).toFixed(2)}
                </div>
                <div className="flex items-center gap-3 self-center">
                  <QuotationStatusBadge status={q.status} />
                  <ChevronRight size={16} className="text-zinc-600 group-hover:text-mammut-gold transition-colors" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {filtered.length > 0 && (
        <p className="text-zinc-600 text-xs text-right">
          Showing {filtered.length} of {quotations.length} quotations
        </p>
      )}
    </div>
  )
}
