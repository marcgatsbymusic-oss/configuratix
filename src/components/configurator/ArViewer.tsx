import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import '@google/model-viewer';

const ModelViewer = 'model-viewer' as any;

import { saveModelToDB, savePublicUrlToDB } from '../../utils/arStorage';

// Helper to upload GLB to tmpfiles.org for public AR sharing (fallback for non-blob environments)
async function uploadToTmpFiles(blob: Blob, filename = 'window-scene.glb'): Promise<string> {
  const formData = new FormData();
  formData.append('file', blob, filename);
  const res = await fetch('https://tmpfiles.org/api/v1/upload', {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
  const json = await res.json();
  if (json.status !== 'success') throw new Error(json.message || 'Upload failed');
  return json.data.url.replace('https://tmpfiles.org/', 'https://tmpfiles.org/dl/');
}

interface ArViewerProps {
  sceneGroup: THREE.Group | THREE.Scene | null;
  placement: 'wall' | 'floor';
  onClose: () => void;
  typology?: string;
}

function pruneEmptyNodes(node: THREE.Object3D): boolean {
  let hasVisual = false;
  node.traverse((child) => {
    if ((child as any).isMesh || (child as any).isLight || (child as any).isCamera) {
      hasVisual = true;
    }
  });

  if (!hasVisual) {
    if (node.parent) {
      node.parent.remove(node);
    }
    return false;
  }

  for (let i = node.children.length - 1; i >= 0; i--) {
    pruneEmptyNodes(node.children[i]);
  }
  return true;
}

export const ArViewer: React.FC<ArViewerProps> = ({ sceneGroup, placement, onClose, typology }) => {
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [blobSize, setBlobSize] = useState<number | null>(null);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);

  // Export Three.js scene → GLB blob.
  useEffect(() => {
    if (!sceneGroup) return;

    // Prepare for AR export (run on LIVE scene so clone captures it)
    const restoreFunctions: (() => void)[] = [];
    sceneGroup.traverse((node: any) => {
      if (node.userData && typeof node.userData.prepareForAR === 'function') {
        try {
          const restore = node.userData.prepareForAR();
          if (typeof restore === 'function') {
            restoreFunctions.push(restore);
          }
        } catch (e) {
          console.error('[ArViewer] Error in prepareForAR:', e);
        }
      }
    });

    const exportGroup = sceneGroup.clone(true);

    // Flatten all meshes into a single group to prevent iOS Quick Look from rejecting 
    // deep hierarchies or nodes with negative scales (which are common in DXF mirrors).
    const materialsMap = new Map<string, { material: THREE.Material; geometries: THREE.BufferGeometry[] }>();

    exportGroup.updateMatrixWorld(true);

    exportGroup.traverse((node: any) => {
      if (node.isMesh && node.geometry) {
        const geom = node.geometry.clone();
        
        // Bake all world transforms (including negative scales!) directly into the geometry vertices
        geom.applyMatrix4(node.matrixWorld);
        
        // Scale down from millimeters to meters for AR
        geom.scale(0.001, 0.001, 0.001);

        let mat = Array.isArray(node.material) ? node.material[0] : node.material;
        
        // Process material for AR safety
        let processedMat;
        if (mat.transmission && mat.transmission > 0) {
          processedMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.25,
            metalness: 0,
            roughness: 0.05,
            side: THREE.DoubleSide // Use DoubleSide to prevent invisible faces if negatively scaled
          });
        } else {
          processedMat = mat.clone();
          processedMat.side = THREE.DoubleSide; // Fix normals for mirrored DXF parts
          
          if (processedMat.map) {
            const src = processedMat.map.image?.src || '';
            const srcLower = src.toLowerCase();
            if (srcLower.includes('oak') || srcLower.includes('wood')) {
              processedMat.color.set('#a16207');
            } else if (srcLower.includes('anthracite') || srcLower.includes('dark')) {
              processedMat.color.set('#374151');
            } else if (srcLower.includes('gray') || srcLower.includes('grey')) {
              processedMat.color.set('#9ca3af');
            } else if (srcLower.includes('white')) {
              processedMat.color.set('#f9fafb');
            }
          }

          // Strip textures to keep the blob tiny
          for (const key in processedMat) {
            if (processedMat[key] && processedMat[key].isTexture) {
              processedMat[key] = null;
            }
          }
          processedMat.needsUpdate = true;
        }

        // We use a unique string key based on color/opacity to group materials, 
        // because cloning creates different UUIDs.
        const matKey = `${(processedMat as THREE.MeshStandardMaterial).color.getHex()}-${processedMat.opacity}`;
        
        if (!materialsMap.has(matKey)) {
          materialsMap.set(matKey, { material: processedMat, geometries: [] });
        }
        materialsMap.get(matKey)!.geometries.push(geom);
      }
    });

    // Restore original state on LIVE scene immediately
    restoreFunctions.forEach(fn => fn());

    const mergedGroup = new THREE.Group();
    materialsMap.forEach(({ material, geometries }) => {
      if (geometries.length > 0) {
        geometries.forEach(g => {
          const mesh = new THREE.Mesh(g, material);
          mergedGroup.add(mesh);
        });
      }
    });

    const exporter = new GLTFExporter();
    exporter.parse(
      mergedGroup,
      (gltf: any) => {
        const blob = new Blob([gltf as ArrayBuffer], { type: 'model/gltf-binary' });
        setBlobSize(blob.size);
        const url = URL.createObjectURL(blob) + '#window-scene.glb';
        
        saveModelToDB(blob).catch(err => {
          console.error('[ArViewer] Error saving model to IndexedDB:', err);
        });

        setModelUrl(url);

        uploadToTmpFiles(blob, 'window-scene.glb').then((pUrl) => {
          setPublicUrl(pUrl);
          savePublicUrlToDB(pUrl).catch(err => {
            console.error('[ArViewer] Error saving public URL to IndexedDB:', err);
          });
        }).catch(err => {
          console.error('[ArViewer] Upload to tmpfiles.org failed, using local URL:', err);
        });
      },
      (err: any) => {
        console.error('GLTF Export Error:', err);
        setError('Failed to generate AR model.');
      },
      { binary: true }
    );

    return () => {
      setModelUrl(prev => {
        if (prev && prev.startsWith('blob:')) {
          URL.revokeObjectURL(prev.split('#')[0]);
        }
        return null;
      });
      setPublicUrl(null);
    };
  }, [sceneGroup]);

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
            src={publicUrl || modelUrl}
            ar="true"
            ar-modes="scene-viewer webxr quick-look"
            ar-scale="fixed"
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
