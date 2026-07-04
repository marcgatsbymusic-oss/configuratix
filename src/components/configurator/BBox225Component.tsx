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
  
  return (
    <group 
      ref={groupRef} 
      rotation={[0, Math.PI / 2, 0]} 
      position={[0, height + yOffset, zOffset]} 
    >
      {!isThumbnail && hasMosquito && (
        <Html position={[135, boxY, boxZ]} center zIndexRange={[100, 0]}>
          <div className="flex flex-col items-center gap-1 p-1.5 bg-[#0c0c16]/80 backdrop-blur-md rounded-[10px] border border-white/10 shadow-2xl pointer-events-auto">
            <div className="text-[7px] font-black uppercase tracking-widest text-[#10b981] mb-0.5">Mosquito</div>
            <div className="flex gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); setMDirection('up'); setMAnimating(true); }}
                className={`w-6 h-6 flex items-center justify-center rounded-full transition-all ${
                  mAnimating && mDirection === 'up' ? 'bg-[#10b981] text-mammut-black animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-white/10 text-white hover:bg-[#10b981] hover:text-mammut-black hover:scale-110'
                }`}
              ><ArrowUp className="w-3 h-3" strokeWidth={2.5} /></button>
              <button
                onClick={(e) => { e.stopPropagation(); setMAnimating(false); }}
                className={`w-6 h-6 flex items-center justify-center rounded-full transition-all ${
                  mAnimating ? 'bg-white/10 text-white hover:bg-[#10b981] hover:text-mammut-black hover:scale-110' : 'bg-white/5 text-white/20'
                }`}
              ><Pause className="w-3 h-3" strokeWidth={2.5} /></button>
              <button
                onClick={(e) => { e.stopPropagation(); setMDirection('down'); setMAnimating(true); }}
                className={`w-6 h-6 flex items-center justify-center rounded-full transition-all ${
                  mAnimating && mDirection === 'down' ? 'bg-[#10b981] text-mammut-black animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-white/10 text-white hover:bg-[#10b981] hover:text-mammut-black hover:scale-110'
                }`}
              ><ArrowDown className="w-3 h-3" strokeWidth={2.5} /></button>
            </div>
          </div>
        </Html>
      )}

      {!isThumbnail && hasBlind && (
        <Html position={[135, boxY, width - boxZ]} center zIndexRange={[100, 0]}>
          <div className="flex flex-col items-center gap-1 p-1.5 bg-[#0c0c16]/80 backdrop-blur-md rounded-[10px] border border-white/10 shadow-2xl pointer-events-auto">
            <div className="text-[7px] font-black uppercase tracking-widest text-[#eab676] mb-0.5">Blinds</div>
            <div className="flex gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); setBDirection('up'); setBAnimating(true); }}
                className={`w-6 h-6 flex items-center justify-center rounded-full transition-all ${
                  bAnimating && bDirection === 'up' ? 'bg-mammut-gold text-mammut-black animate-pulse shadow-[0_0_8px_rgba(234,182,118,0.5)]' : 'bg-white/10 text-white hover:bg-mammut-gold hover:text-mammut-black hover:scale-110'
                }`}
              ><ArrowUp className="w-3 h-3" strokeWidth={2.5} /></button>
              <button
                onClick={(e) => { e.stopPropagation(); setBAnimating(false); }}
                className={`w-6 h-6 flex items-center justify-center rounded-full transition-all ${
                  bAnimating ? 'bg-white/10 text-white hover:bg-mammut-gold hover:text-mammut-black hover:scale-110' : 'bg-white/5 text-white/20'
                }`}
              ><Pause className="w-3 h-3" strokeWidth={2.5} /></button>
              <button
                onClick={(e) => { e.stopPropagation(); setBDirection('down'); setBAnimating(true); }}
                className={`w-6 h-6 flex items-center justify-center rounded-full transition-all ${
                  bAnimating && bDirection === 'down' ? 'bg-mammut-gold text-mammut-black animate-pulse shadow-[0_0_8px_rgba(234,182,118,0.5)]' : 'bg-white/10 text-white hover:bg-mammut-gold hover:text-mammut-black hover:scale-110'
                }`}
              ><ArrowDown className="w-3 h-3" strokeWidth={2.5} /></button>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};
