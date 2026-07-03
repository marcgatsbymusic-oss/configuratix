import React, { useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html, useProgress } from '@react-three/drei';
import * as THREE from 'three';
import { FrameSegment, type MatType } from './FrameSegment';

import z02Raw from '../../data/profiles/IGLO5/zlozenie_02.json';
import z30Raw from '../../data/profiles/IGLO5/zlozenie_30.json';
import z07Raw from '../../data/profiles/IGLO5/zlozenie_07.json';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Point { cmd?: string; x: number; y: number; bulge?: number }
interface Contour { id?: string; points: Point[]; threeShape?: Point[]; verified?: boolean; pointCount?: number }
interface LayerData { group: string; contours: Contour[] }
interface ProfileData {
  meta: { bounds: { normalised: { minX: number; maxX: number; minY: number; maxY: number } } };
  layers: Record<string, LayerData>;
}

const z02 = z02Raw as unknown as ProfileData;
const z30 = z30Raw as unknown as ProfileData;
const z07 = z07Raw as unknown as ProfileData;

// ─── PARAMS ───────────────────────────────────────────────────────────────────
const PARAMS = {
  WIN_W:             850,
  WIN_H:            1300,
  WIN_DEPTH:          70,
  TRANSOM_FACE:       85,
  TRANSOM_AXIS_Y:    430,
  FRAME_FACE:         47,
  SASH_FACE:          70,
  BEAD_SIGHT:          6,
  GLASS_THK:          24,
  SASH_MARGIN:      37.92,
  SASH_SETBACK_Z:   18.99,
  GLAZING_REBATE:     50,
  TRANSOM_FLUSH_INT: true,
  UNIT_SCALE:        0.001,
  SEAM_TOL:          0.75,
  MITRE_DEG:         45,
};

const D = PARAMS;
const rect = (x0: number, y0: number, x1: number, y1: number) => ({ x0, y0, x1, y1, w: x1 - x0, h: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 });

const tTop = D.TRANSOM_AXIS_Y + D.TRANSOM_FACE / 2;
const tBot = D.TRANSOM_AXIS_Y - D.TRANSOM_FACE / 2;

const m  = D.SASH_MARGIN;
const ff = D.FRAME_FACE;
const gr = D.GLAZING_REBATE;

const sashOuter = rect(m, tTop, D.WIN_W - m, D.WIN_H - m);
const sf = D.SASH_FACE;
const sashDaylight = rect(sashOuter.x0 + sf, sashOuter.y0 + sf, sashOuter.x1 - sf, sashOuter.y1 - sf);
const botGlass = rect(gr, gr, D.WIN_W - gr, tBot);
const b = D.BEAD_SIGHT;
const glassTop = rect(sashDaylight.x0 - b, sashDaylight.y0 - b, sashDaylight.x1 + b, sashDaylight.y1 + b);
const glassBot = botGlass;
const clearW = D.WIN_W - 2 * ff;

const scale = D.UNIT_SCALE;

// ─── Utility Functions ────────────────────────────────────────────────────────
function loopEndpointsCollinear(pts: Point[]) {
  if (!pts || pts.length < 2) return false;
  const a = pts[0], b = pts[pts.length - 1];
  return Math.abs(a.x - b.x) < D.SEAM_TOL || Math.abs(a.y - b.y) < D.SEAM_TOL;
}

function assertProfile(name: string, contour: Contour) {
  const n = contour.pointCount ?? (contour.points?.length ?? 0);
  const STRUCTURAL = /^(FRM|SSH|POST)_(EXT|INT)$/.test(name);
  if (STRUCTURAL && n < 8)
    throw new Error(`[F252] ${name}: ${n} pts — elevation silhouette, NOT a cross-section. Flat-slab bug.`);
  if (STRUCTURAL && !contour.verified && !loopEndpointsCollinear(contour.points))
    throw new Error(`[F252] ${name}: unverified AND non-collinear endpoints — genuinely broken loop.`);
  if (name.startsWith('GSK_SSH_INT') && (!contour.threeShape || contour.threeShape.length === 0))
    console.warn(`[F252] ${name}: raw gasket — running mirror fallback (§8).`);
}

