import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Check, ChevronLeft, ChevronRight, Play, X, Search } from 'lucide-react'
import * as ProductDetailsData from '../data/productDetails'
import type { GlassOption, ProductDetailData } from '../data/productDetails'
import { PRODUCTS } from '../data/products'
import { ColorSwatch } from '../components/products/ColorSwatch'
import { DoorColorPresenter } from '../components/products/DoorColorPresenter'
import { VenetianBlindsColorPicker } from '../components/products/VenetianBlindsColorPicker'
import { ProductComparison } from '../components/products/ProductComparison'
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

const PER_PAGE = 4

function HandlesSlider({ hardware }: { hardware?: { id: string; name: string; image: string; type: string }[] }) {
  const { t } = useTranslation()
  const [page, setPage] = useState(0)
  const activeHandles = hardware && hardware.length > 0 ? hardware.map(h => ({ name: h.id, label: h.name, image: h.image })) : HANDLES
  const totalPages = Math.ceil(activeHandles.length / PER_PAGE)
  const visible = activeHandles.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE)

  const title = hardware && hardware.length > 0 ? t('productDetail.doorHandlesTitle', { defaultValue: 'Door handles and pull bars' }) : t('productDetail.handlesTitle')
  const desc = hardware && hardware.length > 0 ? t('productDetail.doorHandlesDesc', { defaultValue: 'Our handles for windows, doors and terrace systems made of PVC, aluminium and wood are distinguished by their high aesthetics, functionality and durability. Thanks to various colour options, they can be perfectly matched colour of the windows, doors, or the colour scheme of the building.' }) : t('productDetail.handlesDesc')

  return (
    <section className="py-20" style={{ background: '#111111' }}>
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-[28px] font-bold text-white mb-2">{title}</h2>
        <p className="!text-gray-400 text-sm mb-12 max-w-3xl leading-relaxed">
          {desc}
        </p>
        <div className="relative flex items-center gap-6">
          <button
            onClick={() => setPage(p => (p - 1 + totalPages) % totalPages)}
            className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border border-gray-600 text-gray-400 hover:text-white hover:border-white transition-all duration-300"
            aria-label="Previous"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-6">
            {visible.map(handle => (
              <div key={handle.name} className="flex flex-col w-full group">
                {/* Image Container with Gradient */}
                <div className={`w-full aspect-[3/4] flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#333333] to-[#1a1a1a] ${handle.image && handle.image.endsWith('.webp') ? '' : 'p-6'}`}>
                  {handle.image ? (
                    <img 
                      src={handle.image} 
                      alt={t(`sliderHandles.${handle.name}`, { defaultValue: handle.label })} 
                      className={`w-full h-full drop-shadow-2xl group-hover:scale-105 transition-transform duration-500 ${handle.image.endsWith('.webp') ? 'object-cover' : 'object-contain'}`} 
                    />
                  ) : (
                    <span className="text-gray-500 text-xs">No image</span>
                  )}
                </div>
                {/* Separator Line */}
                <div className="w-full border-b border-gray-600 mt-0"></div>
                {/* Label */}
                <p className="text-white text-xs text-center mt-4 px-2 tracking-wide font-light leading-snug">
                  {t(`sliderHandles.${handle.name}`, { defaultValue: handle.label })}
                </p>
              </div>
            ))}
            {Array.from({ length: PER_PAGE - visible.length }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
          </div>

          <button
            onClick={() => setPage(p => (p + 1) % totalPages)}
            className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border border-gray-600 text-gray-400 hover:text-white hover:border-white transition-all duration-300"
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
              style={{ background: i === page ? '#eab676' : 'rgba(255,255,255,0.2)' }}
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
    description: 'Express your unique style on your windows and doors. We offer the possibility of creating any sandblasting pattern in three shades of gray.',
    seeAllHref: '/products/addons/type/272',
    items: [
      { name: 'Example 1', image: '/assets/additional-options/sandblasted-1.webp' },
      { name: 'Example 2', image: '/assets/additional-options/sandblasted-2.webp' },
      { name: 'Example 3', image: '/assets/additional-options/sandblasted-3.webp' },
      { name: 'Example 4', image: '/assets/additional-options/sandblasted-4.webp' },
      { name: 'Example 5', image: '/assets/additional-options/sandblasted-5.webp' },
      { name: 'Example 6', image: '/assets/additional-options/sandblasted-6.webp' },
      { name: 'Example 7', image: '/assets/additional-options/sandblasted-7.webp' },
      { name: 'Example 8', image: '/assets/additional-options/sandblasted-8.webp' },
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

function AdditionalOptionsSection({ options = ADDITIONAL_OPTIONS, hideHeader = false }: { options?: typeof ADDITIONAL_OPTIONS, hideHeader?: boolean }) {
  const { t } = useTranslation()

  return (
    <section className="py-16 border-b border-gray-200" style={{ background: 'white' }}>
      <div className="max-w-7xl mx-auto px-6">
        {!hideHeader && (
          <>
            <h2 className="text-3xl font-black text-black uppercase tracking-widest mb-2">{t('productDetail.optionsTitle')}</h2>
            <p className="!text-gray-600 text-sm mb-12 max-w-2xl">
              {t('productDetail.optionsDesc')}
            </p>
          </>
        )}

        <div className="space-y-10">
          {options.map(group => (
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
  const [viewMode, setViewMode] = useState<'indoor' | 'outdoor' | 'profile' | 'window'>('window')
  const [videoOpen, setVideoOpen] = useState(false)
  const [infillOpen, setInfillOpen] = useState<string | null>(null)

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

  const activeColors = viewMode === 'indoor' ? detailData.colors : (detailData.outdoorColors || detailData.colors)
  const selectedColor = activeColors.find(c => c.id === selectedColorId) || activeColors[0]

  return (
    <main className="bg-white min-h-screen pt-16">
      
      {/* 1. Hero Section (Full Width, matches the top section requested by user) */}
      <section className="relative h-[80vh] min-h-[600px] flex items-end justify-center pb-8 lg:pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-mammut-black z-0">
          {detailData.videoSrc ? (
            <video 
              src={detailData.videoSrc}
              autoPlay 
              loop 
              muted 
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img 
              src={detailData.heroImage}
              alt={detailData.name}
              className="w-full h-full object-cover"
            />
          )}
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
                {/* Box with interrupted border: left and right brackets */}
                <div className="relative flex items-center justify-center px-6 min-w-[140px]" style={{ height: '56px' }}>
                  {/* Left bracket */}
                  <div className="absolute top-0 bottom-0 left-0 w-4 border-y border-l border-mammut-gold transition-colors" />
                  {/* Right bracket */}
                  <div className="absolute top-0 bottom-0 right-0 w-4 border-y border-r border-mammut-gold transition-colors" />
                  {/* Value text */}
                  <span className="product-hero-spec-value relative font-light text-xl md:text-2xl whitespace-nowrap text-white">{spec.value}</span>
                </div>
                <p className="product-hero-spec-label text-[9px] md:text-[10px] uppercase font-semibold tracking-[0.12em] text-center leading-tight w-full px-1">{t(`productData.${detailData.slug}.specs.${spec.label}`, { defaultValue: t(`igloEdge.specs.${spec.label}`, { defaultValue: spec.label }) })}</p>
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
              {(() => {
                const rawEq = t(`productData.${detailData.slug}.standardEquipment`, { returnObjects: true, defaultValue: detailData.standardEquipment });
                const equipment = Array.isArray(rawEq) ? rawEq : [];
                return (
                  <>
                    {equipment.length > 0 && (
                      <span className="bg-mammut-gold text-black text-[10px] font-bold uppercase tracking-widest px-2 py-1 mb-6 inline-block">{t('productDetail.standardEquipment')}</span>
                    )}
                    <h2 className="text-4xl font-black text-black uppercase mb-6 leading-tight">
                      {t(`productData.${detailData.slug}.name`, { defaultValue: detailData.name })}
                    </h2>
                    <p className="product-overview-description leading-relaxed mb-8 whitespace-pre-line text-gray-600">
                      {t(`productData.${detailData.slug}.description`, { defaultValue: detailData.description })}
                    </p>
                    {equipment.length > 0 && (
                      <ul className="space-y-3 mb-10 text-gray-600">
                        {equipment.map((item: string, i: number) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className="mt-1 w-4 h-4 flex-shrink-0 rounded-full flex items-center justify-center" style={{ background: '#eab676' }}>
                              <Check size={10} className="text-black" />
                            </span>
                            <span className="text-gray-600 text-sm leading-snug">
                              {item}
                              {detailData.equipmentVideoLink && detailData.equipmentVideoLink.afterItemMatch && item.toLowerCase().includes(detailData.equipmentVideoLink.afterItemMatch.toLowerCase()) && (
                                <button 
                                  onClick={() => setVideoOpen(true)}
                                  className="ml-3 inline-flex items-center gap-1 text-mammut-gold hover:text-[#F3C47F] text-xs font-bold uppercase tracking-wider transition-colors"
                                >
                                  <Play size={12} className="fill-current" />
                                  {detailData.equipmentVideoLink.label || "See Video"}
                                </button>
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                );
              })()}

              {detailData.relatedProductLink && (
                <Link 
                  to={detailData.relatedProductLink.url}
                  className="inline-block bg-mammut-gold text-black text-xs font-bold uppercase tracking-widest px-6 py-3 mt-6 mb-8 hover:bg-[#F3C47F] transition-colors"
                >
                  {t(`productData.${detailData.slug}.${detailData.relatedProductLink.text}`)}
                </Link>
              )}
              {detailData.relatedProductLinks && (
                <div className="flex flex-wrap gap-4 mt-6 mb-8">
                  {detailData.relatedProductLinks.map((link, idx) => (
                    <Link
                      key={idx}
                      to={link.url}
                      className="inline-block bg-mammut-gold text-black text-xs font-bold uppercase tracking-widest px-6 py-3 hover:bg-[#F3C47F] transition-colors"
                    >
                      {t(`productData.${detailData.slug}.${link.text}`)}
                    </Link>
                  ))}
                </div>
              )}

              {/* Video CTA */}
              {detailData.modalVideoSrc && (
                <button
                  onClick={() => setVideoOpen(true)}
                  className="flex items-center gap-3 text-sm text-gray-600 hover:text-mammut-gold transition-colors duration-200 group"
                >
                  <span className="w-10 h-10 flex items-center justify-center border border-mammut-gold text-mammut-gold group-hover:bg-mammut-gold group-hover:text-black transition-all duration-200">
                    <Play size={16} fill="currentColor" />
                  </span>
                  <span className="uppercase tracking-widest font-semibold text-xs">{t('productDetail.seeVideo')}</span>
                </button>
              )}
            </div>

            {/* Right: window-opening video or static image */}
            <div className="overflow-hidden border border-gray-200 bg-[#0e0e0f] flex items-center justify-center min-h-[360px]">
              {detailData.inlineImageSrc ? (
                <img
                  src={detailData.inlineImageSrc}
                  alt={detailData.name}
                  className="w-full h-full object-contain"
                  style={{ minHeight: '360px' }}
                />
              ) : (
                <video
                  src={detailData.inlineVideoSrc || "/assets/iglo-edge-okno-window-opening.mp4"}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  style={{ minHeight: '360px' }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Row B: 3D flip card or static image — front = profile photo, back = technical drawing (if available) */}
        { (detailData.profileImage || detailData.blueprintImage) && (
        <div className="max-w-7xl mx-auto px-6 pb-20">
          {detailData.blueprintImage && <p className="text-gray-600 text-xs uppercase tracking-widest mb-4 text-center">{t('productDetail.hoverDrawing')}</p>}
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
              className={detailData.blueprintImage ? "group-hover:[transform:rotateY(180deg)]" : ""}
            >
              {/* Front: profile cross-section photo */}
              <div
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                className="absolute inset-0 bg-white border border-gray-200 flex items-center justify-center p-10"
              >
                <img
                  src={detailData.profileImage}
                  alt={`${detailData.name} profile cross-section`}
                  className="w-full h-full object-contain"
                />
                <span className="absolute bottom-4 right-4 text-[10px] text-gray-600 uppercase tracking-widest">{t('productDetail.profile')}</span>
              </div>

              {/* Back: technical drawing (conditionally rendered) */}
              {detailData.blueprintImage && (
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
                    alt={`${detailData.name} technical drawing`}
                    className="w-full h-full object-contain"
                  />
                  <span className="absolute bottom-4 right-4 text-[10px] text-black/40 uppercase tracking-widest">{t('productDetail.technicalDrawing')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        )}

        {/* Profile Variants (e.g. for Monoblock) */}
        {detailData.profileVariants && detailData.profileVariants.length > 0 && (
          <div className="max-w-7xl mx-auto px-6 pb-12 pt-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {detailData.profileVariants.map((variant, idx) => (
                <div key={idx} className="flex flex-col items-center gap-3">
                  <div className="w-full bg-white border border-gray-200 p-6 flex items-center justify-center aspect-square hover:border-mammut-gold transition-colors duration-300">
                    <img src={variant.image} alt={variant.name} className="w-full h-full object-contain" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-800">{variant.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Welding Section (e.g. for IDEAL 7000 NL) */}
        {detailData.weldingSection && (
          <div className="max-w-7xl mx-auto px-6 pb-20 pt-8 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {detailData.weldingSection.videos.map((video, idx) => (
                <div key={idx} className="overflow-hidden border border-gray-200 bg-[#0e0e0f] flex items-center justify-center">
                  <video
                    src={video}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    style={{ minHeight: '300px' }}
                  />
                </div>
              ))}
            </div>
            <div className="text-gray-600 leading-relaxed text-sm max-w-4xl mx-auto text-center">
              {detailData.weldingSection.description}
            </div>
          </div>
        )}
      </section>

      {/* 2.5 Downloads (Moved up) */}
      {detailData.downloads && detailData.downloads.length > 0 && (
        <section className="py-16 bg-white border-b border-gray-100">
          <div className="container mx-auto px-6 max-w-7xl">
             <h2 className="text-2xl font-black uppercase mb-8 text-black tracking-widest text-left">
               {detailData.downloads[0].title || "Downloads"}
             </h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
               {detailData.downloads.map((dl, i) => (
                 <div key={i} className="flex flex-col border border-gray-200 bg-white group hover:border-mammut-gold transition-colors duration-300">
                   <div className="p-8 flex items-center justify-center bg-gray-50 border-b border-gray-100 aspect-[4/3]">
                     <img src="/assets/pdf-icon.svg" alt="PDF" className="w-16 h-16 opacity-30 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                     {/* Fallback if no pdf icon */}
                     <div className="absolute flex flex-col items-center text-gray-300 group-hover:text-mammut-gold transition-colors">
                       <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                     </div>
                   </div>
                   <div className="p-6 flex flex-col items-center text-center flex-1">
                     <p className="text-[11px] font-bold text-black uppercase tracking-widest leading-snug mb-6">{dl.label}</p>
                     <a href={dl.fileUrl} target="_blank" rel="noopener noreferrer" className="mt-auto border border-gray-300 px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-600 hover:border-mammut-gold hover:text-mammut-gold transition-all duration-300 inline-flex items-center gap-2">
                       <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                       Download
                     </a>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </section>
      )}

      {/* 2.6 Lath Types (Venetian Blinds) */}
      {detailData.lathTypes && detailData.lathTypes.length > 0 && (
        <section className="py-16 bg-white border-b border-gray-100">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black uppercase mb-4 text-black tracking-widest">
                Choice of Lath Types – Venetian Blinds
              </h2>
              <p className="text-gray-600 text-sm uppercase tracking-widest">
                Available laths for exterior venetian blinds.
              </p>
            </div>
            
            <div className="flex flex-col gap-12">
              {detailData.lathTypes.map((lath, idx) => (
                <div key={idx} className={`flex flex-col md:flex-row items-center gap-8 ${idx % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                  <div className="flex-1">
                    <img src={lath.image} alt={lath.name} className="w-full h-auto object-cover border border-gray-200" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center px-4">
                    <h3 className="text-2xl font-black text-black uppercase tracking-widest mb-4 border-l-4 border-mammut-gold pl-4">{lath.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 2.7 Types of Venetian blinds */}
      {detailData.models && detailData.models.length > 0 && (
        <section className="py-16 bg-white border-b border-gray-100">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black uppercase mb-4 text-black tracking-widest">
                Types of Venetian blinds
              </h2>
              <p className="text-gray-600 text-sm uppercase tracking-widest">
                Choose the model that will meet your expectations.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {detailData.models.map((model, idx) => (
                <div key={idx} className="flex flex-col">
                  <div className="mb-6 overflow-hidden bg-gray-50 flex items-center justify-center p-4 border border-gray-100 h-64 hover:border-mammut-gold transition-colors duration-300">
                    <img src={model.image} alt={model.name} className="w-full h-full object-contain" />
                  </div>
                  <h3 className="text-xl font-black text-black uppercase tracking-widest mb-1 flex items-center gap-2">
                    {model.name} {model.isNew && <span className="text-[10px] bg-mammut-gold text-black px-2 py-0.5 tracking-wider">NEW</span>}
                  </h3>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">{model.subtitle}</p>
                  <p className="text-gray-600 text-sm mb-6 leading-relaxed">{model.dimensions}</p>
                  
                  <div className="mt-auto">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-black mb-4 border-b border-gray-200 pb-2">Technical data</h4>
                    <ul className="space-y-3">
                      {model.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-3">
                          <span className="mt-1.5 w-1.5 h-1.5 bg-mammut-gold flex-shrink-0" />
                          <span className="text-gray-600 text-sm leading-snug">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 2.8 Design of Venetian blinds */}
      {detailData.designOverview && (
        <section className="py-16 bg-gray-50 border-b border-gray-100 overflow-hidden">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-black uppercase mb-4 text-black tracking-widest">
                Design of Venetian blinds
              </h2>
              <p className="text-gray-600 text-sm uppercase tracking-widest">
                Highest quality materials ensure reliability.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              {/* Left: Image with hotspots and logos */}
              <div className="flex flex-col gap-8 sticky top-32">
                <div className="relative border border-gray-200 bg-white p-8 hover:border-mammut-gold transition-colors duration-500">
                  <img src={detailData.designOverview.image} alt="Design Overview" className="w-full h-auto object-contain mix-blend-multiply" />
                  {/* Hotspots */}
                  {detailData.designOverview.parts.map((part) => (
                    <div 
                      key={part.id} 
                      className="absolute w-8 h-8 -ml-4 -mt-4 bg-mammut-gold text-black font-bold flex items-center justify-center rounded-full shadow-lg border-2 border-white cursor-help hover:scale-110 transition-transform"
                      style={{ top: part.top, left: part.left }}
                      title={part.title}
                    >
                      {part.id}
                    </div>
                  ))}
                </div>
                {/* Logos */}
                <div className="flex flex-wrap items-center justify-center gap-8">
                  {detailData.designOverview.logos.map((logo, idx) => (
                    <img key={idx} src={logo} alt={`Partner Logo ${idx + 1}`} className="h-8 md:h-12 object-contain opacity-50 hover:opacity-100 transition-opacity" />
                  ))}
                </div>
              </div>
              
              {/* Right: Explanations List */}
              <div className="flex flex-col gap-6">
                {detailData.designOverview.parts.map((part) => (
                  <div key={part.id} className="bg-white border border-gray-200 p-6 hover:border-mammut-gold transition-colors group">
                    <h3 className="text-lg font-black text-black uppercase tracking-widest mb-3 flex items-center gap-3">
                      <span className="text-mammut-gold">{part.id}.</span> {part.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line mb-4">
                      {part.description}
                    </p>
                    {part.images && part.images.length > 0 && (
                      <div className="flex gap-4 mt-4">
                        {part.images.map((img, idx) => (
                          <div key={idx} className="bg-white border border-gray-200 p-2 group-hover:border-mammut-gold/50 transition-colors">
                            <img src={img} alt={`${part.title} detail`} className="h-32 object-contain mix-blend-multiply" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2.9 Smart Home */}
      {detailData.smartHome && (
        <section className="py-16 bg-white border-b border-gray-100">
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="border border-gray-200 p-8 md:p-12 bg-gray-50 hover:border-mammut-gold transition-colors duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="flex flex-col">
                  <h2 className="text-3xl font-black uppercase mb-6 text-black tracking-widest">
                    {detailData.smartHome.title}
                  </h2>
                  <p className="text-gray-600 text-sm leading-relaxed mb-8 border-l-4 border-mammut-gold pl-4">
                    {detailData.smartHome.description}
                  </p>
                  <Link 
                    to={detailData.smartHome.link.url}
                    className="inline-block self-start bg-black text-white text-xs font-bold uppercase tracking-widest px-8 py-4 hover:bg-mammut-gold hover:text-black transition-colors"
                  >
                    {detailData.smartHome.link.text}
                  </Link>
                </div>
                <div className="flex items-center justify-center border-4 border-white shadow-xl group">
                  <img src={detailData.smartHome.image} alt={detailData.smartHome.title} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

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
              src={detailData.modalVideoSrc || detailData.videoSrc}
              autoPlay
              controls
              className="w-full rounded-sm shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Infill Modal */}
      {infillOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm p-6"
          onClick={() => setInfillOpen(null)}
        >
          <div className="relative h-[90vh] max-w-3xl flex items-center justify-center" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setInfillOpen(null)}
              className="absolute -top-6 -right-6 text-gray-600 hover:text-mammut-gold transition-colors z-50 bg-white rounded-full p-2 shadow-lg"
            >
              <X size={24} />
            </button>
            <img
              src={infillOpen}
              alt="Infill Enlarged"
              className="max-h-full max-w-full object-contain shadow-2xl bg-white p-4 border border-gray-200"
            />
          </div>
        </div>
      )}

      {/* 3. Profile Specs Section eliminated per user request */}

      
      {/* Dynamic Features Section */}
      {detailData.features && detailData.features.length > 0 && (
        <section className="bg-white py-16 lg:py-24 border-t border-gray-100">
          <div className="container mx-auto px-6 lg:px-16 max-w-7xl space-y-24">
            {detailData.features.map((feature, idx) => (
              <div key={idx} className={`flex flex-col lg:flex-row items-center gap-12 ${idx % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
                <div className="lg:w-1/2 flex justify-center">
                  <img src={feature.image} alt={t(`productData.${detailData.slug}.${feature.title}`)} className="max-w-full h-auto drop-shadow-xl" />
                </div>
                <div className="lg:w-1/2 space-y-6">
                  <h3 className="text-3xl font-black uppercase tracking-widest text-black">
                    {t(`productData.${detailData.slug}.${feature.title}`)}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {t(`productData.${detailData.slug}.${feature.description}`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Dynamic Infills Section */}
      {detailData.infills && detailData.infills.length > 0 && (
        <section className="bg-[#f9fafb] py-16 lg:py-24 border-t border-gray-100">
          <div className="container mx-auto px-6 lg:px-16 max-w-7xl">
            <h2 className="text-3xl font-black uppercase tracking-widest text-black mb-4 text-center">
              {t('productDetail.infillsTitle', { defaultValue: 'Infill Patterns' })}
            </h2>
            <p className="text-center text-gray-600 mb-12">
              {t([`productData.${detailData.slug}.infillsSubtitle`, 'productDetail.infillsSubtitle'], { defaultValue: 'Some patterns are available in their mirror image.' })}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {detailData.infills.map((infill, idx) => (
                <div key={idx} className="flex flex-col items-center gap-3">
                  <button 
                    onClick={() => setInfillOpen((infill as any).largeImage || null)}
                    className="w-full aspect-[2/3] bg-white border border-gray-200 p-2 overflow-hidden hover:border-mammut-gold transition-colors group cursor-zoom-in"
                  >
                    <img 
                      src={infill.image} 
                      alt={infill.name} 
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  </button>
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-600 text-center">{infill.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Door Color Presenter for Doors */}
      {detailData.slug.includes('door') && detailData.slug !== 'mb-86si-doors-alu' && detailData.colors && detailData.colors.length > 0 && (
        <DoorColorPresenter 
          colors={detailData.colors} 
          selectedColorId={selectedColorId} 
          onColorSelect={(c) => setSelectedColorId(c.id)} 
        />
      )}

      {/* Dynamic Door Structures Section */}
      {detailData.doorStructures && detailData.doorStructures.length > 0 && (
        <section className="bg-white py-16 lg:py-24 border-t border-gray-100">
          <div className="container mx-auto px-6 lg:px-16 max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black uppercase tracking-widest text-black mb-4">
                {t([`productData.${detailData.slug}.doorStructuresTitle`, 'productDetail.doorStructuresTitle'], { defaultValue: 'Door Structures' })}
              </h2>
              <p className="text-gray-500 max-w-4xl mx-auto leading-relaxed">
                {t([`productData.${detailData.slug}.doorStructuresDesc`, 'productDetail.doorStructuresDesc'])}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {detailData.doorStructures.map((struct, idx) => (
                <div key={idx} className="flex flex-col items-center gap-3">
                  <button 
                    onClick={() => setInfillOpen(struct.image)}
                    className="w-full bg-white border border-gray-200 p-2 overflow-hidden hover:border-mammut-gold transition-colors group cursor-zoom-in"
                  >
                    <img 
                      src={struct.image} 
                      alt={struct.name} 
                      className="w-full h-auto max-h-64 object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  </button>
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-600 text-center">{struct.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. Interactive Color Swatch Section */}
      {detailData.slug === 'external-venetian-blinds' && (
        <VenetianBlindsColorPicker />
      )}
      
      {(!detailData.slug.includes('door') || detailData.slug === 'mb-86si-doors-alu') && detailData.slug !== 'external-venetian-blinds' && (
      <>
      <section className="bg-white pt-24 pb-0">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-[#1a1a1a] p-10 lg:p-14 relative mb-12">
            {/* Vertical Golden Line extending above the box */}
            <div className="absolute -top-6 left-10 lg:left-14 w-[2px] h-12 bg-mammut-gold" />
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              {t([`productData.${detailData.slug}.colorsTitle`, 'productDetail.colorsTitle'])}
            </h2>
            <p className="text-white max-w-5xl leading-relaxed text-sm lg:text-base" style={{ color: '#ffffff' }}>
              {t([`productData.${detailData.slug}.colorsDesc`, 'productDetail.colorsDesc'], { count: detailData.colors.length, name: detailData.name })}
            </p>
          </div>

          <div className="flex flex-col">
            {detailData.slug === 'softline' ? (
              /* Custom Drutex-style Softline layout */
              <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 w-full items-start mt-6">
                
                {/* Left Panel: Preview image */}
                <div className="w-full lg:w-1/2 flex items-center justify-center min-h-[400px]">
                   <img 
                     src={viewMode === 'profile' ? (selectedColor as any)?.profileImage : (selectedColor as any)?.windowImage || selectedColor?.image} 
                     alt={selectedColor?.name}
                     className="w-full h-auto max-h-[500px] object-contain transition-opacity duration-300"
                   />
                </div>

                {/* Right Panel: Controls */}
                <div className="w-full lg:w-1/2 flex flex-col gap-8">
                   {/* Icons Toggles */}
                   <div className="flex gap-4">
                     <button 
                       onClick={() => setViewMode('profile')} 
                       className={`w-14 h-14 border flex items-center justify-center transition-all shadow-sm ${viewMode === 'profile' ? 'border-mammut-gold bg-gray-50' : 'border-gray-200 hover:border-mammut-gold'}`}
                     >
                        <img src="/assets/softline/btn-window.svg" alt="Profile View" className={`w-10 h-10 transition-opacity ${viewMode === 'profile' ? 'opacity-100' : 'opacity-60 grayscale'}`} />
                     </button>
                     <button 
                       onClick={() => setViewMode('window')} 
                       className={`w-14 h-14 border flex items-center justify-center transition-all shadow-sm ${viewMode === 'window' ? 'border-mammut-gold bg-gray-50' : 'border-gray-200 hover:border-mammut-gold'}`}
                     >
                        <img src="/assets/softline/btn-profil.svg" alt="Window View" className={`w-10 h-10 transition-opacity ${viewMode === 'window' ? 'opacity-100' : 'opacity-60 grayscale'}`} />
                     </button>
                   </div>

                   {/* Color Picker */}
                   <div className="flex-1 w-full">
                      <ColorSwatch 
                        colors={detailData.colors}
                        selectedColorId={selectedColorId}
                        onColorSelect={(color) => setSelectedColorId(color.id as any)}
                      />
                   </div>
                </div>
              </div>
            ) : (
              <>
                {/* View Mode Toggle for Dual Systems */}
                {detailData.outdoorColors && (
                  <div className="flex justify-center -mb-6 relative z-50 mt-6">
                    <div className="bg-[#1a1a1a] p-1 rounded-full flex gap-1 shadow-lg border border-gray-800">
                      <button 
                        onClick={() => setViewMode('indoor')}
                        className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${viewMode === 'indoor' ? 'bg-mammut-gold text-black' : 'text-gray-400 hover:text-white'}`}
                      >
                        {t('productDetail.interior', { defaultValue: 'Interior' })}
                      </button>
                      <button 
                        onClick={() => setViewMode('outdoor')}
                        className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${viewMode === 'outdoor' ? 'bg-mammut-gold text-black' : 'text-gray-400 hover:text-white'}`}
                      >
                        {t('productDetail.exterior', { defaultValue: 'Exterior' })}
                      </button>
                    </div>
                  </div>
                )}

                {/* Window Preview (Top) */}
                <div className="w-full bg-white border border-gray-200 border-b-0 flex flex-col items-center justify-center p-12 pb-4 lg:p-12 lg:pb-4 min-h-[450px] relative overflow-hidden">
                  
                  {/* Render Visualizer Image with Optional CSS Tint Mask */}
                  <div className="w-full relative flex items-center justify-center p-8 bg-transparent min-h-[400px]">
                    <div className="relative w-full max-w-[500px]">
                      {(() => {
                        const isDoor = detailData.slug.includes('door');
                        const doorMask = detailData.slug === 'mb-86si-doors-alu' ? '/assets/products/mb-86si-doors-alu/mb86si-mask.webp' : '/assets/hero-door.png';
                        const doorBase = detailData.windowPhoto || detailData.heroImage || '/assets/hero-door.png';
                        const baseImage = isDoor ? doorBase : (viewMode === 'outdoor' && detailData.outdoorWindowPhoto ? detailData.outdoorWindowPhoto : (selectedColor?.windowImage || "/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp"));
                        const maskImage = isDoor ? doorMask : (selectedColor?.windowImage || '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp');
                        
                        return (
                          <>
                            <img 
                              src={baseImage} 
                              alt={`${selectedColor ? t(`colors.${selectedColor.id}`) : 'Color'} Frame`} 
                              className="w-full h-auto object-contain z-20 transition-opacity duration-500"
                            />
                            {/* CSS dynamic tint overlay */}
                            {(isDoor || selectedColor?.windowImage === '/assets/windowcolors/wingloedgeframeswithcolor/blanco-fx.webp') && selectedColor?.hex && (
                              <div 
                                className="absolute inset-0 z-30 pointer-events-none transition-colors duration-500" 
                                style={{
                                  backgroundColor: selectedColor.hex,
                                  mixBlendMode: 'multiply',
                                  maskImage: `url(${maskImage})`,
                                  WebkitMaskImage: `url(${maskImage})`,
                                  maskSize: 'contain',
                                  WebkitMaskSize: 'contain',
                                  maskRepeat: 'no-repeat',
                                  WebkitMaskRepeat: 'no-repeat',
                                  maskPosition: 'center',
                                  WebkitMaskPosition: 'center',
                                  opacity: 0.85
                                }}
                              />
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  
                  {/* Selected Color Name (Below Window) */}
                  <div className="w-full flex justify-center mt-6 z-40">
                    <span className="text-gray-400 font-bold text-sm uppercase tracking-widest">
                      {selectedColor ? t(`colors.${selectedColor.id}`) : ''}
                    </span>
                  </div>
                </div>

                {/* Color Selector (Bottom) */}
                <div className="w-full bg-white border border-gray-200 border-t-0 border-b-0 p-8 pt-0 pb-6 lg:p-12 lg:pt-0 lg:pb-6">
                  <ColorSwatch 
                    colors={detailData.colors}
                    selectedColorId={selectedColorId}
                    onColorSelect={(color) => setSelectedColorId(color.id as any)}
                  />
                </div>
              </>
            )}
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
        <div className="relative z-10 text-black w-full max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 items-center gap-6">
          
          {/* 1. Search Box (Left) */}
          <div className="flex justify-start">
            {detailData.slug.startsWith('mb-') && (
              <div className="relative w-full max-w-[240px]">
                <input 
                  type="text" 
                  placeholder="Search RAL code..." 
                  className="w-full bg-white/50 border border-black/30 text-black placeholder-black/60 px-4 py-2.5 pr-10 rounded-sm backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-black/50 focus:bg-white/80 transition-all font-bold text-sm uppercase shadow-sm"
                  onChange={(e) => {
                    const term = e.target.value.toLowerCase().trim()
                    if (term.length >= 3) {
                      const matchedColor = detailData.colors.find(c => {
                        const translatedName = t(`colors.${c.id}`).toLowerCase()
                        return translatedName.includes(term) || c.id.toLowerCase().includes(term.replace(/\s+/g, '-'))
                      })
                      if (matchedColor) {
                        setSelectedColorId(matchedColor.id)
                      }
                    }
                  }}
                />
                <Search className="absolute right-3 top-3 w-4 h-4 text-black/70 pointer-events-none" />
              </div>
            )}
          </div>

          {/* 2. Selected Color Info (Center) */}
          <div className="flex flex-col items-center justify-center text-center">
            <p className="!text-black text-sm font-medium opacity-90 mb-1">{t('productDetail.selectedColor')}</p>
            <p className="!text-black text-xl font-black tracking-widest uppercase">{selectedColor ? t(`colors.${selectedColor.id}`) : ''}</p>
          </div>

          {/* 3. Empty spacer (Right) */}
          <div className="hidden md:block"></div>
        </div>
      </div>
      </>
      )}

      {/* 3.5 Inspirations Section */}
      {detailData.inspirations && detailData.inspirations.length > 0 && (
        <section id="inspirations" className="bg-[#1a1a1a] py-16 lg:py-24 border-t border-gray-800">
          <div className="container mx-auto px-6 lg:px-16 max-w-[1600px]">
            <div className="flex flex-col items-start mb-12">
               <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                 {t(['productDetail.inspirationsTitle'], { defaultValue: 'Inspirations' })}
               </h2>
               <div className="w-16 h-[2px] bg-mammut-gold"></div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {detailData.inspirations.map((insp, idx) => (
                <div 
                  key={insp.id} 
                  className="relative group overflow-hidden bg-black aspect-[4/3] rounded-sm cursor-zoom-in" 
                  onClick={() => setInfillOpen(insp.url)}
                >
                  <img 
                    src={insp.url} 
                    alt={insp.alt || `Inspiration ${idx + 1}`} 
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 ring-1 ring-inset ring-white/10 pointer-events-none transition-colors group-hover:ring-mammut-gold/50" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Glass Options Grid */}
      {detailData.glassOptions && detailData.glassOptions.length > 0 && (
        <GlazingSection glassOptions={detailData.glassOptions} />
      )}

      {/* 5. Additional Options (Everything EXCEPT Window Sill) */}
      {detailData.slug !== 'external-venetian-blinds' && (
        <AdditionalOptionsSection options={ADDITIONAL_OPTIONS.filter(o => o.id !== 'sill' && !(detailData.slug.includes('door') && ['muntin', 'ventilation'].includes(o.id)))} />
      )}

      {/* 6. Handles Slider */}
      {detailData.slug !== 'external-venetian-blinds' && (
        <HandlesSlider hardware={detailData.hardware} />
      )}


      {/* 6.5 Extras / Accessories */}
      {detailData.accessories && detailData.accessories.length > 0 && (
        <section className="py-16 bg-white border-t border-gray-100">
          <div className="container mx-auto px-6 max-w-7xl">
             <h2 className="text-3xl font-black uppercase mb-8 text-black tracking-widest text-center">
               {t('productDetail.extras')}
             </h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
               {detailData.accessories.map((acc) => (
                 <div key={acc.id} className="flex flex-col items-center text-center">
                   <div className="w-32 h-32 bg-gray-50 flex items-center justify-center mb-4 border border-gray-100 rounded-sm">
                     {acc.image ? (
                       <img src={acc.image} alt={acc.name} className="max-w-full max-h-full object-contain" />
                     ) : (
                       <span className="text-gray-300 text-sm">No image</span>
                     )}
                   </div>
                   <p className="text-sm font-semibold text-black uppercase tracking-wider">{t(`accessories.${acc.id}`, { defaultValue: acc.name })}</p>
                 </div>
               ))}
             </div>
          </div>
        </section>
      )}


      {/* 6.8 Comparison Table */}
      {detailData.comparison && (
        <ProductComparison comparisonData={detailData.comparison} />
      )}

      {/* 7. Additional Options (ONLY Window Sill) */}
      {!detailData.slug.includes('door') && detailData.slug !== 'external-venetian-blinds' && (
        <AdditionalOptionsSection options={ADDITIONAL_OPTIONS.filter(o => o.id === 'sill')} hideHeader={true} />
      )}

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
