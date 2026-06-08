import { useRef, useState, useEffect } from 'react';
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';
import { useConfigurator } from './useConfigurator';
import { CONFIG_SCHEMA, WINDOW_TYPES, COLOR_LOCALE, GLASS_LOCALE } from './types';
import { Ruler, Layers, Check, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, ShoppingCart, HelpCircle, X, Box, Camera, Trash2, Maximize, Link2, ExternalLink } from 'lucide-react';
import { WindowTypeGraphic } from './WindowTypeGraphic';
import { estimateFramePrice, resolveOpeningClass } from '../../utils/pricingEngine';
import { FloatingHelpMenu } from './FloatingHelpMenu';
import { ExitIntentModal } from './ExitIntentModal';
import { MaterialHelp, WindowTypeHelp } from './HelpContents';
import { BlueprintPreview } from './BlueprintPreview';
import { NeedlePreview } from './NeedlePreview';
import { F100TViewer } from '../configurator/F100TViewer';
import { F101CViewer } from '../configurator/F101CViewer';
import { SLE201Viewer } from '../configurator/SLE201Viewer';
import { ColorPaletteOverlay } from '../configurator/ColorPaletteOverlay';


import { useCartStore } from '../../store/useCartStore';

import { SaveToCartModal } from './SaveToCartModal';
import { supabase } from '../../lib/supabase';
import { Share2 } from 'lucide-react';
import { ARMeasurementButton } from './ARMeasurementButton';
import { ARPreviewButton } from './ARPreviewButton';
import { ProfileCaptureModal } from './ProfileCaptureModal';
import { CartDashboard } from './CartDashboard';
import { useSessionStore } from '../../store/useSessionStore';
import { Sparkles } from 'lucide-react';
import { AIGuidedAssistant } from './AIGuidedAssistant';
import { useOrderStore } from '../../store/useOrderStore';
import fittingVariants from '../../data/fitting_variants.json';
import { getDefaultSashOpenings } from '../../utils/windowOpenings';

const COLOR_HEX_MAP: Record<string, string> = {
  'c197': '#ffffff', // White
  'c214': '#3b3c3f', // Anthracite
  'c217': '#0a0a0a', // Jet Black
  'c231': '#3e2b23', // Chocolate Brown
  'c205': '#878c93', // Grey
  'c209': '#4f5358', // Basalt Grey
  'c236': '#163e63', // Brilliant Blue
  'c234': '#0d2d1e', // Dark Green
  'c235': '#461515', // Dark Red
  'c206': '#9e9e9e', // Concrete Grey
  'c200': '#f5f5dc', // Cream
  'c233': '#4b5320', // Moss Green
  'c204': '#d3d3d3', // Light Grey
  'c211': '#708090', // Slate
  'c202': '#d2b48c', // Bleached Oak
  'c227': '#3e2723', // Dark Oak
  'c225': '#8d6e63', // Douglas Fir
  'c229': '#5d4037', // Macore
  'c230': '#4e342e', // Mahogany
  'c203': '#a1887f', // Natural Oak
  'c224': '#8d6e63', // Oregon
  'c220': '#bcaaa4', // Turner Oak
  'c226': '#3e2723', // Walnut
  'c223': '#a1887f', // Winchester
  'c219': '#bcaaa4', // Golden Oak
  'c199': '#5a5a5a', // Croviu Platynium
  'c201': '#8c8c8c', // Piryt
  'c210': '#4f5358', // Basalt Grey Gadki
  'c207': '#757a7d', // Grey Quartz
  'c208': '#757a7d', // Grey Quartz Smooth
  'c237': '#4682b4', // Steel Blue
  'c216': '#3b3c3f', // Anthracite Ulti Matt
  'c215': '#3b3c3f', // Anthracite Smooth
  'c218': '#0a0a0a', // Black Ulti Matt
  'c212': '#708090', // Slate Smooth
  'c198': '#f5f5f0', // White Sand Matt
  'c232': '#554433', // Deep Bronze
  'c213': '#41424c', // Graphite Sandblasted
  'c228': '#4a2f26', // Palisander
  'c221': '#a57850', // Turner Oak Toffee
  'c222': '#704730', // Turner Oak Walnut
};

const getHexColor = (colorId: string) => COLOR_HEX_MAP[colorId] || undefined;
const getTextureUrl = (colorId: string) => {
  const localeData = (COLOR_LOCALE as any)[i18n.language || 'en'] || (COLOR_LOCALE as any)['en'];
  const swatch = localeData?.colors?.[colorId]?.swatch;
  if (swatch && swatch.includes("url('")) {
    return swatch.replace("url('", "").replace("')", "");
  }
  return undefined;
};


const FRAME_STYLES_MAP: Record<string, { name: string, hex: string, ext: string }> = {
  'BI': { name: 'Ultimate white (RAL 9016)', hex: '#f4f8f4', ext: 'jpg' },
  'JB': { name: 'Ultimate light brown (RAL 8003)', hex: '#8a5a44', ext: 'jpg' },
  'JS': { name: 'Ultimate light grey (RAL 7035)', hex: '#c5c7c4', ext: 'jpg' },
  'S': { name: 'Steel', hex: '#b0b5b9', ext: 'jpg' },
  'U': { name: 'Ultimate grey (RAL 9023)', hex: '#797b7a', ext: 'webp' },
  'UC': { name: 'Ultimate black (RAL 9005)', hex: '#0a0a0a', ext: 'jpg' },
  'X': { name: 'Ultimate brown', hex: '#59351f', ext: 'jpg' }
};

const SpacerScrollWheel = ({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: any[];
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPos, setScrollPos] = useState(0);
  const [visibleDim, setVisibleDim] = useState(300);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const dragStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now()
    };
  };

  const handleSnapClick = (e: React.MouseEvent, code: string) => {
    if (dragStartRef.current) {
      const dx = Math.abs(e.clientX - dragStartRef.current.x);
      const dy = Math.abs(e.clientY - dragStartRef.current.y);
      const dt = Date.now() - dragStartRef.current.time;
      if (dx > 15 || dy > 15 || dt > 300) {
        return;
      }
    }
    onChange(code);
  };

  const stepWidth = visibleDim < 640 ? 90 : 130;
  const baseSize = visibleDim < 640 ? 50 : 70;

  const currentIndex = options.findIndex(o => o.code === value);
  const activeIdx = currentIndex !== -1 ? currentIndex : 0;

  const lastValueRef = useRef<string | null>(null);
  const lastProgrammaticScrollRef = useRef<number | null>(null);

  useEffect(() => {
    if (lastValueRef.current === null || value !== lastValueRef.current) {
      const idx = options.findIndex(o => o.code === value);
      if (idx !== -1 && scrollContainerRef.current) {
        const targetScroll = idx * stepWidth;
        const currentScroll = scrollContainerRef.current.scrollLeft;
        if (Math.abs(currentScroll - targetScroll) > 1) {
          lastProgrammaticScrollRef.current = targetScroll;
          scrollContainerRef.current.scrollLeft = targetScroll;
          setScrollPos(targetScroll);
        }
      }
      lastValueRef.current = value;
    }
  }, [value, options, stepWidth]);

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setVisibleDim(entry.contentRect.width);
      }
    });
    resizeObserver.observe(containerRef.current);
    setVisibleDim(containerRef.current.clientWidth);
    return () => resizeObserver.disconnect();
  }, []);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const sPos = scrollContainerRef.current.scrollLeft;
      if (lastProgrammaticScrollRef.current !== null && Math.abs(sPos - lastProgrammaticScrollRef.current) < 1.1) {
        lastProgrammaticScrollRef.current = null;
        setScrollPos(sPos);
        return;
      }
      setScrollPos(sPos);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (scrollContainerRef.current) {
      e.preventDefault();
      e.stopPropagation();
      scrollContainerRef.current.scrollLeft += e.deltaY;
    }
  };

  const adjustIndex = (dir: 'prev' | 'next') => {
    const nextIdx = dir === 'prev' ? activeIdx - 1 : activeIdx + 1;
    if (nextIdx >= 0 && nextIdx < options.length) {
      onChange(options[nextIdx].code);
    }
  };

  const centerIdx = Math.round(scrollPos / stepWidth);
  const visibleHalf = Math.ceil((visibleDim / 2) / stepWidth) + 4;
  const startIdx = Math.max(0, centerIdx - visibleHalf);
  const endIdx = Math.min(options.length - 1, centerIdx + visibleHalf);

  const R = Math.max(120, visibleDim / 1.9);

  const items = [];
  for (let i = startIdx; i <= endIdx; i++) {
    const itemOffset = i * stepWidth - scrollPos;
    const angle = itemOffset / R;
    if (Math.abs(angle) > 1.6) continue;

    const trigVal = R * Math.sin(angle);
    const cosVal = Math.cos(angle);
    const scale = Math.pow(cosVal, 1.8);

    const opt = options[i];
    const isSelected = opt.code === value;

    const baseItemSize = isSelected ? baseSize * 2.0 : baseSize;
    const size = baseItemSize * scale;
    const opacity = Math.max(0, cosVal * cosVal);

    const isHoveredItem = hoveredIdx === i;
    const hoverScale = isHoveredItem ? 1.4 : 1.0;

    const distance = Math.abs(i - centerIdx);
    const zIndex = isSelected ? 40 : Math.max(10, 30 - distance);

    const styleCode = opt.spacer_style?.replace('_NAR', '') || 'S';
    const ext = FRAME_STYLES_MAP[styleCode]?.ext || 'jpg';
    const imageUrl = `/assets/spacers/${styleCode}.${ext}`;
    const fallbackHex = FRAME_STYLES_MAP[styleCode]?.hex || '#4B4B4D';

    items.push(
      <div
        key={`spacer-${i}-${opt.code}`}
        onClick={(e) => {
          handleSnapClick(e, opt.code);
        }}
        className={`absolute cursor-pointer rounded-full border transition-all duration-300 ease-out flex items-center justify-center bg-white ${
          isSelected 
            ? 'border-mammut-gold border-[1px] shadow-[0_0_12px_rgba(217,119,6,0.35)]' 
            : 'border-gray-800 hover:border-gray-600 bg-mammut-black'
        }`}
        style={{
          left: `calc(50% + ${trigVal}px - ${size / 2}px)`,
          top: `calc(50% - ${size / 2}px)`,
          width: size,
          height: size,
          opacity: opacity,
          zIndex: zIndex,
          transform: `scale(${hoverScale})`
        }}
        title={`${opt.code} - ${opt.thickness}mm`}
      >
        <img 
          src={imageUrl} 
          alt={opt.code} 
          className="w-full h-full object-cover rounded-full"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <div 
          className="absolute inset-0 z-[-1] rounded-full" 
          style={{ backgroundColor: fallbackHex }} 
        />
        {isSelected && (
          <div 
            className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg border border-mammut-dark z-50 p-0.5 animate-in fade-in zoom-in duration-200"
            style={{ 
              width: Math.max(16, size * 0.28), 
              height: Math.max(16, size * 0.28) 
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={4} stroke="currentColor" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
        )}
      </div>
    );
  }

  const paddingVal = Math.max(0, visibleDim / 2 - stepWidth / 2);
  const activeOpt = options[activeIdx] || options[0];

  return (
    <div className="flex flex-col gap-1.5 w-full relative overflow-visible z-20">
      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1 md:mb-2">{label}</label>
      <div 
        ref={containerRef}
        onWheel={handleWheel}
        className="relative bg-mammut-dark border border-gray-850 rounded-xl overflow-visible select-none shadow-inner flex items-center justify-center group w-full h-[140px] md:h-[190px]"
      >
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible z-10">
          {items}
        </div>

        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-mammut-dark to-transparent pointer-events-none z-15 opacity-90" />
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-mammut-dark to-transparent pointer-events-none z-15 opacity-90" />

        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          onPointerDown={handlePointerDown}
          onPointerMove={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          className="absolute inset-0 z-20 cursor-grab active:cursor-grabbing flex overflow-x-scroll snap-x snap-mandatory"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
          }}
        >
          <div style={{ width: paddingVal, flexShrink: 0 }} />
          {options.map((opt, i) => (
            <div 
              key={`snap-${i}`}
              className="snap-center shrink-0 pointer-events-auto"
              style={{ width: stepWidth, height: '100%' }}
              onClick={(e) => handleSnapClick(e, opt.code)}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
          ))}
          <div style={{ width: paddingVal, flexShrink: 0 }} />
        </div>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); adjustIndex('prev'); }}
          className="absolute z-30 w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-lg bg-mammut-black/85 border border-gray-800 text-amber-700 hover:text-mammut-gold hover:border-mammut-gold/50 active:scale-90 transition-all duration-150 cursor-pointer select-none left-2 md:left-3 top-1/2 -translate-y-1/2"
          title="Previous"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3 md:w-4 md:h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); adjustIndex('next'); }}
          className="absolute z-30 w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-lg bg-mammut-black/85 border border-gray-800 text-amber-700 hover:text-mammut-gold hover:border-mammut-gold/50 active:scale-90 transition-all duration-150 cursor-pointer select-none right-2 md:right-3 top-1/2 -translate-y-1/2"
          title="Next"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3 md:w-4 md:h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      <div className="flex flex-col items-center justify-center py-2 bg-mammut-dark/40 border border-gray-850/60 rounded-xl mt-1 md:mt-2 px-3">
        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Selected Spacer</span>
        <span className="text-sm md:text-base font-black font-mono text-mammut-gold tracking-wide text-center mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
          {activeOpt ? `${activeOpt.code} (${activeOpt.thickness}mm Spacer)` : ''}
        </span>
      </div>
    </div>
  );
};


