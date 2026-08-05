import { useEffect, useState } from 'react';
import { useDoorConfigurator, generateAssetURLs } from '../../store/doorSimStore';
import { Loader2 } from 'lucide-react';

export function DoorCanvasEngine() {
  const [isRendering, setIsRendering] = useState(false);
  const [layers, setLayers] = useState<{
    glass: string | null;
    frame: string | null;
    leaf: string | null;
    pattern: string | null;
    handle: string | null;
  }>({
    glass: null,
    frame: null,
    leaf: null,
    pattern: null,
    handle: null,
  });
  
  const state = useDoorConfigurator();
  const urls = generateAssetURLs(state);

  // Render Layers sequentially into state URLs
  useEffect(() => {
    let isMounted = true;

    const loadLayer = async (url: string | null, applyTintHex?: string): Promise<string | null> => {
      if (!url) return null;
      try {
         if (url.endsWith('.svg')) {
             const response = await fetch(url);
             if (!response.ok) return null;
             let svgText = await response.text();
             
             // Inject dynamic tint color directly into the SVG stylesheet
             if (applyTintHex) {
                svgText = svgText.replace('</style>', `\n.fill { fill: ${applyTintHex} !important; }\n</style>`);
             }
             
             // Use Base64 encoding to ensure internal `#` references for gradients are not corrupted
             const b64 = btoa(unescape(encodeURIComponent(svgText)));
             return 'data:image/svg+xml;base64,' + b64;
         }
         return url;
      } catch (err) {
         console.error(`Failed to fetch layer: ${url}`, err);
         return null;
      }
    };

    const processLayers = async () => {
      setIsRendering(true);
      
      const [glass, frame, leaf, pattern, handle] = await Promise.all([
        loadLayer(urls.glassUrl),
        loadLayer(urls.frameMask, urls.frameColorHex),
        loadLayer(urls.leafMask, urls.leafColorHex),
        loadLayer(urls.patternMaskUrl),
        loadLayer(urls.handleUrl)
      ]);

      if (isMounted) {
        setLayers({ glass, frame, leaf, pattern, handle });
        setIsRendering(false);
      }
    };

    processLayers();

    return () => {
      isMounted = false;
    };
  }, [
     urls.frameColorHex, 
     urls.leafColorHex, 
     urls.glassUrl, 
     urls.patternMaskUrl, 
     urls.handleUrl,
     urls.frameMask,
     urls.leafMask
  ]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gray-100 rounded-lg shadow-inner overflow-hidden">
      {/* Loading Overlay Transition */}
      {isRendering && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm transition-opacity duration-300">
           <Loader2 className="w-10 h-10 text-mammut-gold animate-spin" />
         </div>
      )}
      
      {/* 
        Pure DOM Layering System
        We use object-contain so all SVGs and WebPs perfectly scale to the container's bounds while preserving their identical 2000x2400 intrinsic aspect ratios.
      */}
      <div className="relative w-[90%] h-[90%]">
         {layers.glass && <img src={layers.glass} className="absolute inset-0 w-full h-full object-contain pointer-events-none" alt="Glass" />}
         {layers.frame && <img src={layers.frame} className="absolute inset-0 w-full h-full object-contain pointer-events-none" alt="Frame" />}
         {layers.leaf && <img src={layers.leaf} className="absolute inset-0 w-full h-full object-contain pointer-events-none" alt="Leaf" />}
         {layers.pattern && <img src={layers.pattern} className="absolute inset-0 w-full h-full object-contain pointer-events-none" alt="Pattern" />}
         {layers.handle && <img src={layers.handle} className="absolute inset-0 w-full h-full object-contain pointer-events-none" alt="Handle" />}
      </div>
    </div>
  );
}
