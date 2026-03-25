import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

const HERO_SLIDES = [
  {
    img: '/assets/hero/hero-1.png',
    headline: <>Define your<br /><span className="text-[#dca95c]">space</span></>,
    sub: 'Precision-engineered windows and doors that transform architecture with cutting-edge thermal and acoustic performance.',
  },
  {
    img: '/assets/hero/hero-2.png',
    headline: <>Open to the<br /><span className="text-[#dca95c]">world</span></>,
    sub: 'Panoramic lift-and-slide systems that dissolve the boundary between inside and outside.',
  },
  {
    img: '/assets/hero/hero-3.png',
    headline: <>Light, redefined<br /><span className="text-[#dca95c]">by design</span></>,
    sub: 'Floor-to-ceiling glazing that fills every room with natural light while keeping heat and noise out.',
  },
]



const CATEGORY_TILES = [
  { category: 'WINDOWS',         title: 'ALUMINIUM',              image: '/assets/mwindows/windows_alu.jpg',              href: '/products' },
  { category: 'WINDOWS',         title: 'WOOD-ALUMINIUM',         image: '/assets/mwindows/windows_wood-alu.jpg',         href: '/products' },
  { category: 'DOORS',           title: 'PVC',                    image: '/assets/mwindows/doors_pvc-1.jpg',              href: '/products' },
  { category: 'DOORS',           title: 'WOODEN',                 image: '/assets/mwindows/doors_wooden.jpg',             href: '/products' },
  { category: 'DOORS',           title: 'ALUMINIUM',              image: '/assets/mwindows/doors_alu.jpg',                href: '/products' },
  { category: 'SHUTTERS',        title: 'ADAPTIVE',               image: '/assets/mwindows/shutters_adaptive.jpg',        href: '/products' },
  { category: 'SHUTTERS',        title: 'TOP-MOUNTED',            image: '/assets/mwindows/shutters_top-mounted.jpg',     href: '/products' },
  { category: 'BLINDS',          title: 'EXTERNAL VENETIAN',      image: '/assets/mwindows/external_venetian_blinds.jpg', href: '/products' },
  { category: 'TERRACE SYSTEMS', title: 'LIFT AND SLIDE HS',      image: '/assets/mwindows/terrace_hs.jpg',               href: '/products' },
  { category: 'TERRACE SYSTEMS', title: 'TILT AND SLIDE PSK',     image: '/assets/mwindows/terrace_psk.jpg',              href: '/products' },
  { category: 'TERRACE SYSTEMS', title: 'FOLDING DOORS',          image: '/assets/mwindows/terrace_folding.jpg',          href: '/products' },
  { category: 'ADDITIONS',       title: 'CUSTOMIZATION',          image: '/assets/mwindows/additions.jpg',                href: '/products' },
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

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10" />

        {/* Content */}
        <div className="relative z-20 max-w-7xl mx-auto px-6 w-full">
          <p className="text-[#dca95c] text-xs uppercase tracking-[0.3em] font-semibold mb-4">
            Premium Windows &amp; Doors
          </p>
          <h1 className="text-6xl md:text-8xl font-black uppercase leading-none mb-6 max-w-3xl transition-all duration-700">
            {HERO_SLIDES[slide].headline}
          </h1>
          <p className="text-white/60 text-lg mb-10 max-w-xl transition-all duration-700">
            {HERO_SLIDES[slide].sub}
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

        {/* Prev / Next arrows */}
        <button
          onClick={prev}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 border border-white/20 flex items-center justify-center text-white/50 hover:border-[#dca95c] hover:text-[#dca95c] transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={next}
          className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 border border-white/20 flex items-center justify-center text-white/50 hover:border-[#dca95c] hover:text-[#dca95c] transition-all"
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
                i === slide ? 'w-8 h-2 bg-[#dca95c]' : 'w-2 h-2 bg-white/30 hover:bg-white/60'
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
          <div className="bg-[#1a1a1b] flex flex-col justify-center px-12 py-16 lg:px-16">
            <span className="text-[#dca95c] text-[10px] font-bold uppercase tracking-[0.3em] mb-4">
              Complete Solutions
            </span>
            <h2 className="text-4xl font-black text-white uppercase mb-6 leading-tight">
              Our Offer
            </h2>
            <p className="!text-white leading-relaxed mb-8">
              We offer a wide range of windows, frames, exterior doors, and sliding doors in PVC, wood and aluminium. Through expert craftsmanship, the highest quality materials, and a level of service we ensure our company's status. Each window and door is made to order, providing each customer with individual service and attention. We will provide you with the highest level of expertise and assist you all the way with your renovation and construction plans.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-[#dca95c] text-black px-8 py-4 text-sm uppercase tracking-widest font-bold hover:bg-[#eab676] transition-colors duration-200 self-start"
            >
              Explore Products <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Product Category Grid ───────────────────────────────── */}
      <section className="py-20 border-b border-[#2a2a2b] bg-[#0e0e0f]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12 text-center">
            <span className="text-[#dca95c] text-[10px] font-bold uppercase tracking-[0.3em] mb-3 block">
              Browse by Type
            </span>
            <h2 className="text-4xl font-black text-white uppercase">Product Categories</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
            {CATEGORY_TILES.map((tile) => (
              <Link
                key={`${tile.category}-${tile.title}`}
                to={tile.href}
                className="group relative overflow-hidden aspect-[4/3] block"
              >
                {/* Background image */}
                <img
                  src={tile.image}
                  alt={`${tile.category} — ${tile.title}`}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300" />
                {/* Gold gradient at bottom */}
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/50 to-transparent" />
                {/* Text */}
                <div className="absolute inset-0 flex flex-col justify-end p-4">
                  <span className="text-[#dca95c] text-[9px] font-bold uppercase tracking-[0.2em] mb-1">
                    {tile.category}
                  </span>
                  <span className="text-white font-black text-sm uppercase leading-tight group-hover:text-[#dca95c] transition-colors duration-200">
                    {tile.title}
                  </span>
                </div>
                {/* Gold border on hover */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#dca95c]/60 transition-all duration-300" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ──────────────────────────────────────────────────── */}
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