function getVerticesWithMirrorFallback(dataset: ProfileData, layerName: string): {x: number, y: number}[][] {
  if (layerName === 'GSK_SSH_INT' && (!dataset.layers['GSK_SSH_INT']?.contours[0]?.threeShape || dataset.layers['GSK_SSH_INT'].contours[0].threeShape.length === 0)) {
    const extLayer = dataset.layers['GSK_SSH_EXT'];
    if (extLayer && extLayer.contours[0]) {
      const contour = extLayer.contours[0];
      const pts = contour.threeShape || contour.points;
      const c = pts.filter((p: Point, i: number) => i === 0 || Math.hypot(p.x - pts[i-1].x, p.y - pts[i-1].y) > 1e-6);
      const mirrored = c.map((p: Point) => ({ x: 35 - (p.x - 35), y: p.y }));
      mirrored.reverse();
      return [mirrored];
    }
  }

  const layer = dataset.layers[layerName];
  if (!layer || !layer.contours) return [];

  return layer.contours.map((contour: Contour) => {
    assertProfile(layerName, contour);
    const pts = contour.threeShape || contour.points;
    const c = pts.filter((p: Point, i: number) => i === 0 || Math.hypot(p.x - pts[i-1].x, p.y - pts[i-1].y) > 1e-6);
    return c.map((p: Point) => ({ x: p.x, y: p.y }));
  }).filter(c => c.length > 0);
}

function LoadingOverlay() {
  const { active, progress } = useProgress();
  if (!active) return null;
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3 text-[#eab676]">
        <div className="w-10 h-10 border-4 border-[#eab676] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold tracking-widest uppercase">
          {progress.toFixed(0)}%
        </span>
      </div>
    </Html>
  );
}

