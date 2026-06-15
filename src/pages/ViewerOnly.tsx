import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Child1 } from '../components/configurator/Child1';
import { F100TViewer } from '../components/configurator/F100TViewer';
import { F101CViewer } from '../components/configurator/F101CViewer';
import { ThreejsWindowEngine } from '../components/configurator/ThreejsWindowEngine';
import { SLE201Viewer } from '../components/configurator/SLE201Viewer';
import { F104Viewer } from '../components/configurator/F104Viewer';
import { F202LViewer } from '../components/configurator/F202LViewer';
import { F202Lv2Viewer } from '../components/configurator/F202Lv2Viewer';
import { F202RFixV2Viewer } from '../components/configurator/F202RFixV2Viewer';
import { ColorPaletteOverlay } from '../components/configurator/ColorPaletteOverlay';
import { supabase } from '../lib/supabase';
import { ChevronDown, ChevronUp, ChevronRight, Package, Share2 } from 'lucide-react';
import { useThemeStore } from '../store/useThemeStore';
import { type SwatchColor } from '../data/productDetails';

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
  onDoubleClick?: () => void;
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
  const [inputValue, setInputValue] = useState(value.toString());

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const dragValueRef = useRef(value);

  useEffect(() => {
    if (!isDragging) {
      dragValueRef.current = value;
    }
  }, [value, isDragging]);

  const isVert = orientation === 'vertical';

  const isEditingRef = useRef(isEditing);
  isEditingRef.current = isEditing;
  const minRef = useRef(min);
  minRef.current = min;
  const maxRef = useRef(max);
  maxRef.current = max;
  const stepRef = useRef(step);
  stepRef.current = step;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const isVertRef = useRef(isVert);
  isVertRef.current = isVert;
  const isTouchDragging = useRef(false);
  
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

  const handleInputSubmit = () => {
    const parsed = parseInt(inputValue, 10);
    if (!isNaN(parsed)) {
      const clamped = Math.max(min, Math.min(max, Math.round(parsed / step) * step));
      onChange(clamped);
    }
    setIsEditing(false);
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
    e.stopPropagation();
    const delta = e.deltaY < 0 ? step : -step;
    updateValue(value + delta);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isEditing) return;
    const target = e.target as HTMLElement;
    if (target && target.closest('.dimension-badge')) {
      return;
    }
    e.stopPropagation();
    setIsDragging(true);
    const pos = isVert ? e.clientY : e.clientX;
    dragStartPos.current = pos;
    dragStartValue.current = value;
    dragValueRef.current = value;
    lastPos.current = pos;
    lastTime.current = Date.now();
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (!isDragging) return;
    const pos = isVert ? e.clientY : e.clientX;
    const now = Date.now();
    const dt = now - lastTime.current || 1;
    const dp = pos - lastPos.current;

    const velocity = Math.abs(dp) / dt;
    const accelFactor = velocity > 0.2 ? Math.min(10, 1 + (velocity - 0.2) * 4) : 1;
    
    const valueDelta = -dp * (unitsPerTick / tickSpacing) * accelFactor;
    dragValueRef.current += valueDelta;
    
    const clamped = Math.max(min, Math.min(max, Math.round(dragValueRef.current / step) * step));
    onChange(clamped);

    lastPos.current = pos;
    lastTime.current = now;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.stopPropagation();
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const onTouchStart = (e: TouchEvent) => {
      if (isEditingRef.current) return;
      const target = e.target as HTMLElement;
      if (target && target.closest('.dimension-badge')) {
        return;
      }
      e.stopPropagation();
      isTouchDragging.current = true;
      setIsDragging(true);
      const touch = e.touches[0];
      const pos = isVertRef.current ? touch.clientY : touch.clientX;
      dragStartPos.current = pos;
      dragStartValue.current = currentValueRef.current;
      dragValueRef.current = currentValueRef.current;
      lastPos.current = pos;
      lastTime.current = Date.now();
    };

    const onTouchMove = (e: TouchEvent) => {
      e.stopPropagation();
      if (!isTouchDragging.current) return;
      const touch = e.touches[0];
      const pos = isVertRef.current ? touch.clientY : touch.clientX;
      const now = Date.now();
      const dt = now - lastTime.current || 1;
      const dp = pos - lastPos.current;

      const velocity = Math.abs(dp) / dt;
      const accelFactor = velocity > 0.2 ? Math.min(10, 1 + (velocity - 0.2) * 4) : 1;
      const valueDelta = -dp * (unitsPerTick / tickSpacing) * accelFactor;

      dragValueRef.current += valueDelta;
      
      const clamped = Math.max(minRef.current, Math.min(maxRef.current, Math.round(dragValueRef.current / stepRef.current) * stepRef.current));
      onChangeRef.current(clamped);

      lastPos.current = pos;
      lastTime.current = now;

      if (e.cancelable) {
        e.preventDefault();
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      e.stopPropagation();
      isTouchDragging.current = false;
      setIsDragging(false);
    };

    track.addEventListener('touchstart', onTouchStart, { passive: false });
    track.addEventListener('touchmove', onTouchMove, { passive: false });
    track.addEventListener('touchend', onTouchEnd, { passive: false });
    track.addEventListener('touchcancel', onTouchEnd, { passive: false });

    return () => {
      track.removeEventListener('touchstart', onTouchStart);
      track.removeEventListener('touchmove', onTouchMove);
      track.removeEventListener('touchend', onTouchEnd);
      track.removeEventListener('touchcancel', onTouchEnd);
    };
  }, []);

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

  const trackSizeClass = isVert ? 'w-10 md:w-12 h-full' : 'w-full h-10 md:h-12';

  return (
    <div 
      className={`relative flex select-none touch-none ${
        isVert ? 'flex-col items-center h-full w-full' : 'flex-row items-center w-full'
      }`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      style={{ outline: 'none' }}
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
        style={maskStyle}
        className={`relative overflow-hidden flex-grow flex items-center justify-center select-none touch-none pointer-events-none dimension-scroll-wheel ${trackSizeClass}`}
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
          onPointerDown={(e) => {
            e.stopPropagation();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
          }}
          onMouseEnter={() => setIsBadgeHovered(true)}
          onMouseLeave={() => setIsBadgeHovered(false)}
          className={`dimension-badge flex items-center justify-center pointer-events-auto cursor-pointer select-none touch-none transition-all duration-300 transform active:scale-95 ${
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
            <div 
              className="flex items-center gap-1 font-mono" 
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              onPointerUp={(e) => e.stopPropagation()}
            >
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

              {/* Display Value Text Input */}
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={handleInputSubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleInputSubmit();
                  } else if (e.key === 'Escape') {
                    setInputValue(value.toString());
                    setIsEditing(false);
                  }
                }}
                className="w-16 text-center bg-transparent border-none font-black outline-none focus:ring-0 px-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-xs md:text-sm select-text"
                style={{ color: editTextColor }}
                autoFocus
              />

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
  const colorGsk = activeItem?.config?.cGsk || (searchParams.get('cGsk') ? decodeURIComponent(searchParams.get('cGsk')!) : '#1c1c1c');
  const colorSpacer = activeItem?.config?.cSpc || (searchParams.get('cSpc') ? decodeURIComponent(searchParams.get('cSpc')!) : '#b0b5b9');

  // Interactivity States
  const [width, setWidth] = useState(1000);
  const [height, setHeight] = useState(1000);
  const [colorExt, setColorExt] = useState('#e8e0d4');
  const [colorInt, setColorInt] = useState('#f0ece6');
  const [colorExtTexture, setColorExtTexture] = useState<string | undefined>(undefined);
  const [colorIntTexture, setColorIntTexture] = useState<string | undefined>(undefined);
  const [isColorWheelOpen, setIsColorWheelOpen] = useState(false);
  const [mullionPos, setMullionPos] = useState(500);
  const [invertSides, setInvertSides] = useState(false);

  // Sync width/height/colors when basketData, activeItem, or URL parameters change
  useEffect(() => {
    let w = 1000;
    let h = 1000;
    let cE = '#e8e0d4';
    let cI = '#f0ece6';
    let cETex = undefined;
    let cITex = undefined;

    let inv = false;

    if (activeItem) {
      w = activeItem.config?.width || 1000;
      h = activeItem.config?.height || 1000;
      cE = activeItem.config?.cExt || '#e8e0d4';
      cI = activeItem.config?.cInt || '#f0ece6';
      cETex = activeItem.config?.cExtTex;
      cITex = activeItem.config?.cIntTex;
      inv = !!activeItem.config?.invertSides;
    } else {
      w = parseInt(searchParams.get('w') || '1000', 10);
      h = parseInt(searchParams.get('h') || '1000', 10);
      cE = searchParams.get('cExt') ? decodeURIComponent(searchParams.get('cExt')!) : '#e8e0d4';
      cI = searchParams.get('cInt') ? decodeURIComponent(searchParams.get('cInt')!) : '#f0ece6';
      cETex = searchParams.get('cExtTex') ? decodeURIComponent(searchParams.get('cExtTex')!) : undefined;
      cITex = searchParams.get('cIntTex') ? decodeURIComponent(searchParams.get('cIntTex')!) : undefined;
      inv = searchParams.get('invertSides') === 'true';
    }

    setWidth(w);
    setHeight(h);
    setMullionPos(w / 2);
    setColorExt(cE);
    setColorInt(cI);
    setColorExtTexture(cETex);
    setColorIntTexture(cITex);
    setInvertSides(inv);
  }, [basketData, selectedBasketItemIdx, searchParams, activeItem]);

  // Dimension scrollwheels visibility states
  const [isHeightScrollVisible, setIsHeightScrollVisible] = useState(false);
  const [isWidthScrollVisible, setIsWidthScrollVisible] = useState(false);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);

  const startUpPos = useRef<{ x: number, y: number } | null>(null);
  const startRightPos = useRef<{ x: number, y: number } | null>(null);
  const inactivityTimerRef = useRef<number | null>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      window.clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = window.setTimeout(() => {
      setIsHeightScrollVisible(false);
      setIsWidthScrollVisible(false);
    }, 3000);
  }, []);

  const handleUpPointerDown = (e: React.PointerEvent) => {
    startUpPos.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsHeightScrollVisible(true);
    resetInactivityTimer();
  };

  const handleUpPointerMove = (e: React.PointerEvent) => {
    if (!startUpPos.current) return;
    const dy = startUpPos.current.y - e.clientY;
    if (dy > 15) {
      setIsHeightScrollVisible(true);
      resetInactivityTimer();
      startUpPos.current = null;
    }
  };

  const handleUpPointerUp = (e: React.PointerEvent) => {
    startUpPos.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleRightPointerDown = (e: React.PointerEvent) => {
    startRightPos.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsWidthScrollVisible(true);
    resetInactivityTimer();
  };

  const handleRightPointerMove = (e: React.PointerEvent) => {
    if (!startRightPos.current) return;
    const dx = e.clientX - startRightPos.current.x;
    if (dx > 15) {
      setIsWidthScrollVisible(true);
      resetInactivityTimer();
      startRightPos.current = null;
    }
  };

  const handleRightPointerUp = (e: React.PointerEvent) => {
    startRightPos.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // Close share menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target as Node)) {
        setIsShareMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, []);

  const getShareUrl = (senderName?: string) => {
    const url = new URL(window.location.origin + '/viewer');
    url.searchParams.set('typology', typology);
    url.searchParams.set('w', width.toString());
    url.searchParams.set('h', height.toString());
    url.searchParams.set('cExt', encodeURIComponent(colorExt));
    url.searchParams.set('cInt', encodeURIComponent(colorInt));
    if (colorExtTexture) url.searchParams.set('cExtTex', encodeURIComponent(colorExtTexture));
    if (colorIntTexture) url.searchParams.set('cIntTex', encodeURIComponent(colorIntTexture));
    url.searchParams.set('cGsk', encodeURIComponent(colorGsk));
    url.searchParams.set('cSpc', encodeURIComponent(colorSpacer));
    if (invertSides) url.searchParams.set('invertSides', 'true');
    if (senderName) url.searchParams.set('sender_name', encodeURIComponent(senderName));
    return url.toString();
  };

  const handleShareToWhatsApp = () => {
    const senderName = window.prompt("Enter your name (optional) so the recipient knows who sent this:");
    const shareUrl = getShareUrl(senderName || undefined);
    const text = senderName 
      ? `${senderName} sent you this window they configured!` 
      : 'Check out this 3D window configuration!';
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + '\n' + shareUrl)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSystemShare = async () => {
    const senderName = window.prompt("Enter your name (optional) so the recipient knows who sent this:");
    const shareUrl = getShareUrl(senderName || undefined);
    if (navigator.share) {
      try {
        await navigator.share({
          title: '3D Window Configuration',
          text: senderName ? `${senderName} sent you this window they configured!` : 'Check out this 3D window configuration!',
          url: shareUrl
        });
      } catch (err) {
        navigator.clipboard.writeText(shareUrl);
        alert('Configuration link copied to clipboard!');
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Standalone 3D Viewer link copied to clipboard:\n\n' + shareUrl);
    }
  };

  const handleCopyLink = () => {
    const senderName = window.prompt("Enter your name (optional) so the recipient knows who sent this:");
    const shareUrl = getShareUrl(senderName || undefined);
    navigator.clipboard.writeText(shareUrl);
    alert('Standalone 3D Viewer link copied to clipboard:\n\n' + shareUrl);
  };



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

  const minW = typology.startsWith('SLE') ? 1300 : 500;
  const maxW = 3000;
  const minH = typology.startsWith('SLE') ? 1500 : 500;
  const maxH = 3000;

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
      <div 
        className="visualizer-container w-full h-[85vh] relative shrink-0 border-b border-gray-200 pt-12 pb-[48px] pl-[48px] pr-2 md:pt-14 md:pb-[65px] md:pl-[65px] md:pr-4 overflow-hidden shadow-inner" 
        style={{ backgroundColor: '#ffffff' }}
      >
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
            hidePill={true}
            isColorPaletteOpen={isColorWheelOpen}
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
            hidePill={true}
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
            hidePill={true}
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
            hidePill={true}
            isColorPaletteOpen={isColorWheelOpen}
            hasRollerShutter={true}
            invertSides={invertSides}
            onInvertSidesChange={setInvertSides}
          />
        ) : typology === 'F104' ? (
          <F104Viewer
            width={width}
            height={height}
            colorExt={colorExt}
            colorInt={colorInt}
            colorExtTexture={colorExtTexture}
            colorIntTexture={colorIntTexture}
            colorGsk={colorGsk}
            colorSpacer={colorSpacer}
            hidePill={true}
            isColorPaletteOpen={isColorWheelOpen}
            hasRollerShutter={true}
          />
        ) : typology === 'IGE_F202L' ? (
          <F202LViewer
            width={width}
            height={height}
            colorExt={colorExt}
            colorInt={colorInt}
            colorExtTexture={colorExtTexture}
            colorIntTexture={colorIntTexture}
            colorGsk={colorGsk}
            colorSpacer={colorSpacer}
            hidePill={true}
            isColorPaletteOpen={isColorWheelOpen}
          />
        ) : typology === 'IGE_F202Lv2' ? (
          <F202Lv2Viewer
            width={width}
            height={height}
            colorExt={colorExt}
            colorInt={colorInt}
            colorExtTexture={colorExtTexture}
            colorIntTexture={colorIntTexture}
            colorGsk={colorGsk}
            colorSpacer={colorSpacer}
            hidePill={true}
            isColorPaletteOpen={isColorWheelOpen}
          />
        ) : typology === 'IGE_F202_R_FIXV2' ? (
          <F202RFixV2Viewer
            width={width}
            height={height}
            colorExt={colorExt}
            colorInt={colorInt}
            colorExtTexture={colorExtTexture}
            colorIntTexture={colorIntTexture}
            colorGsk={colorGsk}
            colorSpacer={colorSpacer}
            hidePill={true}
            isColorPaletteOpen={isColorWheelOpen}
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
            sealColor={colorGsk}
          />
        )}

        {/* Share Options Menu Overlay */}
        <div className="absolute top-2 right-2 z-30" ref={shareMenuRef}>
          <button 
            onClick={(e) => {
              e.preventDefault();
              setIsShareMenuOpen(!isShareMenuOpen);
            }} 
            className={`p-1.5 transition-colors flex items-center justify-center rounded bg-black/60 border border-white/10 text-white cursor-pointer hover:text-mammut-gold`}
            title="Share Options"
          >
            <Share2 size={16} />
          </button>
          
          {isShareMenuOpen && (
            <div className="absolute top-full right-0 mt-2 bg-zinc-950/95 border border-zinc-800 backdrop-blur-md rounded-xl shadow-2xl p-1.5 z-50 flex flex-col gap-1 min-w-[170px]">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsShareMenuOpen(false);
                  handleShareToWhatsApp();
                }}
                className="flex items-center gap-2.5 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-[#25D366] hover:text-[#25D366]/80 hover:bg-white/5 rounded-lg transition-colors w-full text-left cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.858.002-2.634-1.019-5.112-2.877-6.974S14.636 1.83 12.007 1.83c-5.442 0-9.866 4.42-9.87 9.858-.001 1.702.457 3.361 1.328 4.815l-.991 3.616 3.708-.973zm10.102-7.395c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.021-.963-.263-.099-.455-.149-.648.149-.193.297-.748.963-.918 1.16-.17.197-.341.222-.638.074-.297-.149-1.258-.464-2.398-1.481-.888-.793-1.488-1.771-1.662-2.068-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.174.2-.298.3-.496.101-.198.05-.372-.025-.521-.075-.149-.648-1.62-.888-2.198-.232-.56-.47-.482-.648-.491-.166-.008-.356-.01-.545-.01-.189 0-.495.071-.754.347-.258.277-.985.963-.985 2.349 0 1.386 1.009 2.723 1.15 2.905.141.182 1.984 3.03 4.809 4.246.672.29 1.196.463 1.604.593.676.214 1.293.184 1.78.112.544-.08 1.758-.717 2.006-1.411.248-.693.248-1.288.173-1.411z" />
                </svg>
                Share on WhatsApp
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsShareMenuOpen(false);
                  handleSystemShare();
                }}
                className="flex items-center gap-2.5 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-gray-300 hover:text-mammut-gold hover:bg-white/5 rounded-lg transition-colors w-full text-left cursor-pointer"
              >
                <Share2 size={12} strokeWidth={2.5} className="shrink-0" />
                System Share
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsShareMenuOpen(false);
                  handleCopyLink();
                }}
                className="flex items-center gap-2.5 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-gray-300 hover:text-mammut-gold hover:bg-white/5 rounded-lg transition-colors w-full text-left cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0015 2.25h-1.5a2.251 2.251 0 00-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 00-9-9z" />
                </svg>
                Copy Share Link
              </button>
            </div>
          )}
        </div>

        {/* Height Scroll Wheel (Height) overlay on the left */}
        <div 
          className={`absolute left-3 md:left-4 top-12 md:top-14 bottom-[60px] md:bottom-[80px] w-10 md:w-12 z-30 flex items-center justify-center font-mono transition-all duration-300 ${
            isHeightScrollVisible ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 -translate-x-4 pointer-events-none'
          }`}
          onPointerMove={resetInactivityTimer}
          onPointerDown={resetInactivityTimer}
        >
          <NumericScrollWheel
            label="Height"
            value={height}
            onChange={(val) => {
              setHeight(val);
              resetInactivityTimer();
            }}
            min={minH}
            max={maxH}
            step={10}
            orientation="vertical"
            labelPosition="inside"
          />
        </div>

        {/* Width Scroll Wheel (Width) overlay at the bottom */}
        <div 
          className={`absolute bottom-3 md:bottom-4 left-[60px] md:left-[80px] right-3 md:right-4 h-10 md:h-12 z-30 flex items-center justify-center font-mono transition-all duration-300 ${
            isWidthScrollVisible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
          onPointerMove={resetInactivityTimer}
          onPointerDown={resetInactivityTimer}
        >
          <NumericScrollWheel
            label="Width"
            value={width}
            onChange={(val) => {
              setWidth(val);
              resetInactivityTimer();
            }}
            min={minW}
            max={maxW}
            step={10}
            orientation="horizontal"
            labelPosition="inside"
          />
        </div>

        {/* Optional Mullion Scroll Wheel */}
        {typology === 'F101C' && (
          <div className="absolute top-2 left-[60px] md:left-[80px] right-3 md:right-4 h-10 md:h-12 z-30 flex items-center justify-center font-mono">
            <NumericScrollWheel
              label="Mullion"
              value={mullionPos}
              onChange={setMullionPos}
              onDoubleClick={() => setMullionPos(width / 2)}
              min={100}
              max={width - 100}
              step={10}
              orientation="horizontal"
              labelPosition="inside"
            />
          </div>
        )}

        {/* Measurement Pill + Arrows Overlay */}
        <div className="absolute bottom-3 left-3 z-35 flex flex-col items-start pointer-events-none select-none">
          {/* UP Arrow */}
          <div 
            onPointerDown={handleUpPointerDown}
            onPointerMove={handleUpPointerMove}
            onPointerUp={handleUpPointerUp}
            onPointerCancel={handleUpPointerUp}
            onMouseEnter={() => { setIsHeightScrollVisible(true); resetInactivityTimer(); }}
            className="mb-1 pointer-events-auto flex items-center justify-center cursor-ns-resize text-mammut-gold bg-mammut-black/85 border border-gray-800 rounded-lg w-7 h-7 shadow-lg active:scale-95 transition-all hover:bg-gray-850 hover:border-mammut-gold/60"
            title="Click or hover to reveal Height scrollwheel"
            style={{ touchAction: 'none' }}
          >
            <ChevronUp size={16} strokeWidth={3} />
          </div>

          <div className="flex items-center gap-1">
            {/* Measurement Box replaced by Carpenter's Square Icon */}
            <div 
              className="pointer-events-auto flex items-center justify-center text-mammut-gold bg-mammut-black/85 border border-gray-800 rounded-lg w-7 h-7 shadow-lg transition-all hover:bg-gray-850 hover:border-mammut-gold/60"
              style={{ 
                backdropFilter: 'blur(8px)' 
              }}
              title="Measurements"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M8 2H2V22H22V16H8V2Z" />
                <path d="M2 22L8 16" />
                <path d="M2 5H5" />
                <path d="M2 8H5" />
                <path d="M2 11H5" />
                <path d="M2 14H5" />
                <path d="M11 22V19" />
                <path d="M14 22V19" />
                <path d="M17 22V19" />
                <path d="M20 22V19" />
              </svg>
            </div>

            {/* RIGHT Arrow */}
            <div 
              onPointerDown={handleRightPointerDown}
              onPointerMove={handleRightPointerMove}
              onPointerUp={handleRightPointerUp}
              onPointerCancel={handleRightPointerUp}
              onMouseEnter={() => { setIsWidthScrollVisible(true); resetInactivityTimer(); }}
              className="pointer-events-auto flex items-center justify-center cursor-ew-resize text-mammut-gold bg-mammut-black/85 border border-gray-800 rounded-lg w-7 h-7 shadow-lg active:scale-95 transition-all hover:bg-gray-850 hover:border-mammut-gold/60"
              title="Click or hover to reveal Width scrollwheel"
              style={{ touchAction: 'none' }}
            >
              <ChevronRight size={16} strokeWidth={3} />
            </div>
          </div>
        </div>

        {typology === 'SLE201' && (
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

        {/* Color Palette Overlay widget */}
        <ColorPaletteOverlay
          colorExt={colorExt}
          colorInt={colorInt}
          onChangeExt={(col) => {
            setColorExt(col.hex);
            setColorExtTexture(col.image || undefined);
          }}
          onChangeInt={(col) => {
            setColorInt(col.hex);
            setColorIntTexture(col.image || undefined);
          }}
          onOpenChange={setIsColorWheelOpen}
        />
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
