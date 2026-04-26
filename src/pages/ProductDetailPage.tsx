import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Check, ChevronLeft, ChevronRight, Play, X } from 'lucide-react'
import * as ProductDetailsData from '../data/productDetails'
import type { GlassOption, ProductDetailData } from '../data/productDetails'
import { PRODUCTS } from '../data/products'
import { ColorSwatch } from '../components/products/ColorSwatch'
import { useTranslation } from 'react-i18next'


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
  const { t } = useTranslation()
  const [page, setPage] = useState(0)
  const totalPages = Math.ceil(HANDLES.length / PER_PAGE)
  const visible = HANDLES.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE)

  return (
    <section className="py-16 border-b border-gray-200" style={{ background: 'white' }}>
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-black text-black uppercase tracking-widest mb-2">{t('productDetail.handlesTitle')}</h2>
        <p className="!text-gray-600 text-sm mb-10 max-w-2xl">
          {t('productDetail.handlesDesc')}
        </p>
        <div className="relative flex items-center gap-4">
          <button
            onClick={() => setPage(p => (p - 1 + totalPages) % totalPages)}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center border border-gray-200 text-gray-600 hover:text-mammut-gold hover:border-mammut-gold transition-colors duration-200"
            aria-label="Previous"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1 grid grid-cols-5 gap-4">
            {visible.map(handle => (
              <div key={handle.name} className="flex flex-col items-center gap-3">
                <div className="w-full aspect-square flex items-end justify-center overflow-hidden bg-white">
                  <img src={handle.image} alt={t(`sliderHandles.${handle.name}`)} className="w-full h-full object-contain hover:scale-105 transition-transform duration-300" />
                </div>
                <p className="!text-gray-600 text-[11px] text-center leading-tight px-1">{t(`sliderHandles.${handle.name}`)}</p>
              </div>
            ))}
            {Array.from({ length: PER_PAGE - visible.length }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
          </div>
          <button
            onClick={() => setPage(p => (p + 1) % totalPages)}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center border border-gray-200 text-gray-600 hover:text-mammut-gold hover:border-mammut-gold transition-colors duration-200"
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
              style={{ background: i === page ? '#eab676' : 'rgba(0,0,0,0.2)' }}
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
    seeAllHref: '/products/addons/type/602',
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
    seeAllHref: '/products/addons/type/4',
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
    seeAllHref: '/products/addons/type/6',
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
    seeAllHref: '/products/addons/type/272',
    items: [
      { name: 'Sandblasted patterns (24 options)', image: '/assets/additional-options/glass-sandblasted-1.webp' },
    ],
  },
  {
    id: 'spacers',
    title: 'Spacers',
    description: 'Galvanised steel frame is the standard. However It is possible to choose the Swisspacer Ultimate warm frame.',
    seeAllHref: '/products/addons/type/5',
    items: [
      { name: 'Galvanised steel (standard)', image: '/assets/additional-options/spacer-steel.webp' },
      { name: 'Swisspacer Ultimate Gray RAL 9023', image: '/assets/additional-options/spacer-swisspacer-gray.webp' },
      { name: 'Swisspacer Ultimate Light brown RAL 8003', image: '/assets/additional-options/spacer-swisspacer-lbrown.webp' },
      { name: 'Swisspacer Ultimate White RAL 9016', image: '/assets/additional-options/spacer-swisspacer-white.webp' },
      { name: 'Swisspacer Ultimate Dark brown RAL 8014', image: '/assets/additional-options/spacer-swisspacer-dbrown.webp' },
      { name: 'Swisspacer Ultimate Black RAL 9005', image: '/assets/additional-options/spacer-swisspacer-black.webp' },
      { name: 'Swisspacer Ultimate Light gray RAL 7035', image: '/assets/additional-options/spacer-swisspacer-lgray.webp' },
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
  {
    id: 'shutters',
    title: 'Roller Shutters',
    description: 'Protect your home with integrated external roller shutters.',
    seeAllHref: 'https://www.drutex.eu/en/products/roller-shutters/',
    items: [
      { name: 'PVC Roller Shutter', image: '/assets/placeholder-shutter.jpg' },
      { name: 'External Aluminum Shutter', image: '/assets/placeholder-shutter.jpg' },
    ],
  },
  {
    id: 'mosquito-nets',
    title: 'Mosquito Nets',
    description: 'Keep insects out while letting fresh air in.',
    seeAllHref: 'https://www.drutex.eu/en/products/addons/',
    items: [
      { name: 'Fixed Frame Mosquito Net', image: '/assets/placeholder-window.jpg' },
      { name: 'Integrated Roll-up Net', image: '/assets/placeholder-window.jpg' },
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
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center border border-gray-200 text-gray-600 hover:text-mammut-gold hover:border-mammut-gold transition-colors duration-200"
          aria-label="Previous"
        >
          <ChevronLeft size={16} />
        </button>
      )}

      <div className="flex-1 grid grid-cols-3 gap-4">
        {visible.map((item, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="w-full aspect-square bg-white border border-gray-200 overflow-hidden flex items-center justify-center p-3">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
              />
            </div>
            <p className="!text-gray-600 text-[11px] text-center leading-tight px-1 whitespace-pre-line">{item.name}</p>
          </div>
        ))}
        {Array.from({ length: AO_PER_PAGE - visible.length }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
      </div>

      {totalPages > 1 && (
        <button
          onClick={() => setPage(p => (p + 1) % totalPages)}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center border border-gray-200 text-gray-600 hover:text-mammut-gold hover:border-mammut-gold transition-colors duration-200"
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
              style={{ background: i === page ? '#eab676' : 'rgba(0,0,0,0.2)' }}
              aria-label={`Page ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function AdditionalOptionsSection() {
  const { t } = useTranslation()

  return (
    <section className="py-16 border-b border-gray-200" style={{ background: 'white' }}>
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-black text-black uppercase tracking-widest mb-2">{t('productDetail.optionsTitle')}</h2>
        <p className="!text-gray-600 text-sm mb-12 max-w-2xl">
          {t('productDetail.optionsDesc')}
        </p>

        <div className="space-y-10">
          {ADDITIONAL_OPTIONS.map(group => (
            <div key={group.id} className="flex gap-8 border-b border-gray-200 pb-10 last:border-0 last:pb-0">
              {/* Left: info panel */}
              <div className="w-56 flex-shrink-0">
                <h3 className="text-black font-black text-lg uppercase leading-tight mb-2">{t(`productDetail.additionalOptions.${group.id}.title`, { defaultValue: group.title })}</h3>
                <p className="!text-gray-600 text-xs leading-relaxed mb-4">{t(`productDetail.additionalOptions.${group.id}.description`, { defaultValue: group.description })}</p>
                <Link
                  to={group.seeAllHref}
                  className="inline-block bg-mammut-gold text-black text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 hover:bg-[#F3C47F] transition-colors"
                >
                  {t('productDetail.seeAll')}
                </Link>
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
  const { t } = useTranslation()
  const [selected, setSelected] = useState<GlassOption>(glassOptions[0])

  return (
    <section className="bg-mammut-black border-y border-mammut-border py-16">
      <div className="max-w-7xl mx-auto px-6 text-left">
        <h2 className="text-3xl font-black text-mammut-white uppercase tracking-widest mb-4 flex items-center gap-4">
          {t('productDetail.glassTitle')}
        </h2>
        <p className="!text-white text-base font-medium mb-10 max-w-3xl leading-relaxed opacity-100">
          {t('productDetail.glassDesc')}
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
                  style={{ borderColor: selected.id === glass.id ? '#eab676' : 'transparent' }}
                >
                  <img
                    src={glass.image}
                    alt={t(`glass.${glass.id}`)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <span
                  className="text-[10px] text-center leading-tight transition-colors duration-200 w-full px-0.5"
                  style={{ color: selected.id === glass.id ? '#eab676' : 'rgba(255,255,255,0.6)' }}
                >
                  {t(`glass.${glass.id}`)}
                </span>
              </button>
            ))}
          </div>

          {/* Large preview panel */}
          <div className="lg:w-[45%] flex-shrink-0 bg-mammut-dark overflow-hidden">
            <img
              key={selected.id}
              src={selected.largeImage}
              alt={t(`glass.${selected.id}`)}
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
  const { t } = useTranslation()
  const { slug } = useParams<{ slug: string }>()
  // Get detail data dynamically
  const allDetails = Object.values(ProductDetailsData).filter(v => v && typeof v === 'object' && 'slug' in v) as ProductDetailData[];
  const detailData = allDetails.find(d => d.slug === slug) || null;
  const isDetailed = !!detailData;
  const basicData = PRODUCTS.find((p) => p.slug === slug)

  const [selectedColorId, setSelectedColorId] = useState(detailData?.colors[0]?.id || '')
  const [videoOpen, setVideoOpen] = useState(false)

  if (!detailData && !basicData) {
    return (
      <main className="min-h-screen bg-mammut-black pt-32 px-6 text-center">
        <h1 className="text-3xl font-black uppercase text-mammut-gold">{t('productDetail.notFound')}</h1>
        <Link to="/products" className="mt-6 inline-flex text-sm text-mammut-white/60 hover:text-mammut-white uppercase tracking-widest transition-colors">
          {t('productDetail.return')}
        </Link>
      </main>
    )
  }

  // --- STANDARD LAYOUT BACKBACK (for non-Iglo-Edge products currently) ---
  if (!isDetailed && basicData) {
    return (
      <main className="bg-mammut-black min-h-screen pt-24 px-6 text-center pb-20">
        <h1 className="text-4xl font-black uppercase mb-4 text-mammut-white">{basicData.name}</h1>
        <p className="text-mammut-gold mb-8">{basicData.tagline}</p>
        <p className="text-mammut-white/60 max-w-2xl mx-auto mb-10">{basicData.description}</p>
        <Link to={`/configurator?product=${basicData.slug}`} className="bg-mammut-gold text-black px-8 py-4 font-bold uppercase tracking-widest hover:bg-[#F3C47F] transition-colors">
          {t('productDetail.configure', { name: basicData.name })}
        </Link>
      </main>
    )
  }

  // --- DETAILED LAYOUT (Iglo Edge) ---
  if (!detailData) return null

  const selectedColor = detailData.colors.find(c => c.id === selectedColorId)

  return (
    <main className="bg-white min-h-screen pt-16">
      
      {/* 1. Hero Section (Full Width, matches the top section requested by user) */}
      <section className="relative h-[80vh] min-h-[600px] flex items-end justify-center pb-8 lg:pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-mammut-black z-0">
          <video 
            src="/assets/iglo-edge-header-cover.mp4"
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111112] via-transparent to-[#111112]/50" />
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-7xl mx-auto flex flex-col items-center w-full">
          <h1 className="product-hero-title text-4xl md:text-5xl font-bold tracking-widest uppercase mb-3">
            {t(`productData.${detailData.slug}.name`, { defaultValue: detailData.name })}
          </h1>
          <p className="product-hero-tagline text-xl md:text-2xl font-light mb-10 tracking-wider">
            {t(`productData.${detailData.slug}.tagline`, { defaultValue: detailData.tagline })}
          </p>

          {/* Thin gold divider */}
          <div className="w-full border-t border-mammut-gold/40 mb-10" />
          
          {/* Spec boxes — evenly distributed, gracefully wrapping on mobile */}
          <div className="w-full flex flex-wrap justify-center items-start gap-4 md:gap-6">
            {detailData.keySpecs.map((spec) => (
              <div key={spec.label} className="flex flex-col items-center gap-3 w-[45%] sm:w-[30%] lg:w-auto lg:flex-1 min-w-[120px]">
                {/* Box with interrupted border: full border + background color strips at top/bottom center to create gap effect */}
                <div className="relative flex items-center justify-center w-full" style={{ height: '56px' }}>
                  {/* Full border */}
                  <div className="absolute inset-0 border border-mammut-gold" />
                  {/* Horizontal gap interruptions — thin bg strips at top and bottom center */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[1px]" style={{ background: '#111112' }} />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[1px]" style={{ background: '#111112' }} />
                  {/* Value text */}
                  <span className="product-hero-spec-value relative font-medium text-base md:text-lg whitespace-nowrap px-3">{spec.value}</span>
                </div>
                <p className="product-hero-spec-label text-[9px] md:text-[10px] uppercase font-semibold tracking-[0.12em] text-center leading-tight w-full px-1">{t(`productData.${detailData.slug}.specs.${spec.label}`, { defaultValue: t(`igloEdge.specs.${spec.label}`) })}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Drutex Product Overview — mirrors the drutex.eu layout */}
      <section className="border-b border-gray-200" style={{ background: 'white' }}>

        {/* Row A: Description + bullets (left) | Window photo (right) */}
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-12">
          <div className="grid lg:grid-cols-2 gap-16 items-start">

            {/* Left: text block */}
            <div>
              <span className="bg-mammut-gold text-black text-[10px] font-bold uppercase tracking-widest px-2 py-1 mb-6 inline-block">{t('productDetail.standardEquipment')}</span>
              <h2 className="text-4xl font-black text-black uppercase mb-6 leading-tight">
                {t(`productData.${detailData.slug}.name`, { defaultValue: detailData.name })}
              </h2>
              <p className="product-overview-description leading-relaxed mb-8 whitespace-pre-line text-gray-600">
                {t(`productData.${detailData.slug}.description`, { defaultValue: detailData.description })}
              </p>
              <ul className="space-y-3 mb-10 text-gray-600">
                {(t(`productData.${detailData.slug}.standardEquipment`, { returnObjects: true, defaultValue: detailData.standardEquipment }) as string[]).map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1 w-4 h-4 flex-shrink-0 rounded-full flex items-center justify-center" style={{ background: '#eab676' }}>
                      <Check size={10} className="text-black" />
                    </span>
                    <span className="text-gray-600 text-sm leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
              {/* Video CTA */}
              <button
                onClick={() => setVideoOpen(true)}
                className="flex items-center gap-3 text-sm text-gray-600 hover:text-mammut-gold transition-colors duration-200 group"
              >
                <span className="w-10 h-10 flex items-center justify-center border border-mammut-gold text-mammut-gold group-hover:bg-mammut-gold group-hover:text-black transition-all duration-200">
                  <Play size={16} fill="currentColor" />
                </span>
                <span className="uppercase tracking-widest font-semibold text-xs">{t('productDetail.seeVideo')}</span>
              </button>
            </div>

            {/* Right: window-opening video */}
            <div className="overflow-hidden border border-gray-200 bg-[#0e0e0f]">
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
          <p className="text-gray-600 text-xs uppercase tracking-widest mb-4 text-center">{t('productDetail.hoverDrawing')}</p>
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
                className="absolute inset-0 bg-white border border-gray-200 flex items-center justify-center p-10"
              >
                <img
                  src={detailData.profileImage}
                  alt="IGLO EDGE profile cross-section"
                  className="w-full h-full object-contain"
                />
                <span className="absolute bottom-4 right-4 text-[10px] text-gray-600 uppercase tracking-widest">{t('productDetail.profile')}</span>
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
                <span className="absolute bottom-4 right-4 text-[10px] text-black/40 uppercase tracking-widest">{t('productDetail.technicalDrawing')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video modal */}
      {videoOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm"
          onClick={() => setVideoOpen(false)}
        >
          <div className="relative w-full max-w-4xl mx-6" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setVideoOpen(false)}
              className="absolute -top-10 right-0 text-gray-600 hover:text-mammut-gold transition-colors"
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
      <section className="max-w-7xl mx-auto px-6 py-24 border-b border-gray-200">
        <div className="max-w-2xl">
          <span className="bg-mammut-gold text-black text-[10px] font-bold uppercase tracking-widest px-2 py-1 mb-6 inline-block">{t('productDetail.newGeneration')}</span>
          <h2 className="text-4xl font-black text-black uppercase mb-6 leading-tight">
            {t('productDetail.uncompromising')}
          </h2>
          <ul className="space-y-4">
            {detailData.keySpecs.map(spec => (
              <li key={spec.label} className="flex items-center gap-3 border-b border-gray-200 pb-3">
                <Check size={16} className="text-mammut-gold shrink-0" />
                <span className="text-gray-600 text-sm">{t(`productData.${detailData.slug}.specs.${spec.label}`, { defaultValue: t(`igloEdge.specs.${spec.label}`) })}: {spec.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3. Interactive Color Swatch Section */}
      <section className="bg-white border-b border-gray-200 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-left mb-16">
            <h2 className="text-3xl font-black text-black uppercase tracking-widest mb-4 flex items-center gap-4">
              {t('productDetail.colorsTitle')}
            </h2>
            <p className="!text-gray-600 max-w-3xl leading-relaxed">{t('productDetail.colorsDesc', { count: detailData.colors.length, name: detailData.name })}</p>
          </div>

          <div className="grid lg:grid-cols-12 gap-12">
            {/* Window Preview (Left) */}
            <div className="lg:col-span-5 bg-white border border-gray-200 flex flex-col items-center justify-center p-12 min-h-[500px] relative overflow-hidden">
              
              {/* Dynamic Window Frame Render */}
              <div className="relative w-full max-w-sm flex items-center justify-center mb-8 px-4">
                <img 
                  src={selectedColor?.windowImage || "/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp"} 
                  alt={`${selectedColor ? t(`colors.${selectedColor.id}`) : 'White'} Window Frame`} 
                  className="w-full h-auto object-contain z-20 transition-opacity duration-500"
                />
              </div>
              
              <div className="absolute text-gray-300 text-xs font-bold tracking-widest z-30 bg-white/80 px-3 py-1 uppercase rounded-sm backdrop-blur-sm -bottom-4">{t('productDetail.preview')}</div>
              
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center text-xs z-40">
                <span className="text-gray-600 uppercase tracking-widest border border-black/10 px-3 py-1 bg-white/90 rounded-sm">{t('productDetail.selectedFinish')}</span>
                <span className="text-mammut-gold font-black uppercase tracking-widest drop-shadow-md">{selectedColor ? t(`colors.${selectedColor.id}`) : ''}</span>
              </div>
            </div>

            {/* Color Selector (Right) */}
            <div className="lg:col-span-7 bg-white border border-gray-200 p-8 lg:p-12">
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
          backgroundColor: selectedColor?.hex || '#f9fafb',
          backgroundSize: 'auto',
          backgroundPosition: 'left top',
          backgroundRepeat: 'repeat',
          minHeight: '120px',
          padding: '24px 0',
        }}
      >
        <div className="relative z-10 text-black" style={{ }}>
          <p className="!text-black text-sm font-normal opacity-90 mb-1">{t('productDetail.selectedColor')}</p>
          <p className="!text-black text-lg font-bold tracking-wide">{selectedColor ? t(`colors.${selectedColor.id}`) : ''}</p>
          <p className="!text-black text-xs opacity-80 mt-0.5 tracking-widest">{selectedColor?.id}</p>
        </div>
      </div>

      {/* 4. Glass Options Grid */}
      {detailData.glassOptions && detailData.glassOptions.length > 0 && (
        <GlazingSection glassOptions={detailData.glassOptions} />
      )}

      {/* 5. Handles Slider */}
      <HandlesSlider />

      {/* 6. Additional Options */}
      <AdditionalOptionsSection />

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 p-4 z-40 transform translate-y-0 transition-transform">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="hidden md:block">
            <span className="text-black font-black tracking-widest uppercase mr-4">{detailData.name}</span>
            <span className="text-gray-600 text-xs uppercase tracking-widest">{selectedColor ? t(`colors.${selectedColor.id}`) : ''}</span>
          </div>
          <div className="flex w-full md:w-auto gap-4">
             <Link 
               to={`/configurator?product=${detailData.slug}&color=${selectedColor?.hex?.replace('#', '')}`}
               className="flex-1 md:flex-none bg-mammut-gold text-black px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#F3C47F] transition-colors text-center"
             >
               {t('productDetail.configureQuote')}
             </Link>
          </div>
        </div>
      </div>
      
    </main>
  )
}
