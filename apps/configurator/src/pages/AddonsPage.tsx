import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { X, List } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import addonsData from '../data/addonsData.json'

interface AddonItem {
  image: string;
  localImage: string;
  title: string;
  descriptions: string[];
  applicableProducts: string[];
}

export function AddonsPage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const [items, setItems] = useState<AddonItem[]>([])

  useEffect(() => {
    if (id && addonsData[id as keyof typeof addonsData]) {
      setItems(addonsData[id as keyof typeof addonsData] as AddonItem[])
    } else {
      setItems([])
    }
  }, [id])

  // Get the title from our translations or fallback
  const getTitle = () => {
    switch(id) {
      case '4': return t('addons.type4', 'Muntin bars in doors and windows');
      case '5': return t('addons.type5', 'Accessories Spacers');
      case '6': return t('addons.type6', 'Accessories Reliable fittings');
      case '272': return t('addons.type272', 'Sandblasted glass');
      case '602': return t('addons.type602', 'Mounting accessories');
      default: return t('addons.main', 'Additions for doors and windows');
    }
  }

  return (
    <div className="min-h-screen bg-mammut-darker">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-mammut-black">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-gradient-to-t from-mammut-black via-mammut-black/80 to-transparent z-10" />
          <img 
            src="/assets/heroes/accessories_hero.jpg" 
            alt="Addons Hero" 
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://www.drutex.eu/media/_upload/_products/dodatki/dodatki_head.jpg'
            }}
          />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-mammut-white mb-6 product-hero-title">
              {getTitle()}
            </h1>
          </div>
        </div>
      </section>

      {/* Grid Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {items.map((item, idx) => (
              <AddonCard key={idx} item={item} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function AddonCard({ item }: { item: AddonItem }) {
  const { t } = useTranslation()
  const [showOverlay, setShowOverlay] = useState(false)

  return (
    <div className="group relative bg-white border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
      <div className="relative aspect-square p-6 bg-gray-50 flex items-center justify-center">
        <img 
          src={item.localImage || ('https://www.drutex.eu' + item.image)} 
          alt={item.title} 
          className="max-w-full max-h-full object-contain"
        />
        
        {item.applicableProducts.length > 0 && (
          <button 
            onClick={() => setShowOverlay(true)}
            className="absolute top-4 right-4 w-10 h-10 bg-mammut-dark text-mammut-white flex items-center justify-center hover:bg-mammut hover:text-white transition-colors shadow-lg z-10"
            title={t('addons.viewApplications', 'View application possibilities')}
          >
            <List className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
        {item.descriptions.map((desc, i) => (
          <p key={i} className="text-sm text-gray-600 mb-1">{desc}</p>
        ))}
      </div>

      {/* Overlay for Application Possibilities */}
      {showOverlay && (
        <div className="absolute inset-0 bg-mammut-darker/95 backdrop-blur-sm z-20 flex flex-col p-6 animate-in fade-in duration-200">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-mammut-yellow font-bold uppercase tracking-wider text-sm">
              {t('addons.applicationPossibilities', 'Application possibilities in:')}
            </h4>
            <button 
              onClick={() => setShowOverlay(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="overflow-y-auto pr-2 custom-scrollbar flex-1">
            <ul className="space-y-3">
              {item.applicableProducts.map((prod, i) => (
                <li key={i} className="text-mammut-white/90 text-sm flex items-start">
                  <span className="text-mammut-yellow mr-2 mt-1">•</span>
                  {prod}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