// ─── Assembly Component ───────────────────────────────────────────────────────
export function F252proofconcept() {
  // Colors
  const colorExt = '#e8e0d4';
  const colorInt = '#f0ece6';
  const colorGsk = '#1c1c1c';
  const colorSpacer = '#4B4B4D';

  // --- Extract Contours ---
  // Frame (z02)
  const frmExt    = useMemo(() => getVerticesWithMirrorFallback(z02, 'FRM_EXT'), []);
  const frmInt    = useMemo(() => getVerticesWithMirrorFallback(z02, 'FRM_INT'), []);
  const gskFrmExt = useMemo(() => getVerticesWithMirrorFallback(z02, 'GSK_FRM_EXT'), []);

  // Transom (z30)
  const postExt    = useMemo(() => getVerticesWithMirrorFallback(z30, 'POST_EXT'), []);
  const postInt    = useMemo(() => getVerticesWithMirrorFallback(z30, 'POST_INT'), []);
  const gskPostExt = useMemo(() => getVerticesWithMirrorFallback(z30, 'GSK_POST_EXT'), []);
  const gskPostInt = useMemo(() => getVerticesWithMirrorFallback(z30, 'GSK_POST_INT'), []);

  // Sash (z02)
  const sshExt    = useMemo(() => getVerticesWithMirrorFallback(z02, 'SSH_EXT'), []);
  const sshInt    = useMemo(() => getVerticesWithMirrorFallback(z02, 'SSH_INT'), []);
  const gskSshExt = useMemo(() => getVerticesWithMirrorFallback(z02, 'GSK_SSH_EXT'), []);
  const gskSshInt = useMemo(() => getVerticesWithMirrorFallback(z02, 'GSK_SSH_INT'), []);

  // Top Glazing (z02)
  const bzdSsh    = useMemo(() => getVerticesWithMirrorFallback(z02, 'BZD_SSH'), []);
  const gskBzdSsh = useMemo(() => getVerticesWithMirrorFallback(z02, 'GSK_BZD_SSH'), []);
  const spacerSsh = useMemo(() => getVerticesWithMirrorFallback(z02, 'SPACER_SSH'), []);

  // Bottom Fixed Glazing (z07)
  const bzdFrm    = useMemo(() => getVerticesWithMirrorFallback(z07, 'BZD_FRM'), []);
  const gskBzdFrm = useMemo(() => getVerticesWithMirrorFallback(z07, 'GSK_BZD_FRM'), []);
  const spacerFrm = useMemo(() => getVerticesWithMirrorFallback(z07, 'SPACER_FRM'), []);

  // Origins
  const profileOrigin = { x: 0, y: 0 };
  const transomOrigin = { x: 0, y: 65 }; 

  // Helpers
  const renderSegments = (contours: {x:number, y:number}[][], layer: string, matType: MatType, color: string, length: number, mitred: boolean, origin: {x:number, y:number}) => {
    return contours.map((c, i) => (
      <FrameSegment 
        key={`${layer}_${i}`} 
        layerName={layer} 
        scaleFactor={scale}
        length={length} 
        vertices={c} 
        matType={matType}
        color={color}
        origin={origin} 
        uSign={1} 
        uOffset={0}
        mitredLeft={mitred} 
        mitredRight={mitred}
        skipCuts={!mitred}
        uvMode={layer.startsWith('BZD') ? 'rail' : 'triplanar'}
      />
    ));
  };

  const RectGroup = ({ w, h, renderSide }: { w: number, h: number, renderSide: (len: number) => React.ReactNode }) => (
    <group>
      {/* Bottom */}
      <group position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]}>{renderSide(w)}</group>
      {/* Right */}
      <group position={[w * scale, 0, 0]} rotation={[0, 0, Math.PI / 2]}><group rotation={[0, Math.PI / 2, 0]}>{renderSide(h)}</group></group>
      {/* Top */}
      <group position={[w * scale, h * scale, 0]} rotation={[0, 0, Math.PI]}><group rotation={[0, Math.PI / 2, 0]}>{renderSide(w)}</group></group>
      {/* Left */}
      <group position={[0, h * scale, 0]} rotation={[0, 0, -Math.PI / 2]}><group rotation={[0, Math.PI / 2, 0]}>{renderSide(h)}</group></group>
    </group>
  );

  const glassMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#ffffff', roughness: 0.1, metalness: 0.0, transmission: 1.0, ior: 1.5,
    thickness: 0.01, transparent: true, opacity: 0.6, envMapIntensity: 0.3,
  }), []);

  const renderGlassPane = (rect: { w: number, h: number }) => {
    const paneW = rect.w * scale;
    const paneH = rect.h * scale;
    // Fixed thickness is 24 per recipe. Centered in Z around 35 (half of 70).
    const thickness = D.GLASS_THK * scale;
    const centerDepth = 35 * scale;
    return (
      <mesh position={[paneW / 2, paneH / 2, centerDepth]} material={glassMat} castShadow={false} receiveShadow={false}>
        <boxGeometry args={[paneW, paneH, thickness]} />
      </mesh>
    );
  };

  const W_M = D.WIN_W * scale;
  const H_M = D.WIN_H * scale;
  const maxDim = Math.max(W_M, H_M);

  return (
    <div className="w-full h-full min-h-[600px] bg-slate-50 rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
      <Canvas shadows camera={{ position: [W_M / 2, H_M / 2, maxDim * 2.2], fov: 45 }} gl={{ antialias: true }}>
        <ambientLight intensity={0.78} />
        <directionalLight position={[maxDim * 1.5, maxDim * 2, maxDim * 2.5]} intensity={1.2} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0005} />
        <directionalLight position={[-maxDim * 2, maxDim * 1.5, -maxDim * 2]} intensity={0.45} />
        
        <Suspense fallback={<LoadingOverlay />}>
          <Environment files="/assets/hdri/monochrome_studio_02_1k.exr" />
          
          <group name="F252proofconcept">
            
            {/* 1. Outer Frame (at 0,0) */}
            <RectGroup 
              w={D.WIN_W} 
              h={D.WIN_H} 
              renderSide={(len) => (<>
                {renderSegments(frmExt, 'FRM_EXT', 'ext', colorExt, len, true, profileOrigin)}
                {renderSegments(frmInt, 'FRM_INT', 'int', colorInt, len, true, profileOrigin)}
                {renderSegments(gskFrmExt, 'GSK_FRM_EXT', 'gsk', colorGsk, len, true, profileOrigin)}
              </>)} 
            />

            {/* 2. Transom */}
            <group position={[D.FRAME_FACE * scale, D.TRANSOM_AXIS_Y * scale, 0]} rotation={[0, Math.PI / 2, 0]}>
              {renderSegments(postExt, 'POST_EXT', 'ext', colorExt, clearW, false, transomOrigin)}
              {renderSegments(postInt, 'POST_INT', 'int', colorInt, clearW, false, transomOrigin)}
              {renderSegments(gskPostExt, 'GSK_POST_EXT', 'gsk', colorGsk, clearW, true, transomOrigin)}
              {gskPostInt.length > 0 && renderSegments(gskPostInt, 'GSK_POST_INT', 'gsk', colorGsk, clearW, true, transomOrigin)}
            </group>

            {/* 3. Top Sash (Overlaps frame) */}
            <group 
              position={[
                sashOuter.x0 * scale, 
                sashOuter.y0 * scale, 
                D.SASH_SETBACK_Z * scale 
              ]}
            >
              <RectGroup 
                w={sashOuter.w} 
                h={sashOuter.h} 
                renderSide={(len) => (<>
                  {renderSegments(sshExt, 'SSH_EXT', 'ext', colorExt, len, true, profileOrigin)}
                  {renderSegments(sshInt, 'SSH_INT', 'int', colorInt, len, true, profileOrigin)}
                  {renderSegments(gskSshExt, 'GSK_SSH_EXT', 'gsk', colorGsk, len, true, profileOrigin)}
                  {renderSegments(gskSshInt, 'GSK_SSH_INT', 'gsk', colorGsk, len, true, profileOrigin)}
                </>)} 
              />
              
              {/* Sash Glazing & Beads (Ring around sashDaylight) */}
              <group position={[sf * scale, sf * scale, 0]}>
                <RectGroup
                  w={sashDaylight.w}
                  h={sashDaylight.h}
                  renderSide={(len) => (<>
                    {renderSegments(bzdSsh, 'BZD_SSH', 'int', colorInt, len, true, profileOrigin)}
                    {renderSegments(gskBzdSsh, 'GSK_BZD_SSH', 'gsk', colorGsk, len, true, profileOrigin)}
                    {renderSegments(spacerSsh, 'SPACER_SSH', 'spacer', colorSpacer, len, true, profileOrigin)}
                  </>)}
                />
              </group>
              
              {/* Sash Glass Pane */}
              <group position={[(glassTop.x0 - sashOuter.x0) * scale, (glassTop.y0 - sashOuter.y0) * scale, 0]}>
                 {renderGlassPane(glassTop)}
              </group>
            </group>

            {/* 4. Bottom Fixed Glazing */}
            <group>
              {/* Bead Ring directly on the frame */}
              <group position={[botGlass.x0 * scale, botGlass.y0 * scale, 0]}>
                <RectGroup
                  w={botGlass.w}
                  h={botGlass.h}
                  renderSide={(len) => (<>
                    {renderSegments(bzdFrm, 'BZD_FRM', 'int', colorInt, len, true, profileOrigin)}
                    {renderSegments(gskBzdFrm, 'GSK_BZD_FRM', 'gsk', colorGsk, len, true, profileOrigin)}
                    {renderSegments(spacerFrm, 'SPACER_FRM', 'spacer', colorSpacer, len, true, profileOrigin)}
                  </>)}
                />
              </group>

              {/* Bottom Glass Pane */}
              <group position={[glassBot.x0 * scale, glassBot.y0 * scale, 0]}>
                 {renderGlassPane(glassBot)}
              </group>
            </group>

          </group>
        </Suspense>

        <ContactShadows position={[W_M / 2, -0.005, -0.04]} opacity={0.12} scale={maxDim * 5} blur={2.5} far={maxDim * 2} />
        <OrbitControls makeDefault enablePan enableZoom target={[W_M / 2, H_M / 2, -0.04]} minDistance={maxDim * 0.4} maxDistance={maxDim * 6} />
      </Canvas>
    </div>
  );
}
