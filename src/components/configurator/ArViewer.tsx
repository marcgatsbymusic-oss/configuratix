import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import '@google/model-viewer';

const ModelViewer = 'model-viewer' as any;

const isAndroid = typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);

// Public rescaled GLB for Android Scene Viewer.
// blob: URLs are private to the browser process — the native Scene Viewer app cannot fetch them.
// WebXR on Android causes jitter but no model (Chromium 147+ XRProjectionLayer regression).
// Solution: skip WebXR entirely on Android and go straight to Scene Viewer intent URL.
const PUBLIC_GLB = 'https://fantastic-octo-giggle-five.vercel.app/models/window-scene.glb';
const encodedFallback = encodeURIComponent('https://developers.google.com/ar');
const ANDROID_SCENE_VIEWER_INTENT = `intent://arvr.google.com/scene-viewer/1.1?file=${encodeURIComponent(PUBLIC_GLB)}&mode=ar_preferred&title=Mammut%20Window&resizable=false#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;S.browser_fallback_url=${encodedFallback};end;`;

interface ArViewerProps {
  sceneGroup: THREE.Group | THREE.Scene | null;
  placement: 'wall' | 'floor';
  onClose: () => void;
}

export const ArViewer: React.FC<ArViewerProps> = ({ sceneGroup, placement, onClose }) => {
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [blobSize, setBlobSize] = useState<number | null>(null);

  // Export Three.js scene → GLB blob. Only needed for iOS quick-look.
  // Android skips this entirely and uses the public pre-baked GLB via Scene Viewer.
  useEffect(() => {
    if (!sceneGroup || isAndroid) return;

    const exporter = new GLTFExporter();
    exporter.parse(
      sceneGroup,
      (gltf: any) => {
        const blob = new Blob([gltf as ArrayBuffer], { type: 'model/gltf-binary' });
        setBlobSize(blob.size);
        setModelUrl(URL.createObjectURL(blob));
      },
      (err: any) => {
        console.error('GLTF Export Error:', err);
        setError('Failed to generate AR model.');
      },
      { binary: true }
    );

    return () => {
      setModelUrl(prev => { if (prev) URL.revokeObjectURL(prev); return null; });
    };
  }, [sceneGroup]);

  // ─── ANDROID: Needle Engine AR page (bypasses WebXR/blob issues) ─────────
  if (isAndroid) {
    const needleArUrl = '/ar-preview';
    const sceneViewerFallback = ANDROID_SCENE_VIEWER_INTENT;

    return (
      <div className="fixed inset-0 z-50 bg-[#0a0a0b] flex flex-col">
        <div className="w-full bg-gray-900 text-white p-4 flex items-center justify-between shadow-md">
          <h2 className="font-bold text-lg">AR Preview</h2>
          <button
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm font-bold uppercase tracking-wider"
          >
            Close
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-8 p-8">
          {/* Scanning animation */}
          <div className="w-32 h-40 border-2 border-mammut-gold/60 rounded-xl relative flex items-center justify-center overflow-hidden bg-gray-900/50">
            <div
              className="w-full h-[2px] bg-mammut-gold shadow-[0_0_12px_#cc9900]"
              style={{ animation: 'arScan 2s ease-in-out infinite' }}
            />
          </div>
          <style>{`@keyframes arScan { 0%{transform:translateY(-60px)} 50%{transform:translateY(60px)} 100%{transform:translateY(-60px)} }`}</style>

          <div className="text-center max-w-xs">
            <h3 className="text-white font-black text-xl uppercase tracking-widest mb-3">
              Place on your {placement}
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Opens the AR viewer — scan your {placement} and place the window at real scale.
            </p>
          </div>

          {/* Primary: Needle Engine AR page */}
          <a
            href={needleArUrl}
            className="w-full max-w-xs bg-mammut-gold text-black font-black uppercase tracking-widest py-5 rounded-2xl text-center shadow-[0_0_30px_rgba(234,182,118,0.4)] text-sm no-underline block"
          >
            Launch AR Viewer
          </a>

          {/* Fallback: Google Scene Viewer via intent */}
          <a
            href={sceneViewerFallback}
            className="w-full max-w-xs border border-gray-700 text-gray-400 font-bold uppercase tracking-widest py-3 rounded-xl text-center text-xs no-underline block hover:border-gray-500 hover:text-gray-300 transition-colors"
          >
            or Open in Google AR
          </a>
        </div>
      </div>
    );
  }

  // ─── iOS / Desktop: model-viewer with Apple Quick Look ───────────────────
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="w-full bg-gray-900 text-white p-4 flex items-center justify-between shadow-md z-10 relative">
        <h2 className="font-bold text-lg">AR Preview ({placement === 'wall' ? 'Wall' : 'Floor'})</h2>
        <button
          onClick={onClose}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm font-bold uppercase tracking-wider"
        >
          Close
        </button>
      </div>

      <div className="flex-1 w-full bg-gray-800 relative flex items-center justify-center">
        {error ? (
          <div className="text-red-400 font-bold p-8 text-center">{error}</div>
        ) : !modelUrl ? (
          <div className="text-mammut-gold font-bold p-8 text-center animate-pulse">Generating 3D AR Model...</div>
        ) : (
          <ModelViewer
            src={modelUrl}
            ar="true"
            ar-modes="quick-look"
            ar-placement={placement}
            camera-controls="true"
            auto-rotate="true"
            shadow-intensity="1"
            style={{ width: '100%', height: '100%' }}
            alt="AR Window Configuration"
            onError={(e: any) => {
              console.error('ModelViewer Error:', e);
              setError('Failed to load 3D model into AR engine.');
            }}
          >
            <>
              <style>{`
                @keyframes scanLine {
                  0% { transform: translateY(-100%); }
                  50% { transform: translateY(100%); }
                  100% { transform: translateY(-100%); }
                }
                .animate-scan { animation: scanLine 2s ease-in-out infinite; }
              `}</style>
              <div slot="poster" className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-white bg-black/50 px-4 py-2 rounded-full text-sm">Loading Preview...</div>
              </div>
              <button
                slot="ar-button"
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center z-20 hover:scale-[1.02] transition-transform cursor-pointer border-none bg-transparent outline-none w-[90%] max-w-[320px]"
              >
                <div className="bg-black/90 backdrop-blur-xl border border-gray-800 rounded-3xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.8)] flex flex-col items-center pointer-events-auto w-full relative overflow-hidden">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 bg-mammut-gold/20 blur-3xl rounded-full" />
                  <img src="/assets/mammut-logo-icon.png" alt="Mammut" className="h-6 mb-6 opacity-90 relative z-10" />
                  <div className="flex items-center gap-4 mb-6 relative z-10">
                    <div className="w-8 h-12 border-2 border-mammut-gold/60 rounded-md relative flex items-center justify-center overflow-hidden shrink-0 bg-gray-900/50">
                      <div className="w-full h-[2px] bg-mammut-gold animate-scan shadow-[0_0_8px_#cc9900]" />
                    </div>
                    <div className="text-left">
                      <p className="text-white font-black text-sm tracking-wider uppercase">Scan your {placement}</p>
                      <p className="text-gray-400 text-[10px] mt-1 leading-tight">
                        Point camera at the {placement} &amp; move slowly to place window
                      </p>
                      {blobSize && (
                        <p className="text-mammut-gold text-[9px] mt-2 font-mono">GLTF Size: {(blobSize / 1024).toFixed(1)} KB</p>
                      )}
                    </div>
                  </div>
                  <div className="bg-mammut-gold text-black font-black uppercase tracking-widest px-8 py-3 rounded-full w-full text-sm shadow-[0_0_20px_rgba(204,153,0,0.3)] relative z-10 text-center">
                    Launch AR
                  </div>
                </div>
              </button>
            </>
          </ModelViewer>
        )}
      </div>

      <div className="p-4 bg-gray-900 text-gray-400 text-xs text-center">
        AR Preview via Apple Quick Look. Point your camera at a {placement} surface.
      </div>
    </div>
  );
};
