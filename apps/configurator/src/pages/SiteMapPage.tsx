import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { LayoutGrid, Map, Box, Info, ArrowRight, Shield } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import * as ProductDetailsData from '../data/productDetails'
import type { ProductDetailData } from '../data/productDetails'

export function SiteMapPage() {
  const { t } = useTranslation()

  // Dynamically extract all detailed products from the registry
  const allProducts = useMemo(() => {
    return Object.values(ProductDetailsData)
      .filter((v): v is ProductDetailData => v !== null && typeof v === 'object' && 'slug' in v && 'name' in v)
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [])

  // Group products by rough category based on slug and name (since productDetails.ts doesn't enforce strict category IDs)
  const groupedProducts = useMemo(() => {
    const groups: Record<string, ProductDetailData[]> = {
      pvcWindows: [],
      aluWindows: [],
      woodWindows: [],
      doors: [],
      terrace: [],
      shutters: [],
      other: []
    }

    allProducts.forEach(product => {
      const s = product.slug.toLowerCase()
      const n = product.name.toLowerCase()

      if (s.includes('shutter') || s.includes('blind') || s.includes('venetian')) {
        groups.shutters.push(product)
      } else if (s.includes('door') || n.includes('door') || s.includes('drutex-doors')) {
        groups.doors.push(product)
      } else if (s.includes('hs') || s.includes('terrace') || s.includes('slide') || s.includes('patio')) {
        groups.terrace.push(product)
      } else if (s.includes('alu') || s.includes('mb-')) {
        groups.aluWindows.push(product)
      } else if (n.includes('wood') || s.includes('wood') || s.includes('softline')) {
        groups.woodWindows.push(product)
      } else if (s.includes('iglo') || s.includes('pvc') || s.includes('ideal')) {
        groups.pvcWindows.push(product)
      } else {
        groups.other.push(product)
      }
    })

    return groups
  }, [allProducts])

  const generalLinks = [
    { label: t('nav.home', { defaultValue: 'Home' }), href: '/' },
    { label: t('nav.products', { defaultValue: 'All Products' }), href: '/products' },
    { label: t('nav.configurator', { defaultValue: 'Configurator' }), href: '/configurator' },
    { label: t('nav.shop', { defaultValue: 'Shop' }), href: '/shop' },
    { label: t('nav.outlet', { defaultValue: 'Outlet' }), href: '/outlet' },
    { label: t('nav.intelligentHome', { defaultValue: 'Intelligent Home' }), href: '/inteligentny-dom' },
    { label: t('nav.inspirations', { defaultValue: 'Inspirations' }), href: '/inspiration' },
    { label: t('nav.whereToBuy', { defaultValue: 'Where to Buy' }), href: '/where-to-buy' },
  ]

  const partnerLinks = [
    { label: 'Partner Dashboard', href: '/partner' },
    { label: 'Partner Leads', href: '/partner/leads' },
    { label: 'Partner Profile', href: '/partner/profile' },
  ]

  const aboutLinks = [
    { label: 'History', href: '/about/history' },
    { label: 'Quality', href: '/about/quality' },
    { label: 'Innovation', href: '/about/innovation' },
    { label: 'Sustainability', href: '/about/sustainability' },
    { label: 'Contact', href: '/contact' },
  ]

  return (
    <div className="bg-mammut-black min-h-screen pt-32 pb-24 font-montserrat">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="mb-16 border-b border-mammut-gold/30 pb-10">
          <div className="flex items-center gap-4 text-mammut-gold mb-4">
            <Map size={32} />
            <span className="tracking-[0.2em] text-sm font-bold uppercase">Index</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-mammut-white uppercase tracking-widest">
            {t('footer.sitemap', { defaultValue: 'Site Map' })}
          </h1>
          <p className="text-mammut-white mt-4 max-w-2xl text-sm leading-relaxed">
            Navigate through our entire digital ecosystem. This directory automatically updates as we expand our product portfolio and add new pages.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Column 1: General & Pages */}
          <div className="space-y-12">
            
            {/* General Pages */}
            <section className="bg-mammut-dark border border-mammut-border p-8 hover:border-mammut-gold/50 transition-colors">
              <div className="flex items-center gap-3 mb-6 text-mammut-white">
                <LayoutGrid size={20} className="text-mammut-gold" />
                <h2 className="text-lg font-bold tracking-widest uppercase">Main Navigation</h2>
              </div>
              <ul className="space-y-3">
                {generalLinks.map(link => (
                  <li key={link.href}>
                    <Link to={link.href} className="text-sm text-mammut-white/70 hover:text-mammut-gold flex items-center gap-2 group transition-colors">
                      <ArrowRight size={12} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-mammut-gold" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            {/* About & Contact */}
            <section className="bg-mammut-dark border border-mammut-border p-8 hover:border-mammut-gold/50 transition-colors">
              <div className="flex items-center gap-3 mb-6 text-mammut-white">
                <Info size={20} className="text-mammut-gold" />
                <h2 className="text-lg font-bold tracking-widest uppercase">Corporate</h2>
              </div>
              <ul className="space-y-3">
                {aboutLinks.map(link => (
                  <li key={link.href}>
                    <Link to={link.href} className="text-sm text-mammut-white/70 hover:text-mammut-gold flex items-center gap-2 group transition-colors">
                      <ArrowRight size={12} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-mammut-gold" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            {/* Partners */}
            <section className="bg-mammut-dark border border-mammut-border p-8 hover:border-mammut-gold/50 transition-colors">
              <div className="flex items-center gap-3 mb-6 text-mammut-white">
                <Shield size={20} className="text-mammut-gold" />
                <h2 className="text-lg font-bold tracking-widest uppercase">Partners</h2>
              </div>
              <ul className="space-y-3">
                {partnerLinks.map(link => (
                  <li key={link.href}>
                    <Link to={link.href} className="text-sm text-mammut-white/70 hover:text-mammut-gold flex items-center gap-2 group transition-colors">
                      <ArrowRight size={12} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-mammut-gold" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

          </div>

          {/* Column 2 & 3: Dynamic Products */}
          <div className="md:col-span-2 space-y-12">
            
            <div className="flex items-center gap-3 text-mammut-white border-b border-mammut-border pb-6">
              <Box size={24} className="text-mammut-gold" />
              <h2 className="text-2xl font-bold tracking-widest uppercase">Product Catalog</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              
              {/* PVC Windows */}
              {groupedProducts.pvcWindows.length > 0 && (
                <div>
                  <h3 className="text-mammut-gold font-bold tracking-widest uppercase text-xs mb-4">PVC Windows</h3>
                  <ul className="space-y-2.5">
                    {groupedProducts.pvcWindows.map(p => (
                      <li key={p.slug}>
                        <Link to={`/products/${p.slug}`} className="text-sm text-mammut-white/70 hover:text-white transition-colors block">
                          {p.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Aluminium Windows */}
              {groupedProducts.aluWindows.length > 0 && (
                <div>
                  <h3 className="text-mammut-gold font-bold tracking-widest uppercase text-xs mb-4">Aluminium Windows</h3>
                  <ul className="space-y-2.5">
                    {groupedProducts.aluWindows.map(p => (
                      <li key={p.slug}>
                        <Link to={`/products/${p.slug}`} className="text-sm text-mammut-white/70 hover:text-white transition-colors block">
                          {p.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Doors */}
              {groupedProducts.doors.length > 0 && (
                <div>
                  <h3 className="text-mammut-gold font-bold tracking-widest uppercase text-xs mb-4">Entry Doors</h3>
                  <ul className="space-y-2.5">
                    {groupedProducts.doors.map(p => (
                      <li key={p.slug}>
                        <Link to={`/products/${p.slug}`} className="text-sm text-mammut-white/70 hover:text-white transition-colors block">
                          {p.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Terrace Systems */}
              {groupedProducts.terrace.length > 0 && (
                <div>
                  <h3 className="text-mammut-gold font-bold tracking-widest uppercase text-xs mb-4">Terrace Systems</h3>
                  <ul className="space-y-2.5">
                    {groupedProducts.terrace.map(p => (
                      <li key={p.slug}>
                        <Link to={`/products/${p.slug}`} className="text-sm text-mammut-white/70 hover:text-white transition-colors block">
                          {p.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Shutters & Blinds */}
              {groupedProducts.shutters.length > 0 && (
                <div>
                  <h3 className="text-mammut-gold font-bold tracking-widest uppercase text-xs mb-4">Shutters & Blinds</h3>
                  <ul className="space-y-2.5">
                    {groupedProducts.shutters.map(p => (
                      <li key={p.slug}>
                        <Link to={`/products/${p.slug}`} className="text-sm text-mammut-white/70 hover:text-white transition-colors block">
                          {p.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Wood Windows */}
              {groupedProducts.woodWindows.length > 0 && (
                <div>
                  <h3 className="text-mammut-gold font-bold tracking-widest uppercase text-xs mb-4">Wood Windows</h3>
                  <ul className="space-y-2.5">
                    {groupedProducts.woodWindows.map(p => (
                      <li key={p.slug}>
                        <Link to={`/products/${p.slug}`} className="text-sm text-mammut-white/70 hover:text-white transition-colors block">
                          {p.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Other Products */}
              {groupedProducts.other.length > 0 && (
                <div>
                  <h3 className="text-mammut-gold font-bold tracking-widest uppercase text-xs mb-4">More Products</h3>
                  <ul className="space-y-2.5">
                    {groupedProducts.other.map(p => (
                      <li key={p.slug}>
                        <Link to={`/products/${p.slug}`} className="text-sm text-mammut-white/70 hover:text-white transition-colors block">
                          {p.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
