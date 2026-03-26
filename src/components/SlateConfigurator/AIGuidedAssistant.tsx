import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, ChevronRight, ThermometerSnowflake, HandCoins, Ear, Loader2, Sparkles, CalendarCheck } from 'lucide-react';
import { CITIES_DB } from '../../data/spanishGeodata';
import { calculateCTEZone } from '../../utils/cteCalculator';
import { CONFIG_SCHEMA } from './types';

interface Props {
  onClose: () => void;
  onComplete: (material: string, profile: string, glazing: string) => void;
}

export function AIGuidedAssistant({ onClose, onComplete }: Props) {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [province, setProvince] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [altitude, setAltitude] = useState<number | null>(null);
  const [cteZone, setCteZone] = useState('');

  const [material, setMaterial] = useState('');
  const [budget, setBudget] = useState('');
  
  const [timeline, setTimeline] = useState('');
  
  const [housing, setHousing] = useState('');
  const [noise, setNoise] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [recommendation, setRecommendation] = useState<any>(null);

  const provinces = Array.from(new Set(CITIES_DB.map(c => c.p))).sort();
  const availableCities = CITIES_DB.filter(c => c.p === province);
  const filteredCities = availableCities.filter(c => c.n.toLowerCase().includes(citySearch.toLowerCase()));

  const handleCitySelect = (cityName: string) => {
    const cData = CITIES_DB.find(c => c.n === cityName && c.p === province);
    if (cData) {
      setAltitude(cData.a);
      const zone = calculateCTEZone(province, cData.a);
      setCteZone(zone.combined);
    }
  };

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
      setIsProcessing(false);
    }, 3500);
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
            <p className="text-white/90 font-medium mb-8 max-w-lg text-sm md:text-base leading-relaxed drop-shadow-sm">
              {t('assistant.geoDesc')}
            </p>

            <div className="space-y-4 mb-8">
              <div>
                <label className="text-xs font-black text-white/90 uppercase tracking-widest mb-2 block">{t('assistant.province')}</label>
                <select value={province} onChange={e => { setProvince(e.target.value); setCitySearch(''); setAltitude(null); setCteZone(''); }} className="w-full bg-[#111112] border-2 border-[#2a2a2b] font-bold p-4 rounded-xl text-white focus:outline-none focus:border-[#eab676]">
                  <option value="">{t('assistant.selectProv')}</option>
                  {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              
              <div className={`transition-all duration-300 relative ${province ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                <label className="text-xs font-black text-white/90 uppercase tracking-widest mb-2 block">{t('assistant.city')}</label>
                <input 
                  type="text"
                  value={citySearch}
                  onChange={e => { setCitySearch(e.target.value); setShowCityDropdown(true); }}
                  onFocus={() => setShowCityDropdown(true)}
                  onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
                  placeholder={t('assistant.selectCity')}
                  className="w-full bg-[#111112] border-2 border-[#2a2a2b] font-bold p-4 rounded-xl text-white focus:outline-none focus:border-[#eab676]"
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
            </div>

            {cteZone && (
              <div className="bg-[#111112] border border-[#eab676]/20 rounded-xl p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in shadow-[0_0_30px_rgba(234,182,118,0.05)]">
                <div>
                  <div className="text-xs font-black text-[#eab676] uppercase tracking-[0.2em] mb-1">{t('assistant.topoEngine', 'Topographical Engine')}</div>
                  <div className="text-white/90 font-bold text-sm">{t('assistant.altitude', 'Altitude')}: <span className="text-white font-black">{altitude}m</span></div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mb-1">{t('assistant.cteZone', 'CTE DB-HE CLIMATE ZONE')}</div>
                  <div className="text-4xl font-black text-[#eab676] uppercase tracking-widest leading-none drop-shadow-md">{cteZone}</div>
                </div>
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
                <button key={m} onClick={() => setMaterial(m)} className={`p-4 rounded-xl border-2 font-black uppercase tracking-wider text-xs md:text-sm transition-all ${material === m ? 'border-[#eab676] bg-[#eab676]/10 text-white' : 'border-[#2a2a2b] bg-[#111112] text-white/80 hover:border-[#4a4a4b] hover:text-white'}`}>
                  {m === 'guide' ? t('assistant.guideMe') : (m === 'pvc' ? 'PVC' : (m === 'alu' ? 'Aluminium' : t('configurator.materials.wood', 'Wood')))}
                </button>
              ))}
            </div>

            <label className="text-xs font-black text-[#eab676] uppercase tracking-widest mb-3 block">{t('assistant.budget')}</label>
            <div className="grid grid-cols-3 gap-3 mb-10">
              {['low', 'med', 'premium'].map(b => (
                <button key={b} onClick={() => setBudget(b)} className={`p-3 md:p-4 rounded-xl border-2 font-black uppercase tracking-wider text-xs md:text-sm transition-all text-center ${budget === b ? 'border-[#eab676] bg-[#eab676]/10 text-white' : 'border-[#2a2a2b] bg-[#111112] text-white/80 hover:border-[#4a4a4b] hover:text-white'}`}>
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
                <button key={tObj.id} onClick={() => setTimeline(tObj.id)} className={`p-4 md:p-6 rounded-xl border-2 font-black transition-all text-left text-sm md:text-base ${timeline === tObj.id ? 'border-[#eab676] bg-[#eab676]/10 text-[#eab676]' : 'border-[#2a2a2b] bg-[#111112] text-white/80 hover:border-[#4a4a4b] hover:text-white'}`}>
                  {tObj.label}
                  {tObj.id === 't1' && <div className="text-[10px] uppercase font-black tracking-widest mt-2 opacity-70 text-[#eab676]">{t('assistant.t1Sub')}</div>}
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
                <button key={h} onClick={() => setHousing(h)} className={`p-4 rounded-xl border-2 font-black uppercase tracking-wider text-xs md:text-sm transition-all ${housing === h ? 'border-[#eab676] bg-[#eab676]/10 text-white' : 'border-[#2a2a2b] bg-[#111112] text-white/80 hover:border-[#4a4a4b] hover:text-white'}`}>
                  {t(`assistant.${h}`)}
                </button>
              ))}
            </div>

            <label className="text-xs font-black text-[#eab676] uppercase tracking-widest mb-3 block">{t('assistant.noisePol')}</label>
            <div className="grid grid-cols-2 gap-3 mb-10">
              {['nHigh', 'nLow'].map(n => (
                <button key={n} onClick={() => setNoise(n)} className={`p-4 rounded-xl border-2 font-black uppercase tracking-wider text-xs md:text-sm transition-all ${noise === n ? 'border-[#eab676] bg-[#eab676]/10 text-white' : 'border-[#2a2a2b] bg-[#111112] text-white/80 hover:border-[#4a4a4b] hover:text-white'}`}>
                  {t(`assistant.${n}`)}
                </button>
              ))}
            </div>

            <button disabled={!housing || !noise} onClick={processRecommendation} className="w-full bg-white text-black py-4 rounded-xl font-black uppercase tracking-widest transition-all disabled:opacity-20 hover:scale-[1.02] flex items-center justify-center gap-2">
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
                 <p className="text-white/90 font-medium mb-8 max-w-md mx-auto text-sm md:text-base leading-relaxed">{t('assistant.basedOn').replace('{{zone}}', cteZone).replace('{{noise}}', noise === 'nHigh' ? t('assistant.nHigh') : t('assistant.nLow'))}</p>

                 <div className="bg-[#111112] border-2 border-[#eab676]/50 rounded-2xl p-6 mb-8 mt-4 relative overflow-hidden text-left shadow-[0_0_40px_rgba(234,182,118,0.15)]">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-[#eab676]/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                   
                   <div className="flex justify-between items-start gap-4">
                     <div>
                       <div className="text-[10px] font-black text-[#eab676] uppercase tracking-[0.2em] mb-1">{t('assistant.recProf')}</div>
                       <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">{CONFIG_SCHEMA.materials[recommendation.material as keyof typeof CONFIG_SCHEMA.materials]?.profiles.find(p=>p.id===recommendation.profile)?.name || recommendation.profile}</h3>
                       
                       <div className="mt-4 flex flex-wrap items-center gap-2 md:gap-3">
                         <span className="bg-[#1a1a1b] border-2 border-[#3a3a3b] font-black text-white text-[9px] md:text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-lg">{t('assistant.base')}: {recommendation.material}</span>
                         <span className="bg-[#1a1a1b] border-2 border-[#3a3a3b] font-black text-[#eab676] text-[9px] md:text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-lg">{recommendation.glazing} {t('assistant.glaze')}</span>
                       </div>
                     </div>
                   </div>
                 </div>

                 <button onClick={() => onComplete(recommendation.material, recommendation.profile, recommendation.glazing)} className="w-full bg-[#eab676] !text-black py-4 md:py-5 rounded-2xl font-black text-sm md:text-lg uppercase tracking-widest hover:bg-[#ffc882] hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(234,182,118,0.4)]">
                    {t('assistant.useData')}
                 </button>
              </div>
            )}
          </div>
        );
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

        <div className="p-8 md:p-12 relative z-10">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}
