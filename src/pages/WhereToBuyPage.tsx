import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { MapPin } from 'lucide-react'
import L from 'leaflet'
import { useTranslation } from 'react-i18next'

// Define the custom Mammut icon
const mammutIcon = new L.Icon({
  iconUrl: '/assets/mammut-logo-icon.png',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
  className: 'drop-shadow-lg'
})

const LOCATIONS = [
  { name: 'Cercedilla', lat: 40.7419, lng: -4.0592 },
  { name: 'Los Molinos', lat: 40.7161, lng: -4.0725 },
  { name: 'Guadarrama', lat: 40.6720, lng: -4.0890 },
  { name: 'Villalba', lat: 40.6394, lng: -3.9937 },
  { name: 'Las Matas', lat: 40.5562, lng: -3.8931 },
  { name: 'Las Rozas', lat: 40.4925, lng: -3.8744 },
  { name: 'Pozuelo', lat: 40.4346, lng: -3.8148 },
  { name: 'Madrid', lat: 40.4168, lng: -3.7038 },
  { name: 'Barcelona', lat: 41.3851, lng: 2.1734 },
  { name: 'Sant Cugat', lat: 41.4721, lng: 2.0863 },
  { name: 'Begur', lat: 41.9540, lng: 3.2078 },
  { name: 'Tarragona', lat: 41.1189, lng: 1.2445 },
  { name: 'Zaragoza', lat: 41.6488, lng: -0.8891 },
  { name: 'Valencia', lat: 39.4699, lng: -0.3763 },
  { name: 'Bilbao', lat: 43.2630, lng: -2.9350 },
  { name: 'San Sebastian de los Reyes', lat: 40.5475, lng: -3.6263 },
  { name: 'Villaviciosa de Odón', lat: 40.3582, lng: -3.8986 },
  { name: 'Boadilla del Monte', lat: 40.4072, lng: -3.8756 },
]

export function WhereToBuyPage() {
  const { t } = useTranslation()

  // Center roughly on Spain
  const center: [number, number] = [40.4168, -3.7038]

  return (
    <div className="bg-mammut-black min-h-screen pt-24 pb-0 font-montserrat flex flex-col">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-6 py-12 w-full">
        <div className="flex items-center gap-4 text-mammut-gold mb-4">
          <MapPin size={32} />
          <span className="tracking-[0.2em] text-sm font-bold uppercase">
            {t('whereToBuy.subtitle', { defaultValue: 'Distribution Network' })}
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-mammut-white uppercase tracking-widest">
          {t('whereToBuy.title', { defaultValue: 'Where to Buy' })}
        </h1>
        <p className="text-mammut-white mt-6 max-w-2xl text-sm leading-relaxed">
          {t('whereToBuy.description', { 
            defaultValue: 'Find an official Mammut Energy distributor near you. Our network spans across key locations in Spain, bringing premium window and door solutions directly to your project.' 
          })}
        </p>
      </div>

      {/* Map Section */}
      <div className="flex-1 w-full relative z-0 mt-8" style={{ minHeight: '600px' }}>
        <MapContainer 
          center={center} 
          zoom={6} 
          scrollWheelZoom={false}
          className="bg-mammut-darker"
          style={{ height: '100%', width: '100%', minHeight: '600px' }}
        >
          {/* Dark theme tile layer (CartoDB Dark Matter) */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          
          {LOCATIONS.map((loc, idx) => (
            <Marker key={idx} position={[loc.lat, loc.lng]} icon={mammutIcon}>
              <Popup className="mammut-popup">
                <div className="bg-mammut-dark p-2 rounded-sm border border-mammut-gold/30">
                  <h3 className="text-mammut-gold font-bold uppercase tracking-widest text-xs mb-1">
                    Mammut Energy
                  </h3>
                  <p className="text-mammut-white text-sm">
                    {loc.name}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Custom CSS to override Leaflet popup defaults for dark theme */}
      <style>{`
        .leaflet-popup-content-wrapper {
          background: #1a1a1a;
          color: #ffffff;
          border: 1px solid rgba(234, 182, 118, 0.3);
          border-radius: 4px;
          padding: 0;
          overflow: hidden;
        }
        .leaflet-popup-tip {
          background: #1a1a1a;
          border-bottom: 1px solid rgba(234, 182, 118, 0.3);
          border-right: 1px solid rgba(234, 182, 118, 0.3);
        }
        .leaflet-popup-close-button {
          color: rgba(255, 255, 255, 0.5) !important;
        }
        .leaflet-popup-close-button:hover {
          color: #eab676 !important;
        }
        .leaflet-container {
          font-family: inherit;
        }
      `}</style>
    </div>
  )
}