const TiltProfileCard = ({ profile, isActive, onClick, tags }: { profile: any, isActive: boolean, onClick: () => void, tags: any[] }) => {
  const { t } = useTranslation();
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -12; 
    const rotateY = ((x - centerX) / centerX) * 12;
    setRotation({ x: rotateX, y: rotateY });
  };

  const handlePointerLeave = () => setRotation({ x: 0, y: 0 });

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="group/btn relative w-[280px] shrink-0 snap-start bg-transparent text-left outline-none h-full"
      style={{ perspective: '1200px' }}
    >
      <div 
        className={`w-full h-full flex flex-col rounded-2xl border-2 transition-all duration-200 overflow-visible shadow-sm group-hover/btn:shadow-xl ${isActive ? 'border-mammut-gold ring-4 ring-[#eab676]/10 bg-mammut-gold/10' : 'border-slate-200 group-hover/btn:border-slate-300'}`}
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${isActive ? 1.02 : 1})`,
          transformStyle: 'preserve-3d',
          backgroundColor: isActive ? undefined : '#ffffff'
        }}
      >
        <div className="h-44 flex items-center justify-center bg-slate-50 p-4 border-b border-slate-100 relative rounded-t-xl" style={{ transformStyle: 'preserve-3d' }}>
          <img 
            src={profile.image} 
            alt={profile.name} 
            className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover/btn:scale-110" 
            style={{ 
              transform: 'translateZ(50px)', 
              filter: `drop-shadow(${rotation.y * -0.5}px ${rotation.x * 0.5 + 10}px 15px rgba(0,0,0,0.25))`
            }}
          />
          <div className="absolute top-3 left-3 flex flex-col gap-1 items-start z-10" style={{ transform: 'translateZ(30px)' }}>
            {(tags || []).map((tag: any, i: number) => (
              <span key={i} className={`text-[9px] font-bold text-white px-2 py-0.5 rounded shadow-sm tracking-wider uppercase ${tag.color === 'emerald' ? 'bg-emerald-500' : 'bg-blue-600'}`}>
                {tag.text}
              </span>
            ))}
          </div>
          {profile.technical && profile.technical.energyGrade && (
            <div className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 rounded-full border-2 border-white/10 shadow-lg z-20 font-black text-sm text-white" 
                 style={{ transform: 'translateZ(40px)', background: profile.technical.energyGrade === 'A+' ? '#10b981' : profile.technical.energyGrade === 'A' ? '#84cc16' : profile.technical.energyGrade === 'B' ? '#eab308' : '#f97316' }}>
               {profile.technical.energyGrade}
            </div>
          )}
        </div>
        <div className="p-4 rounded-b-xl relative z-20 flex-grow flex flex-col" style={{ transform: 'translateZ(20px)', backgroundColor: '#ffffff' }}>
          <div className="font-bold text-lg text-slate-800">{String(t(`configurator.profiles.${profile.id}`, profile.name))}</div>
          {profile.technical && (
             <div className="mt-3 border-t border-slate-100 pt-3 flex-grow flex flex-col justify-end">
               <p className={`text-[10px] text-slate-500 leading-relaxed mb-3 ${isExpanded ? 'line-clamp-none' : 'line-clamp-3'}`}>{profile.technical.description}</p>
               <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                  <div className="flex flex-col col-span-2"><span className="text-slate-500 uppercase tracking-widest text-[8px]">Thermal Transmittance</span><span className="font-bold text-mammut-gold">{profile.technical.uwValue} <span className="font-normal text-slate-500 text-[8px]">W/(m²K)</span></span></div>
                  {profile.technical.soundInsulation && <div className="flex flex-col col-span-2"><span className="text-slate-500 uppercase tracking-widest text-[8px]">Sound Insulation</span><span className="font-bold text-slate-700">{profile.technical.soundInsulation}</span></div>}
                  <div className="flex flex-col"><span className="text-slate-500 uppercase tracking-widest text-[8px]">Depth</span><span className="font-bold text-slate-700">{profile.technical.profileDepth} <span className="font-normal text-slate-500 text-[8px]">mm</span></span></div>
                  {profile.technical.chambers && <div className="flex flex-col"><span className="text-slate-500 uppercase tracking-widest text-[8px]">Chambers</span><span className="font-bold text-slate-700">{profile.technical.chambers}</span></div>}
                  <div className="flex flex-col"><span className="text-slate-500 uppercase tracking-widest text-[8px]">Gaskets</span><span className="font-bold text-slate-700">{profile.technical.gaskets}</span></div>
               </div>
               <button 
                 onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                 className="mt-3 bg-mammut-gold text-black w-full py-1.5 rounded text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-colors"
               >
                 {isExpanded ? 'Less' : 'More'}
               </button>
             </div>
          )}
        </div>
        {isActive && (
          <div className="absolute bottom-4 right-4 w-7 h-7 bg-mammut-gold text-black rounded-full flex items-center justify-center shadow-md z-30" style={{ transform: 'translateZ(40px)' }}>
            <Check size={14} strokeWidth={4} />
          </div>
        )}
      </div>
    </div>
  );
};




export function MainConfigurator() {
  const { t, i18n } = useTranslation();
  const { state, dispatch, pricing, activeLimits, activeColors, activeGlazing, activePanes, activeSpacers } = useConfigurator();
  const { items, addItem } = useCartStore();
  const orderStore = useOrderStore();
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const profileScrollRef = useRef<HTMLDivElement>(null);
  const hasProduct = typeof window !== 'undefined' && window.location.search.includes('product=');
  const [activeStep, setActiveStep] = useState<number | null>(hasProduct ? 3 : 0);
  const [show3D, setShow3D] = useState(false);
  const [isColorWheelOpen, setIsColorWheelOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [stepOrder, setStepOrder] = useState<number[]>([1,2,3,4,7,5,6,8,9]);
  const [completedSteps, setCompletedSteps] = useState<number[]>(hasProduct ? [1, 2] : []);
  const openStep = (step: number) => { setActiveStep(step); setStepOrder(prev => [step, ...prev.filter(s => s !== step)]); };
  const advanceStep = (current: number, next: number) => { setTimeout(() => { setActiveStep(next); setCompletedSteps(prev => Array.from(new Set([...prev, current]))); setStepOrder(prev => { const n = prev.filter(s => s !== current); n.push(current); return n; }); }, 350); };
  const [expandedHelpSection, setExpandedHelpSection] = useState<number | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [activeStep]);

  const [widthText, setWidthText] = useState(state.dimensions.width.toString());
  const [heightText, setHeightText] = useState(state.dimensions.height.toString());

  useEffect(() => {
    if (Number(widthText) !== state.dimensions.width) {
      setWidthText(state.dimensions.width.toString());
    }
  }, [state.dimensions.width, widthText]);

  useEffect(() => {
    if (Number(heightText) !== state.dimensions.height) {
      setHeightText(state.dimensions.height.toString());
    }
  }, [state.dimensions.height, heightText]);

  useEffect(() => {
    if (orderStore.isActive && orderStore.items[orderStore.currentIndex]) {
      const item = orderStore.items[orderStore.currentIndex];
      
      if (item.isConfigured && item.savedConfig?.config) {
        // If they are going back to a previously configured item, restore the full state
        const savedState = item.savedConfig.config;
        dispatch({ type: 'SET_CATEGORY', payload: savedState.category });
        setTimeout(() => {
           dispatch({ type: 'SET_PROFILE', payload: savedState.profile });
           dispatch({ type: 'SET_GLAZING_PACKAGE', payload: savedState.glazingPackage });
           dispatch({ type: 'SET_DIMENSIONS', payload: savedState.dimensions });
           dispatch({ type: 'SET_GLASS_OUTSIDE', payload: savedState.glassOutside });
           dispatch({ type: 'SET_GLASS_MIDDLE', payload: savedState.glassMiddle });
           dispatch({ type: 'SET_GLASS_INSIDE', payload: savedState.glassInside });
           dispatch({ type: 'SET_INTERIOR_COLOR', payload: savedState.interiorColor });
           dispatch({ type: 'SET_EXTERIOR_COLOR', payload: savedState.exteriorColor });
           // Restore window type if present
           if (savedState.windowTypeId) dispatch({ type: 'SET_WINDOW_TYPE', payload: savedState.windowTypeId });
        }, 100);
      } else {
        // First time configuring this item, configure from wizard presets
        dispatch({ type: 'SET_CATEGORY', payload: item.material as any });
        setTimeout(() => {
          dispatch({ type: 'SET_PROFILE', payload: item.profile });
          dispatch({ type: 'SET_GLAZING_PACKAGE', payload: item.glazing });
          // NOTE: we could apply opening types and blinds here if the payload supported it
        }, 100);
      }
      
      setActiveStep(6); 
      setCompletedSteps([1, 2, 3, 4, 5]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [orderStore.isActive, orderStore.currentIndex]);

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showCartDashboard, setShowCartDashboard] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  const [isSharing, setIsSharing] = useState(false);
  const isIOS = typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const isAndroid = typeof window !== 'undefined' && /android/i.test(navigator.userAgent);
  const isMobile = isIOS || isAndroid;

  const appDomain = "fantastic-octo-giggle-five.vercel.app";
  const glbUrl = `https://${appDomain}/models/window-scene.glb`;
  // IMPORTANT: The `link` and `S.browser_fallback_url` values must be percent-encoded.
  // Chrome's intent URL parser splits on `://` so any unencoded https:// inside a parameter
  // value silently truncates the intent, causing Scene Viewer to fail with no error shown.
  const encodedFallback = encodeURIComponent('https://developers.google.com/ar');
  const androidIntent = `intent://arvr.google.com/scene-viewer/1.1?file=${encodeURIComponent(glbUrl)}&mode=ar_preferred&title=Mammut%20Window&resizable=false#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;S.browser_fallback_url=${encodedFallback};end;`;
  const arHref = isIOS ? "/models/window-scene.usdz#allowsContentScaling=1" : androidIntent;

  const [senderName, setSenderName] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareId = params.get('share_id');
    const sName = params.get('sender_name');
    if (sName) {
      setSenderName(sName);
    }
    if (shareId) {
      // Use any to bypass schema for beta testing
      (supabase as any).from('saved_configurations').select('config_state').eq('id', shareId).single().then(({ data, error }: { data: any, error: any }) => {
        if (data?.config_state && !error) {
          dispatch({ type: 'HYDRATE_STATE', payload: data.config_state });
          setActiveStep(6);
          setCompletedSteps([1,2,3,4,5,6]);
        }
      });
    }
  }, []);

  const handleShareSystem = async () => {
    const senderName = window.prompt("Enter your name (optional) so the recipient knows who sent this:");
    
    setIsSharing(true);
    try {
      const { data, error } = await (supabase as any).from('saved_configurations')
        .insert({ config_state: state })
        .select('id').single();
      if (data) {
        const url = new URL(window.location.href);
        url.searchParams.set('share_id', data.id);
        if (senderName) {
           url.searchParams.set('sender_name', senderName);
        }
        
        const shareUrl = url.toString();
        
        if (navigator.share) {
          try {
            await navigator.share({
              title: '3D Window Configuration',
              text: senderName ? `${senderName} sent you this window they configured!` : 'Check out this 3D window configuration!',
              url: shareUrl
            });
          } catch (err) {
            // User cancelled or share failed, fallback to clipboard
            navigator.clipboard.writeText(shareUrl);
            alert('Configuration link copied to clipboard!');
          }
        } else {
          navigator.clipboard.writeText(shareUrl);
          alert('Configuration link copied to clipboard!');
        }
      } else {
        console.error(error);
        alert('Failed to save configuration');
      }
    } catch(e) { console.error(e); }
    setIsSharing(false);
  };

  const handleShareToWhatsApp = async () => {
    const senderName = window.prompt("Enter your name (optional) so the recipient knows who sent this:");
    
    setIsSharing(true);
    try {
      const { data, error } = await (supabase as any).from('saved_configurations')
        .insert({ config_state: state })
        .select('id').single();
      if (data) {
        const url = new URL(window.location.href);
        url.searchParams.set('share_id', data.id);
        if (senderName) {
           url.searchParams.set('sender_name', senderName);
        }
        
        const shareUrl = url.toString();
        const text = senderName 
          ? `${senderName} sent you this window they configured!` 
          : 'Check out this 3D window configuration!';
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + '\n' + shareUrl)}`;
        window.open(whatsappUrl, '_blank');
      } else {
        console.error(error);
        alert('Failed to save configuration');
      }
    } catch(e) { console.error(e); }
    setIsSharing(false);
  };

  const toggleHelp = (step: number) => {
    setExpandedHelpSection(prev => prev === step ? null : step);
  };
  const [colorTab, setColorTab] = useState<'interior'|'exterior'>('interior');

  const itemDiscount = orderStore.isActive && orderStore.items.length > 0 ? (orderStore.questionnaireDiscount / orderStore.items.length) : 0;
  const finalPrice = Math.max(0, pricing.total - itemDiscount);

  const deliveryDays = state.category === 'Windows' ? 5 : 42;
  const deliveryDate = new Date();
  if (state.category === 'Windows') {
    let d = deliveryDays;
    while(d > 0) {
      deliveryDate.setDate(deliveryDate.getDate() + 1);
      if (deliveryDate.getDay() !== 0 && deliveryDate.getDay() !== 6) d--;
    }
  } else {
    deliveryDate.setDate(deliveryDate.getDate() + deliveryDays);
  }
  const formattedDelivery = deliveryDate.toLocaleDateString(i18n.language, { month: 'short', day: 'numeric', year: 'numeric' });

  const selectedSpacer = activeSpacers?.find((s: any) => s.code === state.glassSpacer);
  const spacerStyleCode = selectedSpacer?.spacer_style?.replace('_NAR', '') || 'S';
  const spacerHex = FRAME_STYLES_MAP[spacerStyleCode]?.hex || '#4B4B4D';
  const gasketHex = state.gasketColor === 'szary' ? '#6b7280' : '#1c1c1c';
  const showSealsStep = state.windowTypeId?.includes('F100') || state.windowTypeId?.includes('F104');

  const get3DViewerUrl = () => {
    const url = new URL(window.location.origin + '/viewer');
    url.searchParams.set('typology', state.windowTypeId || 'F101B');
    url.searchParams.set('w', state.dimensions.width.toString());
    url.searchParams.set('h', state.dimensions.height.toString());
    url.searchParams.set('cExt', encodeURIComponent(getHexColor(state.exteriorColor) || '#e8e0d4'));
    url.searchParams.set('cInt', encodeURIComponent(getHexColor(state.interiorColor) || '#f0ece6'));
    
    const extTex = getTextureUrl(state.exteriorColor);
    if (extTex) url.searchParams.set('cExtTex', encodeURIComponent(extTex));
    
    const intTex = getTextureUrl(state.interiorColor);
    if (intTex) url.searchParams.set('cIntTex', encodeURIComponent(intTex));
    
    url.searchParams.set('cGsk', encodeURIComponent(gasketHex));
    url.searchParams.set('cSpc', encodeURIComponent(spacerHex));
    return url.toString();
  };

  return (
    <>
      {senderName && (
        <div className="w-full bg-indigo-600 text-white text-center py-3 px-4 shadow-md z-[60] text-sm font-bold tracking-wide sticky top-0 relative">
          👋 {senderName} sent you this window they configured!
        </div>
      )}
      <FloatingHelpMenu />
      
      {showAIAssistant && (
        <AIGuidedAssistant 
          onClose={() => setShowAIAssistant(false)}
          onComplete={(recommendedMaterial, recommendedProfile, recommendedGlazing) => {
            setShowAIAssistant(false);
            dispatch({ type: 'SET_CATEGORY', payload: recommendedMaterial as any });
            
            setTimeout(() => {
              // @ts-ignore
              dispatch({ type: 'SET_PROFILE', payload: recommendedProfile });
              // @ts-ignore
              dispatch({ type: 'SET_GLAZING_PACKAGE', payload: recommendedGlazing });
              
              setActiveStep(1); 
              setCompletedSteps([1, 2]); 
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 100);
          }}
        />
      )}
      {showExitModal && <ExitIntentModal onClose={() => setShowExitModal(false)} onConfirmExit={() => window.location.href = '/'} />}
      
      {showSaveModal && (
        <SaveToCartModal 
          onClose={() => setShowSaveModal(false)}
          onMoreWindows={() => {
            setShowSaveModal(false);
            if (!useSessionStore.getState().email) {
              setShowLeadModal(true);
            } else {
              setShowCartDashboard(true);
            }
          }}
          onCheckout={() => {
            setShowSaveModal(false);
            if (!useSessionStore.getState().email) {
              setShowLeadModal(true);
            } else {
              setShowCartDashboard(true);
            }
          }}
        />
      )}

      {showLeadModal && (
        <ProfileCaptureModal 
          onClose={() => setShowLeadModal(false)}
          onComplete={() => {
            setShowLeadModal(false);
            setShowCartDashboard(true);
          }}
        />
      )}

      {showCartDashboard && (
        <CartDashboard 
          onClose={() => {
            setShowCartDashboard(false);
            setActiveStep(1);
            setCompletedSteps([1, 2, 3, 4, 5, 7]);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onCheckout={() => {
            window.location.href = '/checkout';
          }}
        />
      )}
      <div className="min-h-screen bg-mammut-darker text-mammut-white pb-20 font-sans overflow-x-hidden max-w-[100vw] w-full">
        
        {/* FULL BLEED VIEWER (extracted from right column) */}
        <div className={`w-[100vw] relative left-1/2 -translate-x-1/2 transition-all duration-700 ${activeStep === 0 ? "hidden" : completedSteps.length === 0 ? "opacity-0 pointer-events-none hidden" : "opacity-100"}`}>
          <div className="w-full">
            <div 
              className="bg-mammut-dark w-full h-[75vh] flex flex-col items-center justify-center relative border-b border-mammut-gold/20 overflow-hidden bg-cover bg-center shadow-2xl"
              style={uploadedImage ? { backgroundImage: `url(${uploadedImage})` } : {}}
            >
              <div className="absolute top-4 left-4 z-30 bg-mammut-darker/80 backdrop-blur-sm p-1 rounded-lg border border-mammut-border flex gap-1 shadow-md pointer-events-auto">
                 <button 
                   onClick={() => setShow3D(true)}
                   className={`px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded-md transition-all ${show3D ? 'bg-indigo-600 !text-mammut-white' : 'text-mammut-white/50 hover:bg-[#2a2a2b]'}`}
                 >
                   3D Live
                 </button>
                 <button 
                   onClick={() => setShow3D(false)}
                   className={`px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded-md transition-all ${!show3D ? 'bg-mammut-gold !text-black' : 'text-mammut-white/50 hover:bg-[#2a2a2b]'}`}
                 >
                   2D Draft
                 </button>
                 <button
                   onClick={() => {
                     const el = document.documentElement;
                     if (!document.fullscreenElement) {
                       el.requestFullscreen?.();
                     } else {
                       document.exitFullscreen?.();
                     }
                   }}
                   className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded-md transition-all text-mammut-white/50 hover:bg-[#2a2a2b] border-l border-mammut-border pl-4 ml-1"
                   title="Toggle Fullscreen"
                 >
                   <Maximize size={12} strokeWidth={2.5} className="inline-block mr-1 -mt-0.5" /> Fullscreen
                 </button>
                 {isIOS ? (
                   <a
                     href={arHref}
                     rel="ar"
                     className="px-3 py-1.5 flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider rounded-md transition-all text-emerald-400 hover:bg-emerald-400/10 hover:text-emerald-300 ml-1 border-l border-mammut-border pl-4"
                     title="View in AR"
                   >
                     <Box size={12} strokeWidth={2.5} /> AR
                   </a>
                 ) : (
                   <a
                     href={arHref}
                     className="px-3 py-1.5 flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider rounded-md transition-all text-emerald-400 hover:bg-emerald-400/10 hover:text-emerald-300 ml-1 border-l border-mammut-border pl-4"
                     title="View in AR"
                   >
                     <Box size={12} strokeWidth={2.5} /> AR
                   </a>
                 )}
                 <a
                    href={get3DViewerUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider rounded-md transition-all text-blue-400 hover:bg-blue-400/10 hover:text-blue-300 ml-1 border-l border-mammut-border pl-4"
                    title="Open configuration in standalone 3D viewer"
                  >
                    <ExternalLink size={12} strokeWidth={2.5} /> 3D Link
                  </a>
                 <label className="px-3 py-1.5 flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider rounded-md transition-all text-mammut-gold hover:bg-mammut-gold/10 cursor-pointer border-l border-mammut-border pl-4">
                   <Camera size={12} strokeWidth={2.5} /> {t('configurator.blueprint.uploadPhoto', 'Photo')}
                   <input
                     type="file"
                     accept="image/*"
                     capture="environment"
                     className="hidden"
                     onChange={(e) => {
                       const file = e.target.files?.[0];
                       if (file) {
                         const reader = new FileReader();
                         reader.onload = (event) => {
                           setUploadedImage(event.target?.result as string);
                           setShow3D(false); // Auto-switch to 2D Draft
                         };
                         reader.readAsDataURL(file);
                       }
                     }}
                   />
                 </label>
                 {uploadedImage && (
                   <button
                     onClick={() => setUploadedImage(null)}
                     className="px-2 py-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-md transition-all border-l border-mammut-border pl-3 flex items-center justify-center"
                     title={t('configurator.blueprint.removePhoto', 'Remove Photo')}
                   >
                     <Trash2 size={12} strokeWidth={2.5} />
                   </button>
                 )}
              </div>
              {show3D ? (
                state.windowTypeId === 'F100T' ? (
                  <F100TViewer isColorPaletteOpen={isColorWheelOpen}
                    width={state.dimensions.width}
                    height={state.dimensions.height}
                    colorExt={getHexColor(state.exteriorColor)}
                    colorInt={getHexColor(state.interiorColor)}
                    colorExtTexture={getTextureUrl(state.exteriorColor)}
                    colorIntTexture={getTextureUrl(state.interiorColor)}
                    colorSpacer={spacerHex}
                    colorGsk={gasketHex}
                    onDimensionChange={(w, h) => dispatch({ type: 'SET_DIMENSIONS', payload: { width: w, height: h } })}
                    activeLimits={activeLimits}
                  />
                ) : state.windowTypeId === 'F101C' ? (
                  <F101CViewer
                    width={state.dimensions.width}
                    height={state.dimensions.height}
                    colorExt={getHexColor(state.exteriorColor)}
                    colorInt={getHexColor(state.interiorColor)}
                    colorExtTexture={getTextureUrl(state.exteriorColor)}
                    colorIntTexture={getTextureUrl(state.interiorColor)}
                    colorSpacer={spacerHex}
                    colorGsk={gasketHex}
                    onDimensionChange={(w, h) => dispatch({ type: 'SET_DIMENSIONS', payload: { width: w, height: h } })}
                    activeLimits={activeLimits}
                  />
                ) : state.windowTypeId === 'SLE201' ? (
                  <SLE201Viewer isColorPaletteOpen={isColorWheelOpen}
                    width={state.dimensions.width}
                    height={state.dimensions.height}
                    colorExt={getHexColor(state.exteriorColor)}
                    colorInt={getHexColor(state.interiorColor)}
                    colorExtTexture={getTextureUrl(state.exteriorColor)}
                    colorIntTexture={getTextureUrl(state.interiorColor)}
                    colorSpacer={spacerHex}
                    colorGsk={gasketHex}
                    onDimensionChange={(w, h) => dispatch({ type: 'SET_DIMENSIONS', payload: { width: w, height: h } })}
                    activeLimits={activeLimits}
                  />
                ) : (
                  <NeedlePreview state={state} />
                )
              ) : (
                <BlueprintPreview 
                  state={state} 
                  uploadedImage={uploadedImage}
                  onDimensionChange={(w, h) => dispatch({ type: 'SET_DIMENSIONS', payload: { width: w, height: h } })}
                  activeLimits={activeLimits}
                />
              )}

              {state.windowTypeId === 'SLE201' && (
                <button
                  onClick={handleShareToWhatsApp}
                  className="absolute bottom-[68px] right-[54px] md:bottom-[80px] md:right-[68px] z-40 w-12 h-12 rounded-full flex items-center justify-center bg-black/85 text-[#25D366] border border-gray-800 hover:border-[#25D366] active:scale-95 shadow-xl cursor-pointer"
                  title="Share 3D Option on WhatsApp"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.858.002-2.634-1.019-5.112-2.877-6.974S14.636 1.83 12.007 1.83c-5.442 0-9.866 4.42-9.87 9.858-.001 1.702.457 3.361 1.328 4.815l-.991 3.616 3.708-.973zm10.102-7.395c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.021-.963-.263-.099-.455-.149-.648.149-.193.297-.748.963-.918 1.16-.17.197-.341.222-.638.074-.297-.149-1.258-.464-2.398-1.481-.888-.793-1.488-1.771-1.662-2.068-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.174.2-.298.3-.496.101-.198.05-.372-.025-.521-.075-.149-.648-1.62-.888-2.198-.232-.56-.47-.482-.648-.491-.166-.008-.356-.01-.545-.01-.189 0-.495.071-.754.347-.258.277-.985.963-.985 2.349 0 1.386 1.009 2.723 1.15 2.905.141.182 1.984 3.03 4.809 4.246.672.29 1.196.463 1.604.593.676.214 1.293.184 1.78.112.544-.08 1.758-.717 2.006-1.411.248-.693.248-1.288.173-1.411z" />
                  </svg>
                </button>
              )}

              {/* Interactive Color Palette Overlay Widget */}
              <ColorPaletteOverlay
                colorExt={state.exteriorColor}
                colorInt={state.interiorColor}
                onChangeExt={(color) => dispatch({ type: 'SET_EXTERIOR_COLOR', payload: color.id })}
                onChangeInt={(color) => dispatch({ type: 'SET_INTERIOR_COLOR', payload: color.id })}
                onOpenChange={setIsColorWheelOpen}
              />
            </div>
          </div>
        </div>

      <div className={`max-w-[1600px] mx-auto px-4 sm:px-6 w-full overflow-hidden sm:overflow-visible transition-all duration-700 ${activeStep === 0 ? "pt-24 lg:pt-28" : "pt-12"}`}>
        <div className="flex flex-col-reverse lg:flex-col gap-10 items-start w-full">
          
          {/* LEFT: Configure Wizard */}
          <div className={`flex flex-col gap-8 w-full transition-all duration-700 ${activeStep === 0 ? "max-w-4xl mx-auto pt-10" : ""}`}>
            
            {/* Order Loop Banner */}
            {orderStore.isActive && orderStore.items[orderStore.currentIndex] && activeStep !== null && activeStep > 0 && (
              <div className="bg-mammut-gold/10 border border-mammut-gold/30 rounded-2xl p-4 md:p-6 flex items-center justify-between shadow-[0_0_30px_rgba(234,182,118,0.1)] mb-4 animate-fade-in-up">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-mammut-gold !text-black rounded-full flex items-center justify-center font-black text-xl shadow-md">
                    {orderStore.currentIndex + 1}
                  </div>
                  <div>
                    <h3 className="text-mammut-gold font-black uppercase tracking-widest text-xs md:text-sm">Configuring Item {orderStore.currentIndex + 1} of {orderStore.items.length}</h3>
                    <div className="text-mammut-white font-bold text-lg md:text-xl drop-shadow-md">{orderStore.items[orderStore.currentIndex].roomName || 'Custom Room'}</div>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <div className="text-mammut-white/40 font-bold uppercase tracking-widest text-[10px]">Type</div>
                  <div className="text-mammut-white font-black text-sm uppercase">{orderStore.items[orderStore.currentIndex].itemType.replace('_', ' ')}</div>
                </div>
              </div>
            )}
            
            {/* Contextual Welcome Message */}
            {activeStep === 0 && !orderStore.isActive && (
              <div className="bg-gradient-to-br from-[#1a1a1b] to-[#111112] border border-mammut-gold/30 p-10 md:p-14 rounded-3xl shadow-2xl mb-2 relative overflow-hidden group w-full" style={{ order: -1 }}>
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[#eab676] to-transparent opacity-70" />
                <div className="flex flex-col items-center text-center gap-6 relative z-10">
                  <div className="w-24 h-24 bg-mammut-gold/10 rounded-full flex items-center justify-center text-mammut-gold shadow-[0_0_40px_rgba(234,182,118,0.15)] outline outline-1 outline-white/5 mb-2">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                  </div>
                  <h1 className="!text-mammut-white text-3xl md:text-4xl lg:text-5xl font-black drop-shadow-md tracking-tight uppercase">{t('configurator.welcome.title', 'Welcome to our AI powered windows configurator')}</h1>
                  <p className="!text-[#f0f0f0] font-bold text-base md:text-lg lg:text-xl max-w-4xl leading-relaxed drop-shadow-md pb-6 pt-2">
                    {t('configurator.welcome.description', "Selecting windows is not an easy task, there are many options and everybody's needs differ, that's why our configurator will guide and help you make the best choice that suits your needs and budget.")}
                  </p>
                  <div className="flex flex-col md:flex-row gap-4 w-full justify-center mt-2">
                    <button 
                      onClick={() => setShowAIAssistant(true)}
                      className="flex-[3] bg-mammut-gold !text-black font-black text-sm lg:text-base px-6 py-5 rounded-2xl hover:bg-[#ffc882] hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-[0_0_30px_rgba(234,182,118,0.3)] flex items-center justify-center gap-3 uppercase tracking-[0.1em]"
                    >
                      <Sparkles size={20} className="shrink-0" /> {t('assistant.inter1', 'Recommended: Intelligent Guided Assistant')}
                    </button>
                    <button 
                      onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setActiveStep(1); }}
                      className="flex-[2] bg-mammut-darker text-mammut-white border-2 border-mammut-border font-bold text-xs lg:text-sm px-6 py-5 rounded-2xl hover:border-mammut-gold hover:bg-mammut-dark active:scale-95 transition-all duration-300 flex flex-col items-center justify-center uppercase tracking-widest text-center"
                    >
                      {t('assistant.inter2', 'Take me directly to the configurator')}
                      <span className="text-[9px] text-mammut-gold tracking-widest mt-1 opacity-70">{t('assistant.inter2Sub', '(Complex Setup)')}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 1: Material */}
            <section className={`border border-slate-200/80 p-6 md:p-8 rounded-2xl shadow-sm transition-all duration-500 ${activeStep !== 1 ? "hidden opacity-0 scale-95" : "block opacity-100 scale-100"}`} style={{ order: stepOrder.indexOf(1), backgroundColor: '#ffffff' }}>
              <div 
                className={`flex items-center justify-between cursor-pointer ${activeStep === 1 ? 'mb-6' : ''}`}
                onClick={() => openStep(1)}
              >
                <div className="flex items-center gap-3 w-full relative">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors ${activeStep === 1 ? 'bg-mammut-gold/20 text-mammut-gold' : 'bg-slate-100 text-slate-400'}`}>1</div> 
 {completedSteps.includes(1) && <Check size={20} className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" strokeWidth={3} />}
                  <h2 className={`text-xl font-bold transition-colors ${activeStep === 1 ? 'text-slate-900' : 'text-slate-400'}`}>{t('configurator.steps.category')}</h2>
                  <button onClick={(e) => { e.stopPropagation(); toggleHelp(1); }} className="text-slate-450 hover:text-mammut-gold transition-colors ml-1" title="Toggle Help"><HelpCircle size={18} /></button>
                </div>
                {expandedHelpSection === 1 && <MaterialHelp onClose={() => setExpandedHelpSection(null)} />}
                {activeStep !== 1 && <div className="text-xs font-bold text-mammut-gold bg-mammut-gold/10 px-3 py-1.5 rounded-full uppercase tracking-wider">{state.category}</div>}
              </div>
              
              <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${activeStep === 1 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  {/* Horizontal Slider */}
                  <div className="relative group pt-2">
                    <button 
                      onClick={() => categoryScrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' })}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-20 text-amber-500 hover:scale-110 transition-transform drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] border border-slate-200 backdrop-blur-sm rounded-full p-1 opacity-0 group-hover:opacity-100 hidden md:block"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                    >
                      <ChevronLeft size={40} strokeWidth={2.5} />
                    </button>
                    
                    <div ref={categoryScrollRef} className="flex overflow-x-auto gap-5 py-4 px-2 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                      {(Object.keys(CONFIG_SCHEMA.categories) as Array<keyof typeof CONFIG_SCHEMA.categories>).map(cat => (
                        <button
                          key={cat}
                          onClick={() => { dispatch({ type: 'SET_CATEGORY', payload: cat }); advanceStep(1, 2); }}
                          className={`group/btn relative w-56 shrink-0 snap-start rounded-2xl border-2 text-left transition-all overflow-hidden shadow-sm hover:shadow-md ${(completedSteps.includes(1) && state.category === cat) ? 'border-mammut-gold ring-4 ring-[#eab676]/10 scale-[1.02]' : 'border-slate-200 hover:border-slate-300'}`}
                          style={{ backgroundColor: '#ffffff' }}
                        >
                          <div className="h-48 flex items-center justify-center bg-slate-50 p-4 border-b border-slate-100 overflow-hidden">
                            <img src={CONFIG_SCHEMA.categories[cat].image} alt={cat} className="max-h-full max-w-full object-contain drop-shadow-md transition-transform duration-500 group-hover/btn:scale-110" />
                          </div>
                          <div className="p-5">
                            <div className="font-bold text-lg text-slate-800">{t(`configurator.categories.${cat}`, cat)}</div>
                          </div>
                          
                          {(completedSteps.includes(1) && state.category === cat) && (
                            <div className="absolute top-3 right-3 w-7 h-7 bg-mammut-gold text-black rounded-full flex items-center justify-center shadow-md">
                              <Check size={14} strokeWidth={4} />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>

                    <button 
                      onClick={() => categoryScrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' })}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-20 text-amber-500 hover:scale-110 transition-transform drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] border border-slate-200 backdrop-blur-sm rounded-full p-1 opacity-0 group-hover:opacity-100 hidden md:block"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                    >
                      <ChevronRight size={40} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>
            </section>            {/* Step 2: System Profile */}
            <section className={`border border-slate-200/80 p-6 md:p-8 rounded-2xl shadow-sm transition-all duration-500 ${activeStep !== 2 ? "hidden opacity-0 scale-95" : "block opacity-100 scale-100"}`} style={{ order: stepOrder.indexOf(2), backgroundColor: '#ffffff' }}>
              <div 
                className={`flex items-center justify-between cursor-pointer ${activeStep === 2 ? 'mb-6' : ''}`}
                onClick={() => openStep(2)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors ${activeStep === 2 ? 'bg-mammut-gold/20 text-mammut-gold' : 'bg-slate-100 text-slate-400'}`}>2</div> 
 {completedSteps.includes(2) && <Check size={20} className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" strokeWidth={3} />}
                  <h2 className={`text-xl font-bold transition-colors ${activeStep === 2 ? 'text-slate-900' : 'text-slate-400'}`}>{t('configurator.steps.system')}</h2>
                  <button onClick={(e) => { e.stopPropagation(); toggleHelp(2); }} className="text-slate-450 hover:text-mammut-gold transition-colors ml-1" title="Toggle Help"><HelpCircle size={18} /></button>
                </div>
                {state.profile && <div className="text-xs font-bold text-mammut-gold bg-mammut-gold/10 px-3 py-1.5 rounded-full uppercase tracking-wider transition-opacity">{CONFIG_SCHEMA.categories[state.category].profiles.find(p => p.id === state.profile)?.name || state.profile}</div>}
              </div>
              
              <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${activeStep === 2 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  <div className="pt-2">
                    {(() => {
                      const profiles = CONFIG_SCHEMA.categories[state.category].profiles;
                      if (profiles.length === 0) return <div className="text-sm text-slate-500 font-medium italic p-5 bg-slate-50 border border-slate-200 rounded-xl text-center">No specific profiles available for this category.</div>;
                      
                      const availableMaterials = Array.from(new Set(profiles.map(p => (p as any).material).filter(Boolean)));
                      const visibleProfiles = state.materialFilter ? profiles.filter(p => (p as any).material === state.materialFilter) : profiles;

                            const sortedArr = [...visibleProfiles].sort((a, b) => {
                               if (state.sortByTracker === 'default') return 0;
                               
                               const techA = (a as any).technical;
                               const techB = (b as any).technical;
                               const dir = state.sortDirection === 'asc' ? 1 : -1;
                               
                               if (state.sortByTracker === 'price') {
                                  const openingCls = resolveOpeningClass(state.sashOpenings);
                                  const priceA = estimateFramePrice(a.id, openingCls, state.dimensions.width, state.dimensions.height);
                                  const priceB = estimateFramePrice(b.id, openingCls, state.dimensions.width, state.dimensions.height);
                                  return (priceA - priceB) * dir;
                                }
                               
                               if (!techA || !techB) return 0;
                               if (state.sortByTracker === 'energy') return (techA.uwValue - techB.uwValue) * dir;
                               if (state.sortByTracker === 'depth') return (techA.profileDepth - techB.profileDepth) * dir;
                               if (state.sortByTracker === 'sound') {
                                  const parseDb = (str: string) => {
                                     if (!str) return 0;
                                     const nums = str.match(/\d+/g);
                                     return nums ? Math.max(...nums.map(Number)) : 0;
                                  };
                                  const dbA = parseDb(techA.soundInsulation);
                                  const dbB = parseDb(techB.soundInsulation);
                                  return (dbA - dbB) * dir;
                               }
                               return 0;
                            });

                            // Pin the currently selected profile to the front
                            const selectedIndex = sortedArr.findIndex(p => p.id === state.profile);
                            if (selectedIndex > 0) {
                               const selectedObj = sortedArr.splice(selectedIndex, 1)[0];
                               sortedArr.unshift(selectedObj);
                            }
                            const sortedProfiles = sortedArr;

                      return (
                        <>
                          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                            {availableMaterials.length > 0 && (
                              <div className="flex gap-2 p-1 bg-slate-100 border border-slate-200 rounded-xl overflow-x-auto hide-scrollbar flex-grow md:flex-grow-0">
                                 {availableMaterials.map(mat => (
                                    <button 
                                      key={String(mat)}
                                      onClick={() => dispatch({ type: 'SET_MATERIAL_FILTER', payload: String(mat) })} 
                                      className={`px-6 py-2.5 text-xs tracking-widest uppercase font-bold rounded-lg transition-all shadow-sm ${state.materialFilter === mat ? 'text-mammut-gold ring-1 ring-[#eab676]/30 shadow shadow-[#eab676]/10' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'}`}
                                      style={state.materialFilter === mat ? { backgroundColor: '#ffffff' } : undefined}
                                    >
                                      {String(mat)}
                                    </button>
                                 ))}
                              </div>
                            )}
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Sort By:</span>
                              <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden transition-colors hover:border-slate-300 focus-within:border-mammut-gold/50" style={{ backgroundColor: '#ffffff' }}>
                                <select 
                                  value={state.sortByTracker}
                                  onChange={(e) => dispatch({ type: 'SET_SORT_BY', payload: e.target.value as any })}
                                  className="bg-transparent text-slate-800 text-sm font-medium px-4 py-2 outline-none cursor-pointer appearance-none pr-8 relative"
                                  style={{ background: 'url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNCIgaGVpZ2h0PSI4IiB2aWV3Qm94PSIwIDAgMTQgOCI+PHBhdGggZmlsbD0iIzMzNDE1NSIgZmlsbC1vcGFjaXR5PSIwLjciIGQ9Ik03IDhMMCAwbDE0IDB6Ii8+PC9zdmc+) right 12px center no-repeat' }}
                                >
                                  <option value="default" className="text-slate-800" style={{ backgroundColor: '#ffffff' }}>Default Order</option>
                                  <option value="energy" className="text-slate-800" style={{ backgroundColor: '#ffffff' }}>Energy Efficiency</option>
                                  <option value="sound" className="text-slate-800" style={{ backgroundColor: '#ffffff' }}>Sound Insulation</option>
                                  <option value="depth" className="text-slate-800" style={{ backgroundColor: '#ffffff' }}>Profile Depth</option>
                                  <option value="price" className="text-slate-800" style={{ backgroundColor: '#ffffff' }}>Price</option>
                                </select>
                                <div className="h-6 w-px bg-slate-200"></div>
                                <button 
                                  onClick={() => dispatch({ type: 'SET_SORT_DIRECTION', payload: state.sortDirection === 'asc' ? 'desc' : 'asc' })}
                                  className="px-3 py-2 text-slate-500 hover:text-mammut-gold transition-colors"
                                  title={`Toggle Direction (Current: ${state.sortDirection === 'asc' ? 'Lowest/Thinnest to Highest' : 'Highest/Thickest to Lowest'})`}
                                >
                                  {state.sortDirection === 'asc' ? <ChevronUp size={16} strokeWidth={3} /> : <ChevronDown size={16} strokeWidth={3} />}
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="relative group">
                            <button 
                              onClick={() => profileScrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' })}
                              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 text-amber-500 hover:scale-110 transition-transform drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] border border-slate-200 backdrop-blur-sm rounded-full p-1 opacity-0 group-hover:opacity-100 hidden md:block"
                              style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                            >
                              <ChevronLeft size={40} strokeWidth={2.5} />
                            </button>

                            <div ref={profileScrollRef} className="flex overflow-x-auto gap-5 py-4 px-2 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                              {sortedProfiles.length === 0 ? (
                                <div className="text-sm text-slate-500 font-medium italic p-5 text-center w-full">No profiles found.</div>
                              ) : sortedProfiles.map(profile => (
                                <TiltProfileCard 
                                  key={profile.id} 
                                  profile={profile} 
                                  tags={profile.tags}
                                  isActive={completedSteps.includes(2) && state.profile === profile.id}
                                  onClick={() => { dispatch({ type: 'SET_PROFILE', payload: profile.id }); advanceStep(2, 3); }}
                                />
                              ))}
                            </div>

                            <button 
                              onClick={() => profileScrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' })}
                              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 text-amber-500 hover:scale-110 transition-transform drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] border border-slate-200 backdrop-blur-sm rounded-full p-1 opacity-0 group-hover:opacity-100 hidden md:block"
                              style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                            >
                              <ChevronRight size={40} strokeWidth={2.5} />
                            </button>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  <div className="pt-6 mt-6 border-t border-slate-100 flex justify-start">
                    <button onClick={(e) => { e.stopPropagation(); openStep(1); }} className="text-[11px] font-black uppercase tracking-widest text-mammut-gold bg-mammut-gold/10 px-4 py-2 rounded-lg hover:bg-mammut-gold/20 transition-colors flex items-center gap-2"><ChevronLeft size={14} /> {t('configurator.buttons.previous') || "Previous Step"}</button>
                  </div>
                </div>
              </div>
            </section>
            {/* Step 3: Window Type (Fenstertyp) */}
            <section className={`border border-slate-200/80 p-6 md:p-8 rounded-2xl shadow-sm transition-all duration-500 ${activeStep !== 3 ? "hidden opacity-0 scale-95" : "block opacity-100 scale-100"}`} style={{ order: stepOrder.indexOf(3), backgroundColor: '#ffffff' }}>
              <div 
                className={`flex items-center justify-between cursor-pointer ${activeStep === 3 ? 'mb-6' : ''}`}
                onClick={() => openStep(3)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors ${activeStep === 3 ? 'bg-mammut-gold/20 text-mammut-gold' : 'bg-slate-100 text-slate-400'}`}>3</div> 
 {completedSteps.includes(3) && <Check size={20} className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" strokeWidth={3} />}
                  <h2 className={`text-xl font-bold transition-colors ${activeStep === 3 ? 'text-slate-900' : 'text-slate-400'}`}>{t('configurator.steps.windowType')}</h2>
                  <button onClick={(e) => { e.stopPropagation(); toggleHelp(3); }} className="text-slate-450 hover:text-mammut-gold transition-colors ml-1" title="Toggle Help"><HelpCircle size={18} /></button>
                </div>
                {expandedHelpSection === 3 && <WindowTypeHelp onClose={() => setExpandedHelpSection(null)} />}
                {activeStep !== 3 && <div className="text-xs font-bold text-mammut-gold bg-mammut-gold/10 px-3 py-1.5 rounded-full uppercase tracking-wider">{String(t(`configurator.windowTypes.${state.windowTypeId}`, WINDOW_TYPES.find(w => w.id === state.windowTypeId)?.name || state.windowTypeId))}</div>}
              </div>
              
              <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${activeStep === 3 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  <div className="pt-2">
                    {[
                      { title: "1-Sash Windows", prefix: 'F1' },
                      { title: "2-Sash Windows", prefix: 'F2' },
                      { title: "3-Sash Windows", prefix: 'F3' },
                      { title: "4-Sash Windows", prefix: 'F4' },
                      { title: "Doors", prefix: 'D' }
                    ].map(group => {
                      const items = WINDOW_TYPES.filter(w => w.id.startsWith(group.prefix));
                      if (items.length === 0) return null;
                      return (
                        <div key={group.title} className="mb-8">
                          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">{group.title}</h3>
                          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                            {items.map(wt => (
                              <button
                                key={wt.id}
                                onClick={() => dispatch({ type: 'SET_WINDOW_TYPE', payload: wt.id })}
                                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-between gap-3 h-[160px] relative ${state.windowTypeId === wt.id ? 'border-mammut-gold bg-mammut-gold/10 text-mammut-gold shadow-md ring-4 ring-[#eab676]/10' : 'border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md group'}`}
                                style={{ backgroundColor: state.windowTypeId === wt.id ? undefined : '#ffffff' }}
                              >
                                {state.windowTypeId === wt.id && (
                                  <div className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-md z-20 animate-scale-in">
                                    <Check size={12} strokeWidth={3} className="text-white" />
                                  </div>
                                )}
                                <div className="w-full h-20 flex items-center justify-center relative p-2 overflow-hidden bg-slate-50 rounded-lg">
                                  <div className={`w-16 h-16 flex items-center justify-center transition-all duration-300 ${state.windowTypeId === wt.id ? 'opacity-100 scale-110 drop-shadow-[0_0_8px_rgba(234,182,118,0.5)] text-mammut-gold' : 'opacity-40 group-hover:opacity-100 group-hover:scale-105 text-slate-500'}`}>
                                    <WindowTypeGraphic 
                                      id={wt.id}
                                      sashOpenings={state.windowTypeId === wt.id ? state.sashOpenings : getDefaultSashOpenings(wt.id, wt.sashes)}
                                      className="w-full h-full object-contain"
                                    />
                                  </div>
                                </div>
                                <div className="font-bold text-[10px] text-center leading-tight whitespace-pre-wrap text-slate-700">{wt.name}<br/><span className="text-slate-500 truncate mt-1 block">[{wt.id}]</span></div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="pt-6 mt-6 border-t border-slate-100 flex justify-between items-center w-full">
                    <button onClick={(e) => { e.stopPropagation(); openStep(2); }} className="text-[11px] font-black uppercase tracking-widest text-mammut-gold bg-mammut-gold/10 px-4 py-2 rounded-lg hover:bg-mammut-gold/20 transition-colors flex items-center gap-2"><ChevronLeft size={14} /> {t('configurator.buttons.previous') || "Previous Step"}</button>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        advanceStep(3, 5); 
                      }} 
                      className="text-[11px] font-black uppercase tracking-widest text-[#111112] bg-mammut-gold px-6 py-2.5 rounded-lg hover:bg-[#d9a565] transition-colors flex items-center gap-2"
                    >
                      {t('configurator.buttons.next') || "Next Step"} <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Step 4: Unit Options */}
            <section className={`border border-slate-200/80 p-6 md:p-8 rounded-2xl shadow-sm transition-all duration-500 hidden`} style={{ order: stepOrder.indexOf(4), backgroundColor: '#ffffff' }}>
              <div 
                className={`flex items-center justify-between cursor-pointer ${activeStep === 4 ? 'mb-6' : ''}`}
                onClick={() => openStep(4)}
              >
                <div className="flex items-center gap-3 w-full relative">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors ${activeStep === 4 ? 'bg-mammut-gold/20 text-mammut-gold' : 'bg-slate-100 text-slate-400'}`}>4</div> 
                  {completedSteps.includes(4) && <Check size={20} className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" strokeWidth={3} />}
                  <h2 className={`text-xl font-bold transition-colors ${activeStep === 4 ? 'text-slate-900' : 'text-slate-400'}`}>Unit Options</h2>
                  <button onClick={(e) => { e.stopPropagation(); toggleHelp(4); }} className="text-slate-455 hover:text-mammut-gold transition-colors ml-1" title="Toggle Help"><HelpCircle size={18} /></button>
                </div>
                {activeStep !== 4 && <div className="text-xs font-bold text-mammut-gold bg-mammut-gold/10 px-3 py-1.5 rounded-full uppercase tracking-wider">{state.fittingVariant}</div>}
              </div>
              
              <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${activeStep === 4 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  <div className="pt-2">
                    <div className="mb-6">
                      <label className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 block">Fitting variant 1</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {fittingVariants.map((fv) => (
                          <button
                            key={fv.id}
                            onClick={() => { dispatch({ type: 'SET_FITTING_VARIANT', payload: fv.id }); advanceStep(4, 5); }}
                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-between gap-3 h-[180px] ${state.fittingVariant === fv.id ? 'border-mammut-gold bg-mammut-gold/10 text-mammut-gold shadow-md ring-4 ring-[#eab676]/10' : 'border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md group'}`}
                            style={{ backgroundColor: state.fittingVariant === fv.id ? undefined : '#ffffff' }}
                          >
                            <div className="flex-1 w-full flex items-center justify-center p-2 rounded-lg bg-slate-50">
                              {fv.image ? <img src={fv.image} alt={fv.name} className={`h-full object-contain max-h-[80px] transition-opacity ${state.fittingVariant === fv.id ? 'opacity-100' : 'opacity-40 grayscale group-hover:opacity-75 group-hover:grayscale-0'}`} /> : <div className="w-10 h-10 border border-dashed rounded opacity-30"/>}
                            </div>
                            <div className="font-bold text-[10px] text-center leading-tight whitespace-pre-wrap text-slate-700">{fv.name}<br/><span className="text-slate-500 truncate mt-1 block">[{fv.id}]</span></div>
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-500 italic mt-4">Determines the opening mechanism of the first sash.</p>
                    </div>
                  </div>
                  <div className="pt-6 mt-6 border-t border-slate-100 flex justify-start">
                    <button onClick={(e) => { e.stopPropagation(); openStep(3); }} className="text-[11px] font-black uppercase tracking-widest text-mammut-gold bg-mammut-gold/10 px-4 py-2 rounded-lg hover:bg-mammut-gold/20 transition-colors flex items-center gap-2"><ChevronLeft size={14} /> {t('configurator.buttons.previous') || "Previous Step"}</button>
                  </div>
                </div>
              </div>
            </section>

            {/* Step 5: Color & Decor */}
            <section className={`border border-slate-200/80 p-6 md:p-8 rounded-2xl shadow-sm transition-all duration-500 ${activeStep !== 5 ? "hidden opacity-0 scale-95" : "block opacity-100 scale-100"}`} style={{ order: stepOrder.indexOf(5), backgroundColor: '#ffffff' }}>
              <div 
                className={`flex items-center justify-between cursor-pointer ${activeStep === 5 ? 'mb-6' : ''}`}
                onClick={() => openStep(5)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors ${activeStep === 5 ? 'bg-mammut-gold/20 text-mammut-gold' : 'bg-slate-100 text-slate-400'}`}>5</div> 
 {completedSteps.includes(5) && <Check size={20} className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" strokeWidth={3} />}
                  <h2 className={`text-xl font-bold transition-colors ${activeStep === 5 ? 'text-slate-900' : 'text-slate-400'}`}>{t('configurator.steps.color')}</h2>
                  <button onClick={(e) => { e.stopPropagation(); toggleHelp(5); }} className="text-slate-450 hover:text-mammut-gold transition-colors ml-1" title="Toggle Help"><HelpCircle size={18} /></button>
                </div>
                {activeStep !== 5 && <div className="text-[10px] font-bold text-mammut-gold bg-mammut-gold/10 px-3 py-1.5 rounded-full uppercase tracking-wider">In: {COLOR_LOCALE.colors[state.interiorColor]?.name} | Ex: {COLOR_LOCALE.colors[state.exteriorColor]?.name}</div>}
              </div>
              
              <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${activeStep === 5 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  <div className="pt-2">

                    {/* Dual Color Tabs */}
                    <div className="flex gap-2 w-full mb-6 p-1 bg-slate-100 rounded-xl">
                      <button 
                        onClick={() => setColorTab('interior')} 
                        className={`flex-1 py-3 text-sm tracking-widest uppercase font-bold rounded-lg transition-all shadow-sm ${colorTab === 'interior' ? 'text-mammut-gold ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'}`}
                        style={{ backgroundColor: colorTab === 'interior' ? '#ffffff' : 'transparent' }}
                      >
                        Interior Color
                      </button>
                      <button 
                        onClick={() => setColorTab('exterior')} 
                        className={`flex-1 py-3 text-sm tracking-widest uppercase font-bold rounded-lg transition-all shadow-sm ${colorTab === 'exterior' ? 'text-mammut-gold ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'}`}
                        style={{ backgroundColor: colorTab === 'exterior' ? '#ffffff' : 'transparent' }}
                      >
                        Exterior Color
                      </button>
                    </div>

                    {/* Color Group Selector */}
                    <div className="flex flex-wrap gap-2 mb-6 p-1 bg-slate-100 border border-slate-200 rounded-xl inline-flex w-full md:w-auto">
                      {(Object.keys(COLOR_LOCALE.colorGroups) as Array<string>).map(grp => {
                        const activeGrp = colorTab === 'interior' ? state.interiorColorGroup : state.exteriorColorGroup;
                        return (
                          <button
                            key={grp}
                            onClick={() => {
                              dispatch({ type: colorTab === 'interior' ? 'SET_INTERIOR_COLOR_GROUP' : 'SET_EXTERIOR_COLOR_GROUP', payload: grp });
                            }}
                            className={`flex-1 md:flex-none px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${activeGrp === grp ? 'text-mammut-gold shadow shadow-[#eab676]/10' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'}`}
                            style={{ backgroundColor: activeGrp === grp ? '#ffffff' : 'transparent' }}
                          >
                            {COLOR_LOCALE.colorGroups[grp]}
                          </button>
                        );
                      })}
                    </div>

                    {/* Color Grid */}
                    <div className="flex flex-wrap gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar p-2">
                       {Object.keys(COLOR_LOCALE.colors)
                        .filter(colorId => COLOR_LOCALE.colors[colorId].group === COLOR_LOCALE.colorGroups[colorTab === 'interior' ? state.interiorColorGroup : state.exteriorColorGroup])
                        .filter(colorId => activeColors ? (activeColors as string[]).includes(colorId) : true)
                        .map(colorId => {
                          const colorData = COLOR_LOCALE.colors[colorId];
                          const isActive = colorTab === 'interior' ? state.interiorColor === colorId : state.exteriorColor === colorId;
                          return (
                            <button
                              key={colorId}
                              onClick={() => { 
                                dispatch({ type: colorTab === 'interior' ? 'SET_INTERIOR_COLOR' : 'SET_EXTERIOR_COLOR', payload: colorId }); 
                              }}
                              className={`relative group w-12 h-12 transition-all duration-200 outline outline-offset-2 ${
                                isActive ? 'outline-[#eab676] scale-105 z-10' : 'outline-transparent hover:outline-slate-300'
                              }`}
                              title={colorData.name}
                            >
                              {isActive && (
                                <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-md z-20 animate-scale-in">
                                  <Check size={10} strokeWidth={4} className="text-white" />
                                </div>
                              )}
                              <div 
                                className="w-full h-full border border-slate-200/50 bg-cover bg-center"
                                style={{ backgroundImage: colorData.swatch }}
                              />
                              {/* Tooltip on hover */}
                              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 border border-slate-200 text-slate-700 text-[10px] uppercase font-semibold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-lg" style={{ backgroundColor: '#ffffff' }}>
                                {colorData.name}
                              </span>
                            </button>
                          );
                      })}
                    </div>
                  </div>
                  <div className="pt-6 mt-6 border-t border-slate-100 flex justify-between items-center w-full">
                    <button onClick={(e) => { e.stopPropagation(); openStep(3); }} className="text-[11px] font-black uppercase tracking-widest text-mammut-gold bg-mammut-gold/10 px-4 py-2 rounded-lg hover:bg-mammut-gold/20 transition-colors flex items-center gap-2"><ChevronLeft size={14} /> {t('configurator.buttons.previous') || "Previous Step"}</button>
                    <button 
                      onClick={() => {
                        if (colorTab === 'interior') {
                          setColorTab('exterior');
                        } else {
                          advanceStep(5, 6);
                        }
                      }}
                      className="text-[11px] font-black uppercase tracking-widest text-[#111112] bg-mammut-gold px-6 py-2.5 rounded-lg hover:bg-[#d9a565] transition-colors flex items-center gap-2"
                    >
                      {colorTab === 'interior' ? "Next: Exterior Color" : "Confirm & Next Step"} <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Step 6: Dimensions */}
            <section className={`border border-slate-200/80 p-6 md:p-8 rounded-2xl shadow-sm transition-all duration-500 ${activeStep !== 6 ? "hidden opacity-0 scale-95" : "block opacity-100 scale-100"}`} style={{ order: stepOrder.indexOf(6), backgroundColor: '#ffffff' }}>
              <div 
                className={`flex items-center justify-between cursor-pointer ${activeStep === 6 ? 'mb-6' : ''}`}
                onClick={() => openStep(6)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors ${activeStep === 6 ? 'bg-mammut-gold/20 text-mammut-gold' : 'bg-slate-100 text-slate-400'}`}>6</div> 
 {completedSteps.includes(6) && <Check size={20} className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" strokeWidth={3} />}
                  <h2 className={`text-xl font-bold transition-colors ${activeStep === 6 ? 'text-slate-900' : 'text-slate-400'}`}>{t('configurator.steps.dimensions')}</h2>
                  <button onClick={(e) => { e.stopPropagation(); toggleHelp(6); }} className="text-slate-450 hover:text-mammut-gold transition-colors ml-1" title="Toggle Help"><HelpCircle size={18} /></button>
                </div>
                {activeStep !== 6 && <div className="text-xs font-bold text-mammut-gold bg-mammut-gold/10 px-3 py-1.5 rounded-full uppercase tracking-wider">{state.dimensions.width} x {state.dimensions.height}</div>}
              </div>
              
              <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${activeStep === 6 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  <div className="pt-2 grid md:grid-cols-2 gap-8">
                    {/* Width Control */}
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                      <div className="flex justify-between items-start mb-4">
                        <label className="text-sm font-bold text-slate-600 flex items-center gap-2 uppercase tracking-widest leading-none">
                          <Ruler size={16} className="text-mammut-gold"/> {t('configurator.inputs.w')}
                        </label>
                        <div className="flex flex-col items-end gap-0.5">
                          <div className="flex items-center gap-1.5 focus-within:ring-2 ring-[#eab676]/30 rounded px-1 -mr-1 transition-all">
                            <input
                              type="number"
                              value={widthText}
                              onChange={(e) => {
                                const val = e.target.value;
                                setWidthText(val);
                                const num = Number(val);
                                if (!isNaN(num) && num > 0) {
                                  dispatch({ type: 'SET_DIMENSIONS', payload: { width: num, height: state.dimensions.height }});
                                }
                              }}
                              onBlur={(e) => {
                                let val = Number(e.target.value) || activeLimits.minWidth;
                                val = Math.max(activeLimits.minWidth, Math.min(activeLimits.maxWidth, val));
                                dispatch({ type: 'SET_DIMENSIONS', payload: { width: val, height: state.dimensions.height }});
                                setWidthText(val.toString());
                              }}
                              className="w-[70px] text-slate-800 text-right font-black border border-slate-200 focus:border-mammut-gold rounded px-1.5 py-0.5 outline-none"
                              style={{ backgroundColor: '#ffffff' }}
                            />
                            <span className="text-xs font-bold text-slate-500">{t('configurator.inputs.mm')}</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 tracking-wider">({(state.dimensions.width / 10).toFixed(0)} {t('configurator.inputs.cm')}</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min={activeLimits.minWidth}
                        max={activeLimits.maxWidth}
                        step="10"
                        value={state.dimensions.width}
                        onChange={(e) => dispatch({ type: 'SET_DIMENSIONS', payload: { width: Number(e.target.value), height: state.dimensions.height } })}
                        className="w-full accent-mammut-gold mb-2 cursor-pointer bg-slate-200/60 border border-slate-200/50 rounded-lg h-2"
                      />
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                        <span>{activeLimits.minWidth} mm</span>
                        <span>{activeLimits.maxWidth} mm</span>
                      </div>
                    </div>

                    {/* Height Control */}
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                      <div className="flex justify-between items-start mb-4">
                        <label className="text-sm font-bold text-slate-600 flex items-center gap-2 uppercase tracking-widest leading-none">
                          <Ruler size={16} className="rotate-90 text-mammut-gold"/> {t('configurator.inputs.h')}
                        </label>
                        <div className="flex flex-col items-end gap-0.5">
                          <div className="flex items-center gap-1.5 focus-within:ring-2 ring-[#eab676]/30 rounded px-1 -mr-1 transition-all">
                            <input
                              type="number"
                              value={heightText}
                              onChange={(e) => {
                                const val = e.target.value;
                                setHeightText(val);
                                const num = Number(val);
                                if (!isNaN(num) && num > 0) {
                                  dispatch({ type: 'SET_DIMENSIONS', payload: { width: state.dimensions.width, height: num }});
                                }
                              }}
                              onBlur={(e) => {
                                let val = Number(e.target.value) || activeLimits.minHeight;
                                val = Math.max(activeLimits.minHeight, Math.min(activeLimits.maxHeight, val));
                                dispatch({ type: 'SET_DIMENSIONS', payload: { width: state.dimensions.width, height: val }});
                                setHeightText(val.toString());
                              }}
                              className="w-[70px] text-slate-800 text-right font-black border border-slate-200 focus:border-mammut-gold rounded px-1.5 py-0.5 outline-none"
                              style={{ backgroundColor: '#ffffff' }}
                            />
                            <span className="text-xs font-bold text-slate-500">{t('configurator.inputs.mm')}</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 tracking-wider">({(state.dimensions.height / 10).toFixed(0)} {t('configurator.inputs.cm')}</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min={activeLimits.minHeight}
                        max={activeLimits.maxHeight}
                        step="10"
                        value={state.dimensions.height}
                        onChange={(e) => dispatch({ type: 'SET_DIMENSIONS', payload: { width: state.dimensions.width, height: Number(e.target.value) } })}
                        className="w-full accent-mammut-gold mb-2 cursor-pointer bg-slate-200/60 border border-slate-200/50 rounded-lg h-2"
                      />
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                        <span>{activeLimits.minHeight} mm</span>
                        <span>{activeLimits.maxHeight} mm</span>
                      </div>
                    </div>
                  </div>
                  
                  {isMobile && (
                    <div className="mt-8 flex justify-center w-full">
                      <ARMeasurementButton
                        onMeasureComplete={(w, h, detectedType) => {
                          dispatch({ type: 'SET_DIMENSIONS', payload: { width: w, height: h }});
                          if (detectedType) {
                            dispatch({ type: 'SET_WINDOW_TYPE', payload: detectedType });
                            dispatch({ type: 'SET_CATEGORY', payload: 'Windows' }); 
                            dispatch({ type: 'SET_PROFILE', payload: 'iglo5' });
                            if (!completedSteps.includes(3)) setCompletedSteps(prev => [...prev, 3]);
                          }
                        }}
                      />
                    </div>
                  )}

                  <div className="mt-8 flex justify-between items-center w-full pt-6 border-t border-slate-100">
                    <button onClick={(e) => { e.stopPropagation(); openStep(5); }} className="text-[11px] font-black uppercase tracking-widest text-mammut-gold bg-mammut-gold/10 px-4 py-2 rounded-lg hover:bg-mammut-gold/20 transition-colors flex items-center gap-2"><ChevronLeft size={14} /> {t('configurator.buttons.previous') || "Previous Step"}</button>
                    <button 
                      onClick={() => advanceStep(6, showSealsStep ? 8 : 9)}
                      className="px-6 py-3 bg-mammut-gold !text-black hover:bg-[#F3C47F] text-mammut-white font-bold rounded-xl shadow-lg shadow-[#eab676]/20 transition-all active:scale-95 text-sm uppercase tracking-wider"
                    >
                      Confirm & Next Step
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Step 7: Glazing Package */}
            <section className={`bg-mammut-dark p-6 md:p-8 rounded-2xl shadow-sm transition-all duration-500 ${activeStep !== 7 ? "hidden opacity-0 scale-95" : "block opacity-100 scale-100"}`} style={{ order: stepOrder.indexOf(7) }}>
              <div 
                className={`flex items-center justify-between cursor-pointer ${activeStep === 7 ? 'mb-6' : ''}`}
                onClick={() => openStep(7)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors ${activeStep === 7 ? 'bg-mammut-gold/20 text-mammut-gold' : 'bg-mammut-darker text-mammut-white/40'}`}>7</div> 
 {completedSteps.includes(7) && <Check size={20} className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" strokeWidth={3} />}
                  <h2 className={`text-xl font-bold transition-colors ${activeStep === 7 ? 'text-mammut-white/90' : 'text-mammut-white/40'}`}>{t('configurator.steps.glazing')}</h2>
                  <button onClick={(e) => { e.stopPropagation(); toggleHelp(7); }} className="text-mammut-white/40 hover:text-mammut-gold transition-colors ml-1" title="Toggle Help"><HelpCircle size={18} /></button>
                </div>
                {activeStep !== 7 && <div className="text-xs font-bold text-mammut-gold bg-mammut-gold/10 px-3 py-1.5 rounded-full uppercase tracking-wider">
                  {(() => {
                    const glazingList = activeGlazing || CONFIG_SCHEMA.glazing;
                    const pkg = glazingList.find((g: any) => g.id === state.glazingPackage);
                    return pkg?.name || GLASS_LOCALE[state.glazingPackage as keyof typeof GLASS_LOCALE] || state.glazingPackage;
                  })()}
                </div>}
              </div>

              <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${activeStep === 7 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  <div className="pt-2">
                    <h3 className="text-sm font-bold text-mammut-white/50 uppercase tracking-widest mb-3">1. Select Filling Package</h3>
                    {(() => {
                      const items = activeGlazing || CONFIG_SCHEMA.glazing;
                      // Determine unique groups based on string interpolation to avoid TS errors
                      const groups = Array.from(new Set(items.map((i: any) => i.group ? String(i.group) : 'Standard Options')));
                      
                      return groups.map(groupName => {
                        const groupItems = items.filter((i: any) => (i.group ? String(i.group) : 'Standard Options') === groupName);
                        return (
                          <div key={groupName} className="mb-8 last:mb-6">
                            <h4 className="text-xs font-bold text-mammut-gold uppercase tracking-[0.2em] mb-4 border-b border-mammut-border pb-2">{groupName}</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              {groupItems.map((gl: any) => (
                                <button
                                  key={gl.id}
                                  onClick={() => { dispatch({ type: 'SET_GLAZING_PACKAGE', payload: gl.id }); }}
                                  className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col ${state.glazingPackage === gl.id ? 'border-mammut-gold bg-mammut-gold/10 ring-4 ring-[#eab676]/10' : 'border-mammut-border hover:border-mammut-border shadow-sm hover:shadow-md bg-mammut-darker'}`}
                                >
                                  <div className="flex items-center justify-between mb-2 w-full">
                                    <div className="font-bold text-sm text-mammut-white/90 truncate mr-2" title={gl.name || GLASS_LOCALE[gl.id as keyof typeof GLASS_LOCALE] || gl.id}>{gl.name || GLASS_LOCALE[gl.id as keyof typeof GLASS_LOCALE] || gl.id}</div>
                                    <Layers size={18} className={state.glazingPackage === gl.id ? 'text-mammut-gold shrink-0' : 'text-mammut-white/30 shrink-0'}/>
                                  </div>
                                  {gl.description2 && <div className="text-[10px] text-mammut-white/40 mb-2 truncate" title={gl.description2}>{gl.description2}</div>}
                                  <div className="text-[10px] font-bold text-mammut-gold/60 uppercase tracking-widest mt-auto pt-1">Base Cost x {Number(gl.priceMod || 1).toFixed(2)}</div>
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      });
                    })()}

                    {activePanes && activePanes.length > 0 && (
                      <div className="border-t border-mammut-border pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                           <label className="block text-xs font-bold text-mammut-white/50 uppercase tracking-widest mb-2">Glass Outside</label>
                           <select 
                             value={state.glassOutside} 
                             onChange={(e) => dispatch({ type: 'SET_GLASS_OUTSIDE', payload: e.target.value })}
                             className="w-full bg-mammut-darker border border-mammut-border rounded-lg p-3 text-mammut-white focus:border-mammut-gold focus:outline-none transition-colors"
                           >
                              {activePanes.map((p: any) => (
                                 <option key={p.code} value={p.code}>{p.code} ({p.thickness}mm {p.glass_type})</option>
                              ))}
                           </select>
                        </div>
                        
                        {(state.glazingPackage && state.glazingPackage.startsWith('3-')) && (
                          <div>
                             <label className="block text-xs font-bold text-mammut-white/50 uppercase tracking-widest mb-2">Glass Middle</label>
                             <select 
                               value={state.glassMiddle} 
                               onChange={(e) => dispatch({ type: 'SET_GLASS_MIDDLE', payload: e.target.value })}
                               className="w-full bg-mammut-darker border border-mammut-border rounded-lg p-3 text-mammut-white focus:border-mammut-gold focus:outline-none transition-colors"
                             >
                                <option value="">None</option>
                                {activePanes.map((p: any) => (
                                   <option key={p.code} value={p.code}>{p.code} ({p.thickness}mm {p.glass_type})</option>
                                ))}
                             </select>
                          </div>
                        )}

                        <div>
                           <label className="block text-xs font-bold text-mammut-white/50 uppercase tracking-widest mb-2">Glass Inside</label>
                           <select 
                             value={state.glassInside} 
                             onChange={(e) => dispatch({ type: 'SET_GLASS_INSIDE', payload: e.target.value })}
                             className="w-full bg-mammut-darker border border-mammut-border rounded-lg p-3 text-mammut-white focus:border-mammut-gold focus:outline-none transition-colors"
                           >
                              {activePanes.map((p: any) => (
                                 <option key={p.code} value={p.code}>{p.code} ({p.thickness}mm {p.glass_type})</option>
                              ))}
                           </select>
                        </div>

                        {activeSpacers && activeSpacers.length > 0 && (
                          <div className="col-span-1 md:col-span-2 mt-4">
                             <SpacerScrollWheel 
                               label="Spacer / Frame Type"
                               value={state.glassSpacer} 
                               onChange={(val) => dispatch({ type: 'SET_GLASS_SPACER', payload: val })}
                               options={activeSpacers}
                             />
                          </div>
                        )}
                      </div>
                    )}
                    <div className="mt-6 flex justify-between items-center w-full pt-6 border-t border-mammut-border">
                       <button onClick={(e) => { e.stopPropagation(); openStep(3); }} className="text-[11px] font-black uppercase tracking-widest text-mammut-gold bg-mammut-gold/10 px-4 py-2 rounded-lg hover:bg-mammut-gold/20 transition-colors flex items-center gap-2"><ChevronLeft size={14} /> {t('configurator.buttons.previous') || "Previous Step"}</button>
                       <button onClick={() => advanceStep(7, 5)} className="bg-mammut-gold hover:bg-[#d9a565] text-[#111112] font-black py-3 px-8 rounded-xl transition-colors">Confirm & Next Step</button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Step 8: Seals (Gaskets) */}
            {showSealsStep && (
            <section className={`border border-slate-200/80 p-6 md:p-8 rounded-2xl shadow-sm transition-all duration-500 ${activeStep !== 8 ? "hidden opacity-0 scale-95" : "block opacity-100 scale-100"}`} style={{ order: stepOrder.indexOf(8), backgroundColor: '#ffffff' }}>
              <div 
                className={`flex items-center justify-between cursor-pointer ${activeStep === 8 ? 'mb-6' : ''}`}
                onClick={() => openStep(8)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors ${activeStep === 8 ? 'bg-mammut-gold/20 text-mammut-gold' : 'bg-slate-100 text-slate-400'}`}>8</div> 
                  {completedSteps.includes(8) && <Check size={20} className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" strokeWidth={3} />}
                  <h2 className={`text-xl font-bold transition-colors ${activeStep === 8 ? 'text-slate-900' : 'text-slate-400'}`}>---Seals---</h2>
                </div>
                {activeStep !== 8 && <div className="text-xs font-bold text-mammut-gold bg-mammut-gold/10 px-3 py-1.5 rounded-full uppercase tracking-wider">{state.gasketColor === 'szary' ? 'Grey' : 'Black'}</div>}
              </div>

              <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${activeStep === 8 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  <div className="pt-2 grid grid-cols-2 gap-4">
                    <button
                      onClick={() => { dispatch({ type: 'SET_GASKET_COLOR', payload: 'czarny' }); advanceStep(8, 9); }}
                      className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${state.gasketColor === 'czarny' || !state.gasketColor ? 'border-mammut-gold ring-4 ring-[#eab676]/10 bg-mammut-gold/5' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      <div className="w-12 h-12 rounded-full mb-3 shadow-inner" style={{ backgroundColor: '#1c1c1c' }} />
                      <span className="font-bold text-slate-800">Black (czarny)</span>
                    </button>
                    <button
                      onClick={() => { dispatch({ type: 'SET_GASKET_COLOR', payload: 'szary' }); advanceStep(8, 9); }}
                      className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${state.gasketColor === 'szary' ? 'border-mammut-gold ring-4 ring-[#eab676]/10 bg-mammut-gold/5' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      <div className="w-12 h-12 rounded-full mb-3 shadow-inner" style={{ backgroundColor: '#6b7280' }} />
                      <span className="font-bold text-slate-800">Grey (szary)</span>
                    </button>
                  </div>
                  <div className="pt-6 mt-6 border-t border-slate-100 flex justify-between">
                     <button onClick={(e) => { e.stopPropagation(); openStep(6); }} className="text-[11px] font-black uppercase tracking-widest text-mammut-gold bg-mammut-gold/10 px-4 py-2 rounded-lg hover:bg-mammut-gold/20 transition-colors flex items-center gap-2"><ChevronLeft size={14} /> {t('configurator.buttons.previous') || "Previous Step"}</button>
                  </div>
                </div>
              </div>
            </section>
            )}

            {/* Step 9: Accessories & Add-ons */}
            <section className={`bg-mammut-dark p-6 md:p-8 rounded-2xl shadow-sm transition-all duration-500 ${activeStep !== 9 ? "hidden opacity-0 scale-95" : "block opacity-100 scale-100"}`} style={{ order: stepOrder.indexOf(9) }}>
              <div 
                className={`flex items-center justify-between cursor-pointer ${activeStep === 9 ? 'mb-6' : ''}`}
                onClick={() => openStep(9)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-colors ${activeStep === 9 ? 'bg-mammut-gold/20 text-mammut-gold' : 'bg-mammut-darker text-mammut-white/40'}`}>9</div> 
                  {completedSteps.includes(9) && <Check size={20} className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]" strokeWidth={3} />}
                  <h2 className={`text-xl font-bold transition-colors ${activeStep === 9 ? 'text-mammut-white/90' : 'text-mammut-white/40'}`}>{t('configurator.steps.options')}</h2>
                </div>
                {activeStep === 9 ? (
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setActiveStep(-1); 
                      // Mark as completed even if no addons selected so it visually resolves
                      setCompletedSteps(prev => Array.from(new Set([...prev, 9]))); 
                      // Bump step order to bottom
                      setStepOrder(prev => { const n = prev.filter(s => s !== 9); n.push(9); return n; });
                    }}
                    className="p-1.5 rounded-full hover:bg-white/10 text-mammut-white/50 hover:text-mammut-white transition-all transform hover:scale-110 active:scale-95"
                    title="Close"
                  >
                    <X size={22} strokeWidth={2.5} />
                  </button>
                ) : (
                  state.addons.length > 0 && <div className="text-xs font-bold text-mammut-gold bg-mammut-gold/10 px-3 py-1.5 rounded-full uppercase tracking-wider">{state.addons.length} selected</div>
                )}
              </div>

              <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${activeStep === 9 ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  <div className="pt-2 grid gap-3">
                    {CONFIG_SCHEMA.addons.map(addon => {
                      const isActive = state.addons.includes(addon.id);
                      return (
                        <button
                          key={addon.id}
                          onClick={() => dispatch({ type: 'TOGGLE_ADDON', payload: addon.id })}
                          className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all ${isActive ? 'border-mammut-gold bg-mammut-gold/10' : 'border-mammut-border hover:border-mammut-border shadow-sm hover:shadow-md'}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${isActive ? 'bg-mammut-gold !text-black border-mammut-gold text-mammut-white' : 'border-mammut-border bg-mammut-dark'}`}>
                              {isActive && <Check size={14} strokeWidth={4}/>}
                            </div>
                            <span className="font-bold text-mammut-white/80">{addon.name}</span>
                          </div>
                          <span className="text-sm font-black text-mammut-gold">+€{addon.price}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="pt-6 mt-6 border-t border-mammut-border flex justify-start">
                    <button onClick={(e) => { e.stopPropagation(); openStep(showSealsStep ? 8 : 6); }} className="text-[11px] font-black uppercase tracking-widest text-mammut-gold bg-mammut-gold/10 px-4 py-2 rounded-lg hover:bg-mammut-gold/20 transition-colors flex items-center gap-2"><ChevronLeft size={14} /> {t('configurator.buttons.previous') || "Previous Step"}</button>
                  </div>
                </div>
              </div>
            </section>

          </div>

          <div className={`w-full transition-all duration-700 ${activeStep === 0 ? "hidden" : completedSteps.length === 0 ? "opacity-0 translate-x-10 pointer-events-none hidden lg:block" : "opacity-100 translate-x-0"}`}>
            
            {/* Glassmorphism Summary Card */}
            <div className="bg-mammut-dark/70 backdrop-blur-xl border border-white/60 shadow-2xl shadow-indigo-900/5 rounded-3xl overflow-hidden">
              <div className="p-8 space-y-6">
                
                <div>
                  <h3 className="text-mammut-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-4">{t('configurator.summary.title')}</h3>
                  <div className="space-y-1 text-sm">
                    {/* Input-Driven Dimensions Row */}
                    <div className="py-3 px-3 mb-3 -mx-2 bg-mammut-darker border border-mammut-gold/20 rounded-xl shadow-inner">
                      <div className="flex justify-between mb-3 border-b border-mammut-gold/20 pb-2">
                        <span className="text-mammut-white/50 font-bold text-xs uppercase tracking-wider flex items-center gap-2">{t('configurator.summary.dimensions')}</span>
                        <button onClick={() => openStep(6)} className="text-[10px] font-black uppercase tracking-widest text-mammut-gold hover:text-mammut-gold">{t('configurator.summary.edit')}</button>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 flex flex-col items-center">
                          <div className="flex items-center justify-between w-full bg-mammut-dark border border-mammut-border focus-within:border-mammut-gold focus-within:ring-2 ring-[#eab676]/20 rounded px-2 py-1 transition-all">
                            <span className="text-[10px] font-bold text-mammut-white/40">W</span>
                            <div className="flex items-center gap-1 w-full justify-end">
                              <input 
                                type="number"
                                value={widthText}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setWidthText(val);
                                  const num = Number(val);
                                  if (!isNaN(num) && num > 0) {
                                    dispatch({ type: 'SET_DIMENSIONS', payload: { width: num, height: state.dimensions.height }});
                                  }
                                }}
                                onBlur={(e) => {
                                  let val = Number(e.target.value) || CONFIG_SCHEMA.categories[state.category].minWidth;
                                  val = Math.max(CONFIG_SCHEMA.categories[state.category].minWidth, Math.min(CONFIG_SCHEMA.categories[state.category].maxWidth, val));
                                  dispatch({ type: 'SET_DIMENSIONS', payload: { width: val, height: state.dimensions.height }});
                                  setWidthText(val.toString());
                                }}
                                className="w-[55px] text-right bg-transparent text-sm font-black text-mammut-white/90 focus:outline-none"
                              />
                              <span className="text-[10px] font-bold text-mammut-white/40">{t('configurator.inputs.mm')}</span>
                            </div>
                          </div>
                          <span className="text-[9px] font-bold text-mammut-white/40 mt-1 uppercase tracking-widest">({(state.dimensions.width / 10).toFixed(0)} {t('configurator.inputs.cm')}</span>
                        </div>

                        <span className="text-mammut-white/30 font-black text-xs">×</span>

                        <div className="flex-1 flex flex-col items-center">
                          <div className="flex items-center justify-between w-full bg-mammut-dark border border-mammut-border focus-within:border-mammut-gold focus-within:ring-2 ring-[#eab676]/20 rounded px-2 py-1 transition-all">
                            <span className="text-[10px] font-bold text-mammut-white/40">H</span>
                            <div className="flex items-center gap-1 w-full justify-end">
                              <input 
                                type="number"
                                value={heightText}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setHeightText(val);
                                  const num = Number(val);
                                  if (!isNaN(num) && num > 0) {
                                    dispatch({ type: 'SET_DIMENSIONS', payload: { width: state.dimensions.width, height: num }});
                                  }
                                }}
                                onBlur={(e) => {
                                  let val = Number(e.target.value) || CONFIG_SCHEMA.categories[state.category].minHeight;
                                  val = Math.max(CONFIG_SCHEMA.categories[state.category].minHeight, Math.min(CONFIG_SCHEMA.categories[state.category].maxHeight, val));
                                  dispatch({ type: 'SET_DIMENSIONS', payload: { width: state.dimensions.width, height: val }});
                                  setHeightText(val.toString());
                                }}
                                className="w-[55px] text-right bg-transparent text-sm font-black text-mammut-white/90 focus:outline-none"
                              />
                              <span className="text-[10px] font-bold text-mammut-white/40">{t('configurator.inputs.mm')}</span>
                            </div>
                          </div>
                          <span className="text-[9px] font-bold text-mammut-white/40 mt-1 uppercase tracking-widest">({(state.dimensions.height / 10).toFixed(0)} {t('configurator.inputs.cm')}</span>
                        </div>
                      </div>
                    </div>

                    <button onClick={() => openStep(1)} className="flex w-full text-left justify-between items-center group py-2 -mx-2 px-2 rounded-lg hover:bg-mammut-darker transition-colors">
                      <div className="flex items-center gap-2.5"><span className="w-5 h-5 rounded-md inline-flex items-center justify-center bg-[#2a2a2b] border border-white/5 shadow-inner text-[10px] font-black text-mammut-white/50 group-hover:bg-mammut-gold group-hover:text-black group-hover:border-mammut-gold transition-all duration-300 drop-shadow-sm">1</span><span className="text-mammut-white/50 group-hover:text-mammut-gold font-medium text-xs uppercase tracking-wider transition-colors">{t('configurator.summary.material')}</span></div> 
                      <span className="font-bold text-mammut-white group-hover:text-mammut-gold transition-colors">{completedSteps.includes(1) ? state.category : '---'}</span>
                    </button>
                    <button onClick={() => openStep(2)} className="flex w-full text-left justify-between items-center group py-2 -mx-2 px-2 rounded-lg hover:bg-mammut-darker transition-colors">
                      <div className="flex items-center gap-2.5"><span className="w-5 h-5 rounded-md inline-flex items-center justify-center bg-[#2a2a2b] border border-white/5 shadow-inner text-[10px] font-black text-mammut-white/50 group-hover:bg-mammut-gold group-hover:text-black group-hover:border-mammut-gold transition-all duration-300 drop-shadow-sm">2</span><span className="text-mammut-white/50 group-hover:text-mammut-gold font-medium text-xs uppercase tracking-wider transition-colors">{t('configurator.summary.system')}</span></div> 
                      <span className="font-bold text-mammut-white group-hover:text-mammut-gold transition-colors truncate max-w-[150px] text-right">{completedSteps.includes(2) && state.profile ? (CONFIG_SCHEMA.categories[state.category].profiles.find(p => p.id === state.profile)?.name || state.profile) : '---'}</span>
                    </button>
                    <button onClick={() => openStep(3)} className="flex w-full text-left justify-between items-center group py-2 -mx-2 px-2 rounded-lg hover:bg-mammut-darker transition-colors">
                      <div className="flex items-center gap-2.5"><span className="w-5 h-5 rounded-md inline-flex items-center justify-center bg-[#2a2a2b] border border-white/5 shadow-inner text-[10px] font-black text-mammut-white/50 group-hover:bg-mammut-gold group-hover:text-black group-hover:border-mammut-gold transition-all duration-300 drop-shadow-sm">3</span><span className="text-mammut-white/50 group-hover:text-mammut-gold font-medium text-xs uppercase tracking-wider transition-colors">{t('configurator.summary.windowType')}</span></div> 
                      <span className="font-bold text-mammut-white group-hover:text-mammut-gold transition-colors truncate max-w-[150px] text-right" title={WINDOW_TYPES.find(w => w.id === state.windowTypeId)?.name || state.windowTypeId}>
                        {state.windowTypeId ? `[${state.windowTypeId}] ${WINDOW_TYPES.find(w => w.id === state.windowTypeId)?.name || ''}` : '---'}
                      </span>
                    </button>
                    <button onClick={() => openStep(4)} className="hidden w-full text-left justify-between items-center group py-2 -mx-2 px-2 rounded-lg hover:bg-mammut-darker transition-colors">
                      <div className="flex items-center gap-2.5"><span className="w-5 h-5 rounded-md inline-flex items-center justify-center bg-[#2a2a2b] border border-white/5 shadow-inner text-[10px] font-black text-mammut-white/50 group-hover:bg-mammut-gold group-hover:text-black group-hover:border-mammut-gold transition-all duration-300 drop-shadow-sm">4</span><span className="text-mammut-white/50 group-hover:text-mammut-gold font-medium text-xs uppercase tracking-wider transition-colors">Unit Options</span></div> 
                      <span className="font-bold text-mammut-white group-hover:text-mammut-gold transition-colors truncate max-w-[150px] text-right" title={fittingVariants.find(fv => fv.id === state.fittingVariant)?.name || state.fittingVariant}>
                        {state.fittingVariant ? `[${state.fittingVariant}] ${fittingVariants.find(fv => fv.id === state.fittingVariant)?.name || ''}` : '---'}
                      </span>
                    </button>
                    <button onClick={() => { openStep(5); setColorTab('interior'); }} className="flex w-full text-left justify-between items-center group py-2 -mx-2 px-2 rounded-lg hover:bg-mammut-darker transition-colors">
                      <div className="flex items-center gap-2.5"><span className="w-5 h-5 rounded-md inline-flex items-center justify-center bg-[#2a2a2b] border border-white/5 shadow-inner text-[10px] font-black text-mammut-white/50 group-hover:bg-mammut-gold group-hover:text-black group-hover:border-mammut-gold transition-all duration-300 drop-shadow-sm">5</span><span className="text-mammut-white/50 group-hover:text-mammut-gold font-medium text-xs uppercase tracking-wider transition-colors">Interior Color</span></div> 
                      <span className="font-bold text-mammut-white group-hover:text-mammut-gold transition-colors line-clamp-1">{completedSteps.includes(5) ? (COLOR_LOCALE.colors[state.interiorColor]?.name || state.interiorColor) : '---'}</span>
                    </button>
                    <button onClick={() => { openStep(5); setColorTab('exterior'); }} className="flex w-full text-left justify-between items-center group py-2 -mx-2 px-2 rounded-lg hover:bg-mammut-darker transition-colors">
                      <div className="flex items-center gap-2.5"><span className="w-5 h-5 rounded-md inline-flex items-center justify-center bg-[#2a2a2b] border border-white/5 shadow-inner text-[10px] font-black text-mammut-white/50 group-hover:bg-mammut-gold group-hover:text-black group-hover:border-mammut-gold transition-all duration-300 drop-shadow-sm">5</span><span className="text-mammut-white/50 group-hover:text-mammut-gold font-medium text-xs uppercase tracking-wider transition-colors">Exterior Color</span></div> 
                      <span className="font-bold text-mammut-white group-hover:text-mammut-gold transition-colors line-clamp-1">{completedSteps.includes(5) ? (COLOR_LOCALE.colors[state.exteriorColor]?.name || state.exteriorColor) : '---'}</span>
                    </button>
                    <button onClick={() => openStep(7)} className="flex w-full text-left justify-between items-center group py-2 -mx-2 px-2 rounded-lg hover:bg-mammut-darker transition-colors">
                      <div className="flex items-center gap-2.5"><span className="w-5 h-5 rounded-md inline-flex items-center justify-center bg-[#2a2a2b] border border-white/5 shadow-inner text-[10px] font-black text-mammut-white/50 group-hover:bg-mammut-gold group-hover:text-black group-hover:border-mammut-gold transition-all duration-300 drop-shadow-sm">7</span><span className="text-mammut-white/50 group-hover:text-mammut-gold font-medium text-xs uppercase tracking-wider transition-colors">{t('configurator.summary.glazing')}</span></div> 
                      <span className="font-bold text-mammut-gold group-hover:text-mammut-white bg-mammut-gold/10 group-hover:bg-mammut-gold !text-black px-2 py-0.5 rounded transition-colors truncate max-w-[150px] text-right">{GLASS_LOCALE[state.glazingPackage] || state.glazingPackage}</span>
                    </button>
                    {state.addons.length > 0 && (
                      <button onClick={() => openStep(8)} className="flex w-full text-left justify-between items-center group py-2 -mx-2 px-2 rounded-lg hover:bg-mammut-darker transition-colors">
                        <div className="flex items-center gap-2.5"><span className="w-5 h-5 rounded-md inline-flex items-center justify-center bg-[#2a2a2b] border border-white/5 shadow-inner text-[10px] font-black text-mammut-white/50 group-hover:bg-mammut-gold group-hover:text-black group-hover:border-mammut-gold transition-all duration-300 drop-shadow-sm">8</span><span className="text-mammut-white/50 group-hover:text-mammut-gold font-medium text-xs uppercase tracking-wider transition-colors">Integrations</span></div> 
                        <span className="font-bold text-mammut-white group-hover:text-mammut-gold transition-colors">{state.addons.length} elements</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

                <div>
                  <h3 className="text-mammut-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-4">{t('configurator.summary.financials')}</h3>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-mammut-white/50 font-medium">Frame (Cantor)</span>
                      <span className="font-bold text-mammut-white">€{pricing.base.toFixed(2)}</span>
                    </div>
                    {(pricing as any).glazing > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-mammut-white/50 font-medium">Glazing Package</span>
                        <span className="font-bold text-mammut-white">€{(pricing as any).glazing.toFixed(2)}</span>
                      </div>
                    )}
                    {pricing.colorModifier > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-mammut-white/50 font-medium">Color Finish</span>
                        <span className="font-bold text-mammut-white">€{pricing.colorModifier.toFixed(2)}</span>
                      </div>
                    )}
                    {pricing.addons > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-mammut-white/50 font-medium">{t('configurator.summary.accessories')}</span>
                        <span className="font-bold text-mammut-white">€{pricing.addons.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="h-px bg-white/10 my-2"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-mammut-white/50 font-medium">Subtotal (ex VAT)</span>
                      <span className="font-bold text-mammut-white">€{((pricing as any).subtotal ?? pricing.total).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-mammut-white/30 text-xs">
                      <span>VAT 21%</span>
                      <span>€{((pricing as any).vat ?? pricing.total * 0.21).toFixed(2)}</span>
                    </div>
                    <div className="h-px bg-white/10 my-2"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-mammut-white/50 font-medium tracking-tight">Est. Delivery</span>
                      <span className="font-black text-mammut-gold bg-mammut-gold/10 px-2 py-1 rounded text-[10px] uppercase tracking-widest">{formattedDelivery}</span>
                    </div>
                    {itemDiscount > 0 && (
                      <div className="flex justify-between items-center text-emerald-400 mt-1">
                        <span className="font-medium tracking-tight">Preset Discount</span>
                        <span className="font-black">-€{itemDiscount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 flex flex-col items-end text-right">
                  <div className="text-[10px] font-black text-mammut-gold uppercase tracking-[0.2em] mb-1">Total incl 21% VAT</div>
                  <div className="text-4xl font-black text-mammut-white tracking-tighter">€{finalPrice.toFixed(2)}</div>
                </div>
                <div className="mt-6 flex flex-col gap-3">
                  {isMobile && (
                    <ARPreviewButton />
                  )}
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={handleShareSystem}
                      disabled={isSharing}
                      className="bg-mammut-dark border-2 border-mammut-border w-14 shrink-0 flex items-center justify-center rounded-xl hover:bg-[#2a2a2b] hover:border-mammut-gold transition-all"
                      title="Share Configuration"
                    >
                      <Share2 size={18} className={isSharing ? "animate-pulse text-mammut-gold" : "text-mammut-white/50 hover:text-mammut-white"} />
                    </button>
                    <button
                      onClick={() => {
                        const url = get3DViewerUrl();
                        navigator.clipboard.writeText(url);
                        alert('Standalone 3D Viewer link copied to clipboard:\n\n' + url);
                      }}
                      className="bg-mammut-dark border-2 border-mammut-border w-14 shrink-0 flex items-center justify-center rounded-xl hover:bg-[#2a2a2b] hover:border-mammut-gold transition-all"
                      title="Copy Standalone 3D Link"
                    >
                      <Link2 size={18} className="text-mammut-white/50 hover:text-mammut-white" />
                    </button>
                    {orderStore.isActive && orderStore.currentIndex > 0 && (
                      <button
                        onClick={() => orderStore.goToPrevious()}
                        className="bg-mammut-dark border-2 border-mammut-border px-4 shrink-0 flex items-center justify-center rounded-xl hover:bg-[#2a2a2b] hover:border-mammut-gold text-mammut-gold/70 hover:text-mammut-gold transition-all font-bold text-sm tracking-widest uppercase"
                        title="Go back to previous position"
                      >
                         <ChevronLeft size={18} className="mr-1" /> Back
                      </button>
                    )}
                    <button 
                      onClick={() => {
                      if (orderStore.isActive) {
                        orderStore.saveCurrentAndNext({
                          config: state, 
                          pricing, 
                          quantity: orderStore.items[orderStore.currentIndex].quantity || 1,
                          name: `${orderStore.items[orderStore.currentIndex].roomName} (${state.category} ${state.profile})`,
                          price: finalPrice,
                          image: CONFIG_SCHEMA.categories[state.category].image,
                          details: [
                             `Orientation: ${orderStore.items[orderStore.currentIndex].orientation || 'South'}`,
                             `Quantity: ${orderStore.items[orderStore.currentIndex].quantity || 1} units`,
                             `Dimensions: ${state.dimensions.width}x${state.dimensions.height}mm`,
                             `Color: ${state.interiorColor} (In) / ${state.exteriorColor} (Out)`,
                             `Opening: ${state.sashOpenings.length} Sashes`,
                             `Integrations: ${state.addons.length}`
                          ]
                        });
                        if (orderStore.currentIndex === orderStore.items.length - 1) {
                          const finalItems = useOrderStore.getState().items;
                          finalItems.forEach(i => {
                            if (i.savedConfig) addItem(i.savedConfig);
                          });
                          orderStore.finishOrder();
                          setShowSaveModal(true);
                        }
                      } else {
                        addItem({ 
                          id: Date.now().toString(),
                          config: state, 
                          pricing, 
                          quantity: 1,
                          name: `Window System (${state.category} ${state.profile})`,
                          price: pricing.total,
                          currency: '€',
                          image: CONFIG_SCHEMA.categories[state.category].image,
                          details: [
                             `Dimensions: ${state.dimensions.width}x${state.dimensions.height}mm`,
                             `Color: ${state.interiorColor} (In) / ${state.exteriorColor} (Out)`,
                             `Opening: ${state.sashOpenings.length} Sashes`,
                             `Integrations: ${state.addons.length}`
                          ]
                        });
                        setShowSaveModal(true);
                      }
                    }}
                    className="flex-1 bg-mammut-gold !text-black hover:bg-[#ffc882] py-4 rounded-xl flex items-center justify-center gap-2 text-sm font-black uppercase tracking-widest shadow-[0_0_20px_rgba(234,182,118,0.2)] hover:shadow-[0_0_30px_rgba(234,182,118,0.4)] transition-all active:scale-[0.98]"
                  >
                    <ShoppingCart size={18} strokeWidth={2.5} /> {orderStore.isActive ? (orderStore.currentIndex === orderStore.items.length - 1 ? 'Finish Project' : `Save & Next (${orderStore.currentIndex + 1}/${orderStore.items.length})`) : t('configurator.summary.saveToCart', 'Save to Cart')} {!orderStore.isActive && items.length > 0 && `(${items.length})`}
                  </button>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
      
      {/* Mobile Floating Sticky Footer for Prices */}
      {completedSteps.length > 0 && activeStep !== 0 && (
        <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-mammut-dark/95 backdrop-blur-xl rounded-2xl px-5 py-3 border border-mammut-gold/30 shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-mammut-gold font-black uppercase tracking-widest leading-none">Total (Incl VAT)</span>
            <span className="text-xl text-mammut-white font-black leading-tight mt-1">€{finalPrice.toFixed(2)}</span>
          </div>
          <div className="w-px h-8 bg-white/10 mx-2"></div>
          <button 
            onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth'})} 
            className="text-mammut-white font-bold text-xs uppercase tracking-widest bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-colors"
          >
            Summary &rarr;
          </button>
        </div>
      )}
    </div>
    </>
  );
}
