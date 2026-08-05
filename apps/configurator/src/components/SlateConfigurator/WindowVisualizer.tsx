import { useState, useEffect } from 'react';
import { getTypologyImagePath } from './types';
import { useThemeStore } from '../../store/useThemeStore';

export interface WindowVisualizerProps {
  typology: string;
  width: number;
  height: number;
  infills?: { width?: string | number; height?: string | number }[];
}

export function WindowVisualizer({ typology, infills }: WindowVisualizerProps) {
  const isMultiSash = typology.match(/^F2[0-5][0-9]$/) && infills && infills.length >= 2;
  const [imgSrc, setImgSrc] = useState(() => getTypologyImagePath(typology));
  const [hasError, setHasError] = useState(false);
  const { theme } = useThemeStore();
  const isLight = theme === 'light' || document.documentElement.getAttribute('data-theme') === 'light';

  useEffect(() => {
    setImgSrc(getTypologyImagePath(typology));
    setHasError(false);
  }, [typology]);

  const handleError = () => {
    if (!imgSrc.endsWith('.svg?v=2')) {
      setImgSrc(`/assets/windowtypes/${typology}.svg?v=2`);
    } else {
      setHasError(true);
    }
  };
  
  return (
    <div 
      style={{
        backgroundColor: isLight ? '#ffffff' : 'var(--theme-bg-base)',
        borderColor: isLight ? '#e2e8f0' : 'var(--theme-mammut-border)'
      }}
      className="relative w-full aspect-square border rounded-lg flex items-center justify-center p-16"
    >
      
      {/* Base Image */}
      {hasError ? (
        <div className="fallback w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-lg bg-gray-100 text-gray-500 font-bold z-10 relative">
          <span>Missing Image</span>
          <span className="text-xs font-normal mt-2">{typology}.svg</span>
        </div>
      ) : (
        <img 
          src={imgSrc} 
          alt={typology}
          className="w-full h-full object-contain relative z-10 drop-shadow-md"
          style={{ filter: isLight ? 'invert(1)' : 'none' }}
          onError={handleError}
        />
      )}
      
      {/* Dynamic Width Dimension Line */}
      <div className="absolute bottom-6 left-16 right-16 flex flex-col items-center justify-center z-20 gap-2">
        {isMultiSash && (
          <div className="w-full flex gap-1">
            <div className="flex-1 border-b border-gray-400 relative opacity-70">
              <div className="absolute top-1/2 left-0 w-2 h-2 border-l border-gray-400 -translate-y-1/2"></div>
              <div className="absolute top-1/2 right-0 w-2 h-2 border-r border-gray-400 -translate-y-1/2"></div>
            </div>
            <div className="flex-1 border-b border-gray-400 relative opacity-70">
              <div className="absolute top-1/2 left-0 w-2 h-2 border-l border-gray-400 -translate-y-1/2"></div>
              <div className="absolute top-1/2 right-0 w-2 h-2 border-r border-gray-400 -translate-y-1/2"></div>
            </div>
          </div>
        )}
        <div className="w-full border-b border-black relative">
          <div className="absolute top-1/2 left-0 w-3 h-3 border-l-2 border-black -translate-y-1/2"></div>
          <div className="absolute top-1/2 right-0 w-3 h-3 border-r-2 border-black -translate-y-1/2"></div>
        </div>
      </div>

      {/* Dynamic Height Dimension Line */}
      <div className="absolute top-16 bottom-16 left-6 flex flex-col items-center justify-center z-20">
        <div className="h-full border-l border-black relative">
          <div className="absolute top-0 left-1/2 w-3 h-3 border-t-2 border-black -translate-x-1/2"></div>
          <div className="absolute bottom-0 left-1/2 w-3 h-3 border-b-2 border-black -translate-x-1/2"></div>
        </div>
      </div>

    </div>
  );
}
