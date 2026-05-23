import React, { useRef, useState, useEffect } from 'react';

interface ScrollWheelProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  orientation: 'horizontal' | 'vertical';
  step?: number;          // Minimum increment, e.g., 1 (for 1mm)
  tickSpacing?: number;   // Distance in pixels between ticks (default: 12)
  unitsPerTick?: number;  // How many mm one tick represents (default: 10)
  className?: string;
  variant?: 'standard' | 'half-stick';
}

export const ScrollWheel: React.FC<ScrollWheelProps> = ({
  value,
  onChange,
  min,
  max,
  orientation,
  step = 1,
  tickSpacing = 12,
  unitsPerTick = 10,
  className = '',
  variant = 'standard',
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const currentValueRef = useRef(value);
  currentValueRef.current = value;
  const [isDragging, setIsDragging] = useState(false);
  const [trackWidth, setTrackWidth] = useState(200);
  const [trackHeight, setTrackHeight] = useState(200);

  // Drag tracking state
  const dragStartPos = useRef(0);
  const dragStartValue = useRef(0);
  const lastPos = useRef(0);
  const lastTime = useRef(0);
  
  // Continuous arrow button scroll intervals
  const buttonIntervalRef = useRef<number | null>(null);
  const buttonDelayTimeoutRef = useRef<number | null>(null);

  // Measure container size
  useEffect(() => {
    if (!trackRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setTrackWidth(entry.contentRect.width);
        setTrackHeight(entry.contentRect.height);
      }
    });
    resizeObserver.observe(trackRef.current);
    
    // Set initial size
    setTrackWidth(trackRef.current.clientWidth);
    setTrackHeight(trackRef.current.clientHeight);
    
    return () => resizeObserver.disconnect();
  }, []);

  // Update value within constraints
  const updateValue = (newValue: number) => {
    const clamped = Math.max(min, Math.min(max, Math.round(newValue / step) * step));
    onChange(clamped);
  };

  // Keyboard navigation
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

  // Mouse wheel scroll adjustment
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? step : -step;
    updateValue(value + delta);
  };

  // Pointer drag events
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    const pos = orientation === 'horizontal' ? e.clientX : e.clientY;
    dragStartPos.current = pos;
    dragStartValue.current = value;
    lastPos.current = pos;
    lastTime.current = Date.now();
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;

    const pos = orientation === 'horizontal' ? e.clientX : e.clientY;
    const now = Date.now();
    const dt = now - lastTime.current || 1;
    const dp = pos - lastPos.current;

    // Calculate drag velocity (pixels per ms)
    const velocity = Math.abs(dp) / dt;
    
    // Apply pointer acceleration for rapid spinning, but keep precise movement when dragging slowly
    const accelFactor = velocity > 0.2 ? Math.min(10, 1 + (velocity - 0.2) * 4) : 1;

    // Direct manipulation: pulling left/up exposes larger numbers (increases value)
    const valueDelta = -dp * (unitsPerTick / tickSpacing) * accelFactor;
    
    // Calculate new target value and clamp it
    const nextVal = currentValueRef.current + valueDelta;
    updateValue(nextVal);

    // Save for next step calculation
    lastPos.current = pos;
    lastTime.current = now;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // Explicit Touch Events for iOS support (safari touch compatibility)
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    const touch = e.touches[0];
    const pos = orientation === 'horizontal' ? touch.clientX : touch.clientY;
    dragStartPos.current = pos;
    dragStartValue.current = value;
    lastPos.current = pos;
    lastTime.current = Date.now();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const pos = orientation === 'horizontal' ? touch.clientX : touch.clientY;
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

  // Arrow button click & continuous hold action
  const startContinuousChange = (direction: 1 | -1) => {
    // Single step on click
    updateValue(value + direction * step);

    // Cancel any previous timers
    clearTimers();

    // Set delay before continuous acceleration
    buttonDelayTimeoutRef.current = window.setTimeout(() => {
      let speedMultiplier = 1;
      buttonIntervalRef.current = window.setInterval(() => {
        // Accelerate scroll if they hold it longer
        if (speedMultiplier < 10) speedMultiplier += 0.5;
        updateValue(currentValueRef.current + direction * step * Math.floor(speedMultiplier));
      }, 50);
    }, 300);
  };

  const clearTimers = () => {
    if (buttonDelayTimeoutRef.current) {
      clearTimeout(buttonDelayTimeoutRef.current);
      buttonDelayTimeoutRef.current = null;
    }
    if (buttonIntervalRef.current) {
      clearInterval(buttonIntervalRef.current);
      buttonIntervalRef.current = null;
    }
  };

  // Clear timers on unmount
  useEffect(() => {
    return () => clearTimers();
  }, []);

  const isHorizontal = orientation === 'horizontal';
  const isHalfStick = variant === 'half-stick';

  // Compute ticks to render
  const size = isHorizontal ? trackWidth : trackHeight;
  const center = size / 2;
  
  // Calculate viewport range of values
  const pxPerUnit = tickSpacing / unitsPerTick;
  const visibleRange = center / pxPerUnit;
  
  const minVisibleVal = value - visibleRange;
  const maxVisibleVal = value + visibleRange;

  const minK = Math.floor(minVisibleVal / unitsPerTick);
  const maxK = Math.ceil(maxVisibleVal / unitsPerTick);

  const ticks: React.ReactNode[] = [];
  for (let k = minK; k <= maxK; k++) {
    const tickValue = k * unitsPerTick;
    const offset = (tickValue - value) * pxPerUnit;

    const isMajor = k % 10 === 0; // major tick every 100 units
    const isMedium = k % 5 === 0 && !isMajor; // medium tick every 50 units
    
    // Hide ticks that are outside the boundaries
    if (tickValue < min || tickValue > max) continue;

    const isCenterOverlap = Math.abs(offset) < 2; // Close to center indicator

    if (isHorizontal) {
      // Define tick height for horizontal
      let tickHeightClass = 'h-2';
      let tickColorClass = 'bg-[#e14d2a]/70';
      if (isMajor) {
        tickHeightClass = isHalfStick ? 'h-3' : 'h-4';
        tickColorClass = 'bg-[#e14d2a]';
      } else if (isMedium) {
        tickHeightClass = isHalfStick ? 'h-2' : 'h-3';
        tickColorClass = 'bg-[#e14d2a]/80';
      } else {
        tickHeightClass = isHalfStick ? 'h-1.5' : 'h-2';
      }

      ticks.push(
        <div
          key={`tick-${tickValue}`}
          className="absolute bottom-0 flex flex-col items-center select-none pointer-events-none"
          style={{
            left: `${center + offset}px`,
            transform: 'translateX(-50%)',
          }}
        >
          {isMajor && !isHalfStick && (
            <span className="text-[9px] font-bold text-mammut-white/40 mb-1 leading-none select-none">
              {tickValue}
            </span>
          )}
          <div
            className={`w-[2px] rounded-full transition-colors ${
              isCenterOverlap ? 'opacity-0' : `${tickHeightClass} ${tickColorClass}`
            }`}
          />
        </div>
      );
    } else {
      // Define tick width for vertical
      let tickWidthClass = 'w-2';
      let tickColorClass = 'bg-[#e14d2a]/70';
      if (isMajor) {
        tickWidthClass = isHalfStick ? 'w-3' : 'w-4';
        tickColorClass = 'bg-[#e14d2a]';
      } else if (isMedium) {
        tickWidthClass = isHalfStick ? 'w-2' : 'w-3';
        tickColorClass = 'bg-[#e14d2a]/80';
      } else {
        tickWidthClass = isHalfStick ? 'w-1.5' : 'w-2';
      }

      ticks.push(
        <div
          key={`tick-${tickValue}`}
          className="absolute right-0 flex items-center select-none pointer-events-none"
          style={{
            top: `${center + offset}px`,
            transform: 'translateY(-50%)',
          }}
        >
          {isMajor && !isHalfStick && (
            <span className="text-[9px] font-bold text-mammut-white/40 mr-2 leading-none select-none">
              {tickValue}
            </span>
          )}
          <div
            className={`h-[2px] rounded-full transition-colors ${
              isCenterOverlap ? 'opacity-0' : `${tickWidthClass} ${tickColorClass}`
            }`}
          />
        </div>
      );
    }
  }

  // Cross-browser inline masking styles for iOS Safari support (replaces Tailwind arbitrary classes)
  const maskStyle: React.CSSProperties = isHorizontal
    ? {
        WebkitMaskImage: 'linear-gradient(to right, transparent, white 15%, white 85%, transparent)',
        maskImage: 'linear-gradient(to right, transparent, white 15%, white 85%, transparent)',
      }
    : {
        WebkitMaskImage: 'linear-gradient(to bottom, transparent, white 15%, white 85%, transparent)',
        maskImage: 'linear-gradient(to bottom, transparent, white 15%, white 85%, transparent)',
      };

  const trackSizeClass = isHorizontal 
    ? (isHalfStick ? 'h-5 w-full' : 'h-10 w-full')
    : (isHalfStick ? 'w-5 h-full' : 'w-10 h-full');

  return (
    <div 
      className={`flex select-none touch-none ${
        isHorizontal ? 'flex-row items-center w-full' : 'flex-col items-center h-full'
      } ${className}`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Decrement Button */}
      {!isHalfStick && (
        <button
          type="button"
          onPointerDown={() => startContinuousChange(-1)}
          onPointerUp={clearTimers}
          onPointerLeave={clearTimers}
          className={`flex items-center justify-center bg-mammut-dark hover:bg-mammut-gold/20 active:bg-mammut-gold/40 border border-mammut-border text-mammut-gold transition-colors font-bold shadow-md rounded-md cursor-pointer select-none shrink-0 ${
            isHorizontal ? 'w-8 h-8 mr-1' : 'w-8 h-8 mb-1'
          }`}
        >
          <span className={isHorizontal ? 'inline-block transform -rotate-90' : ''}>▲</span>
        </button>
      )}

      {/* Track */}
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
        className={`relative overflow-hidden cursor-ew-resize bg-mammut-darker/85 border border-mammut-border/80 hover:border-mammut-gold/40 hover:bg-mammut-darker/95 transition-colors duration-200 rounded-lg flex-grow flex items-center justify-center select-none touch-none ${trackSizeClass}`}
      >
        {/* Sliding Ticks */}
        {ticks}

        {/* Center Target Indicator Pointer (Yellow/Gold) */}
        <div
          className={`absolute pointer-events-none rounded-full shadow-[0_0_8px_rgba(234,182,118,0.4)] ${
            isHorizontal 
              ? `left-1/2 bottom-0 w-[3px] ${isHalfStick ? 'h-4' : 'h-6'} bg-[#ffc882] -translate-x-1/2 z-10` 
              : `top-1/2 right-0 ${isHalfStick ? 'w-4' : 'w-6'} h-[3px] bg-[#ffc882] -translate-y-1/2 z-10`
          }`}
        />

        {/* Floating tooltip badge while dragging to clear finger occlusion */}
        {isDragging && (
          <div 
            className={`absolute bg-mammut-gold text-black text-[10px] font-black px-2.5 py-1.5 rounded-md shadow-lg pointer-events-none whitespace-nowrap z-30 transition-opacity duration-150 ${
              isHorizontal 
                ? 'bottom-full mb-3 left-1/2 -translate-x-1/2' 
                : 'left-full ml-3 top-1/2 -translate-y-1/2'
            }`}
          >
            {value} mm
          </div>
        )}
      </div>

      {/* Increment Button */}
      {!isHalfStick && (
        <button
          type="button"
          onPointerDown={() => startContinuousChange(1)}
          onPointerUp={clearTimers}
          onPointerLeave={clearTimers}
          className={`flex items-center justify-center bg-mammut-dark hover:bg-mammut-gold/20 active:bg-mammut-gold/40 border border-mammut-border text-mammut-gold transition-colors font-bold shadow-md rounded-md cursor-pointer select-none shrink-0 ${
            isHorizontal ? 'w-8 h-8 ml-1' : 'w-8 h-8 mt-1'
          }`}
        >
          <span className={isHorizontal ? 'inline-block transform -rotate-90' : ''}>▼</span>
        </button>
      )}
    </div>
  );
};

