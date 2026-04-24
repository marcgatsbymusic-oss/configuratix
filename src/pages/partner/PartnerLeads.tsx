import { Search, Filter, Download, MoreVertical } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const mockLeads = [
  { id: 'WIN-2025-0891', date: '2025-04-24', status: 'In Progress', budget: '€4,500', tier: 'Tier 1 (Poster)' },
  { id: 'WIN-2025-0890', date: '2025-04-23', status: 'Completed', budget: '€12,000', tier: 'Tier 2 (In-Store)' },
  { id: 'WIN-2025-0885', date: '2025-04-20', status: 'Initiated', budget: 'Pending', tier: 'Tier 3 (Staff)' },
  { id: 'WIN-2025-0872', date: '2025-04-18', status: 'Completed', budget: '€3,200', tier: 'Tier 1 (Poster)' },
]

export function PartnerLeads() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">{t('partner.leads.title')}</h2>
          <p className="text-gray-400 mt-1">{t('partner.leads.subtitle')}</p>
        </div>
        <button className="bg-[#111] border border-gray-800 hover:bg-gray-800 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
          <Download className="w-5 h-5" />
          {t('partner.leads.exportCsv')}
        </button>
      </div>

      <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-[#151515]">
          <div className="relative w-64">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder={t('partner.leads.searchId')}
              className="w-full bg-black border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#eab676] transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
            <Filter className="w-4 h-4" />
            {t('partner.leads.filterStatus')}
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-xs uppercase tracking-wider text-gray-500 bg-[#0a0a0a]">
                <th className="px-6 py-4 font-semibold">{t('partner.leads.cols.id')}</th>
                <th className="px-6 py-4 font-semibold">{t('partner.leads.cols.date')}</th>
                <th className="px-6 py-4 font-semibold">{t('partner.leads.cols.source')}</th>
                <th className="px-6 py-4 font-semibold">{t('partner.leads.cols.status')}</th>
                <th className="px-6 py-4 font-semibold">{t('partner.leads.cols.budget')}</th>
                <th className="px-6 py-4 font-semibold text-right">{t('partner.leads.cols.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {mockLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-gray-300">{lead.id}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">{lead.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{lead.tier}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      lead.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      lead.status === 'In Progress' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                      'bg-gray-800 text-gray-400 border-gray-700'
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-white">{lead.budget}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-500 hover:text-white p-1 rounded transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
