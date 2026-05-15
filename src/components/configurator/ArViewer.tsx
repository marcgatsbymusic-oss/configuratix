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
            ar-modes="webxr scene-viewer quick-look"
            ar-placement={placement}
            camera-controls="true"
            auto-rotate="true"
            shadow-intensity="1"
            style={{ width: '100%', height: '100%' }}
            alt="AR Window Configuration"
          >
            <div slot="poster" className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <div className="text-white bg-black/50 px-4 py-2 rounded-full text-sm">Loading Preview...</div>
            </div>
            <button slot="ar-button" className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-mammut-gold text-black font-black uppercase tracking-widest px-8 py-4 rounded-full shadow-2xl z-20 hover:scale-105 transition-transform">
              Activate AR
            </button>
          </ModelViewer>
        )}
      </div>
      
      <div className="p-4 bg-gray-900 text-gray-400 text-xs text-center">
        AR is supported on modern iOS and Android devices. For Android, point your camera at a {placement}.
      </div>
    </div>
  );
};
