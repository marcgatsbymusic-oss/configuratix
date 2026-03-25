import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Search, Globe, Menu, X, ChevronDown, ChevronRight, ChevronUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'

// The mega menu structure matching drutex.es categories
const MEGA_MENU_CATEGORIES = [
  {
    id: 'windows',
    href: '/products/windows',
    columns: [
      {
        colKey: 'pvcWindows',
        items: [
          { label: 'IGLO EDGE', href: '/products/iglo-edge', isNew: true },
          { label: 'IGLO ENERGY', href: '/products/iglo-energy' },
          { label: 'IGLO ENERGY CLASSIC', href: '/products/iglo-energy-classic' },
          { label: 'IGLO ENERGY ALUCOVER', href: '/products/iglo-energy-alucover' },
          { label: 'IGLO 5', href: '/products/iglo-5' },
          { label: 'IGLO 5 CLASSIC', href: '/products/iglo-5-classic' },
          { label: 'IGLO LIGHT', href: '/products/iglo-light' },
          { label: 'IGLO EXT', href: '/products/iglo-ext' },
          { label: 'IGLO PREMIER', href: '/products/iglo-premier' },
          { label: 'IDEAL NEO AD', href: '/products/ideal-neo-ad' },
          { label: 'IDEAL NEO MD', href: '/products/ideal-neo-md' },
          { label: 'IDEAL NEO MD-FS', href: '/products/ideal-neo-md-fs' },
          { label: 'IDEAL NEO MD MONOBLOCK', href: '/products/ideal-neo-md-monoblock' },
          { label: 'IDEAL NEO MD RENOVATION', href: '/products/ideal-neo-md-renovation' },
          { label: 'IDEAL 7000 NL', href: '/products/ideal-7000-nl' },
        ]
      },
      {
        colKey: 'alumWindows',
        items: [
          { label: 'MB-86N SI', href: '/products/mb-86n-si' },
          { label: 'MB-79N SI', href: '/products/mb-79n-si' },
          { label: 'MB-70HI', href: '/products/mb-70hi' },
          { label: 'MB-70', href: '/products/mb-70' },
          { label: 'MB-45', href: '/products/mb-45' },
        ]
      },
      {
        colKey: 'woodWindows',
        items: [
          { label: 'SOFTLINE 68/78/88', href: '/products/softline' },
        ]
      },
      {
        colKey: 'woodAlumWindows',
        items: [
          { label: 'DUOLINE 68/78/88', href: '/products/duoline' },
        ]
      }
    ]
  },
  {
    id: 'doors',
    href: '/products/doors',
    columns: [
      {
        colKey: 'pvcDoors',
        items: [
          { label: 'IGLO EDGE DOORS', href: '/products/iglo-edge-doors' },
          { label: 'IGLO ENERGY DOORS', href: '/products/iglo-energy-doors' },
        ]
      },
      {
        colKey: 'alumDoors',
        items: [
          { label: 'MB-86N DOORS', href: '/products/mb-86n-doors' },
        ]
      }
    ]
  },
  { id: 'terrace', href: '/products/terrace', columns: [] },
  { id: 'shutters', href: '/products/shutters', columns: [] },
  { id: 'facade', href: '/products/facade', columns: [] },
  { id: 'mosquito', href: '/products/mosquito', columns: [] },
  { id: 'garage', href: '/products/garage', columns: [] },
  { id: 'conservatories', href: '/products/conservatories', columns: [] },
  { id: 'pergola', href: '/products/pergola', columns: [] },
  { id: 'smart', href: '/products/smart-home', columns: [] },
  { id: 'extras', href: '/products/extras', columns: [] },
  { id: 'promotional', href: '/products/promotional', columns: [] },
]

const NAV_ITEMS = [
  { i18nKey: 'whereToBuy', href: '/where-to-buy' },
  { i18nKey: 'aboutMammut', href: '/about' },
]

