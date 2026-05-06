import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { INSPIRATION_TABS, INSPIRATIONS_DATA } from '../data/inspirations'

export const InspirationsPage: React.FC = () => {
  const { t } = useTranslation()
  const { category } = useParams<{ category: string }>()
  const navigate = useNavigate()

  // Clean up duplicate tabs from the scrape if any
  const uniqueTabs = useMemo(() => {
    const seen = new Set<number>()
    return INSPIRATION_TABS.filter(tab => {
      if (seen.has(tab.id)) return false
      seen.add(tab.id)
      return true
    })
  }, [])

  const [activeTabId, setActiveTabId] = useState<number>(uniqueTabs[0]?.id || 4)
  const [zoomedImage, setZoomedImage] = useState<string | null>(null)

  // Map URL category to tab ID
  useEffect(() => {
    if (category) {
      const matchedTab = uniqueTabs.find(t => t.href.includes(`/${category}/`))
      if (matchedTab) {
        setActiveTabId(matchedTab.id)
      } else {
        // Fallback to "other" if not found
        const fallbackTab = uniqueTabs.find(t => t.href.includes('/other/'))
        if (fallbackTab) {
          setActiveTabId(fallbackTab.id)
          navigate('/inspiration/other/', { replace: true })
        }
      }
    } else {
      // If no category in URL, default to first tab (other)
      const defaultTab = uniqueTabs.find(t => t.href.includes('/other/')) || uniqueTabs[0]
      if (defaultTab) {
        navigate(defaultTab.href.replace('/en', ''), { replace: true })
      }
    }
  }, [category, navigate, uniqueTabs])

  const handleTabClick = (href: string) => {
    // Strip language prefix like /en/ from hrefs
    const cleanHref = href.replace(/^\/[a-z]{2}\//, '/')
    navigate(cleanHref)
  }

  const activeGallery = INSPIRATIONS_DATA[activeTabId] || []

  return (
    <main className="bg-mammut-black min-h-screen pt-32 pb-24 font-sans text-white">
      {/* Hero Header */}
      <section className="text-center px-6 max-w-5xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-widest mb-10">
          {t('inspirations.title', { defaultValue: 'Inspirations' })}
        </h1>
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-4">
          {uniqueTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.href)}
              className={`px-6 py-3 text-sm font-semibold uppercase tracking-widest transition-all ${
                activeTabId === tab.id
                  ? 'bg-mammut-gold text-black shadow-lg shadow-mammut-gold/20'
                  : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#252525] hover:text-white border border-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="container mx-auto px-6 lg:px-12 max-w-[1600px]">
        {activeGallery.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            {t('inspirations.empty', { defaultValue: 'No inspirations found for this category.' })}
          </div>
        ) : (
          /* Masonry-like CSS column layout for gallery */
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {activeGallery.map((item, idx) => (
              <div 
                key={`${item.image}-${idx}`} 
                className={`relative group overflow-hidden bg-black break-inside-avoid rounded-sm border border-gray-800 hover:z-50 hover:scale-[1.75] transition-all duration-500 shadow-xl group hover:shadow-[0_0_40px_rgba(0,0,0,0.8)] ${item.productLink && item.productLink !== '#' ? 'cursor-pointer' : 'cursor-zoom-in'}`}
                onClick={() => {
                  if (item.productLink && item.productLink !== '#') {
                    navigate(item.productLink)
                  } else {
                    setZoomedImage(item.image)
                  }
                }}
              >
                {/* Image */}
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-auto object-cover group-hover:scale-105 transition-all duration-700"
                  loading="lazy"
                />
                
                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <h3 className="text-xl font-bold uppercase tracking-wider text-white mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    {item.name}
                  </h3>
                  
                  {item.productLink && item.productLink !== '#' && (
                    <div 
                      className="inline-block mt-2"
                      onClick={(e) => e.stopPropagation()} /* Prevent zoom modal when clicking link */
                    >
                      <Link 
                        to={item.productLink} 
                        className="text-mammut-gold text-xs font-bold uppercase tracking-widest hover:text-[#f3c47f] flex items-center gap-2 w-max"
                      >
                        {t('inspirations.goToProduct', { defaultValue: 'Go to product' })}
                        <span className="text-lg">→</span>
                      </Link>
                    </div>
                  )}
                </div>
                
                {/* Thin border ring on hover */}
                <div className="absolute inset-0 ring-1 ring-inset ring-white/0 pointer-events-none transition-colors group-hover:ring-mammut-gold/50" />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Lightbox Modal for Zoomed Image */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 cursor-zoom-out"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-w-6xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <img 
              src={zoomedImage} 
              alt="Zoomed inspiration" 
              className="max-w-full max-h-full object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself if we wanted
            />
            {/* Close Button */}
            <button 
              className="absolute top-4 right-4 text-white/50 hover:text-white bg-black/50 hover:bg-black rounded-full p-2 transition-all"
              onClick={() => setZoomedImage(null)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
