import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { ShoppingCart, Search, Globe, Menu, X, ChevronDown, ChevronRight, ChevronUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCartStore } from '../../store/useCartStore'
import { ThemeToggle } from '../common/ThemeToggle'
import { 
  IconWindows, IconDoors, IconPatioDoors, IconRollerShutters, 
  IconExteriorBlinds, IconMosquitoNets, IconGarageDoors, 
  IconConservatories, IconPergola, IconSmartHome 
} from '../icons/ProductIcons'

const iconMap: Record<string, React.FC<any>> = {
  windows: IconWindows,
  doors: IconDoors,
  terrace: IconPatioDoors,
  shutters: IconRollerShutters,
  facade: IconExteriorBlinds,
  mosquito: IconMosquitoNets,
  garage: IconGarageDoors,
  conservatories: IconConservatories,
  pergola: IconPergola,
  smart: IconSmartHome
};

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
          { label: 'IGLO ENERGY DOORS', href: '/products/iglo-energy-doors' },
          { label: 'IGLO', href: '/products/iglo5-doors' },
          { label: 'IGLO EDGE DOORS', href: '/products/iglo-edge-doors', isNew: true },
        ]
      },
      {
        colKey: 'alumDoors',
        items: [
          { label: 'D-ART LINE', href: '/products/d-art-line-doors-alu', isNew: true },
          { label: 'MB-86N SI DOORS', href: '/products/mb-86si-doors-alu', isNew: true },
          { label: 'DOOR VISUALIZER', href: '/doorsim', isNew: true }
        ]
      }
    ]
  },
  { 
    id: 'terrace', 
    href: '/products/terrace', 
    columns: [
      {
        colKey: 'liftAndSlide',
        items: [
          { label: 'IGLO-HS', href: '/products/iglo-hs' },
          { label: 'IGLO-HS ALUCOVER', href: '/products/iglo-hs-alucover' },
          { label: 'MB-77HS HI', href: '/products/mb-77hs' },
          { label: 'MB-77HS HI MONORAIL', href: '/products/mb-77hs-monorail' },
          { label: 'MB-59HS HI', href: '/products/mb-59hs' },
          { label: 'SOFTLINE HS', href: '/products/softline-hs' },
          { label: 'DUOLINE HS', href: '/products/duoline-hs' }
        ]
      },
      {
        colKey: 'slide',
        items: [
          { label: 'IGLO EDGE SLIDE', href: '/products/iglo-edge-slide', isNew: true },
          { label: 'IGLO SLIDE', href: '/products/iglo-slide' },
          { label: 'MB-SLIDE', href: '/products/mb-slide' },
          { label: 'COR VISION', href: '/products/cor-vision', isNew: true },
          { label: 'COR VISION PLUS', href: '/products/cor-vision-plus', isNew: true }
        ]
      },
      {
        colKey: 'foldingDoors',
        items: [
          { label: 'MB-86 FOLD LINE HD', href: '/products/mb-86-fold-line' },
          { label: 'SOFTLINE 68', href: '/products/softline-68-folding' }
        ]
      },
      {
        colKey: 'tiltAndSlide',
        items: [
          { label: 'IGLO ENERGY PSK', href: '/products/iglo-energy-psk' },
          { label: 'IGLO ENERGY CLASSIC PSK', href: '/products/iglo-energy-classic-psk' },
          { label: 'IGLO 5 PSK', href: '/products/iglo5-psk' },
          { label: 'IGLO 5 CLASSIC PSK', href: '/products/iglo5-classic-psk' },
          { label: 'IGLO LIGHT PSK', href: '/products/iglo-light-psk' },
          { label: 'MB-70 / MB-70HI PSK', href: '/products/mb-70-psk' },
          { label: 'SOFTLINE PSK', href: '/products/softline-psk' },
          { label: 'DUOLINE PSK', href: '/products/duoline-psk' }
        ]
      }
    ] 
  },
  { 
    id: 'shutters', 
    href: '/products/shutters', 
    columns: [
      {
        colKey: 'adaptive',
        items: [
          { label: 'ALUMINIUM SHUTTERS', href: '/products/aluminium-shutters', isNew: true },
          { label: 'ALUMINIUM SHUTTERS RDZ', href: '/products/aluminium-shutters-rdz' }
        ]
      },
      {
        colKey: 'topMounted',
        items: [
          { label: 'PVC SHUTTERS', href: '/products/pvc-shutters' },
          { label: 'ROLLER SHUTTERS WITH STYROFOAM BOX', href: '/products/roller-shutters-with-styrofoam-box' }
        ]
      }
    ] 
  },
  { 
    id: 'facade', 
    href: '/products/external-venetian-blinds', 
    columns: [
      {
        colKey: 'facade',
        items: [
          { label: 'EXTERNAL VENETIAN BLINDS', href: '/products/external-venetian-blinds', isNew: true }
        ]
      }
    ] 
  },
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
]

