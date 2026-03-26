import { useState } from 'react';
import { X, MapPin, ChevronRight, ThermometerSnowflake, HandCoins, HardHat, Ear, Loader2, Sparkles, Home, CalendarCheck } from 'lucide-react';
import { CITIES_DB } from '../../data/spanishGeodata';
import { calculateCTEZone } from '../../utils/cteCalculator';
import { CONFIG_SCHEMA } from './types';

interface Props {
  onClose: () => void;
  onComplete: (material: string, profile: string, glazing: string) => void;
}

export function AIGuidedAssistant({ onClose, onComplete }: Props) {
  const [step, setStep] = useState(1);
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
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

  const handleCitySelect = (cityName: string) => {
    setCity(cityName);
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
      let recMat = material === 'pvc' || material === 'alu' || material === 'wood' ? material : 'pvc';
      let recProf = 'iglo-5';
      let recGlaze = '4/16/4';
      
      const isCold = cteZone.includes('D') || cteZone.includes('E');
      
      if (isCold) {
         recProf = 'iglo-edge';
         recGlaze = '4/18/4/18/4 TG';
      }
      
      if (noise === 'high') {
         recGlaze = '33.1 Safe';
         if (recProf === 'iglo-5') recProf = 'iglo-energy';
      }

      if (budget === 'low') {
         recProf = recMat === 'alu' ? 'mb-45' : 'iglo-light';
         recGlaze = '4/16/4';
      } else if (budget === 'premium') {
         recProf = recMat === 'alu' ? 'mb-86n-si' : 'iglo-edge';
         recGlaze = '4/18/4/18/4 TG';
      } else if (material === 'wood') {
         recMat = 'wood';
         recProf = 'softline';
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
            <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tight">Geographical Climate Analysis</h2>
            <p className="text-white/60 mb-8 max-w-lg">
              Windows are structurally designed with different climates in mind. Dependent upon exactly where you live, the system will calculate the precise CTE (Código Técnico de la Edificación) thermal rating to ensure maximum winter insulation and summer cooling.
            </p>

            <div className="space-y-4 mb-8">
              <div>
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2 block">Province</label>
                <select value={province} onChange={e => { setProvince(e.target.value); setCity(''); setAltitude(null); setCteZone(''); }} className="w-full bg-[#111112] border border-[#2a2a2b] p-4 rounded-xl text-white focus:outline-none focus:border-[#eab676]">
                  <option value="">Select Province...</option>
                  {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              
              <div className={`transition-all duration-300 ${province ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2 block">Municipality / City</label>
                <select value={city} onChange={e => handleCitySelect(e.target.value)} className="w-full bg-[#111112] border border-[#2a2a2b] p-4 rounded-xl text-white focus:outline-none focus:border-[#eab676]">
                  <option value="">Select City...</option>
                  {availableCities.map(c => <option key={c.n} value={c.n}>{c.n}</option>)}
                </select>
              </div>
            </div>

            {cteZone && (
              <div className="bg-[#111112] border border-[#eab676]/20 rounded-xl p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in shadow-[0_0_30px_rgba(234,182,118,0.05)]">
                <div>
                  <div className="text-xs font-black text-[#eab676] uppercase tracking-[0.2em] mb-1">Topographical Engine</div>
                  <div className="text-white/70 text-sm">Altitude: <span className="text-white font-bold">{altitude}m</span></div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">CTE DB-HE CLIMATE ZONE</div>
                  <div className="text-3xl font-black text-[#eab676] uppercase tracking-widest">{cteZone}</div>
                </div>
              </div>
            )}

            <button disabled={!cteZone} onClick={() => setStep(2)} className="w-full bg-[#eab676] !text-black py-4 rounded-xl font-black uppercase tracking-widest transition-all disabled:opacity-20 disabled:hover:scale-100 disabled:cursor-not-allowed hover:bg-[#ffc882] hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#eab676]/20 flex items-center justify-center gap-2">
              Next Step <ChevronRight size={20} />
            </button>
          </div>
        );

      case 2:
        return (
          <div className="animate-fade-in">
             <div className="w-16 h-16 bg-[#eab676]/20 text-[#eab676] rounded-full flex items-center justify-center mb-6 drop-shadow-[0_0_15px_rgba(234,182,118,0.2)]">
              <HandCoins size={32} />
            </div>
            <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tight">Material & Budget Constraints</h2>
            
            <label className="text-xs font-bold text-[#eab676] uppercase tracking-widest mb-3 block">Material Preference</label>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {['pvc', 'alu', 'wood', 'guide'].map(m => (
                <button key={m} onClick={() => setMaterial(m)} className={`p-4 rounded-xl border-2 font-bold uppercase tracking-wider text-sm transition-all ${material === m ? 'border-[#eab676] bg-[#eab676]/10 text-white' : 'border-[#2a2a2b] bg-[#111112] text-white/50 hover:border-[#3a3a3b]'}`}>
                  {m === 'guide' ? "I don't know, guide me" : m}
                </button>
              ))}
            </div>

            <label className="text-xs font-bold text-[#eab676] uppercase tracking-widest mb-3 block">Budget Scope</label>
            <div className="grid grid-cols-3 gap-3 mb-10">
              {['low', 'med', 'premium'].map(b => (
                <button key={b} onClick={() => setBudget(b)} className={`p-4 rounded-xl border-2 font-bold uppercase tracking-wider text-sm transition-all text-center ${budget === b ? 'border-[#eab676] bg-[#eab676]/10 text-white' : 'border-[#2a2a2b] bg-[#111112] text-white/50 hover:border-[#3a3a3b]'}`}>
                  {b}
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
            <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tight">Project Timeline</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {[
                { id: 'asap', label: 'As soon as possible' },
                { id: '1-2m', label: 'Next 1-2 months' },
                { id: '2m+', label: 'More than 2 months' },
                { id: 'unsure', label: 'Still not sure' },
              ].map(t => (
                <button key={t.id} onClick={() => setTimeline(t.id)} className={`p-6 rounded-xl border-2 font-bold transition-all text-left ${timeline === t.id ? 'border-[#eab676] bg-[#eab676]/10 text-[#eab676]' : 'border-[#2a2a2b] bg-[#111112] text-white/60 hover:border-[#3a3a3b]'}`}>
                  {t.label}
                  {t.id === 'asap' && <div className="text-[10px] uppercase font-black tracking-widest mt-2 opacity-50">15 Working days earliest</div>}
                </button>
              ))}
            </div>

            <button disabled={!timeline} onClick={() => setStep(4)} className="w-full bg-[#eab676] !text-black py-4 rounded-xl font-black uppercase tracking-widest transition-all disabled:opacity-20 flex items-center justify-center gap-2">
              Next Step <ChevronRight size={20} />
            </button>
          </div>
        );

      case 4:
        return (
          <div className="animate-fade-in">
             <div className="w-16 h-16 bg-[#eab676]/20 text-[#eab676] rounded-full flex items-center justify-center mb-6 drop-shadow-[0_0_15px_rgba(234,182,118,0.2)]">
              <Ear size={32} />
            </div>
            <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tight">Acoustics & Architecture</h2>
            
            <label className="text-xs font-bold text-[#eab676] uppercase tracking-widest mb-3 block">Housing Type</label>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {['villa', 'apartment'].map(h => (
                <button key={h} onClick={() => setHousing(h)} className={`p-4 rounded-xl border-2 font-bold uppercase tracking-wider text-sm transition-all ${housing === h ? 'border-[#eab676] bg-[#eab676]/10 text-white' : 'border-[#2a2a2b] bg-[#111112] text-white/50 hover:border-[#3a3a3b]'}`}>
                  {h}
                </button>
              ))}
            </div>

            <label className="text-xs font-bold text-[#eab676] uppercase tracking-widest mb-3 block">Local Noise Pollution</label>
            <div className="grid grid-cols-2 gap-3 mb-10">
              {['high', 'low'].map(n => (
                <button key={n} onClick={() => setNoise(n)} className={`p-4 rounded-xl border-2 font-bold uppercase tracking-wider text-sm transition-all ${noise === n ? 'border-[#eab676] bg-[#eab676]/10 text-white' : 'border-[#2a2a2b] bg-[#111112] text-white/50 hover:border-[#3a3a3b]'}`}>
                  {n === 'high' ? 'City / High Traffic' : 'Rural / Quiet'}
                </button>
              ))}
            </div>

            <button disabled={!housing || !noise} onClick={processRecommendation} className="w-full bg-white text-black py-4 rounded-xl font-black uppercase tracking-widest transition-all disabled:opacity-20 hover:scale-[1.02] flex items-center justify-center gap-2">
              Process Analysis <Sparkles size={20} />
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
                   <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Analyzing Data</h2>
                   <p className="text-[#eab676] font-bold text-sm tracking-widest uppercase animate-pulse">Computing optimal structural loads...</p>
                </div>
              </div>
            ) : recommendation && (
              <div className="w-full animate-fade-in relative z-10">
                 <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                   <Sparkles size={40} />
                 </div>
                 <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">Your Perfect Window</h2>
                 <p className="text-white/60 mb-8 max-w-md mx-auto">Based on your absolute geographic Zone {cteZone} climate data, {noise} local noise pollution, and defined budget, our algorithms recommend:</p>

                 <div className="bg-[#111112] border-2 border-[#eab676]/50 rounded-2xl p-6 mb-8 mt-4 relative overflow-hidden text-left shadow-[0_0_40px_rgba(234,182,118,0.15)]">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-[#eab676]/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                   
                   <div className="flex justify-between items-start gap-4">
                     <div>
                       <div className="text-[10px] font-black text-[#eab676] uppercase tracking-[0.2em] mb-1">Recommended Profile System</div>
                       <h3 className="text-3xl font-black text-white uppercase tracking-tight">{CONFIG_SCHEMA.materials[recommendation.material as keyof typeof CONFIG_SCHEMA.materials]?.profiles.find(p=>p.id===recommendation.profile)?.name || recommendation.profile}</h3>
                       
                       <div className="mt-4 flex items-center gap-3">
                         <span className="bg-[#1a1a1b] border border-[#2a2a2b] font-black text-white/80 text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-lg">Base: {recommendation.material}</span>
                         <span className="bg-[#1a1a1b] border border-[#2a2a2b] font-black text-[#eab676] text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-lg">{recommendation.glazing} Glazing</span>
                       </div>
                     </div>
                   </div>
                 </div>

                 <button onClick={() => onComplete(recommendation.material, recommendation.profile, recommendation.glazing)} className="w-full bg-[#eab676] !text-black py-5 rounded-2xl font-black text-lg uppercase tracking-widest hover:bg-[#ffc882] hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(234,182,118,0.4)]">
                    Use this data and configure window
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
            <div className="h-full bg-gradient-to-r from-[#eab676]/50 to-[#eab676] transition-all duration-500 ease-in-out" style={{ width: \`\${(step / 4) * 100}%\` }}></div>
          </div>
        )}

        <div className="p-8 md:p-12 relative z-10">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}
