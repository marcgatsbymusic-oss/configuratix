import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

// Using i18n keys for data maps
const HERO_SLIDES = ['slide1', 'slide2', 'slide3'].map((k, i) => ({
  img: `/assets/hero/hero-${i + 1}.png`,
  key: k
}))

const CATEGORY_TILES = [
  { cKey: 'windows', iKey: 'alu', image: '/assets/mwindows/windows_alu.jpg', href: '/products' },
  { cKey: 'windows', iKey: 'woodAlu', image: '/assets/mwindows/windows_wood-alu.jpg', href: '/products' },
  { cKey: 'doors', iKey: 'pvc', image: '/assets/mwindows/doors_pvc-1.jpg', href: '/products' },
  { cKey: 'doors', iKey: 'wooden', image: '/assets/mwindows/doors_wooden.jpg', href: '/products' },
  { cKey: 'doors', iKey: 'alu', image: '/assets/mwindows/doors_alu.jpg', href: '/products' },
  { cKey: 'shutters', iKey: 'adaptive', image: '/assets/mwindows/shutters_adaptive.jpg', href: '/products' },
  { cKey: 'shutters', iKey: 'topMounted', image: '/assets/mwindows/shutters_top-mounted.jpg', href: '/products' },
  { cKey: 'blinds', iKey: 'externalVenetian', image: '/assets/mwindows/external_venetian_blinds.jpg', href: '/products' },
  { cKey: 'terrace', iKey: 'liftSlide', image: '/assets/mwindows/terrace_hs.jpg', href: '/products' },
  { cKey: 'terrace', iKey: 'tiltSlide', image: '/assets/mwindows/terrace_psk.jpg', href: '/products' },
  { cKey: 'terrace', iKey: 'folding', image: '/assets/mwindows/terrace_folding.jpg', href: '/products' },
  { cKey: 'additions', iKey: 'customization', image: '/assets/mwindows/additions.jpg', href: '/products' },
]