export function Header() {
  const { t, i18n } = useTranslation()
  const { items, toggleCart } = useCartStore()
  const totalCartItems = items.reduce((sum, i) => sum + i.quantity, 0)
  
  const [menuOpen, setMenuOpen] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const [megaMenuOpen, setMegaMenuOpen] = useState(false)
  const [activeMegaCategory, setActiveMegaCategory] = useState(MEGA_MENU_CATEGORIES[0].id)
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const megaHoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const location = useLocation()
  const navigate = useNavigate()

  const handleLinkClick = () => {
    setMegaMenuOpen(false)
    setMenuOpen(false)
    window.scrollTo(0, 0)
  }

  // Close mega menu on navigation change
  useEffect(() => {
    setMegaMenuOpen(false)
    setMenuOpen(false)
    window.scrollTo(0, 0)
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
        scrolled ? 'bg-mammut-black/95 backdrop-blur-sm shadow-lg shadow-black/50' : 'bg-mammut-black'
      }`}
    >
      {/* Top utility bar */}
      <div className="border-b border-mammut-border">
        <div className="max-w-7xl mx-auto px-6 flex justify-end gap-6 py-1.5">
          <Link
            to="/debug-pricing"
            className="text-[10px] uppercase tracking-widest text-mammut-grey-light hover:text-mammut-gold transition-colors duration-200 font-bold"
          >
            Debug
          </Link>
          <Link
            to="/admin"
            className="text-[10px] uppercase tracking-widest text-mammut-grey-light hover:text-mammut-gold transition-colors duration-200 font-bold"
          >
            Admin
          </Link>
          {[
            { key: 'partnerPortal', defaultText: 'Partner Portal', href: '/partner' },
            { key: 'cooperation', defaultText: 'Cooperation', href: '#' },
            { key: 'contact', defaultText: 'Contact', href: '#' }
          ].map((item) => (
            <Link
              key={item.key}
              to={item.href}
              className="text-[10px] uppercase tracking-widest text-mammut-grey-light hover:text-mammut-gold transition-colors duration-200"
            >
              {t(`header.topBar.${item.key}`)}
            </Link>
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
            <span className="text-mammut-white font-black text-lg tracking-[0.2em] uppercase group-hover:text-mammut-gold transition-colors duration-200">
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
              <button className={`flex items-center gap-1 text-sm uppercase tracking-widest transition-colors duration-200 nav-link ${megaMenuOpen ? 'text-mammut-gold' : 'text-mammut-white/80'}`}>
                {t('header.nav.products')}
                <ChevronDown size={14} className={`transition-transform duration-200 ${megaMenuOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Standard Nav Items */}
            <NavLink
                to="/shop"
                className={({ isActive }) =>
                  `text-sm font-black uppercase tracking-widest nav-link transition-colors duration-200 ${
                    isActive ? 'text-mammut-gold' : 'text-yellow-400 hover:text-yellow-500'
                  }`
                }
            >
                SHOP OUTLET
            </NavLink>
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.i18nKey}
                to={item.href}
                className={({ isActive }) =>
                  `text-sm uppercase tracking-widest nav-link transition-colors duration-200 ${
                    isActive ? 'text-mammut-gold' : 'text-mammut-white/80 hover:text-mammut-gold'
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
              className="hidden lg:flex items-center gap-2 border border-mammut-gold text-mammut-gold text-xs uppercase tracking-widest px-4 py-2 hover:bg-mammut-gold hover:text-black transition-all duration-200 font-semibold"
            >
              {t('header.nav.configurator')}
            </Link>
            
             {/* Global Shopping Cart */}
             <button 
                onClick={toggleCart} 
                className={`text-mammut-white/60 hover:text-mammut-gold transition-colors duration-200 p-2 relative ${
                  totalCartItems === 0 ? 'hidden lg:block' : 'block'
                }`}
             >
                <ShoppingCart size={18} />
                {totalCartItems > 0 && (
                   <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-mammut-gold text-black text-[9px] font-black h-4 w-4 flex flex-col items-center justify-center rounded-full shadow-md">
                      {totalCartItems}
                   </span>
                )}
             </button>

             <button className="hidden lg:block text-mammut-white/60 hover:text-mammut-gold transition-colors duration-200 p-2"><Search size={18} /></button>
            {location.pathname !== '/debug-pricing' && <ThemeToggle />}
            {/* Language Switcher */}
            <div className="relative">
              <button 
                className="text-mammut-white/60 hover:text-mammut-gold transition-colors duration-200 p-2"
                onClick={() => {
                  setLangMenuOpen((prev) => !prev);
                  setMenuOpen(false);
                }}
                onBlur={() => setTimeout(() => setLangMenuOpen(false), 200)}
              >
                <Globe size={18} />
              </button>
              {langMenuOpen && (
                 <div className="absolute right-0 top-10 w-32 bg-mammut-dark border border-mammut-border shadow-xl py-2 z-50 rounded">
                   {[
                     { code: 'en', label: 'English' },
                     { code: 'es', label: 'Español' },
                     { code: 'de', label: 'Deutsch' },
                     { code: 'fr', label: 'Français' },
                     { code: 'ca', label: 'Català' },
                     { code: 'pt', label: 'Português' },
                     { code: 'eu', label: 'Euskara' },
                     { code: 'it', label: 'Italiano' },
                     { code: 'ro', label: 'Română' },
                     { code: 'ru', label: 'Русский' },
                     { code: 'uk', label: 'Українська' },
                     { code: 'ar', label: 'العربية' },
                     { code: 'pl', label: 'Polski' },
                     { code: 'nl', label: 'Nederlands' },
                     { code: 'sv', label: 'Svenska' },
                     { code: 'no', label: 'Norsk' },
                     { code: 'fi', label: 'Suomi' }
                   ].map((lng) => (
                     <button
                       key={lng.code}
                       onClick={(e) => {
                         e.preventDefault();
                         e.stopPropagation();
                         i18n.changeLanguage(lng.code);
                         setLangMenuOpen(false);
                       }}
                       className={`block w-full text-left px-4 py-2 text-xs uppercase tracking-widest transition-colors ${i18n.language === lng.code ? 'text-mammut-gold bg-white/5' : 'text-mammut-white/60 hover:bg-white/5 hover:text-mammut-white'}`}
                     >
                       {lng.label}
                     </button>
                   ))}
                 </div>
              )}
            </div>
             <div className="flex flex-col items-center gap-1 lg:hidden -mr-2">
               <button
                 className="text-mammut-white/60 hover:text-mammut-gold transition-colors duration-200 p-1"
                 onClick={() => {
                   setMenuOpen(!menuOpen);
                   setLangMenuOpen(false);
                 }}
               >
                 {menuOpen ? <X size={20} /> : <Menu size={20} />}
               </button>
               {menuOpen && (
                 <button className="text-mammut-white/60 hover:text-mammut-gold transition-colors duration-200 p-1">
                   <Search size={16} />
                 </button>
               )}
             </div>
          </div>
        </nav>

        {/* --- FULL WIDTH MEGA MENU DROPDOWN --- */}
        <div 
          className={`absolute top-full left-0 w-full bg-mammut-darker border-y border-mammut-border shadow-2xl transition-all duration-300 origin-top overflow-hidden
                     ${megaMenuOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'}`}
          onMouseEnter={handleMouseEnterProducts}
          onMouseLeave={handleMouseLeaveProducts}
        >
          <div className="max-w-[1400px] mx-auto flex h-[500px]">
            {/* Sidebar (Categories) */}
            <div className="w-[300px] bg-mammut-darker border-r border-mammut-border py-4 overflow-y-auto">
              <Link 
                to="/products"
                className="flex items-center gap-3 px-8 text-mammut-white/40 hover:text-mammut-white uppercase tracking-widest text-[10px] font-bold mb-4"
                onClick={handleLinkClick}
              >
                {t('header.megaMenu.viewAll')} <ChevronRight size={12} />
              </Link>
              
              <ul className="flex flex-col">
                {MEGA_MENU_CATEGORIES.map(cat => {
                  const Icon = iconMap[cat.id];
                  return (
                  <li key={cat.id}>
                    <button
                      onMouseEnter={() => setActiveMegaCategory(cat.id)}
                      onClick={() => {
                        if (cat.columns.length === 0) {
                          navigate(cat.href);
                          handleLinkClick();
                        }
                      }}
                      className={`group w-full flex items-center gap-3 px-8 py-3 text-xs tracking-[0.2em] uppercase font-semibold transition-colors
                                ${activeMegaCategory === cat.id 
                                  ? 'bg-mammut-dark text-mammut-gold border-l-2 border-mammut-gold' 
                                  : 'text-mammut-white/60 hover:bg-mammut-dark hover:text-mammut-white border-l-2 border-transparent'}`}
                    >
                      {Icon && <Icon size={20} className={`transition-colors shrink-0 ${activeMegaCategory === cat.id ? 'text-mammut-gold' : 'text-mammut-white/40 group-hover:text-mammut-white'}`} />}
                      <span className="text-left">{t(`header.megaMenu.cats.${cat.id}`)}</span>
                    </button>
                  </li>
                )})}
              </ul>
            </div>

            {/* Right Pane (Items) */}
            <div className="flex-1 bg-mammut-dark p-10 overflow-y-auto">
              {activeCategoryData && activeCategoryData.columns.length > 0 ? (
                <div className="grid grid-cols-4 gap-8">
                  {activeCategoryData.columns.map((col, idx) => (
                    <div key={idx}>
                      <h4 className="text-mammut-white text-[11px] font-bold uppercase tracking-widest border-b border-mammut-border pb-2 mb-4">
                        {t(`header.megaMenu.cols.${col.colKey}`)}
                      </h4>
                      <ul className="space-y-3">
                        {col.items.map(item => (
                          <li key={item.label}>
                            <Link 
                              to={item.href}
                              className="group flex flex-col"
                              onClick={handleLinkClick}
                            >
                              <span className="text-sm font-semibold text-mammut-white/70 group-hover:text-mammut-gold transition-colors flex items-center gap-2">
                                {item.label}
                                {item.isNew && (
                                  <span className="bg-mammut-gold text-black text-[9px] uppercase tracking-widest px-1.5 py-0.5 font-bold">
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
                <div className="h-full flex flex-col items-center justify-center text-mammut-white/30 text-sm italic">
                  <p>{t('header.megaMenu.comingSoon', { category: t(`header.megaMenu.cats.${activeCategoryData?.id}`) })}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-mammut-dark border-t border-mammut-border py-6 px-6 space-y-1 max-h-[80vh] overflow-y-auto">
          {/* Products accordion */}
          <div>
            <button
              className="w-full flex items-center justify-between py-3 text-sm uppercase tracking-widest text-mammut-gold font-bold"
              onClick={() => setMobileProductsOpen(!mobileProductsOpen)}
            >
              {t('header.nav.products')}
              {mobileProductsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {mobileProductsOpen && (
              <div className="ml-2 mb-2 space-y-3 border-l border-mammut-border pl-4">
                <Link
                  to="/products"
                  className="block text-xs uppercase tracking-widest text-mammut-white/40 hover:text-mammut-gold py-1 transition-colors"
                  onClick={handleLinkClick}
                >
                  {t('header.megaMenu.viewAll')} â†’
                </Link>
                {MEGA_MENU_CATEGORIES.map((cat) => {
                  const Icon = iconMap[cat.id];
                  return (
                  <div key={cat.id}>
                    <Link
                      to={cat.href}
                      className="group flex items-center gap-3 text-xs uppercase tracking-widest text-mammut-white/70 hover:text-mammut-gold font-semibold py-2 transition-colors"
                      onClick={handleLinkClick}
                    >
                      {Icon && <Icon size={16} className="shrink-0 text-mammut-white/40 group-hover:text-mammut-gold transition-colors" />}
                      <span>{t(`header.megaMenu.cats.${cat.id}`)}</span>
                    </Link>
                    {cat.columns.length > 0 && (
                      <div className="ml-3 mt-1 space-y-1">
                        {cat.columns.flatMap((col) =>
                          col.items.map((item) => (
                            <Link
                              key={item.href}
                              to={item.href}
                              className="flex items-center gap-2 text-[11px] text-mammut-white/40 hover:text-mammut-gold py-0.5 transition-colors"
                              onClick={handleLinkClick}
                            >
                              {item.label}
                              {item.isNew && (
                                <span className="bg-mammut-gold text-black text-[8px] uppercase tracking-widest px-1 font-bold">{t('header.megaMenu.new')}</span>
                              )}
                            </Link>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )})}
              </div>
            )}
          </div>

          {/* Standard nav links */}
          <Link
             to="/shop"
             className="block py-3 text-sm font-black uppercase tracking-widest text-yellow-400 hover:text-yellow-500 transition-colors duration-200"
             onClick={handleLinkClick}
          >
             SHOP OUTLET
          </Link>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.i18nKey}
              to={item.href}
              className="block py-3 text-sm uppercase tracking-widest text-mammut-white/70 hover:text-mammut-gold transition-colors duration-200"
              onClick={handleLinkClick}
            >
              {t(`header.nav.${item.i18nKey}`)}
            </Link>
          ))}

          <div className="pt-2">
            <Link
              to="/configurator"
              className="block border border-mammut-gold text-mammut-gold text-xs uppercase tracking-widest px-4 py-3 text-center hover:bg-mammut-gold hover:text-black transition-all duration-200 font-semibold"
              onClick={handleLinkClick}
            >
              {t('header.nav.configurator')}
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
