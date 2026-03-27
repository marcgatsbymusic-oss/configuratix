import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { X, ChevronRight, ChevronLeft, ThermometerSnowflake, HandCoins, Ear, Loader2, Sparkles, CalendarCheck, PlayCircle, CloudRain, Sun, Home, MapPin } from 'lucide-react';
import { CITIES_DB } from '../../data/spanishGeodata';
import { calculateCTEZone } from '../../utils/cteCalculator';
import { CONFIG_SCHEMA, WINDOW_TYPES } from './types';
import { useOrderStore, type OrderItem } from '../../store/useOrderStore';

interface Props {
  onClose: () => void;
  onComplete: (material: string, profile: string, glazing: string) => void;
  initialStep?: number;
}

export function AIGuidedAssistant({ onClose, onComplete, initialStep = 1 }: Props) {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState(initialStep);
  const [province, setProvince] = useState('');
  const [provinceSearch, setProvinceSearch] = useState('');
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
  
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [altitude, setAltitude] = useState<number | null>(null);
  const [cteZone, setCteZone] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [weatherData, setWeatherData] = useState<{ current: number, min: number, max: number, code: number, wind: number, windMax: number } | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [showExtraWeather, setShowExtraWeather] = useState(false);

  const [material, setMaterial] = useState('');
  const [budget, setBudget] = useState('');
  
  const [timeline, setTimeline] = useState('');
  
  const [housing, setHousing] = useState('');
  const [noise, setNoise] = useState('');

  // Counters
  const [windowsCount, setWindowsCount] = useState(1);
  const [balconyCount, setBalconyCount] = useState(0);
  const [slidingCount, setSlidingCount] = useState(0);
  const [houseDoorCount, setHouseDoorCount] = useState(0);
  const [garageDoorCount, setGarageDoorCount] = useState(0);

  const [isProcessing, setIsProcessing] = useState(false);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [showVideo, setShowVideo] = useState(false);

  // Preset configuration flow state
  const startOrder = useOrderStore(s => s.startOrder);
  const [itemConfigList, setItemConfigList] = useState<Omit<OrderItem, 'id' | 'savedConfig' | 'isConfigured'>[]>([]);
  const currentItemIndex = 0;

  // Current item temporary state
  const [currentRoomName, setCurrentRoomName] = useState('');
  const [currentQuantity, setCurrentQuantity] = useState(1);
  const [currentOrientation, setCurrentOrientation] = useState('South');
  const [currentWindowType, setCurrentWindowType] = useState('');
  const [currentOpenings, setCurrentOpenings] = useState<string[]>([]);
  const [currentGlazing, setCurrentGlazing] = useState('');
  const [currentBlinds, setCurrentBlinds] = useState('');

  const allProvinces = Array.from(new Set(CITIES_DB.map(c => c.p))).sort();
  const filteredProvinces = allProvinces.filter(p => p.toLowerCase().includes(provinceSearch.toLowerCase()));
  
  const availableCities = CITIES_DB.filter(c => c.p === province);
  const filteredCities = availableCities.filter(c => c.n.toLowerCase().includes(citySearch.toLowerCase()));

  const fetchWeather = async (lat: number, lon: number) => {
    setWeatherLoading(true);
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,wind_speed_10m_max&timezone=auto`);
      const data = await res.json();
      if (data && data.current_weather && data.daily) {
        setWeatherData({
          current: data.current_weather.temperature,
          code: data.current_weather.weathercode,
          wind: data.current_weather.windspeed,
          max: data.daily.temperature_2m_max[0],
          min: data.daily.temperature_2m_min[0],
          windMax: data.daily.wind_speed_10m_max[0]
        });
      }
    } catch (e) {
      console.error("Failed to fetch weather", e);
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleCitySelect = async (cityName: string) => {
    const cData = CITIES_DB.find(c => c.n === cityName && c.p === province);
    if (cData) {
      setAltitude(cData.a);
      const zone = calculateCTEZone(province, cData.a);
      setCteZone(zone.combined);
      
      setWeatherLoading(true);
      setShowExtraWeather(false);
      try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const { latitude, longitude } = data.results[0];
          fetchWeather(latitude, longitude);
        } else {
          setWeatherLoading(false);
        }
      } catch (e) {
        console.error("Failed to fetch coordinates for weather", e);
        setWeatherLoading(false);
      }
    }
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert(t('assistant.geoNotSupported', 'Geolocation is not supported by your browser.'));
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        setShowExtraWeather(false);
        fetchWeather(latitude, longitude);
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`);
        const data = await res.json();
        
        if (data && data.address) {
          const fetchedProvince = data.address.province || data.address.state || '';
          const fetchedCity = data.address.city || data.address.town || data.address.village || data.address.municipality || '';
          
          if (fetchedProvince) {
            const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
            const matchedProv = allProvinces.find(p => normalize(p) === normalize(fetchedProvince) || normalize(p).includes(normalize(fetchedProvince)) || normalize(fetchedProvince).includes(normalize(p)));
            
            if (matchedProv) {
              setProvince(matchedProv);
              setProvinceSearch(matchedProv);
              setCitySearch('');
              setAltitude(null);
              setCteZone('');
              
              if (fetchedCity) {
                const provCities = CITIES_DB.filter(c => c.p === matchedProv);
                const matchedCity = provCities.find(c => normalize(c.n) === normalize(fetchedCity) || normalize(c.n).includes(normalize(fetchedCity)) || normalize(fetchedCity).includes(normalize(c.n)));
                
                if (matchedCity) {
                  setCitySearch(matchedCity.n);
                  setAltitude(matchedCity.a);
                  const zone = calculateCTEZone(matchedProv, matchedCity.a);
                  setCteZone(zone.combined);
                }
              }
            } else {
              alert(t('assistant.provNotFound', 'Could not accurately match your province in our database.'));
            }
          }
        }
      } catch (e) {
        console.error("Geocoding failed", e);
      } finally {
        setIsLocating(false);
      }
    }, (error) => {
      console.error(error);
      setIsLocating(false);
      alert(t('assistant.geoError', 'Unable to retrieve your location. Please ensure you have granted permission.'));
    });
  };

  const climateData = useMemo(() => {
    if (!altitude || !province) return null;
    const baseTemp = 18 - (altitude / 200);
    return {
      avgTemp: baseTemp.toFixed(1),
      radiation: (1600 + (altitude > 500 ? 200 : 0)).toString(),
      precipitation: (cteZone.includes('A') || cteZone.includes('B') ? 400 : 800) + Math.round(altitude / 10)
    };
  }, [altitude, province, cteZone]);

  const processRecommendation = () => {
    setIsProcessing(true);
    setStep(5);
    
    setTimeout(() => {
      let recMat = 'PVC';
      if (material === 'alu') recMat = 'Aluminium';
      if (material === 'wood') recMat = 'Wood';

      let recProf = 'iglo5';
      let recGlaze = '4/16/4';
      
      const isCold = cteZone.includes('D') || cteZone.includes('E');
      
      if (isCold) {
         recProf = 'igloedge';
         recGlaze = '4/18/4/18/4 TG';
      }
      
      if (noise === 'high') {
         recGlaze = '33.1 Safe';
         if (recProf === 'iglo5') recProf = 'igloenergy';
      }

      if (budget === 'low') {
         recProf = recMat === 'Aluminium' ? 'mb-45' : 'iglolight';
         recGlaze = '4/16/4';
      } else if (budget === 'premium') {
         recProf = recMat === 'Aluminium' ? 'mb-86n-si' : 'igloedge';
         recGlaze = '4/18/4/18/4 TG';
      } else if (recMat === 'Wood') {
         recProf = 'softline68';
      }

      setRecommendation({ material: recMat, profile: recProf, glazing: recGlaze });
      
      // Build the list of items based on counters
      const items: typeof itemConfigList = [];
      let index = 1;

      const addItems = (count: number, type: OrderItem['itemType']) => {
        for(let i=0; i<count; i++) {
          items.push({
            index: index++,
            itemType: type,
            roomName: '',
            roomType: '',
            orientation: 'South',
            quantity: 1,
            material: recMat,
            profile: recProf,
            glazing: recGlaze,
            windowType: '',
            openings: [],
            blinds: ''
          });
        }
      };

      addItems(windowsCount, 'window');
      addItems(balconyCount, 'balcony_door');
      addItems(slidingCount, 'sliding_door');
      addItems(houseDoorCount, 'house_door');
      addItems(garageDoorCount, 'garage_door');

      setItemConfigList(items);

      setIsProcessing(false);
    }, 3500);
  };

  const getDeliveryEstimate = () => {
    let days = 10;
    const date = new Date();
    
    // Calculate 10 working days
    while (days > 0) {
      date.setDate(date.getDate() + 1);
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        days--;
      }
    }
    
    // Inject dynamic holiday delays based on municipal selection
    let holidayBuffer = 0;
    const month = date.getMonth();
    const p = province.toLowerCase();
    
    if (p.includes('valencia') && month === 2) holidayBuffer = 4; // Fallas
    if (p.includes('sevilla') && month === 3) holidayBuffer = 4; // Feria de Abril
    if (p.includes('madrid') && (month === 4 || month === 10)) holidayBuffer = 2; // San Isidro / Almudena
    if (p.includes('barcelona') && month === 8) holidayBuffer = 2; // La Mercè
    if (p.includes('zaragoza') && month === 9) holidayBuffer = 3; // Fiestas del Pilar
    if (p.includes('pamplona') || p.includes('navarra') && month === 6) holidayBuffer = 5; // San Fermines
    if (month === 7 || month === 11) holidayBuffer = 3; // Global August / Christmas delays
    
    // Add buffers skipping weekends
    while (holidayBuffer > 0) {
       date.setDate(date.getDate() + 1);
       if (date.getDay() !== 0 && date.getDay() !== 6) holidayBuffer--;
    }

    return date.toLocaleDateString(i18n.language || 'en-US', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="animate-fade-in">
            <div className="w-16 h-16 bg-[#eab676]/20 text-[#eab676] rounded-full flex items-center justify-center mb-6 drop-shadow-[0_0_15px_rgba(234,182,118,0.2)]">
              <ThermometerSnowflake size={32} />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-4 uppercase tracking-tight drop-shadow-md">{t('assistant.geoTitle')}</h2>
            <div className="bg-black/40 border border-[#3a3a3b] p-6 rounded-2xl mb-8 max-w-lg relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#eab676]"></div>
              <div className="font-medium text-sm md:text-base leading-relaxed relative z-10 whitespace-pre-wrap tracking-wide drop-shadow-md" style={{ color: '#ffffff' }}>
                {t('assistant.geoDesc')}
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <label className="text-xs font-black text-white uppercase tracking-widest mb-2 block">{t('assistant.province')}</label>
                <div className="relative">
                  <input 
                    type="text"
                    value={provinceSearch}
                    onChange={e => { setProvinceSearch(e.target.value); setShowProvinceDropdown(true); }}
                    onFocus={() => setShowProvinceDropdown(true)}
                    onBlur={() => setTimeout(() => setShowProvinceDropdown(false), 200)}
                    placeholder={t('assistant.selectProv', 'Search Province...')}
                    className="w-full bg-[#111112] border-2 border-[#3a3a3b] font-black p-4 rounded-xl text-white focus:outline-none focus:border-[#eab676]"
                  />
                  {showProvinceDropdown && (
                    <ul className="absolute z-50 w-full mt-2 bg-[#1a1a1b] border-2 border-[#2a2a2b] rounded-xl max-h-60 overflow-y-auto shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
                      {filteredProvinces.length > 0 ? filteredProvinces.map(p => (
                        <li 
                          key={p}
                          onMouseDown={() => { 
                            setProvinceSearch(p); 
                            setProvince(p); 
                            setShowProvinceDropdown(false); 
                            setCitySearch(''); 
                            setAltitude(null); 
                            setCteZone(''); 
                          }}
                          className="p-4 text-white/90 hover:bg-[#eab676] hover:text-black font-black cursor-pointer transition-colors border-b border-[#2a2a2b] last:border-0"
                        >
                          {p}
                        </li>
                      )) : (
                        <li className="p-4 text-white/50 italic text-center text-sm font-bold">No matching provinces found</li>
                      )}
                    </ul>
                  )}
                </div>
              </div>
              
              <div className={`transition-all duration-300 relative ${province ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                <label className="text-xs font-black text-white uppercase tracking-widest mb-2 block">{t('assistant.city')}</label>
                <input 
                  type="text"
                  value={citySearch}
                  onChange={e => { setCitySearch(e.target.value); setShowCityDropdown(true); }}
                  onFocus={() => setShowCityDropdown(true)}
                  onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
                  placeholder={t('assistant.selectCity')}
                  className="w-full bg-[#111112] border-2 border-[#3a3a3b] font-black p-4 rounded-xl text-white focus:outline-none focus:border-[#eab676]"
                />
                
                {showCityDropdown && province && (
                  <ul className="absolute z-50 w-full mt-2 bg-[#1a1a1b] border-2 border-[#2a2a2b] rounded-xl max-h-60 overflow-y-auto shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
                    {filteredCities.length > 0 ? filteredCities.map(c => (
                      <li 
                        key={c.n}
                        onMouseDown={() => { 
                          setCitySearch(c.n); 
                          setShowCityDropdown(false); 
                          handleCitySelect(c.n); 
                        }}
                        className="p-4 text-white/90 hover:bg-[#eab676] hover:text-black font-black cursor-pointer transition-colors border-b border-[#2a2a2b] last:border-0"
                      >
                        {c.n}
                      </li>
                    )) : (
                      <li className="p-4 text-white/50 italic text-center text-sm font-bold">No matching municipalities found</li>
                    )}
                  </ul>
                )}
              </div>
              
              <div className="pt-2">
                <button 
                  onClick={handleUseLocation} 
                  disabled={isLocating}
                  className="flex items-center justify-center gap-3 w-full bg-[#1a1a1b] border-2 border-[#3a3a3b] hover:border-[#eab676] text-white p-4 rounded-xl font-black transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:hover:border-[#3a3a3b] disabled:hover:scale-100"
                >
                  {isLocating ? <Loader2 className="animate-spin text-[#eab676]" size={20} /> : <MapPin size={20} className="text-[#eab676]" />}
                  <span className="tracking-widest uppercase text-sm">{t('assistant.useMyLocation', 'USE MY LOCATION')}</span>
                </button>
              </div>
            </div>

            {cteZone && climateData && (
              <div className="bg-[#111112] border border-[#eab676]/20 rounded-xl p-5 mb-8 animate-fade-in shadow-[0_0_30px_rgba(234,182,118,0.05)]">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 pb-4 border-b border-white/5">
                  <div>
                    <div className="text-xs font-black text-[#eab676] uppercase tracking-[0.2em] mb-1">{t('assistant.topoEngine', 'Topographical Engine')}</div>
                    <div className="text-white/90 font-bold text-sm">{t('assistant.altitude', 'Altitude')}: <span className="text-white font-black">{altitude}m</span></div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mb-1">{t('assistant.cteZone', 'CTE DB-HE CLIMATE ZONE')}</div>
                    <div className="text-4xl font-black text-[#eab676] uppercase tracking-widest leading-none drop-shadow-md">{cteZone}</div>
                  </div>
                </div>

                {/* Climate Data Extraction */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#1a1a1b] border border-[#2a2a2b] p-3 rounded-lg flex flex-col items-center text-center">
                    <Sun size={20} className="text-[#eab676] mb-2" />
                    <div className="text-[9px] font-black text-white/50 uppercase tracking-wider mb-1">Radiation</div>
                    <div className="text-sm font-black text-white">{climateData.radiation} <span className="text-[10px] text-white/40">kWh/m²</span></div>
                  </div>
                  <div className="bg-[#1a1a1b] border border-[#2a2a2b] p-3 rounded-lg flex flex-col items-center text-center">
                    <ThermometerSnowflake size={20} className="text-blue-400 mb-2" />
                    <div className="text-[9px] font-black text-white/50 uppercase tracking-wider mb-1">Avg Temp</div>
                    <div className="text-sm font-black text-white">{climateData.avgTemp} <span className="text-[10px] text-white/40">°C</span></div>
                  </div>
                  <div className="bg-[#1a1a1b] border border-[#2a2a2b] p-3 rounded-lg flex flex-col items-center text-center">
                    <CloudRain size={20} className="text-slate-400 mb-2" />
                    <div className="text-[9px] font-black text-white/50 uppercase tracking-wider mb-1">Precipitation</div>
                    <div className="text-sm font-black text-white">{climateData.precipitation} <span className="text-[10px] text-white/40">mm/yr</span></div>
                  </div>
                </div>

                {/* Live Weather Widget */}
                {(weatherLoading || weatherData) && (
                   <div className="mt-4 bg-[#1a1a1b] border border-[#2a2a2b] rounded-lg p-4 relative overflow-hidden transition-all duration-300">
                     {weatherLoading ? (
                       <div className="flex justify-center items-center py-2">
                         <Loader2 className="animate-spin text-[#eab676]" size={20} />
                         <span className="text-xs font-bold text-white/50 ml-2 uppercase tracking-widest">{t('assistant.loadingWeather', 'Loading Live Weather...')}</span>
                       </div>
                     ) : weatherData && (
                       <>
                         <div className="flex justify-between items-center">
                           <div className="flex items-center gap-3">
                             <div className="text-[#eab676] bg-[#eab676]/10 p-2 rounded-lg">
                               <Sun size={24} />
                             </div>
                             <div>
                               <div className="text-[10px] font-black text-white/50 uppercase tracking-widest">{t('assistant.liveWeather', 'Current Weather')}</div>
                               <div className="text-xl font-black text-white">{weatherData.current}°C</div>
                             </div>
                           </div>
                           <button onClick={() => setShowExtraWeather(!showExtraWeather)} className="text-[10px] font-black text-white/70 uppercase tracking-wider hover:text-white hover:border-[#eab676] transition-colors border border-[#3a3a3b] px-3 py-1.5 rounded-lg flex items-center gap-1.5 focus:outline-none">
                             {t('assistant.addInfo', 'Additional Info')} 
                             <span className="text-[#eab676]">{showExtraWeather ? '−' : '+'}</span>
                           </button>
                         </div>
                         <div className={`grid grid-cols-2 gap-y-4 gap-x-3 transition-all duration-500 overflow-hidden ${showExtraWeather ? 'mt-4 pt-4 border-t border-[#3a3a3b] max-h-60 opacity-100' : 'max-h-0 opacity-0 m-0 p-0 border-transparent'}`}>
                           <div className="flex flex-col">
                             <div className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">{t('assistant.lowestTemp', 'Lowest Temperature')}</div>
                             <div className="text-base font-black text-blue-400">{weatherData.min}°C</div>
                           </div>
                           <div className="flex flex-col">
                             <div className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">{t('assistant.highestTemp', 'Highest Temperature')}</div>
                             <div className="text-base font-black text-red-500">{weatherData.max}°C</div>
                           </div>
                           <div className="flex flex-col">
                             <div className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">{t('assistant.currentWind', 'Current Wind')}</div>
                             <div className="text-base font-black text-slate-300">{weatherData.wind} km/h</div>
                           </div>
                           <div className="flex flex-col">
                             <div className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">{t('assistant.maxWind', 'Max Wind')}</div>
                             <div className="text-base font-black text-slate-100">{weatherData.windMax} km/h</div>
                           </div>
                         </div>
                       </>
                     )}
                   </div>
                )}
              </div>
            )}

            <button disabled={!cteZone} onClick={() => setStep(2)} className="w-full bg-[#eab676] !text-black py-4 rounded-xl font-black uppercase tracking-widest transition-all disabled:opacity-20 disabled:hover:scale-100 disabled:cursor-not-allowed hover:bg-[#ffc882] hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#eab676]/20 flex items-center justify-center gap-2">
              {t('assistant.next', 'Next Step')} <ChevronRight size={20} />
            </button>
          </div>
        );

      case 2:
        return (
          <div className="animate-fade-in">
             <div className="w-16 h-16 bg-[#eab676]/20 text-[#eab676] rounded-full flex items-center justify-center mb-6 drop-shadow-[0_0_15px_rgba(234,182,118,0.2)]">
              <HandCoins size={32} />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-4 uppercase tracking-tight">{t('assistant.matTitle')}</h2>
            
            <label className="text-xs font-black text-[#eab676] uppercase tracking-widest mb-3 block">{t('assistant.matPref')}</label>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {['pvc', 'alu', 'wood', 'guide'].map(m => (
                <button key={m} onClick={() => setMaterial(m)} className={`p-4 rounded-xl border-2 font-black uppercase tracking-wider text-xs md:text-sm transition-all ${material === m ? 'border-[#eab676] bg-[#eab676]/10 text-white' : 'border-[#3a3a3b] bg-[#111112] text-[#f4f4f5] hover:border-[#6a6a6b] hover:text-white'}`}>
                  {m === 'guide' ? t('assistant.guideMe') : (m === 'pvc' ? 'PVC' : (m === 'alu' ? 'Aluminium' : t('configurator.materials.wood', 'Wood')))}
                </button>
              ))}
            </div>

            <label className="text-xs font-black text-[#eab676] uppercase tracking-widest mb-3 block">{t('assistant.budget')}</label>
            <div className="grid grid-cols-3 gap-3 mb-10">
              {['low', 'med', 'premium'].map(b => (
                <button key={b} onClick={() => setBudget(b)} className={`p-3 md:p-4 rounded-xl border-2 font-black uppercase tracking-wider text-xs md:text-sm transition-all text-center ${budget === b ? 'border-[#eab676] bg-[#eab676]/10 text-white' : 'border-[#3a3a3b] bg-[#111112] text-[#f4f4f5] hover:border-[#6a6a6b] hover:text-white'}`}>
                  {t(`assistant.${b}`)}
                </button>
              ))}
            </div>

            <button disabled={!material || !budget} onClick={() => setStep(3)} className="w-full bg-[#eab676] !text-black py-4 rounded-xl font-black uppercase tracking-widest transition-all disabled:opacity-20 flex items-center justify-center gap-2">
              Next Step <ChevronRight size={20} />
            </button>
          </div>
        );

      case 3:
        return (
          <div className="animate-fade-in">
             <div className="w-16 h-16 bg-[#eab676]/20 text-[#eab676] rounded-full flex items-center justify-center mb-6 drop-shadow-[0_0_15px_rgba(234,182,118,0.2)]">
              <CalendarCheck size={32} />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-4 uppercase tracking-tight">{t('assistant.timeTitle')}</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {[
                { id: 't1', label: t('assistant.t1') },
                { id: 't2', label: t('assistant.t2') },
                { id: 't3', label: t('assistant.t3') },
                { id: 't4', label: t('assistant.t4') },
              ].map(tObj => (
                <button key={tObj.id} onClick={() => setTimeline(tObj.id)} className={`p-4 md:p-6 rounded-xl border-2 font-black transition-all text-left text-sm md:text-base ${timeline === tObj.id ? 'border-[#eab676] bg-[#eab676]/10 text-[#eab676]' : 'border-[#3a3a3b] bg-[#111112] text-[#f4f4f5] hover:border-[#6a6a6b] hover:text-white'}`}>
                  {tObj.label}
                  {tObj.id === 't1' && (
                    <div className="text-[10px] uppercase font-black tracking-widest mt-2 opacity-100 text-[#eab676]">
                      {t('assistant.deliveryEst', 'Est. Delivery:')} {getDeliveryEstimate()}
                    </div>
                  )}
                </button>
              ))}
            </div>

            <button disabled={!timeline} onClick={() => setStep(4)} className="w-full bg-[#eab676] !text-black py-4 rounded-xl font-black uppercase tracking-widest transition-all disabled:opacity-20 flex items-center justify-center gap-2">
              {t('assistant.next')} <ChevronRight size={20} />
            </button>
          </div>
        );

      case 4:
        return (
          <div className="animate-fade-in">
             <div className="w-16 h-16 bg-[#eab676]/20 text-[#eab676] rounded-full flex items-center justify-center mb-6 drop-shadow-[0_0_15px_rgba(234,182,118,0.2)]">
              <Ear size={32} />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-4 uppercase tracking-tight">{t('assistant.archTitle')}</h2>
            
            <label className="text-xs font-black text-[#eab676] uppercase tracking-widest mb-3 block">{t('assistant.houseType')}</label>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {['villa', 'apt'].map(h => (
                <button key={h} onClick={() => setHousing(h)} className={`p-4 rounded-xl border-2 font-black uppercase tracking-wider text-xs md:text-sm transition-all ${housing === h ? 'border-[#eab676] bg-[#eab676]/10 text-white' : 'border-[#3a3a3b] bg-[#111112] text-[#f4f4f5] hover:border-[#6a6a6b] hover:text-white'}`}>
                  {t(`assistant.${h}`)}
                </button>
              ))}
            </div>

            <label className="text-xs font-black text-[#eab676] uppercase tracking-widest mb-3 block">{t('assistant.noisePol')}</label>
            <div className="grid grid-cols-2 gap-3 mb-10">
              {['nHigh', 'nLow'].map(n => (
                <button key={n} onClick={() => setNoise(n)} className={`p-4 rounded-xl border-2 font-black uppercase tracking-wider text-xs md:text-sm transition-all ${noise === n ? 'border-[#eab676] bg-[#eab676]/10 text-white' : 'border-[#3a3a3b] bg-[#111112] text-[#f4f4f5] hover:border-[#6a6a6b] hover:text-white'}`}>
                  {t(`assistant.${n}`)}
                </button>
              ))}
            </div>

            <div className="my-6 pt-6 border-t border-[#2a2a2b]">
              <h3 className="text-base font-black text-white uppercase tracking-widest mb-4">Project Scope (Counts)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex justify-between items-center bg-[#111112] border border-[#2a2a2b] p-3 rounded-xl">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Windows</span>
                  <input type="number" min="0" value={windowsCount} onChange={e => setWindowsCount(Number(e.target.value))} className="w-16 bg-[#1a1a1b] border border-[#3a3a3b] text-center font-black rounded p-1 text-[#eab676]" />
                </div>
                <div className="flex justify-between items-center bg-[#111112] border border-[#2a2a2b] p-3 rounded-xl">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Balcony Doors</span>
                  <input type="number" min="0" value={balconyCount} onChange={e => setBalconyCount(Number(e.target.value))} className="w-16 bg-[#1a1a1b] border border-[#3a3a3b] text-center font-black rounded p-1 text-[#eab676]" />
                </div>
                <div className="flex justify-between items-center bg-[#111112] border border-[#2a2a2b] p-3 rounded-xl">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Sliding Doors</span>
                  <input type="number" min="0" value={slidingCount} onChange={e => setSlidingCount(Number(e.target.value))} className="w-16 bg-[#1a1a1b] border border-[#3a3a3b] text-center font-black rounded p-1 text-[#eab676]" />
                </div>
                {housing === 'villa' && (
                  <>
                    <div className="flex justify-between items-center bg-[#111112] border border-[#2a2a2b] p-3 rounded-xl">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">House Doors</span>
                      <input type="number" min="0" value={houseDoorCount} onChange={e => setHouseDoorCount(Number(e.target.value))} className="w-16 bg-[#1a1a1b] border border-[#3a3a3b] text-center font-black rounded p-1 text-[#eab676]" />
                    </div>
                    <div className="flex justify-between items-center bg-[#111112] border border-[#2a2a2b] p-3 rounded-xl">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Garage Doors</span>
                      <input type="number" min="0" value={garageDoorCount} onChange={e => setGarageDoorCount(Number(e.target.value))} className="w-16 bg-[#1a1a1b] border border-[#3a3a3b] text-center font-black rounded p-1 text-[#eab676]" />
                    </div>
                  </>
                )}
              </div>
            </div>

            <button disabled={!housing || !noise || (windowsCount+balconyCount+slidingCount+houseDoorCount+garageDoorCount === 0)} onClick={processRecommendation} className="w-full bg-white text-black py-4 rounded-xl font-black uppercase tracking-widest transition-all disabled:opacity-20 hover:scale-[1.02] flex items-center justify-center gap-2">
              {t('assistant.processCalc')} <Sparkles size={20} />
            </button>
          </div>
        );

      case 5:
        return (
          <div className="animate-fade-in flex flex-col items-center justify-center py-8 text-center min-h-[400px]">
            {isProcessing ? (
              <div className="flex flex-col items-center gap-6">
                <div className="relative w-24 h-24">
                  <div className="absolute inset-0 rounded-full border-4 border-[#2a2a2b] border-t-[#eab676] animate-spin"></div>
                  <Loader2 size={40} className="absolute inset-0 m-auto text-[#eab676] animate-pulse" />
                </div>
                 <div>
                   <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-2">{t('assistant.analyzing')}</h2>
                   <p className="text-[#eab676] font-bold text-sm tracking-widest uppercase animate-pulse">{t('assistant.computing')}</p>
                </div>
              </div>
            ) : recommendation && (
              <div className="w-full animate-fade-in relative z-10">
                 <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                   <Sparkles size={40} />
                 </div>
                 <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-2">{t('assistant.perfWin')}</h2>
                 <p className="text-white font-medium mb-8 max-w-md mx-auto text-sm md:text-base leading-relaxed">{t('assistant.basedOn').replace('{{zone}}', cteZone).replace('{{noise}}', noise === 'nHigh' ? t('assistant.nHigh') : t('assistant.nLow'))}</p>

                 <div className="bg-[#111112] border-2 border-[#eab676]/50 rounded-2xl p-6 mb-8 mt-4 relative overflow-hidden text-left shadow-[0_0_40px_rgba(234,182,118,0.15)]">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-[#eab676]/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                   
                   <div className="flex justify-between items-start gap-4">
                     <div>
                       <div className="text-[10px] font-black text-[#eab676] uppercase tracking-[0.2em] mb-1">{t('assistant.recProf')}</div>
                       <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">{CONFIG_SCHEMA.materials[recommendation.material as keyof typeof CONFIG_SCHEMA.materials]?.profiles.find(p=>p.id===recommendation.profile)?.name || recommendation.profile}</h3>
                       
                       <div className="mt-4 flex flex-wrap items-center gap-2 md:gap-3">
                         <span className="bg-[#1a1a1b] border-2 border-[#3a3a3b] font-black text-white text-[9px] md:text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-lg">{t('assistant.base')}: {recommendation.material}</span>
                         <span className="bg-[#1a1a1b] border-2 border-[#3a3a3b] font-black text-[#eab676] text-[9px] md:text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-lg">{recommendation.glazing} {t('assistant.glaze')}</span>
                         
                         {recommendation.profile === 'igloedge' && (
                            <button onClick={() => setShowVideo(true)} className="bg-[#eab676]/10 border-2 border-[#eab676]/30 text-[#eab676] hover:bg-[#eab676] hover:text-black font-black text-[9px] md:text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-lg">
                              <PlayCircle size={14} /> {t('assistant.prodVideo', 'Product Video')}
                            </button>
                         )}
                       </div>
                     </div>
                   </div>
                 </div>

                 <button onClick={() => setStep(6)} className="w-full bg-[#eab676] !text-black py-4 md:py-5 rounded-2xl font-black text-sm md:text-lg uppercase tracking-widest hover:bg-[#ffc882] hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(234,182,118,0.4)] flex items-center justify-center gap-2">
                    {t('assistant.continueOrder', 'Continue with order')} <ChevronRight size={20} />
                 </button>
              </div>
            )}
          </div>
        );
        
      case 6: {
        const item = itemConfigList[currentItemIndex];
        return (
          <div className="animate-fade-in-up">
            <h2 className="text-xl md:text-3xl font-black mb-4 uppercase tracking-widest text-[#eab676]">{t('assistant.startConfig', 'Start Configuration')}</h2>
            <p className="text-white/60 font-bold mb-8 text-sm md:text-base leading-relaxed">
              {t('assistant.configIntro', "Let's start configuring your items. You can save this and change it later. We will configure each item one by one.")}
            </p>
            <div className="bg-[#111112] border border-[#2a2a2b] p-6 rounded-2xl mb-8 flex flex-col items-center justify-center text-center">
               <div className="w-16 h-16 bg-[#eab676]/10 text-[#eab676] rounded-full flex items-center justify-center mb-4">
                  <Home size={32} />
               </div>
               <div className="text-white font-black text-xl mb-1">Item {currentItemIndex + 1} of {itemConfigList.length}</div>
               <div className="text-[#eab676] font-bold text-sm uppercase tracking-widest">{item?.itemType?.replace('_', ' ')}</div>
            </div>
            <button onClick={() => setStep(7)} className="w-full bg-[#eab676] !text-black py-4 rounded-xl font-black uppercase tracking-widest hover:scale-[1.02] transition-transform flex justify-center items-center gap-2">
              Begin <ChevronRight size={20} />
            </button>
          </div>
        )
      }
      case 7: {
        const commonRooms = ['Main Bedroom', 'Bedroom', 'Living Room', 'Dining Room', 'Kitchen', 'Hall', 'Bathroom', 'Office'];
        return (
          <div className="animate-fade-in-up">
            <h2 className="text-xl md:text-3xl font-black mb-4 uppercase tracking-widest text-[#eab676]">Room & Basics</h2>
            <p className="text-white/60 font-bold mb-8 text-sm md:text-base leading-relaxed">Item {currentItemIndex + 1}/{itemConfigList.length}</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
               {commonRooms.map(r => (
                 <button key={r} onClick={() => setCurrentRoomName(r)} className={`p-3 rounded-xl border-2 font-black text-xs transition-all ${currentRoomName === r ? 'border-[#eab676] bg-[#eab676]/10 text-white' : 'border-[#2a2a2b] bg-[#111112] text-white/50 hover:border-[#3a3a3b]'}`}>{r}</button>
               ))}
            </div>
            <div className="mb-6">
               <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Or type custom name:</p>
               <input type="text" value={currentRoomName} onChange={e => setCurrentRoomName(e.target.value)} placeholder="e.g. Master Bath" className="w-full bg-[#111112] border border-[#3a3a3b] p-4 rounded-xl text-white font-bold focus:outline-none focus:border-[#eab676]" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
               <div className="bg-[#111112] border border-[#2a2a2b] p-4 rounded-xl">
                  <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Quantity (Units)</p>
                  <div className="flex items-center gap-4">
                     <button onClick={() => setCurrentQuantity(Math.max(1, currentQuantity - 1))} className="w-10 h-10 rounded-lg bg-[#1a1a1b] border border-[#3a3a3b] text-white font-black hover:border-[#eab676] transition-colors">-</button>
                     <span className="text-xl font-black text-[#eab676] w-8 text-center">{currentQuantity}</span>
                     <button onClick={() => setCurrentQuantity(currentQuantity + 1)} className="w-10 h-10 rounded-lg bg-[#1a1a1b] border border-[#3a3a3b] text-white font-black hover:border-[#eab676] transition-colors">+</button>
                  </div>
               </div>
               <div className="bg-[#111112] border border-[#2a2a2b] p-4 rounded-xl">
                  <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Orientation</p>
                  <div className="flex bg-[#1a1a1b] rounded-lg border border-[#3a3a3b] overflow-hidden">
                    {['North', 'South', 'East', 'West'].map(dir => (
                      <button key={dir} onClick={() => setCurrentOrientation(dir)} className={`flex-1 py-3 text-xs font-black uppercase tracking-wider transition-colors ${currentOrientation === dir ? 'bg-[#eab676] text-black' : 'text-white/50 hover:bg-[#2a2a2b] hover:text-white'}`}>
                        {dir}
                      </button>
                    ))}
                  </div>
               </div>
            </div>
            <button disabled={!currentRoomName} onClick={() => setStep(8)} className="w-full bg-[#eab676] !text-black py-4 rounded-xl font-black uppercase tracking-widest disabled:opacity-20 flex justify-center items-center gap-2">
              Next <ChevronRight size={20} />
            </button>
          </div>
        );
      }
      case 8: {
        return (
          <div className="animate-fade-in-up">
            <h2 className="text-xl md:text-3xl font-black mb-4 uppercase tracking-widest text-[#eab676]">Select Style</h2>
            <p className="text-white/60 font-bold mb-8 text-sm md:text-base leading-relaxed">Item {currentItemIndex + 1}/{itemConfigList.length} - {currentRoomName}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
               {WINDOW_TYPES.map(wt => (
                 <button key={wt.id} onClick={() => setCurrentWindowType(wt.id)} className={`p-4 rounded-xl border-2 font-black text-sm flex-col flex items-center gap-2 transition-all ${currentWindowType === wt.id ? 'border-[#eab676] bg-[#eab676]/10 text-[#eab676]' : 'border-[#2a2a2b] bg-[#111112] text-white/50 hover:border-[#3a3a3b]'}`}>
                   {wt.name}
                 </button>
               ))}
            </div>
            <button disabled={!currentWindowType} onClick={() => setStep(9)} className="w-full bg-[#eab676] !text-black py-4 rounded-xl font-black uppercase tracking-widest disabled:opacity-20 flex justify-center items-center gap-2">
              Next <ChevronRight size={20} />
            </button>
          </div>
        );
      }
      case 9: {
        return (
          <div className="animate-fade-in-up">
            <h2 className="text-xl md:text-3xl font-black mb-4 uppercase tracking-widest text-[#eab676]">Select Openings</h2>
            <p className="text-white/60 font-bold mb-8 text-sm md:text-base leading-relaxed">Item {currentItemIndex + 1}/{itemConfigList.length} - {currentRoomName}</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
               {['F', 'DKL', 'DKR', 'DL', 'DR', 'K'].map(op => (
                 <button key={op} onClick={() => setCurrentOpenings([op])} className={`p-4 rounded-xl border-2 font-black text-sm flex-col flex items-center gap-2 transition-all ${currentOpenings[0] === op ? 'border-[#eab676] bg-[#eab676]/10 text-[#eab676]' : 'border-[#2a2a2b] bg-[#111112] text-white/50 hover:border-[#3a3a3b]'}`}>
                   {op}
                 </button>
               ))}
            </div>
            <button disabled={currentOpenings.length === 0} onClick={() => { setCurrentGlazing(recommendation?.glazing || CONFIG_SCHEMA.glazing[0].id); setStep(10); }} className="w-full bg-[#eab676] !text-black py-4 rounded-xl font-black uppercase tracking-widest disabled:opacity-20 flex justify-center items-center gap-2">
              Next <ChevronRight size={20} />
            </button>
          </div>
        );
      }
      case 10: {
        return (
          <div className="animate-fade-in-up">
            <h2 className="text-xl md:text-3xl font-black mb-4 uppercase tracking-widest text-[#eab676]">Select Glazing</h2>
            <p className="text-white/60 font-bold mb-8 text-sm md:text-base leading-relaxed">Item {currentItemIndex + 1}/{itemConfigList.length} - {currentRoomName}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
               {CONFIG_SCHEMA.glazing.map(gl => (
                 <button key={gl.id} onClick={() => setCurrentGlazing(gl.id)} className={`p-4 text-left rounded-xl border-2 font-black text-sm flex-col transition-all ${currentGlazing === gl.id ? 'border-[#eab676] bg-[#eab676]/10 text-[#eab676] block' : 'border-[#2a2a2b] bg-[#111112] text-white/50 block hover:border-[#3a3a3b]'}`}>
                   {gl.id}
                 </button>
               ))}
            </div>
            <button disabled={!currentGlazing} onClick={() => setStep(11)} className="w-full bg-[#eab676] !text-black py-4 rounded-xl font-black uppercase tracking-widest disabled:opacity-20 flex justify-center items-center gap-2">
              Next <ChevronRight size={20} />
            </button>
          </div>
        );
      }
      case 11: {
        return (
          <div className="animate-fade-in-up">
            <h2 className="text-xl md:text-3xl font-black mb-4 uppercase tracking-widest text-[#eab676]">Select Blinds</h2>
            <p className="text-white/60 font-bold mb-8 text-sm md:text-base leading-relaxed">Item {currentItemIndex + 1}/{itemConfigList.length} - {currentRoomName}</p>
            
            <div className="grid grid-cols-2 gap-3 mb-8">
               {['None', 'Manual Roller', 'Electric Roller', 'Venetian'].map(bl => (
                 <button key={bl} onClick={() => setCurrentBlinds(bl)} className={`p-4 rounded-xl border-2 font-black text-sm flex-col flex items-center gap-2 transition-all ${currentBlinds === bl ? 'border-[#eab676] bg-[#eab676]/10 text-[#eab676]' : 'border-[#2a2a2b] bg-[#111112] text-white/50 hover:border-[#3a3a3b]'}`}>
                   {bl}
                 </button>
               ))}
            </div>
            <button disabled={!currentBlinds} onClick={() => setStep(12)} className="w-full bg-[#eab676] !text-black py-4 rounded-xl font-black uppercase tracking-widest disabled:opacity-20 flex justify-center items-center gap-2">
              Next <ChevronRight size={20} />
            </button>
          </div>
        );
      }
      case 12: {
        return (
          <div className="animate-fade-in-up">
            <h2 className="text-xl md:text-3xl font-black mb-4 uppercase tracking-widest text-[#eab676]">Ready to Configure</h2>
            <p className="text-white/60 font-bold mb-8 text-sm md:text-base leading-relaxed">
              We will now open the main configurator with this preset data for <strong className="text-white">{currentRoomName}</strong>. 
            </p>
            <div className="bg-[#111112] border border-[#2a2a2b] p-6 rounded-2xl mb-8 shadow-inner">
               <ul className="space-y-4 text-sm font-bold text-white/70">
                 <li className="flex justify-between items-center border-b border-[#2a2a2b] pb-2"><span className="text-white/40 uppercase tracking-widest text-xs">Item:</span> <span className="text-white text-base">{currentRoomName} <span className="text-[#eab676]">({currentQuantity}x)</span></span></li>
                 <li className="flex justify-between items-center border-b border-[#2a2a2b] pb-2"><span className="text-white/40 uppercase tracking-widest text-xs">Orient:</span> <span className="text-white">{currentOrientation}</span></li>
                 <li className="flex justify-between items-center border-b border-[#2a2a2b] pb-2"><span className="text-white/40 uppercase tracking-widest text-xs">Style:</span> <span className="text-[#eab676]">{currentWindowType}</span></li>
                 <li className="flex justify-between items-center border-b border-[#2a2a2b] pb-2"><span className="text-white/40 uppercase tracking-widest text-xs">Glazing:</span> <span className="text-white">{currentGlazing}</span></li>
                 <li className="flex justify-between items-center"><span className="text-white/40 uppercase tracking-widest text-xs">Blinds:</span> <span className="text-white">{currentBlinds}</span></li>
               </ul>
            </div>
            <button onClick={() => {
              const updatedList = [...itemConfigList];
              updatedList[currentItemIndex] = {
                ...updatedList[currentItemIndex],
                roomName: currentRoomName,
                quantity: currentQuantity,
                orientation: currentOrientation,
                windowType: currentWindowType,
                openings: currentOpenings,
                glazing: currentGlazing,
                blinds: currentBlinds,
              };
              setItemConfigList(updatedList);
              
              useOrderStore.getState().setDiscount(step * 10);
              startOrder(updatedList);
              onComplete(recommendation?.material || '', recommendation?.profile || '', recommendation?.glazing || '');
            }} className="w-full bg-[#eab676] !text-black py-4 rounded-xl font-black uppercase tracking-widest hover:scale-[1.02] flex justify-center items-center gap-2 shadow-[0_0_30px_rgba(234,182,118,0.3)]">
              Launch Configurator <Sparkles size={20} />
            </button>
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-[#1a1a1b] border border-[#2a2a2b] w-full max-w-2xl rounded-[2rem] shadow-2xl relative my-auto">
        <button disabled={isProcessing} onClick={onClose} className="absolute right-6 top-6 p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors z-20 disabled:opacity-0">
          <X size={24} />
        </button>
        
        {/* Progress Bar */}
        {!isProcessing && step < 5 && (
          <div className="absolute top-0 left-0 w-full h-1.5 bg-[#111112] rounded-t-[2rem] overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#eab676]/50 to-[#eab676] transition-all duration-500 ease-in-out" style={{ width: `${(step / 4) * 100}%` }}></div>
          </div>
        )}

        {/* Discount Badge */}
        {!isProcessing && (
          <div className="absolute top-4 left-6 z-20 bg-[#eab676]/10 border border-[#eab676]/30 px-3 py-1.5 rounded-full flex items-center gap-1.5 animate-fade-in shadow-lg">
             <HandCoins size={14} className="text-[#eab676]" />
             <span className="text-[#eab676] font-black text-xs uppercase tracking-widest">Saved: <span className="text-white">€{step * 10}</span></span>
          </div>
        )}

        <div className="p-8 md:p-12 relative z-10">
          {renderStep()}
          
          {step < 5 && (
            <div className="mt-8 text-left">
              <button 
                onClick={() => step > 1 ? setStep(step - 1) : onClose()} 
                className="text-[10px] md:text-xs font-black text-white/40 uppercase tracking-[0.2em] hover:text-white transition-colors flex items-center gap-1.5"
              >
                <ChevronLeft size={14} /> {step > 1 ? t('assistant.previous', 'Previous') : t('assistant.cancel', 'Cancel')}
              </button>
            </div>
          )}
        </div>
        
        {showVideo && (
          <div className="absolute inset-0 z-50 bg-black/95 rounded-[2rem] overflow-hidden flex flex-col items-center justify-center animate-fade-in p-4 border border-[#eab676]/30">
            <button onClick={() => setShowVideo(false)} className="absolute right-4 top-4 p-2 bg-black/50 hover:bg-white text-white hover:text-black rounded-full transition-colors z-50">
              <X size={20} />
            </button>
            <video src="/assets/iglo-edge-okno-window-opening.mp4" autoPlay controls className="w-full h-auto max-h-full rounded-xl shadow-[0_0_50px_rgba(234,182,118,0.15)]" />
          </div>
        )}
      </div>
    </div>
  );
}
