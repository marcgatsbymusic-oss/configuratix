import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Check, ChevronLeft, ChevronRight, Play, X } from 'lucide-react'
import { IGLO_EDGE_DETAIL, type GlassOption } from '../data/productDetails'
import { PRODUCTS } from '../data/products'
import { ColorSwatch } from '../components/products/ColorSwatch'


const HANDLES = [
  { name: 'nevada-ral7016',    label: 'NEVADA con llave (RAL7016)',         image: '/assets/handles/nevada-ral7016.png' },
  { name: 'nevada-ral9001',    label: 'NEVADA con llave (RAL9001)',         image: '/assets/handles/nevada-ral9001.png' },
  { name: 'nevada-ral9005',    label: 'NEVADA con llave (RAL9005)',         image: '/assets/handles/nevada-ral9005.png' },
  { name: 'nevada-ral9016',    label: 'NEVADA con llave (RAL9016)',         image: '/assets/handles/nevada-ral9016.png' },
  { name: 'nevada-f9',         label: 'NEVADA con llave (tytan F9)',        image: '/assets/handles/nevada-f9.png' },
  { name: 'mistral-ral7016',   label: 'MISTRAL con llave (RAL7016)',        image: '/assets/handles/mistral-ral7016.png' },
  { name: 'mistral-ral9001',   label: 'MISTRAL con llave (RAL9001)',        image: '/assets/handles/mistral-ral9001.png' },
  { name: 'mistral-ral9005',   label: 'MISTRAL con llave (RAL9005)',        image: '/assets/handles/mistral-ral9005.png' },
  { name: 'mistral-f9-key',    label: 'MISTRAL con llave (tytan F9)',       image: '/assets/handles/mistral-f9-key.png' },
  { name: 'mistral-f9',        label: 'MISTRAL F9',                        image: '/assets/handles/mistral-f9.png' },
  { name: 'dublin-ral9016',    label: 'DUBLIN (blanco RAL9016)',            image: '/assets/handles/dublin-ral9016.png' },
  { name: 'dublin-ral8019',    label: 'DUBLIN (marrón RAL8019)',            image: '/assets/handles/dublin-ral8019.png' },
  { name: 'dublin-ral7016',    label: 'DUBLIN (RAL7016)',                   image: '/assets/handles/dublin-ral7016.png' },
  { name: 'dublin-ral9005',    label: 'DUBLIN (RAL9005)',                   image: '/assets/handles/dublin-ral9005.png' },
  { name: 'dublin-silver',     label: 'DUBLIN (plateada)',                  image: '/assets/handles/dublin-silver.png' },
  { name: 'dublin-key-ral7016', label: 'DUBLIN con llave (RAL7016)',        image: '/assets/handles/dublin-key-ral7016.png' },
  { name: 'dublin-key-ral9005', label: 'DUBLIN con llave (RAL9005)',        image: '/assets/handles/dublin-key-ral9005.png' },
  { name: 'dublin-key-ral9016', label: 'DUBLIN con llave (blanco RAL9016)', image: '/assets/handles/dublin-key-ral9016.png' },
  { name: 'dublin-key-ral8019', label: 'DUBLIN con llave (marrón RAL8019)', image: '/assets/handles/dublin-key-ral8019.png' },
  { name: 'dublin-key-silver',  label: 'DUBLIN con llave (plateada)',       image: '/assets/handles/dublin-key-silver.png' },
  { name: 'kwadrat-ral7016',   label: 'KWADRAT RAL 7016',                  image: '/assets/handles/kwadrat-ral7016.png' },
  { name: 'kwadrat-ral8019',   label: 'KWADRAT RAL 8019',                  image: '/assets/handles/kwadrat-ral8019.png' },
  { name: 'kwadrat-ral9016',   label: 'KWADRAT RAL 9016',                  image: '/assets/handles/kwadrat-ral9016.png' },
  { name: 'kwadrat-ral9001',   label: 'KWADRAT RAL 9001',                  image: '/assets/handles/kwadrat-ral9001.png' },
  { name: 'kwadrat-f9',        label: 'KWADRAT tytan F9',                  image: '/assets/handles/kwadrat-f9.png' },
  { name: 'kwadrat-key-f1',    label: 'KWADRAT con llave F1',              image: '/assets/handles/kwadrat-key-f1.png' },
  { name: 'kwadrat-key-f4',    label: 'KWADRAT con llave F4',              image: '/assets/handles/kwadrat-key-f4.png' },
  { name: 'kwadrat-key-f9',    label: 'KWADRAT con llave F9',              image: '/assets/handles/kwadrat-key-f9.png' },
  { name: 'kwadrat-key-ral7016', label: 'KWADRAT con llave (RAL7016)',     image: '/assets/handles/kwadrat-key-ral7016.png' },
  { name: 'kwadrat-key-ral8019', label: 'KWADRAT con llave (RAL8019)',     image: '/assets/handles/kwadrat-key-ral8019.png' },
  { name: 'kwadrat-key-ral9001', label: 'KWADRAT con llave (RAL9001)',     image: '/assets/handles/kwadrat-key-ral9001.png' },
  { name: 'kwadrat-key-ral9005', label: 'KWADRAT con llave (RAL9005)',     image: '/assets/handles/kwadrat-key-ral9005.png' },
  { name: 'kwadrat-key-ral9016', label: 'KWADRAT con llave (RAL9016)',     image: '/assets/handles/kwadrat-key-ral9016.png' },
]

