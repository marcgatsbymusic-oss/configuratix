import React, { useRef, useState, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, useProgress } from '@react-three/drei';
import { Loader2 } from 'lucide-react';
import * as THREE from 'three';
import { FrameSegment } from './FrameSegment';
import { AdaptiveCamera } from './AdaptiveCamera';
import profileDataRaw from '../../data/profiles/IgloEdge/IGLS_OPENING_DOOR_SECTION_AND_FRAME.json';
import fixedGlazingDataRaw from '../../data/profiles/IgloEdge/Fixed_Glazing.json';

interface Point { x: number; y: number }
interface Contour { id: string; points: Point[] }
interface LayerData { group: string; contours: Contour[] }
interface ProfileData {
  meta: { bounds: { normalised: { minX: number; maxX: number; minY: number; maxY: number } } };
  layers: Record<string, LayerData>;
}
const pd = profileDataRaw as unknown as ProfileData;
const fgd = fixedGlazingDataRaw as unknown as ProfileData;

const MM = 0.001; // mm to meters

interface AssemblyProps {
  widthMm: number;
  heightMm: number;
  colorExt: string;
  colorInt: string;
  colorGsk?: string;
  colorAlum?: string;
  onSceneReady?: (group: THREE.Group) => void;
}

function FrameAssembly({ 
  widthMm, heightMm, colorExt, colorInt, colorGsk = '#1c1c1c', colorAlum = '#a1a1aa',
  onSceneReady 
}: AssemblyProps) {
  const [groupObj, setGroupObj] = useState<THREE.Group | null>(null);
  const reportedKey = useRef<string>('');
  const scale = MM;
  
  const W = widthMm * scale;
  const H = heightMm * scale;

  useEffect(() => {
    if (groupObj && onSceneReady) {
      onSceneReady(groupObj);
    }
  }, [groupObj, onSceneReady, widthMm, heightMm, colorExt, colorInt, colorGsk, colorAlum]);

  const getLayerContours = (layerName: string) => {
    const layer = pd.layers[layerName];
    if (!layer || layer.contours.length === 0) return [];
    return layer.contours.map((c: any) => c.points);
  };

  // Frame layers
  const frmExt = useMemo(() => getLayerContours('Main_Frame_EXT'), []);
  const frmInt = useMemo(() => getLayerContours('Main_Frame_INT'), []);
  const gskCentral = useMemo(() => getLayerContours('Main_GSK_CENTRAL'), []);
  const fixCover = useMemo(() => getLayerContours('Fix_Cover'), []);
  const alum = useMemo(() => getLayerContours('Aluminium'), []);

  const getFixedLayerContours = (layerName: string) => {
    const layer = fgd.layers[layerName];
    if (!layer || layer.contours.length === 0) return [];
    return layer.contours.map((c: any) => c.points);
  };

  // Fixed Glazing layers
  const fixGskExt = useMemo(() => getFixedLayerContours('Fix_GSK_EXT'), []);
  const fixGskBzd = useMemo(() => getFixedLayerContours('Fix_GSK_BZD'), []);
  const fixBzd = useMemo(() => getFixedLayerContours('Fix_BZD'), []);
  const fixGlsExt = useMemo(() => getFixedLayerContours('Fix_GLS_EXT'), []);
  const fixGlsMd = useMemo(() => getFixedLayerContours('Fix_GLS_MD'), []);
  const fixGlsInt = useMemo(() => getFixedLayerContours('Fix_GLS_INT'), []);
  const fixSpacer = useMemo(() => getFixedLayerContours('Fix_SPACER'), []);

  // Sash / Door panel layers
  const sshExt = useMemo(() => getLayerContours('Door_Frame_EXT'), []);
  const sshInt = useMemo(() => getLayerContours('Door_Frame_INT'), []);
  const bzd = useMemo(() => getLayerContours('Door_BZD'), []);
  const gskSshExt = useMemo(() => getLayerContours('Door_GSK_EXT'), []);
  const gskSshInt = useMemo(() => getLayerContours('Door_GSK_INT'), []);
  const gskBzd = useMemo(() => getLayerContours('Door_GSK_BZD'), []);
  const glsExt = useMemo(() => getLayerContours('Door_GLS_EXT'), []);
  const glsMd = useMemo(() => getLayerContours('Door_GLS_MD'), []);
  const glsInt = useMemo(() => getLayerContours('Door_GLS_INT'), []);
  const spacer = useMemo(() => getLayerContours('Door_SPACER'), []);

  const commonOrigin = useMemo(() => {
    let minX = Infinity, minY = Infinity;
    const allLayers = [
      frmExt, frmInt, gskCentral, fixCover, alum,
      sshExt, sshInt, bzd, gskSshExt, gskSshInt, gskBzd, glsExt, glsMd, glsInt, spacer
    ];
    for (const layer of allLayers) {
      for (const c of layer) {
        for (const v of c) {
          if (v.x < minX) minX = v.x;
          if (v.y < minY) minY = v.y;
        }
      }
    }
    return { x: minX === Infinity ? 0 : minX, y: minY === Infinity ? 0 : minY };
  }, [frmExt, frmInt, gskCentral, fixCover, alum, sshExt, sshInt, bzd, gskSshExt, gskSshInt, gskBzd, glsExt, glsMd, glsInt, spacer]);

  // Calculate sash midpoint horizontally (which corresponds to Y axis in CAD cross-section)
  const sashYBounds = useMemo(() => {
    let minY = Infinity, maxY = -Infinity;
    const allSashLayers = [sshExt, sshInt];
    for (const layer of allSashLayers) {
      for (const c of layer) {
        for (const v of c) {
          if (v.y < minY) minY = v.y;
          if (v.y > maxY) maxY = v.y;
        }
      }
    }
    return { min: minY, max: maxY, mid: (minY + maxY) / 2 };
  }, [sshExt, sshInt]);

  const glassMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({ 
    color: "#e2effa", 
    roughness: 0.0,
    metalness: 0.1,
    transmission: 0.9,
    ior: 1.5,
    thickness: 0.005,
    transparent: true,
    opacity: 0.6,
  }), []);

  const renderGlassPane = (sashWidthMm: number, sashHeightMm: number, glsLayer: Point[][]) => {
    if (glsLayer.length === 0) return null;
    const pts = glsLayer[0];
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const p of pts) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
    const offset = minY - commonOrigin.y;
    const paneW = sashWidthMm * scale - 2 * offset * scale;
    const paneH = sashHeightMm * scale - 2 * offset * scale;
    const thickness = (maxX - minX) * scale;
    const centerDepth = -(((minX + maxX) / 2) - commonOrigin.x) * scale;
    
    return (
      <mesh position={[sashWidthMm * scale / 2, sashHeightMm * scale / 2, centerDepth]} material={glassMaterial} castShadow receiveShadow>
        <boxGeometry args={[paneW, paneH, thickness]} />
      </mesh>
    );
  };

  // Standard 4-sided PVC frame segment renderer
  const renderFrameSegment = (len: number, uSign: number, uOff: number) => (
    <>
      {frmExt.map((c, i) => (
        <FrameSegment 
          key={`frmExt_${i}`} 
          layerName="Main_Frame_EXT" 
          scaleFactor={scale} 
          length={len} 
          vertices={c} 
          matType="ext" 
          color={colorExt} 
          origin={commonOrigin} 
          uSign={uSign} 
          uOffset={uOff} 
        />
      ))}
      {frmInt.map((c, i) => (
        <FrameSegment 
          key={`frmInt_${i}`} 
          layerName="Main_Frame_INT" 
          scaleFactor={scale} 
          length={len} 
          vertices={c} 
          matType="int" 
          color={colorInt} 
          origin={commonOrigin} 
          uSign={uSign} 
          uOffset={uOff} 
        />
      ))}
      {gskCentral.map((c, i) => (
        <FrameSegment 
          key={`gskC_${i}`} 
          layerName="Main_GSK_CENTRAL" 
          scaleFactor={scale} 
          length={len} 
          vertices={c} 
          matType="gsk" 
          color={colorGsk} 
          origin={commonOrigin} 
          uSign={uSign} 
          uOffset={uOff} 
        />
      ))}
    </>
  );

  // Custom Fix Cover segment renderer (which only runs along the fixed panel side)
  const renderFixCoverSegment = (
    len: number, 
    uSign: number, 
    uOff: number, 
    skipLeft?: boolean, 
    skipRight?: boolean
  ) => (
    <>
      {fixCover.map((c, i) => (
        <FrameSegment 
          key={`fixCov_${i}`} 
          layerName="Fix_Cover" 
          scaleFactor={scale} 
          length={len} 
          vertices={c} 
          matType="ext" 
          color={colorExt} 
          origin={commonOrigin} 
          uSign={uSign} 
          uOffset={uOff} 
          skipLeftCut={skipLeft}
          skipRightCut={skipRight}
        />
      ))}
    </>
  );

  // Standard 4-sided PVC sash segment renderer
  const renderSashSegment = (len: number, uSign: number, uOff: number) => (
    <>
      {sshExt.map((c, i) => (
        <FrameSegment 
          key={`sshExt_${i}`} 
          layerName="Door_Frame_EXT" 
          scaleFactor={scale} 
          length={len} 
          vertices={c} 
          matType="ext" 
          color={colorExt} 
          origin={commonOrigin} 
          uSign={uSign} 
          uOffset={uOff} 
        />
      ))}
      {sshInt.map((c, i) => (
        <FrameSegment 
          key={`sshInt_${i}`} 
          layerName="Door_Frame_INT" 
          scaleFactor={scale} 
          length={len} 
          vertices={c} 
          matType="int" 
          color={colorInt} 
          origin={commonOrigin} 
          uSign={uSign} 
          uOffset={uOff} 
        />
      ))}
      {bzd.map((c, i) => (
        <FrameSegment 
          key={`bzd_${i}`} 
          layerName="Door_BZD" 
          scaleFactor={scale} 
          length={len} 
          vertices={c} 
          matType="int" 
          color={colorInt} 
          origin={commonOrigin} 
          uSign={uSign} 
          uOffset={uOff} 
          uvMode="rail" 
        />
      ))}
      {spacer.map((c, i) => (
        <FrameSegment 
          key={`spacer_${i}`} 
          layerName="Door_SPACER" 
          scaleFactor={scale} 
          length={len} 
          vertices={c} 
          matType="spacer" 
          color="#333333" 
          origin={commonOrigin} 
          uSign={uSign} 
          uOffset={uOff} 
        />
      ))}
      {gskSshExt.map((c, i) => (
        <FrameSegment 
          key={`gskSE_${i}`} 
          layerName="Door_GSK_EXT" 
          scaleFactor={scale} 
          length={len} 
          vertices={c} 
          matType="gsk" 
          color={colorGsk} 
          origin={commonOrigin} 
          uSign={uSign} 
          uOffset={uOff} 
        />
      ))}
      {gskSshInt.map((c, i) => (
        <FrameSegment 
          key={`gskSI_${i}`} 
          layerName="Door_GSK_INT" 
          scaleFactor={scale} 
          length={len} 
          vertices={c} 
          matType="gsk" 
          color={colorGsk} 
          origin={commonOrigin} 
          uSign={uSign} 
          uOffset={uOff} 
        />
      ))}
      {gskBzd.map((c, i) => (
        <FrameSegment 
          key={`gskB_${i}`} 
          layerName="Door_GSK_BZD" 
          scaleFactor={scale} 
          length={len} 
          vertices={c} 
          matType="gsk" 
          color={colorGsk} 
          origin={commonOrigin} 
          uSign={uSign} 
          uOffset={uOff} 
        />
      ))}
    </>
  );

  // Custom 3-sided Aluminium track segment renderer
  const renderAluminiumSegment = (
    len: number, 
    uSign: number, 
    uOff: number, 
    skipLeft: boolean, 
    skipRight: boolean
  ) => (
    <>
      {alum.map((c, i) => (
        <FrameSegment 
          key={`alum_${i}`} 
          layerName="Aluminium" 
          scaleFactor={scale} 
          length={len} 
          vertices={c} 
          matType="spacer" // Anodized metal look
          color={colorAlum} 
          origin={commonOrigin} 
          uSign={uSign} 
          uOffset={uOff} 
          skipLeftCut={skipLeft}
          skipRightCut={skipRight}
        />
      ))}
    </>
  );

  // Fixed Glazing segment renderer
  const renderFixedGlazingSegment = (
    len: number,
    uSign: number,
    uOff: number,
    skipLeft?: boolean,
    skipRight?: boolean
  ) => (
    <>
      {fixBzd.map((c, i) => (
        <FrameSegment
          key={`fixBzd_${i}`}
          layerName="Fix_BZD"
          scaleFactor={scale}
          length={len}
          vertices={c}
          matType="int"
          color={colorInt}
          origin={commonOrigin}
          uSign={uSign}
          uOffset={uOff}
          skipLeftCut={skipLeft}
          skipRightCut={skipRight}
          uvMode="rail"
        />
      ))}
      {fixGskExt.map((c, i) => (
        <FrameSegment
          key={`fixGskExt_${i}`}
          layerName="Fix_GSK_EXT"
          scaleFactor={scale}
          length={len}
          vertices={c}
          matType="gsk"
          color={colorGsk}
          origin={commonOrigin}
          uSign={uSign}
          uOffset={uOff}
          skipLeftCut={skipLeft}
          skipRightCut={skipRight}
        />
      ))}
      {fixGskBzd.map((c, i) => (
        <FrameSegment
          key={`fixGskBzd_${i}`}
          layerName="Fix_GSK_BZD"
          scaleFactor={scale}
          length={len}
          vertices={c}
          matType="gsk"
          color={colorGsk}
          origin={commonOrigin}
          uSign={uSign}
          uOffset={uOff}
          skipLeftCut={skipLeft}
          skipRightCut={skipRight}
        />
      ))}
      {fixSpacer.map((c, i) => (
        <FrameSegment
          key={`fixSpacer_${i}`}
          layerName="Fix_SPACER"
          scaleFactor={scale}
          length={len}
          vertices={c}
          matType="spacer"
          color="#333333"
          origin={commonOrigin}
          uSign={uSign}
          uOffset={uOff}
          skipLeftCut={skipLeft}
          skipRightCut={skipRight}
        />
      ))}
    </>
  );

  const renderFixedGlassPane = (glsLayer: Point[][]) => {
    if (glsLayer.length === 0) return null;
    const pts = glsLayer[0];
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const p of pts) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
    const offset = minY;
    const paneW = W / 2;
    const paneH = H - 2 * offset * scale;
    const thickness = (maxX - minX) * scale;
    const centerDepth = -(((minX + maxX) / 2)) * scale;
    const centerX = offset * scale + W / 4;
    const centerY = H / 2;

    return (
      <mesh position={[centerX, centerY, centerDepth]} material={glassMaterial} castShadow receiveShadow>
        <boxGeometry args={[paneW, paneH, thickness]} />
      </mesh>
    );
  };

  // Aluminium offset parameter from left end
  const alumOffsetMm = 34.87;
  const alumOffset = alumOffsetMm * scale;

  // Sash/Door alignment math
  // Local Y midpoint of the sash shape, shifted by commonOrigin.y
  const yMidLocal = sashYBounds.mid - commonOrigin.y;
  const yMidOffset = yMidLocal * scale;
  
  // Left vertical rail X-coordinate in world units to center its midpoint exactly on W/2
  const sashLeftX = W / 2 - yMidOffset;
  // Dynamic sash width spanning from sashLeftX to W (right frame edge)
  const sashWidthMm = widthMm / 2 + yMidLocal;

  return (
    <group ref={setGroupObj}>
      {/* 1. Main PVC Frame (4-sided mitre-cut) */}
      <group name="PVC_Frame">
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

        {/* Fixed Covers (only 50% of the way on bottom/top right, 100% on right vertical, 0% on left vertical) */}
        {/* Bottom Fix Cover */}
        <group position={[W / 2, 0, 1.88 * scale]} rotation={[0, 0, 0]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            {renderFixCoverSegment(widthMm / 2, 1, W / 2, true, false)}
          </group>
        </group>
        {/* Top Fix Cover */}
        <group position={[W, H, 1.88 * scale]} rotation={[0, 0, Math.PI]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            {renderFixCoverSegment(widthMm / 2, 1, W - H, false, true)}
          </group>
        </group>
        {/* Right Fix Cover */}
        <group position={[W, 0, 1.88 * scale]} rotation={[0, 0, Math.PI / 2]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            {renderFixCoverSegment(heightMm, -1, W, false, false)}
          </group>
        </group>
      </group>

      {/* 2. Aluminium Tracks (3 pieces following assembly rules) */}
      <group name="Aluminium_Tracks">
        {/* Bottom: stretches from x=34.87 to x=W (length = W - 34.87). Straight left cut, mitred right cut */}
        <group position={[alumOffset, 0, 0]} rotation={[0, 0, 0]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            {renderAluminiumSegment(widthMm - alumOffsetMm, 1, alumOffset, true, false)}
          </group>
        </group>

        {/* Right: stretches along x=W from y=0 to y=H (length = H). Mitred bottom cut, mitred top cut */}
        <group position={[W, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            {renderAluminiumSegment(heightMm, -1, W, false, false)}
          </group>
        </group>

        {/* Top: stretches from x=W to x=34.87 (length = W - 34.87). Mitred right cut (at Z=0), straight left cut (at Z=length) */}
        <group position={[W, H, 0]} rotation={[0, 0, Math.PI]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            {renderAluminiumSegment(widthMm - alumOffsetMm, 1, W - H, false, true)}
          </group>
        </group>
      </group>

      {/* 3. Fixed Glazing Assembly */}
      <group name="Fixed_Glazing">
        {/* Bottom-Left Fixed Glazing */}
        <group rotation={[0, 0, 0]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            {renderFixedGlazingSegment(widthMm / 2, 1, 0, false, true)}
          </group>
        </group>
        {/* Top-Left Fixed Glazing */}
        <group position={[W / 2, H, 0]} rotation={[0, 0, Math.PI]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            {renderFixedGlazingSegment(widthMm / 2, 1, W - H, true, false)}
          </group>
        </group>
        {/* Left Vertical Fixed Glazing */}
        <group position={[0, H, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            {renderFixedGlazingSegment(heightMm, -1, W - H, false, false)}
          </group>
        </group>

        {/* Fixed Glass Panes */}
        {renderFixedGlassPane(fixGlsExt)}
        {renderFixedGlassPane(fixGlsMd)}
        {renderFixedGlassPane(fixGlsInt)}
      </group>
 
      {/* 4. Opening Door Panel (Sash + Glass) */}
      <group name="Opening_Door" position={[0, 0, 15.55 * scale]}>
        {/* Bottom Sash */}
        <group position={[sashLeftX, 0, 0]} rotation={[0, 0, 0]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            {renderSashSegment(sashWidthMm, 1, sashLeftX)}
          </group>
        </group>
        {/* Right Sash */}
        <group position={[W, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            {renderSashSegment(heightMm, -1, W)}
          </group>
        </group>
        {/* Top Sash */}
        <group position={[W, H, 0]} rotation={[0, 0, Math.PI]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            {renderSashSegment(sashWidthMm, 1, W - H)}
          </group>
        </group>
        {/* Left Sash: centered exactly on W / 2 */}
        <group position={[sashLeftX, H, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            {renderSashSegment(heightMm, -1, W - H)}
          </group>
        </group>

        {/* Glass panes inside sash */}
        <group position={[sashLeftX, 0, 0]}>
          {renderGlassPane(sashWidthMm, heightMm, glsExt)}
          {renderGlassPane(sashWidthMm, heightMm, glsMd)}
          {renderGlassPane(sashWidthMm, heightMm, glsInt)}
        </group>
      </group>
    </group>
  );
}

function DelayedLoader({ mountHeavy }: { mountHeavy: boolean }) {
  const { active, progress } = useProgress();
  if (!mountHeavy || !active) return null;
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#0e0e1a]/95 backdrop-blur-sm text-[#eab676] pointer-events-none"
      style={{ animation: 'fadeIn 0.5s ease-in-out 1s forwards', opacity: 0 }}>
      <Loader2 className="w-12 h-12 animate-spin mb-4" />
      <p className="font-bold tracking-widest text-xs uppercase">Preparing 3D geometry engine...</p>
      {active && <p className="text-xs opacity-50 mt-2">{progress.toFixed(0)}%</p>}
      <style>{`@keyframes fadeIn { to { opacity: 1; } }`}</style>
    </div>
  );
}

export interface IGLSideTestBuildViewerProps {
  width?: number;
  height?: number;
  colorExt?: string;
  colorInt?: string;
  colorGsk?: string;
  colorAlum?: string;
  onSceneReady?: (group: THREE.Group) => void;
  onDimensionChange?: (width: number, height: number) => void;
  activeLimits?: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number };
}

export const IGLSideTestBuildViewer: React.FC<IGLSideTestBuildViewerProps> = ({
  width = 2200,
  height = 2100,
  colorExt = '#2d2d2d', // Anthracite preset default
  colorInt = '#f0ece6', // White/Alabaster interior preset default
  colorGsk = '#1c1c1c',
  colorAlum = '#8a8a93', // Silver/Anodized track look
  onSceneReady,
  onDimensionChange,
  activeLimits,
}) => {
  const [widthText, setWidthText] = useState(width.toString());
  const [heightText, setHeightText] = useState(height.toString());
  const controlsRef = useRef<any>(null);
  const [mountHeavy, setMountHeavy] = useState(false);

  useEffect(() => {
    setWidthText(width.toString());
    setHeightText(height.toString());
  }, [width, height]);

  useEffect(() => {
    setMountHeavy(false);
    const t = setTimeout(() => setMountHeavy(true), 50);
    return () => clearTimeout(t);
  }, [width, height]);

  const minW = activeLimits?.minWidth || 1000;
  const maxW = activeLimits?.maxWidth || 3000;
  const minH = activeLimits?.minHeight || 1000;
  const maxH = activeLimits?.maxHeight || 3000;

  const W_M = width * MM;
  const H_M = height * MM;
  const maxDim = Math.max(W_M, H_M);
  
  const targetX = W_M * 0.5; 
  const targetY = H_M * 0.5;
  const targetZ = 0;

  const radius = maxDim * 1.8;
  const camPos: [number, number, number] = [targetX, targetY, -radius];
  const orbitTarget: [number, number, number] = [targetX, targetY, targetZ];

  return (
    <div className="absolute inset-0" style={{ background: '#09090f' }}>
      <Canvas shadows gl={{ antialias: true }} camera={{ position: camPos, fov: 32 }}>
        <AdaptiveCamera maxDim={maxDim} targetX={targetX} targetY={targetY} targetZ={targetZ} angle={0} defaultRadiusMult={1.8} fov={32} zSign={-1} controlsRef={controlsRef} />
        <color attach="background" args={['#09090f']} />
        <fog attach="fog" args={['#09090f', maxDim * 12, maxDim * 35]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[W_M * 3, H_M * 3, -H_M * 3]} intensity={2.5} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.0003} color="#ffffff" />
        <directionalLight position={[-W_M * 2, H_M * 0.8, -H_M]} intensity={0.6} color="#38bdf8" />
        <directionalLight position={[W_M * 0.5, -H_M, -H_M * 0.5]} intensity={0.2} color="#f59e0b" />
        
        <Suspense fallback={null}>
          <Environment files="/assets/hdri/monochrome_studio_02_1k.exr" />
        </Suspense>

        {mountHeavy && (
          <FrameAssembly 
            widthMm={width} 
            heightMm={height} 
            colorExt={colorExt} 
            colorInt={colorInt} 
            colorGsk={colorGsk} 
            colorAlum={colorAlum}
            onSceneReady={onSceneReady} 
          />
        )}

        <ContactShadows position={[W_M / 2, -0.005, 0]} opacity={0.3} scale={maxDim * 4} blur={2.0} far={maxDim * 1.5} />
        <OrbitControls 
          ref={controlsRef} 
          makeDefault 
          enablePan 
          enableZoom 
          target={orbitTarget} 
          minDistance={maxDim * 0.5} 
          maxDistance={maxDim * 5} 
        />
      </Canvas>

      {/* Size Pill */}
      {onDimensionChange && (
        <div 
          className="absolute bottom-4 left-4 z-20 flex items-center gap-2 px-4 py-2 rounded-full pointer-events-auto shadow-2xl" 
          style={{ 
            background: 'rgba(8, 8, 15, 0.85)', 
            border: '1px solid rgba(255, 255, 255, 0.08)', 
            backdropFilter: 'blur(12px)' 
          }}
        >
          <input
            type="number"
            value={widthText}
            onChange={(e) => {
              setWidthText(e.target.value);
              const num = Number(e.target.value);
              if (!isNaN(num) && num >= minW && num <= maxW) {
                onDimensionChange(num, height);
              }
            }}
            onBlur={(e) => {
              let val = Number(e.target.value) || minW;
              val = Math.max(minW, Math.min(maxW, val));
              onDimensionChange(val, height);
              setWidthText(val.toString());
            }}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter') e.currentTarget.blur();
            }}
            onKeyUp={(e) => e.stopPropagation()}
            className="w-12 bg-transparent text-[#eab676] text-center text-xs font-black tracking-widest focus:outline-none appearance-none"
            style={{ border: 'none', padding: 0 }}
          />
          <span className="text-[#eab676]/45 text-xs font-black select-none pointer-events-none">x</span>
          <input
            type="number"
            value={heightText}
            onChange={(e) => {
              setHeightText(e.target.value);
              const num = Number(e.target.value);
              if (!isNaN(num) && num >= minH && num <= maxH) {
                onDimensionChange(width, num);
              }
            }}
            onBlur={(e) => {
              let val = Number(e.target.value) || minH;
              val = Math.max(minH, Math.min(maxH, val));
              onDimensionChange(width, val);
              setHeightText(val.toString());
            }}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter') e.currentTarget.blur();
            }}
            onKeyUp={(e) => e.stopPropagation()}
            className="w-12 bg-transparent text-[#eab676] text-center text-xs font-black tracking-widest focus:outline-none appearance-none"
            style={{ border: 'none', padding: 0 }}
          />
          <span className="text-[#eab676] text-[10px] font-black ml-0.5 select-none pointer-events-none">mm</span>
        </div>
      )}

      <DelayedLoader mountHeavy={mountHeavy} />
    </div>
  );
};
