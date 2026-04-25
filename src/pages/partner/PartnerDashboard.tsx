import { BarChart3, QrCode, TrendingUp, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function PartnerDashboard() {
  const { t } = useTranslation()

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">{t('partner.dashboard.title')}</h2>
          <p className="text-gray-400 mt-1">{t('partner.dashboard.subtitle')}</p>
        </div>
        <a href="/landing/5689" target="_blank" rel="noopener noreferrer" className="bg-[#eab676] hover:bg-[#d9a05b] text-black px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
          <QrCode className="w-5 h-5" />
          {t('partner.dashboard.showQr')}
        </a>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">{t('partner.dashboard.totalScans')}</p>
              <h3 className="text-3xl font-bold text-white mt-1">124</h3>
            </div>
            <a href="/landing/5689" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg flex items-center justify-center transition-colors cursor-pointer">
              <QrCode className="w-6 h-6 text-blue-400" />
            </a>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-emerald-400 flex items-center gap-1 font-medium">
              <TrendingUp className="w-4 h-4" />
              +12%
            </span>
            <span className="text-gray-500 ml-2">{t('partner.dashboard.fromLastMonth')}</span>
          </div>
        </div>

        <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">{t('partner.dashboard.activeLeads')}</p>
              <h3 className="text-3xl font-bold text-white mt-1">18</h3>
            </div>
            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-emerald-400 flex items-center gap-1 font-medium">
              <TrendingUp className="w-4 h-4" />
              +4
            </span>
            <span className="text-gray-500 ml-2">{t('partner.dashboard.newThisWeek')}</span>
          </div>
        </div>

        <div className="bg-[#111] border border-[#eab676]/20 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#eab676]/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-medium text-[#eab676]">{t('partner.dashboard.estCommissions')}</p>
              <h3 className="text-3xl font-bold text-white mt-1">€4,250</h3>
            </div>
            <div className="w-12 h-12 bg-[#eab676]/10 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-[#eab676]" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm relative z-10">
            <span className="text-gray-400 font-medium">
              3 {t('partner.dashboard.leadsPending')}
            </span>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6">{t('partner.dashboard.recentActivity')}</h3>
        <div className="space-y-6">
          {[
            { id: 1, action: "New scan from Poster (Tier 1)", time: "2 hours ago", color: "text-blue-400", bg: "bg-blue-500/10" },
            { id: 2, action: "Lead WIN-2025-0891 moved to 'In Progress'", time: "5 hours ago", color: "text-purple-400", bg: "bg-purple-500/10" },
            { id: 3, action: "Commission payout of €1,200 completed", time: "Yesterday", color: "text-emerald-400", bg: "bg-emerald-500/10" },
            { id: 4, action: "New scan from In-Store QR (Tier 2)", time: "Yesterday", color: "text-blue-400", bg: "bg-blue-500/10" },
          ].map((item) => (
            <div key={item.id} className="flex items-start gap-4">
              <div className={`w-2 h-2 mt-2 rounded-full ${item.bg} border ${item.color.replace('text-', 'border-')}`}></div>
              <div>
                <p className="text-gray-300 font-medium">{item.action}</p>
                <p className="text-sm text-gray-500 mt-1">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