const PRODUCT_HIGHLIGHTS = [
  { tagKey: 'new', name: 'IGLO EDGE', nameKey: 'igloEdge', href: '/products/iglo-edge', specs: ['Uw = 0.66 W/(m²K)*', '82mm depth', '7-chamber', 'Profile Class A'], image: '/assets/iglo-edge-featured.png' },
  { tagKey: 'premium', name: 'IGLO LIGHT', nameKey: 'igloLight', href: '/products/windows/pvc/iglo-light', specs: ['dB = 34', '5 chambers', 'EPDM seals'] },
  { tagKey: 'bestseller', name: 'IGLO 5', nameKey: 'iglo5', href: '/products/windows/pvc/iglo-5', specs: ['Uw = 0.74 W/m²K', '70mm depth', '5-chamber'] },
]
export function HomePage() {
  const { t } = useTranslation()
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 5000)
    return () => clearInterval(t)
  }, [])

  const prev = () => setSlide(s => (s - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
  const next = () => setSlide(s => (s + 1) % HERO_SLIDES.length)

  return (
    <main className="min-h-screen bg-black">
      {/* ── Hero Carousel ────────────────────────────────────────── */}
      <section className="relative h-screen flex items-end pb-20 overflow-hidden">

        {/* Slides */}
        {HERO_SLIDES.map((s, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ${i === slide ? 'opacity-100' : 'opacity-0'}`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url('${s.img}')` }}
            />
          </div>
        ))}

        {/* Contrast Overlay for Text Legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/30 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 pointer-events-none" />

        {/* Content */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 md:px-6 w-full">
          <p className="!text-white drop-shadow-md text-[10px] md:text-xs uppercase tracking-[0.3em] font-semibold mb-4">
            {t('home.hero.premium')}
          </p>
          <h1 className="!text-white text-5xl md:text-7xl lg:text-8xl font-black uppercase leading-none mb-6 max-w-3xl transition-all duration-700 drop-shadow-lg break-words">
            {t(`home.hero.${HERO_SLIDES[slide].key}.headline`)}<br />
            <span className="!text-[#eab676]">{t(`home.hero.${HERO_SLIDES[slide].key}.headlineSpan`)}</span>
          </h1>
          <p className="!text-white drop-shadow-md text-lg mb-10 max-w-xl transition-all duration-700">
            {t(`home.hero.${HERO_SLIDES[slide].key}.sub`)}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/products"
              className="flex items-center gap-2 bg-[#eab676] text-black px-8 py-4 text-sm uppercase tracking-widest font-bold hover:bg-[#F3C47F] transition-colors duration-200"
            >
              {t('home.hero.explore')} <ArrowRight size={16} />
            </Link>
            <Link
              to="/configurator"
              className="flex items-center gap-2 border border-white/30 text-white px-8 py-4 text-sm uppercase tracking-widest font-bold hover:border-[#eab676] hover:text-[#eab676] transition-all duration-200"
            >
              {t('home.hero.configurator')}
            </Link>
          </div>
        </div>

        {/* Prev / Next arrows */}
        <button
          onClick={prev}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 border border-white/20 flex items-center justify-center text-white/50 hover:border-[#eab676] hover:text-[#eab676] transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={next}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 border border-white/20 flex items-center justify-center text-white/50 hover:border-[#eab676] hover:text-[#eab676] transition-all"
        >
          <ChevronRight size={20} />
        </button>

        {/* Dot indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`transition-all duration-300 rounded-full ${
                i === slide ? 'w-8 h-2 bg-[#eab676]' : 'w-2 h-2 bg-white/30 hover:bg-white/60'
              }`}
            />
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 right-6 z-20 flex flex-col items-center gap-2 text-white/30 animate-bounce">
          <ChevronDown size={20} />
        </div>
      </section>



      {/* ── Our Offer ──────────────────────────────────────────── */}
      <section className="border-b border-[#2a2a2b]" style={{ background: 'linear-gradient(180deg, #111112 0%, #161617 100%)' }}>
        <div className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-0 items-stretch">
          {/* Left: architectural image */}
          <div className="overflow-hidden min-h-[420px] lg:min-h-0">
            <img
              src="/assets/mwindows/slide1.jpg"
              alt="Modern architecture with premium windows"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              style={{ minHeight: '420px' }}
            />
          </div>

          {/* Right: text */}
          <div className="bg-[#1a1a1b] flex flex-col justify-center px-6 md:px-12 py-12 lg:py-16 lg:px-16">
            <span className="text-[#eab676] text-[10px] font-bold uppercase tracking-[0.3em] mb-4">
              {t('home.offer.subtitle')}
            </span>
            <h2 className="text-4xl font-black text-white uppercase mb-6 leading-tight">
              {t('home.offer.title')}
            </h2>
            <p className="!text-white leading-relaxed mb-8">
              {t('home.offer.text')}
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-[#eab676] text-black px-8 py-4 text-sm uppercase tracking-widest font-bold hover:bg-[#F3C47F] transition-colors duration-200 self-start"
            >
              {t('home.hero.explore')} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Product Category Grid ───────────────────────────────── */}
      <section className="border-b border-[#2a2a2b] bg-[#0e0e0f]">
        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-0">
            {CATEGORY_TILES.map((tile) => (
              <Link
                key={`${tile.cKey}-${tile.iKey}`}
                to={tile.href}
                className="group relative overflow-hidden aspect-square block"
              >
                {/* Background image */}
                <img
                  src={tile.image}
                  alt={tile.cKey}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Dark overlay for text legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-500 group-hover:opacity-80 z-0" />
                
                {/* Inset Border (Hover Only) */}
                <div className="absolute inset-4 lg:inset-6 border-[2px] border-[#eab676] pointer-events-none transition-transform duration-500 scale-0 group-hover:scale-100 z-10" />

                {/* Text centered */}
                <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6 z-20">
                  <span className="bg-[#eab676] text-black px-5 py-1.5 text-[10px] lg:text-xs font-normal tracking-[0.15em] uppercase mb-3 shadow-lg transition-colors duration-300 group-hover:bg-[#F3C47F]">
                    {t(`home.categories.tabs.${tile.cKey}`)}
                  </span>
                  <span className="text-white font-black text-2xl lg:text-3xl uppercase leading-tight drop-shadow-xl transition-transform duration-300 group-hover:scale-105">
                    {t(`home.categories.items.${tile.iKey}`)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ──────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 md:mb-12 gap-4">
          <div>
            <p className="text-[#eab676] text-xs uppercase tracking-widest font-semibold mb-2">
              {t('home.featured.subtitle')}
            </p>
            <h2 className="text-4xl font-black uppercase">{t('home.featured.title')}</h2>
          </div>
          <Link
            to="/products"
            className="hidden md:flex items-center gap-2 text-sm text-[#eab676] uppercase tracking-widest hover:gap-3 transition-all duration-200"
          >
            {t('home.featured.viewAll')} <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {PRODUCT_HIGHLIGHTS.map((p) => (
            <Link
              key={p.name}
              to={p.href}
              className="group relative bg-[#1a1a1b] border border-[#2a2a2b] hover:border-[#eab676]/40 transition-all duration-300 overflow-hidden"
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
                  <div className="w-32 h-32 border border-[#eab676]/20 rotate-45 group-hover:rotate-[60deg] transition-transform duration-700" />
                )}
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-[#eab676] text-black text-[10px] font-bold uppercase tracking-widest px-2 py-1">
                    {t(`home.featured.tags.${p.tagKey}`)}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-black uppercase mb-1">{p.name}</h3>
                <p className="text-white/50 text-sm mb-4">{t(`home.featured.${p.nameKey}.tagline`)}</p>
                <div className="flex flex-wrap gap-2">
                  {p.specs.map((s) => (
                    <span
                      key={s}
                      className="text-[10px] uppercase tracking-widest text-[#eab676] border border-[#eab676]/30 px-2 py-0.5"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-6 text-[#eab676] text-xs uppercase tracking-widest font-semibold group-hover:gap-3 transition-all duration-200">
                  {t('home.featured.discover')} <ArrowRight size={12} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Configurator CTA ───────────────────────────────────── */}
      <section className="bg-[#1a1a1b] border-t border-[#2a2a2b] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
          <div className="max-w-lg">
            <p className="text-[#eab676] text-xs uppercase tracking-widest font-semibold mb-3">
              {t('home.cta.subtitle')}
            </p>
            <h2 className="text-4xl font-black uppercase mb-4">
              {t('home.cta.title')}
            </h2>
            <p className="text-white/50">
              {t('home.cta.text')}
            </p>
          </div>
          <Link
            to="/configurator"
            className="shrink-0 flex items-center gap-3 border border-[#eab676] text-[#eab676] px-10 py-5 text-sm uppercase tracking-widest font-bold hover:bg-[#eab676] hover:text-black transition-all duration-300"
          >
            {t('home.cta.button')} <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  )
}
