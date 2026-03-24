import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Check, Play, X } from 'lucide-react'
import { IGLO_EDGE_DETAIL, type GlassOption } from '../data/productDetails'
import { PRODUCTS } from '../data/products'
import { ColorSwatch } from '../components/products/ColorSwatch'



function GlazingSection({ glassOptions }: { glassOptions: GlassOption[] }) {
  const [selected, setSelected] = useState<GlassOption>(glassOptions[0])

  return (
    <section className="py-16 border-b border-[#2a2a2b]">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-2">Vidrios</h2>
        <p className="text-white/50 text-sm mb-10 max-w-2xl">
          Con más de 30 años de experiencia en la fabricación de vidrios compuestos, ofrecemos una gama muy amplia para equipar sus ventanas y puertas.
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
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-widest uppercase mb-3">
            {detailData.name}
          </h1>
          <p className="text-xl md:text-2xl text-white font-light mb-10 tracking-wider">
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
                  <span className="relative text-white font-medium text-base md:text-lg whitespace-nowrap px-3">{spec.value}</span>
                </div>
                {/* Label */}
                <p className="text-white/70 text-[9px] md:text-[10px] uppercase font-semibold tracking-[0.12em] text-center leading-tight w-full px-1">{spec.label}</p>
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
              <p className="text-white/70 leading-relaxed mb-8">
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
          <p className="text-sm font-normal opacity-90 mb-1">Elija un color:</p>
          <p className="text-lg font-bold tracking-wide">{selectedColor?.name}</p>
          <p className="text-xs opacity-80 mt-0.5 tracking-widest">{selectedColor?.id}</p>
        </div>
      </div>

      {/* 4. Glass Options Grid */}
      <GlazingSection glassOptions={detailData.glassOptions} />




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
