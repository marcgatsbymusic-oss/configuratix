import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import '@google/model-viewer';

const ModelViewer = 'model-viewer' as any;

interface ArViewerProps {
  sceneGroup: THREE.Group | THREE.Scene | null; // The Three.js group to export
  placement: 'wall' | 'floor';
  onClose: () => void;
}

export const ArViewer: React.FC<ArViewerProps> = ({ sceneGroup, placement, onClose }) => {
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [blobSize, setBlobSize] = useState<number | null>(null);

  useEffect(() => {
    if (!sceneGroup) {
      setError("No 3D scene provided for AR export.");
      return;
    }

    const exportScene = async () => {
      try {
        const exporter = new GLTFExporter();
        exporter.parse(
          sceneGroup,
          (gltf: any) => {
            const blob = new Blob([gltf as ArrayBuffer], { type: 'model/gltf-binary' });
            setBlobSize(blob.size);
            const url = URL.createObjectURL(blob);
            setModelUrl(url);
          },
          (err: any) => {
            console.error("GLTF Export Error:", err);
            setError("Failed to generate AR model.");
          },
          { binary: true } // Must be binary for model-viewer to easily digest without external assets
        );
      } catch (err) {
        console.error("Error setting up export:", err);
        setError("Error setting up AR export.");
      }
    };

    exportScene();

    return () => {
      if (modelUrl) {
        URL.revokeObjectURL(modelUrl);
      }
    };
  }, [sceneGroup]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header Bar */}
      <div className="w-full bg-gray-900 text-white p-4 flex items-center justify-between shadow-md z-10 relative">
        <h2 className="font-bold text-lg">AR Preview ({placement === 'wall' ? 'Wall' : 'Floor'})</h2>
        <button 
          onClick={onClose}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm font-bold uppercase tracking-wider"
        >
          Close
        </button>
      </div>

      {/* Model Viewer Container */}
      <div className="flex-1 w-full bg-gray-800 relative flex items-center justify-center">
        {error ? (
          <div className="text-red-400 font-bold p-8 text-center">{error}</div>
        ) : !modelUrl ? (
          <div className="text-mammut-gold font-bold p-8 text-center animate-pulse">Generating 3D AR Model...</div>
        ) : (
          <ModelViewer
            src={modelUrl}
            ar="true"
            ar-modes="webxr quick-look"
            ar-placement={placement}
            camera-controls="true"
            auto-rotate="true"
            shadow-intensity="1"
            style={{ width: '100%', height: '100%' }}
            alt="AR Window Configuration"
          >
            <>
              <style>
                {`
                  @keyframes scanLine {
                    0% { transform: translateY(-100%); }
                    50% { transform: translateY(100%); }
                    100% { transform: translateY(-100%); }
                  }
                  .animate-scan {
                    animation: scanLine 2s ease-in-out infinite;
                  }
                `}
              </style>
              <div slot="poster" className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="text-white bg-black/50 px-4 py-2 rounded-full text-sm">Loading Preview...</div>
              </div>
              <button slot="ar-button" className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center z-20 hover:scale-[1.02] transition-transform cursor-pointer border-none bg-transparent outline-none w-[90%] max-w-[320px]">
                <div className="bg-black/90 backdrop-blur-xl border border-gray-800 rounded-3xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.8)] flex flex-col items-center pointer-events-auto w-full relative overflow-hidden">
                  {/* Subtle gold glow behind logo */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 bg-mammut-gold/20 blur-3xl rounded-full"></div>
                  
                  <img src="/assets/mammut-logo-icon.png" alt="Mammut" className="h-6 mb-6 opacity-90 relative z-10" />
                  
                  <div className="flex items-center gap-4 mb-6 relative z-10">
                     <div className="w-8 h-12 border-2 border-mammut-gold/60 rounded-md relative flex items-center justify-center overflow-hidden shrink-0 bg-gray-900/50">
                        {/* Scanning Laser */}
                        <div className="w-full h-[2px] bg-mammut-gold animate-scan shadow-[0_0_8px_#cc9900]"></div>
                     </div>
                     <div className="text-left">
                       <p className="text-white font-black text-sm tracking-wider uppercase">Scan your {placement}</p>
                       <p className="text-gray-400 text-[10px] mt-1 leading-tight">Point camera at the {placement} & move slowly to place window</p>
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
        AR is supported on modern iOS and Android devices. For Android, point your camera at a {placement}.
      </div>
    </div>
  );
};
