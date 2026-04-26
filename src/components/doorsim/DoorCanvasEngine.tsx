import { useEffect, useRef } from 'react';
import * as fabric from 'fabric';

export interface DoorConfig {
  frameColorHex: string;
  leafColorHex: string;
  glassUrl: string | null;
  patternMaskUrl: string | null;
  handleUrl: string | null;
}

interface DoorCanvasEngineProps {
  config: DoorConfig;
}

// Map from RAL or hex to actual Drutex color masks is complex in the real visualizer.
// We will use fabric's built-in blend mode tinting to colorize the frame and leaf dynamically.
const FRAME_BASE_URL = '/doorsim-assets/assets/system/MB86N/Drzwi-MB86N-wz-oscieznica.svg';
const LEAF_BASE_URL = '/doorsim-assets/assets/system/MB86N/Drzwi-MB86N-wz-rama-skrzydla.svg';

export function DoorCanvasEngine({ config }: DoorCanvasEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Fabric canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 500,
      height: 800,
      backgroundColor: '#f3f4f6' // light gray background for now
    });
    fabricRef.current = canvas;

    // Helper to load and add image
    const loadLayer = async (url: string, tintHex?: string, zIndex?: number) => {
      try {
        const img = await fabric.FabricImage.fromURL(url);
        
        // Scale to fit canvas, preserving aspect ratio
        img.scaleToHeight(700);
        img.set({
          left: canvas.width! / 2 - img.getScaledWidth() / 2,
          top: 50,
          selectable: false,
          evented: false,
        });

        if (tintHex) {
            // Apply color overlay using BlendColor
            const filter = new fabric.filters.BlendColor({
              color: tintHex,
              mode: 'multiply',
              alpha: 0.9
            });
            img.filters = [filter];
            img.applyFilters();
        }

        canvas.add(img);
        
        if (zIndex !== undefined) {
           // We could use insertAt, but for simplicity we rely on load order or moveTo
        }
      } catch (err) {
        console.error(`Failed to load layer: ${url}`, err);
      }
    };

    const renderLayers = async () => {
      canvas.clear();
      canvas.backgroundColor = '#f3f4f6';

      // 1. Load Glass (background layer of door)
      if (config.glassUrl) {
         await loadLayer(config.glassUrl);
      } else {
         // Default glass if none selected
         await loadLayer('/doorsim-assets/assets/glass/szyba_antisol_szary.webp');
      }

      // 2. Load Frame
      await loadLayer(FRAME_BASE_URL, config.frameColorHex);

      // 3. Load Leaf / Wing
      await loadLayer(LEAF_BASE_URL, config.leafColorHex);

      // 4. Load Pattern / Mask
      if (config.patternMaskUrl) {
        await loadLayer(config.patternMaskUrl);
      }

      // 5. Load Handle
      if (config.handleUrl) {
        await loadLayer(config.handleUrl);
      }

      canvas.requestRenderAll();
    };

    renderLayers();

    return () => {
      canvas.dispose();
    };
  }, [config]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg shadow-inner overflow-hidden">
      <canvas ref={canvasRef} />
    </div>
  );
}
