/**
 * Iglo5F202Viewer.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * F202 — "Okno 2 kw. słupek ruchomy"
 * Double casement window with MOVABLE MULLION (slupek ruchomy 50029).
 *
 * Profiles used (from seed/data/profiles/):
 *   Frame:   frame__50003_rama_75mm.json    (75mm system depth)
 *   Sash L:  sash__50034_skrzyd_o_120mm_N_Z.json
 *   Sash R:  sash__50031_skrzyd_o_105mm_D_W.json
 *   Mullion: mullion_movable__50029_s_upek_ruchomy.json
 *
 * Layout from engine/build_from_code.js F202 plan:
 *   Frame face = 70mm, Mullion face = 80mm
 *   Left sash  → Turn (hand L)   — passive, holds the floating post
 *   Right sash → TiltTurn (hand R) — active
 * ─────────────────────────────────────────────────────────────────────────
 */

import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { FrameSegment } from './FrameSegment';

// ── Profile data imports ─────────────────────────────────────────────────
import frameProfile   from '../../../data/profiles/frame__50003_rama_75mm.json';
import sashProfileNZ  from '../../../data/profiles/sash__50034_skrzyd_o_120mm_N_Z.json';
import sashProfileDW  from '../../../data/profiles/sash__50031_skrzyd_o_105mm_D_W.json';
import mullionProfile from '../../../data/profiles/mullion_movable__50029_s_upek_ruchomy.json';
import glassProfile   from '../../../data/profiles/glass__szyba_24mm.json';
import beadProfile    from '../../../data/profiles/glazing_bead__50924_listwa_22mm.json';
import spacerProfile  from '../../../data/profiles/spacer_bridge__mostek_podszybowy.json';
import gasket250010   from '../../../data/profiles/gasket__250010.json';
import gasket250011   from '../../../data/profiles/gasket__250011.json';

import { transformLoop } from '../../../engine/assemble.ts';
import type { Loop } from '../../../engine/assemble.ts';

// ── Helpers ──────────────────────────────────────────────────────────────

function normalizeLoops(profile: any): Loop[] {
  return (profile.loops || []).map((loop: any) => ({
    closed: !!loop.closed,
    pts: (loop.pts || []).map((p: any) =>
      Array.isArray(p) ? { x: p[0], y: p[1] } : { x: p.x ?? 0, y: p.y ?? 0 }
    ),
  }));
}

// ── Props ─────────────────────────────────────────────────────────────────

