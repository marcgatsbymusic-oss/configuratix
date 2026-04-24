import { Link, Outlet, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, User, LogOut, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function PartnerLayout() {
  const location = useLocation()
  const { t } = useTranslation()

  const navigation = [
    { name: t('partner.layout.dashboard'), href: '/partner', icon: LayoutDashboard },
    { name: t('partner.layout.leads'), href: '/partner/leads', icon: Users },
    { name: t('partner.layout.profile'), href: '/partner/profile', icon: User },
    { name: t('partner.layout.settings'), href: '/partner/settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex text-white font-['Inter',sans-serif]">
      {/* Sidebar */}
      <div className="w-64 bg-[#111111] border-r border-gray-800 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <Link to="/" className="text-xl font-bold tracking-widest text-[#eab676]">
            MAMMUT<span className="text-white text-sm font-normal ml-2">Partner</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-[#eab676]/10 text-[#eab676]' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-[#eab676]' : 'text-gray-500'}`} />
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button className="flex items-center gap-3 px-3 py-2 w-full text-left text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">{t('partner.layout.signOut')}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-[#111111] border-b border-gray-800 flex items-center px-8 justify-between sticky top-0 z-10">
          <h1 className="text-lg font-semibold">{t('partner.layout.portal')}</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-sm font-bold text-[#eab676]">
                JD
              </div>
              <span className="text-sm text-gray-300">John Doe Hardware</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 bg-[#0a0a0a]">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
