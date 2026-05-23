import { useEffect, useState, useRef } from 'react';
import { Download, Camera, Trash2, RotateCcw, Share2, ChevronDown } from 'lucide-react';
import { fetchPrice, type PricingApiResponse } from '../utils/cantorPricing/pricingApi';
import type { ConfiguratorInput } from '../utils/cantorPricing/input';
import { CONFIG_SCHEMA, WINDOW_TYPES, PROFILE_GLAZING_LIMITS, getTypologyImagePath } from '../components/SlateConfigurator/types';
import { IGLO_EDGE_COLORS } from '../data/productDetails';
import { WindowVisualizer } from '../components/SlateConfigurator/WindowVisualizer';
import { SvgWindowEngine } from '../components/configurator/SvgWindowEngine';
import { ThreejsWindowEngine } from '../components/configurator/ThreejsWindowEngine';
import { ArViewer } from '../components/configurator/ArViewer';
import glazingOptions from '../data/cantor_glazing_options.json';
import shutterLookups from '../data/shutter_lookups.json';
import { useThemeStore } from '../store/useThemeStore';
import { 
  IconWindows, IconDoors, IconPatioDoors, IconRollerShutters, 
  IconExteriorBlinds, IconGarageDoors, IconMosquitoNets, 
  IconSmartHome, IconConservatories, IconPergola 
} from '../components/icons/ProductIcons';
import { useTranslation } from 'react-i18next';
import * as THREE from 'three';
import { ThemeToggle } from '../components/common/ThemeToggle';

const getPaneImage = (paneCode: string) => {
  if (!paneCode) return null;
  const code = paneCode.toUpperCase();
  
  if (code.includes('M8.2') || code.includes('MB2') || code.includes('MAT')) return 'segura-332-mat.webp';
  if (code.includes('B1') || code.includes('B2') || code.includes('33.1') || code.includes('33.2') || code.includes('44.1') || code.includes('44.2') || code.includes('44.4')) return 'segura-331.webp';
  if (code.includes('ADB')) return 'antisol-blue-6.webp';
  if (code.includes('AB4')) return 'antisol-brown-4.webp';
  if (code.includes('AB6') || code.includes('ANB') || code.includes('RB6') || code.includes('RFB')) return 'antisol-brown-6.webp';
  if (code.includes('AZ4') || code.includes('ANZ')) return 'antisol-green-4.webp';
  if (code.includes('AZ6')) return 'antisol-green-6.webp';
  if (code.includes('AS6') || code.includes('ANS')) return 'antisol-grey-6.webp';
  if (code.includes('OCH')) return 'chinchilla-4.webp';
  if (code.includes('OCA')) return 'ornamento-cathedral.webp';
  if (code.includes('ODT')) return 'ornamento-delta.webp';
  if (code.includes('OMC')) return 'ornamento-master.webp';
  if (code.includes('OSI')) return 'ornamento-silvit.webp';
  if (code.includes('OPR')) return 'waterfall-105.webp';
  if (code.includes('RFN') || code.includes('RN6')) return 'stopsol-blue-6.webp';
  if (code.includes('MS4')) return 'mirastar.webp';
  if (code.includes('FL6') || code.includes('SR') || code.includes('H02') || code.includes('T6')) return 'float-6.webp';
  
  return 'float-4.webp'; // fallback for FL, T, etc.
};

interface TypologyThumbnailProps {
  id: string;
  className?: string;
  style?: React.CSSProperties;
  hoverZoom?: boolean;
}

function TypologyThumbnail({ id, className, style, hoverZoom = false }: TypologyThumbnailProps) {
  const [src, setSrc] = useState(() => getTypologyImagePath(id));
  const [hasError, setHasError] = useState(false);
  const { theme } = useThemeStore();
  const isLight = theme === 'light' || document.documentElement.getAttribute('data-theme') === 'light';
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setSrc(getTypologyImagePath(id));
    setHasError(false);
  }, [id]);

  const handleError = () => {
    if (!src.endsWith('.svg?v=2')) {
      setSrc(`/assets/windowtypes/${id}.svg?v=2`);
    } else {
      setHasError(true);
    }
  };

  if (hasError) {
    return (
      <div 
        className={`${className} flex items-center justify-center font-bold text-[10px] shadow-inner`}
        style={{
          ...style,
          backgroundColor: isLight ? '#f1f5f9' : '#1f2937',
          color: isLight ? '#475569' : '#9ca3af',
          borderColor: isLight ? '#cbd5e1' : '#4b5563'
        }}
      >
        {id}
      </div>
    );
  }

  const isSvg = src.endsWith('.svg') || src.includes('.svg?');

  if (hoverZoom) {
    const wrapperStyle: React.CSSProperties = {
      ...style,
      position: 'relative',
      transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s, background-color 0.2s, border-color 0.2s',
      transform: isHovered ? `${style?.transform || ''} scale(4)`.trim() : style?.transform,
      transformOrigin: 'left center',
      zIndex: isHovered ? 100 : style?.zIndex,
      backgroundColor: isHovered ? (isLight ? '#ffffff' : '#1a1a1b') : undefined,
      borderColor: isHovered ? (isLight ? '#94a3b8' : '#eab676') : undefined,
      boxShadow: isHovered ? '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' : undefined,
    };

    return (
      <div
        className={`${className} flex items-center justify-center`}
        style={wrapperStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img
          src={src}
          alt={id}
          className="w-full h-full object-contain pointer-events-none"
          style={{
            filter: (isLight && isSvg) ? 'invert(1)' : 'none',
          }}
          onError={handleError}
        />
      </div>
    );
  }

  const finalStyle: React.CSSProperties = {
    ...style,
    filter: (isLight && isSvg) ? 'invert(1)' : 'none'
  };

  return (
    <img
      src={src}
      alt={id}
      className={className}
      style={finalStyle}
      onError={handleError}
    />
  );
}

interface ScrollingDialProps {
  value: string;
  onChange: (value: string) => void;
  items: string[];
  onConfirm?: () => void;
  closeOnSelect?: boolean;
}

function ScrollingDial({ value, onChange, items, onConfirm, closeOnSelect = true }: ScrollingDialProps) {
  const { theme } = useThemeStore();
  const isLight = theme === 'light' || document.documentElement.getAttribute('data-theme') === 'light';
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [localActiveId, setLocalActiveId] = useState(value);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRender = useRef(true);

  const itemHeight = 130; // height of each placeholder/step
  const visibleHeight = 320; // height of the viewport
  const R = 170; // radius of cylinder

  // Generate background visual ticks to match the main configurator scroll wheels
  const tickStepWidth = 26; // perfectly aligned with itemHeight = 130 (130 / 26 = 5) for consistent alignment
  const tickCenterIdx = Math.round(scrollTop / tickStepWidth);
  const tickVisibleHalf = Math.ceil((visibleHeight / 2) / tickStepWidth) + 6;
  const tickStartIdx = tickCenterIdx - tickVisibleHalf;
  const tickEndIdx = tickCenterIdx + tickVisibleHalf;

  const ticks = [];
  for (let i = tickStartIdx; i <= tickEndIdx; i++) {
    const itemOffset = i * tickStepWidth - scrollTop;
    const angle = itemOffset / R;
    if (Math.abs(angle) > 1.6) continue;

    const trigVal = R * Math.sin(angle);
    const cosVal = Math.cos(angle);
    const scale = 0.5 + 0.5 * cosVal;

    // Horizontal bars for a vertical cylinder matching NumericScrollWheel's aesthetics
    const rectHeight = 14 * scale; // Matching NumericScrollWheel's bar thickness of 14px!
    const rectWidth = 240 * scale; // 240px width to extend beautifully behind the thumbnails
    const opacity = Math.max(0, cosVal * cosVal) * 0.85; // 85% max opacity to look premium and visible

    const absAngle = Math.abs(angle);
    let rectColor: string;
    if (isLight) {
      // Neutral slate ticks for light mode
      const lightness = Math.round(55 + absAngle * 20);
      rectColor = `hsl(215, 12%, ${lightness}%)`;
    } else {
      let h = 35;
      let s = 90;
      let l = 60;
      if (absAngle > 0) {
        const t = Math.min(1, absAngle / 1.57);
        h = 35 - t * 45;
        s = 90 - t * 25;
        l = 60 - t * 30;
      }
      rectColor = `hsl(${h}, ${s}%, ${l}%)`;
    }

    ticks.push(
      <div
        key={`tick-${i}`}
        className="absolute pointer-events-none rounded-[3px]"
        style={{
          left: `calc(50% - ${rectWidth / 2}px)`,
          top: `calc(50% + ${trigVal}px - ${rectHeight / 2}px)`,
          width: rectWidth,
          height: rectHeight,
          backgroundColor: rectColor,
          opacity: opacity,
          zIndex: Math.round(cosVal * 10) - 5
        }}
      />
    );
  }

  // Synchronize local active item with incoming value
  useEffect(() => {
    setLocalActiveId(value);
    const idx = items.indexOf(value);
    if (idx !== -1 && scrollContainerRef.current) {
      const targetScrollTop = idx * itemHeight;
      if (Math.abs(scrollContainerRef.current.scrollTop - targetScrollTop) > 2) {
        if (isFirstRender.current) {
          scrollContainerRef.current.scrollTop = targetScrollTop;
          setScrollTop(targetScrollTop);
          isFirstRender.current = false;
        } else {
          scrollContainerRef.current.scrollTo({
            top: targetScrollTop,
            behavior: 'smooth'
          });
        }
      }
    }
  }, [value, items]);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const sTop = scrollContainerRef.current.scrollTop;
      setScrollTop(sTop);
      
      const activeIndex = Math.round(sTop / itemHeight);
      if (activeIndex >= 0 && activeIndex < items.length) {
        const activeId = items[activeIndex];
        setLocalActiveId(activeId);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  const scrollByItems = (direction: number) => {
    if (scrollContainerRef.current) {
      const currentIdx = items.indexOf(localActiveId);
      const nextIdx = Math.max(0, Math.min(items.length - 1, currentIdx + direction));
      scrollContainerRef.current.scrollTo({
        top: nextIdx * itemHeight,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div 
      style={{
        backgroundColor: isLight ? '#ffffff' : 'var(--theme-mammut-darker)',
        borderColor: isLight ? '#cbd5e1' : 'var(--theme-mammut-border)'
      }}
      className="relative w-full h-[320px] rounded-2xl border overflow-hidden select-none shadow-inner flex flex-col items-center justify-center"
    >
      {/* Up Arrow Button */}
      <button 
        type="button"
        onClick={(e) => { e.stopPropagation(); scrollByItems(-1); }}
        style={{
          backgroundColor: isLight ? '#ffffff' : 'var(--theme-mammut-dark)',
          borderColor: isLight ? '#cbd5e1' : 'var(--theme-mammut-border)',
          color: isLight ? '#334155' : 'var(--theme-mammut-gold)'
        }}
        className="absolute top-2 z-30 w-8 h-8 rounded-full border flex items-center justify-center transition-colors cursor-pointer hover:border-zinc-500 hover:text-black shadow-sm"
        title="Scroll Up"
      >
        ▲
      </button>

      {/* Down Arrow Button */}
      <button 
        type="button"
        onClick={(e) => { e.stopPropagation(); scrollByItems(1); }}
        style={{
          backgroundColor: isLight ? '#ffffff' : 'var(--theme-mammut-dark)',
          borderColor: isLight ? '#cbd5e1' : 'var(--theme-mammut-border)',
          color: isLight ? '#334155' : 'var(--theme-mammut-gold)'
        }}
        className="absolute bottom-2 z-30 w-8 h-8 rounded-full border flex items-center justify-center transition-colors cursor-pointer hover:border-zinc-500 hover:text-black shadow-sm"
        title="Scroll Down"
      >
        ▼
      </button>

      {/* Visual Dial Layer */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-center items-center overflow-hidden">
        {items.map((id, index) => {
          const itemOffset = index * itemHeight - scrollTop;
          const angle = itemOffset / R;

          // Clip items beyond front-half of the cylinder
          if (Math.abs(angle) > 1.6) return null;

          const y = R * Math.sin(angle);
          const cosVal = Math.cos(angle);

          // Base scale of item container (creates perspective depth)
          const baseScale = 0.55 + 0.45 * cosVal;

          // Zoom image scale: expand to 300% when exactly in the middle
          // Goes from 1.0 (far away) up to 3.0 (exact middle)
          const distanceFactor = Math.max(0, 1 - Math.abs(itemOffset) / (itemHeight * 1.5));
          const imgScale = 1.0 + 2.0 * distanceFactor;

          const isCenter = Math.abs(itemOffset) < itemHeight / 2;
          const wt = WINDOW_TYPES.find(w => w.id === id) || { id, sashes: 1, name: 'Frame' };

          // Dynamic margin/translate shift to clear the scaled image without overlap
          const textShift = (imgScale - 1.0) * 16; 

          return (
            <div
              key={id}
              className="absolute w-full flex items-center justify-center transition-all duration-75"
              style={{
                transform: `translateY(${y}px) scale(${baseScale})`,
                opacity: Math.max(0.15, cosVal * cosVal),
                zIndex: isCenter ? 30 : Math.round(cosVal * 10),
                height: itemHeight,
                top: `calc(50% - ${itemHeight / 2}px)`
              }}
            >
              <div 
                className={`flex flex-col items-center justify-center rounded-xl transition-all duration-300 ${
                  isCenter 
                    ? (isLight ? 'text-slate-900 font-black' : 'text-mammut-gold font-black')
                    : (isLight ? 'text-slate-400 opacity-60' : 'text-gray-400 opacity-60')
                }`}
              >
                {/* Image Container with 300% Zoom - Double the base size (48x48) */}
                <div className="relative flex items-center justify-center" style={{ width: 80, height: 80 }}>
                  <TypologyThumbnail 
                    id={id}
                    className={`object-contain transition-all duration-100 p-1 rounded shadow-sm border ${
                      isLight ? 'bg-transparent border-zinc-200' : 'bg-mammut-darker border-gray-700'
                    }`}
                    style={{ 
                      transform: `scale(${imgScale})`,
                      width: 48, 
                      height: 48,
                      boxShadow: isCenter ? '0 0 15px rgba(234, 182, 118, 0.5)' : 'none'
                    }}
                  />
                  {/* Small green ticker (checkmark badge) */}
                  {id === value && (
                    <div 
                      className="absolute w-5 h-5 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg border border-mammut-darker text-white z-35 transition-all duration-300"
                      style={{
                        top: `calc(50% - ${24 * imgScale}px - 6px)`,
                        right: `calc(50% - ${24 * imgScale}px - 6px)`,
                      }}
                      title="Selected typology"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={4} stroke="currentColor" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* Details (Product Number and Description underneath) */}
                <div 
                  className="flex flex-col select-none items-center text-center transition-transform duration-100" 
                  style={{ 
                    width: 220,
                    transform: `translateY(${textShift}px)`
                  }}
                >
                  <span className="text-sm font-bold tracking-wide">{id}</span>
                  <span className="text-[10px] text-gray-500 truncate w-full leading-tight">{wt.name || 'Window'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Invisible Interactive Scroll Layer */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="absolute inset-0 overflow-y-scroll snap-y snap-mandatory z-20 cursor-grab active:cursor-grabbing"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Top Spacer to center the first item */}
        <div style={{ height: (visibleHeight - itemHeight) / 2 }} className="snap-align-none" />
        
        {/* Snapping placeholders */}
        {items.map((id, idx) => (
          <div 
            key={`snap-${id}`} 
            style={{ height: itemHeight }} 
            className="snap-center w-full cursor-pointer pointer-events-auto"
            onClick={(e) => {
              e.stopPropagation();
              const targetId = items[idx];
              if (targetId === value) {
                if (onConfirm) onConfirm();
              } else {
                onChange(targetId);
                if (closeOnSelect && onConfirm) {
                  onConfirm();
                }
              }
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              onChange(items[idx]);
              if (onConfirm) onConfirm();
            }}
          />
        ))}
        
        {/* Bottom Spacer to center the last item */}
        <div style={{ height: (visibleHeight - itemHeight) / 2 }} className="snap-align-none" />
      </div>
    </div>
  );
}

// Mobile-friendly custom components
const AccordionSection = ({ 
  id, 
  title, 
  summary, 
  isOpen, 
  onToggle, 
  children 
}: { 
  id: string, 
  title: string, 
  summary: string, 
  isOpen: boolean, 
  onToggle: () => void, 
  children: React.ReactNode 
}) => {
  const { theme } = useThemeStore();
  const isLight = theme === 'light' || document.documentElement.getAttribute('data-theme') === 'light';

  // Extract number prefix (e.g. "1. Product" → "01", "Product")
  const numMatch = title.match(/^(\d+)\.\s*(.*)$/);
  const numLabel = numMatch ? String(numMatch[1]).padStart(2, '0') : null;
  const titleText = numMatch ? numMatch[2] : title;

  if (isLight) {
    return (
      <div id={id} className={`rounded-xl transition-all duration-300 shadow-sm ${
          isOpen ? 'relative z-20 overflow-visible' : 'overflow-hidden'
        }`} style={{ backgroundColor: '#ffffff' }}>
          <div
            onClick={onToggle}
            className={`px-6 py-5 flex items-center justify-between cursor-pointer select-none transition-colors group ${
              isOpen ? 'border-l-4 border-black' : 'border-l-4 border-transparent hover:border-gray-300'
            }`}
          >
            <div className="flex flex-col gap-0.5 pr-4 min-w-0">
              {numLabel && (
                <span className="text-[10px] font-semibold tracking-[0.15em] text-slate-400 uppercase">{numLabel}</span>
              )}
              <span className={`font-bold text-base tracking-tight text-slate-900 ${
                !numLabel ? 'uppercase text-sm tracking-wide' : ''
              }`}>{titleText}</span>
              {!isOpen && summary && (
                <span className="text-xs text-slate-500 truncate mt-0.5">{summary}</span>
              )}
            </div>
            {isOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"
                className="shrink-0 text-slate-600 transition-transform duration-300"
              >
                <polyline points="18 15 12 9 6 15" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16" height="16" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round"
                className="shrink-0 text-slate-400 group-hover:text-slate-600 transition-transform duration-300"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            )}
          </div>
          {isOpen && (
            <div className="px-6 pb-6 pt-1 space-y-6 relative accordion-content" style={{ backgroundColor: '#ffffff' }}>
              {children}
              <div className="flex justify-end pt-4 border-t border-zinc-150">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onToggle(); }}
                  className="px-4 py-2 border border-zinc-300 text-zinc-700 hover:border-black hover:text-black text-xs font-bold uppercase tracking-wider rounded transition-colors cursor-pointer flex items-center gap-1.5 bg-transparent hover:bg-zinc-50 shadow-sm"
                >
                  ▲ Collapse Section
                </button>
              </div>
            </div>
          )}
        </div>
    );
  }

  return (
    <div id={id} className={`rounded-xl mb-4 transition-all duration-300 bg-mammut-darker/60 backdrop-blur-sm shadow-[0_1px_4px_rgba(0,0,0,0.2)] ${
      isOpen ? 'relative z-20 overflow-visible' : 'overflow-hidden'
    }`}>
      <div
        onClick={onToggle}
        className={`p-4 flex items-center justify-between cursor-pointer select-none transition-colors ${
          isOpen ? 'bg-mammut-gold/10 text-mammut-gold border-l-4 border-mammut-gold' : 'hover:bg-gray-800/40 text-gray-300 border-l-4 border-transparent'
        }`}
      >
        <div className="flex flex-col gap-1 pr-4 min-w-0">
          <span className="font-bold text-sm tracking-wide uppercase">{title}</span>
          {!isOpen && summary && (
            <span className="text-xs truncate text-gray-500">{summary}</span>
          )}
        </div>
        {isOpen ? (
          <span className="text-xs text-mammut-gold font-bold">▲</span>
        ) : (
          <span className="text-xs text-gray-500">▼</span>
        )}
      </div>
      {isOpen && (
        <div className="p-4 sm:p-6 bg-mammut-darker/30 space-y-6 relative accordion-content">
          {children}
          <div className="flex justify-end pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onToggle(); }}
              className="px-4 py-2 border border-gray-750 text-gray-400 hover:border-mammut-gold hover:text-mammut-gold text-xs font-bold uppercase tracking-wider rounded transition-all cursor-pointer bg-transparent hover:bg-gray-800/40 shadow-sm flex items-center gap-1.5"
            >
              ▲ Collapse Section
            </button>
          </div>
        </div>
      )}
    </div>
  );
};const DimensionAdjuster = ({
  label,
  value,
  onChange,
  min = 500,
  max = 3000,
  isLight
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  isLight: boolean;
}) => {
  const [inputValue, setInputValue] = useState(value.toString());

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleBlur = () => {
    let num = parseInt(inputValue, 10);
    if (isNaN(num)) {
      num = value;
    }
    const clamped = Math.max(min, Math.min(max, num));
    onChange(clamped);
    setInputValue(clamped.toString());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlur();
      e.currentTarget.blur();
    }
  };

  const adjust = (amount: number) => {
    const next = Math.max(min, Math.min(max, value + amount));
    onChange(next);
    setInputValue(next.toString());
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className={`text-xs font-bold mb-1 uppercase tracking-wide ${isLight ? 'text-zinc-500' : 'text-gray-400'}`}>
        {label}
      </label>
      <div className="flex items-center gap-2">
        {/* Left Arrow (Micro decrement) */}
        <button
          type="button"
          onClick={() => adjust(-1)}
          className={`w-10 h-[50px] rounded-xl flex items-center justify-center border font-black text-lg transition-all active:scale-90 hover:scale-105 cursor-pointer ${
            isLight
              ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-700'
              : 'bg-mammut-black hover:bg-gray-800 border-gray-800 text-mammut-gold'
          }`}
          title="Decrease by 1 mm (Shift-click for 10 mm)"
          onMouseDown={(e) => {
            if (e.shiftKey) {
              e.preventDefault();
              adjust(-10);
            }
          }}
        >
          ←
        </button>

        {/* Text Input */}
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value.replace(/\D/g, ''))}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`flex-1 text-center font-mono text-lg font-bold rounded-xl h-[50px] focus:outline-none border transition-colors ${
            isLight
              ? 'bg-white border-zinc-300 text-black focus:border-black'
              : 'bg-mammut-black border-gray-800 text-mammut-white focus:border-mammut-gold'
          }`}
        />

        {/* Right Arrow (Micro increment) */}
        <button
          type="button"
          onClick={() => adjust(1)}
          className={`w-10 h-[50px] rounded-xl flex items-center justify-center border font-black text-lg transition-all active:scale-90 hover:scale-105 cursor-pointer ${
            isLight
              ? 'bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-700'
              : 'bg-mammut-black hover:bg-gray-800 border-gray-800 text-mammut-gold'
          }`}
          title="Increase by 1 mm (Shift-click for 10 mm)"
          onMouseDown={(e) => {
            if (e.shiftKey) {
              e.preventDefault();
              adjust(10);
            }
          }}
        >
          →
        </button>
      </div>
    </div>
  );
};

const NumericScrollWheel = ({
  value,
  onChange,
  min = 500,
  max = 3000,
  step = 10,
  orientation = 'horizontal',
}: {
  label?: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  orientation?: 'horizontal' | 'vertical';
  labelPosition?: 'top' | 'inside';
}) => {
  const { theme } = useThemeStore();
  const isLight = theme === 'light' || document.documentElement.getAttribute('data-theme') === 'light';

  const trackRef = useRef<HTMLDivElement>(null);
  const currentValueRef = useRef(value);
  currentValueRef.current = value;

  const [isDragging, setIsDragging] = useState(false);
  const [trackWidth, setTrackWidth] = useState(200);
  const [trackHeight, setTrackHeight] = useState(200);
  const [isEditing, setIsEditing] = useState(false);
  const [isBadgeHovered, setIsBadgeHovered] = useState(false);

  const isVert = orientation === 'vertical';
  
  const tickSpacing = 12;
  const unitsPerTick = 10;
  
  const dragStartPos = useRef(0);
  const dragStartValue = useRef(0);
  const lastPos = useRef(0);
  const lastTime = useRef(0);

  useEffect(() => {
    if (!trackRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setTrackWidth(entry.contentRect.width);
        setTrackHeight(entry.contentRect.height);
      }
    });
    resizeObserver.observe(trackRef.current);
    setTrackWidth(trackRef.current.clientWidth);
    setTrackHeight(trackRef.current.clientHeight);
    return () => resizeObserver.disconnect();
  }, []);

  const updateValue = (newValue: number) => {
    const clamped = Math.max(min, Math.min(max, Math.round(newValue / step) * step));
    onChange(clamped);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (orientation === 'horizontal') {
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        updateValue(value + step);
        e.preventDefault();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        updateValue(value - step);
        e.preventDefault();
      }
    } else {
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        updateValue(value + step);
        e.preventDefault();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        updateValue(value - step);
        e.preventDefault();
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? step : -step;
    updateValue(value + delta);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isEditing) return;
    setIsDragging(true);
    const pos = isVert ? e.clientY : e.clientX;
    dragStartPos.current = pos;
    dragStartValue.current = value;
    lastPos.current = pos;
    lastTime.current = Date.now();
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const pos = isVert ? e.clientY : e.clientX;
    const now = Date.now();
    const dt = now - lastTime.current || 1;
    const dp = pos - lastPos.current;

    const velocity = Math.abs(dp) / dt;
    const accelFactor = velocity > 0.2 ? Math.min(10, 1 + (velocity - 0.2) * 4) : 1;
    
    const valueDelta = -dp * (unitsPerTick / tickSpacing) * accelFactor;
    const nextVal = currentValueRef.current + valueDelta;
    updateValue(nextVal);

    lastPos.current = pos;
    lastTime.current = now;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isEditing) return;
    setIsDragging(true);
    const touch = e.touches[0];
    const pos = isVert ? touch.clientY : touch.clientX;
    dragStartPos.current = pos;
    dragStartValue.current = value;
    lastPos.current = pos;
    lastTime.current = Date.now();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const pos = isVert ? touch.clientY : touch.clientX;
    const now = Date.now();
    const dt = now - lastTime.current || 1;
    const dp = pos - lastPos.current;

    const velocity = Math.abs(dp) / dt;
    const accelFactor = velocity > 0.2 ? Math.min(10, 1 + (velocity - 0.2) * 4) : 1;
    const valueDelta = -dp * (unitsPerTick / tickSpacing) * accelFactor;

    const nextVal = currentValueRef.current + valueDelta;
    updateValue(nextVal);

    lastPos.current = pos;
    lastTime.current = now;

    if (e.cancelable) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };



  const size = isVert ? trackHeight : trackWidth;
  const editBg = isLight ? '#ffffff' : 'var(--theme-mammut-darker)';
  const editBorder = isLight ? '#c88a3e' : 'var(--theme-mammut-gold)';
  const editTextColor = isLight ? '#000000' : 'var(--theme-mammut-gold)';
  const btnBg = isLight ? '#f4f4f5' : '#000000';
  const btnBorder = isLight ? '#d4d4d8' : 'var(--theme-mammut-border)';
  const btnTextColor = isLight ? '#000000' : 'var(--theme-mammut-gold)';

  const scale = size < 640 ? 1.6 : 1.8;
  const badgeStyle: React.CSSProperties = isEditing
    ? {
        backgroundColor: editBg,
        borderColor: editBorder,
        color: editTextColor,
        borderRadius: '4px',
        borderWidth: `${(1 / scale).toFixed(3)}px`,
        boxShadow: isLight 
          ? '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)'
          : '0 20px 25px -5px rgba(0,0,0,0.5), 0 0 20px rgba(217,119,6,0.2)',
        transform: isVert 
          ? `scale(${scale}) translateX(14px)` 
          : `scale(${scale}) translateY(-14px)`,
      }
    : (isVert
        ? { transform: `rotate(-90deg) scale(${isBadgeHovered ? 1.1 : 1.0})` }
        : { transform: `scale(${isBadgeHovered ? 1.1 : 1.0})` }
      );

  const center = size / 2;
  const pxPerUnit = tickSpacing / unitsPerTick;
  const visibleRange = center / pxPerUnit;
  const minVisibleVal = value - visibleRange;
  const maxVisibleVal = value + visibleRange;

  const minK = Math.floor(minVisibleVal / unitsPerTick);
  const maxK = Math.ceil(maxVisibleVal / unitsPerTick);

  const bars = [];
  for (let k = minK; k <= maxK; k++) {
    const tickValue = k * unitsPerTick;
    const offset = (tickValue - value) * pxPerUnit;
    if (tickValue < min || tickValue > max) continue;

    const isMajor = k % 10 === 0;
    const isMedium = k % 5 === 0 && !isMajor;

    let rectWidth = 1.5;
    let rectHeight = 6;
    if (isMajor) {
      rectHeight = 10;
      rectWidth = 2;
    } else if (isMedium) {
      rectHeight = 8;
    }

    const distFromCenter = Math.abs(offset);
    const maxDist = center || 100;
    const opacity = Math.max(0, 1 - distFromCenter / maxDist) * 0.35;

    let h = 35;
    let s = 90;
    let l = 60;
    if (distFromCenter > 0) {
      const t = Math.min(1, distFromCenter / maxDist);
      h = 35 - t * 45;
      s = 90 - t * 25;
      l = 60 - t * 30;
    }
    const rectColor = isLight 
      ? (isDragging ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.25)') 
      : `hsl(${h}, ${s}%, ${l}%)`;

    bars.push(
      <div
        key={`tick-${tickValue}`}
        className="absolute pointer-events-none rounded-full"
        style={{
          left: isVert ? `calc(50% - ${rectHeight / 2}px)` : `${center + offset}px`,
          top: isVert ? `${center + offset}px` : `calc(50% - ${rectHeight / 2}px)`,
          width: isVert ? rectHeight : rectWidth,
          height: isVert ? rectWidth : rectHeight,
          backgroundColor: rectColor,
          opacity: isDragging ? opacity * 1.5 : opacity,
          transform: isVert ? 'translateY(-50%)' : 'translateX(-50%)',
        }}
      />
    );
  }

  const maskStyle: React.CSSProperties = isVert
    ? {
        WebkitMaskImage: 'linear-gradient(to bottom, transparent, white 15%, white 85%, transparent)',
        maskImage: 'linear-gradient(to bottom, transparent, white 15%, white 85%, transparent)',
      }
    : {
        WebkitMaskImage: 'linear-gradient(to right, transparent, white 15%, white 85%, transparent)',
        maskImage: 'linear-gradient(to right, transparent, white 15%, white 85%, transparent)',
      };

  const trackSizeClass = isVert ? 'w-5 md:w-[28px] h-full' : 'w-full h-5 md:h-[28px]';

  return (
    <div 
      className={`relative flex select-none touch-none ${
        isVert ? 'flex-col items-center h-full w-full' : 'flex-row items-center w-full'
      }`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {isEditing && (
        <div 
          className="fixed inset-0 z-40 cursor-default" 
          style={{ backgroundColor: 'transparent' }}
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(false);
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            setIsEditing(false);
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            setIsEditing(false);
          }}
        />
      )}

      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onWheel={handleWheel}
        style={maskStyle}
        className={`relative overflow-hidden flex-grow flex items-center justify-center select-none touch-none dimension-scroll-wheel ${trackSizeClass}`}
      >
        {bars}

        {/* Center Target Indicator Pointer */}
        <div
          className={`absolute pointer-events-none rounded-full ${
            isVert 
              ? `top-1/2 left-0 w-full h-[2px] -translate-y-1/2 z-10 ${
                  isLight ? 'bg-black shadow-[0_0_8px_rgba(0,0,0,0.15)]' : 'bg-[#ffc882] shadow-[0_0_8px_rgba(234,182,118,0.4)]'
                }` 
              : `left-1/2 top-0 w-[2px] h-full -translate-x-1/2 z-10 ${
                  isLight ? 'bg-black shadow-[0_0_8px_rgba(0,0,0,0.15)]' : 'bg-[#ffc882] shadow-[0_0_8px_rgba(234,182,118,0.4)]'
                }`
          }`}
        />
      </div>

      {/* Center overlay display (clean value) */}
      <div className={`absolute inset-0 flex items-center pointer-events-none z-50 transition-all duration-300 justify-center`}>
        <div 
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          onMouseEnter={() => setIsBadgeHovered(true)}
          onMouseLeave={() => setIsBadgeHovered(false)}
          className={`flex items-center justify-center pointer-events-auto cursor-pointer select-none transition-all duration-300 transform active:scale-95 ${
            isVert && !isEditing ? 'origin-center' : (isVert ? 'origin-left' : 'origin-center')
          } ${
            isEditing 
              ? `border px-3.5 py-1 md:px-6 md:py-1.5 ${isLight ? '' : 'backdrop-blur-md'}`
              : 'bg-transparent border border-transparent backdrop-blur-none px-0 py-0 shadow-none'
          }`}
          style={badgeStyle}
          title="Click to adjust value"
        >
          {isEditing ? (
            <div className="flex items-center gap-1 font-mono" onClick={(e) => e.stopPropagation()}>
              {/* Decrement Button */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onTouchStart={(e) => e.preventDefault()}
                onClick={() => {
                  const nextVal = Math.max(min, value - 1);
                  onChange(nextVal);
                }}
                style={{
                  backgroundColor: btnBg,
                  borderColor: btnBorder,
                  color: btnTextColor,
                  borderRadius: '4px',
                  borderWidth: `${(1 / scale).toFixed(3)}px`,
                }}
                className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center border text-xs md:text-sm font-black transition-all active:scale-90 hover:scale-105 cursor-pointer"
                title="-1 mm"
              >
                -
              </button>

              {/* Display Value Text */}
              <span 
                style={{ color: editTextColor }}
                className="px-2.5 text-xs md:text-sm font-black"
              >
                {value}
              </span>

              {/* Increment Button */}
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onTouchStart={(e) => e.preventDefault()}
                onClick={() => {
                  const nextVal = Math.min(max, value + 1);
                  onChange(nextVal);
                }}
                style={{
                  backgroundColor: btnBg,
                  borderColor: btnBorder,
                  color: btnTextColor,
                  borderRadius: '4px',
                  borderWidth: `${(1 / scale).toFixed(3)}px`,
                }}
                className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center border text-xs md:text-sm font-black transition-all active:scale-90 hover:scale-105 cursor-pointer"
                title="+1 mm"
              >
                +
              </button>
            </div>
          ) : (
            <span 
              style={{ color: isLight ? '#000000' : 'var(--theme-mammut-gold)' }}
              className="text-lg md:text-2xl font-black font-mono tracking-wide"
            >
              {value}
            </span>
          )}
        </div>
      </div>

      {/* Floating tooltip badge while dragging to clear finger occlusion */}
      {isDragging && (
        <div 
          className={`absolute text-[10px] font-black px-2.5 py-1.5 rounded-md shadow-lg pointer-events-none whitespace-nowrap z-30 transition-opacity duration-150 ${
            isLight ? 'bg-black text-white' : 'bg-mammut-gold text-black'
          } ${
            isVert 
              ? 'left-full ml-3 top-1/2 -translate-y-1/2' 
              : 'bottom-full mb-3 left-1/2 -translate-x-1/2'
          }`}
        >
          {value}
        </div>
      )}
    </div>
  );
};