export function Header() {
  const { t, i18n } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [megaMenuOpen, setMegaMenuOpen] = useState(false)
  const [activeMegaCategory, setActiveMegaCategory] = useState(MEGA_MENU_CATEGORIES[0].id)
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const megaHoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const location = useLocation()

  // Close mega menu on navigation change
  useEffect(() => {
    setMegaMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleMouseEnterProducts = () => {
    if (megaHoverTimer.current) clearTimeout(megaHoverTimer.current)
    setMegaMenuOpen(true)
  }

  const handleMouseLeaveProducts = () => {
    megaHoverTimer.current = setTimeout(() => {
      setMegaMenuOpen(false)
    }, 150) // Small delay to prevent jitter when moving mouse downwards
  }

  const activeCategoryData = MEGA_MENU_CATEGORIES.find(c => c.id === activeMegaCategory)

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-black/95 backdrop-blur-sm shadow-lg shadow-black/50' : 'bg-black'
      }`}
    >
      {/* Top utility bar */}
      <div className="border-b border-[#2a2a2b]">
        <div className="max-w-7xl mx-auto px-6 flex justify-end gap-6 py-1.5">
          {[
            { key: 'partnerPortal', defaultText: 'Partner Portal' },
            { key: 'cooperation', defaultText: 'Cooperation' },
            { key: 'contact', defaultText: 'Contact' }
          ].map((item) => (
            <a
              key={item.key}
              href="#"
              className="text-[10px] uppercase tracking-widest text-[#888888] hover:text-[#dca95c] transition-colors duration-200"
            >
              {t(`header.topBar.${item.key}`)}
            </a>
          ))}
        </div>
      </div>

      {/* Main nav inline context */}
      <div className="relative">
        <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src="/assets/mammut-logo-icon.png" 
              alt="Mammut Icon" 
              className="w-10 h-10 object-contain"
            />
            <span className="text-white font-black text-lg tracking-[0.2em] uppercase group-hover:text-[#dca95c] transition-colors duration-200">
              MAMMUT
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-8 h-full">
            
            {/* The Products Mega Menu Trigger */}
            <div 
              className="h-full flex items-center"
              onMouseEnter={handleMouseEnterProducts}
              onMouseLeave={handleMouseLeaveProducts}
            >
              <button className={`flex items-center gap-1 text-sm uppercase tracking-widest transition-colors duration-200 nav-link ${megaMenuOpen ? 'text-[#dca95c]' : 'text-white/80'}`}>
                {t('header.nav.products')}
                <ChevronDown size={14} className={`transition-transform duration-200 ${megaMenuOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Standard Nav Items */}
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.i18nKey}
                to={item.href}
                className={({ isActive }) =>
                  `text-sm uppercase tracking-widest nav-link transition-colors duration-200 ${
                    isActive ? 'text-[#dca95c]' : 'text-white/80 hover:text-[#dca95c]'
                  }`
                }
              >
                {t(`header.nav.${item.i18nKey}`)}
              </NavLink>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            <Link
              to="/configurator"
              className="hidden lg:flex items-center gap-2 border border-[#dca95c] text-[#dca95c] text-xs uppercase tracking-widest px-4 py-2 hover:bg-[#dca95c] hover:text-black transition-all duration-200 font-semibold"
            >
              {t('header.nav.configurator')}
            </Link>
            <button className="text-white/60 hover:text-[#dca95c] transition-colors duration-200"><Search size={18} /></button>
            {/* Language Switcher */}
            <div className="relative">
              <button 
                className="text-white/60 hover:text-[#dca95c] transition-colors duration-200"
                onClick={() => setMenuOpen((prev) => !prev)}
              >
                <Globe size={18} />
              </button>
              {menuOpen && (
                 <div className="absolute right-0 top-10 w-32 bg-[#1a1a1b] border border-[#2a2a2b] shadow-xl py-2 z-50 rounded">
                   {[
                     { code: 'en', label: 'English' },
                     { code: 'es', label: 'Español' },
                     { code: 'de', label: 'Deutsch' },
                     { code: 'fr', label: 'Français' },
                     { code: 'ca', label: 'Català' },
                     { code: 'pt', label: 'Português' },
                     { code: 'eu', label: 'Euskara' }
                   ].map((lng) => (
                     <button
                       key={lng.code}
                       onClick={() => {
                         i18n.changeLanguage(lng.code);
                         setMenuOpen(false);
                       }}
                       className={`block w-full text-left px-4 py-2 text-xs uppercase tracking-widest transition-colors ${i18n.language === lng.code ? 'text-[#dca95c] bg-white/5' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                     >
                       {lng.label}
                     </button>
                   ))}
                 </div>
              )}
            </div>
            <button
              className="lg:hidden text-white/60 hover:text-[#dca95c] transition-colors duration-200"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>

        {/* --- FULL WIDTH MEGA MENU DROPDOWN --- */}
        <div 
          className={`absolute top-full left-0 w-full bg-[#111112] border-y border-[#2a2a2b] shadow-2xl transition-all duration-300 origin-top overflow-hidden
                     ${megaMenuOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'}`}
          onMouseEnter={handleMouseEnterProducts}
          onMouseLeave={handleMouseLeaveProducts}
        >
          <div className="max-w-[1400px] mx-auto flex h-[500px]">
            {/* Sidebar (Categories) */}
            <div className="w-[300px] bg-[#161617] border-r border-[#2a2a2b] py-4 overflow-y-auto">
              <Link 
                to="/products"
                className="flex items-center gap-3 px-8 text-white/40 hover:text-white uppercase tracking-widest text-[10px] font-bold mb-4"
              >
                {t('header.megaMenu.viewAll')} <ChevronRight size={12} />
              </Link>
              
              <ul className="flex flex-col">
                {MEGA_MENU_CATEGORIES.map(cat => (
                  <li key={cat.id}>
                    <button
                      onMouseEnter={() => setActiveMegaCategory(cat.id)}
                      className={`w-full text-left px-8 py-3 text-xs tracking-[0.2em] uppercase font-semibold transition-colors
                                ${activeMegaCategory === cat.id 
                                  ? 'bg-[#1a1a1b] text-[#dca95c] border-l-2 border-[#dca95c]' 
                                  : 'text-white/60 hover:bg-[#1a1a1b] hover:text-white border-l-2 border-transparent'}`}
                    >
                      {t(`header.megaMenu.cats.${cat.id}`)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Pane (Items) */}
            <div className="flex-1 bg-[#1a1a1b] p-10 overflow-y-auto">
              {activeCategoryData && activeCategoryData.columns.length > 0 ? (
                <div className="grid grid-cols-4 gap-8">
                  {activeCategoryData.columns.map((col, idx) => (
                    <div key={idx}>
                      <h4 className="text-white text-[11px] font-bold uppercase tracking-widest border-b border-[#2a2a2b] pb-2 mb-4">
                        {t(`header.megaMenu.cols.${col.colKey}`)}
                      </h4>
                      <ul className="space-y-3">
                        {col.items.map(item => (
                          <li key={item.label}>
                            <Link 
                              to={item.href}
                              className="group flex flex-col"
                            >
                              <span className="text-sm font-semibold text-white/70 group-hover:text-[#dca95c] transition-colors flex items-center gap-2">
                                {item.label}
                                {item.isNew && (
                                  <span className="bg-[#dca95c] text-black text-[9px] uppercase tracking-widest px-1.5 py-0.5 font-bold">
                                    {t('header.megaMenu.new')}
                                  </span>
                                )}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-white/30 text-sm italic">
                  <p>{t('header.megaMenu.comingSoon', { category: t(`header.megaMenu.cats.${activeCategoryData?.id}`) })}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-[#1a1a1b] border-t border-[#2a2a2b] py-6 px-6 space-y-1 max-h-[80vh] overflow-y-auto">
          {/* Products accordion */}
          <div>
            <button
              className="w-full flex items-center justify-between py-3 text-sm uppercase tracking-widest text-[#dca95c] font-bold"
              onClick={() => setMobileProductsOpen(!mobileProductsOpen)}
            >
              {t('header.nav.products')}
              {mobileProductsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {mobileProductsOpen && (
              <div className="ml-2 mb-2 space-y-3 border-l border-[#2a2a2b] pl-4">
                <Link
                  to="/products"
                  className="block text-xs uppercase tracking-widest text-white/40 hover:text-[#dca95c] py-1 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  {t('header.megaMenu.viewAll')} â†’
                </Link>
                {MEGA_MENU_CATEGORIES.map((cat) => (
                  <div key={cat.id}>
                    <Link
                      to={cat.href}
                      className="block text-xs uppercase tracking-widest text-white/70 hover:text-[#dca95c] font-semibold py-1 transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      {t(`header.megaMenu.cats.${cat.id}`)}
                    </Link>
                    {cat.columns.length > 0 && (
                      <div className="ml-3 mt-1 space-y-1">
                        {cat.columns.flatMap((col) =>
                          col.items.map((item) => (
                            <Link
                              key={item.href}
                              to={item.href}
                              className="flex items-center gap-2 text-[11px] text-white/40 hover:text-[#dca95c] py-0.5 transition-colors"
                              onClick={() => setMenuOpen(false)}
                            >
                              {item.label}
                              {item.isNew && (
                                <span className="bg-[#dca95c] text-black text-[8px] uppercase tracking-widest px-1 font-bold">{t('header.megaMenu.new')}</span>
                              )}
                            </Link>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Standard nav links */}
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.i18nKey}
              to={item.href}
              className="block py-3 text-sm uppercase tracking-widest text-white/70 hover:text-[#dca95c] transition-colors duration-200"
              onClick={() => setMenuOpen(false)}
            >
              {t(`header.nav.${item.i18nKey}`)}
            </Link>
          ))}

          <div className="pt-2">
            <Link
              to="/configurator"
              className="block border border-[#dca95c] text-[#dca95c] text-xs uppercase tracking-widest px-4 py-3 text-center hover:bg-[#dca95c] hover:text-black transition-all duration-200 font-semibold"
              onClick={() => setMenuOpen(false)}
            >
              {t('header.nav.configurator')}
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
