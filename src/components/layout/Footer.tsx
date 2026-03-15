import { Link } from 'react-router-dom'
import { Youtube, Instagram, Linkedin, Facebook, ArrowRight } from 'lucide-react'

const FOOTER_COLS = [
  {
    heading: 'About Mammut',
    links: [
      { label: 'Our History', href: '/about/history' },
      { label: 'Quality & Certificates', href: '/about/quality' },
      { label: 'Innovation', href: '/about/innovation' },
      { label: 'Sustainability', href: '/about/sustainability' },
    ],
  },
  {
    heading: 'Our Offer',
    links: [
      { label: 'PVC Windows', href: '/products/windows/pvc' },
      { label: 'Aluminum Windows', href: '/products/windows/aluminum' },
      { label: 'Wood Windows', href: '/products/windows/wood' },
      { label: 'Exterior Doors', href: '/products/doors/exterior' },
      { label: 'Shutters', href: '/products/shutters/roller' },
    ],
  },
  {
    heading: 'Inspiration',
    links: [
      { label: 'Kitchen', href: '/inspiration/kitchen' },
      { label: 'Living Room', href: '/inspiration/living-room' },
      { label: 'Bedroom', href: '/inspiration/bedroom' },
      { label: 'Terrace', href: '/inspiration/terrace' },
    ],
  },
  {
    heading: 'Partners',
    links: [
      { label: 'Partner Portal', href: '/partners/portal' },
      { label: 'Cooperation Program', href: '/partners/cooperation' },
      { label: 'Sales Representatives', href: '/where-to-buy' },
      { label: 'Contact', href: '/contact' },
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
  return (
    <footer className="bg-[#111112] border-t border-[#2a2a2b]">
      {/* Newsletter bar */}
      <div className="bg-[#1a1a1b] border-b border-[#2a2a2b]">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-[#dca95c] text-xs uppercase tracking-widest font-semibold mb-1">
              Newsletter
            </p>
            <p className="text-white/60 text-sm">
              Stay updated on new products and innovations.
            </p>
          </div>
          <form className="flex w-full md:w-auto gap-0">
            <input
              type="email"
              placeholder="Your email address"
              className="bg-black border border-[#2a2a2b] text-white text-sm px-4 py-2.5 w-full md:w-72 focus:outline-none focus:border-[#dca95c] transition-colors duration-200 placeholder:text-white/30"
            />
            <button
              type="submit"
              className="bg-[#dca95c] text-black px-5 py-2.5 hover:bg-[#eab676] transition-colors duration-200 flex items-center gap-2 text-sm font-semibold"
            >
              Subscribe <ArrowRight size={14} />
            </button>
          </form>
        </div>
      </div>

      {/* Main footer columns */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        {FOOTER_COLS.map((col) => (
          <div key={col.heading}>
            <h4 className="text-[#dca95c] text-[10px] font-bold uppercase tracking-widest mb-5 pb-2 border-b border-[#dca95c]/30">
              {col.heading}
            </h4>
            <ul className="space-y-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-white/50 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
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
            {['Privacy Policy', 'Cookie Settings', 'Site Map', 'Terms of Use'].map((item) => (
              <a
                key={item}
                href="#"
                className="text-[11px] text-white/30 hover:text-white/60 transition-colors duration-200 uppercase tracking-wider"
              >
                {item}
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
                className="w-8 h-8 border border-[#2a2a2b] flex items-center justify-center text-white/40 hover:text-[#dca95c] hover:border-[#dca95c] transition-all duration-200"
              >
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>

        <p className="text-center text-[11px] text-white/20 pb-4">
          © {new Date().getFullYear()} Mammut Windows & Doors. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