interface Iglo5F202ViewerProps {
  widthMm:   number;
  heightMm:  number;
  colorExt?: string;
  colorInt?: string;
  sealColor?: string;
  /** When true the left sash swings open */
  leftOpen?:  boolean;
  /** When true the right sash tilts */
  rightOpen?: boolean;
  onToggleLeft?:  () => void;
  onToggleRight?: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────

export const Iglo5F202Viewer: React.FC<Iglo5F202ViewerProps> = ({
  widthMm   = 1500,
  heightMm  = 1200,
  colorExt  = '#f0ece6',
  colorInt  = '#f0ece6',
  sealColor = '#1a1a1a',
  leftOpen  = false,
  rightOpen = false,
  onToggleLeft,
  onToggleRight,
}) => {

  const scale = 0.001; // mm → metres (R3F units)

  // ── Catalogue plan dimensions (from engine/build_from_code.js F202) ────
  const FRAME_FACE  = 70;   // mm — frame rebate face width
  const MULLION_W   = 80;   // mm — movable post face
  const SASH_FACE   = 70;   // mm — sash stile face (approx for glass calc)

  const W = widthMm  * scale;
  const H = heightMm * scale;

  const frameFace  = FRAME_FACE  * scale;
  const mullionW   = MULLION_W   * scale;

  // Inner aperture
  const innerW = W - 2 * frameFace;
  const innerH = H - 2 * frameFace;

  // Each sash gets half the inner width minus half the mullion
  const sashW  = (innerW - mullionW) / 2;
  const sashH  = innerH;

  // Pivot depth (82mm behind EXT face, per GEMINI.md rule)
  const pivotZ = -82.0 * scale;

  // ── Sash animation refs ───────────────────────────────────────────────
  const leftPivotRef  = useRef<THREE.Group>(null!);
  const rightPivotRef = useRef<THREE.Group>(null!);
  const curLeft  = useRef(0);
  const curRight = useRef(0);

  const targetLeft  = leftOpen  ?  (100 * Math.PI) / 180 : 0;
  const targetRight = rightOpen ? -(22  * Math.PI) / 180 : 0; // tilt ~22° inward

  useFrame((_s, dt) => {
    const spd = 5;
    curLeft.current  += (targetLeft  - curLeft.current)  * spd * dt;
    curRight.current += (targetRight - curRight.current) * spd * dt;
    if (leftPivotRef.current)  leftPivotRef.current.rotation.y  = curLeft.current;
    if (rightPivotRef.current) rightPivotRef.current.rotation.x = curRight.current;
  });

  // ── Normalized profile loops ──────────────────────────────────────────
  const frmLoops    = useMemo(() => normalizeLoops(frameProfile),   []);
  const sashNZLoops = useMemo(() => normalizeLoops(sashProfileNZ),  []);
  const sashDWLoops = useMemo(() => normalizeLoops(sashProfileDW),  []);
  const mullLoops   = useMemo(() => normalizeLoops(mullionProfile),  []);
  const glassLoops  = useMemo(() => normalizeLoops(glassProfile),    []);
  const beadLoops_  = useMemo(() => normalizeLoops(beadProfile),     []);
  const spacLoops   = useMemo(() => normalizeLoops(spacerProfile),   []);
  const gsk10Loops  = useMemo(() => normalizeLoops(gasket250010),    []);
  const gsk11Loops  = useMemo(() => normalizeLoops(gasket250011),    []);

  // ── Sash assembly (same offsets as existing MovableMullionTestViewer) ─
  const sashAssembly = useMemo(() => {
    const sashOff: [number, number] = [0, 45];
    const glassOff: [number, number] = [-55, 111];
    const beadOff: [number, number]  = [-1,  91];
    const spacOff: [number, number]  = [-23.92, 86];
    return {
      nzLoops:    sashNZLoops.map(l => transformLoop(l, sashOff, 0)),
      dwLoops:    sashDWLoops.map(l => transformLoop(l, sashOff, 0)),
      glassLoops: glassLoops.map( l => transformLoop(l, glassOff, 0)),
      beadLoops:  beadLoops_.map( l => transformLoop(l, beadOff, 90)),
      spacLoops:  spacLoops.map(  l => transformLoop(l, spacOff, 0)),
      gsk10:      gsk10Loops.map( l => transformLoop(l, sashOff, 0)),
      gsk11:      gsk11Loops.map( l => transformLoop(l, beadOff, 90)),
    };
  }, [sashNZLoops, sashDWLoops, glassLoops, beadLoops_, spacLoops, gsk10Loops, gsk11Loops]);

  // Movable post offset (as per existing viewer: postOffset [0,21])
  const mullAssembly = useMemo(() =>
    mullLoops.map(l => transformLoop(l, [0, 21], 0)),
  [mullLoops]);

  // ── Materials ─────────────────────────────────────────────────────────
  const extMat   = useMemo(() => new THREE.MeshStandardMaterial({ color: colorExt, roughness: 0.38, metalness: 0.06 }), [colorExt]);
  const intMat   = useMemo(() => new THREE.MeshStandardMaterial({ color: colorInt, roughness: 0.38, metalness: 0.06 }), [colorInt]);
  const sealMat  = useMemo(() => new THREE.MeshStandardMaterial({ color: sealColor,roughness: 0.9,  metalness: 0.0  }), [sealColor]);
  const spacMat  = useMemo(() => new THREE.MeshStandardMaterial({ color: '#4B4B4D',roughness: 0.6,  metalness: 0.5  }), []);
  const glassMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#ffffff', roughness: 0.04, metalness: 0, transmission: 1.0,
    ior: 1.52, thickness: 0.004, transparent: true, opacity: 0.25,
  }), []);

  // ── Render helpers ────────────────────────────────────────────────────

  /** Render one frame edge (bottom/top/left/right jamb) */
  const renderFrame = (lenMm: number, uSign: number, uOff: number) => (
    <FrameSegment
      layerName="FRM_EXT"
      scaleFactor={scale}
      length={lenMm}
      loops={frmLoops}
      material={extMat}
      origin={{ x: 0, y: 0 }}
      uSign={uSign}
      uOffset={uOff}
    />
  );

  /** Render one sash edge (bottom/top/left/right stile or rail) with all sub-layers */
  const renderSash = (
    lenMm: number,
    uSign: number,
    uOff: number,
    sashLoops: Loop[],
  ) => (
    <>
      <FrameSegment layerName="SSH_EXT" scaleFactor={scale} length={lenMm}
        loops={sashLoops} material={extMat}
        origin={{ x: 0, y: 0 }} uSign={uSign} uOffset={uOff} />
      <FrameSegment layerName="BZD" scaleFactor={scale} length={lenMm}
        loops={sashAssembly.beadLoops} material={intMat}
        origin={{ x: 0, y: 0 }} uSign={uSign} uOffset={uOff} uvMode="rail" />
      <FrameSegment layerName="SPACER" scaleFactor={scale} length={lenMm}
        loops={sashAssembly.spacLoops} material={spacMat}
        origin={{ x: 0, y: 0 }} uSign={uSign} uOffset={uOff} />
      <FrameSegment layerName="GSK_SSH" scaleFactor={scale} length={lenMm}
        loops={sashAssembly.gsk10} material={sealMat}
        origin={{ x: 0, y: 0 }} uSign={uSign} uOffset={uOff} />
      <FrameSegment layerName="GSK_BZD" scaleFactor={scale} length={lenMm}
        loops={sashAssembly.gsk11} material={sealMat}
        origin={{ x: 0, y: 0 }} uSign={uSign} uOffset={uOff} />
    </>
  );

  /** Render the floating movable mullion (post) */
  const renderMullion = (lenMm: number) => (
    <FrameSegment
      layerName="PST_EXT"
      scaleFactor={scale}
      length={lenMm}
      loops={mullAssembly}
      material={extMat}
      origin={{ x: 0, y: 0 }}
      skipCuts
    />
  );

  /** Glass pane sized to the sash aperture */
  const renderGlass = (sw: number, sh: number) => {
    const pW = sw - 130 * scale;
    const pH = sh - 130 * scale;
    const t  = 24 * scale;
    return (
      <mesh position={[sw / 2, sh / 2, -70 * scale]} material={glassMat}>
        <boxGeometry args={[pW, pH, t]} />
      </mesh>
    );
  };

  // ── Left sash pivot origin ────────────────────────────────────────────
  const lPivX = 24 * scale;
  const lPivY = 24 * scale;

  // Right sash pivot for tilt (top horizontal axis)
  const rPivX = sashW / 2;
  const rPivY = sashH - 24 * scale;

  // ── JSX ───────────────────────────────────────────────────────────────
  return (
    <group>

      {/* ── Outer Frame (4 edges) ─────────────────────────────────── */}
      <group>
        {/* Bottom sill */}
        <group rotation={[0, 0, 0]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            {renderFrame(widthMm, 1, 0)}
          </group>
        </group>
        {/* Right jamb */}
        <group position={[W, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            {renderFrame(heightMm, -1, W / scale)}
          </group>
        </group>
        {/* Top head */}
        <group position={[W, H, 0]} rotation={[0, 0, Math.PI]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            {renderFrame(widthMm, 1, (W - H) / scale)}
          </group>
        </group>
        {/* Left jamb */}
        <group position={[0, H, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            {renderFrame(heightMm, -1, (W - H) / scale)}
          </group>
        </group>
      </group>

      {/* ── Left Sash (Turn, passive — holds the movable mullion) ─── */}
      <group position={[frameFace, frameFace, 0]}>
        {/* Pivot at hinge stile (left edge), pivotZ = -82mm */}
        <group position={[lPivX, lPivY, pivotZ]}>
          <group ref={leftPivotRef}>
            <group position={[-lPivX, -lPivY, -pivotZ]}>
              {/* Bottom rail */}
              <group rotation={[0, 0, 0]}>
                <group rotation={[0, Math.PI / 2, 0]}>
                  {renderSash(sashW / scale, 1, 0, sashAssembly.nzLoops)}
                </group>
              </group>
              {/* Right stile */}
              <group position={[sashW, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <group rotation={[0, Math.PI / 2, 0]}>
                  {renderSash(sashH / scale, -1, sashW / scale, sashAssembly.nzLoops)}
                </group>
              </group>
              {/* Top rail */}
              <group position={[sashW, sashH, 0]} rotation={[0, 0, Math.PI]}>
                <group rotation={[0, Math.PI / 2, 0]}>
                  {renderSash(sashW / scale, 1, (sashW - sashH) / scale, sashAssembly.nzLoops)}
                </group>
              </group>
              {/* Left stile (hinge side) */}
              <group position={[0, sashH, 0]} rotation={[0, 0, -Math.PI / 2]}>
                <group rotation={[0, Math.PI / 2, 0]}>
                  {renderSash(sashH / scale, -1, (sashW - sashH) / scale, sashAssembly.nzLoops)}
                </group>
              </group>

              {/* Glass */}
              {renderGlass(sashW, sashH)}

              {/* Floating movable mullion — attached to the right stile */}
              <group position={[sashW, sashH, 0]} rotation={[0, 0, -Math.PI / 2]}>
                <group rotation={[0, Math.PI / 2, 0]}>
                  {renderMullion(sashH / scale)}
                </group>
              </group>

              {/* Hotspot — toggle left sash open/closed */}
              <Html position={[sashW - 45 * scale, sashH / 2, -100 * scale]} center>
                <button
                  className="w-8 h-8 rounded-full bg-emerald-500/20 border-2 border-emerald-400 hover:scale-110 active:scale-95 transition-all flex items-center justify-center shadow-lg shadow-emerald-500/30 cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); onToggleLeft?.(); }}
                  title="Toggle left sash"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </button>
              </Html>
            </group>
          </group>
        </group>
      </group>

      {/* ── Right Sash (TiltTurn, active) ─────────────────────────── */}
      <group position={[frameFace + sashW + mullionW, frameFace, 0]}>
        {/* Pivot at bottom of sash for tilt (top edge rotates inward) */}
        <group position={[rPivX, rPivY, pivotZ]}>
          <group ref={rightPivotRef}>
            <group position={[-rPivX, -rPivY, -pivotZ]}>
              {/* Bottom rail */}
              <group rotation={[0, 0, 0]}>
                <group rotation={[0, Math.PI / 2, 0]}>
                  {renderSash(sashW / scale, 1, 0, sashAssembly.dwLoops)}
                </group>
              </group>
              {/* Right stile */}
              <group position={[sashW, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <group rotation={[0, Math.PI / 2, 0]}>
                  {renderSash(sashH / scale, -1, sashW / scale, sashAssembly.dwLoops)}
                </group>
              </group>
              {/* Top rail */}
              <group position={[sashW, sashH, 0]} rotation={[0, 0, Math.PI]}>
                <group rotation={[0, Math.PI / 2, 0]}>
                  {renderSash(sashW / scale, 1, (sashW - sashH) / scale, sashAssembly.dwLoops)}
                </group>
              </group>
              {/* Left stile (lock side meets mullion) */}
              <group position={[0, sashH, 0]} rotation={[0, 0, -Math.PI / 2]}>
                <group rotation={[0, Math.PI / 2, 0]}>
                  {renderSash(sashH / scale, -1, (sashW - sashH) / scale, sashAssembly.dwLoops)}
                </group>
              </group>

              {/* Glass */}
              {renderGlass(sashW, sashH)}

              {/* Hotspot — toggle right sash tilt */}
              <Html position={[45 * scale, sashH / 2, -100 * scale]} center>
                <button
                  className="w-8 h-8 rounded-full bg-rose-500/20 border-2 border-rose-400 hover:scale-110 active:scale-95 transition-all flex items-center justify-center shadow-lg shadow-rose-500/30 cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); onToggleRight?.(); }}
                  title="Toggle right sash tilt"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                </button>
              </Html>
            </group>
          </group>
        </group>
      </group>

    </group>
  );
};

export default Iglo5F202Viewer;
