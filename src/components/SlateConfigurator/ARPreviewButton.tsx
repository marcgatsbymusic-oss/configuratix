import { useState, useEffect } from 'react';
import { Box, X } from 'lucide-react';

export function ARPreviewButton({ dimensions }: { dimensions: { width: number, height: number } }) {
  const [showPreview, setShowPreview] = useState(false);
  const [modelViewerLoaded, setModelViewerLoaded] = useState(false);

  useEffect(() => {
    // Dynamically inject Google's model-viewer script so we don't block the main thread
    if (showPreview && !document.querySelector('script[src*="model-viewer"]')) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js';
      script.onload = () => setModelViewerLoaded(true);
      document.head.appendChild(script);
    } else if (document.querySelector('script[src*="model-viewer"]')) {
      setModelViewerLoaded(true);
    }
  }, [showPreview]);

  return (
    <>
      <button 
        onClick={() => setShowPreview(true)}
        className="w-full bg-indigo-600 border-2 border-indigo-400 text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 font-black tracking-widest uppercase text-[10px] md:text-xs shadow-[0_0_15px_rgba(79,70,229,0.4)] hover:bg-indigo-500 transition-all active:scale-95"
      >
        <Box size={16} /> Beta: AR Preview
      </button>

      {showPreview && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col backdrop-blur-lg">
          <div className="flex items-center justify-between p-4 bg-[#111112] border-b border-[#2a2a2b]">
            <h3 className="text-white font-bold tracking-widest uppercase text-sm flex items-center gap-2"><Box size={16} className="text-indigo-400"/> AR Window View</h3>
            <button 
              onClick={() => setShowPreview(false)}
              className="p-2 bg-[#1a1a1b] text-white/50 hover:text-white rounded-lg transition-colors border border-white/5"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 w-full h-full relative">
            {/* The model-viewer component uses a standard generic window glb for placeholder AR viewing */}
            {modelViewerLoaded ? (
              // @ts-ignore - model-viewer is a web component
              <model-viewer
                src="https://modelviewer.dev/shared-assets/models/Astronaut.glb" // Note: A .glb file is mandatory here. Astronaut kept until a window .glb is provided.
                ios-src="/models/Fenetre_PVC_135_120.usdz"
                alt="3D Window Preview"
                shadow-intensity="1"
                camera-controls auto-rotate ar
                style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
              >
                {/* Fallback Slot for devices mapping to Scene Viewer / Quick Look */}
                <div slot="poster" className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <button 
                  slot="ar-button" 
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white text-black font-black uppercase text-xs px-6 py-4 rounded-xl shadow-[0_4px_20px_rgba(255,255,255,0.3)] active:scale-95 transition-all w-max whitespace-nowrap"
                >
                  View full window in AR
                </button>
              {/* @ts-ignore */}
              </model-viewer>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white/50 font-bold uppercase tracking-widest text-xs flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  Loading AR Engine...
                </div>
              </div>
            )}
            
            {/* Context Overlay */}
            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm border border-white/10 p-3 rounded-lg pointer-events-none">
              <div className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-1">Scaled Output</div>
              <div className="text-[#eab676] font-black text-sm">{dimensions.width}x{dimensions.height}mm</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
