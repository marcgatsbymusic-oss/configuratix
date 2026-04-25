import { Link } from 'react-router-dom'
import { ArrowRight, ChevronDown, List } from 'lucide-react'
import { CATEGORIES, PRODUCTS } from '../data/products'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'

export function ProductsPage() {
  const { t } = useTranslation()
  const [openSpecId, setOpenSpecId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'default' | 'db' | 'uw' | 'chambers' | 'depth' | 'gaskets'>('default')

  const sortedProducts = [...PRODUCTS].sort((a, b) => {
    if (sortBy === 'default') return 0;
    const aVal = a.techDetails;
    const bVal = b.techDetails;
    if (!aVal && !bVal) return 0;
    if (!aVal) return 1;
    if (!bVal) return -1;

    switch (sortBy) {
      case 'db':
        const aDb = parseInt(aVal.soundInsulation.replace(/[^\d]/g, '') || '0')
        const bDb = parseInt(bVal.soundInsulation.replace(/[^\d]/g, '') || '0')
        return bDb - aDb; // Highest db first
      case 'uw':
        const aUw = parseFloat(aVal.thermalTransmittance.replace(/[^\d,.]/g, '').replace(',', '.')) || 99
        const bUw = parseFloat(bVal.thermalTransmittance.replace(/[^\d,.]/g, '').replace(',', '.')) || 99
        return aUw - bUw; // Lowest Uw first
      case 'chambers':
        const aC = parseInt(aVal.chambers) || 0;
        const bC = parseInt(bVal.chambers) || 0;
        return bC - aC; // Highest chambers first
      case 'depth':
        const aD = parseInt(aVal.installationDepth) || 0;
        const bD = parseInt(bVal.installationDepth) || 0;
        return aD - bD; // Thinnest first
      case 'gaskets':
        const aG = parseInt(aVal.gaskets) || 0;
        const bG = parseInt(bVal.gaskets) || 0;
        return bG - aG; // Highest gaskets first
      default:
        return 0;
    }
  });

  return (
    <main className="min-h-screen bg-mammut-black pt-28 pb-20">
      {/* ── Header ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 mb-16">
        <p className="text-mammut-gold text-xs uppercase tracking-[0.2em] font-semibold mb-3">
          {t('products.collection')}
        </p>
        <h1 className="text-5xl md:text-7xl font-black uppercase mb-6">
          {t('products.title')}
        </h1>
        <p className="text-mammut-white/60 text-lg max-w-2xl">
          {t('products.description')}
        </p>
      </section>

      {/* ── Categories Grid ───────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 mb-32">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <div key={cat.id} className="bg-mammut-dark p-8 border border-mammut-border hover:border-mammut-gold/50 transition-colors">
              <h3 className="text-xl font-black uppercase mb-2 text-mammut-gold">{cat.name}</h3>
              <p className="text-mammut-white/50 text-sm">{cat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── All Products Grid ─────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 border-b border-mammut-border pb-4">
          <h2 className="text-3xl font-black uppercase">
            {t('products.allProducts', 'All Products')}
          </h2>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <span className="text-xs font-bold text-mammut-white/40 uppercase tracking-widest">Sort By:</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-mammut-darker text-mammut-white/90 text-sm font-medium border border-mammut-border rounded-lg px-4 py-2 outline-none hover:border-mammut-border focus:border-mammut-gold/50 transition-colors cursor-pointer"
            >
              <option value="default">Default Order</option>
              <option value="uw">Thermal Transmittance (Lowest Uw)</option>
              <option value="db">Sound Insulation (Highest dB)</option>
              <option value="chambers">Chambers (Highest to Lowest)</option>
              <option value="depth">Installation Depth (Thinnest First)</option>
              <option value="gaskets">Gaskets (Most to Least)</option>
            </select>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedProducts.map((p) => (
            <div
              key={p.id}
              className="group flex flex-col bg-mammut-dark border border-mammut-border hover:border-mammut-gold/40 transition-all duration-300"
            >
              {/* Product Image */}
              <Link to={`/products/${p.slug}`} className="block relative aspect-[4/3] bg-mammut-darker overflow-hidden flex items-center justify-center p-8">
                {p.images && p.images[0] ? (
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                  />
                ) : (
                  <div className="w-full h-full border border-white/5 group-hover:border-mammut-gold/20 transition-colors duration-500">
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent" />
                    <p className="absolute bottom-4 left-6 text-mammut-white/20 font-bold tracking-widest uppercase break-all opacity-50 text-[100px] leading-none select-none">
                      {p.name.substring(0, 3)}
                    </p>
                  </div>
                )}
                {p.isNew && (
                  <span className="absolute top-4 left-4 z-10 bg-mammut-gold text-black text-[10px] font-bold uppercase tracking-widest px-2 py-1">
                    {t('products.new', 'NEW')}
                  </span>
                )}
              </Link>

              {/* Product Info */}
              <div className="p-6 flex flex-col flex-1">
                <Link to={`/products/${p.slug}`} className="block mb-4 hover:opacity-80 transition-opacity">
                  <p className="text-mammut-gold text-[10px] font-semibold uppercase tracking-[0.2em] mb-1">
                    {p.category.name}
                  </p>
                  <h3 className="text-2xl font-black uppercase text-mammut-white">{p.name}</h3>
                  <p className="text-mammut-white/50 text-sm mt-1 line-clamp-2">{p.tagline}</p>
                </Link>

                <div className="mt-auto pt-4 flex flex-col gap-3">
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setOpenSpecId(openSpecId === p.id ? null : p.id)}
                      className="flex-1 flex justify-center items-center gap-2 border border-mammut-border hover:border-mammut-gold/50 bg-mammut-darker text-mammut-white/80 hover:text-mammut-white px-4 py-2.5 rounded text-xs font-bold uppercase tracking-widest transition-all"
                    >
                      <List size={14} className="text-mammut-gold" />
                      Specifications
                      <ChevronDown size={14} className={`transition-transform duration-300 ${openSpecId === p.id ? 'rotate-180 text-mammut-gold' : ''}`} />
                    </button>
                    
                    <Link 
                      to={`/products/${p.slug}`}
                      className="flex-shrink-0 flex items-center justify-center gap-2 bg-mammut-gold text-black hover:bg-white px-5 py-2.5 rounded text-xs font-black uppercase tracking-widest transition-colors"
                    >
                      More
                      <ArrowRight size={14} />
                    </Link>
                  </div>

                  {/* Specifications Dropdown */}
                  <div className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${openSpecId === p.id ? 'max-h-[800px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                    <div className="bg-mammut-darker border border-mammut-border p-4 rounded-lg flex flex-col gap-3">
                      {p.techDetails && (
                        <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                          <div>
                            <p className="text-[9px] text-mammut-gold uppercase tracking-widest mb-0.5">Uw Value</p>
                            <p className="text-sm font-black text-mammut-white/90">{p.techDetails.thermalTransmittance}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-mammut-gold uppercase tracking-widest mb-0.5">Sound Insulation</p>
                            <p className="text-sm font-black text-mammut-white/90">{p.techDetails.soundInsulation}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-mammut-gold uppercase tracking-widest mb-0.5">Depth</p>
                            <p className="text-sm font-black text-mammut-white/90">{p.techDetails.installationDepth}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-mammut-gold uppercase tracking-widest mb-0.5">Chambers</p>
                            <p className="text-sm font-black text-mammut-white/90">{p.techDetails.chambers}</p>
                          </div>
                           <div>
                            <p className="text-[9px] text-mammut-gold uppercase tracking-widest mb-0.5">Gaskets</p>
                            <p className="text-sm font-black text-mammut-white/90">{p.techDetails.gaskets}</p>
                          </div>
                           <div>
                            <p className="text-[9px] text-mammut-gold uppercase tracking-widest mb-0.5">Class</p>
                            <p className="text-sm font-black text-mammut-white/90 uppercase">{p.techDetails.profileClass}</p>
                          </div>
                        </div>
                      )}
                      {!p.techDetails && p.specs.length > 0 && (
                        <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                          {p.specs.map(spec => (
                             <div key={spec.label}>
                                <p className="text-[9px] text-mammut-gold uppercase tracking-widest mb-0.5">{spec.label}</p>
                                <p className="text-sm font-black text-mammut-white/90">{spec.value} <span className="text-[10px] text-mammut-white/40">{spec.unit}</span></p>
                             </div>
                          ))}
                        </div>
                      )}
                      
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </main>
  )
}