const ColorScrollWheel = ({
  label,
  value,
  onChange,
  groupedOptions,
  showDefault = false
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  groupedOptions: any;
  showDefault?: boolean;
}) => {
  const { t } = useTranslation();
  const { theme } = useThemeStore();
  const isLight = theme === 'light' || document.documentElement.getAttribute('data-theme') === 'light';

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPos, setScrollPos] = useState(0);
  const [visibleDim, setVisibleDim] = useState(300);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isOverActiveSwatch, setIsOverActiveSwatch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditingSearch, setIsEditingSearch] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current !== null) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const flatOpts = (Object.values(groupedOptions).flat() as any[]) || [];
  const rawOptions = showDefault 
    ? [{ code: '', name: 'Default (same as Ext)', swatchUrl: '', hex: '#4B4B4D', group: 'Solid' }, ...flatOpts]
    : flatOpts;

  // Filter options using dynamic search terms
  const matchSearch = (opt: any, query: string) => {
    if (!query) return true;
    const q = query.toLowerCase().trim();
    
    const name = opt.name.toLowerCase();
    const code = opt.code.toLowerCase();
    const group = (opt.group || '').toLowerCase();
    
    if (name.includes(q) || code.includes(q) || group.includes(q)) return true;
    
    // Custom synonyms and category filters requested
    if (q === 'any color' || q === 'all' || q === 'any') {
      return true;
    }
    if (q === 'wood') {
      return group.includes('wood') || name.includes('oak') || name.includes('walnut') || name.includes('winchester') || name.includes('douglas') || name.includes('macore') || name.includes('mahogany') || name.includes('palisander') || name.includes('dab') || name.includes('orzech');
    }
    if (q === 'metal') {
      return group.includes('metal') || name.includes('steel') || name.includes('bronze') || name.includes('quartz') || name.includes('stalowy') || name.includes('kwarcytowy');
    }
    if (q === 'dark') {
      return name.includes('dark') || name.includes('black') || name.includes('anthracite') || name.includes('ciemny') || name.includes('czarny') || name.includes('negro') || name.includes('palisander') || name.includes('macore') || name.includes('mahogany') || name.includes('bronze') || name.includes('graphite') || name.includes('grafitowy') || name.includes('basalt') || name.includes('bazaltowy');
    }
    if (q === 'blue') {
      return name.includes('blue') || name.includes('niebieski') || name.includes('azul');
    }
    if (q === 'green') {
      return name.includes('green') || name.includes('zielony') || name.includes('zielen') || name.includes('verde');
    }
    if (q === 'red') {
      return name.includes('red') || name.includes('czerwony') || name.includes('rojo');
    }
    if (q === 'grey' || q === 'gray') {
      return name.includes('grey') || name.includes('gray') || name.includes('szary') || name.includes('gris') || name.includes('basalt') || name.includes('bazaltowy') || name.includes('graphite') || name.includes('grafitowy') || name.includes('silver') || name.includes('srebrny');
    }
    if (q === 'white') {
      return name.includes('white') || name.includes('bialy') || name.includes('blanco') || name.includes('cream') || name.includes('kremowy') || name.includes('crema');
    }
    
    return false;
  };

  const options = rawOptions.filter(opt => {
    if (!matchSearch(opt, searchQuery)) return false;
    if (selectedGroup) {
      const targetGroup = selectedGroup === 'Metal' ? 'Metal Effect' : selectedGroup;
      if (opt.code === '') return true;
      return opt.group === targetGroup;
    }
    return true;
  });

  // Responsive sizes based on container width
  const stepWidth = visibleDim < 640 ? 90 : 130;
  const baseSize = visibleDim < 640 ? 110 : 160;

  const currentIndex = options.findIndex(o => o.code === value);
  const activeIdx = currentIndex !== -1 ? currentIndex : 0;

  const lastValueRef = useRef<string | null>(null);
  const lastProgrammaticScrollRef = useRef<number | null>(null);

  // Synchronize scroll position with active value & handle filtered options changes
  useEffect(() => {
    if (options.length === 0) return;

    const idx = options.findIndex(o => o.code === value);
    if (idx === -1) {
      // Selected value not found in current options (due to filter), select first match
      onChange(options[0].code);
    } else {
      // Value is in the options list, make sure scroll matches
      if (scrollContainerRef.current) {
        const targetScroll = idx * stepWidth;
        const currentScroll = scrollContainerRef.current.scrollLeft;
        if (Math.abs(currentScroll - targetScroll) > 1.5) {
          lastProgrammaticScrollRef.current = targetScroll;
          scrollContainerRef.current.scrollLeft = targetScroll;
          setScrollPos(targetScroll);
        }
      }
      lastValueRef.current = value;
    }
  }, [value, options, stepWidth, onChange]);

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
      
      setIsScrolling(true);
      if (scrollTimeoutRef.current !== null) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);

      if (lastProgrammaticScrollRef.current !== null && Math.abs(sPos - lastProgrammaticScrollRef.current) < 1.1) {
        lastProgrammaticScrollRef.current = null;
        setScrollPos(sPos);
        return;
      }

      setScrollPos(sPos);
      
      const idx = Math.round(sPos / stepWidth);
      if (idx >= 0 && idx < options.length) {
        const activeOpt = options[idx];
        if (activeOpt.code !== value) {
          lastValueRef.current = activeOpt.code;
          onChange(activeOpt.code);
        }
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (scrollContainerRef.current) {
      e.preventDefault();
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

  const swatches = [];
  for (let i = startIdx; i <= endIdx; i++) {
    const itemOffset = i * stepWidth - scrollPos;
    const angle = itemOffset / R;
    if (Math.abs(angle) > 1.6) continue;

    const trigVal = R * Math.sin(angle);
    const cosVal = Math.cos(angle);
    const scale = Math.pow(cosVal, 1.8);

    const size = baseSize * scale;
    const opacity = Math.max(0, cosVal * cosVal);

    const opt = options[i];
    const isSelected = opt.code === value;
    const isDefault = opt.code === '';

    // Active color doubles in size on hover, other colors shrink to 0.75x
    const hoverScale = isSelected 
      ? (isOverActiveSwatch ? 2.0 : 1.0) 
      : (isOverActiveSwatch ? 0.75 : 1.0);

    const distance = Math.abs(i - centerIdx);
    const zIndex = isSelected ? 40 : Math.max(10, 30 - distance);

    swatches.push(
      <div
        key={`swatch-${i}-${opt.code}`}
        onClick={() => {
          onChange(opt.code);
        }}
        className={`absolute cursor-pointer rounded-xl border transition-all duration-300 ease-out flex items-center justify-center ${
          isSelected 
            ? (isLight ? 'border-black ring-4 ring-black/25 shadow-md bg-white' : 'border-mammut-gold ring-4 ring-mammut-gold/45 shadow-[0_0_20px_rgba(217,119,6,0.6)]') 
            : (isLight ? 'border-zinc-200 hover:border-zinc-400 bg-zinc-50' : 'border-gray-800 hover:border-gray-500')
        }`}
        style={{
          left: `calc(50% + ${trigVal}px - ${size / 2}px)`,
          top: `calc(50% - ${size / 2}px)`,
          width: size,
          height: size,
          opacity: opacity,
          zIndex: zIndex,
          backgroundImage: opt.swatchUrl ? `url(${opt.swatchUrl})` : 'none',
          backgroundColor: opt.swatchUrl ? 'transparent' : opt.hex || '#4B4B4D',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: isSelected ? 'none' : (isLight ? 'inset 0 2px 4px rgba(0,0,0,0.15)' : 'inset 0 4px 8px rgba(0,0,0,0.6)'),
          transform: `scale(${hoverScale})`
        }}
        title={`${opt.code} - ${opt.name}`}
      >
        {isDefault && (
          <div className={`text-[10px] md:text-xs font-black font-sans px-2 py-1 rounded border text-center select-none pointer-events-none uppercase tracking-wide ${
            isLight ? 'text-zinc-650 bg-white/95 border-zinc-250' : 'text-gray-300 bg-mammut-black/70 border-gray-700/50'
          }`}>
            Default
          </div>
        )}
        {isSelected && !isOverActiveSwatch && !isScrolling && (
          <div 
            className={`absolute bg-gradient-to-br from-emerald-400 to-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg border z-35 animate-scale-in ${
              isLight ? 'border-white' : 'border-mammut-darker'
            }`}
            style={{
              top: '-3px',
              right: '-3px',
              width: visibleDim < 640 ? '16px' : '22px',
              height: visibleDim < 640 ? '16px' : '22px',
            }}
            title="Selected finish"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={4} stroke="currentColor" className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
        )}
      </div>
    );
  }

  const paddingVal = Math.max(0, visibleDim / 2 - stepWidth / 2);
  const activeOpt = options[activeIdx] || { code: '', name: t('noColorsFound', 'No matching colors found'), swatchUrl: '', hex: '#4B4B4D' };

  return (
    <div className="flex flex-col gap-1.5 w-full relative overflow-visible z-20">
      <label className={`block text-xs font-bold uppercase tracking-wide mb-1.5 ${
        isLight ? 'text-zinc-500' : 'text-gray-400'
      }`}>{label}</label>

      {/* Color Group Filters */}
      <div className="flex items-center justify-between mb-2 text-xs font-bold w-full">
        <div className="flex gap-2">
          {['Metal', 'Solid', 'Wood Effect'].map(groupName => {
            const isActive = selectedGroup === groupName;
            return (
              <button
                key={groupName}
                type="button"
                onClick={() => {
                  setSelectedGroup(isActive ? null : groupName);
                }}
                className={`px-3 py-1.5 rounded transition-all cursor-pointer border ${
                  isActive
                    ? (isLight
                        ? 'bg-black border-black text-white shadow-sm'
                        : 'bg-mammut-gold border-mammut-gold text-black shadow-md'
                      )
                    : (isLight
                        ? 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:text-black hover:border-zinc-300'
                        : 'bg-mammut-dark/40 border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                      )
                }`}
                style={{ borderRadius: '4px' }}
              >
                {groupName}
              </button>
            );
          })}
        </div>

        {/* Magnifying Glass Button */}
        <button
          type="button"
          onClick={() => {
            setIsEditingSearch(!isEditingSearch);
          }}
          className={`p-1.5 border rounded transition-all cursor-pointer flex items-center justify-center ${
            isEditingSearch
              ? (isLight
                  ? 'bg-black border-black text-white shadow-sm'
                  : 'bg-mammut-gold border-mammut-gold text-black shadow-md'
                )
              : (isLight
                  ? 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:text-black hover:border-zinc-300'
                  : 'bg-mammut-dark/40 border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                )
          }`}
          style={{ borderRadius: '4px', width: '28px', height: '28px' }}
          title="Search color"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.604 10.604z" />
          </svg>
        </button>
      </div>
      <div 
        ref={containerRef}
        onWheel={handleWheel}
        onMouseMove={(e) => {
          if (!containerRef.current) return;
          const rect = containerRef.current.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;
          
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          
          // Check if cursor is within the central swatch circle
          const radius = baseSize / 2;
          const distSq = Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2);
          const isOver = distSq <= radius * radius;
          if (isOver !== isOverActiveSwatch) {
            setIsOverActiveSwatch(isOver);
          }
        }}
        onMouseLeave={() => {
          setIsOverActiveSwatch(false);
        }}
        className={`relative rounded-xl overflow-visible select-none shadow-inner flex items-center justify-center group w-full h-[140px] md:h-[190px] border ${
          isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-mammut-dark border-gray-855'
        }`}
      >
        {options.length === 0 ? (
          <div className={`absolute inset-0 flex flex-col items-center justify-center font-bold text-sm pointer-events-none px-4 z-35 backdrop-blur-sm rounded-xl ${
            isLight ? 'bg-white/80 text-zinc-650' : 'bg-mammut-darker/60 text-gray-400'
          }`}>
            <span className="text-center">{t('noColorsFound', 'No matching colors found')}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSearchQuery('');
                setIsEditingSearch(false);
              }}
              className={`mt-3 text-xs pointer-events-auto border px-4 py-1.5 rounded-full cursor-pointer transition-colors ${
                isLight 
                  ? 'text-black bg-zinc-100 hover:bg-zinc-200 border-zinc-300' 
                  : 'text-mammut-gold hover:text-white bg-gray-800 hover:bg-gray-750 border-gray-700'
              }`}
            >
              {t('clearSearch', 'Clear Search')}
            </button>
          </div>
        ) : (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-10">
            {swatches}
          </div>
        )}

        {/* Gradients */}
        <div className={`absolute inset-y-0 left-0 w-20 bg-gradient-to-r to-transparent pointer-events-none z-15 opacity-90 ${
          isLight ? 'from-zinc-50' : 'from-mammut-dark'
        }`} />
        <div className={`absolute inset-y-0 right-0 w-20 bg-gradient-to-l to-transparent pointer-events-none z-15 opacity-90 ${
          isLight ? 'from-zinc-50' : 'from-mammut-dark'
        }`} />

        {/* Scroll Container */}
        {options.length > 0 && (
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
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
                onClick={() => onChange(opt.code)}
              />
            ))}
            <div style={{ width: paddingVal, flexShrink: 0 }} />
          </div>
        )}

        {/* Arrow Left */}
        {options.length > 0 && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); adjustIndex('prev'); }}
            className={`absolute z-30 w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-lg active:scale-90 transition-all duration-150 cursor-pointer select-none left-2 md:left-3 top-1/2 -translate-y-1/2 border ${
              isLight 
                ? 'bg-white border-zinc-200 text-zinc-700 hover:text-black hover:border-black shadow-sm' 
                : 'bg-mammut-black/85 border-gray-800 text-amber-700 hover:text-mammut-gold hover:border-mammut-gold/50'
            }`}
            title="Previous Color"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3 md:w-4 md:h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        )}

        {/* Arrow Right */}
        {options.length > 0 && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); adjustIndex('next'); }}
            className={`absolute z-30 w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-lg active:scale-90 transition-all duration-150 cursor-pointer select-none right-2 md:right-3 top-1/2 -translate-y-1/2 border ${
              isLight 
                ? 'bg-white border-zinc-200 text-zinc-700 hover:text-black hover:border-black shadow-sm' 
                : 'bg-mammut-black/85 border-gray-800 text-amber-700 hover:text-mammut-gold hover:border-mammut-gold/50'
            }`}
            title="Next Color"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3 md:w-4 md:h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        )}
      </div>

      {/* Description underneath with search/filtering capability */}
      {isEditingSearch || searchQuery ? (
        <div 
          className={`flex items-center mt-3 md:mt-4 px-3 py-1.5 w-full relative shadow-sm border ${
            isLight ? 'bg-white border-zinc-300 text-black' : 'bg-mammut-black border-mammut-gold text-mammut-white shadow-md'
          }`}
          style={{ borderRadius: '4px' }}
        >
          <span className={`text-[10px] uppercase tracking-widest font-bold absolute -top-2.5 left-3 px-2 border rounded ${
            isLight ? 'bg-white text-zinc-500 border-zinc-200' : 'bg-mammut-darker text-mammut-gold border-gray-855'
          }`}>
            {t('selectedFinish', 'Selected Finish')}
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchColorPlaceholder', 'Search (e.g. wood, metal, blue...)')}
            className={`w-full bg-transparent focus:outline-none text-sm md:text-base font-bold font-mono pl-1 pr-8 py-1 ${
              isLight ? 'text-black placeholder-zinc-400' : 'text-mammut-white'
            }`}
            autoFocus
            onBlur={() => {
              if (!searchQuery) {
                setIsEditingSearch(false);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === 'Escape') {
                e.currentTarget.blur();
              }
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSearchQuery('');
                setIsEditingSearch(false);
              }}
              className={`absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                isLight ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-black' : 'bg-gray-800 hover:bg-mammut-gold/20 text-gray-400 hover:text-mammut-gold'
              }`}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      ) : (
        <div 
          onClick={() => setIsEditingSearch(true)}
          className="flex flex-col items-center justify-center p-2 cursor-pointer border mt-3 md:mt-4 w-full transition-all group/finish relative overflow-hidden"
          style={{
            backgroundImage: activeOpt.swatchUrl ? `url(${activeOpt.swatchUrl})` : 'none',
            backgroundColor: activeOpt.hex || '#4B4B4D',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '4px',
            borderColor: isLight ? '#d4d4d8' : 'var(--theme-mammut-border)',
            minHeight: '64px',
          }}
        >
          {/* Only display the name of the Texture with text shadow glow */}
          <span 
            className="text-base md:text-lg font-black tracking-wide text-center whitespace-nowrap overflow-hidden text-ellipsis max-w-full select-none"
            style={{
              color: isLight ? '#000000' : 'var(--theme-mammut-gold)',
              textShadow: isLight
                ? '0 0 3px #ffffff, 0 0 1px #ffffff'
                : '0 0 3px #000000, 0 0 1px #000000',
            }}
          >
            {activeOpt.name}
          </span>
        </div>
      )}
    </div>
  );
};


