import { Link } from 'react-router-dom'
import { Youtube, Instagram, Linkedin, Facebook, ArrowRight } from 'lucide-react'

import { useTranslation } from 'react-i18next'

const FOOTER_COLS = [
  {
    colKey: 'about',
    links: [
      { keyKey: 'history', href: '/about/history' },
      { keyKey: 'quality', href: '/about/quality' },
      { keyKey: 'innovation', href: '/about/innovation' },
      { keyKey: 'sustainability', href: '/about/sustainability' },
    ],
  },
  {
    colKey: 'offer',
    links: [
      { keyKey: 'pvc', href: '/products/windows/pvc' },
      { keyKey: 'alu', href: '/products/windows/aluminum' },
      { keyKey: 'wood', href: '/products/windows/wood' },
      { keyKey: 'doors', href: '/products/doors/exterior' },
      { keyKey: 'shutters', href: '/products/shutters/roller' },
      { label: 'OUTLET', href: '/outlet', isDirect: true },
    ],
  },
  {
    colKey: 'inspiration',
    links: [
      { keyKey: 'exterior', href: '/inspiration/other' },
      { keyKey: 'hall', href: '/inspiration/hall' },
      { keyKey: 'kitchen', href: '/inspiration/kitchen' },
      { keyKey: 'living', href: '/inspiration/livingroom' },
      { keyKey: 'bedroom', href: '/inspiration/bedroom' },
      { keyKey: 'bathroom', href: '/inspiration/bathroom' },
      { keyKey: 'terrace', href: '/inspiration/terrace' },
    ],
  },
  {
    colKey: 'partners',
    links: [
      { keyKey: 'portal', href: '/partners/portal' },
      { keyKey: 'coop', href: '/partners/cooperation' },
      { keyKey: 'sales', href: '/where-to-buy' },
      { keyKey: 'contact', href: '/contact' },
    ],
  },
]

const SOCIAL = [
  { icon: Youtube, href: '#', label: 'YouTube' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
]

export function Footer({ minimal = false }: { minimal?: boolean }) {
  const { t } = useTranslation()

  return (
    <footer className="bg-mammut-darker border-t border-mammut-border">
      {/* Newsletter bar */}
      {!minimal && (
        <div className="bg-mammut-dark border-b border-mammut-border">
          <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-mammut-white text-lg font-bold mb-6 font-montserrat uppercase tracking-wider">{t('footer.products')}</h4>
              <ul className="space-y-4">
                <li><Link to="/products" className="text-gray-400 hover:text-mammut-white transition-colors">{t('footer.categories.windows')}</Link></li>
                <li><Link to="/products" className="text-gray-400 hover:text-mammut-white transition-colors">{t('footer.categories.doors')}</Link></li>
                <li><Link to="/products" className="text-gray-400 hover:text-mammut-white transition-colors">{t('footer.categories.facades')}</Link></li>
                <li><Link to="/shop" className="text-yellow-400 hover:text-yellow-500 transition-colors font-bold tracking-widest uppercase">SHOP NOW</Link></li>
              </ul>
            </div>
            <form className="flex w-full md:w-auto gap-0">
              <input
                type="email"
                placeholder={t('footer.newsletter.placeholder')}
                className="bg-mammut-black border border-mammut-border text-mammut-white text-sm px-4 py-2.5 w-full md:w-72 focus:outline-none focus:border-mammut-gold transition-colors duration-200 placeholder:text-mammut-white/30"
              />
              <button
                type="submit"
                className="bg-mammut-gold text-black px-5 py-2.5 hover:bg-[#F3C47F] transition-colors duration-200 flex items-center gap-2 text-sm font-semibold"
              >
                {t('footer.newsletter.subscribe')} <ArrowRight size={14} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Main footer columns */}
      {!minimal && (
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
          {FOOTER_COLS.map((col) => (
            <div key={col.colKey}>
              <h4 className="text-mammut-gold text-[10px] font-bold uppercase tracking-widest mb-5 pb-2 border-b border-mammut-gold/30">
                {t(`footer.cols.${col.colKey}.title`)}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.keyKey || link.href}>
                    <Link
                      to={link.href}
                      className={`text-sm transition-colors duration-200 ${link.isDirect ? 'text-yellow-400 font-bold hover:text-mammut-white uppercase drop-shadow-[0_0_8px_rgba(252,211,77,0.3)]' : 'text-mammut-white/50 hover:text-mammut-white'}`}
                    >
                      {link.isDirect ? link.label : (link.keyKey ? t(`footer.cols.${col.colKey}.${link.keyKey}`) : '')}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Bottom bar */}
      <div className="border-t border-mammut-border">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/assets/mammut-logo-icon.png" 
              alt="Mammut Icon" 
              className="w-8 h-8 object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
            <span className="text-mammut-white/40 font-black text-sm tracking-[0.2em] uppercase">
              MAMMUT ENERGY
            </span>
          </Link>

          {/* Legal links */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/privacy" className="text-[11px] text-mammut-white/30 hover:text-mammut-white/60 transition-colors duration-200 uppercase tracking-wider">
              {t('footer.legal.privacy')}
            </Link>
            <Link to="/cookies" className="text-[11px] text-mammut-white/30 hover:text-mammut-white/60 transition-colors duration-200 uppercase tracking-wider">
              {t('footer.legal.cookies')}
            </Link>
            <Link to="/sitemap" className="text-[11px] text-mammut-white/30 hover:text-mammut-gold transition-colors duration-200 uppercase tracking-wider">
              {t('footer.legal.sitemap', { defaultValue: 'SITE MAP' })}
            </Link>
            <Link to="/terms" className="text-[11px] text-mammut-white/30 hover:text-mammut-white/60 transition-colors duration-200 uppercase tracking-wider">
              {t('footer.legal.terms')}
            </Link>
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-3">
            {SOCIAL.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-8 h-8 border border-mammut-border flex items-center justify-center text-mammut-white/40 hover:text-mammut-gold hover:border-mammut-gold transition-all duration-200"
              >
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>

        <p className="text-center text-[11px] text-mammut-white/20 pb-4">
          © {new Date().getFullYear()} {t('footer.legal.copyright')}
        </p>
      </div>
    </footer>
  )
}
