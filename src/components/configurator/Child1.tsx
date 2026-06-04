import React, { useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei';
import { Loader2 } from 'lucide-react';
import { loadProfileGeometry } from '../../data/profiles';
import { FrameSegment } from './FrameSegment';
import { usePBRMaterial } from '../../hooks/usePBRMaterial';

const MM = 0.001;

export interface Child1Props {
  profileId?: string;
  widthMm?: number;
  heightMm?: number;
  colorExt?: string;
  colorInt?: string;
  colorExtTexture?: string;
  colorIntTexture?: string;
  colorGsk?: string;
  colorSpacer?: string;
  hidePill?: boolean;
}

export const Child1: React.FC<Child1Props> = ({ 
  profileId = 'IG5_F101B',
  widthMm = 1000,
  heightMm = 1000,
  colorExt = '#e8e0d4',
  colorInt = '#f0ece6',
  colorExtTexture,
  colorIntTexture,
  colorGsk = '#1c1c1c',
  hidePill = false
}) => {
  const [geometryData, setGeometryData] = useState<any>(null);

  useEffect(() => {
    loadProfileGeometry(profileId as any).then(data => setGeometryData(data));
  }, [profileId]);

  if (!geometryData) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white text-black z-50">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="font-bold tracking-widest text-sm uppercase">Loading {profileId} Mesh...</p>
      </div>
    );
  }

  const scale = MM;
  const W = widthMm * scale;
  const H = heightMm * scale;

  const getLayerContours = (layerName: string) => {
    const layer = geometryData.layers[layerName];
    if (!layer || !layer.contours || layer.contours.length === 0) return [];
    return layer.contours.map((c: any) => c.points);
  };

  const frmExt = getLayerContours('FRM_EXT');
  const frmInt = getLayerContours('FRM_INT');
  const gskFrmExt = getLayerContours('GSK_FRM_EXT');

  // Calculate common origin to ensure segments align properly
  let minX = Infinity, minY = Infinity;
  const allLayers = [frmExt, frmInt, gskFrmExt];
  for (const layer of allLayers) {
    for (const c of layer) {
      for (const v of c) {
        if (v.x < minX) minX = v.x;
        if (v.y < minY) minY = v.y;
      }
    }
  }
  const commonOrigin = { x: minX === Infinity ? 0 : minX, y: minY === Infinity ? 0 : minY };

  // -- Use Shared PBR Material Loader Hook --
  const finalFrmExtMat = usePBRMaterial(colorExtTexture, colorExt, widthMm, heightMm, false, false);
  const finalFrmIntMat = usePBRMaterial(colorIntTexture, colorInt, widthMm, heightMm, true, false);

  const gskMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: colorGsk || '#1c1c1c',
    roughness: 0.9,
    metalness: 0.1
  }), [colorGsk]);

  const renderFrameSegment = (len: number, uSign: number, uOff: number) => (<>
    {frmExt.map((c: any, i: number) => <FrameSegment key={`frmExt_${i}`} layerName="FRM_EXT" scaleFactor={scale} length={len} vertices={c} material={finalFrmExtMat} origin={commonOrigin} uSign={uSign} uOffset={uOff} />)}
    {frmInt.map((c: any, i: number) => <FrameSegment key={`frmInt_${i}`} layerName="FRM_INT" scaleFactor={scale} length={len} vertices={c} material={finalFrmIntMat} origin={commonOrigin} uSign={uSign} uOffset={uOff} />)}
    {gskFrmExt.map((c: any, i: number) => <FrameSegment key={`gskFE_${i}`} layerName="GSK_FRM_EXT" scaleFactor={scale} length={len} vertices={c} material={gskMaterial} origin={commonOrigin} uSign={uSign} uOffset={uOff} />)}
  </>);

  const maxDim = Math.max(W, H);
  
  // Center camera on the window
  const targetX = W * 0.5; 
  const targetY = H * 0.5;
  const targetZ = 0;

  const radius = maxDim * 1.5;
  const angle = -15 * Math.PI / 180; 
  const camPos: [number, number, number] = [
    targetX + radius * Math.sin(angle), 
    targetY, 
    -radius * Math.cos(angle)
  ];
  const orbitTarget: [number, number, number] = [targetX, targetY, targetZ];
  const controlsRef = React.useRef<any>(null);

  return (
    <div className="absolute inset-0">
      <Canvas onDoubleClick={(e) => { e.stopPropagation(); controlsRef.current?.reset(); }} shadows gl={{ antialias: true, preserveDrawingBuffer: true }} camera={{ position: camPos, fov: 40 }}>
        <color attach="background" args={['#e2e8f0']} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[W * 2, H * 2, -H * 2]} intensity={2.5} castShadow />
        <directionalLight position={[-W, H * 0.5, -H]} intensity={0.8} color="#a8c8ff" />
        
        <React.Suspense fallback={null}>
          <Environment preset="studio" />
        </React.Suspense>

        <group>
          {/* Bottom */}
          <group rotation={[0, 0, 0]}>
            <group rotation={[0, Math.PI / 2, 0]}>
              {renderFrameSegment(widthMm, 1, 0)}
            </group>
          </group>
          {/* Right */}
          <group position={[W, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <group rotation={[0, Math.PI / 2, 0]}>
              {renderFrameSegment(heightMm, -1, W)}
            </group>
          </group>
          {/* Top */}
          <group position={[W, H, 0]} rotation={[0, 0, Math.PI]}>
            <group rotation={[0, Math.PI / 2, 0]}>
              {renderFrameSegment(widthMm, 1, W - H)}
            </group>
          </group>
          {/* Left */}
          <group position={[0, H, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <group rotation={[0, Math.PI / 2, 0]}>
              {renderFrameSegment(heightMm, -1, W - H)}
            </group>
          </group>
        </group>

        <ContactShadows position={[W / 2, -0.05, 0]} opacity={0.15} scale={maxDim * 5} blur={2.5} far={maxDim * 2} />
        <OrbitControls ref={controlsRef} makeDefault enablePan enableZoom target={orbitTarget} minDistance={maxDim * 0.4} maxDistance={maxDim * 4} />
      </Canvas>

      <div className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest pointer-events-none" style={{ background: 'rgba(8,8,22,0.78)', border: '1px solid rgba(234,182,118,0.22)', color: '#eab676', backdropFilter: 'blur(10px)' }}>IGLO 5 {profileId}</div>
      {!hidePill && (
        <div className="absolute bottom-3 left-3 z-20 flex flex-col gap-0.5 px-2.5 py-1.5 rounded-lg pointer-events-none" style={{ background: 'rgba(8,8,22,0.65)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(8px)' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#eab676' }}>{widthMm} x {heightMm} mm</div>
        </div>
      )}
    </div>
  );
};
