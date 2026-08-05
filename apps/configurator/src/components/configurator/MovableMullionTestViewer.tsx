import React, { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { FrameSegment } from './FrameSegment';
import { AdaptiveCamera } from './AdaptiveCamera';

// Import raw seed JSON profile shapes and recipes
import frameProfile from '../../../data/profiles/frame__50001_rama_66mm.json';
import sashProfile from '../../../data/profiles/sash__50013_skrzyd_o_niezlicowane.json';
import mullionProfile from '../../../data/profiles/mullion_movable__50029_s_upek_ruchomy.json';
import glassProfile from '../../../data/profiles/glass__szyba_24mm.json';
import beadProfile from '../../../data/profiles/glazing_bead__50924_listwa_22mm.json';
import spacerProfile from '../../../data/profiles/spacer_bridge__mostek_podszybowy.json';
import gasket250010 from '../../../data/profiles/gasket__250010.json';
import gasket250011 from '../../../data/profiles/gasket__250011.json';

import { transformLoop, computeBoundingBox } from '../../../engine/assemble.ts';
import type { Loop, Point } from '../../../engine/assemble.ts';

function normalizeProfileLoops(profile: any): Loop[] {
  return (profile.loops || []).map((loop: any) => ({
    closed: !!loop.closed,
    pts: (loop.pts || []).map((p: any) => {
      if (Array.isArray(p)) {
        return { x: p[0], y: p[1] };
      }
      return { x: p.x ?? 0, y: p.y ?? 0 };
    })
  }));
}


interface MovableMullionTestViewerProps {
  widthMm: number;
  heightMm: number;
  colorExt?: string;
  colorInt?: string;
  sealColor?: string;
}

export const MovableMullionTestViewer: React.FC<MovableMullionTestViewerProps> = ({
  widthMm,
  heightMm,
  colorExt = '#f0ece6',
  colorInt = '#f0ece6',
  sealColor = '#1a1a1a',
}) => {
  const controlsRef = useRef<any>(null);
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  const scale = 0.001; // mm -> meters
  const W = widthMm * scale;
  const H = heightMm * scale;

  // Sash calculations
  // Frame allowance is 45mm rebate offset on all sides
  const frameAllowance = 45 * scale;
  const W_sash_total = W - 2 * frameAllowance;
  const H_sash = H - 2 * frameAllowance;
  const W_sash = W_sash_total / 2;

  // Pivot groups references
  const leftSashPivotRef = useRef<THREE.Group>(null!);
  const rightSashPivotRef = useRef<THREE.Group>(null!);

  // Interpolation targets
  const leftTargetAngle = leftOpen ? (110 * Math.PI) / 180 : 0;
  const rightTargetAngle = rightOpen ? (-110 * Math.PI) / 180 : 0;

  const currentLeftAngle = useRef(0);
  const currentRightAngle = useRef(0);

  useFrame((state, delta) => {
    const speed = 6.0;
    currentLeftAngle.current += (leftTargetAngle - currentLeftAngle.current) * speed * delta;
    currentRightAngle.current += (rightTargetAngle - currentRightAngle.current) * speed * delta;

    if (leftSashPivotRef.current) {
      leftSashPivotRef.current.rotation.y = currentLeftAngle.current;
    }
    if (rightSashPivotRef.current) {
      rightSashPivotRef.current.rotation.y = currentRightAngle.current;
    }
  });

  // --- Dynamic Assembly via the Onboarded Engine ---
  const normalizedFrameLoops = useMemo(() => normalizeProfileLoops(frameProfile), []);
  const normalizedSashLoops = useMemo(() => normalizeProfileLoops(sashProfile), []);
  const normalizedGlassLoops = useMemo(() => normalizeProfileLoops(glassProfile), []);
  const normalizedBeadLoops = useMemo(() => normalizeProfileLoops(beadProfile), []);
  const normalizedSpacerLoops = useMemo(() => normalizeProfileLoops(spacerProfile), []);
  const normalizedGasket10Loops = useMemo(() => normalizeProfileLoops(gasket250010), []);
  const normalizedGasket11Loops = useMemo(() => normalizeProfileLoops(gasket250011), []);
  const normalizedMullionLoops = useMemo(() => normalizeProfileLoops(mullionProfile), []);

  // Assemble sash loops (sash, glass, glazing bead, spacer bridge, gaskets)
  const assembledSashLayers = useMemo(() => {
    // We apply offsets from the zlozenie recipes
    // In złożenie 01: sash is offset by [0, 45] relative to frame
    const sashOffset: [number, number] = [0, 45];
    const sashRot = 0;

    // Relative to the sash, we place the glazing components
    // We transform them to be in the sash coordinate space
    const glassOffset: [number, number] = [-55, 111];
    const beadOffset: [number, number] = [-1, 91];
    const beadRot = 90;
    const spacerOffset: [number, number] = [-23.92, 86];

    const sashLoops = normalizedSashLoops.map(l => transformLoop(l, sashOffset, sashRot));
    const glassLoops = normalizedGlassLoops.map(l => transformLoop(l, glassOffset, 0));
    const beadLoops = normalizedBeadLoops.map(l => transformLoop(l, beadOffset, beadRot));
    const spacerLoops = normalizedSpacerLoops.map(l => transformLoop(l, spacerOffset, 0));
    const gsk10Loops = normalizedGasket10Loops.map(l => transformLoop(l, sashOffset, sashRot));
    const gsk11Loops = normalizedGasket11Loops.map(l => transformLoop(l, beadOffset, beadRot));

    return {
      sashLoops,
      glassLoops,
      beadLoops,
      spacerLoops,
      gsk10Loops,
      gsk11Loops,
    };
  }, [normalizedSashLoops, normalizedGlassLoops, normalizedBeadLoops, normalizedSpacerLoops, normalizedGasket10Loops, normalizedGasket11Loops]);

  // Assemble movable post loops
  const assembledPostLayers = useMemo(() => {
    // Movable post is positioned at the right edge of the left sash
    // We transform its loops to center it in the sash rebate gap
    const postOffset: [number, number] = [0, 21];
    return normalizedMullionLoops.map(l => transformLoop(l, postOffset, 0));
  }, [normalizedMullionLoops]);

  // Bounding box of all geometry
  const commonOrigin = { x: 0, y: 0 };

  // Materials
  const extMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: colorExt,
    roughness: 0.4,
    metalness: 0.1,
  }), [colorExt]);

  const intMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: colorInt,
    roughness: 0.4,
    metalness: 0.1,
  }), [colorInt]);

  const gskMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: sealColor,
    roughness: 0.9,
    metalness: 0.0,
  }), [sealColor]);

  const spacerMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#4B4B4D',
    roughness: 0.6,
    metalness: 0.5,
  }), []);

  const glassMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#ffffff',
    roughness: 0.05,
    metalness: 0.0,
    transmission: 1.0,
    ior: 1.52,
    thickness: 0.004,
    transparent: true,
    opacity: 0.3,
  }), []);

  // --- Rendering Functions ---

  const renderFrameSide = (len: number, uSign: number, uOff: number) => (
    <FrameSegment
      layerName="FRM_EXT"
      scaleFactor={scale}
      length={len}
      loops={normalizedFrameLoops}
      material={extMat}
      origin={commonOrigin}
      uSign={uSign}
      uOffset={uOff}
    />
  );

  const renderSashSide = (len: number, uSign: number, uOff: number, layers: typeof assembledSashLayers) => (
    <>
      <FrameSegment
        layerName="SSH_EXT"
        scaleFactor={scale}
        length={len}
        loops={layers.sashLoops}
        material={extMat}
        origin={commonOrigin}
        uSign={uSign}
        uOffset={uOff}
      />
      <FrameSegment
        layerName="BZD"
        scaleFactor={scale}
        length={len}
        loops={layers.beadLoops}
        material={intMat}
        origin={commonOrigin}
        uSign={uSign}
        uOffset={uOff}
        uvMode="rail"
      />
      <FrameSegment
        layerName="SPACER"
        scaleFactor={scale}
        length={len}
        loops={layers.spacerLoops}
        material={spacerMat}
        origin={commonOrigin}
        uSign={uSign}
        uOffset={uOff}
      />
      <FrameSegment
        layerName="GSK_SSH_EXT"
        scaleFactor={scale}
        length={len}
        loops={layers.gsk10Loops}
        material={gskMat}
        origin={commonOrigin}
        uSign={uSign}
        uOffset={uOff}
      />
      <FrameSegment
        layerName="GSK_BZD"
        scaleFactor={scale}
        length={len}
        loops={layers.gsk11Loops}
        material={gskMat}
        origin={commonOrigin}
        uSign={uSign}
        uOffset={uOff}
      />
    </>
  );

  const renderMovablePost = (len: number) => (
    <FrameSegment
      layerName="PST_EXT"
      scaleFactor={scale}
      length={len}
      loops={assembledPostLayers}
      material={extMat}
      origin={commonOrigin}
      skipCuts
    />
  );

  // Render glass pane
  const renderGlassPane = (sashW: number, sashH: number) => {
    const paneW = sashW - 130 * scale;
    const paneH = sashH - 130 * scale;
    const thickness = 24 * scale; // Double glazed unit
    const zOffset = -70 * scale;

    return (
      <mesh position={[sashW / 2, sashH / 2, zOffset]} material={glassMat}>
        <boxGeometry args={[paneW, paneH, thickness]} />
      </mesh>
    );
  };

  // Hinge settings relative to sash coordinates
  const leftPivotX = 24 * scale;
  const leftPivotY = 24 * scale;
  const leftPivotZ = -82.0 * scale;

  const rightPivotX = W_sash - 24 * scale;
  const rightPivotY = 24 * scale;
  const rightPivotZ = -82.0 * scale;

  return (
    <group>
      {/* ── Outer Frame ── */}
      <group>
        {/* Bottom sill */}
        <group rotation={[0, 0, 0]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            {renderFrameSide(widthMm, 1, 0)}
          </group>
        </group>
        {/* Right jamb */}
        <group position={[W, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            {renderFrameSide(heightMm, -1, W / scale)}
          </group>
        </group>
        {/* Top head */}
        <group position={[W, H, 0]} rotation={[0, 0, Math.PI]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            {renderFrameSide(widthMm, 1, (W - H) / scale)}
          </group>
        </group>
        {/* Left jamb */}
        <group position={[0, H, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            {renderFrameSide(heightMm, -1, (W - H) / scale)}
          </group>
        </group>
      </group>

      {/* ── Left Sash (Passive, holds the movable mullion) ── */}
      <group position={[frameAllowance, frameAllowance, 0]}>
        <group position={[leftPivotX, leftPivotY, leftPivotZ]}>
          <group ref={leftSashPivotRef}>
            <group position={[-leftPivotX, -leftPivotY, -leftPivotZ]}>
              {/* Bottom rail */}
              <group rotation={[0, 0, 0]}>
                <group rotation={[0, Math.PI / 2, 0]}>
                  {renderSashSide(W_sash / scale, 1, 0, assembledSashLayers)}
                </group>
              </group>
              {/* Right rail */}
              <group position={[W_sash, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <group rotation={[0, Math.PI / 2, 0]}>
                  {renderSashSide(H_sash / scale, -1, W_sash / scale, assembledSashLayers)}
                </group>
              </group>
              {/* Top rail */}
              <group position={[W_sash, H_sash, 0]} rotation={[0, 0, Math.PI]}>
                <group rotation={[0, Math.PI / 2, 0]}>
                  {renderSashSide(W_sash / scale, 1, (W_sash - H_sash) / scale, assembledSashLayers)}
                </group>
              </group>
              {/* Left rail */}
              <group position={[0, H_sash, 0]} rotation={[0, 0, -Math.PI / 2]}>
                <group rotation={[0, Math.PI / 2, 0]}>
                  {renderSashSide(H_sash / scale, -1, (W_sash - H_sash) / scale, assembledSashLayers)}
                </group>
              </group>

              {/* Glass Pane */}
              {renderGlassPane(W_sash, H_sash)}

              {/* Central Movable Mullion (floating post) - Attached to left sash edge */}
              <group position={[W_sash, H_sash, 0]} rotation={[0, 0, -Math.PI / 2]}>
                <group rotation={[0, Math.PI / 2, 0]}>
                  {renderMovablePost(H_sash / scale)}
                </group>
              </group>

              {/* Hotspot */}
              <Html position={[W_sash - 40 * scale, H_sash / 2, -100 * scale]} center>
                <button
                  className="w-8 h-8 rounded-full bg-emerald-500/20 border-2 border-emerald-400 hover:scale-110 active:scale-95 transition-all flex items-center justify-center shadow-lg shadow-emerald-500/30 cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); setLeftOpen(!leftOpen); }}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </button>
              </Html>
            </group>
          </group>
        </group>
      </group>

      {/* ── Right Sash (Active) ── */}
      <group position={[W_sash + frameAllowance, frameAllowance, 0]}>
        <group position={[rightPivotX, rightPivotY, rightPivotZ]}>
          <group ref={rightSashPivotRef}>
            <group position={[-rightPivotX, -rightPivotY, -rightPivotZ]}>
              {/* Bottom rail */}
              <group rotation={[0, 0, 0]}>
                <group rotation={[0, Math.PI / 2, 0]}>
                  {renderSashSide(W_sash / scale, 1, 0, assembledSashLayers)}
                </group>
              </group>
              {/* Right rail */}
              <group position={[W_sash, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <group rotation={[0, Math.PI / 2, 0]}>
                  {renderSashSide(H_sash / scale, -1, W_sash / scale, assembledSashLayers)}
                </group>
              </group>
              {/* Top rail */}
              <group position={[W_sash, H_sash, 0]} rotation={[0, 0, Math.PI]}>
                <group rotation={[0, Math.PI / 2, 0]}>
                  {renderSashSide(W_sash / scale, 1, (W_sash - H_sash) / scale, assembledSashLayers)}
                </group>
              </group>
              {/* Left rail */}
              <group position={[0, H_sash, 0]} rotation={[0, 0, -Math.PI / 2]}>
                <group rotation={[0, Math.PI / 2, 0]}>
                  {renderSashSide(H_sash / scale, -1, (W_sash - H_sash) / scale, assembledSashLayers)}
                </group>
              </group>

              {/* Glass Pane */}
              {renderGlassPane(W_sash, H_sash)}

              {/* Hotspot */}
              <Html position={[40 * scale, H_sash / 2, -100 * scale]} center>
                <button
                  className="w-8 h-8 rounded-full bg-rose-500/20 border-2 border-rose-400 hover:scale-110 active:scale-95 transition-all flex items-center justify-center shadow-lg shadow-rose-500/30 cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); setRightOpen(!rightOpen); }}
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