const PER_PAGE = 5

function HandlesSlider() {
  const [page, setPage] = useState(0)
  const totalPages = Math.ceil(HANDLES.length / PER_PAGE)
  const visible = HANDLES.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE)

  return (
    <section className="py-16 border-b border-[#2a2a2b]" style={{ background: 'linear-gradient(180deg, #0e0e0f 0%, #161617 100%)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-2">Handles</h2>
        <p className="text-white/50 text-sm mb-10 max-w-2xl">
          Our window handles are distinguished by their excellent workmanship, functionality and durability. Available in multiple color variants to perfectly match your windows.
        </p>
        <div className="relative flex items-center gap-4">
          <button
            onClick={() => setPage(p => (p - 1 + totalPages) % totalPages)}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center border border-[#3a3a3b] text-white/60 hover:text-[#dca95c] hover:border-[#dca95c] transition-colors duration-200"
            aria-label="Previous"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1 grid grid-cols-5 gap-4">
            {visible.map(handle => (
              <div key={handle.name} className="flex flex-col items-center gap-3">
                <div className="w-full aspect-square flex items-end justify-center overflow-hidden bg-[#111112]">
                  <img src={handle.image} alt={handle.label} className="w-full h-full object-contain hover:scale-105 transition-transform duration-300" />
                </div>
                <p className="text-white/70 text-[11px] text-center leading-tight px-1">{handle.label}</p>
              </div>
            ))}
            {Array.from({ length: PER_PAGE - visible.length }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
          </div>
          <button
            onClick={() => setPage(p => (p + 1) % totalPages)}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center border border-[#3a3a3b] text-white/60 hover:text-[#dca95c] hover:border-[#dca95c] transition-colors duration-200"
            aria-label="Next"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className="w-2 h-2 rounded-full transition-colors duration-200"
              style={{ background: i === page ? '#dca95c' : 'rgba(255,255,255,0.2)' }}
              aria-label={`Page ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Additional Options ──────────────────────────────────────────────────────

const ADDITIONAL_OPTIONS = [
  {
    id: 'mounting',
    title: 'Mounting accessories',
    description: 'Here you will find the products necessary for proper installation of joinery.',
    seeAllHref: 'https://www.drutex.eu/en/products/addons/type/602/',
    items: [
      { name: 'Mounting wedges',       image: '/assets/additional-options/mounting-wedges.webp' },
      { name: 'NYXON HS Air Yellow',   image: '/assets/additional-options/nyxon-hs-air-yellow.webp' },
      { name: 'NYXON Mono Yellow',     image: '/assets/additional-options/nyxon-mono-yellow.webp' },
      { name: 'Phonotherm 200 RG 700', image: '/assets/additional-options/phonotherm-200.webp' },
    ],
  },
  {
    id: 'muntin',
    title: 'Muntin bars',
    description: 'An attractive addition that highlights the unique character of the building.',
    seeAllHref: 'https://www.drutex.eu/en/products/addons/type/4/',
    items: [
      { name: 'Glue-on muntin bars\nSizes: 27/45/65 mm',      image: '/assets/additional-options/muntin-glue-on.webp' },
      { name: 'Internal muntin bars\nSizes: 8/18/26/45 mm',    image: '/assets/additional-options/muntin-internal.webp' },
      { name: 'Vienna muntin bars',                             image: '/assets/additional-options/muntin-vienna.webp' },
    ],
  },
  {
    id: 'fittings',
    title: 'Reliable fittings',
    description: 'Safety, comfort and functionality in every detail.',
    seeAllHref: 'https://www.drutex.eu/en/products/addons/type/6/',
    items: [
      { name: 'Friction brake',        image: '/assets/additional-options/fitting-friction-brake.webp' },
      { name: 'Reed switch',           image: '/assets/additional-options/fitting-reed-switch.webp' },
      { name: 'Multistep tilt',        image: '/assets/additional-options/fitting-multistep-tilt.webp' },
      { name: 'Comfort',               image: '/assets/additional-options/fitting-comfort.webp' },
      { name: 'Concealed hinges',      image: '/assets/additional-options/fitting-concealed-hinges.webp' },
      { name: 'Tilt-first (TBT) handle', image: '/assets/additional-options/fitting-tbt-handle.webp' },
      { name: 'Hinge covers',          image: '/assets/additional-options/fitting-hinge-covers.webp' },
      { name: 'Door closer',           image: '/assets/additional-options/fitting-door-closer.webp' },
    ],
  },
  {
    id: 'glass',
    title: 'Sandblasted glass',
    description: 'A perfect combination of modern design and privacy.',
    seeAllHref: 'https://www.drutex.eu/en/products/addons/type/272/',
    items: [
      { name: 'Sandblasted patterns (24 options)', image: '/assets/additional-options/glass-sandblasted-1.webp' },
    ],
  },
  {
    id: 'spacers',
    title: 'Spacers',
    description: 'The latest generation of spacers ensuring thermal comfort.',
    seeAllHref: 'https://www.drutex.eu/en/products/addons/type/5/',
    items: [
      { name: 'Swisspacer Ultimate', image: '/assets/additional-options/spacer-swisspacer.webp' },
    ],
  },
  {
    id: 'ventilation',
    title: 'Ventilation',
    description: 'Ensure healthy air and optimal humidity in your home.',
    seeAllHref: 'https://www.drutex.eu/en/products/addons/type/2/',
    items: [
      { name: 'Aereco AMO',          image: '/assets/additional-options/vent-aereco-amo.webp' },
      { name: 'Awenta Slimline 2000', image: '/assets/additional-options/vent-awenta-slimline.webp' },
      { name: 'Ventair Simpress',    image: '/assets/additional-options/vent-ventair-simpress.webp' },
      { name: 'Aereco 2MR',          image: '/assets/additional-options/vent-aereco-2mr.webp' },
      { name: 'Brookvent SM HY',     image: '/assets/additional-options/vent-brookvent-sm-hy.webp' },
    ],
  },
  {
    id: 'sill',
    title: 'Window sill PVC',
    description: 'Over 30 veneer colours to choose from.',
    seeAllHref: 'https://www.drutex.eu/en/products/addons/type/429/',
    items: [
      { name: 'Window sill 150 mm', image: '/assets/additional-options/sill-150mm.webp' },
    ],
  },
]

const AO_PER_PAGE = 3

function AdditionalOptionSlider({ items }: { items: { name: string; image: string }[] }) {
  const [page, setPage] = useState(0)
  const totalPages = Math.ceil(items.length / AO_PER_PAGE)
  const visible = items.slice(page * AO_PER_PAGE, page * AO_PER_PAGE + AO_PER_PAGE)

  return (
    <div className="flex-1 relative flex items-center gap-3">
      {totalPages > 1 && (
        <button
          onClick={() => setPage(p => (p - 1 + totalPages) % totalPages)}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center border border-[#3a3a3b] text-white/60 hover:text-[#dca95c] hover:border-[#dca95c] transition-colors duration-200"
          aria-label="Previous"
        >
          <ChevronLeft size={16} />
        </button>
      )}

      <div className="flex-1 grid grid-cols-3 gap-4">
        {visible.map((item, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="w-full aspect-square bg-[#111112] border border-[#2a2a2b] overflow-hidden flex items-center justify-center p-3">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
              />
            </div>
            <p className="text-white/60 text-[11px] text-center leading-tight px-1 whitespace-pre-line">{item.name}</p>
          </div>
        ))}
        {Array.from({ length: AO_PER_PAGE - visible.length }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
      </div>

      {totalPages > 1 && (
        <button
          onClick={() => setPage(p => (p + 1) % totalPages)}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center border border-[#3a3a3b] text-white/60 hover:text-[#dca95c] hover:border-[#dca95c] transition-colors duration-200"
          aria-label="Next"
        >
          <ChevronRight size={16} />
        </button>
      )}

      {totalPages > 1 && (
        <div className="absolute -bottom-5 left-0 right-0 flex justify-center gap-1.5">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className="w-1.5 h-1.5 rounded-full transition-colors duration-200"
              style={{ background: i === page ? '#dca95c' : 'rgba(255,255,255,0.2)' }}
              aria-label={`Page ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function AdditionalOptionsSection() {
  return (
    <section className="py-16 border-b border-[#2a2a2b]" style={{ background: 'linear-gradient(180deg, #111112 0%, #0e0e0f 100%)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-2">Additional Options</h2>
        <p className="text-white/50 text-sm mb-12 max-w-2xl">
          Enhance and personalise your IGLO EDGE with our wide range of certified accessories and add-ons.
        </p>

        <div className="space-y-10">
          {ADDITIONAL_OPTIONS.map(group => (
            <div key={group.id} className="flex gap-8 border-b border-[#2a2a2b] pb-10 last:border-0 last:pb-0">
              {/* Left: info panel */}
              <div className="w-56 flex-shrink-0">
                <h3 className="text-white font-black text-lg uppercase leading-tight mb-2">{group.title}</h3>
                <p className="text-white/50 text-xs leading-relaxed mb-4">{group.description}</p>
                <a
                  href={group.seeAllHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-[#dca95c] text-black text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 hover:bg-[#eab676] transition-colors"
                >
                  See all
                </a>
              </div>

              {/* Right: slider */}
              <AdditionalOptionSlider items={group.items} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function GlazingSection({ glassOptions }: { glassOptions: GlassOption[] }) {
  const [selected, setSelected] = useState<GlassOption>(glassOptions[0])

  return (
    <section className="py-16 border-b border-[#2a2a2b]">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-2">Glass</h2>
        <p className="text-white/50 text-sm mb-10 max-w-2xl">
          DRUTEX, with over 30 years of experience in the production of composite glass, offers a very wide range of glass with which you can fit your windows and doors. They meet strict requirements for energy efficiency and sound insulation. The offer also includes laminated glass (safe and burglar-proof), sun protected glass, glass with enhanced sound insulation, tempered, ornamental and sandblasted glass.
        </p>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Thumbnail grid — 4 columns, 5 rows */}
          <div className="flex-1 grid grid-cols-4 gap-3">
            {glassOptions.map(glass => (
              <button
                key={glass.id}
                onClick={() => setSelected(glass)}
                className="group flex flex-col items-center gap-1 text-left"
              >
                <div
                  className="w-full aspect-square overflow-hidden border-2 transition-all duration-200"
                  style={{ borderColor: selected.id === glass.id ? '#dca95c' : 'transparent' }}
                >
                  <img
                    src={glass.image}
                    alt={glass.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <span
                  className="text-[10px] text-center leading-tight transition-colors duration-200 w-full px-0.5"
                  style={{ color: selected.id === glass.id ? '#dca95c' : 'rgba(255,255,255,0.6)' }}
                >
                  {glass.name}
                </span>
              </button>
            ))}
          </div>

          {/* Large preview panel */}
          <div className="lg:w-[45%] flex-shrink-0 bg-[#1a1a1b] overflow-hidden">
            <img
              key={selected.id}
              src={selected.largeImage}
              alt={selected.name}
              className="w-full h-full object-cover"
              style={{ minHeight: '400px', maxHeight: '560px' }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  
  // For the MVP, we showcase the full complex layout only for Iglo Edge
  const isDetailed = slug === 'iglo-edge'
  const detailData = isDetailed ? IGLO_EDGE_DETAIL : null
  const basicData = PRODUCTS.find((p) => p.slug === slug)

  const [selectedColorId, setSelectedColorId] = useState(detailData?.colors[0]?.id || '')
  const [videoOpen, setVideoOpen] = useState(false)

  if (!detailData && !basicData) {
    return (
      <main className="min-h-screen bg-black pt-32 px-6 text-center">
        <h1 className="text-3xl font-black uppercase text-[#dca95c]">Product not found</h1>
        <Link to="/products" className="mt-6 inline-flex text-sm text-white/60 hover:text-white uppercase tracking-widest transition-colors">
          Return to products
        </Link>
      </main>
    )
  }

  // --- STANDARD LAYOUT BACKBACK (for non-Iglo-Edge products currently) ---
  if (!isDetailed && basicData) {
    return (
      <main className="bg-black min-h-screen pt-24 px-6 text-center pb-20">
        <h1 className="text-4xl font-black uppercase mb-4 text-white">{basicData.name}</h1>
        <p className="text-[#dca95c] mb-8">{basicData.tagline}</p>
        <p className="text-white/60 max-w-2xl mx-auto mb-10">{basicData.description}</p>
        <Link to={`/configurator?product=${basicData.slug}`} className="bg-[#dca95c] text-black px-8 py-4 font-bold uppercase tracking-widest hover:bg-[#eab676] transition-colors">
          Configure {basicData.name}
        </Link>
      </main>
    )
  }

  // --- DETAILED LAYOUT (Iglo Edge) ---
  if (!detailData) return null

  const selectedColor = detailData.colors.find(c => c.id === selectedColorId)

  return (
    <main className="bg-[#111112] min-h-screen pt-16">
      
      {/* 1. Hero Section (Full Width, matches the top section requested by user) */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black z-0">
          <video 
            src="/assets/iglo-edge-header-cover.mp4"
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111112] via-transparent to-[#111112]/50" />
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-7xl mx-auto flex flex-col items-center w-full">
          <h1 className="product-hero-title text-4xl md:text-5xl font-bold tracking-widest uppercase mb-3">
            {detailData.name}
          </h1>
          <p className="product-hero-tagline text-xl md:text-2xl font-light mb-10 tracking-wider">
            {detailData.tagline}
          </p>

          {/* Thin gold divider */}
          <div className="w-full border-t border-[#dca95c]/40 mb-10" />
          
          {/* Spec boxes — evenly distributed, no wrapping */}
          <div className="w-full flex justify-between items-start gap-2">
            {detailData.keySpecs.map((spec) => (
              <div key={spec.label} className="flex flex-col items-center gap-3 flex-1 min-w-0">
                {/* Box with interrupted border: full border + background color strips at top/bottom center to create gap effect */}
                <div className="relative flex items-center justify-center w-full" style={{ height: '56px' }}>
                  {/* Full border */}
                  <div className="absolute inset-0 border border-[#dca95c]" />
                  {/* Horizontal gap interruptions — thin bg strips at top and bottom center */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[1px]" style={{ background: '#111112' }} />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[1px]" style={{ background: '#111112' }} />
                  {/* Value text */}
                  <span className="product-hero-spec-value relative font-medium text-base md:text-lg whitespace-nowrap px-3">{spec.value}</span>
                </div>
                {/* Label */}
                <p className="product-hero-spec-label text-[9px] md:text-[10px] uppercase font-semibold tracking-[0.12em] text-center leading-tight w-full px-1">{spec.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Drutex Product Overview — mirrors the drutex.eu layout */}
      <section className="border-b border-[#2a2a2b]" style={{ background: 'linear-gradient(180deg, #111112 0%, #161617 100%)' }}>

        {/* Row A: Description + bullets (left) | Window photo (right) */}
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-12">
          <div className="grid lg:grid-cols-2 gap-16 items-start">

            {/* Left: text block */}
            <div>
              <span className="bg-[#dca95c] text-black text-[10px] font-bold uppercase tracking-widest px-2 py-1 mb-6 inline-block">Standard Equipment</span>
              <h2 className="text-4xl font-black text-white uppercase mb-6 leading-tight">
                IGLO EDGE
              </h2>
              <p className="product-overview-description leading-relaxed mb-8">
                {detailData.description}
              </p>
              <ul className="space-y-3 mb-10">
                {detailData.standardEquipment.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1 w-4 h-4 flex-shrink-0 rounded-full flex items-center justify-center" style={{ background: '#dca95c' }}>
                      <Check size={10} className="text-black" />
                    </span>
                    <span className="text-white/70 text-sm leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
              {/* Video CTA */}
              <button
                onClick={() => setVideoOpen(true)}
                className="flex items-center gap-3 text-sm text-white/70 hover:text-[#dca95c] transition-colors duration-200 group"
              >
                <span className="w-10 h-10 flex items-center justify-center border border-[#dca95c] text-[#dca95c] group-hover:bg-[#dca95c] group-hover:text-black transition-all duration-200">
                  <Play size={16} fill="currentColor" />
                </span>
                <span className="uppercase tracking-widest font-semibold text-xs">See video</span>
              </button>
            </div>

            {/* Right: window-opening video */}
            <div className="overflow-hidden border border-[#2a2a2b] bg-[#0e0e0f]">
              <video
                src="/assets/iglo-edge-okno-window-opening.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
                style={{ minHeight: '360px' }}
              />
            </div>
          </div>
        </div>

        {/* Row B: 3D flip card — front = profile photo, back = technical drawing */}
        <div className="max-w-7xl mx-auto px-6 pb-20">
          <p className="text-white/30 text-xs uppercase tracking-widest mb-4 text-center">Hover to reveal technical drawing</p>
          <div
            style={{
              perspective: '1200px',
              height: '480px',
              maxWidth: '680px',
              margin: '0 auto',
            }}
            className="group"
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                transformStyle: 'preserve-3d',
                transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              className="group-hover:[transform:rotateY(180deg)]"
            >
              {/* Front: profile cross-section photo */}
              <div
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                className="absolute inset-0 bg-[#1a1a1b] border border-[#2a2a2b] flex items-center justify-center p-10"
              >
                <img
                  src={detailData.profileImage}
                  alt="IGLO EDGE profile cross-section"
                  className="w-full h-full object-contain"
                />
                <span className="absolute bottom-4 right-4 text-[10px] text-white/30 uppercase tracking-widest">Profile</span>
              </div>

              {/* Back: technical drawing */}
              <div
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
                className="absolute inset-0 bg-white flex items-center justify-center p-10"
              >
                <img
                  src={detailData.blueprintImage}
                  alt="IGLO EDGE technical drawing"
                  className="w-full h-full object-contain"
                />
                <span className="absolute bottom-4 right-4 text-[10px] text-black/40 uppercase tracking-widest">Technical Drawing</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video modal */}
      {videoOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setVideoOpen(false)}
        >
          <div className="relative w-full max-w-4xl mx-6" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setVideoOpen(false)}
              className="absolute -top-10 right-0 text-white/70 hover:text-[#dca95c] transition-colors"
            >
              <X size={24} />
            </button>
            <video
              src={detailData.videoSrc}
              autoPlay
              controls
              className="w-full rounded-sm shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* 3. Profile Specs Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-b border-[#2a2a2b]">
        <div className="max-w-2xl">
          <span className="bg-[#dca95c] text-black text-[10px] font-bold uppercase tracking-widest px-2 py-1 mb-6 inline-block">New Generation</span>
          <h2 className="text-4xl font-black text-white uppercase mb-6 leading-tight">
            Uncompromising Quality &amp; Thermal Performance
          </h2>
          <ul className="space-y-4">
            {detailData.keySpecs.map(spec => (
              <li key={spec.label} className="flex items-center gap-3 border-b border-[#2a2a2b] pb-3">
                <Check size={16} className="text-[#dca95c] shrink-0" />
                <span className="text-white/70 text-sm">{spec.label}</span>
                <span className="text-white font-bold text-sm ml-auto">{spec.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3. Interactive Color Swatch Section */}
      <section className="bg-[#1a1a1b] border-b border-[#2a2a2b] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-4">Colors & Finishes</h2>
            <p className="text-white/50 max-w-2xl mx-auto">Customize your {detailData.name} with over {detailData.colors.length} premium finishes, ranging from modern architectural solids to hyper-realistic woodgrains.</p>
          </div>

          <div className="grid lg:grid-cols-12 gap-12">
            {/* Window Preview (Left) */}
            <div className="lg:col-span-5 bg-[#111112] border border-[#2a2a2b] flex flex-col items-center justify-center p-12 min-h-[500px] relative overflow-hidden">
              
              {/* Dynamic Window Frame Render */}
              <div className="relative w-full max-w-sm flex items-center justify-center mb-8 px-4">
                <img 
                  src={selectedColor?.windowImage || "/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp"} 
                  alt={`${selectedColor?.name || 'White'} Window Frame`} 
                  className="w-full h-auto object-contain z-20 transition-opacity duration-500"
                />
              </div>
              
              <div className="absolute text-white/20 text-xs font-bold tracking-widest z-30 bg-black/50 px-3 py-1 uppercase rounded-sm backdrop-blur-sm -bottom-4">PREVIEW</div>
              
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center text-xs z-40">
                <span className="text-white/40 uppercase tracking-widest border border-white/10 px-3 py-1 bg-black/80 rounded-sm">Selected Finish</span>
                <span className="text-[#dca95c] font-black uppercase tracking-widest drop-shadow-md">{selectedColor?.name}</span>
              </div>
            </div>

            {/* Color Selector (Right) */}
            <div className="lg:col-span-7 bg-[#111112] border border-[#2a2a2b] p-8 lg:p-12">
              <ColorSwatch 
                colors={detailData.colors}
                selectedColorId={selectedColorId}
                onColorSelect={(color) => setSelectedColorId(color.id)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Full-width Color Banner */}
      <div 
        className="w-full flex flex-col items-center justify-center text-center relative overflow-hidden transition-all duration-500"
        style={{
          backgroundImage: selectedColor?.image ? `url(${selectedColor.image})` : 'none',
          backgroundColor: selectedColor?.hex || '#1a1a1b',
          backgroundSize: 'auto',
          backgroundPosition: 'left top',
          backgroundRepeat: 'repeat',
          minHeight: '120px',
          padding: '24px 0',
        }}
      >
        <div className="relative z-10 text-white" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.7)' }}>
          <p className="text-sm font-normal opacity-90 mb-1">Selected color:</p>
          <p className="text-lg font-bold tracking-wide">{selectedColor?.name}</p>
          <p className="text-xs opacity-80 mt-0.5 tracking-widest">{selectedColor?.id}</p>
        </div>
      </div>

      {/* 4. Glass Options Grid */}
      <GlazingSection glassOptions={detailData.glassOptions} />

      {/* 5. Handles Slider */}
      <HandlesSlider />

      {/* 6. Additional Options */}
      <AdditionalOptionsSection />

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-md border-t border-[#2a2a2b] p-4 z-40 transform translate-y-0 transition-transform">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="hidden md:block">
            <span className="text-white font-black tracking-widest uppercase mr-4">{detailData.name}</span>
            <span className="text-white/40 text-xs uppercase tracking-widest">{selectedColor?.name}</span>
          </div>
          <div className="flex w-full md:w-auto gap-4">
             <Link 
               to={`/configurator?product=${detailData.slug}&color=${selectedColor?.hex?.replace('#', '')}`}
               className="flex-1 md:flex-none bg-[#dca95c] text-black px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#eab676] transition-colors text-center"
             >
               Configure Product & Quote
             </Link>
          </div>
        </div>
      </div>
      
    </main>
  )
}
