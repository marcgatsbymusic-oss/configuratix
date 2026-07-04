import React, { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { buildIG5_F104Geometries, type F104Geometries } from './IG5_F104_Engine';

export interface IG5_F104Props {
  W?: number;
  H?: number;
  EXT_Color?: string;
  INT_Color?: string;
  EXT_Texture?: string;
  INT_Texture?: string;
  solarTreatment?: boolean;
  thermalTreatment?: boolean;
}

export const IG5_F104_Component: React.FC<IG5_F104Props> = ({
  W = 1000,
  H = 1000,
  EXT_Color = '#373f43',
  INT_Color = '#ffffff',
  EXT_Texture,
  INT_Texture,
}) => {
  const materials = useMemo(() => {
    return {
      ext: new THREE.MeshStandardMaterial({ color: EXT_Color, roughness: 0.6, metalness: 0.1, side: THREE.DoubleSide }),
      int: new THREE.MeshStandardMaterial({ color: INT_Color, roughness: 0.6, metalness: 0.1, side: THREE.DoubleSide }),
      gsk: new THREE.MeshStandardMaterial({ color: 0x111111, side: THREE.DoubleSide, roughness: 0.8 }),
      glass: new THREE.MeshPhysicalMaterial({ 
        color: 0xffffff, 
        transmission: 1.0, 
        opacity: 0.6, 
        transparent: true, 
        roughness: 0.0, 
        metalness: 0.0,
        ior: 1.5,
        thickness: 0.01,
        side: THREE.DoubleSide 
      }),
      spacer: new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.5, side: THREE.DoubleSide }),
    };
  }, []);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    
    if (EXT_Texture) {
      loader.load(EXT_Texture, (tex) => {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(0.002, 0.002);
        tex.colorSpace = THREE.SRGBColorSpace;
        materials.ext.map = tex;
        materials.ext.color.set(0xffffff);
        materials.ext.needsUpdate = true;
      });
    } else {
      materials.ext.map = null;
      materials.ext.color.set(EXT_Color || '#ffffff');
      materials.ext.needsUpdate = true;
    }
    
    if (INT_Texture) {
      loader.load(INT_Texture, (tex) => {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(0.002, 0.002);
        tex.colorSpace = THREE.SRGBColorSpace;
        materials.int.map = tex;
        materials.int.color.set(0xffffff);
        materials.int.needsUpdate = true;
      });
    } else {
      materials.int.map = null;
      materials.int.color.set(INT_Color || '#ffffff');
      materials.int.needsUpdate = true;
    }
  }, [EXT_Color, INT_Color, EXT_Texture, INT_Texture, materials]);

  const geoms = useMemo<F104Geometries | null>(() => {
    try {
      return buildIG5_F104Geometries({ W, H });
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [W, H]);

  if (!geoms) {
    return null;
  }

  const getMat = (key: string) => materials[key as keyof typeof materials] || materials.int;

  return (
    <group>
      {/* FRAME */}
      {geoms.frameMeshes.map((m, i) => (
        <mesh key={`f-${i}`} geometry={m.geom} material={getMat(m.matKey)} />
      ))}
      
      {/* FIXED GLAZING */}
      {geoms.fixedMeshes.map((m, i) => (
        <mesh key={`fix-${i}`} geometry={m.geom} material={getMat(m.matKey)} />
      ))}
    </group>
  );
};
