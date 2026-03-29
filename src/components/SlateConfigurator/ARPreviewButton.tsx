import { useState } from 'react';
import { Box, X } from 'lucide-react';

export function ARPreviewButton({ dimensions }: { dimensions: { width: number, height: number } }) {
  const [showPreview, setShowPreview] = useState(false);
  const isIOS = typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

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
          
          <div className="flex-1 w-full h-full relative flex items-center justify-center">
            {isIOS ? (
              <div className="flex flex-col items-center justify-center px-6 text-center h-full w-full bg-[#111112]">
                <Box size={64} className="text-indigo-500 mb-6 opacity-80 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" strokeWidth={1} />
                <h4 className="text-white font-black uppercase tracking-widest text-2xl mb-4">iOS AR Ready</h4>
                <p className="text-white/60 text-sm mb-12 max-w-xs leading-relaxed font-medium">
                  Your device supports native Apple AR Quick Look. Tap below to launch your camera and project the `.usdz` window blueprint.
                </p>
                <a 
                  href="/models/Fenetre_PVC_135_120.usdz" 
                  rel="ar" 
                  className="bg-indigo-600 text-white font-black uppercase tracking-widest text-sm px-10 py-5 rounded-2xl shadow-[0_10px_40px_rgba(79,70,229,0.4)] hover:bg-indigo-500 active:scale-95 transition-all w-full max-w-[300px]"
                >
                  Start AR Session
                </a>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center px-6 text-center h-full w-full bg-[#111112]">
                 <Box size={48} className="text-rose-500 mb-6 opacity-50" strokeWidth={1} />
                 <h4 className="text-white font-black uppercase tracking-widest text-xl mb-3">GLB File Required</h4>
                 <p className="text-white/50 text-sm max-w-xs leading-relaxed bg-[#1a1a1b] p-6 rounded-2xl border border-white/5">
                   Android and WebXR strictly require a <strong className="text-emerald-400 font-black">.glb</strong> 3D file to initialize the engine.<br/><br/>
                   Currently, only the Apple format (.usdz) has been uploaded to the server.
                 </p>
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
