import React, { useState, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { ArrowUp, ArrowDown, Pause } from 'lucide-react';
import { buildBBox225WMsqto } from './bbox_225_w_msqto';

export interface BBox225BlindBoxProps {
  width: number;
  height: number;
  yOffset?: number; // Offset from height for Y placement (default: -23.5)
  zOffset?: number; // Offset from 0 for Z placement (default: 60.84)
  blindDeployed?: boolean;
  mosquitoDeployed: boolean;
  colorExt: string;
  colorInt: string;
  colorGuides: string;
  colorSlats: string;
  hasBlind: boolean;
  hasMosquito: boolean;
  isThumbnail?: boolean;
}

export const BBox225BlindBox: React.FC<BBox225BlindBoxProps> = ({
  width,
  height,
  yOffset = -23.5,
  zOffset = 60.84,
  blindDeployed = true,
  mosquitoDeployed,
  colorExt,
  colorInt,
  colorGuides,
  colorSlats,
  hasBlind,
  hasMosquito,
  isThumbnail = false,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const bboxRef = useRef<any>(null);

  // Smooth animation tracking variables
  const blindVal = useRef(blindDeployed ? 1.0 : 0.045);
  const mosquitoVal = useRef(mosquitoDeployed ? 1.0 : 0.045);

  const [bAnimating, setBAnimating] = useState(false);
  const [bDirection, setBDirection] = useState<'up' | 'down'>(blindDeployed ? 'down' : 'up');
  const lastBProp = useRef(blindDeployed);

  const [mAnimating, setMAnimating] = useState(false);
  const [mDirection, setMDirection] = useState<'up' | 'down'>(mosquitoDeployed ? 'down' : 'up');
  const lastMProp = useRef(mosquitoDeployed);

  useEffect(() => {
    if (lastBProp.current !== blindDeployed) {
       setBDirection(blindDeployed ? 'down' : 'up');
       setBAnimating(true);
       lastBProp.current = blindDeployed;
    }
  }, [blindDeployed]);

  useEffect(() => {
    if (lastMProp.current !== mosquitoDeployed) {
       setMDirection(mosquitoDeployed ? 'down' : 'up');
       setMAnimating(true);
       lastMProp.current = mosquitoDeployed;
    }
  }, [mosquitoDeployed]);

  useEffect(() => {
    if (groupRef.current) {
      // Clear any orphaned HMR duplicates
      const oldBboxes = groupRef.current.children.filter(c => c.name && c.name.includes("BBOX"));
      oldBboxes.forEach(c => groupRef.current!.remove(c));
    }
    const boxYPos = height + yOffset;

    const bbox = buildBBox225WMsqto({
      width: width,
      drop: boxYPos,
      blindDeployed: blindDeployed,
      mosquitoDeployed: mosquitoDeployed,
      colours: {
        boxExterior: colorExt,
        boxInterior: colorInt,
        guides: colorGuides,
        blind: colorSlats,
        mosquitoNet: '#1c1c1c'
      }
    });

    bbox.group.name = "BBOX";
    bboxRef.current = bbox;
    
    // Apply grid texture for mosquito net mesh if present
    const netMaterial = bbox.materials.mosquitoNet;
    if (netMaterial) {
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, 16, 16);
        ctx.strokeStyle = 'rgba(20, 20, 22, 0.85)';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, 16, 16);
      }
      const netTexture = new THREE.CanvasTexture(canvas);
      netTexture.wrapS = THREE.RepeatWrapping;
      netTexture.wrapT = THREE.RepeatWrapping;
      netTexture.repeat.set(width * 0.5, height * 0.5);
      
      netMaterial.map = netTexture;
      netMaterial.transparent = true;
      netMaterial.opacity = 0.45;
      netMaterial.roughness = 0.9;
      netMaterial.metalness = 0.05;
      netMaterial.needsUpdate = true;
    }

    if (groupRef.current) {
      groupRef.current.add(bbox.group);
    }

    return () => {
      if (groupRef.current && bbox.group) {
        groupRef.current.remove(bbox.group);
      }
      bbox.dispose();
      bboxRef.current = null;
    };
  }, [width, height]);

  useFrame(() => {
    if (bboxRef.current) {
      if (bAnimating) {
        const step = bDirection === 'down' ? 0.003 : -0.003;
        blindVal.current = THREE.MathUtils.clamp(blindVal.current + step, 0.045, 1.0);
        if (blindVal.current === 0.045 || blindVal.current === 1.0) setBAnimating(false);
      }
      if (mAnimating) {
        const step = mDirection === 'down' ? 0.003 : -0.003;
        mosquitoVal.current = THREE.MathUtils.clamp(mosquitoVal.current + step, 0.045, 1.0);
        if (mosquitoVal.current === 0.045 || mosquitoVal.current === 1.0) setMAnimating(false);
      }

      bboxRef.current.setBlind(blindVal.current);
      bboxRef.current.setMosquito(mosquitoVal.current);

      // Toggle mesh visibility
      const blindMesh = bboxRef.current.group.getObjectByName("blind");
      if (blindMesh) {
        blindMesh.visible = hasBlind;
      }
      const netMesh = bboxRef.current.group.getObjectByName("mosquitoNet");
      if (netMesh) {
        netMesh.visible = hasMosquito;
      }
    }
  });

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.userData.prepareForAR = () => {
        const oldBlind = blindVal.current;
        const oldMosquito = mosquitoVal.current;
        
        if (bboxRef.current) {
          if (hasBlind) bboxRef.current.setBlind(0.5);
          if (hasMosquito) bboxRef.current.setMosquito(0.8);
        }

        return () => {
          if (bboxRef.current) {
            bboxRef.current.setBlind(oldBlind);
            bboxRef.current.setMosquito(oldMosquito);
          }
        };
      };
    }
  }, [hasBlind, hasMosquito]);

  // Update colors live
  useEffect(() => {
    if (bboxRef.current) {
      const mats = bboxRef.current.materials;
      if (mats.boxExterior) mats.boxExterior.color.set(colorExt);
      if (mats.boxInterior) mats.boxInterior.color.set(colorInt);
      if (mats.guides) mats.guides.color.set(colorGuides);
      if (mats.blind) mats.blind.color.set(colorSlats);
    }
  }, [colorExt, colorInt, colorGuides, colorSlats]);

  // Calculate positions for HTML controls. We use the width/height mm units for the viewer space.
  // The origin of BBOX is bottom-left, so box center is roughly (width/2, drop-boxSize, boxZ)
  const boxZ = 125;
  const boxY = -50; // offset slightly down
  
  if (!hasBlind && !hasMosquito) return null;

  return (
    <group 
      ref={groupRef} 
      rotation={[0, Math.PI / 2, 0]} 
      position={[0, height + yOffset, zOffset]} 
    >
      {hasMosquito && (
        <Html position={[-20.16, 143.5, width / 2 - 150]} center zIndexRange={[100, 0]}>
          <div
            className={`group/hotspot relative flex items-center justify-center cursor-pointer transition-all ${isThumbnail ? 'w-6 h-6' : 'w-12 h-12 max-md:w-auto max-md:h-auto'}`}
            style={{ pointerEvents: 'auto' }}
            onClick={(e) => { 
              e.stopPropagation(); 
              setMDirection(prev => prev === 'down' ? 'up' : 'down');
              setMAnimating(true);
            }}
          >
            {/* Hotspot Circle */}
            <div className={`absolute inset-0 flex items-center justify-center group-hover/hotspot:opacity-0 group-hover/hotspot:scale-50 transition-all duration-300 pointer-events-none max-md:hidden ${isThumbnail ? 'scale-50' : ''}`} style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
              <div className="relative w-4.5 h-4.5 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-[#d4d4d8] opacity-50 blur-[2px]" />
                <div className="absolute w-3 h-3 rounded-full bg-[#d4d4d8] border-[1.5px] border-white shadow-md" />
              </div>
            </div>

            {/* Hover Panel */}
            <div className={`absolute flex items-center gap-1 p-1 bg-[#0c0c16]/90 backdrop-blur-md rounded-full border border-white/10 shadow-2xl opacity-0 scale-90 group-hover/hotspot:opacity-100 group-hover/hotspot:scale-100 transition-all duration-300 max-md:relative max-md:opacity-100 max-md:scale-100 max-md:p-1.5 ${isThumbnail ? 'scale-[0.6] group-hover/hotspot:scale-[0.8] max-md:scale-[0.8]' : ''}`}>
              <button
                onClick={(e) => { e.stopPropagation(); setMDirection('up'); setMAnimating(true); }}
                className={`w-7 h-7 max-md:w-9 max-md:h-9 flex items-center justify-center rounded-full transition-all ${
                  mAnimating && mDirection === 'up' ? 'bg-[#d4d4d8] text-mammut-black shadow-[0_0_8px_rgba(212,212,216,0.5)]' : 'bg-white/5 text-white hover:bg-[#d4d4d8] hover:text-mammut-black'
                }`}
              ><ArrowUp className="w-3.5 h-3.5 max-md:w-4 max-md:h-4" strokeWidth={2.5} /></button>
              <button
                onClick={(e) => { e.stopPropagation(); setMAnimating(false); }}
                className={`w-7 h-7 max-md:w-9 max-md:h-9 flex items-center justify-center rounded-full transition-all ${
                  !mAnimating ? 'bg-white/20 text-white shadow-inner' : 'bg-white/5 text-white/50 hover:bg-white/20 hover:text-white'
                }`}
              ><Pause className="w-3.5 h-3.5 max-md:w-4 max-md:h-4" strokeWidth={2.5} /></button>
              <button
                onClick={(e) => { e.stopPropagation(); setMDirection('down'); setMAnimating(true); }}
                className={`w-7 h-7 max-md:w-9 max-md:h-9 flex items-center justify-center rounded-full transition-all ${
                  mAnimating && mDirection === 'down' ? 'bg-[#d4d4d8] text-mammut-black shadow-[0_0_8px_rgba(212,212,216,0.5)]' : 'bg-white/5 text-white hover:bg-[#d4d4d8] hover:text-mammut-black'
                }`}
              ><ArrowDown className="w-3.5 h-3.5 max-md:w-4 max-md:h-4" strokeWidth={2.5} /></button>
            </div>
          </div>
        </Html>
      )}

      {hasBlind && (
        <Html position={[266.84, 143.5, width / 2 + 150]} center zIndexRange={[100, 0]}>
          <div
            className={`group/hotspot relative flex items-center justify-center cursor-pointer transition-all ${isThumbnail ? 'w-6 h-6' : 'w-12 h-12 max-md:w-auto max-md:h-auto'}`}
            style={{ pointerEvents: 'auto' }}
            onClick={(e) => { 
              e.stopPropagation(); 
              setBDirection(prev => prev === 'down' ? 'up' : 'down');
              setBAnimating(true);
            }}
          >
            {/* Hotspot Circle */}
            <div className={`absolute inset-0 flex items-center justify-center group-hover/hotspot:opacity-0 group-hover/hotspot:scale-50 transition-all duration-300 pointer-events-none max-md:hidden ${isThumbnail ? 'scale-50' : ''}`} style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
              <div className="relative w-4.5 h-4.5 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-[#d4d4d8] opacity-50 blur-[2px]" />
                <div className="absolute w-3 h-3 rounded-full bg-[#d4d4d8] border-[1.5px] border-white shadow-md" />
              </div>
            </div>

            {/* Hover Panel */}
            <div className={`absolute flex items-center gap-1 p-1 bg-[#0c0c16]/90 backdrop-blur-md rounded-full border border-white/10 shadow-2xl opacity-0 scale-90 group-hover/hotspot:opacity-100 group-hover/hotspot:scale-100 transition-all duration-300 max-md:relative max-md:opacity-100 max-md:scale-100 max-md:p-1.5 ${isThumbnail ? 'scale-[0.6] group-hover/hotspot:scale-[0.8] max-md:scale-[0.8]' : ''}`}>
              <button
                onClick={(e) => { e.stopPropagation(); setBDirection('up'); setBAnimating(true); }}
                className={`w-7 h-7 max-md:w-9 max-md:h-9 flex items-center justify-center rounded-full transition-all ${
                  bAnimating && bDirection === 'up' ? 'bg-mammut-gold text-mammut-black shadow-[0_0_8px_rgba(234,182,118,0.5)]' : 'bg-white/5 text-white hover:bg-mammut-gold hover:text-mammut-black'
                }`}
              ><ArrowUp className="w-3.5 h-3.5 max-md:w-4 max-md:h-4" strokeWidth={2.5} /></button>
              <button
                onClick={(e) => { e.stopPropagation(); setBAnimating(false); }}
                className={`w-7 h-7 max-md:w-9 max-md:h-9 flex items-center justify-center rounded-full transition-all ${
                  !bAnimating ? 'bg-white/20 text-white shadow-inner' : 'bg-white/5 text-white/50 hover:bg-white/20 hover:text-white'
                }`}
              ><Pause className="w-3.5 h-3.5 max-md:w-4 max-md:h-4" strokeWidth={2.5} /></button>
              <button
                onClick={(e) => { e.stopPropagation(); setBDirection('down'); setBAnimating(true); }}
                className={`w-7 h-7 max-md:w-9 max-md:h-9 flex items-center justify-center rounded-full transition-all ${
                  bAnimating && bDirection === 'down' ? 'bg-mammut-gold text-mammut-black shadow-[0_0_8px_rgba(234,182,118,0.5)]' : 'bg-white/5 text-white hover:bg-mammut-gold hover:text-mammut-black'
                }`}
              ><ArrowDown className="w-3.5 h-3.5 max-md:w-4 max-md:h-4" strokeWidth={2.5} /></button>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};
