import { useState, useEffect } from 'react';
import { Box, X, Smartphone } from 'lucide-react';

export function ARPreviewButton() {
  const [showPreview, setShowPreview] = useState(false);
  const [deviceEnv, setDeviceEnv] = useState<'ios' | 'android' | 'desktop'>('desktop');

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const ua = navigator.userAgent.toLowerCase();
      if (/ipad|iphone|ipod/.test(ua) && !(window as any).MSStream) {
        setDeviceEnv('ios');
      } else if (/android/.test(ua)) {
        setDeviceEnv('android');
      } else {
        setDeviceEnv('desktop');
      }
    }
  }, []);

  // Direct Vercel URL to avoid Intent relative-path resolving errors in Android Scene Viewer
  const appDomain = "fantastic-octo-giggle-five.vercel.app";
  
  // The official Android Scene Viewer deep-link intent
  const androidIntent = `intent://${appDomain}/models/Fenetre_PVC_135_120.glb#Intent;scheme=https;file=https://${appDomain}/models/Fenetre_PVC_135_120.glb;package=com.google.ar.core;action=android.intent.action.VIEW;S.browser_fallback_url=https://developers.google.com/ar;end;`;

  return (
    <>
      <button 
        onClick={() => setShowPreview(true)}
        className="w-full bg-indigo-600 border-2 border-indigo-400 text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 font-black tracking-widest uppercase text-[10px] md:text-xs shadow-[0_0_15px_rgba(79,70,229,0.4)] hover:bg-indigo-500 transition-all active:scale-95"
      >
        <Box size={16} /> Beta: Native AR View
      </button>

      {showPreview && (
        <div className="fixed inset-0 z-[100] bg-[#111112]/95 flex flex-col backdrop-blur-xl">
          <div className="flex items-center justify-between p-4 bg-black/50 border-b border-white/5">
            <h3 className="text-white font-black tracking-widest uppercase text-sm flex items-center gap-2">
              <Smartphone size={16} className="text-indigo-400"/> System AR Launcher
            </h3>
            <button 
              onClick={() => setShowPreview(false)}
              className="p-2 bg-white/5 text-white/50 hover:text-white rounded-lg transition-colors border border-white/5"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 w-full h-full relative flex items-center justify-center px-6 text-center">
            {deviceEnv === 'ios' && (
              <div className="flex flex-col items-center justify-center h-full w-full max-w-sm animate-in fade-in slide-in-from-bottom-5">
                <Box size={72} className="text-indigo-400 mb-6 drop-shadow-[0_0_20px_rgba(99,102,241,0.5)]" strokeWidth={1} />
                <h4 className="text-white font-black uppercase tracking-widest text-2xl mb-4">iOS Quick Look</h4>
                <p className="text-indigo-200/60 text-sm mb-12 leading-relaxed font-medium">
                  Launch the native Apple AR camera to project your `.usdz` window blueprint into reality.
                </p>
                <a 
                  href="/models/Fenetre_PVC_135_120.usdz" 
                  rel="ar" 
                  className="bg-indigo-600 text-white font-black uppercase tracking-widest text-[13px] px-10 py-5 rounded-2xl shadow-[0_10px_40px_rgba(79,70,229,0.4)] hover:bg-indigo-500 active:scale-95 transition-all w-full border border-indigo-400/50"
                >
                  Start Apple AR
                </a>
              </div>
            )}
            
            {deviceEnv === 'android' && (
              <div className="flex flex-col items-center justify-center h-full w-full max-w-sm animate-in fade-in slide-in-from-bottom-5">
                <Box size={72} className="text-emerald-400 mb-6 drop-shadow-[0_0_20px_rgba(52,211,153,0.5)]" strokeWidth={1} />
                <h4 className="text-white font-black uppercase tracking-widest text-2xl mb-4">Android AR</h4>
                <p className="text-emerald-200/60 text-sm mb-12 leading-relaxed font-medium">
                  Launch Google Scene Viewer to project your 3D `.glb` window right into your living room.
                </p>
                <a 
                  href={androidIntent} 
                  className="bg-emerald-600 text-white font-black uppercase tracking-widest text-[13px] px-10 py-5 rounded-2xl shadow-[0_10px_40px_rgba(52,211,153,0.4)] hover:bg-emerald-500 active:scale-95 transition-all w-full border border-emerald-400/50"
                >
                  Start Google AR
                </a>
              </div>
            )}

            {deviceEnv === 'desktop' && (
              <div className="flex flex-col items-center justify-center h-full w-full max-w-sm opacity-50">
                <Smartphone size={48} className="text-white/30 mb-6" strokeWidth={1} />
                <h4 className="text-white/50 font-black uppercase tracking-widest text-xl mb-3">Mobile Required</h4>
                <p className="text-white/40 text-sm leading-relaxed p-6 bg-black/30 rounded-2xl border border-white/5">
                  Native AR is only supported on mobile hardware (iOS / Android). Please open this URL on your phone camera.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
