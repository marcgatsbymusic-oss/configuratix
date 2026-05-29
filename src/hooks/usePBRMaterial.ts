import { useState, useEffect, useMemo } from 'react';
import * as THREE from 'three';

const DEFAULT_MAPS = { diffuse: null, normal: null, orm: null };

// Physical scaling of texture (mm per tile)
const TEX_MM_ALONG_GRAIN = 86.7;  // U axis (longest side)
const TEX_MM_ACROSS_GRAIN = 61.3; // V axis (across face)

export const usePBRMaterial = (
  colorTextureUrl: string | undefined,
  fallbackColor: string,
  widthMm: number,
  heightMm: number,
  isInterior: boolean = false,
  isBzd: boolean = false
) => {
  const [maps, setMaps] = useState<{
    diffuse: THREE.Texture | null;
    normal: THREE.Texture | null;
    orm: THREE.Texture | null;
  }>(DEFAULT_MAPS);

  // Load the baked maps for the given textureUrl
  useEffect(() => {
    if (!colorTextureUrl) {
      setMaps(DEFAULT_MAPS);
      return;
    }

    const match = colorTextureUrl.match(/\/([^\/]+)\.(jpg|png|webp|jpeg)$/i);
    if (!match) {
      setMaps(DEFAULT_MAPS);
      return;
    }

    let materialName = match[1].replace('-swatch', '');
    // Mapping exceptions for file names vs swatches
    if (materialName === 'white-fx') materialName = 'White-FX';
    if (materialName === 'white-sand-u-matt') materialName = 'White-sand-u-matt';
    if (materialName === 'golden-oak') materialName = 'Golden-Oak';
    if (materialName === 'turner-oak-toffee') materialName = 'Turner-Oak-Toffee';
    if (materialName === 'anthracite') materialName = 'Anthracite';

    const diffusePath = `/assets/texturesbaked/${materialName}/diffuse.jpg`;
    const normalPath = `/assets/texturesbaked/${materialName}/normal.jpg`;
    const ormPath = `/assets/texturesbaked/${materialName}/orm.png`;

    const loader = new THREE.TextureLoader();
    let loadedDiffuse: THREE.Texture | null = null;
    let loadedNormal: THREE.Texture | null = null;
    let loadedORM: THREE.Texture | null = null;
    let loadedCount = 0;

    const onTexLoad = () => {
      loadedCount++;
      if (loadedCount === 3) {
        setMaps({ diffuse: loadedDiffuse, normal: loadedNormal, orm: loadedORM });
      }
    };

    const configureTexture = (tex: THREE.Texture, colorSpace: THREE.ColorSpace) => {
      tex.colorSpace = colorSpace;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      // We don't set .repeat here because we clone and set it per material
      tex.repeat.set(1, 1);
      tex.anisotropy = 16;
    };

    loader.load(diffusePath, (tex) => { configureTexture(tex, THREE.SRGBColorSpace); loadedDiffuse = tex; onTexLoad(); }, undefined, () => onTexLoad());
    loader.load(normalPath, (tex) => { configureTexture(tex, THREE.NoColorSpace); loadedNormal = tex; onTexLoad(); }, undefined, () => onTexLoad());
    loader.load(ormPath, (tex) => { configureTexture(tex, THREE.NoColorSpace); loadedORM = tex; onTexLoad(); }, undefined, () => onTexLoad());

  }, [colorTextureUrl]);

  const material = useMemo(() => {
    if (maps.diffuse) {
      // Calculate repeat UVs based on whether it is an interior/exterior frame or bead
      // Default (Exterior): Grain runs horizontally
      let repeatU = (widthMm / 1000) / (TEX_MM_ALONG_GRAIN / 1000);
      let repeatV = 1000 / TEX_MM_ACROSS_GRAIN;

      if (isInterior) {
        // Interior (Vertical Stiles): Grain runs vertically
        repeatU = (heightMm / 1000) / (TEX_MM_ALONG_GRAIN / 1000);
        repeatV = 1000 / TEX_MM_ACROSS_GRAIN;
      }

      const cloneTexture = (tex: THREE.Texture, rotate: boolean = false) => {
        const t = tex.clone();
        t.wrapS = THREE.RepeatWrapping;
        t.wrapT = THREE.RepeatWrapping;
        
        if (rotate) {
          t.center.set(0.5, 0.5);
          t.rotation = Math.PI / 2;
          t.repeat.set(repeatV, repeatU);
        } else {
          t.repeat.set(repeatU, repeatV);
        }
        
        t.needsUpdate = true;
        return t;
      };

      const mat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: cloneTexture(maps.diffuse, isBzd),
        normalMap: maps.normal ? cloneTexture(maps.normal, isBzd) : null,
        aoMap: maps.orm ? cloneTexture(maps.orm, isBzd) : null,
        roughnessMap: maps.orm ? cloneTexture(maps.orm, isBzd) : null,
        metalnessMap: maps.orm ? cloneTexture(maps.orm, isBzd) : null,
        roughness: 1.0,
        metalness: 0.0,
        aoMapIntensity: 0.8,
      });

      if (maps.normal) {
        mat.normalScale.set(0.6, 0.6);
      }

      return mat;
    }
    
    // Fallback to solid color
    return new THREE.MeshStandardMaterial({
      color: fallbackColor,
      roughness: 0.6,
      metalness: 0.1
    });
  }, [maps, fallbackColor, widthMm, heightMm, isInterior, isBzd]);

  return material;
};
