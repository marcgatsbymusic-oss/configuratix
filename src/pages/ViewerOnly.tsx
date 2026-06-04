import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Child1 } from '../components/configurator/Child1';
import { F100TViewer } from '../components/configurator/F100TViewer';
import { F101CViewer } from '../components/configurator/F101CViewer';
import { ThreejsWindowEngine } from '../components/configurator/ThreejsWindowEngine';
import { SLE201Viewer } from '../components/configurator/SLE201Viewer';
import { supabase } from '../lib/supabase';
import { ChevronDown, ChevronUp, Package } from 'lucide-react';

export const ViewerOnly: React.FC = () => {
  const [searchParams] = useSearchParams();
  const basketId = searchParams.get('basket_id');
  
  const [basketData, setBasketData] = useState<any>(null);
  const [selectedBasketItemIdx, setSelectedBasketItemIdx] = useState(0);
  const [isDescOpen, setIsDescOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(!!basketId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (basketId) {
      const fetchBasket = async () => {
        try {
          const { data, error } = await (supabase as any)
            .from('saved_configurations')
            .select('config_state')
            .eq('id', basketId)
            .single();
            
          if (error) throw error;
          if (data && data.config_state) {
            setBasketData(data.config_state);
          } else {
            setError("Basket not found.");
          }
        } catch (err: any) {
          console.error(err);
          setError("Failed to load basket.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchBasket();
    }
  }, [basketId]);

  let activeItem = null;
  let senderName = searchParams.get('sender_name') ? decodeURIComponent(searchParams.get('sender_name')!) : null;
  let showPricing = false;
  let totalBasketPrice = 0;

  if (basketData) {
    senderName = basketData.senderName || senderName;
    showPricing = !!basketData.showPricing;
    if (basketData.items && basketData.items.length > 0) {
      activeItem = basketData.items[selectedBasketItemIdx];
      totalBasketPrice = basketData.items.reduce((sum: number, item: any) => sum + (item.price || 0), 0);
    }
  }

  // Fallback to URL params if no basket
  const typology = activeItem?.config?.typology || searchParams.get('typology') || 'F101B';
  const width = activeItem?.config?.width || parseInt(searchParams.get('w') || '1000', 10);
  const height = activeItem?.config?.height || parseInt(searchParams.get('h') || '1000', 10);
  
  // Hex Colors
  const colorExt = activeItem?.config?.cExt || (searchParams.get('cExt') ? decodeURIComponent(searchParams.get('cExt')!) : '#e8e0d4');
  const colorInt = activeItem?.config?.cInt || (searchParams.get('cInt') ? decodeURIComponent(searchParams.get('cInt')!) : '#f0ece6');
  const colorGsk = activeItem?.config?.cGsk || (searchParams.get('cGsk') ? decodeURIComponent(searchParams.get('cGsk')!) : '#1c1c1c');
  const colorSpacer = activeItem?.config?.cSpc || (searchParams.get('cSpc') ? decodeURIComponent(searchParams.get('cSpc')!) : '#b0b5b9');
  
  // Textures
  const colorExtTexture = activeItem?.config?.cExtTex || (searchParams.get('cExtTex') ? decodeURIComponent(searchParams.get('cExtTex')!) : undefined);
  const colorIntTexture = activeItem?.config?.cIntTex || (searchParams.get('cIntTex') ? decodeURIComponent(searchParams.get('cIntTex')!) : undefined);



  // Determine profile image
  let profileImg = 'iglo5.png';
  if (typology.toLowerCase().includes('energy')) {
    profileImg = 'igloenergy.png';
  }

  if (isLoading) {
    return (
      <div className="w-screen min-h-screen flex items-center justify-center bg-white text-black font-bold">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-screen min-h-screen flex items-center justify-center bg-white text-red-500 font-bold">
        {error}
      </div>
    );
  }

  return (
    <div 
      className="w-screen min-h-screen overflow-x-hidden overflow-y-auto relative flex flex-col light pb-24"
      style={{ backgroundColor: '#ffffff', color: '#000000' }}
    >
      {senderName && (
        <div className="w-full bg-black text-white py-3 px-4 shadow-md z-50 text-sm font-bold tracking-wide flex items-center justify-center relative">
          <img src="/assets/mammut-logo-icon.png" alt="Mammut Logo" className="absolute left-4 h-6 object-contain" />
          <span>👋 {senderName} sent you this window they configured!</span>
        </div>
      )}
      <div className="w-full h-[75vh] relative shrink-0 border-b border-gray-200" style={{ backgroundColor: '#ffffff' }}>
        {typology === 'F100T' ? (
          <F100TViewer
            width={width}
            height={height}
            colorExt={colorExt}
            colorInt={colorInt}
            colorExtTexture={colorExtTexture}
            colorIntTexture={colorIntTexture}
            colorGsk={colorGsk}
            colorSpacer={colorSpacer}
          />
        ) : typology === 'F101C' ? (
          <F101CViewer 
            width={width}
            height={height}
            colorExt={colorExt}
            colorInt={colorInt}
            colorExtTexture={colorExtTexture}
            colorIntTexture={colorIntTexture}
            colorGsk={colorGsk}
            colorSpacer={colorSpacer}
          />
        ) : typology === 'F101B' ? (
          <Child1
            widthMm={width}
            heightMm={height}
            colorExt={colorExt}
            colorInt={colorInt}
            colorExtTexture={colorExtTexture}
            colorIntTexture={colorIntTexture}
            colorGsk={colorGsk}
            colorSpacer={colorSpacer}
          />
        ) : typology === 'SLE201' ? (
          <SLE201Viewer
            width={width}
            height={height}
            colorExt={colorExt}
            colorInt={colorInt}
            colorExtTexture={colorExtTexture}
            colorIntTexture={colorIntTexture}
            colorGsk={colorGsk}
            colorSpacer={colorSpacer}
          />
        ) : (
          <ThreejsWindowEngine
            width={width}
            height={height}
            colorExt={colorExt}
            colorInt={colorInt}
            colorExtTexture={colorExtTexture}
            colorIntTexture={colorIntTexture}
            spacerColor={colorSpacer}
            typology={typology}
          />
        )}
      </div>

      {/* Technical Description Collapsible */}
      <div className="w-full max-w-4xl mx-auto py-6 px-6 shrink-0">
        <button 
          onClick={() => setIsDescOpen(!isDescOpen)}
          className="w-full flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <span className="font-bold text-gray-700 uppercase tracking-wider text-sm">More Info</span>
          {isDescOpen ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
        </button>

        {isDescOpen && (
          <div className="mt-4 border border-gray-200 shadow-xl rounded-2xl p-8 font-sans transition-all" style={{ backgroundColor: '#ffffff', color: '#1f2937' }}>
            <div className="flex flex-col md:flex-row items-start gap-8">
              <div className="w-32 h-32 md:w-48 md:h-48 shrink-0 rounded-xl border border-gray-100 shadow-sm flex items-center justify-center p-4 bg-white">
                <img 
                  src={`/assets/profiles/${profileImg}`}
                  alt={`${typology} Profile Cross Section`} 
                  className="w-full h-full object-contain"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-black uppercase tracking-wider mb-1" style={{ color: '#0f172a' }}>{typology} Profile System</h2>
                <div className="text-sm font-medium mb-6 uppercase tracking-widest text-slate-500">Drutex S.A. Technical Specification</div>
                
                <p className="text-base leading-relaxed mb-6 text-slate-600">
                  Advanced multi-chamber PVC profile system engineered for exceptional thermal insulation and structural stability. Features specialized internal reinforcement and state-of-the-art sealing technology.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 border-t border-gray-100 pt-6">
                  <div className="flex-1 rounded-lg p-4 border border-slate-100 bg-slate-50">
                    <span className="block text-xs font-bold uppercase mb-1 text-slate-400">Dimensions</span>
                    <span className="text-lg font-mono font-semibold">{width}mm × {height}mm</span>
                  </div>
                  <div className="flex-1 rounded-lg p-4 border border-slate-100 bg-slate-50">
                    <span className="block text-xs font-bold uppercase mb-1 text-slate-400">Manufacturing Time</span>
                    <span className="inline-block px-3 py-1 rounded font-bold text-sm bg-amber-100 text-amber-800">5 Days</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Basket Items List */}
            {basketData && basketData.items && (
              <div className="mt-8 border-t border-gray-100 pt-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black uppercase tracking-wider flex items-center gap-2">
                    <Package className="text-mammut-gold" /> Items in Basket
                  </h3>
                  {showPricing && (
                    <div className="text-lg font-mono font-bold text-mammut-gold bg-black/5 px-4 py-2 rounded-lg">
                      Total: €{totalBasketPrice.toFixed(2)}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-4">
                  {basketData.items.map((item: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedBasketItemIdx(idx)}
                      className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                        idx === selectedBasketItemIdx 
                          ? 'border-mammut-gold bg-amber-50 shadow-md ring-1 ring-mammut-gold/50' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-white'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-sm uppercase text-slate-900">{item.name || `Item ${idx + 1}`}</div>
                        <div className="text-xs text-slate-500 mt-1">{item.summary}</div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {showPricing && (
                          <div className="font-mono font-bold text-slate-900">
                            €{item.price.toFixed(2)}
                          </div>
                        )}
                        {idx === selectedBasketItemIdx && (
                          <span className="text-[10px] font-bold text-mammut-gold uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-mammut-gold/30">
                            Viewing Now
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
