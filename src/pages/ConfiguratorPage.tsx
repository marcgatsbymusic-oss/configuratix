import { useState } from 'react'
import { ArrowRight, ChevronRight, ChevronLeft, Check, RotateCcw, ShoppingCart, Info } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
type Step = 1 | 2 | 3 | 4

interface Config {
  productType: string
  profile: string
  windowType: string
  openingStyle: string
  width: number
  height: number
  color: string
  glazing: string
  handle: string
  glazingBars: boolean
  antiBurglary: boolean
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const PRODUCT_TYPES = [
  { id: 'windows', label: 'Windows', icon: '🪟', sub: 'Single, double & tilt-turn' },
  { id: 'psk', label: 'Tilt & Slide Doors', icon: '🚪', sub: 'Parallel sliding systems' },
  { id: 'hst', label: 'Lift & Slide Doors', icon: '🏗️', sub: 'Large-format glazing' },
  { id: 'fst', label: 'Fold & Slide Doors', icon: '📐', sub: 'Folding door systems' },
  { id: 'front', label: 'Front Doors', icon: '🚪', sub: 'Entrance & security doors' },
  { id: 'glass-doors', label: 'Entrance Glass Doors', icon: '🔲', sub: 'Full glass entrance systems' },
  { id: 'shutters', label: 'Roller Shutters', icon: '🔽', sub: 'Motorized shading' },
  { id: 'blinds', label: 'External Venetian Blinds', icon: '🌞', sub: 'Sun control systems' },
  { id: 'insect', label: 'Insect Protection', icon: '🦟', sub: 'Screens & pleated doors' },
  { id: 'sills', label: 'Window Sills', icon: '📏', sub: 'Aluminium, PVC & marble' },
]

const PROFILES = [
  { id: 'iglo-edge', label: 'IGLO EDGE', sub: '82mm · 6-chamber · Uw 0.57', tag: 'BEST' },
  { id: 'iglo-energy', label: 'IGLO ENERGY', sub: '82mm · 6-chamber · Uw 0.63' },
  { id: 'iglo-5', label: 'IGLO 5', sub: '70mm · 5-chamber · Uw 0.74' },
  { id: 'iglo-light', label: 'IGLO LIGHT', sub: '70mm · 5-chamber · Slim sightline' },
  { id: 'mb-86n', label: 'MB-86N (ALU)', sub: '86mm · Aluminium · Uw 0.72' },
]

const WINDOW_TYPES = [
  { id: '1f',    label: '1 Sash',                    img: '/assets/window-types/1f_thumb_20100415_w8jxu.png' },
  { id: '2f',    label: '2 Sash',                    img: '/assets/window-types/2f_thumb_20100415_5jze.png' },
  { id: '3f',    label: '3 Sash',                    img: '/assets/window-types/3f_thumb_20100418_gxnat.png' },
  { id: '4f',    label: '4 Sash',                    img: '/assets/window-types/4flugel-base.png' },
  { id: '1ol',   label: '1 Sash + Top Light',        img: '/assets/window-types/1ol_thumb_20100415_3gktz.png' },
  { id: '2fol',  label: '2 Sash + Wide Top Light',   img: '/assets/window-types/2fol_thumb_20100415_dusrq.png' },
  { id: '2fols', label: '2 Sash + 2 Top Lights',     img: '/assets/window-types/2fols_thumb_20100420_w2yrq.png' },
  { id: '3fol',  label: '3 Sash + Wide Top Light',   img: '/assets/window-types/3fol_thumb_20100424_4eaqp.png' },
  { id: '3fols', label: '3 Sash + 3 Top Lights',     img: '/assets/window-types/3fols_thumb_20100420_hcczx.png' },
  { id: '1ul',   label: '1 Sash + Bottom Light',     img: '/assets/window-types/1ul_thumb_20100419_ri49y.png' },
  { id: '2ful',  label: '2 Sash + Wide Bottom Light',img: '/assets/window-types/2ful_thumb_20100420_xhrit.png' },
  { id: '2fuls', label: '2 Sash + 2 Bottom Lights',  img: '/assets/window-types/2fuls_thumbs_20100415_wfwt7.png' },
  { id: '3ful',  label: '3 Sash + Wide Bottom Light',img: '/assets/window-types/3ful_thumb_20100419_zkidg.png' },
  { id: '3fuls', label: '3 Sash + 3 Bottom Lights',  img: '/assets/window-types/3fuls_thumb_20100420_p7z5z.png' },
]

const OPENING_STYLES = [
  { id: 'fixed', label: 'Fixed' },
  { id: 'tilt', label: 'Tilt only' },
  { id: 'tilt-turn', label: 'Tilt & Turn' },
  { id: 'turn', label: 'Turn only' },
]

const COLORS = [
  { id: 'ral-9016', label: 'Traffic White', hex: '#F3F3F3' },
  { id: 'ral-9005', label: 'Jet Black', hex: '#1A1A1A' },
  { id: 'ral-7016', label: 'Anthracite Grey', hex: '#383E42' },
  { id: 'ral-8017', label: 'Chocolate Brown', hex: '#442D1C' },
  { id: 'ral-6009', label: 'Fir Green', hex: '#27352A' },
  { id: 'golden-oak', label: 'Golden Oak', hex: '#B8860B' },
]

const GLAZINGS = [
  { id: '2f-standard', label: '2-Pane Standard', sub: 'Ug 1.1 · 32dB', price: '+€0' },
  { id: '2f-premium', label: '2-Pane Premium', sub: 'Ug 0.7 · 36dB', price: '+€80' },
  { id: '3f-standard', label: '3-Pane Standard', sub: 'Ug 0.6 · 38dB', price: '+€120', tag: 'POPULAR' },
  { id: '3f-premium', label: '3-Pane Premium', sub: 'Ug 0.5 · 42dB', price: '+€180' },
]

const HANDLES = [
  { id: 'hoppe-new-york', label: 'Hoppe New York', sub: 'Standard aluminium' },
  { id: 'hoppe-stockholm', label: 'Hoppe Stockholm', sub: 'Premium stainless' },
  { id: 'roto-line', label: 'Roto Line', sub: 'Matte black finish' },
  { id: 'winkhaus', label: 'Winkhaus', sub: 'Anti-burglary rated' },
]

const STEPS = [
  { n: 1, label: 'Select Product' },
  { n: 2, label: 'Configure' },
  { n: 3, label: 'Review' },
  { n: 4, label: 'Get Offer' },
]

const DEFAULT_CONFIG: Config = {
  productType: '',
  profile: 'iglo-edge',
  windowType: '1f',
  openingStyle: 'tilt-turn',
  width: 900,
  height: 1200,
  color: 'ral-9016',
  glazing: '3f-standard',
  handle: 'hoppe-new-york',
  glazingBars: false,
  antiBurglary: false,
}

// ─── Window SVG preview ────────────────────────────────────────────────────────
function WindowPreview({ config }: { config: Config }) {
  const aspectRatio = config.height / config.width
  const color = COLORS.find(c => c.id === config.color)?.hex ?? '#F3F3F3'
  const isDouble = config.windowType === '2f' || config.windowType === '3f'

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        viewBox="0 0 200 240"
        className="w-full max-w-[220px]"
        style={{ maxHeight: `${Math.min(260, 200 * aspectRatio)}px` }}
      >
        {/* Outer frame */}
        <rect x="10" y="10" width="180" height="220" rx="1"
          fill={color} stroke="#dca95c" strokeWidth="6" />
        {/* Glass */}
        <rect x="20" y="20" width="160" height="200" rx="1"
          fill="#7ec8e3" fillOpacity="0.3" stroke="#dca95c" strokeWidth="1.5" />
        {/* Mid divider if double */}
        {isDouble && (
          <line x1="100" y1="20" x2="100" y2="220" stroke={color} strokeWidth="6" />
        )}
        {/* Tilt-turn lines */}
        {config.openingStyle === 'tilt-turn' && (
          <g stroke="#dca95c" strokeWidth="0.8" strokeDasharray="4,2" opacity="0.6">
            <line x1="20" y1="20" x2="180" y2="120" />
            <line x1="180" y1="20" x2="100" y2="220" />
          </g>
        )}
        {config.openingStyle === 'tilt' && (
          <g stroke="#dca95c" strokeWidth="0.8" strokeDasharray="4,2" opacity="0.6">
            <line x1="20" y1="200" x2="180" y2="200" />
            <line x1="20" y1="200" x2="100" y2="100" />
            <line x1="180" y1="200" x2="100" y2="100" />
          </g>
        )}
        {/* Dimension labels */}
        <text x="100" y="252" textAnchor="middle" fontSize="11" fill="#dca95c" fontFamily="monospace">
          {config.width} mm
        </text>
        <text x="3" y="120" textAnchor="middle" fontSize="11" fill="#dca95c" fontFamily="monospace"
          transform="rotate(-90, 3, 120)">
          {config.height} mm
        </text>
      </svg>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────
export function ConfiguratorPage() {
  const [step, setStep] = useState<Step>(1)
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG)
  const [submitted, setSubmitted] = useState(false)
  const [email, setEmail] = useState('')
  const [wtSliderIndex, setWtSliderIndex] = useState(0)
  const VISIBLE = 5

  const set = (k: keyof Config, v: unknown) => setConfig(c => ({ ...c, [k]: v }))

  const selectedProfile = PROFILES.find(p => p.id === config.profile)
  const selectedColor = COLORS.find(c => c.id === config.color)
  const selectedGlazing = GLAZINGS.find(g => g.id === config.glazing)
  const selectedHandle = HANDLES.find(h => h.id === config.handle)

  // Rough price estimate
  const basePrice = 820
  const glazExtra = selectedGlazing?.id === '2f-premium' ? 80 : selectedGlazing?.id === '3f-standard' ? 120 : selectedGlazing?.id === '3f-premium' ? 180 : 0
  const sizeExtra = Math.round(((config.width * config.height) / (900 * 1200) - 1) * 200)
  const totalPrice = basePrice + glazExtra + sizeExtra + (config.antiBurglary ? 95 : 0)

  return (
    <main className="min-h-screen bg-black">

      {/* ─── Hero / Steps Banner ──────────────────────────────────────────── */}
      <section className="bg-[#111112] border-b border-[#2a2a2b] pt-24 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-[#dca95c] text-xs uppercase tracking-[0.3em] font-semibold mb-2">3D Configurator</p>
          <h1 className="text-5xl md:text-6xl font-black uppercase mb-2">Design Your <span className="text-[#dca95c]">Window</span></h1>
          <p className="text-white/40 mb-10 max-w-xl">Four simple steps towards your perfect Mammut window or door. Get a non-binding offer instantly.</p>

          {/* Step indicators */}
          <div className="flex items-center gap-0">
            {STEPS.map((s, i) => {
              const isActive = step === s.n
              const isDone = step > s.n
              return (
                <div key={s.n} className="flex items-center">
                  <button
                    onClick={() => isDone && setStep(s.n as Step)}
                    className={`flex items-center gap-3 px-6 py-4 border-b-2 transition-all duration-200 ${
                      isActive
                        ? 'border-[#dca95c] text-[#dca95c]'
                        : isDone
                        ? 'border-[#dca95c]/40 text-white/50 cursor-pointer hover:text-[#dca95c]'
                        : 'border-transparent text-white/25 cursor-default'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border ${
                      isActive ? 'bg-[#dca95c] border-[#dca95c] text-black'
                      : isDone ? 'bg-transparent border-[#dca95c]/40 text-[#dca95c]'
                      : 'bg-transparent border-white/20 text-white/30'
                    }`}>
                      {isDone ? <Check size={12} /> : s.n}
                    </span>
                    <span className="text-xs uppercase tracking-widest font-semibold hidden sm:block">{s.label}</span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <ChevronRight size={14} className="text-white/20 mx-1 shrink-0" />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── Step 1: Select Product Type ──────────────────────────────────── */}
      {step === 1 && (
        <section className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-black uppercase mb-2">Select a Product Type</h2>
          <p className="text-white/40 text-sm mb-10">Windows, doors, and sun protection from our extensive range.</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {PRODUCT_TYPES.map(pt => (
              <button
                key={pt.id}
                onClick={() => { set('productType', pt.id); setStep(2) }}
                className={`group flex flex-col items-center gap-3 p-6 border transition-all duration-200 text-center ${
                  config.productType === pt.id
                    ? 'border-[#dca95c] bg-[#1a1a1b]'
                    : 'border-[#2a2a2b] bg-[#1a1a1b] hover:border-[#dca95c]/50'
                }`}
              >
                <span className="text-3xl">{pt.icon}</span>
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-white group-hover:text-[#dca95c] transition-colors">{pt.label}</p>
                  <p className="text-[11px] text-white/40 mt-1">{pt.sub}</p>
                </div>
                <ArrowRight size={14} className="text-[#dca95c] opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ─── Step 2: Configure ────────────────────────────────────────────── */}
      {step === 2 && (
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row gap-10">

            {/* Left: Configuration panels */}
            <div className="flex-1 space-y-8">

              {/* Profile */}
              <div className="border border-[#2a2a2b] bg-[#111112]">
                <div className="px-6 py-4 border-b border-[#2a2a2b]">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-white/60">Profile System</h3>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PROFILES.map(p => (
                    <button
                      key={p.id}
                      onClick={() => set('profile', p.id)}
                      className={`flex items-center justify-between px-4 py-3 border text-left transition-all ${
                        config.profile === p.id
                          ? 'border-[#dca95c] bg-[#1a1a1b]'
                          : 'border-[#2a2a2b] hover:border-[#dca95c]/40'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-bold text-white flex items-center gap-2">
                          {p.label}
                          {p.tag && <span className="bg-[#dca95c] text-black text-[9px] font-black uppercase px-1.5 py-0.5">{p.tag}</span>}
                        </p>
                        <p className="text-[11px] text-white/40 mt-0.5">{p.sub}</p>
                      </div>
                      {config.profile === p.id && <Check size={14} className="text-[#dca95c] shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dimensions */}
              <div className="border border-[#2a2a2b] bg-[#111112]">
                <div className="px-6 py-4 border-b border-[#2a2a2b]">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-white/60">Dimensions</h3>
                </div>
                <div className="p-6 grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs uppercase tracking-widest text-white/40 block mb-2">Width (W)</label>
                    <div className="flex items-center border border-[#2a2a2b] focus-within:border-[#dca95c] transition-colors">
                      <input
                        type="number"
                        value={config.width}
                        min={400} max={3000}
                        onChange={e => set('width', Number(e.target.value))}
                        className="flex-1 bg-transparent text-white text-lg font-bold px-4 py-3 outline-none w-0"
                      />
                      <span className="text-white/30 text-xs px-3 border-l border-[#2a2a2b] py-3">mm</span>
                    </div>
                    <p className="text-[10px] text-white/30 mt-1">Range: 400–3000 mm</p>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-white/40 block mb-2">Height (H)</label>
                    <div className="flex items-center border border-[#2a2a2b] focus-within:border-[#dca95c] transition-colors">
                      <input
                        type="number"
                        value={config.height}
                        min={400} max={2500}
                        onChange={e => set('height', Number(e.target.value))}
                        className="flex-1 bg-transparent text-white text-lg font-bold px-4 py-3 outline-none w-0"
                      />
                      <span className="text-white/30 text-xs px-3 border-l border-[#2a2a2b] py-3">mm</span>
                    </div>
                    <p className="text-[10px] text-white/30 mt-1">Range: 400–2500 mm</p>
                  </div>
                </div>
              </div>

              {/* Window type slider */}
              <div className="border border-[#2a2a2b] bg-[#111112]">
                <div className="px-6 py-4 border-b border-[#2a2a2b] flex items-center justify-between">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-white/60">Window Type</h3>
                  <span className="text-[11px] text-white/30">{WINDOW_TYPES.findIndex(w => w.id === config.windowType) + 1} / {WINDOW_TYPES.length}</span>
                </div>
                <div className="p-6">
                  {/* Slider track */}
                  <div className="relative">
                    <div className="flex gap-3 overflow-hidden">
                      {WINDOW_TYPES.slice(wtSliderIndex, wtSliderIndex + VISIBLE).map(wt => (
                        <button
                          key={wt.id}
                          onClick={() => set('windowType', wt.id)}
                          className={`flex-1 flex flex-col items-center gap-2 p-3 border transition-all min-w-0 ${
                            config.windowType === wt.id
                              ? 'border-[#dca95c] bg-[#1a1a1b]'
                              : 'border-[#2a2a2b] hover:border-[#dca95c]/40'
                          }`}
                        >
                          <div className={`w-full flex items-center justify-center p-2 rounded ${
                            config.windowType === wt.id ? 'bg-[#dca95c]/10' : 'bg-[#0d0d0e]'
                          }`}>
                            <img
                              src={wt.img}
                              alt={wt.label}
                              className="w-16 h-16 object-contain"
                              style={{ imageRendering: 'crisp-edges' }}
                            />
                          </div>
                          <p className={`text-[10px] text-center leading-tight uppercase tracking-wide font-semibold ${
                            config.windowType === wt.id ? 'text-[#dca95c]' : 'text-white/40'
                          }`}>{wt.label}</p>
                        </button>
                      ))}
                    </div>

                    {/* Nav buttons */}
                    <div className="flex items-center justify-between mt-4">
                      <button
                        onClick={() => setWtSliderIndex(i => Math.max(0, i - 1))}
                        disabled={wtSliderIndex === 0}
                        className="flex items-center gap-1 text-xs uppercase tracking-widest text-white/40 hover:text-[#dca95c] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft size={14} /> Prev
                      </button>

                      {/* Dot indicators */}
                      <div className="flex gap-1">
                        {Array.from({ length: WINDOW_TYPES.length - VISIBLE + 1 }).map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setWtSliderIndex(i)}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${
                              i === wtSliderIndex ? 'bg-[#dca95c] w-4' : 'bg-white/20 hover:bg-white/40'
                            }`}
                          />
                        ))}
                      </div>

                      <button
                        onClick={() => setWtSliderIndex(i => Math.min(WINDOW_TYPES.length - VISIBLE, i + 1))}
                        disabled={wtSliderIndex >= WINDOW_TYPES.length - VISIBLE}
                        className="flex items-center gap-1 text-xs uppercase tracking-widest text-white/40 hover:text-[#dca95c] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                      >
                        Next <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Opening style */}
              <div className="border border-[#2a2a2b] bg-[#111112]">
                <div className="px-6 py-4 border-b border-[#2a2a2b]">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-white/60">Opening Style</h3>
                </div>
                <div className="p-6 flex flex-wrap gap-3">
                  {OPENING_STYLES.map(os => (
                    <button
                      key={os.id}
                      onClick={() => set('openingStyle', os.id)}
                      className={`px-5 py-2.5 border text-sm font-semibold uppercase tracking-wider transition-all ${
                        config.openingStyle === os.id
                          ? 'border-[#dca95c] text-[#dca95c] bg-[#1a1a1b]'
                          : 'border-[#2a2a2b] text-white/50 hover:border-[#dca95c]/40 hover:text-white'
                      }`}
                    >
                      {os.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div className="border border-[#2a2a2b] bg-[#111112]">
                <div className="px-6 py-4 border-b border-[#2a2a2b]">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-white/60">Frame Color</h3>
                </div>
                <div className="p-6 flex flex-wrap gap-4">
                  {COLORS.map(c => (
                    <button
                      key={c.id}
                      onClick={() => set('color', c.id)}
                      title={c.label}
                      className={`flex flex-col items-center gap-2 group`}
                    >
                      <div
                        className={`w-12 h-12 rounded-sm border-2 transition-all ${
                          config.color === c.id ? 'border-[#dca95c] scale-110' : 'border-transparent hover:border-white/30'
                        }`}
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="text-[10px] text-white/40 group-hover:text-white/70 text-center leading-none max-w-[52px]">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Glazing */}
              <div className="border border-[#2a2a2b] bg-[#111112]">
                <div className="px-6 py-4 border-b border-[#2a2a2b]">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-white/60">Glazing Package</h3>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {GLAZINGS.map(g => (
                    <button
                      key={g.id}
                      onClick={() => set('glazing', g.id)}
                      className={`flex items-center justify-between px-4 py-3 border text-left transition-all ${
                        config.glazing === g.id
                          ? 'border-[#dca95c] bg-[#1a1a1b]'
                          : 'border-[#2a2a2b] hover:border-[#dca95c]/40'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-bold text-white flex items-center gap-2">
                          {g.label}
                          {g.tag && <span className="bg-[#dca95c]/20 text-[#dca95c] text-[9px] font-black uppercase px-1.5 py-0.5">{g.tag}</span>}
                        </p>
                        <p className="text-[11px] text-white/40 mt-0.5">{g.sub}</p>
                      </div>
                      <span className="text-[#dca95c] text-xs font-bold ml-4 shrink-0">{g.price}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Handle */}
              <div className="border border-[#2a2a2b] bg-[#111112]">
                <div className="px-6 py-4 border-b border-[#2a2a2b]">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-white/60">Window Handle</h3>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {HANDLES.map(h => (
                    <button
                      key={h.id}
                      onClick={() => set('handle', h.id)}
                      className={`flex items-center justify-between px-4 py-3 border text-left transition-all ${
                        config.handle === h.id
                          ? 'border-[#dca95c] bg-[#1a1a1b]'
                          : 'border-[#2a2a2b] hover:border-[#dca95c]/40'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-bold text-white">{h.label}</p>
                        <p className="text-[11px] text-white/40 mt-0.5">{h.sub}</p>
                      </div>
                      {config.handle === h.id && <Check size={14} className="text-[#dca95c] shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Extras */}
              <div className="border border-[#2a2a2b] bg-[#111112]">
                <div className="px-6 py-4 border-b border-[#2a2a2b]">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-white/60">Extras</h3>
                </div>
                <div className="p-6 space-y-4">
                  <label className="flex items-center gap-4 cursor-pointer group">
                    <div
                      onClick={() => set('glazingBars', !config.glazingBars)}
                      className={`w-5 h-5 border flex items-center justify-center transition-all shrink-0 ${
                        config.glazingBars ? 'bg-[#dca95c] border-[#dca95c]' : 'border-[#2a2a2b] group-hover:border-[#dca95c]/50'
                      }`}
                    >
                      {config.glazingBars && <Check size={12} className="text-black" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Glazing Bars</p>
                      <p className="text-[11px] text-white/40">Decorative internal bars (+€65)</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-4 cursor-pointer group">
                    <div
                      onClick={() => set('antiBurglary', !config.antiBurglary)}
                      className={`w-5 h-5 border flex items-center justify-center transition-all shrink-0 ${
                        config.antiBurglary ? 'bg-[#dca95c] border-[#dca95c]' : 'border-[#2a2a2b] group-hover:border-[#dca95c]/50'
                      }`}
                    >
                      {config.antiBurglary && <Check size={12} className="text-black" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Anti-Burglary Fittings RC2</p>
                      <p className="text-[11px] text-white/40">Security class 2 hardware (+€95)</p>
                    </div>
                  </label>
                </div>
              </div>

              <button
                onClick={() => setStep(3)}
                className="w-full flex items-center justify-center gap-3 bg-[#dca95c] text-black py-4 text-sm uppercase tracking-widest font-black hover:bg-[#eab676] transition-colors"
              >
                Continue to Review <ArrowRight size={16} />
              </button>
            </div>

            {/* Right: Live preview + price sticky */}
            <div className="lg:w-[340px] space-y-6">
              <div className="sticky top-24 space-y-4">

                {/* Price bar */}
                <div className="bg-[#1a1a1b] border border-[#2a2a2b] p-6">
                  <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Estimated Price</p>
                  <p className="text-4xl font-black text-[#dca95c]">
                    €{totalPrice.toLocaleString()}
                    <span className="text-sm text-white/30 font-normal ml-2">excl. VAT</span>
                  </p>
                  <p className="text-[11px] text-white/30 mt-2 flex items-center gap-1">
                    <Info size={10} /> Non-binding estimate. Final price after consultation.
                  </p>
                  <div className="mt-4 pt-4 border-t border-[#2a2a2b] space-y-1.5 text-xs text-white/50">
                    <div className="flex justify-between"><span>Profile</span><span className="text-white">{selectedProfile?.label}</span></div>
                    <div className="flex justify-between"><span>Size</span><span className="text-white">{config.width} × {config.height} mm</span></div>
                    <div className="flex justify-between"><span>Color</span><span className="text-white">{selectedColor?.label}</span></div>
                    <div className="flex justify-between"><span>Glazing</span><span className="text-white">{selectedGlazing?.label}</span></div>
                    <div className="flex justify-between"><span>Handle</span><span className="text-white">{selectedHandle?.label}</span></div>
                  </div>
                </div>

                {/* Window preview */}
                <div className="bg-[#1a1a1b] border border-[#2a2a2b] p-6">
                  <p className="text-white/40 text-xs uppercase tracking-widest mb-4">Live Preview</p>
                  <WindowPreview config={config} />
                </div>

                <button
                  onClick={() => setConfig(DEFAULT_CONFIG)}
                  className="w-full flex items-center justify-center gap-2 text-white/30 text-xs uppercase tracking-widest hover:text-[#dca95c] transition-colors py-2"
                >
                  <RotateCcw size={12} /> Reset Configuration
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── Step 3: Review ───────────────────────────────────────────────── */}
      {step === 3 && (
        <section className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-black uppercase mb-2">Review Your Configuration</h2>
          <p className="text-white/40 text-sm mb-10">Check the details below before requesting your offer.</p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Summary table */}
            <div className="bg-[#111112] border border-[#2a2a2b]">
              <div className="px-6 py-4 border-b border-[#2a2a2b]">
                <h3 className="text-xs uppercase tracking-widest font-bold text-[#dca95c]">Configuration Summary</h3>
              </div>
              <div className="p-6 space-y-3">
                {[
                  { label: 'Product', value: PRODUCT_TYPES.find(p => p.id === config.productType)?.label ?? 'Windows' },
                  { label: 'Profile System', value: selectedProfile?.label },
                  { label: 'Dimensions', value: `${config.width} × ${config.height} mm` },
                  { label: 'Window Type', value: WINDOW_TYPES.find(w => w.id === config.windowType)?.label },
                  { label: 'Opening Style', value: OPENING_STYLES.find(o => o.id === config.openingStyle)?.label },
                  { label: 'Frame Color', value: selectedColor?.label },
                  { label: 'Glazing', value: selectedGlazing?.label },
                  { label: 'Handle', value: selectedHandle?.label },
                  { label: 'Glazing Bars', value: config.glazingBars ? 'Yes (+€65)' : 'No' },
                  { label: 'Anti-Burglary RC2', value: config.antiBurglary ? 'Yes (+€95)' : 'No' },
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-center py-1.5 border-b border-[#1e1e1f] last:border-0">
                    <span className="text-xs text-white/40 uppercase tracking-wider">{row.label}</span>
                    <span className="text-sm font-semibold text-white">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview + total */}
            <div className="space-y-4">
              <div className="bg-[#111112] border border-[#2a2a2b] p-6">
                <WindowPreview config={config} />
              </div>
              <div className="bg-[#1a1a1b] border border-[#dca95c]/30 p-6">
                <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Total Estimate</p>
                <p className="text-5xl font-black text-[#dca95c]">€{totalPrice.toLocaleString()}</p>
                <p className="text-xs text-white/30 mt-1">excl. VAT · non-binding</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-10">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 border border-[#2a2a2b] text-white/50 px-8 py-4 text-sm uppercase tracking-widest font-bold hover:border-white/30 hover:text-white transition-all"
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(4)}
              className="flex-1 flex items-center justify-center gap-3 bg-[#dca95c] text-black py-4 text-sm uppercase tracking-widest font-black hover:bg-[#eab676] transition-colors"
            >
              <ShoppingCart size={16} /> Request Offer
            </button>
          </div>
        </section>
      )}

      {/* ─── Step 4: Get Offer ────────────────────────────────────────────── */}
      {step === 4 && (
        <section className="max-w-2xl mx-auto px-6 py-16">
          {!submitted ? (
            <>
              <h2 className="text-2xl font-black uppercase mb-2">Get Your Non-Binding Offer</h2>
              <p className="text-white/40 text-sm mb-10">Enter your details and receive a detailed quote by email within 24 hours.</p>

              <div className="bg-[#111112] border border-[#2a2a2b] p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase tracking-widest text-white/40 block mb-2">First Name</label>
                    <input className="w-full bg-transparent border border-[#2a2a2b] focus:border-[#dca95c] text-white px-4 py-3 outline-none transition-colors text-sm" placeholder="Marc" />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-white/40 block mb-2">Last Name</label>
                    <input className="w-full bg-transparent border border-[#2a2a2b] focus:border-[#dca95c] text-white px-4 py-3 outline-none transition-colors text-sm" placeholder="Keller" />
                  </div>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-white/40 block mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-transparent border border-[#2a2a2b] focus:border-[#dca95c] text-white px-4 py-3 outline-none transition-colors text-sm"
                    placeholder="marc@example.com"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-white/40 block mb-2">Phone (optional)</label>
                  <input className="w-full bg-transparent border border-[#2a2a2b] focus:border-[#dca95c] text-white px-4 py-3 outline-none transition-colors text-sm" placeholder="+34 600 000 000" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-white/40 block mb-2">Additional Notes</label>
                  <textarea rows={3} className="w-full bg-transparent border border-[#2a2a2b] focus:border-[#dca95c] text-white px-4 py-3 outline-none transition-colors text-sm resize-none" placeholder="Installation address, special requirements..." />
                </div>

                <div className="pt-2 border-t border-[#2a2a2b]">
                  <div className="flex justify-between text-sm mb-6">
                    <span className="text-white/40">Estimated total</span>
                    <span className="text-[#dca95c] font-black text-lg">€{totalPrice.toLocaleString()}</span>
                  </div>
                  <button
                    onClick={() => setSubmitted(true)}
                    className="w-full flex items-center justify-center gap-3 bg-[#dca95c] text-black py-4 text-sm uppercase tracking-widest font-black hover:bg-[#eab676] transition-colors"
                  >
                    Send Request <ArrowRight size={16} />
                  </button>
                  <p className="text-[11px] text-white/25 text-center mt-4">By submitting you agree to our privacy policy. No payment required.</p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-[#dca95c]/10 border border-[#dca95c]/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check size={36} className="text-[#dca95c]" />
              </div>
              <h2 className="text-3xl font-black uppercase mb-3">Offer Requested!</h2>
              <p className="text-white/40 mb-2">Your configuration has been sent successfully.</p>
              <p className="text-white/40 mb-10">We'll send a detailed non-binding offer to <span className="text-white">{email || 'your email'}</span> within 24 hours.</p>
              <button
                onClick={() => { setStep(1); setConfig(DEFAULT_CONFIG); setSubmitted(false) }}
                className="flex items-center gap-2 border border-[#dca95c] text-[#dca95c] px-8 py-4 mx-auto text-sm uppercase tracking-widest font-bold hover:bg-[#dca95c] hover:text-black transition-all"
              >
                <RotateCcw size={14} /> Start New Configuration
              </button>
            </div>
          )}
        </section>
      )}
    </main>
  )
}
