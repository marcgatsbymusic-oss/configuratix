import { Link } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'

const PVC_PRODUCTS = [
  { 
    name: 'Ideal 7000 NL', 
    slug: 'ideal-7000-nl', 
    img: '/assets/mwindows/pvc/ideal-7000-nl.jpg', 
    hoverImg: '/assets/mwindows/pvc/ideal-7000-nl-hover.jpg' 
  },
  { 
    name: 'Iglo 5', 
    slug: 'iglo-5', 
    img: '/assets/mwindows/pvc/iglo-5.jpg', 
    hoverImg: '/assets/mwindows/pvc/iglo-5-hover.jpg' 
  },
  { 
    name: 'Iglo 5 Classic', 
    slug: 'iglo-5-classic', 
    img: '/assets/mwindows/pvc/iglo-5-classic.jpg', 
    hoverImg: '/assets/mwindows/pvc/iglo-5-classic-hover.jpg' 
  },
  { 
    name: 'Iglo Energy', 
    slug: 'iglo-energy', 
    img: '/assets/mwindows/pvc/iglo-energy.jpg', 
    hoverImg: '/assets/mwindows/pvc/iglo-energy-hover.jpg' 
  },
  { 
    name: 'Iglo Energy Classic', 
    slug: 'iglo-energy-classic', 
    img: '/assets/mwindows/pvc/iglo-energy-classic.jpg', 
    hoverImg: '/assets/mwindows/pvc/iglo-energy-classic-hover.jpg' 
  },
  { 
    name: 'Iglo EXT', 
    slug: 'iglo-ext', 
    img: '/assets/mwindows/pvc/iglo-ext.jpg', 
    hoverImg: '/assets/mwindows/pvc/iglo-ext-hover.jpg' 
  },
  { 
    name: 'Iglo Light', 
    slug: 'iglo-light', 
    img: '/assets/mwindows/pvc/iglo-light.jpg', 
    hoverImg: '/assets/mwindows/pvc/iglo-light-hover.jpg' 
  },
  { 
    name: 'Iglo Premier', 
    slug: 'iglo-premier', 
    img: '/assets/mwindows/pvc/iglo-premier.jpg', 
    hoverImg: '/assets/mwindows/pvc/iglo-premier-hover.jpg' 
  },
]

export function PvcWindowsPage() {

  return (
    <main className="min-h-screen bg-mammut-black pt-28 pb-20">
      {/* ── Header & Breadcrumbs ────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 mb-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-mammut-white/50">
            <Link to="/" className="hover:text-mammut-gold transition-colors">Home</Link>
            <span className="text-mammut-gold">/</span>
            <Link to="/products" className="hover:text-mammut-gold transition-colors">Windows</Link>
            <span className="text-mammut-gold">/</span>
            <span className="text-mammut-white">PVC Windows</span>
          </nav>
          
          <p className="text-xs font-bold text-mammut-white/40 uppercase tracking-widest">
            Showing all {PVC_PRODUCTS.length} results
          </p>
        </div>

        <h1 className="text-5xl md:text-6xl font-black uppercase mb-4 text-mammut-white">
          PVC Windows
        </h1>
        <div className="w-16 h-1 bg-mammut-gold mb-8"></div>
      </section>

      {/* ── Products Grid ───────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {PVC_PRODUCTS.map((p) => (
            <div key={p.slug} className="group flex flex-col bg-mammut-dark border border-mammut-border hover:border-mammut-gold/40 transition-all duration-300">
              
              {/* Images container */}
              <Link 
                to={`/products/${p.slug}`} 
                className="relative aspect-square overflow-hidden bg-white/5 block"
              >
                {/* Main Image */}
                <img 
                  src={p.img} 
                  alt={p.name} 
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0" 
                  loading="lazy" 
                />
                
                {/* Hover Image */}
                <img 
                  src={p.hoverImg} 
                  alt={`${p.name} alt view`} 
                  className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100" 
                  loading="lazy" 
                />
                
                {/* Quick Add overlay button */}
                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 z-10 flex justify-center">
                  <button className="bg-mammut-gold text-black w-10 h-10 flex items-center justify-center hover:bg-white transition-colors hover:scale-110 shadow-lg">
                    <ShoppingCart size={18} />
                  </button>
                </div>
              </Link>
              
              {/* Product Info */}
              <div className="p-5 flex flex-col items-center text-center border-t border-mammut-border">
                <Link to={`/products/${p.slug}`} className="block w-full">
                  <h3 className="text-lg font-black uppercase text-mammut-white hover:text-mammut-gold transition-colors mb-2">
                    {p.name}
                  </h3>
                </Link>
                <div className="text-[10px] uppercase tracking-widest text-mammut-white/50 border border-mammut-border px-3 py-1">
                  PVC Windows
                </div>
              </div>
              
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
