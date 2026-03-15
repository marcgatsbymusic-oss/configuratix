import { Link } from 'react-router-dom'
import { ArrowRight, ChevronDown } from 'lucide-react'

const FEATURED_SPECS = [
  { value: 'Uw = 0.57', label: 'Thermal Transmittance' },
  { value: '48 dB', label: 'Sound Insulation' },
  { value: '6-chamber', label: 'Profile Design' },
  { value: '82 mm', label: 'Installation Depth' },
]

const PRODUCT_HIGHLIGHTS = [
  {
    tag: 'NEW',
    name: 'IGLO EDGE',
    tagline: 'Maximum insulation, minimal frame',
    href: '/products/iglo-edge',
    specs: ['Uw = 0.66 W/(m²K)*', '82mm depth', '7-chamber', 'Profile Class A'],
    image: '/assets/iglo-edge-featured.png'
  },
  {
    tag: 'PREMIUM',
    name: 'IGLO LIGHT',
    tagline: 'Even more light into your space',
    href: '/products/windows/pvc/iglo-light',
    specs: ['dB = 34', '5 chambers', 'EPDM seals'],
  },
  {
    tag: 'BESTSELLER',
    name: 'IGLO 5',
    tagline: 'The classic reborn',
    href: '/products/windows/pvc/iglo-5',
    specs: ['Uw = 0.74 W/m²K', '70mm depth', '5-chamber'],
  },
]

export function HomePage() {
  return (
    <main className="min-h-screen bg-black">
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative h-screen flex items-end pb-20 overflow-hidden">
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30 z-10" />

        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80"
          style={{ backgroundImage: `url('/assets/hero.png')` }}
        />

        <div className="relative z-20 max-w-7xl mx-auto px-6 w-full">
          <p className="text-[#dca95c] text-xs uppercase tracking-[0.3em] font-semibold mb-4">
            Premium Windows & Doors
          </p>
          <h1 className="text-6xl md:text-8xl font-black uppercase leading-none mb-6 max-w-3xl">
            Define your<br />
            <span className="text-[#dca95c]">space</span>
          </h1>
          <p className="text-white/60 text-lg mb-10 max-w-xl">
            Precision-engineered windows and doors that transform architecture
            with cutting-edge thermal and acoustic performance.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/products"
              className="flex items-center gap-2 bg-[#dca95c] text-black px-8 py-4 text-sm uppercase tracking-widest font-bold hover:bg-[#eab676] transition-colors duration-200"
            >
              Explore Products <ArrowRight size={16} />
            </Link>
            <Link
              to="/configurator"
              className="flex items-center gap-2 border border-white/30 text-white px-8 py-4 text-sm uppercase tracking-widest font-bold hover:border-[#dca95c] hover:text-[#dca95c] transition-all duration-200"
            >
              3D Configurator
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-white/30 animate-bounce">
          <ChevronDown size={20} />
        </div>
      </section>

      {/* ── Spec Band ─────────────────────────────────────────── */}
      <section className="bg-[#1a1a1b] border-y border-[#2a2a2b] py-8">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {FEATURED_SPECS.map((s) => (
            <div key={s.label} className="spec-card text-center">
              <p className="text-2xl font-black text-[#dca95c] mb-1">{s.value}</p>
              <p className="text-[11px] uppercase tracking-widest text-white/40">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Products ──────────────────────────────────── */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-[#dca95c] text-xs uppercase tracking-widest font-semibold mb-2">
              Our Collection
            </p>
            <h2 className="text-4xl font-black uppercase">Featured Systems</h2>
          </div>
          <Link
            to="/products"
            className="hidden md:flex items-center gap-2 text-sm text-[#dca95c] uppercase tracking-widest hover:gap-3 transition-all duration-200"
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {PRODUCT_HIGHLIGHTS.map((p) => (
            <Link
              key={p.name}
              to={p.href}
              className="group relative bg-[#1a1a1b] border border-[#2a2a2b] hover:border-[#dca95c]/40 transition-all duration-300 overflow-hidden"
            >
              {/* Image or placeholder */}
              <div className="h-64 bg-[#111112] flex items-center justify-center relative overflow-hidden">
                {p.image ? (
                  <img 
                    src={p.image} 
                    alt={p.name} 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                  />
                ) : (
                  <div className="w-32 h-32 border border-[#dca95c]/20 rotate-45 group-hover:rotate-[60deg] transition-transform duration-700" />
                )}
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-[#dca95c] text-black text-[10px] font-bold uppercase tracking-widest px-2 py-1">
                    {p.tag}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-black uppercase mb-1">{p.name}</h3>
                <p className="text-white/50 text-sm mb-4">{p.tagline}</p>
                <div className="flex flex-wrap gap-2">
                  {p.specs.map((s) => (
                    <span
                      key={s}
                      className="text-[10px] uppercase tracking-widest text-[#dca95c] border border-[#dca95c]/30 px-2 py-0.5"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-6 text-[#dca95c] text-xs uppercase tracking-widest font-semibold group-hover:gap-3 transition-all duration-200">
                  Discover <ArrowRight size={12} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Configurator CTA ───────────────────────────────────── */}
      <section className="bg-[#1a1a1b] border-t border-[#2a2a2b] py-24">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-lg">
            <p className="text-[#dca95c] text-xs uppercase tracking-widest font-semibold mb-3">
              3D Configurator
            </p>
            <h2 className="text-4xl font-black uppercase mb-4">
              Design Your Perfect Window
            </h2>
            <p className="text-white/50">
              Choose dimensions, materials, colors, and glass type. Save your configuration
              and request a quote instantly.
            </p>
          </div>
          <Link
            to="/configurator"
            className="shrink-0 flex items-center gap-3 border border-[#dca95c] text-[#dca95c] px-10 py-5 text-sm uppercase tracking-widest font-bold hover:bg-[#dca95c] hover:text-black transition-all duration-300"
          >
            Launch Configurator <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  )
}
