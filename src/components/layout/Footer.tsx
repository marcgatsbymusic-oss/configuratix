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
    ],
  },
  {
    colKey: 'inspiration',
    links: [
      { keyKey: 'kitchen', href: '/inspiration/kitchen' },
      { keyKey: 'living', href: '/inspiration/living-room' },
      { keyKey: 'bedroom', href: '/inspiration/bedroom' },
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

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="bg-[#111112] border-t border-[#2a2a2b]">
      {/* Newsletter bar */}
      <div className="bg-[#1a1a1b] border-b border-[#2a2a2b]">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-[#eab676] text-xs uppercase tracking-widest font-semibold mb-1">
              {t('footer.newsletter.title')}
            </p>
            <p className="text-white/60 text-sm">
              {t('footer.newsletter.desc')}
            </p>
          </div>
          <form className="flex w-full md:w-auto gap-0">
            <input
              type="email"
              placeholder={t('footer.newsletter.placeholder')}
              className="bg-black border border-[#2a2a2b] text-white text-sm px-4 py-2.5 w-full md:w-72 focus:outline-none focus:border-[#eab676] transition-colors duration-200 placeholder:text-white/30"
            />
            <button
              type="submit"
              className="bg-[#eab676] text-black px-5 py-2.5 hover:bg-[#F3C47F] transition-colors duration-200 flex items-center gap-2 text-sm font-semibold"
            >
              {t('footer.newsletter.subscribe')} <ArrowRight size={14} />
            </button>
          </form>
        </div>
      </div>

      {/* Main footer columns */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        {FOOTER_COLS.map((col) => (
          <div key={col.colKey}>
            <h4 className="text-[#eab676] text-[10px] font-bold uppercase tracking-widest mb-5 pb-2 border-b border-[#eab676]/30">
              {t(`footer.cols.${col.colKey}.title`)}
            </h4>
            <ul className="space-y-3">
              {col.links.map((link) => (
                <li key={link.keyKey}>
                  <Link
                    to={link.href}
                    className="text-sm text-white/50 hover:text-white transition-colors duration-200"
                  >
                    {t(`footer.cols.${col.colKey}.${link.keyKey}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#2a2a2b]">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/assets/mammut-logo-icon.png" 
              alt="Mammut Icon" 
              className="w-8 h-8 object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
            <span className="text-white/40 font-black text-sm tracking-[0.2em] uppercase">
              MAMMUT ENERGY
            </span>
          </Link>

          {/* Legal links */}
          <div className="flex flex-wrap justify-center gap-4">
            {['privacy', 'cookies', 'sitemap', 'terms'].map((item) => (
              <a
                key={item}
                href="#"
                className="text-[11px] text-white/30 hover:text-white/60 transition-colors duration-200 uppercase tracking-wider"
              >
                {t(`footer.legal.${item}`)}
              </a>
            ))}
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-3">
            {SOCIAL.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-8 h-8 border border-[#2a2a2b] flex items-center justify-center text-white/40 hover:text-[#eab676] hover:border-[#eab676] transition-all duration-200"
              >
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>

        <p className="text-center text-[11px] text-white/20 pb-4">
          © {new Date().getFullYear()} {t('footer.legal.copyright')}
        </p>
      </div>
    </footer>
  )
}
