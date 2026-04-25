import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, User, LogOut, Settings, Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function PartnerLayout() {
  const location = useLocation()
  const { t, i18n } = useTranslation()
  const [langMenuOpen, setLangMenuOpen] = useState(false)

  const navigation = [
    { name: t('partner.layout.dashboard'), href: '/partner', icon: LayoutDashboard },
    { name: t('partner.layout.leads'), href: '/partner/leads', icon: Users },
    { name: t('partner.layout.profile'), href: '/partner/profile', icon: User },
    { name: t('partner.layout.settings'), href: '/partner/settings', icon: Settings },
  ]

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'de', label: 'Deutsch' },
    { code: 'fr', label: 'Français' },
    { code: 'ca', label: 'Català' },
    { code: 'pt', label: 'Português' },
    { code: 'eu', label: 'Euskara' }
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col md:flex-row text-white font-['Inter',sans-serif] pb-16 md:pb-0">
      {/* Sidebar (Desktop only) */}
      <div className="hidden md:flex w-64 bg-[#111111] border-r border-gray-800 flex-col fixed h-full z-20">
        <div className="h-16 flex items-center px-6 border-b border-gray-800 shrink-0">
          <Link to="/" className="text-xl font-bold tracking-widest text-[#eab676]">
            MAMMUT<span className="text-white text-sm font-normal ml-2">Partner</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
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

        <div className="p-4 border-t border-gray-800 shrink-0">
          <button className="flex items-center gap-3 px-3 py-2 w-full text-left text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">{t('partner.layout.signOut')}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-64 relative">
        <header className="h-16 bg-[#111111] border-b border-gray-800 flex items-center px-4 md:px-8 justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="md:hidden w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-white p-1">
              <img src="/partners/cadena88-logo-grande.png" alt="Ferreteria 88" className="w-full h-auto object-contain" />
            </div>
            <h1 className="text-lg font-semibold hidden sm:block">{t('partner.layout.portal')}</h1>
            <h1 className="text-base font-semibold sm:hidden text-gray-200">Ferretería 88</h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            {/* Language Switcher */}
            <div className="relative">
              <button 
                className="text-gray-400 hover:text-[#eab676] transition-colors p-2 rounded-lg"
                onClick={() => setLangMenuOpen((prev) => !prev)}
                onBlur={() => setTimeout(() => setLangMenuOpen(false), 200)}
              >
                <Globe size={18} />
              </button>
              {langMenuOpen && (
                 <div className="absolute right-0 top-10 w-32 bg-[#1a1a1b] border border-[#2a2a2b] shadow-xl py-2 z-50 rounded">
                   {languages.map((lng) => (
                     <button
                       key={lng.code}
                       onClick={(e) => {
                         e.preventDefault();
                         e.stopPropagation();
                         i18n.changeLanguage(lng.code);
                         setLangMenuOpen(false);
                       }}
                       className={`block w-full text-left px-4 py-2 text-xs uppercase tracking-widest transition-colors ${i18n.language === lng.code ? 'text-[#eab676] bg-white/5' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                     >
                       {lng.label}
                     </button>
                   ))}
                 </div>
              )}
            </div>

            <div className="hidden md:flex items-center gap-2 border-l border-gray-800 pl-4 ml-2">
              <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-white p-1">
                <img src="/partners/cadena88-logo-grande.png" alt="Ferreteria 88" className="w-full h-auto object-contain" />
              </div>
              <span className="text-sm text-gray-300">Ferreteria 88</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 bg-[#0a0a0a]">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Bottom Navigation (Mobile only) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#111111] border-t border-gray-800 z-40 flex items-center justify-around px-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? 'text-[#eab676]' : 'text-gray-500'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium truncate w-full text-center px-1">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
