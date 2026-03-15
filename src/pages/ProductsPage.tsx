import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { CATEGORIES, PRODUCTS } from '../data/products'

export function ProductsPage() {
  return (
    <main className="min-h-screen bg-black pt-28 pb-20">
      {/* ── Header ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 mb-16">
        <p className="text-[#dca95c] text-xs uppercase tracking-[0.2em] font-semibold mb-3">
          Our Collection
        </p>
        <h1 className="text-5xl md:text-7xl font-black uppercase mb-6">
          Premium Systems
        </h1>
        <p className="text-white/60 text-lg max-w-2xl">
          Discover our comprehensive range of windows, doors, and terrace systems. 
          Engineered for superior thermal performance, acoustic insulation, and timeless design.
        </p>
      </section>

      {/* ── Categories Grid ───────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 mb-32">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <div key={cat.id} className="bg-[#1a1a1b] p-8 border border-[#2a2a2b] hover:border-[#dca95c]/50 transition-colors">
              <h3 className="text-xl font-black uppercase mb-2 text-[#dca95c]">{cat.name}</h3>
              <p className="text-white/50 text-sm">{cat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── All Products Grid ─────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-black uppercase mb-12 border-b border-[#2a2a2b] pb-4">
          All Products
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PRODUCTS.map((p) => (
            <Link
              key={p.id}
              to={`/products/${p.slug}`}
              className="group flex flex-col bg-[#1a1a1b] border border-[#2a2a2b] hover:border-[#dca95c]/40 transition-all duration-300"
            >
              {/* Product Image Placeholder */}
              <div className="aspect-[4/3] bg-[#111112] relative overflow-hidden flex items-center justify-center p-8">
                <div className="w-full h-full border border-white/5 group-hover:border-[#dca95c]/20 transition-colors duration-500">
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent" />
                  <p className="absolute bottom-4 left-6 text-white/20 font-bold tracking-widest uppercase break-all opacity-50 text-[100px] leading-none select-none">
                    {p.name.substring(0, 3)}
                  </p>
                </div>
                {p.isNew && (
                  <span className="absolute top-4 left-4 bg-[#dca95c] text-black text-[10px] font-bold uppercase tracking-widest px-2 py-1">
                    NEW
                  </span>
                )}
              </div>

              {/* Product Info */}
              <div className="p-6 flex flex-col flex-1">
                <div className="mb-4">
                  <p className="text-[#dca95c] text-[10px] font-semibold uppercase tracking-[0.2em] mb-1">
                    {p.category.name}
                  </p>
                  <h3 className="text-2xl font-black uppercase">{p.name}</h3>
                  <p className="text-white/50 text-sm mt-1 line-clamp-2">{p.tagline}</p>
                </div>

                <div className="mt-auto pt-6 flex items-center justify-between border-t border-[#2a2a2b]">
                  <div className="flex gap-4">
                    {p.specs.slice(0, 2).map(spec => (
                      <div key={spec.label}>
                        <p className="text-[10px] text-white/40 uppercase tracking-wider">{spec.label}</p>
                        <p className="text-sm font-semibold text-white/90">{spec.value} <span className="text-[10px] text-[#dca95c]">{spec.unit}</span></p>
                      </div>
                    ))}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#2a2a2b] group-hover:bg-[#dca95c] group-hover:text-black flex items-center justify-center transition-colors">
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

    </main>
  )
}
