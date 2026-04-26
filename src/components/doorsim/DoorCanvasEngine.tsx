import { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { useDoorConfigurator, generateAssetURLs } from '../../store/doorSimStore';
import { Loader2 } from 'lucide-react';

export function DoorCanvasEngine() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  
  const state = useDoorConfigurator();
  const urls = generateAssetURLs(state);

  // Initialize Canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Set a container that respects its parent's dimensions but provides a high-res internal canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 500,
      height: 800,
      backgroundColor: 'transparent',
      selection: false
    });
    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, []);

  // Render Layers sequentially
  useEffect(() => {
    if (!fabricCanvas) return;

    const renderLayers = async () => {
      setIsRendering(true);
      fabricCanvas.clear();

      const loadLayer = (url: string | null, applyTintHex?: string): Promise<fabric.FabricImage | null> => {
        if (!url) return Promise.resolve(null);
        return new Promise((resolve) => {
          fabric.FabricImage.fromURL(url).then((img) => {
             img.scaleToHeight(700);
             img.set({
               left: fabricCanvas.width! / 2 - img.getScaledWidth() / 2,
               top: 50,
               selectable: false,
               evented: false,
             });

             if (applyTintHex) {
                // If it's an SVG mask from our local test assets, we still need to tint it.
                // Once we have pure scraped PNGs, we won't need this block.
                const filter = new fabric.filters.BlendColor({
                  color: applyTintHex,
                  mode: 'multiply',
                  alpha: 0.9
                });
                img.filters = [filter];
                img.applyFilters();
             }
             resolve(img);
          }).catch((err) => {
             console.error(`Failed to load layer: ${url}`, err);
             resolve(null);
          });
        });
      };

      try {
        // Load in strict Z-Index order: Glass -> Frame -> Leaf -> Pattern -> Handle
        // Note: applyTintHex is kept temporarily to support the local SVGs. Once replaced with pure PNGs, this parameter can be dropped.
        const layers = await Promise.all([
          loadLayer(urls.glassUrl),
          loadLayer(urls.frameMask, urls.frameColorHex),
          loadLayer(urls.leafMask, urls.leafColorHex),
          loadLayer(urls.patternMaskUrl),
          loadLayer(urls.handleUrl)
        ]);

        layers.forEach(layer => {
          if (layer) fabricCanvas.add(layer);
        });
        
        fabricCanvas.requestRenderAll();
      } catch (err) {
        console.error("Failed to load asset layers", err);
      } finally {
        setIsRendering(false);
      }
    };

    renderLayers();
  }, [
     fabricCanvas, 
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
      <canvas ref={canvasRef} />
    </div>
  );
}