const HandleImage = ({ 
  handleType, 
  handleColor, 
  className 
}: { 
  handleType: string; 
  handleColor: string; 
  className?: string; 
}) => {
  const [src, setSrc] = useState('');
  const [fallbackIdx, setFallbackIdx] = useState(-1);

  const getSrcForColor = (type: string, color: string) => {
    const hoppeSeries = ['AtlantaK', 'AtlantaP', 'Toulon', 'ToulonSF', 'Hamburg', 'HamburgSF', 'Tokyo'];
    const aliasType = hoppeSeries.includes(type) ? 'Atlanta' : (type === 'ALU_B' ? 'ALU_A' : type);
    if (aliasType === 'Kwadrat') return `/assets/handles/kwadrat-${color}.png`;
    if (aliasType === 'Mistral') return `/assets/handles/mistral-${color}.png`;
    if (aliasType === 'MistralK') return `/assets/handles/mistral-${color}-key.png`;
    return `/assets/handles/${aliasType}_${color}.webp`;
  };

  const getFallbacks = (type: string) => {
    return [
      getSrcForColor(type, 'white'), 
      getSrcForColor(type, 'ral9016'), 
      getSrcForColor(type, 'ral9001'), 
      getSrcForColor(type, 'f1'), 
      getSrcForColor(type, 'silver'), 
      getSrcForColor(type, 'f4'),
      type === 'Kwadrat' ? '/assets/handles/kwadrat-ral9016.png' :
      type === 'KwadratK' ? '/assets/handles/KwadratK_ral9016.webp' :
      type === 'Mistral' ? '/assets/handles/mistral-ral9001.png' :
      type === 'MistralK' ? '/assets/handles/mistral-f9-key.png' :
      type === 'ALU_A' || type === 'ALU_B' ? '/assets/handles/ALU_A_ral9016.webp' :
      type === 'ALU_AK' || type === 'ALU_BK' ? `/assets/handles/${type}_white.webp` :
      type === 'ALU_AP' ? '/assets/handles/ALU_AP_white.webp' :
      type === 'MA_1010' ? '/assets/handles/MA_1010_default.webp' :
      `/assets/handles/${type}_white.webp`
    ];
  };

  useEffect(() => {
    const initialColor = handleColor ? handleColor : 'white';
    setSrc(getSrcForColor(handleType, initialColor));
    setFallbackIdx(-1);
  }, [handleType, handleColor]);

  const handleError = () => {
    const fallbacks = getFallbacks(handleType);
    const nextIdx = fallbackIdx + 1;
    if (nextIdx < fallbacks.length) {
      setFallbackIdx(nextIdx);
      setSrc(fallbacks[nextIdx]);
    }
  };

  return (
    <img
      src={src}
      alt={handleType}
      className={className}
      onError={handleError}
    />
  );
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
  const { theme } = useThemeStore();
  const isLight = theme === 'light' || document.documentElement.getAttribute('data-theme') === 'light';

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPos, setScrollPos] = useState(0);
  const [visibleDim, setVisibleDim] = useState(300);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const dragStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
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

    const imageUrl = `${import.meta.env.BASE_URL}assets/spacers/${opt.code}.${opt.ext || 'jpg'}`;

    items.push(
      <div
        key={`spacer-${i}-${opt.code}`}
        onClick={(e) => {
          handleSnapClick(e, opt.code);
        }}
        className={`absolute cursor-pointer rounded-xl border transition-all duration-300 ease-out flex items-center justify-center bg-white ${
          isSelected 
            ? (isLight ? 'border-black border-[1px] shadow-sm' : 'border-mammut-gold border-[1px] shadow-[0_0_12px_rgba(217,119,6,0.35)]') 
            : (isLight ? 'border-zinc-200 hover:border-zinc-400 bg-zinc-100' : 'border-gray-800 hover:border-gray-600 bg-mammut-black')
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
        title={`${opt.code} - ${opt.name}`}
      >
        <img 
          src={imageUrl} 
          alt={opt.name} 
          className="w-full h-full object-cover rounded-xl"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <div 
          className="absolute inset-0 z-[-1] rounded-xl" 
          style={{ backgroundColor: opt.hex || '#4B4B4D' }} 
        />
        {isSelected && (
          <div 
            className={`absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg border z-50 p-0.5 animate-in fade-in zoom-in duration-200 ${
              isLight ? 'border-white' : 'border-mammut-dark'
            }`}
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
      <label className={`block text-xs font-bold uppercase tracking-wide mb-1 md:mb-2 ${
        isLight ? 'text-zinc-500' : 'text-gray-400'
      }`}>{label}</label>
      <div 
        ref={containerRef}
        onWheel={handleWheel}
        className={`relative rounded-xl overflow-visible select-none shadow-inner flex items-center justify-center group w-full h-[140px] md:h-[190px] border ${
          isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-mammut-dark border-gray-850'
        }`}
      >
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible z-10">
          {items}
        </div>

        <div className={`absolute inset-y-0 left-0 w-20 bg-gradient-to-r to-transparent pointer-events-none z-15 opacity-90 ${
          isLight ? 'from-zinc-50' : 'from-mammut-dark'
        }`} />
        <div className={`absolute inset-y-0 right-0 w-20 bg-gradient-to-l to-transparent pointer-events-none z-15 opacity-90 ${
          isLight ? 'from-zinc-50' : 'from-mammut-dark'
        }`} />

        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          onPointerDown={handlePointerDown}
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
          className={`absolute z-30 w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-lg active:scale-90 transition-all duration-150 cursor-pointer select-none left-2 md:left-3 top-1/2 -translate-y-1/2 border ${
            isLight 
              ? 'bg-white border-zinc-200 text-zinc-700 hover:text-black hover:border-black shadow-sm' 
              : 'bg-mammut-black/85 border-gray-800 text-amber-700 hover:text-mammut-gold hover:border-mammut-gold/50'
          }`}
          title="Previous"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3 md:w-4 md:h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); adjustIndex('next'); }}
          className={`absolute z-30 w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-lg active:scale-90 transition-all duration-150 cursor-pointer select-none right-2 md:right-3 top-1/2 -translate-y-1/2 border ${
            isLight 
              ? 'bg-white border-zinc-200 text-zinc-700 hover:text-black hover:border-black shadow-sm' 
              : 'bg-mammut-black/85 border-gray-800 text-amber-700 hover:text-mammut-gold hover:border-mammut-gold/50'
          }`}
          title="Next"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3 md:w-4 md:h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      <div className={`flex flex-col items-center justify-center py-2 border rounded-xl mt-1 md:mt-2 px-3 ${
        isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-mammut-dark/40 border border-gray-850/60'
      }`}>
        <span className={`text-[10px] uppercase tracking-widest font-bold ${
          isLight ? 'text-zinc-500' : 'text-gray-500'
        }`}>Selected Spacer</span>
        <span className={`text-sm md:text-base font-black font-mono tracking-wide text-center mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis max-w-full ${
          isLight ? 'text-black' : 'text-mammut-gold'
        }`}>
          {activeOpt ? `${activeOpt.code} - ${activeOpt.name}` : ''}
        </span>
      </div>
    </div>
  );
};

 const HandleScrollWheel = ({
  label,
  value,
  onChange,
  options,
  handleColor
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: any[];
  handleColor: string;
}) => {
  const { theme } = useThemeStore();
  const isLight = theme === 'light' || document.documentElement.getAttribute('data-theme') === 'light';

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPos, setScrollPos] = useState(0);
  const [visibleDim, setVisibleDim] = useState(300);
  const [isHovered, setIsHovered] = useState(false);

  const stepWidth = visibleDim < 640 ? 90 : 130;
  const baseSize = visibleDim < 640 ? 50 : 70;
  const indicatorWidth = visibleDim < 640 ? 120 : 172;

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
      const idx = Math.round(sPos / stepWidth);
      if (idx >= 0 && idx < options.length) {
        const activeOpt = options[idx];
        if (activeOpt.code !== value) {
          lastValueRef.current = activeOpt.code;
          onChange(activeOpt.code);
        }
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (scrollContainerRef.current) {
      e.preventDefault();
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

    const hoverScale = isSelected 
      ? (isHovered ? 1.1 : 1.0) 
      : (isHovered ? 0.9 : 1.0);

    const distance = Math.abs(i - centerIdx);
    const zIndex = isSelected ? 40 : Math.max(10, 30 - distance);

    items.push(
      <div
        key={`handle-${i}-${opt.code}`}
        onClick={() => {
          onChange(opt.code);
        }}
        className={`absolute cursor-pointer rounded-xl border transition-all duration-300 ease-out flex items-center justify-center p-2 overflow-hidden bg-white ${
          isSelected 
            ? (isLight ? 'border-black ring-4 ring-black/25 shadow-md' : 'border-mammut-gold ring-4 ring-mammut-gold/45 shadow-[0_0_20px_rgba(217,119,6,0.6)]') 
            : (isLight ? 'border-zinc-200 hover:border-zinc-400 bg-zinc-50' : 'border-gray-800 hover:border-gray-500')
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
        title={`${opt.code} - ${opt.name}`}
      >
        {opt.code === '-' ? (
          <div className="text-[9px] md:text-[10px] font-black font-sans text-gray-500 text-center leading-none select-none pointer-events-none uppercase">
            None
          </div>
        ) : (
          <HandleImage
            handleType={opt.code}
            handleColor={handleColor}
            className="max-h-full max-w-full object-contain mix-blend-multiply p-0.5"
          />
        )}
      </div>
    );
  }

  const paddingVal = Math.max(0, visibleDim / 2 - stepWidth / 2);
  const activeOpt = options[activeIdx] || options[0];

  return (
    <div className="flex flex-col gap-1.5 w-full relative overflow-visible z-20">
      <label className={`block text-xs font-bold uppercase tracking-wide mb-1 md:mb-2 ${
        isLight ? 'text-zinc-500' : 'text-gray-400'
      }`}>{label}</label>
      <div 
        ref={containerRef}
        onWheel={handleWheel}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative rounded-xl overflow-visible select-none shadow-inner flex items-center justify-center group w-full h-[140px] md:h-[190px] border ${
          isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-mammut-dark border-gray-850'
        }`}
      >
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-10">
          {items}
        </div>

        <div className="absolute inset-y-1.5 left-1/2 -translate-x-1/2 pointer-events-none z-20 flex justify-between transition-all duration-300" style={{ width: `${indicatorWidth}px` }}>
          <div className={`w-3.5 h-full border-l-2 border-t-2 border-b-2 rounded-l-2xl ${
            isLight ? 'border-zinc-400 shadow-[inset_1px_0_0_rgba(0,0,0,0.05)]' : 'border-mammut-gold/40 shadow-[inset_1px_0_0_rgba(217,119,6,0.1)]'
          }`} />
          <div className={`w-3.5 h-full border-r-2 border-t-2 border-b-2 rounded-r-2xl ${
            isLight ? 'border-zinc-400 shadow-[inset_-1px_0_0_rgba(0,0,0,0.05)]' : 'border-mammut-gold/40 shadow-[inset_-1px_0_0_rgba(217,119,6,0.1)]'
          }`} />
        </div>

        <div className={`absolute inset-y-0 left-0 w-20 bg-gradient-to-r to-transparent pointer-events-none z-15 opacity-90 ${
          isLight ? 'from-zinc-50' : 'from-mammut-dark'
        }`} />
        <div className={`absolute inset-y-0 right-0 w-20 bg-gradient-to-l to-transparent pointer-events-none z-15 opacity-90 ${
          isLight ? 'from-zinc-50' : 'from-mammut-dark'
        }`} />

        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
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
              onClick={() => onChange(opt.code)}
            />
          ))}
          <div style={{ width: paddingVal, flexShrink: 0 }} />
        </div>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); adjustIndex('prev'); }}
          className={`absolute z-30 w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-lg active:scale-90 transition-all duration-150 cursor-pointer select-none left-2 md:left-3 top-1/2 -translate-y-1/2 border ${
            isLight 
              ? 'bg-white border-zinc-200 text-zinc-700 hover:text-black hover:border-black shadow-sm' 
              : 'bg-mammut-black/85 border-gray-800 text-amber-700 hover:text-mammut-gold hover:border-mammut-gold/50'
          }`}
          title="Previous"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3 md:w-4 md:h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); adjustIndex('next'); }}
          className={`absolute z-30 w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-lg active:scale-90 transition-all duration-150 cursor-pointer select-none right-2 md:right-3 top-1/2 -translate-y-1/2 border ${
            isLight 
              ? 'bg-white border-zinc-200 text-zinc-700 hover:text-black hover:border-black shadow-sm' 
              : 'bg-mammut-black/85 border-gray-800 text-amber-700 hover:text-mammut-gold hover:border-mammut-gold/50'
          }`}
          title="Next"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3 md:w-4 md:h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      <div className={`flex flex-col items-center justify-center py-2 border rounded-xl mt-1 md:mt-2 px-3 ${
        isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-mammut-dark/40 border border-gray-855/60'
      }`}>
        <span className={`text-[10px] uppercase tracking-widest font-bold ${
          isLight ? 'text-zinc-500' : 'text-gray-500'
        }`}>Selected Handle</span>
        <span className={`text-sm md:text-base font-black font-mono tracking-wide text-center mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis max-w-full ${
          isLight ? 'text-black' : 'text-mammut-gold'
        }`}>
          {activeOpt ? `${activeOpt.code} - ${activeOpt.name}` : ''}
        </span>
      </div>
    </div>
  );
};

const SegmentedControl = ({
  label,
  value,
  onChange,
  options,
  gridCols = 'grid-cols-2'
}: {
  label: string,
  value: string,
  onChange: (v: string) => void,
  options: { value: string, label: string }[],
  gridCols?: string
}) => {
  const { theme } = useThemeStore();
  const isLight = theme === 'light' || document.documentElement.getAttribute('data-theme') === 'light';

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className={`block text-xs font-bold uppercase tracking-wide ${isLight ? 'text-zinc-550' : 'text-gray-400'}`}>{label}</label>
      <div className={`grid ${gridCols} border rounded-xl p-1 gap-1 ${
        isLight ? 'bg-zinc-100 border-zinc-200' : 'bg-mammut-black border-gray-855'
      }`}>
        {options.map((opt) => {
          const isActive = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`py-2 px-2 rounded-lg text-xs font-bold uppercase transition-all text-center leading-tight cursor-pointer ${
                isActive 
                  ? (isLight ? 'bg-white text-black shadow-sm' : 'bg-mammut-gold text-black shadow-md') 
                  : (isLight ? 'text-zinc-550 hover:text-black hover:bg-white/40' : 'text-gray-400 hover:text-white hover:bg-gray-800/40')
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

interface CarouselOption {
  code: string;
  name: string;
  image?: string;
  hex?: string;
}

const CarouselSelector = <T extends CarouselOption>({
  label,
  value,
  onChange,
  options,
  getImagePath
}: {
  label: string,
  value: string,
  onChange: (v: string) => void,
  options: T[],
  getImagePath?: (opt: T) => string
}) => {
  const { theme } = useThemeStore();
  const isLight = theme === 'light' || document.documentElement.getAttribute('data-theme') === 'light';

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className={`block text-xs font-bold uppercase tracking-wide ${isLight ? 'text-zinc-500' : 'text-gray-400'}`}>{label}</label>
      <div className="flex gap-3 overflow-x-auto pb-8 pt-8 -my-6 scrollbar-none snap-x snap-mandatory">
        {options.map((opt) => {
          const isActive = value === opt.code;
          const imageSrc = getImagePath ? getImagePath(opt) : opt.image;
          return (
            <button
              key={opt.code}
              type="button"
              onClick={() => onChange(opt.code)}
              className={`flex-none w-28 h-28 border rounded-xl p-2 flex flex-col items-center justify-between transition-all select-none snap-start relative group hover:z-30 cursor-pointer ${
                isActive 
                  ? (isLight ? 'border-black bg-zinc-100/50 shadow-md scale-[1.02]' : 'border-mammut-gold bg-mammut-gold/5 shadow-lg scale-[1.02]') 
                  : (isLight ? 'border-zinc-200 bg-zinc-50 hover:border-zinc-400 hover:bg-zinc-100' : 'border-gray-800 bg-gray-900 hover:border-gray-700 hover:bg-gray-800/30')
              }`}
            >
              {/* Selection badge */}
              {isActive && (
                <div className={`absolute top-1.5 right-1.5 rounded-full w-4.5 h-4.5 flex items-center justify-center text-[10px] font-black z-10 ${
                  isLight ? 'bg-black text-white' : 'bg-mammut-gold text-black'
                }`}>
                  ✓
                </div>
              )}
              
              {/* Visual Image / Hex Swatch */}
              {imageSrc ? (
                <div className="w-16 h-16 rounded-lg bg-white overflow-hidden flex items-center justify-center p-1 group-hover:scale-[1.8] group-hover:z-30 shadow-md transition-transform duration-300 relative">
                  <img 
                    src={imageSrc} 
                    alt={opt.name} 
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => { 
                      const target = e.currentTarget;
                      target.style.display = 'none'; 
                      const sibling = target.nextElementSibling as HTMLElement;
                      if (sibling) sibling.classList.remove('hidden');
                    }}
                  />
                  <div className={`hidden absolute inset-0 flex items-center justify-center text-[10px] font-bold rounded-lg ${isLight ? 'bg-zinc-100 text-zinc-500' : 'bg-gray-850 text-gray-500'}`}>
                    {opt.code}
                  </div>
                </div>
              ) : opt.hex ? (
                <div className={`w-16 h-16 rounded-lg shadow-inner border transition-transform duration-300 group-hover:scale-[1.8] group-hover:z-30 shadow-md relative ${isLight ? 'border-zinc-200' : 'border-gray-700'}`} style={{ backgroundColor: opt.hex }}></div>
              ) : (
                <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-[10px] font-bold transition-transform duration-300 group-hover:scale-[1.8] group-hover:z-30 shadow-md relative ${isLight ? 'bg-zinc-200 text-zinc-500' : 'bg-gray-855 text-gray-500'}`}>
                  {opt.code || 'Std'}
                </div>
              )}
              
              <span className={`text-[10px] font-bold truncate w-full text-center leading-none ${
                isActive 
                  ? (isLight ? 'text-black font-extrabold' : 'text-mammut-gold') 
                  : (isLight ? 'text-zinc-550 group-hover:text-black' : 'text-gray-400')
              }`}>
                {opt.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const TYPOLOGY_GROUPS = [
  {
    category: "Windows",
    subgroups: [
      { name: "TYPE 1 Window", ids: ["F100","F101","F102","F103","F104","F105","F106","F200","F201","F203","F204","F205","F206","F207","F208","F250","F251","F252","F253","F254","F255","F300","F301","F302","F303","F304","F350","F351","F352","F353","F309","F400","F401","F402","F403","F450","F451","F542","F453"] },
    ]
  }
];

export function DebugPricing() {
  const { t } = useTranslation();
  const { theme } = useThemeStore();
  const isLight = theme === 'light' || document.documentElement.getAttribute('data-theme') === 'light';

  const handleDownload = () => {
    const canvas = document.querySelector('.visualizer-container canvas') as HTMLCanvasElement;
    if (!canvas) {
      console.warn("[DebugPricing] WebGL Canvas not found in .visualizer-container");
      alert("WebGL canvas not found.");
      return;
    }
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `3d-window-${typology}-${width}x${height}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error("Failed to capture 3D frame:", e);
      alert("Failed to capture 3D frame. Make sure WebGL is enabled.");
    }
  };

  const [activeAccordion, setActiveAccordion] = useState<string | null>('product');

  // 1) & 2) Profile System & Typology
  const [typology, setTypology] = useState<string>('F104');
  const [isTypologyOpen, setIsTypologyOpen] = useState(false);
  const [closeOnSelect, setCloseOnSelect] = useState(true);
  const [opening] = useState<string>('UR');
  const [profilsatz, setProfilsatz] = useState('1100'); // Maps to IG5
  const [activeCategory, setActiveCategory] = useState<string>('WINDOWS');
  const [is3dMode, setIs3dMode] = useState(true);
  const [arPlacement, setArPlacement] = useState<'wall' | 'floor' | null>(null);
  const [arMenuOpen, setArMenuOpen] = useState(false);
  const arMenuRef = useRef<HTMLDivElement>(null);

  const [scenery, setScenery] = useState('studio-grey');
  const [isSceneryMenuOpen, setIsSceneryMenuOpen] = useState(false);
  const sceneryMenuRef = useRef<HTMLDivElement>(null);
  const [customBackground, setCustomBackground] = useState<string | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (arMenuRef.current && !arMenuRef.current.contains(event.target as Node)) {
        setArMenuOpen(false);
      }
      if (sceneryMenuRef.current && !sceneryMenuRef.current.contains(event.target as Node)) {
        setIsSceneryMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // 3) Dimensions
  const [width, setWidth] = useState(1000);
  const [height, setHeight] = useState(1000);

  // 4) Glazing Options
  const [infills, setInfills] = useState([
    { code: '2-24', pane1: 'T4', pane2: '', pane3: 'FL4', frameStyle: 'S', width: '', height: '' },
    { code: '2-24', pane1: 'T4', pane2: '', pane3: 'FL4', frameStyle: 'S', width: '', height: '' }
  ]);

  // 5) Joinery colors
  const [colorType, setColorType] = useState('W-W');
  const [colorCode, setColorCode] = useState('0197'); // 0197 = White
  const [interiorColorCode, setInteriorColorCode] = useState('0197');
  const [overwriteCoreColor, setOverwriteCoreColor] = useState(false);
  const [coreColor, setCoreColor] = useState('');

  // 6) Window options
  const [windowUnit] = useState('');
  const [safetyClass, setSafetyClass] = useState('');
  const [model, setModel] = useState('');
  const [hardwareSystem, setHardwareSystem] = useState('');
  const [handleType, setHandleType] = useState('-');
  const [handleColor, setHandleColor] = useState('');
  const [coverColor, setCoverColor] = useState('');

  // 7) Profile options
  const [frameProfile, setFrameProfile] = useState('50001');
  const [weld, setWeld] = useState('standard');
  const [glazingBeadStyle, setGlazingBeadStyle] = useState('Z');
  const [frameReinforcement, setFrameReinforcement] = useState('standard');

  // 8) Seals
  const [sealColor, setSealColor] = useState('');

  // Default gasket color to black ('czarny') for F100 & F104 if not already selected
  useEffect(() => {
    if ((typology === 'F100' || typology === 'F104') && !sealColor) {
      setSealColor('czarny');
    }
  }, [typology]);

  // 9) Shutter options
  const [includeShutter, setIncludeShutter] = useState(false);
  const [rollerBlindType, setRollerBlindType] = useState('');
  const [windowScreen, setWindowScreen] = useState('');
  const [windowScreenLocation, setWindowScreenLocation] = useState('');

  // 10) Pancerz
  const [curtainType, setCurtainType] = useState('');
  const [finsPerforation, setFinsPerforation] = useState('');
  const [curtainColor, setCurtainColor] = useState('');
  const [bottomSlatColor, setBottomSlatColor] = useState('');
  const [windowScreenBottomSlatColor, setWindowScreenBottomSlatColor] = useState('');

  // 11) Service - Field I
  const [driveType, setDriveType] = useState('');
  const [controlSide, setControlSide] = useState('');

  // 12) Service
  const [doorChecksTypeI, setDoorChecksTypeI] = useState('');
  const [imposeArbour, setImposeArbour] = useState(false);

  // 13) Box
  const [boxType, setBoxType] = useState('');
  const [outerBoxColor, setOuterBoxColor] = useState('');
  const [otherBoxColor, setOtherBoxColor] = useState('');
  const [plasterCarrier, setPlasterCarrier] = useState('');
  const [flushMountedSlatIn, setFlushMountedSlatIn] = useState(false);
  const [flushMountedSlatColorIn, setFlushMountedSlatColorIn] = useState('');
  const [flushMountedSlatOut, setFlushMountedSlatOut] = useState(false);
  const [flushMountedSlatColorOut, setFlushMountedSlatColorOut] = useState('');
  const [review, setReview] = useState('');
  const [sideCoverCapColor, setSideCoverCapColor] = useState('');

  // 14) Guide rails
  const [guideRailsColor, setGuideRailsColor] = useState('');
  const [guideRailsCutting, setGuideRailsCutting] = useState('');
  const [extremeLeftGuideRail, setExtremeLeftGuideRail] = useState('');
  const [extremeRightGuideRail, setExtremeRightGuideRail] = useState('');
  const [guideRailsTypes, setGuideRailsTypes] = useState('');

  // 15) Other
  const [guideRailGasketing, setGuideRailGasketing] = useState(false);
  const [soundproofMat, setSoundproofMat] = useState(false);

  // 17) Dowel holes
  const [dowelHoles, setDowelHoles] = useState('');
  const [dowelLeft, setDowelLeft] = useState(true);
  const [dowelRight, setDowelRight] = useState(true);
  const [dowelTop, setDowelTop] = useState(false);
  const [dowelBottom, setDowelBottom] = useState(false);

  // 18) Grilles/Door infills
  const [grilleType, setGrilleType] = useState('');
  const [grilleFields, setGrilleFields] = useState(4);


  const [result, setResult] = useState<PricingApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const euroPrice = result
    ? (result.currency === 'EUR' ? result.vk_local : (result.currency === 'PLN' ? result.vk_local / 4.3 : result.vk_local))
    : 0;
  
  // 19) Visualizer View Side
  const [viewSide, setViewSide] = useState<'interior' | 'exterior'>('interior');

  const handleShare = async () => {
    const canvas = document.querySelector('.visualizer-container canvas') as HTMLCanvasElement;
    if (!canvas) {
      console.warn("[DebugPricing] WebGL Canvas not found in .visualizer-container");
      alert("WebGL canvas not found.");
      return;
    }

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], `3d-window-${typology}-${width}x${height}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'Mammut Window Design',
            text: `My window configuration: ${typology} (${width}x${height} mm)`,
          });
          return;
        } catch (err) {
          console.warn("Web Share failed, trying clipboard copy:", err);
        }
      }

      if (navigator.clipboard && (window as any).ClipboardItem) {
        try {
          await navigator.clipboard.write([
            new ((window as any).ClipboardItem)({
              'image/png': blob
            })
          ]);
          alert("Screenshot copied to clipboard! You can paste it directly.");
          return;
        } catch (err) {
          console.warn("Copying image to clipboard failed:", err);
        }
      }

      // Fallback: download the image
      const link = document.createElement('a');
      link.download = `3d-window-${typology}-${width}x${height}.png`;
      link.href = dataUrl;
      link.click();
      alert("Screenshot downloaded to your device.");

    } catch (e) {
      console.error("Failed to share screenshot:", e);
      alert("Failed to capture or share screenshot.");
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    if (cat) setActiveCategory(cat);
    const typo = params.get('typology');
    if (typo) setTypology(typo);
    const w = params.get('width');
    if (w) setWidth(Number(w) || 1000);
    const h = params.get('height');
    if (h) setHeight(Number(h) || 1000);
    const col = params.get('color');
    if (col) setColorCode(col);
    const intCol = params.get('intColor');
    if (intCol) setInteriorColorCode(intCol);
    const scen = params.get('scenery');
    if (scen) setScenery(scen);
  }, []);

  // Debounce input changes so we don't spam the API on every keypress.
  useEffect(() => {
    const input: ConfiguratorInput = {
      article: typology,
      profilsatz: SYSTEM_CODE_MAP[profilsatz] || profilsatz,
      materialart: 2,
      beschvar: opening === 'UR' ? 'UR-P' : 'FIX',
      width_mm: width,
      height_mm: height,
      sashCount: 1,
      openings: [opening as any],
      windowUnit: windowUnit || undefined,
      model: model || undefined,
      color: { 
        type: colorType, 
        code: colorCode, 
        exteriorRal: colorCode, 
        interiorRal: interiorColorCode || undefined,
        overwriteCoreColor,
        coreColor: coreColor || undefined
      },
      frameProfile: frameProfile || '50001',
      sashProfile: '50011',
      infills: (typology.match(/^F2[0-5][0-9]$/) ? infills : [infills[0]]).map(inf => ({
        code: inf.code,
        panes: inf.code.startsWith('3-') ? [inf.pane1, inf.pane2, inf.pane3].filter(Boolean) : [inf.pane1, inf.pane3].filter(Boolean),
        spacer: inf.frameStyle || 'S',
        width_mm: inf.width ? Number(inf.width) : undefined,
        height_mm: inf.height ? Number(inf.height) : undefined
      })),
      options: {
        grilleType: grilleType || undefined,
        grilleFields: grilleType ? grilleFields : undefined,
        sealColor: sealColor || undefined,
        beadStyle: glazingBeadStyle as 'Z'|'P',
        weldType: weld as 'standard'|'v-perfect',
        frameReinforcement: frameReinforcement as 'standard'|'full',
        dowelHoles: dowelHoles || undefined,
      },
      hardware: {
        safetyClass: safetyClass || undefined,
        handleType: handleType || undefined,
        handleColor: handleColor || undefined,
        coverColor: coverColor || undefined
      },
      schwelle: 0,
      dealer: { kundenNr: 1008, pricelistKurzbez: 'EUR23011', land: 'CH' },
    };
    const t = setTimeout(() => {
      setLoading(true);
      setError(null);
      fetchPrice({ input })
        .then(r => { setResult(r); setLoading(false); })
        .catch(e => { setError(e.message); setLoading(false); });
    }, 200);
    return () => clearTimeout(t);
  }, [
    typology, width, height, profilsatz, colorType, colorCode, JSON.stringify(infills), 
    safetyClass, handleType, handleColor, 
    coverColor, opening, frameProfile, interiorColorCode, overwriteCoreColor,
    coreColor, windowUnit, model, sealColor
  ]);

  // Group colors for dropdowns using IGLO_EDGE_COLORS as requested
  const groupedColors = IGLO_EDGE_COLORS.reduce((acc: any, val: any) => {
    const group = val.group || 'Other';
    if (!acc[group]) acc[group] = [];
    const cantorCode = val.id.replace('c', '').padStart(4, '0');
    acc[group].push({ code: cantorCode, name: val.name, originalKey: val.id, swatchUrl: val.image, hex: val.hex, group });
    return acc;
  }, {});

  const getColorDetailsFromCode = (code: string) => {
    if (!code) return { hex: '#FFFFFF', textureUrl: '' };
    const colorObj = IGLO_EDGE_COLORS.find(k => k.id.replace('c', '').padStart(4, '0') === code.padStart(4, '0') || k.id.replace('c', '') === code);
    
    return {
      hex: colorObj?.hex || '#4B4B4D', // Fallback to anthracite if no hex
      textureUrl: colorObj?.image || ''
    };
  };

  const extDetails = getColorDetailsFromCode(colorCode);
  const intDetails = interiorColorCode ? getColorDetailsFromCode(interiorColorCode) : extDetails;

  const HANDLE_COLOR_OPTIONS: Record<string, string> = {
    'white': 'White',
    'ral9016': 'RAL 9016 (Pure White)',
    'ral9001': 'RAL 9001 (Cream)',
    'brown': 'Brown',
    'ral8019': 'RAL 8019 (Dark Brown)',
    'czarny': 'Black',
    'ral9005': 'RAL 9005 (Black)',
    'antracyt': 'Anthracite',
    'ral7016': 'RAL 7016 (Anthracite)',
    'silver': 'Silver',
    'f1': 'F1 (Silver)',
    'f2': 'F2 (Champagne)',
    'f4': 'F4 (Old Gold / Bronze)',
    'f9': 'F9 (Titanium)',
    'olive': 'Olive',
    'default': 'Default (Stainless Steel)'
  };

  const COVER_COLOR_OPTIONS: Record<string, string> = {
    'bialy': 'White (biały)',
    'braz': 'Brown (brąz)',
    'jasnybraz': 'Light Brown (jasny brąz)',
    'srebrny': 'Silver (srebrny)',
    'antracyt': 'Anthracite (antracyt)',
    'czarny': 'Black (czarny)',
    'Szampanski': 'Champagne (szampański)',
    'Tytan': 'Titanium (tytan)',
    'kremowy': 'Cream (kremowy)'
  };



  const HANDLE_COLOR_MAP: Record<string, string[]> = {
    'Atlanta': ['white', 'brown', 'f1', 'f2', 'f4', 'f9'],
    'ALU_A': ['ral9016', 'ral9001', 'brown', 'ral8019', 'ral9005', 'ral7016', 'f1', 'f4', 'f9', 'olive'],
    'ALU_AK': ['white', 'ral9016', 'ral9001', 'brown', 'ral9005', 'ral7016', 'silver', 'f9', 'olive'],
    'ALU_AP': ['white', 'brown', 'silver', 'olive'],
    'ALU_B': ['ral9016', 'ral9001', 'brown', 'ral8019', 'ral9005', 'ral7016', 'f1', 'f4', 'f9', 'olive'],
    'ALU_BK': ['white', 'brown', 'silver', 'olive'],
    'Kwadrat': ['ral9016', 'ral9001', 'ral8019', 'ral9005', 'ral7016', 'f1', 'f4', 'f9'],
    'KwadratK': ['ral9016', 'ral9001', 'ral8019', 'ral9005', 'ral7016', 'f1', 'f4', 'f9'],
    'Mistral': ['ral9001', 'ral9005', 'ral7016', 'f9'],
    'MistralK': ['f9'],
    'Dublin': ['white', 'brown', 'ral9005', 'ral7016', 'silver'],
    'DublinK': ['white', 'brown', 'ral9005', 'ral7016', 'silver'],
    'DublinP': ['white', 'brown', 'ral9005', 'ral7016', 'silver'],
    'MA_1010': ['default'],
    'AtlantaK': ['white', 'brown', 'f1', 'f2', 'f4', 'f9'],
    'AtlantaP': ['white', 'brown', 'f1', 'f2', 'f4', 'f9'],
    'Toulon': ['white', 'brown', 'f1', 'f2', 'f4', 'f9'],
    'ToulonSF': ['white', 'brown', 'f1', 'f2', 'f4', 'f9'],
    'Hamburg': ['white', 'brown', 'f1', 'f2', 'f4', 'f9'],
    'HamburgSF': ['white', 'brown', 'f1', 'f2', 'f4', 'f9'],
    'Tokyo': ['white', 'brown', 'f1', 'f2', 'f4', 'f9'],
    '-': []
  };

  const HANDLE_OPTIONS = [
    { code: '-', name: 'No holes for spindle and mounting screws' },
    { code: 'ALU_A', name: 'Aluminum handle I5 / IL (FKS model 1006)' },
    { code: 'ALU_AK', name: 'Aluminum handle I5 / IL with key (FKS model 1006A)' },
    { code: 'ALU_AP', name: 'Aluminum handle I5 with a button (FKS model 1006D)' },
    { code: 'Atlanta', name: 'Hoppe handle Secustic Atlanta' },
    { code: 'Kwadrat', name: 'Aluminium handle Square' },
    { code: 'KwadratK', name: 'Aluminium handle Square with key' },
    { code: 'Mistral', name: 'Aluminium handle Mistral' },
    { code: 'MistralK', name: 'Aluminium handle Mistral with key' },
    { code: 'AtlantaK', name: 'Hoppe handle Secustic Atlanta with key' },
    { code: 'AtlantaP', name: 'Hoppe handle Secustic Atlanta with button' },
    { code: 'Toulon', name: 'Hoppe handle Secustic Toulon' },
    { code: 'ToulonSF', name: 'Hoppe handle Secuforte Toulon' },
    { code: 'Hamburg', name: 'Hoppe handle Secustic Hamburg' },
    { code: 'HamburgSF', name: 'Hoppe handle Secuforte Hamburg' },
    { code: 'Tokyo', name: 'Hoppe Tokyo handle + KISI (child safety lock)' },
    { code: 'ALU_B', name: 'Aluminium handle IE' },
    { code: 'ALU_BK', name: 'Aluminum handle IE with key - (FKS model 1007A)' },
    { code: 'Dublin', name: 'Aluminum handle DUBLIN' },
    { code: 'DublinK', name: 'Aluminum handle DUBLIN with key' },
    { code: 'DublinP', name: 'Aluminum handle DUBLIN with button' },
    { code: 'ALUR', name: 'Flat window handle (roller shutter)' },
    { code: 'ATESTK', name: 'Window handle with key - ATEST' },
    { code: 'ALUW', name: 'Aluminum pull handle "conductor"' },
    { code: 'MA_1010', name: 'MA 1010 stainless steel window handle' }
  ];

  const FRAME_STYLES = [
    { code: 'BI', name: 'Ultimate white (RAL 9016)', hex: '#f4f8f4', ext: 'jpg' },
    { code: 'JB', name: 'Ultimate light brown (RAL 8003)', hex: '#8a5a44', ext: 'jpg' },
    { code: 'JS', name: 'Ultimate light grey (RAL 7035)', hex: '#c5c7c4', ext: 'jpg' },
    { code: 'S', name: 'Steel', hex: '#b0b5b9', ext: 'jpg' },
    { code: 'U', name: 'Ultimate grey (RAL 9023)', hex: '#797b7a', ext: 'webp' },
    { code: 'UC', name: 'Ultimate black (RAL 9005)', hex: '#0a0a0a', ext: 'jpg' },
    { code: 'X', name: 'Ultimate brown', hex: '#59351f', ext: 'jpg' }
  ];

  // TYPOLOGY_GROUPS moved to file level to prevent infinite loops from recreated items array reference

  const WINDOW_MODELS = [
    { group: "1 Cut", options: [
      { code: "S100", name: "Chamfer of the upper left corner" },
      { code: "S101", name: "Chamfer of the upper left corner to any height" },
      { code: "S200", name: "Chamfer of the upper right corner" },
      { code: "S201", name: "Chamfer of the upper right corner to any height" },
      { code: "TS100", name: "Upper-Left corner – cutting" }
    ]},
    { group: "2 Cuts", options: [
      { code: "S300", name: "Cut of the upper corners" }
    ]},
    { group: "Triangles", options: [
      { code: "T100", name: "Rectangular triangle" },
      { code: "T200", name: "Isosceles triangle / triangle with tilted tip" }
    ]},
    { group: "Arches", options: [
      { code: "L100", name: "Segmental arch" },
      { code: "L101", name: "Segmental arch to the top" },
      { code: "L200", name: "Full arch" },
      { code: "L201", name: "Full arch to the top" },
      { code: "L300", name: "Sharp arch" }
    ]},
    { group: "Various", options: [
      { code: "K100", name: "Circle" },
      { code: "S500", name: "Chamfer of the selected corners" }
    ]}
  ];

  const DRUTEX_CATEGORIES = [
    { id: 'WINDOWS', icon: IconWindows, label: t('header.megaMenu.cats.windows', 'WINDOWS') },
    { id: 'DOORS', icon: IconDoors, label: t('header.megaMenu.cats.doors', 'DOORS') },
    { id: 'TERRACE SYSTEMS', icon: IconPatioDoors, label: t('header.megaMenu.cats.terrace', 'TERRACE SYSTEMS') },
    { id: 'SHUTTERS', icon: IconRollerShutters, label: t('header.megaMenu.cats.shutters', 'SHUTTERS') },
    { id: 'EXTERIOR VENETIAN BLINDS', icon: IconExteriorBlinds, label: t('header.megaMenu.cats.facade', 'EXTERIOR VENETIAN BLINDS') },
    { id: 'INSECT SCREENS', icon: IconMosquitoNets, label: t('header.megaMenu.cats.mosquito', 'INSECT SCREENS') },
    { id: 'GARAGE DOORS', icon: IconGarageDoors, label: t('header.megaMenu.cats.garage', 'GARAGE DOORS') },
    { id: 'FACADES / WINTER GARDENS', icon: IconConservatories, label: t('header.megaMenu.cats.conservatories', 'FACADES / WINTER GARDENS') },
    { id: 'PERGOLA', icon: IconPergola, label: t('header.megaMenu.cats.pergola', 'PERGOLA') },
    { id: 'SMART HOME', icon: IconSmartHome, label: t('header.megaMenu.cats.smart', 'SMART HOME') },
  ];

  const PRODUCT_CATEGORIES = [
    {
      group: 'WINDOWS',
      subgroups: [
        {
          name: t('header.megaMenu.cols.pvcWindows', 'PVC WINDOWS'),
          options: [
            { val: "1600", label: "IGLO EDGE (new)" },
            { val: "1300", label: "IGLO ENERGY" },
            { val: "1310", label: "IGLO ENERGY CLASSIC" },
            { val: "1360", label: "IGLO ENERGY ALUCOVER" },
            { val: "1100", label: "IGLO 5" },
            { val: "1110", label: "IGLO 5 CLASSIC" },
            { val: "1200", label: "IGLO LIGHT" },
            { val: "1400", label: "IGLO EXT" },
            { val: "1500", label: "IGLO PREMIER" },
            { val: "1700", label: "IDEAL NEO 76 AD" },
            { val: "1710", label: "IDEAL NEO 76 MD" },
            { val: "1720", label: "IDEAL NEO 76 MD RENO" },
            { val: "1730", label: "IDEAL NEO 76 MD MONO" },
            { val: "1750", label: "IDEAL 7000 NL" },
            { val: "1756", label: "IDEAL 7000 NL (OKNA OTW NA ZEWN)" }
          ]
        },
        {
          name: t('header.megaMenu.cols.alumWindows', 'ALUMINIUM WINDOWS'),
          options: [
            { val: "3350", label: "MB-86N SI" },
            { val: "3200", label: "MB-79N SI" },
            { val: "3150", label: "MB-70HI / MB-70" },
            { val: "3100", label: "MB-45" }
          ]
        },
        {
          name: t('header.megaMenu.cols.woodWindows', 'WOODEN WINDOWS'),
          options: [
            { val: "2100", label: "SOFTLINE 68" },
            { val: "2200", label: "SOFTLINE 78" },
            { val: "2300", label: "SOFTLINE 88" }
          ]
        },
        {
          name: t('header.megaMenu.cols.woodAlumWindows', 'WOOD-ALUMINIUM WINDOWS'),
          options: [
            { val: "2600", label: "DUOLINE 68" },
            { val: "2700", label: "DUOLINE 78" },
            { val: "2800", label: "DUOLINE 88" }
          ]
        }
      ]
    },
    {
      group: 'DOORS',
      subgroups: [
        {
          name: t('header.megaMenu.cols.pvcDoors', 'PVC DOORS'),
          options: [
            { val: "1103", label: "IGLO 5" },
            { val: "1603", label: "IGLO EDGE (new)" },
            { val: "1303", label: "IGLO ENERGY" },
            { val: "1703", label: "IDEAL NEO 76 AD (DRZWI WEJŚCIOWE)" },
            { val: "1713", label: "IDEAL NEO 76 MD (FRONT DOOR)" },
            { val: "1723", label: "IDEAL NEO 76 MD RENO (DRZWI WEJŚCIOWE)" },
            { val: "1733", label: "IDEAL NEO 76 MD MONO (DRZWI WEJŚCIOWE)" },
            { val: "1753", label: "IDEAL 7000 NL (DRZWI WEJŚCIOWE)" }
          ]
        },
        {
          name: t('header.megaMenu.cols.alumDoors', 'ALUMINIUM DOORS'),
          options: [
            { val: "4044", label: "D-ART Line (new)" },
            { val: "3353", label: "MB-86N SI" },
            { val: "3203", label: "MB-79N SI+" },
            { val: "3153", label: "MB-70HI / MB-70" },
            { val: "3103", label: "MB-45" },
            { val: "3603", label: "MB-78EI Fire-Doors" },
            { val: "3450", label: "PIVOT" }
          ]
        },
        {
          name: t('home.categories.items.wooden', 'WOODEN') + ' ' + t('header.megaMenu.cats.doors', 'DOORS'),
          options: [
            { val: "2103", label: "SOFTLINE 68" },
            { val: "2203", label: "SOFTLINE 78" },
            { val: "2303", label: "SOFTLINE 88" }
          ]
        }
      ]
    },
    {
      group: 'TERRACE SYSTEMS',
      subgroups: [
        {
          name: t('home.categories.items.liftSlide', 'LIFT AND SLIDE HS'),
          options: [
            { val: "1004", label: "IGLO-HS" },
            { val: "1014", label: "IGLO-HS ALUCOVER" },
            { val: "3804", label: "MB-77HS HI" },
            { val: "3854", label: "MB-77HS HI MONORAIL" },
            { val: "3900", label: "MB-59HS HI" },
            { val: "2104", label: "SOFTLINE HS (68)" },
            { val: "2604", label: "DUOLINE HS (68)" }
          ]
        },
        {
          name: t('home.categories.items.slide', 'SLIDE'),
          options: [
            { val: "1007", label: "IGLO EDGE SLIDE (new)" },
            { val: "1005", label: "IGLO SLIDE" },
            { val: "3814", label: "MB-SLIDE" },
            { val: "3904", label: "COR VISION (new) / COR VISION PLUS" }
          ]
        },
        {
          name: t('home.categories.items.folding', 'FOLDING DOORS'),
          options: [
            { val: "3909", label: "MB-86 FOLD LINE HD" },
            { val: "2108", label: "SOFTLINE 68" }
          ]
        },
        {
          name: t('home.categories.items.tiltSlide', 'TILT AND SLIDE PSK'),
          options: [
            { val: "1301", label: "IGLO ENERGY PSK" },
            { val: "1311", label: "IGLO ENERGY CLASSIC PSK" },
            { val: "1101", label: "IGLO 5 PSK" },
            { val: "1701", label: "IDEAL NEO 76 AD PSK" },
            { val: "1711", label: "IDEAL NEO 76 MD PSK" },
            { val: "1721", label: "IDEAL NEO 76 MD RENO PSK" },
            { val: "1731", label: "IDEAL NEO 76 MD MONO PSK" },
            { val: "1751", label: "IDEAL 7000 NL PSK" }
          ]
        }
      ]
    }
  ];


  const SYSTEM_CODE_MAP: Record<string, string> = {
    "1100": "IG5",
    "1101": "IG5 PP PSK",
    "1103": "IG5",
    "1110": "IG5CL",
    "1300": "IGE",
    "1310": "IGECL",
    "3350": "MB86N",
    "3904": "CVP"
  };

  // Helper for generic unmapped dropdowns
  const GenericSelect = ({ label, value, onChange, options }: { label: string, value: string, onChange: (v: string) => void, options?: {value: string, label: string}[] }) => (
    <div>
      <label className={`block text-[10px] font-bold mb-1 uppercase ${isLight ? 'text-zinc-500' : 'text-gray-400'}`}>{label}</label>
      <select className={`w-full rounded p-2 text-sm focus:outline-none border ${
        isLight ? 'bg-white border-zinc-300 text-black focus:border-black' : 'bg-mammut-black border-gray-800 text-mammut-white focus:border-mammut-gold'
      }`}
        value={value} onChange={e => onChange(e.target.value)}>
        <option value="">Lack (-)</option>
        {options ? options.map(o => <option key={o.value} value={o.value}>{o.label}</option>) : (
          <>
            <option value="opt1">Standard Option 1</option>
            <option value="opt2">Standard Option 2</option>
          </>
        )}
      </select>
    </div>
  );

  // Helper for color dropdowns with swatches
  const ColorSelect = ({ label, value, onChange, groupedOptions }: { label: string, value: string, onChange: (v: string) => void, groupedOptions: any }) => {
    const [isOpen, setIsOpen] = useState(false);
    const flatOpts = Object.values(groupedOptions).flat() as any[];
    const activeOpt = flatOpts.find(o => o.code === value);

    return (
      <div className="relative z-20">
        <label className={`block text-[10px] font-bold mb-1 uppercase ${isLight ? 'text-zinc-500' : 'text-gray-400'}`}>{label}</label>
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full rounded p-2 text-sm cursor-pointer flex items-center justify-between transition-colors h-[38px] border ${
            isLight ? 'bg-white border-zinc-300 text-black hover:border-black' : 'bg-mammut-black border-gray-800 text-mammut-white hover:border-mammut-gold'
          }`}
        >
          <div className="flex items-center gap-3">
             {activeOpt && activeOpt.swatchUrl ? (
                <div className={`w-5 h-5 rounded-sm border shadow-inner ${isLight ? 'border-zinc-300' : 'border-gray-600'}`} style={{ backgroundImage: `url(${activeOpt.swatchUrl})`, backgroundSize: 'cover' }}></div>
             ) : (
                <div className={`w-5 h-5 rounded-sm border shadow-inner ${isLight ? 'border-zinc-300 bg-zinc-100' : 'border-gray-600 bg-gray-800'}`}></div>
             )}
             <span>{activeOpt ? `${activeOpt.code} - ${activeOpt.name}` : '-- Default --'}</span>
          </div>
          <span className="text-gray-500 text-xs">▼</span>
        </div>
        
        {isOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)}></div>
            <div className={`absolute top-full left-0 mt-1 w-full border rounded-lg shadow-2xl z-40 max-h-[300px] overflow-y-auto ${
              isLight ? 'bg-white border-zinc-300 text-black shadow-lg' : 'bg-mammut-dark border-gray-700 text-mammut-white shadow-2xl'
            }`}>
              <div 
                onClick={() => { onChange(''); setIsOpen(false); }} 
                className={`p-2 cursor-pointer flex items-center gap-3 border-b text-sm ${
                  isLight ? 'hover:bg-zinc-100 border-zinc-200' : 'hover:bg-mammut-gold/20 border-gray-800'
                }`}
              >
                 <div className={`w-5 h-5 rounded-sm border shadow-inner ${isLight ? 'border-zinc-300 bg-zinc-105' : 'border-gray-600 bg-gray-800'}`}></div>
                 <span>-- Default --</span>
              </div>
              {Object.entries(groupedOptions).map(([group, opts]: any) => (
                <div key={group}>
                  <div className={`p-1 px-2 text-[10px] font-bold uppercase tracking-wide border-y sticky top-0 z-10 shadow-sm ${
                    isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-600' : 'bg-mammut-black border-gray-800 text-mammut-gold'
                  }`}>
                    {group}
                  </div>
                  {opts.map((opt: any) => (
                    <div 
                      key={opt.code} 
                      onClick={() => { onChange(opt.code); setIsOpen(false); }} 
                      className={`p-2 cursor-pointer flex items-center gap-3 border-b transition-colors text-sm ${
                        isLight ? 'hover:bg-zinc-100 border-zinc-200' : 'hover:bg-mammut-gold/20 border-gray-800'
                      }`}
                    >
                       {opt.swatchUrl ? (
                         <div className={`w-5 h-5 rounded-sm border shadow-inner shrink-0 ${isLight ? 'border-zinc-300' : 'border-gray-600'}`} style={{ backgroundImage: `url(${opt.swatchUrl})`, backgroundSize: 'cover' }}></div>
                       ) : (
                         <div className={`w-5 h-5 rounded-sm border shadow-inner shrink-0 ${isLight ? 'border-zinc-300 bg-zinc-100' : 'border-gray-600 bg-gray-800'}`}></div>
                       )}
                       <div className="flex flex-col">
                         <span>{opt.code} - {opt.name}</span>
                       </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  const [sceneGroup, setSceneGroup] = useState<{group: THREE.Group, ts: number} | null>(null);

  // Summary helpers for accordions
  const getProductSummary = () => {
    const sysName = PRODUCT_CATEGORIES
      .flatMap(c => c.subgroups.flatMap(sg => sg.options))
      .find(o => o.val === profilsatz)?.label || profilsatz;
    return `${typology} (${sysName}), ${width} × ${height} mm`;
  };

  const getColorsSummary = () => {
    if (colorType === 'W-W') return 'W-W (White / White)';
    const extName = IGLO_EDGE_COLORS.find(c => c.id.replace('c', '').padStart(4, '0') === colorCode.padStart(4, '0'))?.name || colorCode;
    const intName = IGLO_EDGE_COLORS.find(c => c.id.replace('c', '').padStart(4, '0') === interiorColorCode.padStart(4, '0'))?.name || interiorColorCode;
    return `${colorType} [Ext: ${extName}, Int: ${intName}]`;
  };

  const getGlazingSummary = () => {
    return infills.map((inf, idx) => {
      const spacerName = FRAME_STYLES.find(fs => fs.code === inf.frameStyle)?.name || 'Default';
      return `Pane ${idx + 1}: ${inf.code} (${spacerName})`;
    }).join(' | ');
  };

  const getHardwareSummary = () => {
    const handleName = HANDLE_OPTIONS.find(h => h.code === handleType)?.name || handleType;
    const modelName = WINDOW_MODELS.flatMap(m => m.options).find(o => o.code === model)?.name || 'Standard';
    return `Safety: ${safetyClass || 'Standard'}, Model: ${modelName}, Handle: ${handleName}`;
  };

  const getShuttersSummary = () => {
    if (!includeShutter) return 'No Shutter';
    const typeLabel = shutterLookups.rollerBlindTypes.find(o => o.value === rollerBlindType)?.label || 'Standard';
    return `${typeLabel} Shutter`;
  };

  const getInstallationSummary = () => {
    const dowels = dowelHoles ? `Dowels: ${dowelHoles}` : 'No Dowels';
    const grilles = grilleType ? `Grilles: ${grilleType}` : 'No Grilles';
    const gasket = sealColor ? `Seal: ${sealColor}` : 'Default Seal';
    return `${dowels}, ${grilles}, ${gasket}`;
  };

  const renderVisualizer = () => {
    return (
      <div className="w-full mt-2">
        {(['F100', 'F101', 'F102', 'F103', 'F104', 'F105', 'F106'].includes(typology)) ? (
          <div 
            style={{
              backgroundColor: isLight ? '#ffffff' : 'var(--theme-mammut-dark)',
              borderColor: isLight ? '#cbd5e1' : 'var(--theme-mammut-border)'
            }}
            className="visualizer-container w-full aspect-square rounded-lg flex items-center justify-center pt-12 pb-[48px] pl-[48px] pr-2 md:pt-14 md:pb-[65px] md:pl-[65px] md:pr-4 overflow-hidden shadow-inner relative group border"
          >
             {/* 3D Toggle */}
             <div className="absolute top-2 left-2 z-30 bg-black/50 p-1 rounded flex items-center gap-2">
                <button onClick={() => setIs3dMode(false)} className={`px-2 py-1 text-xs font-bold rounded ${!is3dMode ? 'bg-mammut-gold text-black' : (isLight ? 'text-slate-500 hover:text-black' : 'text-gray-400')}`}>2D</button>
                <button onClick={() => setIs3dMode(true)} className={`px-2 py-1 text-xs font-bold rounded ${is3dMode ? 'bg-mammut-gold text-black' : (isLight ? 'text-slate-500 hover:text-black' : 'text-gray-400')}`}>3D</button>
                {is3dMode && (
                  <>
                    <div className="w-[1px] h-4 bg-gray-800 mx-1"></div>
                    <button 
                      onClick={handleDownload} 
                      className="p-1 text-gray-400 hover:text-mammut-gold transition-colors flex items-center justify-center"
                      title="Download snapshot"
                    >
                      <Download size={14} />
                    </button>
                    <button 
                      onClick={handleShare} 
                      className="p-1 text-gray-400 hover:text-mammut-gold transition-colors flex items-center justify-center"
                      title="Share configuration"
                    >
                      <Share2 size={14} />
                    </button>
                    <label 
                      className="p-1 !text-gray-400 hover:!text-mammut-gold transition-colors flex items-center justify-center cursor-pointer"
                      title="Upload photo / Use Camera"
                    >
                      <Camera size={14} />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const dataUrl = event.target?.result as string;
                              setCustomBackground(dataUrl);
                              setScenery('custom');
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    {customBackground && (
                      <button 
                        onClick={() => {
                          setCustomBackground(null);
                          if (scenery === 'custom') {
                            setScenery('studio-grey');
                          }
                        }}
                        className="p-1 text-red-400 hover:text-red-300 transition-colors flex items-center justify-center"
                        title="Remove custom background"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </>
                )}
             </div>

             {/* Inside/Outside View Side Toggle (Move inside visualizer frame & hide in 3D Mode) */}
             {!is3dMode && (
                <div className="absolute top-2 right-2 z-30 flex bg-black/50 rounded p-1 border border-gray-800 shadow-xl gap-1">
                   <button 
                     onClick={() => setViewSide('interior')}
                     className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded transition-colors ${viewSide === 'interior' ? 'bg-mammut-gold text-black' : 'text-gray-400 hover:text-white'}`}
                   >
                     {t('configurator.viewSide.inside', 'Inside')}
                   </button>
                   <button 
                     onClick={() => setViewSide('exterior')}
                     className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded transition-colors ${viewSide === 'exterior' ? 'bg-mammut-gold text-black' : 'text-gray-400 hover:text-white'}`}
                   >
                     {t('configurator.viewSide.outside', 'Outside')}
                   </button>
                </div>
             )}

             {/* 3D Navigation Hint (Centered curved arrows + "3D" text) */}
             {is3dMode && (
               <div className="absolute bottom-14 md:bottom-20 left-1/2 -translate-x-1/2 pointer-events-none z-20 transition-opacity duration-500 opacity-100 group-hover:opacity-0 nav-hint select-none">
                 <div className="bg-black/60 border border-white/10 rounded-full p-2 flex flex-col items-center justify-center shadow-2xl backdrop-blur-sm">
                   <svg viewBox="0 0 100 50" className="w-10 h-5 text-gray-400 animate-pulse opacity-90">
                     {/* Curved double-ended arrow */}
                     <path d="M 15,35 C 25,47 75,47 85,35" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                     <path d="M 80,38 L 85,35 L 83,29" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                     <path d="M 20,38 L 15,35 L 17,29" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                     <text x="50" y="24" fontFamily="Montserrat, sans-serif" fontSize="22" fontWeight="900" textAnchor="middle" fill="currentColor">3D</text>
                   </svg>
                 </div>
               </div>
             )}

             {/* Vertical Scroll Wheel (Height) overlay on the left */}
              <div className="absolute left-3 md:left-4 top-12 md:top-14 bottom-[60px] md:bottom-[80px] w-5 md:w-[28px] z-30 flex items-center justify-center font-mono">
                 <NumericScrollWheel
                   label="Height"
                   value={height}
                   onChange={setHeight}
                   min={500}
                   max={3000}
                   step={10}
                   orientation="vertical"
                   labelPosition="inside"
                 />
              </div>

              {/* Horizontal Scroll Wheel (Width) overlay at the bottom */}
              <div className="absolute bottom-3 md:bottom-4 left-[60px] md:left-[80px] right-3 md:right-4 h-5 md:h-[28px] z-30 flex items-center justify-center font-mono">
                 <NumericScrollWheel
                   label="Width"
                   value={width}
                   onChange={setWidth}
                   min={500}
                   max={3000}
                   step={10}
                   orientation="horizontal"
                   labelPosition="inside"
                 />
              </div>

             {/* Scenery Selector - always visible in 3D mode */}
             {is3dMode && (
                  <div 
                    ref={sceneryMenuRef}
                    className={`absolute bottom-3 md:bottom-4 md:right-18 z-35 flex flex-col gap-2 ${
                      isSceneryMenuOpen 
                        ? 'left-3 right-3 items-center' 
                        : 'right-15 items-end'
                    } md:left-auto md:right-18 md:items-end`}
                  >
                     <div className={`flex items-center bg-mammut-black/90 border border-gray-800 backdrop-blur-md rounded-2xl shadow-lg transition-all duration-300 ${
                       isSceneryMenuOpen 
                         ? 'w-full md:w-auto max-w-[700px] p-3 md:p-4 gap-4 justify-between md:justify-start' 
                         : 'max-w-[44px] max-h-[44px] px-0.5 py-0.5 overflow-hidden'
                     }`}>
                      
                      {/* Expanded Scenery Groups */}
                      {isSceneryMenuOpen && (
                        <div className="flex flex-nowrap overflow-x-auto scrollbar-none items-start justify-start gap-4 text-xs select-none w-full py-1">
                          {/* Studio Category */}
                          <div className="flex flex-col gap-1 items-center border-r border-gray-800 pr-4 shrink-0">
                            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Studio</span>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => { setScenery('studio-grey'); setIsSceneryMenuOpen(false); }}
                                className={`w-24 h-24 rounded-xl bg-slate-300 transition-all active:scale-95 cursor-pointer ${
                                  scenery === 'studio-grey' 
                                    ? 'scale-110 shadow-lg shadow-mammut-gold/40 z-10' 
                                    : ''
                                }`}
                                title="Studio Grey"
                              />
                              <button 
                                onClick={() => { setScenery('studio-dark'); setIsSceneryMenuOpen(false); }}
                                className={`w-24 h-24 rounded-xl bg-zinc-800 transition-all active:scale-95 cursor-pointer ${
                                  scenery === 'studio-dark' 
                                    ? 'scale-110 shadow-lg shadow-mammut-gold/40 z-10' 
                                    : ''
                                }`}
                                title="Dark Studio"
                              />
                            </div>
                          </div>

                          {/* Home Category (Wall Cutouts) */}
                          <div className="flex flex-col gap-1 items-center border-r border-gray-800 pr-4 shrink-0">
                            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Home</span>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => { setScenery('modern-minimalist'); setIsSceneryMenuOpen(false); }}
                                className={`w-24 h-24 rounded-xl bg-slate-100 transition-all active:scale-95 relative overflow-hidden cursor-pointer ${
                                  scenery === 'modern-minimalist' 
                                    ? 'scale-110 shadow-lg shadow-mammut-gold/40 z-10' 
                                    : ''
                                }`}
                                title="Modern Plaster Wall"
                              >
                                <div className="absolute inset-0 bg-cover" style={{ backgroundImage: "url('/assets/scenery/concrete_wall.png')" }} />
                              </button>
                              <button 
                                onClick={() => { setScenery('warm-nordic'); setIsSceneryMenuOpen(false); }}
                                className={`w-24 h-24 rounded-xl bg-orange-200 transition-all active:scale-95 relative overflow-hidden cursor-pointer ${
                                  scenery === 'warm-nordic' 
                                    ? 'scale-110 shadow-lg shadow-mammut-gold/40 z-10' 
                                    : ''
                                }`}
                                title="Nordic Wood Planking"
                              >
                                <div className="absolute inset-0 bg-cover" style={{ backgroundImage: "url('/assets/scenery/wood_wall.png')" }} />
                              </button>
                              <button 
                                onClick={() => { setScenery('industrial-loft'); setIsSceneryMenuOpen(false); }}
                                className={`w-24 h-24 rounded-xl bg-red-800 transition-all active:scale-95 relative overflow-hidden cursor-pointer ${
                                  scenery === 'industrial-loft' 
                                    ? 'scale-110 shadow-lg shadow-mammut-gold/40 z-10' 
                                    : ''
                                }`}
                                title="Industrial Brick Wall"
                              >
                                <div className="absolute inset-0 bg-cover" style={{ backgroundImage: "url('/assets/scenery/brick_wall.png')" }} />
                              </button>
                            </div>
                          </div>

                          {/* Nature Category */}
                          <div className="flex flex-col gap-1 items-center border-r border-gray-800 pr-4 shrink-0">
                            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Nature</span>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => { setScenery('suburban-garden'); setIsSceneryMenuOpen(false); }}
                                className={`w-24 h-24 rounded-xl bg-emerald-500 transition-all active:scale-95 relative overflow-hidden cursor-pointer ${
                                  scenery === 'suburban-garden' 
                                    ? 'scale-110 shadow-lg shadow-mammut-gold/40 z-10' 
                                    : ''
                                }`}
                                title="Suburban Garden"
                              >
                                <div className="absolute inset-0 bg-cover" style={{ backgroundImage: "url('/assets/scenery/garden_backdrop.png')" }} />
                              </button>
                              <button 
                                onClick={() => { setScenery('nordic-forest'); setIsSceneryMenuOpen(false); }}
                                className={`w-24 h-24 rounded-xl bg-teal-800 transition-all active:scale-95 relative overflow-hidden cursor-pointer ${
                                  scenery === 'nordic-forest' 
                                    ? 'scale-110 shadow-lg shadow-mammut-gold/40 z-10' 
                                    : ''
                                }`}
                                title="Nordic Forest"
                              >
                                <div className="absolute inset-0 bg-cover" style={{ backgroundImage: "url('/assets/scenery/forest_backdrop.png')" }} />
                              </button>
                            </div>
                          </div>

                          {/* City Category */}
                          <div className="flex flex-col gap-1 items-center border-r border-gray-800 pr-4 shrink-0">
                            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">City</span>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => { setScenery('urban-skyline'); setIsSceneryMenuOpen(false); }}
                                className={`w-24 h-24 rounded-xl bg-purple-700 transition-all active:scale-95 relative overflow-hidden cursor-pointer ${
                                  scenery === 'urban-skyline' 
                                    ? 'scale-110 shadow-lg shadow-mammut-gold/40 z-10' 
                                    : ''
                                }`}
                                title="Urban Skyline"
                              >
                                <div className="absolute inset-0 bg-cover" style={{ backgroundImage: "url('/assets/scenery/skyline_backdrop.png')" }} />
                              </button>
                              <button 
                                onClick={() => { setScenery('coastal-mediterranean'); setIsSceneryMenuOpen(false); }}
                                className={`w-24 h-24 rounded-xl bg-sky-400 transition-all active:scale-95 relative overflow-hidden cursor-pointer ${
                                  scenery === 'coastal-mediterranean' 
                                    ? 'scale-110 shadow-lg shadow-mammut-gold/40 z-10' 
                                    : ''
                                }`}
                                title="Coastal Sea"
                              >
                                <div className="absolute inset-0 bg-cover" style={{ backgroundImage: "url('/assets/scenery/coastal_backdrop.png')" }} />
                              </button>
                            </div>
                          </div>

                          {/* Custom Category */}
                          <div className="flex flex-col gap-1 items-center shrink-0">
                            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Custom</span>
                            <div className="flex gap-2">
                              <label 
                                className={`w-24 h-24 rounded-xl flex items-center justify-center transition-all active:scale-95 cursor-pointer relative overflow-hidden ${
                                  scenery === 'custom' 
                                    ? 'bg-mammut-gold/20 text-mammut-gold scale-110 shadow-lg shadow-mammut-gold/40 z-10' 
                                    : 'bg-transparent text-gray-400 hover:text-white'
                                }`}
                                title="Upload Custom Photo / Use Camera"
                              >
                                {customBackground ? (
                                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${customBackground})` }} />
                                ) : (
                                  <Camera size={48} strokeWidth={2.5} />
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (event) => {
                                        const dataUrl = event.target?.result as string;
                                        setCustomBackground(dataUrl);
                                        setScenery('custom');
                                        setIsSceneryMenuOpen(false);
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </label>
                              <button
                                onClick={() => {
                                  setScenery('studio-grey');
                                  setCustomBackground(null);
                                  setIsSceneryMenuOpen(false);
                                }}
                                className="w-24 h-24 rounded-xl bg-transparent text-gray-400 hover:text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                                title="Reset scenery to default"
                              >
                                <RotateCcw size={48} strokeWidth={2.5} />
                              </button>
                              {customBackground && (
                                <button
                                  onClick={() => {
                                    setCustomBackground(null);
                                    if (scenery === 'custom') {
                                      setScenery('studio-grey');
                                    }
                                    setIsSceneryMenuOpen(false);
                                  }}
                                  className="w-24 h-24 rounded-xl bg-transparent text-red-400 hover:text-red-300 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                                  title="Remove custom background"
                                >
                                  <Trash2 size={48} strokeWidth={2.5} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Main Landscape Trigger button */}
                      <button 
                        onClick={() => setIsSceneryMenuOpen(prev => !prev)} 
                        className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all active:scale-90 cursor-pointer shrink-0 ${
                          isSceneryMenuOpen 
                            ? 'bg-white/10 text-white hover:bg-white/20' 
                            : 'bg-transparent text-gray-400 hover:bg-mammut-gold hover:text-black'
                        }`}
                        title="Environment Scenery Options"
                      >
                        {/* Landscape Mountains & Sun SVG icon */}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      </button>
                      
                    </div>
                  </div>
              )}

             {/* AR Buttons - always visible in 3D mode */}
             {is3dMode && (
                  <div 
                    ref={arMenuRef}
                    className="absolute bottom-3 right-3 md:bottom-4 md:right-4 z-35 flex items-center justify-end"
                    onMouseEnter={() => setArMenuOpen(true)}
                    onMouseLeave={() => setArMenuOpen(false)}
                  >
                     <div className={`flex items-center bg-mammut-black/90 border border-gray-800 backdrop-blur-md rounded-xl shadow-lg transition-all duration-300 ${
                       arMenuOpen ? 'max-w-[320px] px-2 py-1.5 gap-2' : 'max-w-[44px] px-0.5 py-0.5'
                     } overflow-hidden`}>
                       
                       {/* Expanded options */}
                       {arMenuOpen && (
                         <div className="flex items-center gap-1.5 whitespace-nowrap">
                           {/* AR Wall button */}
                           <button 
                             onClick={() => {
                               setArPlacement('wall');
                               setArMenuOpen(false);
                             }} 
                             className="h-9 flex items-center gap-1.5 px-3 bg-white/5 hover:bg-mammut-gold hover:text-black text-mammut-gold rounded-lg transition-all active:scale-95 cursor-pointer text-[10px] font-black uppercase tracking-wider"
                             title="AR Wall"
                           >
                             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                               <path strokeLinecap="round" strokeLinejoin="round" d="M6 3v18l12-3V6L6 3z" fill="currentColor" fillOpacity={0.1} />
                               <path d="M6 8l12-1.5M6 13l12-2M6 17l12-2.5" strokeOpacity={0.4} />
                             </svg>
                             Wall
                           </button>

                           {/* AR Floor button */}
                           <button 
                             onClick={() => {
                               setArPlacement('floor');
                               setArMenuOpen(false);
                             }} 
                             className="h-9 flex items-center gap-1.5 px-3 bg-white/5 hover:bg-white hover:text-black text-white rounded-lg transition-all active:scale-95 cursor-pointer text-[10px] font-black uppercase tracking-wider"
                             title="AR Floor"
                           >
                             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                               <path strokeLinecap="round" strokeLinejoin="round" d="M4 18h16l-3-8H7l-3 8z" fill="currentColor" fillOpacity={0.1} />
                               <path d="M10 10l-2.5 8M14 10l2.5 8M6.5 13.5h11" strokeOpacity={0.4} />
                             </svg>
                             Floor
                           </button>
                         </div>
                       )}

                       {/* Main AR Trigger button */}
                       <button 
                         onClick={() => setArMenuOpen(prev => !prev)} 
                         className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all active:scale-90 cursor-pointer shrink-0 ${
                           arMenuOpen 
                             ? 'bg-white/10 text-white hover:bg-white/20' 
                             : 'bg-transparent text-gray-400 hover:bg-mammut-gold hover:text-black'
                         }`}
                         title="AR Preview Options"
                       >
                         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                           <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" fillOpacity={0.1} />
                           <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                           <path d="M2 7v10M12 12v10M22 7v10" />
                         </svg>
                       </button>
                       
                     </div>
                  </div>
             )}

             {is3dMode ? (
                <ThreejsWindowEngine 
                  width={width} 
                  height={height} 
                  colorExt={extDetails.hex}
                  colorInt={intDetails.hex}
                  colorExtTexture={extDetails.textureUrl}
                  colorIntTexture={intDetails.textureUrl}
                  spacerColor={FRAME_STYLES.find(fs => fs.code === (infills[0]?.frameStyle || 'S'))?.hex || '#b0b5b9'}
                  onSceneReady={setSceneGroup}
                  typology={typology}
                  sealColor={sealColor}
                  scenery={scenery}
                  customBackground={customBackground || undefined}
                />
             ) : (
                <SvgWindowEngine 
                  width={width} 
                  height={height} 
                  colorExt={extDetails.hex}
                  colorExtTexture={extDetails.textureUrl}
                  colorInt={intDetails.hex}
                  colorIntTexture={intDetails.textureUrl}
                  viewSide={viewSide}
                  weldType={weld as any}
                  typology={typology}
                  sealColor={sealColor}
                />
             )}
          </div>
        ) : (
          <WindowVisualizer width={width} height={height} typology={typology} infills={infills} />
        )}
      </div>
    );
  };

  const renderLeftColumn = () => {
    if (isLight) {
      return null;
    }

    // Dark Mode: original vertical left column
    return (
      <div className="p-4 rounded-xl flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:max-h-[85vh] shrink-0 scrollbar-none snap-x snap-mandatory border shadow-2xl bg-mammut-darker border-gray-800">
        {DRUTEX_CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`group flex items-center gap-0 md:gap-4 p-3 md:px-4 md:py-3 rounded text-sm font-bold uppercase transition-all shrink-0 snap-start whitespace-nowrap md:whitespace-normal ${
                isActive
                  ? 'bg-mammut-black border border-mammut-gold text-mammut-white shadow-inner'
                  : 'bg-transparent text-gray-500 hover:text-mammut-white hover:bg-mammut-black'
              }`}
            >
              <Icon size={40} className={isActive ? 'text-mammut-gold' : 'text-gray-500'} />
              <span className="hidden md:block group-hover:block text-left text-[11px] tracking-wide leading-tight ml-0 group-hover:ml-2 md:ml-0">
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  const renderPricingCards = () => {
    const cardBg = isLight ? '#0f1115' : '#111112';
    const cardBorder = isLight ? 'border-zinc-800' : 'border-gray-800';

    return (
      <>
        {/* Pricing Summary Card */}
        <div 
          style={{ backgroundColor: cardBg }}
          className={`pricing-engine-card rounded-xl p-6 font-mono shrink-0 border shadow-lg text-slate-100 transition-all ${cardBorder}`}
        >
          <div className="border-b pb-3 mb-3 border-zinc-800">
            <h1 className="text-xl font-bold uppercase tracking-tighter text-slate-100">Cantor Pricing Engine</h1>
            <p className="text-[10px] mt-1 text-slate-400">Live calculation via SCHEMA 41 PREISE rules</p>
          </div>

          {loading && <div className="text-slate-400 text-sm py-4">Evaluating formulas...</div>}
          {error && <div className="text-red-400 text-sm py-4">Error: {error}</div>}
          {result && !error && (
            <>
              <div className="flex justify-between items-baseline pb-2">
                <span className="text-xs uppercase tracking-widest text-slate-400">SCHEMA 41 base (EK)</span>
                <span className="text-lg font-bold text-slate-100">{result.ek_pln.toFixed(2)} PLN</span>
              </div>
              <div className="flex justify-between items-baseline pb-3 border-b border-zinc-800">
                <span className="text-xs uppercase tracking-widest text-slate-400">PREISZYK × FAKTOR {result.faktor}</span>
                <span className="text-lg font-bold text-slate-100">{result.vk_pln.toFixed(2)} PLN</span>
              </div>
              <div className="flex justify-between items-center pt-3">
                <span className="font-bold tracking-widest uppercase text-slate-300">Dealer price ({result.currency}):</span>
                <span className="text-3xl font-black text-slate-100">{result.vk_local.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>

        {/* Pricing Ledger Card */}
        <div 
          style={{ backgroundColor: cardBg }}
          className={`pricing-ledger-card p-6 rounded-xl font-mono text-xs md:overflow-y-auto flex-1 border shadow-lg text-slate-100 transition-all ${cardBorder}`}
        >
          <div 
            style={{ backgroundColor: cardBg }}
            className="border-b-2 pb-2 mb-4 sticky top-0 z-10 border-zinc-800"
          >
            <h2 className="text-lg font-bold uppercase tracking-tighter text-slate-100">SCHEMA 41 ledger</h2>
            <div className="text-slate-400 mt-1 text-[10px]">One row per PREISE formula. GRPRS accumulates.</div>
          </div>

          {result && !error && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-zinc-800">
                  <th className="py-1 pr-2 text-slate-300">#</th>
                  <th className="py-1 pr-2 text-slate-300">Description</th>
                  <th className="py-1 pr-2 text-slate-300">Gruppe</th>
                  <th className="py-1 text-right text-slate-300">Value</th>
                </tr>
              </thead>
              <tbody>
                {result.lines.map((l, i) => (
                  <tr key={i} className={`border-b border-zinc-800/40 ${l.value !== 0 ? 'font-bold text-slate-100' : 'text-slate-500'}`}>
                    <td className="py-1 pr-2">{i + 1}</td>
                    <td className="py-1 pr-2">{l.formelText ?? '(no label)'}</td>
                    <td className="py-1 pr-2">{l.preisgruppe ?? '—'}</td>
                    <td className="py-1 text-right">{l.value.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-zinc-800 font-black text-slate-100">
                  <td colSpan={3} className="py-2">GRPRS total (EK PLN)</td>
                  <td className="py-2 text-right">{result.ek_pln.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          )}
          {!result && !error && !loading && <div className="text-slate-400">Waiting for first response...</div>}
        </div>
      </>
    );
  };

  const renderRightColumn = () => {
    const sysName = PRODUCT_CATEGORIES
      .flatMap(c => c.subgroups.flatMap(sg => sg.options))
      .find(o => o.val === profilsatz)?.label || profilsatz;

    // Both light and dark mode render the full Cantor pricing panel on desktop

    return (
      <div className="flex flex-col gap-6">
        {/* Mobile-only Pricing Card */}
        <div className="flex md:hidden flex-col gap-6">
          <div 
            style={{ backgroundColor: isLight ? '#0f1115' : '#111112' }}
            className={`pricing-engine-card rounded-xl p-6 font-mono border shadow-lg text-slate-100 transition-all ${isLight ? 'border-zinc-800' : 'border-gray-800'}`}
          >
            <div className="border-b pb-3 mb-3 border-zinc-800">
              <h1 className="text-xl font-bold uppercase tracking-tighter text-slate-100">{sysName}</h1>
              <p className="text-[10px] mt-1 text-slate-400">Configured Profile System</p>
            </div>
            {loading && <div className="text-slate-400 text-sm py-4">Evaluating price...</div>}
            {error && <div className="text-red-400 text-sm py-4">Error: {error}</div>}
            {result && !error && (
              <>
                <div className="flex justify-between items-baseline pb-2">
                  <span className="text-xs uppercase tracking-widest text-slate-400">Model & Size</span>
                  <span className="text-sm font-bold text-slate-100">{typology} ({width} × {height} mm)</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-zinc-800">
                  <span className="font-bold tracking-widest uppercase text-slate-300">Price:</span>
                  <span className="text-3xl font-black text-slate-100">{euroPrice.toFixed(2)} €</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Desktop or Mobile stacked cards */}
        <div className="flex flex-col gap-6 md:max-h-[85vh] flex-1">
          {renderPricingCards()}
        </div>
      </div>
    );
  };

  const renderMiddleColumn = () => {
    const sysName = PRODUCT_CATEGORIES
      .flatMap(c => c.subgroups.flatMap(sg => sg.options))
      .find(o => o.val === profilsatz)?.label || profilsatz;

    const flatModels = [
      { code: '', name: 'Standard (Rectangle)' },
      ...WINDOW_MODELS.flatMap(group => group.options)
    ];

    const sealOptions = [
      { code: '', name: 'Default / Standard' },
      { code: 'czarny', name: 'Black' },
      { code: 'czarny/sz', name: 'Out Black / In Grey' },
      { code: 'mix', name: 'Mix' },
      { code: 'szary', name: 'Gray' },
      { code: 'szary/czar', name: 'Out Grey / In Black' }
    ];

    if (isLight) {
      return (
        <div className="flex flex-col gap-4 sm:gap-5">

        {/* The 6 Collapsible Accordions */}
        <div className="configurator-accordions space-y-2">
          
          {/* 1. Product & Dimensions */}
          <AccordionSection
            id="product"
            title="1. Product & Dimensions"
            summary={getProductSummary()}
            isOpen={activeAccordion === 'product'}
            onToggle={() => setActiveAccordion(activeAccordion === 'product' ? null : 'product')}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Product opening/type Selector */}
              <div className="relative">
                <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wide ${isLight ? 'text-zinc-500' : 'text-gray-400'}`}>Product Number</label>
                <div 
                  onClick={() => setIsTypologyOpen(!isTypologyOpen)}
                  style={{
                    backgroundColor: isLight ? '#ffffff' : 'var(--theme-mammut-black)',
                    borderColor: isLight ? '#cbd5e1' : 'var(--theme-mammut-border)',
                    color: isLight ? '#0f172a' : 'var(--theme-text-base)'
                  }}
                  className="w-full rounded-xl p-3 cursor-pointer flex items-center justify-between transition-colors h-[54px] border hover:border-zinc-400"
                >
                  <div className="flex items-center gap-3">
                     <TypologyThumbnail 
                       id={typology}
                       className={`w-8 h-8 object-contain rounded bg-transparent border shrink-0 p-0.5 ${
                         isLight ? 'border-zinc-200' : 'border-gray-700'
                       }`}
                       hoverZoom={true}
                     />
                     <span className="font-bold text-sm" style={{ color: isLight ? '#0f172a' : 'inherit' }}>{typology}</span>
                  </div>
                  <span className={`${isLight ? 'text-zinc-400' : 'text-gray-500'} text-xs`}>▼</span>
                </div>
                
                {isTypologyOpen && (
                  <>
                    <div className="fixed inset-0 z-40 bg-black/60 md:bg-transparent" onClick={() => setIsTypologyOpen(false)}></div>
                    <div 
                      style={{
                        backgroundColor: isLight ? '#ffffff' : 'var(--theme-mammut-dark)',
                        borderColor: isLight ? '#cbd5e1' : 'var(--theme-mammut-border)',
                        color: isLight ? '#0f172a' : 'var(--theme-text-base)'
                      }}
                      className="fixed md:absolute top-1/2 md:top-full left-1/2 md:left-0 -translate-x-1/2 md:translate-x-0 -translate-y-1/2 md:translate-y-0 w-[92vw] md:w-[380px] mt-1 rounded-2xl shadow-2xl p-4 flex flex-col gap-3 border z-50"
                    >
                      <div className={`flex justify-between items-center border-b pb-2 mb-1 ${isLight ? 'border-zinc-200' : 'border-gray-850'}`}>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${isLight ? 'text-zinc-550' : 'text-gray-400'}`}>Select Window Type</span>
                        <button 
                          type="button"
                          onClick={() => setIsTypologyOpen(false)}
                          className={`transition-colors cursor-pointer text-sm font-bold p-1 leading-none select-none ${
                            isLight ? 'text-zinc-400 hover:text-black' : 'text-gray-500 hover:text-white'
                          }`}
                          title="Close"
                        >
                          ✕
                        </button>
                      </div>
                      <ScrollingDial 
                        value={typology}
                        onChange={(val) => setTypology(val)}
                        items={TYPOLOGY_GROUPS.flatMap(g => g.subgroups.flatMap(sg => sg.ids))}
                        onConfirm={() => setIsTypologyOpen(false)}
                        closeOnSelect={closeOnSelect}
                      />
                      <div className="flex items-center gap-2 px-1 py-0.5">
                        <input 
                          type="checkbox"
                          id="closeOnSelectCheckbox"
                          checked={closeOnSelect}
                          onChange={(e) => setCloseOnSelect(e.target.checked)}
                          className={`w-4 h-4 rounded cursor-pointer accent-black ${
                            isLight ? 'border-zinc-300 bg-white' : 'border-gray-700 bg-mammut-black focus:ring-mammut-gold'
                          }`}
                        />
                        <label 
                          htmlFor="closeOnSelectCheckbox" 
                          className={`text-xs font-semibold cursor-pointer select-none ${isLight ? 'text-zinc-700' : 'text-gray-300'}`}
                        >
                          {t('configurator.state.closeOnSelect')}
                        </label>
                      </div>
                      <button 
                        onClick={() => setIsTypologyOpen(false)}
                        className={`w-full font-black uppercase text-[11px] tracking-wider py-3 rounded-xl transition-all cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.98] ${
                          isLight ? 'bg-black text-white hover:bg-zinc-800' : 'bg-mammut-gold text-mammut-black hover:bg-[#ffc882]'
                        }`}
                      >
                        Confirm
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Profile System Dropdown */}
              <div>
                <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wide ${isLight ? 'text-zinc-500' : 'text-gray-400'}`}>Profile System</label>
                <select className={`w-full rounded-xl p-3 focus:outline-none h-[54px] text-sm border ${
                  isLight ? 'bg-white border-zinc-300 text-black focus:border-black' : 'bg-mammut-black border-gray-800 text-mammut-white focus:border-mammut-gold'
                }`}
                  value={profilsatz} onChange={e => setProfilsatz(e.target.value)}>
                  {PRODUCT_CATEGORIES.filter(c => c.group === activeCategory).map((category) => (
                    category.subgroups.map((subgroup, subgroupIndex) => (
                      <optgroup key={`${category.group}-${subgroupIndex}`} label={`${t('header.megaMenu.cats.' + category.group.toLowerCase().split(' ')[0], category.group)} — ${subgroup.name}`}>
                        {subgroup.options.map(opt => (
                          <option key={opt.val} value={opt.val}>{opt.val} — {opt.label}</option>
                        ))}
                      </optgroup>
                    ))
                  ))}
                </select>
              </div>

              {/* Manual Input with Micro-adjustment Arrows for Width and Height */}
              <div className="col-span-1 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DimensionAdjuster label="Width (mm)" value={width} onChange={setWidth} min={500} max={3000} isLight={false} />
                <DimensionAdjuster label="Height (mm)" value={height} onChange={setHeight} min={500} max={3000} isLight={false} />
              </div>
            </div>
          </AccordionSection>

          {/* 2. Colors & Finishes */}
          <AccordionSection
            id="colors"
            title="2. Colors & Finishes"
            summary={getColorsSummary()}
            isOpen={activeAccordion === 'colors'}
            onToggle={() => setActiveAccordion(activeAccordion === 'colors' ? null : 'colors')}
          >
            <div className="space-y-4">
              <SegmentedControl
                label="Color Style"
                value={colorType}
                onChange={setColorType}
                options={[
                  { value: 'W-W', label: 'W-W (White / White)' },
                  { value: 'DEK-DEK', label: 'DEK-DEK (Decor / Decor)' },
                  { value: 'W-DEK', label: 'W-DEK (White / Decor)' },
                  { value: 'DEK-W', label: 'DEK-W (Decor / White)' }
                ]}
                gridCols="grid-cols-2"
              />

              {colorType !== 'W-W' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-25 overflow-visible">
                  <ColorScrollWheel label="Exterior Color" value={colorCode} onChange={setColorCode} groupedOptions={groupedColors} showDefault={false} />
                  <ColorScrollWheel label="Interior Color" value={interiorColorCode} onChange={setInteriorColorCode} groupedOptions={groupedColors} showDefault={true} />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-center">
                  <label className={`flex items-center gap-3 text-sm cursor-pointer select-none ${
                    isLight ? 'text-zinc-800' : 'text-gray-300'
                  }`}>
                    <input 
                      type="checkbox" 
                      checked={overwriteCoreColor} 
                      onChange={e => setOverwriteCoreColor(e.target.checked)} 
                      className={`w-4.5 h-4.5 rounded cursor-pointer transition-colors ${
                        isLight 
                          ? 'border-zinc-300 bg-white text-black accent-black focus:ring-black' 
                          : 'border-gray-700 bg-mammut-black text-mammut-gold focus:ring-[#eab676]'
                      }`} 
                    />
                    Overwrite core color
                  </label>
                </div>
                {overwriteCoreColor && (
                  <ColorSelect label="Core Color" value={coreColor} onChange={setCoreColor} groupedOptions={groupedColors} />
                )}
              </div>
            </div>
          </AccordionSection>

          {/* 3. Glazing & Spacers */}
          <AccordionSection
            id="glazing"
            title="3. Glazing & Spacers"
            summary={getGlazingSummary()}
            isOpen={activeAccordion === 'glazing'}
            onToggle={() => setActiveAccordion(activeAccordion === 'glazing' ? null : 'glazing')}
          >
            {(typology.match(/^F2[0-5][0-9]$/) ? [0, 1] : [0]).map((infillIdx) => {
              const inf = infills[infillIdx];
              const updateInf = (field: string, val: string) => {
                const newInf = [...infills];
                newInf[infillIdx] = { ...newInf[infillIdx], [field]: val };
                setInfills(newInf);
              };
              
              const schemaPkg = CONFIG_SCHEMA.glazing.find(g => g.id === inf.code);
              const isFixed = !!schemaPkg?.fixedPanes;
              return (
                <div key={infillIdx} className={`border rounded-xl p-4 space-y-4 transition-colors ${
                  isLight ? 'border-zinc-200 bg-zinc-50/50' : 'border-gray-800/80 bg-mammut-black/20'
                }`}>
                  <div className={`font-bold text-xs uppercase tracking-wider ${isLight ? 'text-black' : 'text-mammut-gold'}`}>
                    Infill {typology.match(/^F2[0-5][0-9]$/) ? infillIdx + 1 : ''}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wide ${isLight ? 'text-zinc-500' : 'text-gray-400'}`}>Package Code</label>
                      <select className={`w-full rounded-xl p-3 text-sm h-[50px] focus:outline-none border transition-colors ${
                        isLight ? 'bg-white border-zinc-300 text-black focus:border-black' : 'bg-mammut-black border-gray-800 text-mammut-white focus:border-mammut-gold'
                      }`}
                        value={inf.code} onChange={e => {
                          const newCode = e.target.value;
                          const newInf = [...infills];
                          const updatedInf = { ...newInf[infillIdx], code: newCode };
                          
                          const selectedSchema = CONFIG_SCHEMA.glazing.find(g => g.id === newCode);
                          if (selectedSchema?.fixedPanes) {
                            updatedInf.pane1 = selectedSchema.fixedPanes[0] || '';
                            updatedInf.pane2 = selectedSchema.fixedPanes[1] || '';
                            updatedInf.pane3 = selectedSchema.fixedPanes[2] || '';
                          } else if (newCode.startsWith('2-')) {
                            updatedInf.pane1 = 'T4';
                            updatedInf.pane3 = 'FL4';
                            updatedInf.pane2 = '';
                          } else if (newCode.startsWith('3-')) {
                            updatedInf.pane1 = 'T4';
                            updatedInf.pane2 = 'FL4';
                            updatedInf.pane3 = 'T4';
                          } else {
                            updatedInf.pane1 = '';
                            updatedInf.pane2 = '';
                            updatedInf.pane3 = '';
                          }
                          
                          newInf[infillIdx] = updatedInf;
                          setInfills(newInf);
                        }}>
                        <optgroup label="Standard Glazing">
                          {CONFIG_SCHEMA.glazing
                             .filter(g => g.group !== 'Non Glazing' && g.group !== 'Fixed Pane Packages')
                             .filter(g => {
                               const limits = PROFILE_GLAZING_LIMITS[profilsatz] || PROFILE_GLAZING_LIMITS['DEFAULT'];
                               return limits.packages.includes(g.id);
                             })
                             .map(g => (
                               <option key={g.id} value={g.id}>{g.id} ({g.name})</option>
                          ))}
                        </optgroup>
                        <optgroup label="Fixed Pane Packages">
                          {CONFIG_SCHEMA.glazing
                             .filter(g => g.group === 'Fixed Pane Packages')
                             .filter(g => {
                               const limits = PROFILE_GLAZING_LIMITS[profilsatz] || PROFILE_GLAZING_LIMITS['DEFAULT'];
                               return limits.packages.includes(g.id);
                             })
                             .map(g => (
                               <option key={g.id} value={g.id}>{g.id} ({g.name})</option>
                          ))}
                        </optgroup>
                        <optgroup label="Non Glazing / Blinds">
                          {CONFIG_SCHEMA.glazing.filter(g => g.group === 'Non Glazing').map(g => (
                               <option key={g.id} value={g.id}>{g.id} ({g.name})</option>
                          ))}
                        </optgroup>
                      </select>
                    </div>

                    {typology.match(/^F2[0-5][0-9]$/) && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wide ${isLight ? 'text-zinc-500' : 'text-gray-400'}`}>Width (mm)</label>
                          <input type="number" className={`w-full rounded-xl p-3 text-sm h-[50px] focus:outline-none border transition-colors ${
                            isLight ? 'bg-white border-zinc-300 text-black focus:border-black' : 'bg-mammut-black border-gray-800 text-mammut-white focus:border-mammut-gold'
                          }`}
                            value={inf.width} onChange={e => updateInf('width', e.target.value)} placeholder="Auto" />
                        </div>
                        <div>
                          <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wide ${isLight ? 'text-zinc-500' : 'text-gray-400'}`}>Height (mm)</label>
                          <input type="number" className={`w-full rounded-xl p-3 text-sm h-[50px] focus:outline-none border transition-colors ${
                            isLight ? 'bg-white border-zinc-300 text-black focus:border-black' : 'bg-mammut-black border-gray-800 text-mammut-white focus:border-mammut-gold'
                          }`}
                            value={inf.height} onChange={e => updateInf('height', e.target.value)} placeholder="Auto" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Glass Outside */}
                    <div className="flex flex-col gap-1.5">
                      <label className={`block text-xs font-bold uppercase tracking-wide ${isLight ? 'text-zinc-500' : 'text-gray-400'}`}>Glass Outside</label>
                      <div className="flex gap-2">
                        <select disabled={isFixed} className={`flex-1 rounded-xl p-2.5 text-sm focus:outline-none disabled:opacity-50 h-[46px] border transition-colors ${
                          isLight ? 'bg-white border-zinc-300 text-black focus:border-black' : 'bg-mammut-black border-gray-800 text-mammut-white focus:border-mammut-gold'
                        }`}
                          value={inf.pane1} onChange={e => updateInf('pane1', e.target.value)}>
                          <option value="">-- None --</option>
                          {glazingOptions.outside.map(p => <option key={p.code} value={p.code}>{p.code} - {p.name}</option>)}
                        </select>
                        {inf.pane1 && (
                          <div className={`w-[46px] h-[46px] bg-white rounded-xl overflow-hidden flex items-center justify-center p-0.5 shrink-0 shadow-inner border transition-colors ${
                            isLight ? 'border-zinc-200' : 'border-gray-800'
                          }`}>
                            <img src={`/assets/glass/thumbs/${getPaneImage(inf.pane1)}`} alt={inf.pane1} className="max-h-full max-w-full object-cover mix-blend-multiply" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Glass Middle */}
                    {inf.code.startsWith('3-') && (
                      <div className="flex flex-col gap-1.5">
                        <label className={`block text-xs font-bold uppercase tracking-wide ${isLight ? 'text-zinc-500' : 'text-gray-400'}`}>Glass Middle</label>
                        <div className="flex gap-2">
                          <select disabled={isFixed} className={`flex-1 rounded-xl p-2.5 text-sm focus:outline-none disabled:opacity-50 h-[46px] border transition-colors ${
                            isLight ? 'bg-white border-zinc-300 text-black focus:border-black' : 'bg-mammut-black border-gray-800 text-mammut-white focus:border-mammut-gold'
                          }`}
                            value={inf.pane2} onChange={e => updateInf('pane2', e.target.value)}>
                            <option value="">-- None --</option>
                            {glazingOptions.middle.map(p => <option key={p.code} value={p.code}>{p.code} - {p.name}</option>)}
                          </select>
                          {inf.pane2 && (
                            <div className={`w-[46px] h-[46px] bg-white rounded-xl overflow-hidden flex items-center justify-center p-0.5 shrink-0 shadow-inner border transition-colors ${
                              isLight ? 'border-zinc-200' : 'border-gray-800'
                            }`}>
                              <img src={`/assets/glass/thumbs/${getPaneImage(inf.pane2)}`} alt={inf.pane2} className="max-h-full max-w-full object-cover mix-blend-multiply" />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Glass Inside */}
                    <div className="flex flex-col gap-1.5">
                      <label className={`block text-xs font-bold uppercase tracking-wide ${isLight ? 'text-zinc-500' : 'text-gray-400'}`}>Glass Inside</label>
                      <div className="flex gap-2">
                        <select disabled={isFixed} className={`flex-1 rounded-xl p-2.5 text-sm focus:outline-none disabled:opacity-50 h-[46px] border transition-colors ${
                          isLight ? 'bg-white border-zinc-300 text-black focus:border-black' : 'bg-mammut-black border-gray-800 text-mammut-white focus:border-mammut-gold'
                        }`}
                          value={inf.pane3} onChange={e => updateInf('pane3', e.target.value)}>
                          <option value="">-- None --</option>
                          {glazingOptions.inside.map(p => <option key={p.code} value={p.code}>{p.code} - {p.name}</option>)}
                        </select>
                        {inf.pane3 && (
                          <div className={`w-[46px] h-[46px] bg-white rounded-xl overflow-hidden flex items-center justify-center p-0.5 shrink-0 shadow-inner border transition-colors ${
                            isLight ? 'border-zinc-200' : 'border-gray-800'
                          }`}>
                            <img src={`/assets/glass/thumbs/${getPaneImage(inf.pane3)}`} alt={inf.pane3} className="max-h-full max-w-full object-cover mix-blend-multiply" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Spacer / Frame Style Scroll Wheel */}
                  <div className="pt-2">
                    <SpacerScrollWheel
                      label="Spacer Type"
                      value={inf.frameStyle}
                      onChange={val => updateInf('frameStyle', val)}
                      options={FRAME_STYLES}
                    />
                  </div>
                </div>
              );
            })}
          </AccordionSection>

          {/* 4. Hardware & Profile Options */}
          <AccordionSection
            id="hardware"
            title="4. Hardware & Profiles"
            summary={getHardwareSummary()}
            isOpen={activeAccordion === 'hardware'}
            onToggle={() => setActiveAccordion(activeAccordion === 'hardware' ? null : 'hardware')}
          >
            <div className="space-y-6">
              
              {/* Segmented Controls for low count options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                <SegmentedControl
                  label="Safety Class"
                  value={safetyClass}
                  onChange={setSafetyClass}
                  options={[
                    { value: '', label: 'Standard' },
                    { value: 'RC1', label: 'RC1' },
                    { value: 'RC2', label: 'RC2' },
                    { value: 'RC2N', label: 'RC2N' },
                    { value: '4ZA', label: '4ZA' }
                  ]}
                  gridCols="grid-cols-3 sm:grid-cols-5"
                />

                <SegmentedControl
                  label="Frame Profile"
                  value={frameProfile}
                  onChange={setFrameProfile}
                  options={[
                    { value: '50001', label: 'Standard' },
                    { value: '50002', label: 'Renovation' }
                  ]}
                />

                <div className="flex flex-col gap-2">
                  <SegmentedControl
                    label="Weld Type"
                    value={weld}
                    onChange={setWeld}
                    options={[
                      { value: 'standard', label: 'Standard' },
                      { value: 'v-perfect', label: 'V-Perfect' }
                    ]}
                  />
                  {weld && (
                    <div className={`bg-white rounded-xl overflow-hidden flex items-center justify-center p-1 w-32 h-20 self-start shadow-inner border transition-colors ${
                      isLight ? 'border-zinc-200' : 'border-gray-800'
                    }`}>
                      <img src={`/assets/welds/${weld}_weld.png`} alt={weld} className="max-h-full max-w-full object-contain mix-blend-multiply" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <SegmentedControl
                    label="Glazing Bead Style"
                    value={glazingBeadStyle}
                    onChange={setGlazingBeadStyle}
                    options={[
                      { value: 'Z', label: 'Rounded (Z)' },
                      { value: 'P', label: 'Rectangular (P)' }
                    ]}
                  />
                  {glazingBeadStyle && (
                    <div className={`bg-white rounded-xl overflow-hidden flex items-center justify-center p-1 w-32 h-20 self-start shadow-inner border transition-colors ${
                      isLight ? 'border-zinc-200' : 'border-gray-800'
                    }`}>
                      <img src={`/assets/beads/bead_${glazingBeadStyle}.png`} alt={glazingBeadStyle} className="max-h-full max-w-full object-contain mix-blend-multiply" />
                    </div>
                  )}
                </div>

                <SegmentedControl
                  label="Frame Reinforcement"
                  value={frameReinforcement}
                  onChange={setFrameReinforcement}
                  options={[
                    { value: 'standard', label: 'Standard' },
                    { value: 'full', label: 'Full Steel' }
                  ]}
                />
              </div>

              {/* Model Profile Carousel */}
              <div className="pt-2">
                <CarouselSelector
                  label="Model Profile"
                  value={model}
                  onChange={setModel}
                  options={flatModels}
                  getImagePath={opt => opt.code ? `${import.meta.env.BASE_URL}assets/models/${opt.code}.png` : ''}
                />
              </div>

              {/* Gasket / Seal Color Carousel */}
              <div className="pt-2">
                <CarouselSelector
                  label="Gasket / Seal Color"
                  value={sealColor}
                  onChange={setSealColor}
                  options={sealOptions}
                  getImagePath={opt => opt.code ? `${import.meta.env.BASE_URL}assets/seals/${opt.code === 'czarny/sz' ? 'czarny_sz' : opt.code === 'szary/czar' ? 'szary_czar' : opt.code}.png` : ''}
                />
              </div>

              {/* Hardware, Handles details dropdowns */}
              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4 transition-colors ${
                isLight ? 'border-zinc-200' : 'border-gray-800/60'
              }`}>
                <GenericSelect label="Hardware System" value={hardwareSystem} onChange={setHardwareSystem} />
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wide ${isLight ? 'text-zinc-500' : 'text-gray-400'}`}>Handle Color</label>
                    <select className={`w-full rounded-xl p-3 text-sm h-[50px] focus:outline-none border transition-colors ${
                      isLight ? 'bg-white border-zinc-300 text-black focus:border-black' : 'bg-mammut-black border-gray-800 text-mammut-white focus:border-mammut-gold'
                    }`}
                      value={handleColor} onChange={e => setHandleColor(e.target.value)}>
                       <option value="">-- Default --</option>
                       {(HANDLE_COLOR_MAP[handleType] || []).map(c => <option key={c} value={c}>{HANDLE_COLOR_OPTIONS[c] || c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wide ${isLight ? 'text-zinc-500' : 'text-gray-400'}`}>Covers Color</label>
                    <select className={`w-full rounded-xl p-3 text-sm h-[50px] focus:outline-none border transition-colors ${
                      isLight ? 'bg-white border-zinc-300 text-black focus:border-black' : 'bg-mammut-black border-gray-800 text-mammut-white focus:border-mammut-gold'
                    }`}
                      value={coverColor} onChange={e => setCoverColor(e.target.value)}>
                       <option value="">-- Default --</option>
                       {Object.entries(COVER_COLOR_OPTIONS).map(([code, name]) => <option key={code} value={code}>{name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Handle Type Scroll Wheel */}
              <div className="pt-2">
                <HandleScrollWheel
                  label="Handle Type"
                  value={handleType}
                  onChange={setHandleType}
                  options={HANDLE_OPTIONS}
                  handleColor={handleColor}
                />
              </div>

            </div>
          </AccordionSection>

          {/* 5. Roller Shutter Options */}
          <AccordionSection
            id="shutters"
            title="5. Roller Shutters"
            summary={getShuttersSummary()}
            isOpen={activeAccordion === 'shutters'}
            onToggle={() => setActiveAccordion(activeAccordion === 'shutters' ? null : 'shutters')}
          >
            <div className="space-y-4">
              <label className={`flex items-center gap-3 text-sm cursor-pointer select-none pb-2 border-b transition-colors ${
                isLight ? 'text-zinc-800 border-zinc-200' : 'text-gray-300 border-gray-800'
              }`}>
                <input 
                  type="checkbox" 
                  className={`w-5 h-5 cursor-pointer transition-colors ${
                    isLight 
                      ? 'border-zinc-300 bg-white text-black accent-black focus:ring-black' 
                      : 'accent-[#eab676]'
                  }`} 
                  checked={includeShutter} 
                  onChange={e => setIncludeShutter(e.target.checked)} 
                />
                Include Roller Shutter System
              </label>

              {includeShutter && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <GenericSelect label="Roller Blind Type" value={rollerBlindType} onChange={setRollerBlindType} options={shutterLookups.rollerBlindTypes} />
                  <GenericSelect label="Window Screen" value={windowScreen} onChange={setWindowScreen} options={shutterLookups.windowScreens} />
                  {windowScreen && (
                    <GenericSelect label="Window Screen Location" value={windowScreenLocation} onChange={setWindowScreenLocation} options={shutterLookups.windowScreenLocations} />
                  )}
                  
                  <div className={`col-span-1 sm:col-span-2 border-t my-2 transition-colors ${
                    isLight ? 'border-zinc-200' : 'border-gray-800/60'
                  }`}></div>
                  
                  <GenericSelect label="Curtain Type" value={curtainType} onChange={setCurtainType} options={shutterLookups.curtainTypes} />
                  <GenericSelect label="Fins Perforation" value={finsPerforation} onChange={setFinsPerforation} options={shutterLookups.finsPerforations} />
                  
                  <ColorSelect label="Curtain Color" value={curtainColor} onChange={setCurtainColor} groupedOptions={groupedColors} />
                  <ColorSelect label="Bottom Slat Color" value={bottomSlatColor} onChange={setBottomSlatColor} groupedOptions={groupedColors} />
                  <ColorSelect label="Screen Bottom Slat Color" value={windowScreenBottomSlatColor} onChange={setWindowScreenBottomSlatColor} groupedOptions={groupedColors} />
                  
                  <div className={`col-span-1 sm:col-span-2 border-t my-2 transition-colors ${
                    isLight ? 'border-zinc-200' : 'border-gray-800/60'
                  }`}></div>

                  <GenericSelect label="Drive Type" value={driveType} onChange={setDriveType} options={shutterLookups.driveTypes} />
                  <GenericSelect label="Control Side" value={controlSide} onChange={setControlSide} options={shutterLookups.controlSides} />
                  <GenericSelect label="Door Checks Type" value={doorChecksTypeI} onChange={setDoorChecksTypeI} options={shutterLookups.doorChecks} />
                  
                  <div className="flex items-center">
                    <label className={`flex items-center gap-3 text-sm cursor-pointer select-none ${
                      isLight ? 'text-zinc-800' : 'text-gray-300'
                    }`}>
                      <input 
                        type="checkbox" 
                        className={`w-4.5 h-4.5 rounded cursor-pointer transition-colors ${
                          isLight 
                            ? 'border-zinc-300 bg-white text-black accent-black focus:ring-black' 
                            : 'accent-[#eab676]'
                        }`} 
                        checked={imposeArbour} 
                        onChange={e => setImposeArbour(e.target.checked)} 
                      />
                      Impose 60mm arbour
                    </label>
                  </div>

                  <div className={`col-span-1 sm:col-span-2 border-t my-2 transition-colors ${
                    isLight ? 'border-zinc-200' : 'border-gray-800/60'
                  }`}></div>

                  <GenericSelect label="Box Type" value={boxType} onChange={setBoxType} options={shutterLookups.boxTypes} />
                  <ColorSelect label="Outer Box Color" value={outerBoxColor} onChange={setOuterBoxColor} groupedOptions={groupedColors} />
                  <ColorSelect label="Other Box Color" value={otherBoxColor} onChange={setOtherBoxColor} groupedOptions={groupedColors} />
                  <GenericSelect label="Plaster Carrier" value={plasterCarrier} onChange={setPlasterCarrier} options={shutterLookups.plasterCarriers} />

                  <div className="flex items-center">
                    <label className={`flex items-center gap-3 text-sm cursor-pointer select-none ${
                      isLight ? 'text-zinc-800' : 'text-gray-300'
                    }`}>
                      <input 
                        type="checkbox" 
                        className={`w-4.5 h-4.5 rounded cursor-pointer transition-colors ${
                          isLight 
                            ? 'border-zinc-300 bg-white text-black accent-black focus:ring-black' 
                            : 'accent-[#eab676]'
                        }`} 
                        checked={flushMountedSlatIn} 
                        onChange={e => setFlushMountedSlatIn(e.target.checked)} 
                      />
                      Flush-mounted Slat (In)
                    </label>
                  </div>
                  {flushMountedSlatIn && (
                    <ColorSelect label="Slat Color (In)" value={flushMountedSlatColorIn} onChange={setFlushMountedSlatColorIn} groupedOptions={groupedColors} />
                  )}

                  <div className="flex items-center">
                    <label className={`flex items-center gap-3 text-sm cursor-pointer select-none ${
                      isLight ? 'text-zinc-800' : 'text-gray-300'
                    }`}>
                      <input 
                        type="checkbox" 
                        className={`w-4.5 h-4.5 rounded cursor-pointer transition-colors ${
                          isLight 
                            ? 'border-zinc-300 bg-white text-black accent-black focus:ring-black' 
                            : 'accent-[#eab676]'
                        }`} 
                        checked={flushMountedSlatOut} 
                        onChange={e => setFlushMountedSlatOut(e.target.checked)} 
                      />
                      Flush-mounted Slat (Out)
                    </label>
                  </div>
                  {flushMountedSlatOut && (
                    <ColorSelect label="Slat Color (Out)" value={flushMountedSlatColorOut} onChange={setFlushMountedSlatColorOut} groupedOptions={groupedColors} />
                  )}

                  <GenericSelect label="Review / Inspection Slat" value={review} onChange={setReview} options={shutterLookups.reviews} />
                  <ColorSelect label="Side Cover Cap Color" value={sideCoverCapColor} onChange={setSideCoverCapColor} groupedOptions={groupedColors} />

                  <div className={`col-span-1 sm:col-span-2 border-t my-2 transition-colors ${
                    isLight ? 'border-zinc-200' : 'border-gray-800/60'
                  }`}></div>

                  <ColorSelect label="Guide Rails Color" value={guideRailsColor} onChange={setGuideRailsColor} groupedOptions={groupedColors} />
                  <GenericSelect label="Guide Rails Cutting" value={guideRailsCutting} onChange={setGuideRailsCutting} options={shutterLookups.guideRailsCuttings} />
                  <GenericSelect label="Extreme Left Guide Rail" value={extremeLeftGuideRail} onChange={setExtremeLeftGuideRail} options={[{value: 'STD', label: 'Standard'}]} />
                  <GenericSelect label="Extreme Right Guide Rail" value={extremeRightGuideRail} onChange={setExtremeRightGuideRail} options={[{value: 'STD', label: 'Standard'}]} />
                  <GenericSelect label="Guide Rails Type" value={guideRailsTypes} onChange={setGuideRailsTypes} options={shutterLookups.guideRailsTypes} />

                  <div className="col-span-1 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                    <label className={`flex items-center gap-3 text-sm cursor-pointer select-none ${
                      isLight ? 'text-zinc-800' : 'text-gray-300'
                    }`}>
                      <input 
                        type="checkbox" 
                        className={`w-4.5 h-4.5 rounded cursor-pointer transition-colors ${
                          isLight 
                            ? 'border-zinc-300 bg-white text-black accent-black focus:ring-black' 
                            : 'accent-[#eab676]'
                        }`} 
                        checked={guideRailGasketing} 
                        onChange={e => setGuideRailGasketing(e.target.checked)} 
                      />
                      Guide rail gasketing
                    </label>
                    <label className={`flex items-center gap-3 text-sm cursor-pointer select-none ${
                      isLight ? 'text-zinc-800' : 'text-gray-300'
                    }`}>
                      <input 
                        type="checkbox" 
                        className={`w-4.5 h-4.5 rounded cursor-pointer transition-colors ${
                          isLight 
                            ? 'border-zinc-300 bg-white text-black accent-black focus:ring-black' 
                            : 'accent-[#eab676]'
                        }`} 
                        checked={soundproofMat} 
                        onChange={e => setSoundproofMat(e.target.checked)} 
                      />
                      Soundproof mat + gasket
                    </label>
                  </div>
                </div>
              )}
            </div>
          </AccordionSection>

          {/* 6. Installation & Accessories */}
          <AccordionSection
            id="installation"
            title="6. Extras & Accessories"
            summary={getInstallationSummary()}
            isOpen={activeAccordion === 'installation'}
            onToggle={() => setActiveAccordion(activeAccordion === 'installation' ? null : 'installation')}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wide ${isLight ? 'text-zinc-500' : 'text-gray-400'}`}>{t('dowelHoles', 'Dowel Holes')}</label>
                  <select className={`w-full rounded-xl p-3 text-sm h-[50px] focus:outline-none border transition-colors ${
                    isLight ? 'bg-white border-zinc-300 text-black focus:border-black' : 'bg-mammut-black border-gray-800 text-mammut-white focus:border-mammut-gold'
                  }`}
                    value={dowelHoles} onChange={e => setDowelHoles(e.target.value)}>
                     <option value="">Lack (-)</option>
                     <option value="O_06">6mm assembly holes (O_06)</option>
                     <option value="O_10">10mm assembly holes (O_10)</option>
                     <option value="ADJUFIX_M16">Assembly holes ADJUFIX 14mm/M16</option>
                     <option value="ADJUFIX_18">Assembly holes ADJUFIX 14mm/18mm</option>
                  </select>
                </div>

                {dowelHoles && (
                  <div className="flex flex-col gap-1.5 justify-end">
                    <label className={`block text-xs font-bold uppercase tracking-wide ${isLight ? 'text-zinc-500' : 'text-gray-400'}`}>Locations</label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className={`flex items-center gap-2 text-sm cursor-pointer select-none ${
                        isLight ? 'text-zinc-800' : 'text-gray-350'
                      }`}>
                        <input 
                          type="checkbox" 
                          className={`w-4 h-4 rounded cursor-pointer transition-colors ${
                            isLight ? 'border-zinc-300 bg-white text-black accent-black focus:ring-black' : 'accent-[#eab676]'
                          }`} 
                          checked={dowelLeft} 
                          onChange={e => setDowelLeft(e.target.checked)} 
                        />
                        Left
                      </label>
                      <label className={`flex items-center gap-2 text-sm cursor-pointer select-none ${
                        isLight ? 'text-zinc-800' : 'text-gray-350'
                      }`}>
                        <input 
                          type="checkbox" 
                          className={`w-4 h-4 rounded cursor-pointer transition-colors ${
                            isLight ? 'border-zinc-300 bg-white text-black accent-black focus:ring-black' : 'accent-[#eab676]'
                          }`} 
                          checked={dowelRight} 
                          onChange={e => setDowelRight(e.target.checked)} 
                        />
                        Right
                      </label>
                      <label className={`flex items-center gap-2 text-sm cursor-pointer select-none ${
                        isLight ? 'text-zinc-800' : 'text-gray-350'
                      }`}>
                        <input 
                          type="checkbox" 
                          className={`w-4 h-4 rounded cursor-pointer transition-colors ${
                            isLight ? 'border-zinc-300 bg-white text-black accent-black focus:ring-black' : 'accent-[#eab676]'
                          }`} 
                          checked={dowelTop} 
                          onChange={e => setDowelTop(e.target.checked)} 
                        />
                        Top
                      </label>
                      <label className={`flex items-center gap-2 text-sm cursor-pointer select-none ${
                        isLight ? 'text-zinc-800' : 'text-gray-355'
                      }`}>
                        <input 
                          type="checkbox" 
                          className={`w-4 h-4 rounded cursor-pointer transition-colors ${
                            isLight ? 'border-zinc-300 bg-white text-black accent-black focus:ring-black' : 'accent-[#eab676]'
                          }`} 
                          checked={dowelBottom} 
                          onChange={e => setDowelBottom(e.target.checked)} 
                        />
                        Bottom
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <div className={`col-span-1 sm:col-span-2 border-t my-2 transition-colors ${
                isLight ? 'border-zinc-200' : 'border-gray-800/60'
              }`}></div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wide ${isLight ? 'text-zinc-500' : 'text-gray-400'}`}>Grille Type</label>
                  <select className={`w-full rounded-xl p-3 text-sm h-[50px] focus:outline-none border transition-colors ${
                    isLight ? 'bg-white border-zinc-300 text-black focus:border-black' : 'bg-mammut-black border-gray-800 text-mammut-white focus:border-mammut-gold'
                  }`}
                    value={grilleType} onChange={e => setGrilleType(e.target.value)}>
                     <option value="">None</option>
                     <optgroup label="Internal Grilles (Międzyszybowe)">
                       <option value="SPR08">SPR08 (8mm Internal)</option>
                       <option value="SPR18">SPR18 (18mm Internal)</option>
                       <option value="SPR26">SPR26 (26mm Internal)</option>
                       <option value="SPR45">SPR45 (45mm Internal)</option>
                     </optgroup>
                     <optgroup label="Stick-on Grilles (Naklejane)">
                       <option value="SPRN27">SPRN27 (27mm Stick-on)</option>
                       <option value="SPRN45">SPRN45 (45mm Stick-on)</option>
                     </optgroup>
                  </select>
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1.5 uppercase tracking-wide ${isLight ? 'text-zinc-500' : 'text-gray-400'}`}>Number of Fields</label>
                  <input type="number" className={`w-full rounded-xl p-3 text-sm h-[50px] focus:outline-none border disabled:opacity-50 transition-colors ${
                    isLight ? 'bg-white border-zinc-300 text-black focus:border-black' : 'bg-mammut-black border-gray-800 text-mammut-white focus:border-mammut-gold'
                  }`}
                    value={grilleFields} onChange={e => setGrilleFields(Number(e.target.value))} disabled={!grilleType} min={1} max={30} />
                </div>
              </div>
            </div>
          </AccordionSection>
        </div>

        {/* Pricing Box */}
          <div style={{ backgroundColor: '#ffffff' }} className="border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold tracking-[0.15em] text-slate-400 uppercase">Estimated Total</span>
              {loading && <span className="text-sm text-slate-400">Calculating…</span>}
              {error && <span className="text-sm text-red-500">Price error</span>}
              {!loading && !error && (
                <div className="text-3xl font-black text-slate-900 leading-none mt-0.5">
                  {euroPrice > 0 ? `${euroPrice.toFixed(2)} €` : '—'}
                </div>
              )}
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={handleShare}
                style={{ backgroundColor: '#ffffff' }}
                className="flex-1 sm:flex-none border-2 border-black font-bold text-sm px-5 py-3 rounded-xl hover:bg-slate-50 transition-colors text-slate-900"
              >
                Share
              </button>
              <button className="flex-1 sm:flex-none bg-black text-white font-bold text-sm px-7 py-3 rounded-xl hover:bg-slate-800 transition-colors">
                Request Quote →
              </button>
            </div>
          </div>

          {/* Mobile-only Pricing Cards in Light Mode */}
          <div className="lg:hidden flex flex-col gap-6 mt-4">
            {renderPricingCards()}
          </div>

        </div>
      );
    }

    // Dark mode: original bordered card wrapper
    return (
      <div className="p-4 sm:p-6 rounded-xl shadow-2xl flex flex-col gap-4 sm:gap-6 md:overflow-y-auto md:max-h-[85vh] border bg-mammut-darker border-gray-800">
        <div className="border-b pb-4 border-gray-800">
          <h2 className="font-bold text-xl uppercase text-mammut-gold">{t('configurator.options.title', 'Configurator Options')}</h2>
          <p className="text-xs mt-1 text-gray-500">{sysName} — {typology}</p>
        </div>

        {/* Visualizer window rendering */}
        <div className="w-full flex flex-col justify-center items-center relative">
          {renderVisualizer()}
        </div>

        {/* The 6 Collapsible Accordions */}
        <div className="space-y-2">
          <AccordionSection
            id="product"
            title="1. Product & Dimensions"
            summary={getProductSummary()}
            isOpen={activeAccordion === 'product'}
            onToggle={() => setActiveAccordion(activeAccordion === 'product' ? null : 'product')}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="relative">
                <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide text-gray-400">Product Number</label>
                <div
                  onClick={() => setIsTypologyOpen(!isTypologyOpen)}
                  style={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cbd5e1',
                    color: '#0f172a'
                  }}
                  className="w-full rounded-xl p-3 cursor-pointer flex items-center justify-between transition-colors h-[54px] border hover:border-zinc-400"
                >
                  <div className="flex items-center gap-3">
                    <TypologyThumbnail id={typology} className="w-8 h-8 object-contain rounded bg-transparent border border-zinc-200 shrink-0 p-0.5" hoverZoom={true} />
                    <span className="font-bold text-sm" style={{ color: '#0f172a' }}>{typology}</span>
                  </div>
                  <span className="text-zinc-400 text-xs">▼</span>
                </div>
                {isTypologyOpen && (
                  <>
                    <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setIsTypologyOpen(false)}></div>
                    <div 
                      style={{
                        backgroundColor: '#ffffff',
                        borderColor: '#cbd5e1',
                        color: '#0f172a'
                      }}
                      className="fixed inset-x-4 top-[10vh] z-50 border rounded-2xl shadow-2xl p-4 max-h-[80vh] overflow-y-auto md:absolute md:inset-auto md:top-full md:left-0 md:w-full md:mt-1"
                    >
                      <ScrollingDial
                        value={typology}
                        onChange={(val) => setTypology(val)}
                        items={TYPOLOGY_GROUPS.flatMap(g => g.subgroups.flatMap(sg => sg.ids))}
                        onConfirm={() => setIsTypologyOpen(false)}
                        closeOnSelect={closeOnSelect}
                      />
                      <div className="flex items-center gap-2 px-1 py-0.5">
                        <input 
                          type="checkbox" 
                          id="closeOnSelectCheckboxDark" 
                          checked={closeOnSelect} 
                          onChange={(e) => setCloseOnSelect(e.target.checked)} 
                          className="w-4 h-4 rounded cursor-pointer accent-black border-zinc-300 bg-zinc-100 focus:ring-black" 
                        />
                        <label htmlFor="closeOnSelectCheckboxDark" className="text-xs font-semibold cursor-pointer select-none text-zinc-700">
                          {t('configurator.state.closeOnSelect')}
                        </label>
                      </div>
                      <button 
                        onClick={() => setIsTypologyOpen(false)} 
                        className="w-full font-black uppercase text-[11px] tracking-wider py-3 rounded-xl transition-all cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.98] bg-black text-white hover:bg-zinc-800"
                      >
                        Confirm
                      </button>
                    </div>
                  </>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide text-gray-400">Profile System</label>
                <select className="w-full rounded-xl p-3 focus:outline-none h-[54px] text-sm border bg-mammut-black border-gray-800 text-mammut-white focus:border-mammut-gold" value={profilsatz} onChange={e => setProfilsatz(e.target.value)}>
                  {PRODUCT_CATEGORIES.filter(c => c.group === activeCategory).map((category) => (
                    category.subgroups.map((subgroup, subgroupIndex) => (
                      <optgroup key={`${category.group}-${subgroupIndex}`} label={`${t('header.megaMenu.cats.' + category.group.toLowerCase().split(' ')[0], category.group)} — ${subgroup.name}`}>
                        {subgroup.options.map(opt => (<option key={opt.val} value={opt.val}>{opt.val} — {opt.label}</option>))}
                      </optgroup>
                    ))
                  ))}
                </select>
              </div>
              <div className="col-span-1 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DimensionAdjuster label="Width (mm)" value={width} onChange={setWidth} min={500} max={3000} isLight={true} />
                <DimensionAdjuster label="Height (mm)" value={height} onChange={setHeight} min={500} max={3000} isLight={true} />
              </div>
            </div>
          </AccordionSection>
        </div>
      </div>
    );
  };

  const sysNameForFooter = PRODUCT_CATEGORIES
    .flatMap(c => c.subgroups.flatMap(sg => sg.options))
    .find(o => o.val === profilsatz)?.label || profilsatz;

  if (isLight) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 antialiased relative">
        <style dangerouslySetInnerHTML={{__html: `
          /* Force the main container to day-mode */
          .min-h-screen {
            background-color: #f8fafc !important;
            color: #0f172a !important;
          }

          /* Nuke any dark background on accordion wrapper divs */
          div[class*="bg-mammut"],
          div[class*="bg-black"],
          div[class*="bg-neutral"],
          div[class*="bg-slate-950"],
          .bg-black,
          [data-theme="dark"] .bg-black {
            background-color: #ffffff !important;
            border-color: #e2e8f0 !important;
            color: #0f172a !important;
          }

          /* Force accordion headers, titles, labels legible */
          .configurator-accordions div[class*="text-blue"],
          .configurator-accordions span[class*="text-slate-400"],
          .configurator-accordions h2,
          .configurator-accordions h3,
          .configurator-accordions label,
          .configurator-accordions p,
          .configurator-accordions span {
            color: #1e293b !important;
          }

          /* Fix dropdowns and inputs for legibility */
          select, input {
            background-color: #f1f5f9 !important;
            color: #0f172a !important;
            border: 1px solid #cbd5e1 !important;
          }

          /* Apply 4px radius to all boxes inside the accordions */
          .accordion-content select,
          .accordion-content input:not([type="checkbox"]):not([type="radio"]),
          .accordion-content textarea,
          .accordion-content button:not(.rounded-full),
          .accordion-content [class*="rounded-"]:not(.rounded-full),
          .accordion-content .rounded:not(.rounded-full) {
            border-radius: 4px !important;
          }

          /* Force Cantor Pricing cards text white/slate on dark background in light mode */
          .pricing-engine-card,
          .pricing-engine-card h1 {
            color: #f1f5f9 !important;
          }
          .pricing-engine-card p,
          .pricing-engine-card .text-slate-400 {
            color: #94a3b8 !important;
          }
          .pricing-engine-card .text-slate-300 {
            color: #cbd5e1 !important;
          }
          .pricing-engine-card span {
            color: #f1f5f9 !important;
          }
          .pricing-engine-card span.text-slate-400 {
            color: #94a3b8 !important;
          }
          .pricing-engine-card span.text-slate-300 {
            color: #cbd5e1 !important;
          }

          .pricing-ledger-card,
          .pricing-ledger-card h2,
          .pricing-ledger-card th {
            color: #f1f5f9 !important;
          }
          .pricing-ledger-card .text-slate-400 {
            color: #94a3b8 !important;
          }
          .pricing-ledger-card tr.text-slate-100 td {
            color: #f1f5f9 !important;
          }
          .pricing-ledger-card tr.text-slate-500 td {
            color: #64748b !important;
          }
          .pricing-ledger-card tr.font-black td {
            color: #f1f5f9 !important;
          }
        `}} />
        {arPlacement && (
          <ArViewer sceneGroup={sceneGroup?.group || null} placement={arPlacement} onClose={() => setArPlacement(null)} />
        )}
        <div className="absolute top-6 right-6 z-40">
          <ThemeToggle />
        </div>


        {/* Split-view container — 3 columns on desktop: Visualizer | Config | Pricing */}
        <div className="max-w-[1700px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_380px_340px] lg:gap-6 lg:px-6 lg:pt-6 pt-4 px-3">

          {/* LEFT STICKY PILLAR — Visualizer */}
          <div className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] flex flex-col">
            <div 
              style={{
                backgroundColor: isLight ? '#ffffff' : 'var(--theme-mammut-darker)',
                borderColor: isLight ? '#e2e8f0' : 'var(--theme-mammut-border)'
              }}
              className="rounded-2xl border shadow-sm flex-1 flex flex-col overflow-hidden"
            >
              {/* Visualizer header */}
              <div 
                style={{
                  borderBottomColor: isLight ? '#e2e8f0' : 'var(--theme-mammut-border)'
                }}
                className="px-6 pt-5 pb-4 border-b flex items-center justify-between shrink-0"
              >
                <div>
                  <p 
                    style={{ color: isLight ? '#94a3b8' : '#9ca3af' }}
                    className="text-[10px] font-semibold tracking-[0.15em] uppercase"
                  >
                    Live Preview
                  </p>
                  <h1 
                    style={{ color: isLight ? '#0f172a' : 'var(--theme-mammut-gold)' }}
                    className="text-xl font-bold tracking-tight mt-0.5"
                  >
                    {sysNameForFooter}
                  </h1>
                  <div className="flex flex-row items-center gap-2 mt-1 relative select-none">
                    <div className="relative group z-40">
                      {/* Active category pill button with Icon first and Name to the right */}
                      <div className={`flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-[4px] border transition-all duration-250 ${
                        isLight 
                          ? 'bg-transparent hover:bg-transparent border-slate-200 hover:border-slate-300 text-slate-800' 
                          : 'bg-transparent hover:bg-transparent border-gray-800 text-mammut-white'
                      }`}>
                        {(() => {
                          const activeCat = DRUTEX_CATEGORIES.find(c => c.id === activeCategory);
                          if (!activeCat) return null;
                          const CatIcon = activeCat.icon;
                          return <CatIcon size={24} className={isLight ? 'text-slate-700 shrink-0' : 'text-mammut-gold shrink-0'} />;
                        })()}
                        <span className="text-sm font-bold uppercase tracking-wider">
                          {DRUTEX_CATEGORIES.find(c => c.id === activeCategory)?.label || activeCategory}
                        </span>
                        <ChevronDown size={14} className={isLight ? 'text-slate-400 shrink-0' : 'text-gray-500 shrink-0'} />
                      </div>

                      {/* Dropdown menu expanded on HOVER */}
                      <div className={`absolute left-0 mt-1 w-64 border rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 transform translate-y-1 group-hover:translate-y-0 ${
                        isLight 
                          ? 'bg-white/95 backdrop-blur-md border-slate-200 text-slate-900 shadow-slate-200/50' 
                          : 'bg-mammut-dark/95 backdrop-blur-md border-gray-800 text-mammut-white shadow-black/80'
                      }`}>
                        <div className="p-1.5 flex flex-col gap-0.5">
                          {DRUTEX_CATEGORIES.map(cat => {
                            const CatIcon = cat.icon;
                            const isCatActive = activeCategory === cat.id;
                            return (
                              <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-left text-xs font-bold uppercase transition-all duration-150 ${
                                  isCatActive
                                    ? (isLight 
                                        ? 'bg-slate-100 text-slate-950 border border-slate-200 shadow-sm' 
                                        : 'bg-mammut-gold/10 text-mammut-white border border-mammut-gold/30 shadow-sm shadow-mammut-gold/5')
                                    : (isLight 
                                        ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent' 
                                        : 'text-gray-400 hover:text-mammut-white hover:bg-mammut-black border border-transparent')
                                }`}
                              >
                                <CatIcon size={16} className={isCatActive ? (isLight ? 'text-slate-800' : 'text-mammut-gold') : 'text-slate-450'} />
                                <span>{cat.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <span 
                      style={{ color: isLight ? '#475569' : '#9ca3af' }}
                      className="text-xs font-bold self-center whitespace-nowrap ml-1"
                    >
                      — {typology} — {width} × {height} mm
                    </span>
                  </div>
                </div>
              </div>
              {/* Visualizer canvas area */}
              <div className="flex-1 flex flex-col justify-center items-center p-4 overflow-hidden">
                {renderVisualizer()}
              </div>
            </div>
          </div>

          {/* CENTRE SCROLLABLE PANEL — Config Accordions */}
          <div className="flex flex-col gap-4 overflow-y-auto lg:max-h-[calc(100vh-3rem)] pb-12 pt-4 lg:pt-0">
            {/* Category tab strip */}
            {renderLeftColumn()}

            {/* Accordion sections */}
            {renderMiddleColumn()}
          </div>

          {/* RIGHT STICKY PANEL — Cantor Pricing */}
          <div className="hidden lg:flex flex-col gap-4 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] overflow-y-auto pb-6">
            {renderRightColumn()}
          </div>

        </div>
      </div>
    );
  }

  // Dark mode: original 3-column layout
  return (
    <div className="min-h-screen p-3 sm:p-6 pt-24 sm:pt-32 relative pb-6 transition-colors bg-mammut-black text-mammut-white">
      <style dangerouslySetInnerHTML={{__html: `
        /* Apply 4px radius to all boxes inside the accordions */
        .accordion-content select,
        .accordion-content input:not([type="checkbox"]):not([type="radio"]),
        .accordion-content textarea,
        .accordion-content button:not(.rounded-full),
        .accordion-content [class*="rounded-"]:not(.rounded-full),
        .accordion-content .rounded:not(.rounded-full) {
          border-radius: 4px !important;
        }
      `}} />
      {arPlacement && (
        <ArViewer sceneGroup={sceneGroup?.group || null} placement={arPlacement} onClose={() => setArPlacement(null)} />
      )}
      <div className="absolute top-6 right-6 z-40">
        <ThemeToggle />
      </div>
      {/* 3-column Layout grid */}
      <div className="w-full px-4 md:px-8 grid grid-cols-1 md:grid-cols-[250px_1fr_400px] gap-8">
        {renderLeftColumn()}
        {renderMiddleColumn()}
        {renderRightColumn()}
      </div>
    </div>
  );
}