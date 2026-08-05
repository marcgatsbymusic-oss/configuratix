import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { FrameSegment } from './FrameSegment';
import { AdaptiveCamera } from './AdaptiveCamera';
import { useThemeStore } from '../../store/useThemeStore';

export type WindowState = 'closed' | 'open_side' | 'open_tilt';


// We import the specific JSON payloads. 
// In a dynamic app, this would be fetched via API based on the selected typology.
import IG5_F104 from "../../data/profiles/IGLO5/IG5_F104.json";
import IG5_F100 from "../../data/profiles/IGLO5/IG5_F100.json";
import IG5_F103 from "../../data/profiles/IGLO5/IG5_F103.json";
import IG5_F200 from '../../data/profiles/IGLO5/IG5_F200.json';
import IG5_F2XX1 from '../../data/profiles/IGLO5/IG5_F2XX1.json';
import IG5_F2MPX from '../../data/profiles/IGLO5/IG5_F2MPX.json';

function getHandleHeightFromBottom(sashHeight: number, windowType?: string, installationHeightFromFloor: number = 0) {
    const isDoorOrBalcony = windowType && (
        windowType === 'balcony_door' ||
        /^(D|DS|FS|FSD|S|W|MO|ND)/i.test(windowType) ||
        /^(F15|F21|F22|F27|F28|F37|F38)/i.test(windowType)
    );
    if (isDoorOrBalcony || sashHeight > 1800) return 1050;
    if (installationHeightFromFloor > 1200) return 150;
    if (sashHeight >= 380 && sashHeight <= 550) return 170;
    if (sashHeight > 550 && sashHeight <= 800) return 260;
    if (sashHeight > 800 && sashHeight <= 1200) return 410;
    if (sashHeight > 1200 && sashHeight <= 1600) return 560;
    if (sashHeight > 1600 && sashHeight <= 1800) return 710;
    return sashHeight / 2;
}

interface ThreejsWindowEngineProps {
  width: number;
  height: number;
  colorExt?: string;
  colorInt?: string;
  colorExtTexture?: string;
  colorIntTexture?: string;
  spacerColor?: string;
  onSceneReady?: (data: any) => void;
  arPlacement?: 'wall' | 'floor';
  typology?: string;
  sealColor?: string;
  scenery?: string;
  customBackground?: string;
  mullionPos?: number;
}

const DEFAULT_MAPS = { diffuse: null, normal: null, orm: null };



// --- Texture Physical Scale ---
// Source image: 724x1024px, no embedded DPI.
// Professional wood veneer/foil textures are produced at 300 DPI.
// Full portrait (724Ãƒâ€”1024) rotated 90Ã‚Â° clockwise Ã¢â€ â€™ landscape 1024Ãƒâ€”724:
//   - U axis (along extrusion length) = LONGEST side = 1024px @ 300dpi = 86.7mm
//   - V axis (across ~70mm profile face) = 724px @ 300dpi = 61.3mm
// No square crop Ã¢â‚¬â€ the full long dimension is preserved and aligned to the profile length.
const TEX_MM_ALONG_GRAIN = 86.7;  // mm per tile along the profile length (U axis = longest side)
const TEX_MM_ACROSS_GRAIN = 61.3; // mm per tile across the profile face (V axis)

const WindowAssembly = ({ 
  width, 
  height, 
  colorExt, 
  colorInt, 
  colorExtTexture, 
  colorIntTexture, 
  spacerColor = '#b0b5b9', 
  onSceneReady,
  typology = 'F104',
  sealColor,
  scenery = 'studio-grey',
  customBackground = '',
}: ThreejsWindowEngineProps) => {
  const [groupObj, setGroupObj] = React.useState<THREE.Group | null>(null);

  const [leftState, setLeftState] = useState<WindowState>('closed');
  const [rightState, setRightState] = useState<WindowState>('closed');

  const { scene: handleScene } = useGLTF('/testhandle.glb');
  const clonedHandleLeft = useMemo(() => {
    const clone = handleScene.clone(true);
    clone.traverse((child: any) => {
      if (child.isMesh && child.material) {
        child.material = child.material.clone();
        child.material.color.set(colorIntTexture ? '#f0f0f0' : (colorInt || '#f0ece6'));
        child.material.roughness = 0.3;
        child.material.metalness = 0.8;
      }
    });
    return clone;
  }, [handleScene, colorInt, colorIntTexture]);

  const clonedHandleRight = useMemo(() => {
    const clone = handleScene.clone(true);
    clone.traverse((child: any) => {
      if (child.isMesh && child.material) {
        child.material = child.material.clone();
        child.material.color.set(colorIntTexture ? '#f0f0f0' : (colorInt || '#f0ece6'));
        child.material.roughness = 0.3;
        child.material.metalness = 0.8;
      }
    });
    return clone;
  }, [handleScene, colorInt, colorIntTexture]);

  const leftPivotRef = useRef<THREE.Group>(null!);
  const rightPivotRef = useRef<THREE.Group>(null!);
  const leftHandleRef = useRef<THREE.Group>(null!);
  const rightHandleRef = useRef<THREE.Group>(null!);

  const currentLeft = useRef({ side: 0, tilt: 0, handle: 0 });
  const currentRight = useRef({ side: 0, tilt: 0, handle: 0 });

  const animStateRef = useRef({
    left: { startSide: 0, targetSide: 0, startTilt: 0, targetTilt: 0, startHandle: 0, targetHandle: 0, startTime: 0, duration: 1.2 },
    right: { startSide: 0, targetSide: 0, startTilt: 0, targetTilt: 0, startHandle: 0, targetHandle: 0, startTime: 0, duration: 1.2 }
  });

  const { clock } = useThree();

  useEffect(() => {
    const s = animStateRef.current.left;
    s.startSide = currentLeft.current.side;
    s.targetSide = leftState === 'open_side' ? Math.PI / 2 : 0;
    s.startTilt = currentLeft.current.tilt;
    const tiltRadians = Math.asin(Math.min(150 / height, 1.0));
    s.targetTilt = leftState === 'open_tilt' ? -tiltRadians : 0;
    s.startHandle = currentLeft.current.handle;
    s.targetHandle = leftState === 'open_side' ? Math.PI / 2 : (leftState === 'open_tilt' ? Math.PI : 0);
    s.startTime = clock.getElapsedTime();
  }, [leftState, clock, height]);

  useEffect(() => {
    const s = animStateRef.current.right;
    s.startSide = currentRight.current.side;
    s.targetSide = rightState === 'open_side' ? -Math.PI / 2 : 0;
    s.startTilt = currentRight.current.tilt;
    const tiltRadians = Math.asin(Math.min(150 / height, 1.0));
    s.targetTilt = rightState === 'open_tilt' ? -tiltRadians : 0;
    s.startHandle = currentRight.current.handle;
    s.targetHandle = rightState === 'open_side' ? -Math.PI / 2 : (rightState === 'open_tilt' ? -Math.PI : 0);
    s.startTime = clock.getElapsedTime();
  }, [rightState, clock, height]);

  useFrame((state) => {
    const updateSide = (
      s: typeof animStateRef.current.left, 
      curr: typeof currentLeft.current, 
      pivotRef: React.RefObject<THREE.Group>, 
      handleRef: React.RefObject<THREE.Group>
    ) => {
      if (!pivotRef.current) return;
      const elapsed = state.clock.getElapsedTime() - s.startTime;
      const isClosing = s.targetSide === 0 && s.targetTilt === 0;
      const ease = (x: number) => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;

      let sash_progress = 0;
      let handle_progress = 0;

      if (Math.abs(s.targetSide) > 1.5) {
          // 90 degree staged opening
          handle_progress = ease(Math.min(elapsed / 0.4, 1.0));
          if (elapsed < 0.4) {
              sash_progress = 0;
          } else if (elapsed < 1.6) { // 1.2s to open to 45 deg
              sash_progress = ease((elapsed - 0.4) / 1.2) * 0.5;
          } else if (elapsed < 6.6) { // Wait 5 seconds at 45 deg (which is 0.5 of target)
              sash_progress = 0.5;
          } else if (elapsed < 9.6) { // 3s to slowly open to 90 deg
              sash_progress = 0.5 + ease((elapsed - 6.6) / 3.0) * 0.5;
          } else {
              sash_progress = 1.0;
          }
      } else if (!isClosing) {
          handle_progress = ease(Math.min(elapsed / 0.4, 1.0));
          sash_progress = elapsed < 0.4 ? 0 : ease(Math.min((elapsed - 0.4) / 0.8, 1.0));
      } else {
          // Closing: Sash first, then Handle
          sash_progress = ease(Math.min(elapsed / 0.8, 1.0));
          handle_progress = elapsed < 0.8 ? 0 : ease(Math.min((elapsed - 0.8) / 0.4, 1.0));
          
          sash_progress = 1.0 - sash_progress;
          handle_progress = 1.0 - handle_progress;
      }

      curr.side = s.startSide + (s.targetSide - s.startSide) * (isClosing ? 1 - sash_progress : sash_progress);
      curr.tilt = s.startTilt + (s.targetTilt - s.startTilt) * (isClosing ? 1 - sash_progress : sash_progress);
      curr.handle = s.startHandle + (s.targetHandle - s.startHandle) * (isClosing ? 1 - handle_progress : handle_progress);

      pivotRef.current.rotation.y = curr.side;
      pivotRef.current.rotation.x = curr.tilt;

      if (handleRef.current) {
        let handleObj = handleRef.current.getObjectByName('Handle') ||
                        handleRef.current.getObjectByName('handle') ||
                        handleRef.current.getObjectByName('Pencere_Kulbu');
        if (!handleObj) {
          handleRef.current.traverse((child: any) => {
            if (!handleObj && child.isMesh && !child.name.toLowerCase().includes('base')) {
              handleObj = child;
            }
          });
        }
        if (handleObj) {
          handleObj.rotation.z = curr.handle;
        }
      }
    };

    updateSide(animStateRef.current.left, currentLeft.current, leftPivotRef, leftHandleRef);
    updateSide(animStateRef.current.right, currentRight.current, rightPivotRef, rightHandleRef);
  });


  // Packed PBR maps (diffuse, normal, ORM) for exterior and interior
  const [extMaps, setExtMaps] = React.useState<{
    diffuse: THREE.Texture | null;
    normal: THREE.Texture | null;
    orm: THREE.Texture | null;
  }>(DEFAULT_MAPS);

  const [intMaps, setIntMaps] = React.useState<{
    diffuse: THREE.Texture | null;
    normal: THREE.Texture | null;
    orm: THREE.Texture | null;
  }>(DEFAULT_MAPS);

  const onSceneReadyRef = React.useRef(onSceneReady);
  React.useEffect(() => {
    onSceneReadyRef.current = onSceneReady;
  }, [onSceneReady]);

  React.useEffect(() => {
    if (groupObj && onSceneReadyRef.current) {
      onSceneReadyRef.current(groupObj);
    }
  }, [groupObj, extMaps, intMaps]);

  React.useEffect(() => {
    if (groupObj) {
      groupObj.userData.prepareForAR = () => {
        const tiltRadians = Math.asin(Math.min(150 / height, 1.0));
        const restores: (() => void)[] = [];

        if (leftPivotRef.current) {
          const oldX = leftPivotRef.current.rotation.x;
          const oldY = leftPivotRef.current.rotation.y;
          let oldZ = 0;
          if (leftHandleRef.current) {
            const handle = leftHandleRef.current.getObjectByName('Handle') || leftHandleRef.current.getObjectByName('handle') || leftHandleRef.current.getObjectByName('Pencere_Kulbu');
            if (handle) oldZ = handle.rotation.z;
          }

          leftPivotRef.current.rotation.x = -tiltRadians;
          leftPivotRef.current.rotation.y = Math.PI / 4;
          
          if (leftHandleRef.current) {
            const handle = leftHandleRef.current.getObjectByName('Handle') || leftHandleRef.current.getObjectByName('handle') || leftHandleRef.current.getObjectByName('Pencere_Kulbu');
            if (handle) handle.rotation.z = Math.PI;
          }
          leftPivotRef.current.updateMatrixWorld(true);

          restores.push(() => {
            leftPivotRef.current!.rotation.x = oldX;
            leftPivotRef.current!.rotation.y = oldY;
            if (leftHandleRef.current) {
              const handle = leftHandleRef.current.getObjectByName('Handle') || leftHandleRef.current.getObjectByName('handle') || leftHandleRef.current.getObjectByName('Pencere_Kulbu');
              if (handle) handle.rotation.z = oldZ;
            }
            leftPivotRef.current!.updateMatrixWorld(true);
          });
        }

        if (rightPivotRef.current && (typology === 'F200' || typology === 'F2XX1' || typology === 'F2MPX' || typology === 'F101C')) {
          const oldX = rightPivotRef.current.rotation.x;
          const oldY = rightPivotRef.current.rotation.y;
          let oldZ = 0;
          if (rightHandleRef.current) {
            const handle = rightHandleRef.current.getObjectByName('Handle') || rightHandleRef.current.getObjectByName('handle') || rightHandleRef.current.getObjectByName('Pencere_Kulbu');
            if (handle) oldZ = handle.rotation.z;
          }

          rightPivotRef.current.rotation.x = -tiltRadians;
          rightPivotRef.current.rotation.y = -Math.PI / 4;
          
          if (rightHandleRef.current) {
            const handle = rightHandleRef.current.getObjectByName('Handle') || rightHandleRef.current.getObjectByName('handle') || rightHandleRef.current.getObjectByName('Pencere_Kulbu');
            if (handle) handle.rotation.z = -Math.PI;
          }
          rightPivotRef.current.updateMatrixWorld(true);

          restores.push(() => {
            rightPivotRef.current!.rotation.x = oldX;
            rightPivotRef.current!.rotation.y = oldY;
            if (rightHandleRef.current) {
              const handle = rightHandleRef.current.getObjectByName('Handle') || rightHandleRef.current.getObjectByName('handle') || rightHandleRef.current.getObjectByName('Pencere_Kulbu');
              if (handle) handle.rotation.z = oldZ;
            }
            rightPivotRef.current!.updateMatrixWorld(true);
          });
        }

        return () => restores.forEach(fn => fn());
      };
    }
  }, [groupObj, height, typology]);

  // Helper to extract the texture folder name and build PBR asset paths
  const resolveBakedPaths = (texturePath: string) => {
    console.log("[ThreejsWindowEngine] resolveBakedPaths input:", texturePath);
    if (!texturePath) return null;
    const match = texturePath.match(/\/([^\/]+)\.(jpg|png|webp|jpeg)$/i);
    if (!match) {
      console.warn("[ThreejsWindowEngine] resolveBakedPaths: No filename match for regex in:", texturePath);
      return null;
    }
    const materialName = match[1];
    const resolved = {
      diffuse: `/assets/texturesbaked/${materialName}/diffuse.jpg`,
      normal: `/assets/texturesbaked/${materialName}/normal.jpg`,
      orm: `/assets/texturesbaked/${materialName}/orm.png`
    };
    console.log("[ThreejsWindowEngine] resolveBakedPaths output:", resolved);
    return resolved;
  };

  // Helper to load all three PBR maps synchronously
  const loadPBRMaps = (texturePath: string, callback: (maps: { diffuse: THREE.Texture | null; normal: THREE.Texture | null; orm: THREE.Texture | null }) => void) => {
    const paths = resolveBakedPaths(texturePath);
    if (!paths) {
      callback({ diffuse: null, normal: null, orm: null });
      return;
    }

    const loader = new THREE.TextureLoader();
    let loadedDiffuse: THREE.Texture | null = null;
    let loadedNormal: THREE.Texture | null = null;
    let loadedORM: THREE.Texture | null = null;
    
    let count = 0;
    const total = 3;
    
    const checkDone = () => {
      count++;
      if (count === total) {
        callback({ diffuse: loadedDiffuse, normal: loadedNormal, orm: loadedORM });
      }
    };

    const configureTexture = (tex: THREE.Texture, colorSpace: THREE.ColorSpace) => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      // Repeat will be set dynamically in the material useMemo based on window dimensions.
      // We leave it at 1.0 here; the material memo will clone and override.
      tex.repeat.set(1.0, 1.0);
      tex.colorSpace = colorSpace;
      tex.anisotropy = 16;
    };

    // Load Diffuse (sRGB)
    console.log("[ThreejsWindowEngine] Loading diffuse:", paths.diffuse);
    loader.load(paths.diffuse, 
      (tex) => {
        console.log("[ThreejsWindowEngine] Successfully loaded diffuse:", paths.diffuse, tex.image ? `${tex.image.width}x${tex.image.height}` : 'no image');
        configureTexture(tex, THREE.SRGBColorSpace);
        loadedDiffuse = tex;
        checkDone();
      },
      undefined,
      (err) => {
        console.error("[ThreejsWindowEngine] Error loading diffuse:", paths.diffuse, err);
        loadedDiffuse = null;
        checkDone();
      }
    );

    // Load Normal (NoColor / Linear)
    console.log("[ThreejsWindowEngine] Loading normal:", paths.normal);
    loader.load(paths.normal, 
      (tex) => {
        console.log("[ThreejsWindowEngine] Successfully loaded normal:", paths.normal, tex.image ? `${tex.image.width}x${tex.image.height}` : 'no image');
        configureTexture(tex, THREE.NoColorSpace);
        loadedNormal = tex;
        checkDone();
      },
      undefined,
      (err) => {
        console.error("[ThreejsWindowEngine] Error loading normal:", paths.normal, err);
        loadedNormal = null;
        checkDone();
      }
    );

    // Load ORM (NoColor / Linear)
    console.log("[ThreejsWindowEngine] Loading ORM:", paths.orm);
    loader.load(paths.orm, 
      (tex) => {
        console.log("[ThreejsWindowEngine] Successfully loaded ORM:", paths.orm, tex.image ? `${tex.image.width}x${tex.image.height}` : 'no image');
        configureTexture(tex, THREE.NoColorSpace);
        loadedORM = tex;
        checkDone();
      },
      undefined,
      (err) => {
        console.error("[ThreejsWindowEngine] Error loading ORM:", paths.orm, err);
        loadedORM = null;
        checkDone();
      }
    );
  };



  React.useEffect(() => {
    if (colorExtTexture) {
      loadPBRMaps(colorExtTexture, (loaded) => {
        setExtMaps(loaded);
      });
    } else {
      setExtMaps(DEFAULT_MAPS);
    }
  }, [colorExtTexture]);

  React.useEffect(() => {
    if (colorIntTexture) {
      loadPBRMaps(colorIntTexture, (loaded) => {
        setIntMaps(loaded);
      });
    } else {
      setIntMaps(DEFAULT_MAPS);
    }
  }, [colorIntTexture]);

  const [wallTexture, setWallTexture] = React.useState<THREE.Texture | null>(null);
  const [backdropTexture, setBackdropTexture] = React.useState<THREE.Texture | null>(null);

  React.useEffect(() => {
    let isCurrent = true;
    let wallUrl = '';
    let backdropUrl = '';

    if (scenery === 'custom' && customBackground) {
      wallUrl = '/assets/scenery/concrete_wall.png';
      backdropUrl = customBackground;
    } else if (scenery === 'modern-minimalist') {
      wallUrl = '/assets/scenery/concrete_wall.png';
      backdropUrl = '/assets/scenery/garden_backdrop.png';
    } else if (scenery === 'warm-nordic') {
      wallUrl = '/assets/scenery/wood_wall.png';
      backdropUrl = '/assets/scenery/forest_backdrop.png';
    } else if (scenery === 'industrial-loft') {
      wallUrl = '/assets/scenery/brick_wall.png';
      backdropUrl = '/assets/scenery/skyline_backdrop.png';
    } else if (scenery === 'suburban-garden') {
      wallUrl = '/assets/scenery/concrete_wall.png';
      backdropUrl = '/assets/scenery/garden_backdrop.png';
    } else if (scenery === 'nordic-forest') {
      wallUrl = '/assets/scenery/concrete_wall.png';
      backdropUrl = '/assets/scenery/forest_backdrop.png';
    } else if (scenery === 'urban-skyline') {
      wallUrl = '/assets/scenery/concrete_wall.png';
      backdropUrl = '/assets/scenery/skyline_backdrop.png';
    } else if (scenery === 'coastal-mediterranean') {
      wallUrl = '/assets/scenery/concrete_wall.png';
      backdropUrl = '/assets/scenery/coastal_backdrop.png';
    }

    const loader = new THREE.TextureLoader();

    console.log("[ThreejsWindowEngine] Scenery change:", scenery, "wallUrl:", wallUrl, "backdropUrl:", backdropUrl);

    if (wallUrl) {
      loader.load(
        wallUrl, 
        (tex) => {
          console.log("[ThreejsWindowEngine] Loaded wall texture successfully:", wallUrl);
          if (!isCurrent) {
            tex.dispose();
            return;
          }
          tex.wrapS = THREE.RepeatWrapping;
          tex.wrapT = THREE.RepeatWrapping;
          tex.repeat.set(3, 2.5); // Adjust repeat tiling scale for wall texture
          setWallTexture(tex);
        },
        undefined,
        (err) => {
          console.error("[ThreejsWindowEngine] Failed to load wall texture:", wallUrl, err);
        }
      );
    } else {
      setWallTexture(null);
    }

    if (backdropUrl) {
      loader.load(
        backdropUrl, 
        (tex) => {
          console.log("[ThreejsWindowEngine] Loaded backdrop texture successfully:", backdropUrl);
          if (!isCurrent) {
            tex.dispose();
            return;
          }
          setBackdropTexture(tex);
        },
        undefined,
        (err) => {
          console.error("[ThreejsWindowEngine] Failed to load backdrop texture:", backdropUrl, err);
        }
      );
    } else {
      setBackdropTexture(null);
    }

    return () => {
      isCurrent = false;
      setWallTexture(prev => {
        if (prev) prev.dispose();
        return null;
      });
      setBackdropTexture(prev => {
        if (prev) prev.dispose();
        return null;
      });
    };
  }, [scenery, customBackground]);


  const extMaterial = useMemo(() => {
    if (extMaps.diffuse) {
      // UV repeat in "tiles per meter" Ã¢â‚¬â€ UVs are in meters in this scene.
      // repeatU: 1 tile = TEX_MM_ALONG_GRAIN mm along profile length. Scales with window size.
      const repeatU = (width / 1000) / (TEX_MM_ALONG_GRAIN / 1000); // tiles along profile length
      // repeatV: 1 tile = TEX_MM_ACROSS_GRAIN mm across profile face.
      // Profile cross-section UV V spans ~0.1m (70mm diagonal). 16.3 tiles/m Ã¢â€ â€™ ~1.6 tiles visible.
      const repeatV = 1000 / TEX_MM_ACROSS_GRAIN; // tiles per meter across face

      // Clone textures so repeat is independent per material instance
      const cloneAndRepeat = (tex: THREE.Texture) => {
        const t = tex.clone();
        t.wrapS = THREE.RepeatWrapping;
        t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(repeatU, repeatV);
        t.needsUpdate = true;
        return t;
      };

      const mat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: cloneAndRepeat(extMaps.diffuse),
        normalMap: extMaps.normal ? cloneAndRepeat(extMaps.normal) : null,
        aoMap: extMaps.orm ? cloneAndRepeat(extMaps.orm) : null,
        roughnessMap: extMaps.orm ? cloneAndRepeat(extMaps.orm) : null,
        metalnessMap: extMaps.orm ? cloneAndRepeat(extMaps.orm) : null,
        roughness: 1.0,
        metalness: 0.0,
        aoMapIntensity: 0.8,
      });
      if (extMaps.normal) mat.normalScale.set(0.6, 0.6);
      return mat;
    }
    return new THREE.MeshStandardMaterial({
      color: colorExt || '#ffffff',
      roughness: 0.6,
      metalness: 0.1
    });
  }, [colorExt, extMaps, width]);
  
  const intMaterial = useMemo(() => {
    if (intMaps.diffuse) {
      // Interior: vertical stiles Ã¢â‚¬â€ dominant axis is height
      const repeatU = (height / 1000) / (TEX_MM_ALONG_GRAIN / 1000);
      const repeatV = 1000 / TEX_MM_ACROSS_GRAIN;

      const cloneAndRepeat = (tex: THREE.Texture) => {
        const t = tex.clone();
        t.wrapS = THREE.RepeatWrapping;
        t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(repeatU, repeatV);
        t.needsUpdate = true;
        return t;
      };

      const mat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: cloneAndRepeat(intMaps.diffuse),
        normalMap: intMaps.normal ? cloneAndRepeat(intMaps.normal) : null,
        aoMap: intMaps.orm ? cloneAndRepeat(intMaps.orm) : null,
        roughnessMap: intMaps.orm ? cloneAndRepeat(intMaps.orm) : null,
        metalnessMap: intMaps.orm ? cloneAndRepeat(intMaps.orm) : null,
        roughness: 1.0,
        metalness: 0.0,
        aoMapIntensity: 0.8,
      });
      if (intMaps.normal) mat.normalScale.set(0.6, 0.6);
      return mat;
    }
    return new THREE.MeshStandardMaterial({
      color: colorInt || '#ffffff',
      roughness: 0.6,
      metalness: 0.1
    });
  }, [colorInt, intMaps, height]);

  const glassMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({ 
     color: "#ffffff", 
     roughness: 0.0,
     metalness: 0.0,
     transmission: 1.0,
     ior: 1.5,
     thickness: 0.01,
     transparent: true,
     opacity: 0.6,
  }), []);

  const spacerMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: spacerColor,
    roughness: 0.8,
    metalness: 0.6
  }), [spacerColor]);

  // F103 color overrides & gasket materials
  const finalFrmExtMat = useMemo(() => {
    if (typology === 'F103') {
      return new THREE.MeshStandardMaterial({ color: '#1d4ed8', roughness: 0.6, metalness: 0.1 });
    }
    return extMaterial;
  }, [typology, extMaterial]);

  const finalFrmIntMat = useMemo(() => {
    if (typology === 'F103') {
      return new THREE.MeshStandardMaterial({ color: '#60a5fa', roughness: 0.6, metalness: 0.1 });
    }
    return intMaterial;
  }, [typology, intMaterial]);

  const finalSshExtMat = useMemo(() => {
    if (typology === 'F103') {
      return new THREE.MeshStandardMaterial({ color: '#b91c1c', roughness: 0.6, metalness: 0.1 });
    }
    return extMaterial;
  }, [typology, extMaterial]);

  const finalSshIntMat = useMemo(() => {
    if (typology === 'F103') {
      return new THREE.MeshStandardMaterial({ color: '#f87171', roughness: 0.6, metalness: 0.1 });
    }
    return intMaterial;
  }, [typology, intMaterial]);

  const bzdMaterial = useMemo(() => {
    if (intMaps.diffuse) {
      // BZD: interior glazing bead. Rotate texture by 90 degrees.
      const repeatU = (height / 1000) / (TEX_MM_ALONG_GRAIN / 1000);
      const repeatV = 1000 / TEX_MM_ACROSS_GRAIN;

      const cloneRotateAndRepeat = (tex: THREE.Texture) => {
        const t = tex.clone();
        t.wrapS = THREE.RepeatWrapping;
        t.wrapT = THREE.RepeatWrapping;
        t.center.set(0.5, 0.5);
        t.rotation = Math.PI / 2;
        // Swap repeatU and repeatV since texture is rotated 90 degrees
        t.repeat.set(repeatV, repeatU);
        t.needsUpdate = true;
        return t;
      };

      const mat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: cloneRotateAndRepeat(intMaps.diffuse),
        normalMap: intMaps.normal ? cloneRotateAndRepeat(intMaps.normal) : null,
        aoMap: intMaps.orm ? cloneRotateAndRepeat(intMaps.orm) : null,
        roughnessMap: intMaps.orm ? cloneRotateAndRepeat(intMaps.orm) : null,
        metalnessMap: intMaps.orm ? cloneRotateAndRepeat(intMaps.orm) : null,
        roughness: 1.0,
        metalness: 0.0,
        aoMapIntensity: 0.8,
      });
      if (intMaps.normal) mat.normalScale.set(0.6, 0.6);
      return mat;
    }
    return new THREE.MeshStandardMaterial({
      color: colorInt || '#ffffff',
      roughness: 0.6,
      metalness: 0.1
    });
  }, [colorInt, intMaps, height]);

  const finalBzdMat = useMemo(() => {
    if (typology === 'F103') {
      return new THREE.MeshStandardMaterial({ color: '#60a5fa', roughness: 0.6, metalness: 0.1 });
    }
    return bzdMaterial;
  }, [typology, bzdMaterial]);

  const finalSpacerMat = useMemo(() => {
    if (typology === 'F103') {
      return new THREE.MeshStandardMaterial({ color: '#eab308', roughness: 0.8, metalness: 0.6 });
    }
    return spacerMaterial;
  }, [typology, spacerMaterial]);

  const finalGlsExtMat = useMemo(() => {
    if (typology === 'F103') {
      return new THREE.MeshPhysicalMaterial({
        color: "#22d3ee",
        roughness: 0.0,
        metalness: 0.0,
        transmission: 1.0,
        ior: 1.5,
        thickness: 0.01,
        transparent: true,
        opacity: 0.6,
      });
    }
    return glassMaterial;
  }, [typology, glassMaterial]);

  const finalGlsIntMat = useMemo(() => {
    if (typology === 'F103') {
      return new THREE.MeshPhysicalMaterial({
        color: "#0d9488",
        roughness: 0.0,
        metalness: 0.0,
        transmission: 1.0,
        ior: 1.5,
        thickness: 0.01,
        transparent: true,
        opacity: 0.6,
      });
    }
    return glassMaterial;
  }, [typology, glassMaterial]);

  const gskFrmExtMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: typology === 'F103' ? '#15803d' : (sealColor || '#1a1a1a'),
    roughness: 0.9,
    metalness: 0.1
  }), [typology, sealColor]);

  const gskSshBtmMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: sealColor || '#808080',
    roughness: 0.9,
    metalness: 0.1
  }), [sealColor]);

  const gskBzdMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: typology === 'F103' ? '#7c3aed' : (sealColor || '#1a1a1a'),
    roughness: 0.9,
    metalness: 0.1
  }), [typology, sealColor]);

  const gskSshExtMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: sealColor || '#808080',
    roughness: 0.9,
    metalness: 0.1
  }), [sealColor]);

  const isDoubleSash = typology === 'F200' || typology === 'F2XX1' || typology === 'F2MPX';
  const isFixedMullion = typology === 'F2XX1';
  const isMovablePost = typology === 'F2MPX';

  const profileData = useMemo(() => {
    if (typology === 'F104') return IG5_F104;
    if (typology === 'F103') return IG5_F103;
    if (typology === 'F200') return IG5_F200;
    if (typology === 'F2XX1') return IG5_F2XX1;
    if (typology === 'F2MPX') return IG5_F2MPX as any;
    return IG5_F100;
  }, [typology]);

  const frmExt = profileData.profiles.FRM_EXT?.vertices || [];
  const frmInt = profileData.profiles.FRM_INT?.vertices || [];
  const bzd = (profileData.profiles as any).BZD?.vertices || [];
  const sshExt = (profileData.profiles as any).SSH_EXT?.vertices || [];
  const sshInt = (profileData.profiles as any).SSH_INT?.vertices || [];
  const glsExt = profileData.profiles.GLS_EXT?.vertices || [];
  const glsInt = profileData.profiles.GLS_INT?.vertices || [];
  const spacer1 = (profileData.profiles as any).SPACER1?.vertices || (profileData.profiles as any).SPCR?.vertices || [];
  
  const pstExtRaw = (profileData.profiles as any).PST_EXT?.vertices || [];
  const pstIntRaw = (profileData.profiles as any).PST_INT?.vertices || [];

  const pstExt = useMemo(() => {
    if (!isFixedMullion) return pstExtRaw;
    return pstExtRaw.map((v: any) => ({ x: v.x, y: -v.y }));
  }, [pstExtRaw, isFixedMullion]);

  const pstInt = useMemo(() => {
    if (!isFixedMullion) return pstIntRaw;
    return pstIntRaw.map((v: any) => ({ x: v.x, y: -v.y }));
  }, [pstIntRaw, isFixedMullion]);

  const gskFrmExt = (profileData.profiles as any).GSK_FRM_EXT?.vertices || [];
  const gskSshBtmRaw = (profileData.profiles as any).GSK_SSH_BTM?.vertices || [];
  const gskBzd = (profileData.profiles as any).GSK_BZD?.vertices || [];
  const gskSshExtRaw = (profileData.profiles as any).GSK_SSH_EXT?.vertices || [];

  const gskSshBtm = useMemo(() => {
    return gskSshBtmRaw.map((v: any) => ({ x: v.x + 4, y: v.y }));
  }, [gskSshBtmRaw]);

  const gskSshExt = useMemo(() => {
    return gskSshExtRaw.map((v: any) => ({ x: v.x + 4, y: v.y }));
  }, [gskSshExtRaw]);

  // Helper to get bounds of a profile
  const getBounds = (verts: any[]) => {
    if (!verts || verts.length === 0) return null;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const v of verts) {
      if (v.x < minX) minX = v.x;
      if (v.x > maxX) maxX = v.x;
      if (v.y < minY) minY = v.y;
      if (v.y > maxY) maxY = v.y;
    }
    return { minX, maxX, minY, maxY };
  };

  const extBounds = getBounds(glsExt);
  const intBounds = getBounds(glsInt);

  // Compute common origin for all parts so they don't lose relative positioning!
  // NOTE: pstExt/pstInt are intentionally EXCLUDED Ã¢â‚¬â€ the post is centred at y=0 and
  // including its negative Y values would corrupt the origin for all other profiles.
  const commonOrigin = useMemo(() => {
    let minX = Infinity, minY = Infinity;
    const allVerts = [
      ...frmExt,
      ...frmInt,
      ...bzd,
      ...sshExt,
      ...sshInt,
      ...glsExt,
      ...glsInt,
      ...spacer1,
      ...gskFrmExt,
      ...gskSshBtm,
      ...gskBzd,
      ...gskSshExt
    ];
    for (const v of allVerts) {
      if (v.x < minX) minX = v.x;
      if (v.y < minY) minY = v.y;
    }
    return { x: minX === Infinity ? 0 : minX, y: minY === Infinity ? 0 : minY };
  }, [frmExt, frmInt, bzd, sshExt, sshInt, glsExt, glsInt, spacer1, gskFrmExt, gskSshBtm, gskBzd, gskSshExt]);

  // The post profile is centred at y=0 (width) and x=0..70 (depth).
  // We use its own origin so it doesn't interfere with the frame coordinate system.
  const postOrigin = useMemo(() => {
    const allPst = [...pstExt, ...pstInt];
    if (allPst.length === 0) return { x: 0, y: 0 };
    const minX = Math.min(...allPst.map(v => v.x));
    const minY = Math.min(...allPst.map(v => v.y));
    return { x: minX, y: minY };
  }, [pstExt, pstInt]);

  // CAD profiles are often huge (e.g. 1 unit = 1mm). 
  // We must scale down by 0.001 so 1 unit = 1 meter in the final exported GLTF,
  // which is exactly what AR viewers expect for real-world physical sizing.
  const scale = 0.001;

  const W = width * scale;
  const H = height * scale;



  return (
    <group ref={setGroupObj}>
      {/* Rotated 180 degrees around Y so the Interior view is presented first by default */}
      <group rotation={[0, Math.PI, 0]}>
        {/* Shift so: X centered, Y bottom at origin, Z back-face at origin */}
        <group position={[-W / 2, 0, 0]}>
        {/* Bottom Segment */}
        <group position={[0, 0, 0]} rotation={[0, 0, 0]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            <FrameSegment scaleFactor={scale} length={width} vertices={frmExt} material={finalFrmExtMat} origin={commonOrigin} uSign={1} uOffset={0} layerName="FRM_EXT" />
            <FrameSegment scaleFactor={scale} length={width} vertices={frmInt} material={finalFrmIntMat} origin={commonOrigin} uSign={1} uOffset={0} layerName="FRM_INT" />
            {gskFrmExt.length > 0 && <FrameSegment scaleFactor={scale} length={width} vertices={gskFrmExt} material={gskFrmExtMaterial} origin={commonOrigin} uSign={1} uOffset={0} layerName="GSK_FRM_EXT" />}
            
            {!isDoubleSash && (
              <>
                {bzd.length > 0 && <FrameSegment uvMode='rail' scaleFactor={scale} length={width} vertices={bzd} material={finalBzdMat} origin={commonOrigin} uSign={1} uOffset={0} layerName="BZD" />}
                {sshExt.length > 0 && <FrameSegment scaleFactor={scale} length={width} vertices={sshExt} material={finalSshExtMat} origin={commonOrigin} uSign={1} uOffset={0} layerName="SSH_EXT" />}
                {sshInt.length > 0 && <FrameSegment scaleFactor={scale} length={width} vertices={sshInt} material={finalSshIntMat} origin={commonOrigin} uSign={1} uOffset={0} layerName="SSH_INT" />}
                {spacer1.length > 0 && <FrameSegment scaleFactor={scale} length={width} vertices={spacer1} material={finalSpacerMat} origin={commonOrigin} uSign={1} uOffset={0} layerName="SPACER1" />}
                {gskSshBtm.length > 0 && <FrameSegment scaleFactor={scale} length={width} vertices={gskSshBtm} material={gskSshBtmMaterial} origin={commonOrigin} uSign={1} uOffset={0} layerName="GSK_SSH_BTM" />}
                {gskBzd.length > 0 && <FrameSegment scaleFactor={scale} length={width} vertices={gskBzd} material={gskBzdMaterial} origin={commonOrigin} uSign={1} uOffset={0} layerName="GSK_BZD" />}
                {gskSshExt.length > 0 && <FrameSegment scaleFactor={scale} length={width} vertices={gskSshExt} material={gskSshExtMaterial} origin={commonOrigin} uSign={1} uOffset={0} layerName="GSK_SSH_EXT" />}
              </>
            )}
          </group>
        </group>

        {/* Right Segment */}
        <group position={[W, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            <FrameSegment scaleFactor={scale} length={height} vertices={frmExt} material={finalFrmExtMat} origin={commonOrigin} uSign={-1} uOffset={W} layerName="FRM_EXT" />
            <FrameSegment scaleFactor={scale} length={height} vertices={frmInt} material={finalFrmIntMat} origin={commonOrigin} uSign={-1} uOffset={W} layerName="FRM_INT" />
            {gskFrmExt.length > 0 && <FrameSegment scaleFactor={scale} length={height} vertices={gskFrmExt} material={gskFrmExtMaterial} origin={commonOrigin} uSign={-1} uOffset={W} layerName="GSK_FRM_EXT" />}
            
            {!isDoubleSash && (
              <>
                {bzd.length > 0 && <FrameSegment uvMode='rail' scaleFactor={scale} length={height} vertices={bzd} material={finalBzdMat} origin={commonOrigin} uSign={-1} uOffset={W} layerName="BZD" />}
                {sshExt.length > 0 && <FrameSegment scaleFactor={scale} length={height} vertices={sshExt} material={finalSshExtMat} origin={commonOrigin} uSign={-1} uOffset={W} layerName="SSH_EXT" />}
                {sshInt.length > 0 && <FrameSegment scaleFactor={scale} length={height} vertices={sshInt} material={finalSshIntMat} origin={commonOrigin} uSign={-1} uOffset={W} layerName="SSH_INT" />}
                {spacer1.length > 0 && <FrameSegment scaleFactor={scale} length={height} vertices={spacer1} material={finalSpacerMat} origin={commonOrigin} uSign={-1} uOffset={W} layerName="SPACER1" />}
                {gskSshBtm.length > 0 && <FrameSegment scaleFactor={scale} length={height} vertices={gskSshBtm} material={gskSshBtmMaterial} origin={commonOrigin} uSign={-1} uOffset={W} layerName="GSK_SSH_BTM" />}
                {gskBzd.length > 0 && <FrameSegment scaleFactor={scale} length={height} vertices={gskBzd} material={gskBzdMaterial} origin={commonOrigin} uSign={-1} uOffset={W} layerName="GSK_BZD" />}
                {gskSshExt.length > 0 && <FrameSegment scaleFactor={scale} length={height} vertices={gskSshExt} material={gskSshExtMaterial} origin={commonOrigin} uSign={-1} uOffset={W} layerName="GSK_SSH_EXT" />}
              </>
            )}
          </group>
        </group>

        {/* Top Segment */}
        <group position={[W, H, 0]} rotation={[0, 0, Math.PI]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            <FrameSegment scaleFactor={scale} length={width} vertices={frmExt} material={finalFrmExtMat} origin={commonOrigin} uSign={1} uOffset={W - H} layerName="FRM_EXT" />
            <FrameSegment scaleFactor={scale} length={width} vertices={frmInt} material={finalFrmIntMat} origin={commonOrigin} uSign={1} uOffset={W - H} layerName="FRM_INT" />
            {gskFrmExt.length > 0 && <FrameSegment scaleFactor={scale} length={width} vertices={gskFrmExt} material={gskFrmExtMaterial} origin={commonOrigin} uSign={1} uOffset={W - H} layerName="GSK_FRM_EXT" />}
            
            {!isDoubleSash && (
              <>
                {bzd.length > 0 && <FrameSegment uvMode='rail' scaleFactor={scale} length={width} vertices={bzd} material={finalBzdMat} origin={commonOrigin} uSign={1} uOffset={W - H} layerName="BZD" />}
                {sshExt.length > 0 && <FrameSegment scaleFactor={scale} length={width} vertices={sshExt} material={finalSshExtMat} origin={commonOrigin} uSign={1} uOffset={W - H} layerName="SSH_EXT" />}
                {sshInt.length > 0 && <FrameSegment scaleFactor={scale} length={width} vertices={sshInt} material={finalSshIntMat} origin={commonOrigin} uSign={1} uOffset={W - H} layerName="SSH_INT" />}
                {spacer1.length > 0 && <FrameSegment scaleFactor={scale} length={width} vertices={spacer1} material={finalSpacerMat} origin={commonOrigin} uSign={1} uOffset={W - H} layerName="SPACER1" />}
                {gskSshBtm.length > 0 && <FrameSegment scaleFactor={scale} length={width} vertices={gskSshBtm} material={gskSshBtmMaterial} origin={commonOrigin} uSign={1} uOffset={W - H} layerName="GSK_SSH_BTM" />}
                {gskBzd.length > 0 && <FrameSegment scaleFactor={scale} length={width} vertices={gskBzd} material={gskBzdMaterial} origin={commonOrigin} uSign={1} uOffset={W - H} layerName="GSK_BZD" />}
                {gskSshExt.length > 0 && <FrameSegment scaleFactor={scale} length={width} vertices={gskSshExt} material={gskSshExtMaterial} origin={commonOrigin} uSign={1} uOffset={W - H} layerName="GSK_SSH_EXT" />}
              </>
            )}
          </group>
        </group>

        {/* Left Segment */}
        <group position={[0, H, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            <FrameSegment scaleFactor={scale} length={height} vertices={frmExt} material={finalFrmExtMat} origin={commonOrigin} uSign={-1} uOffset={2 * W - H} layerName="FRM_EXT" />
            <FrameSegment scaleFactor={scale} length={height} vertices={frmInt} material={finalFrmIntMat} origin={commonOrigin} uSign={-1} uOffset={2 * W - H} layerName="FRM_INT" />
            {gskFrmExt.length > 0 && <FrameSegment scaleFactor={scale} length={height} vertices={gskFrmExt} material={gskFrmExtMaterial} origin={commonOrigin} uSign={-1} uOffset={2 * W - H} layerName="GSK_FRM_EXT" />}
            
            {!isDoubleSash && (
              <>
                {bzd.length > 0 && <FrameSegment uvMode='rail' scaleFactor={scale} length={height} vertices={bzd} material={finalBzdMat} origin={commonOrigin} uSign={-1} uOffset={2 * W - H} layerName="BZD" />}
                {sshExt.length > 0 && <FrameSegment scaleFactor={scale} length={height} vertices={sshExt} material={finalSshExtMat} origin={commonOrigin} uSign={-1} uOffset={2 * W - H} layerName="SSH_EXT" />}
                {sshInt.length > 0 && <FrameSegment scaleFactor={scale} length={height} vertices={sshInt} material={finalSshIntMat} origin={commonOrigin} uSign={-1} uOffset={2 * W - H} layerName="SSH_INT" />}
                {spacer1.length > 0 && <FrameSegment scaleFactor={scale} length={height} vertices={spacer1} material={finalSpacerMat} origin={commonOrigin} uSign={-1} uOffset={2 * W - H} layerName="SPACER1" />}
                {gskSshBtm.length > 0 && <FrameSegment scaleFactor={scale} length={height} vertices={gskSshBtm} material={gskSshBtmMaterial} origin={commonOrigin} uSign={-1} uOffset={2 * W - H} layerName="GSK_SSH_BTM" />}
                {gskBzd.length > 0 && <FrameSegment scaleFactor={scale} length={height} vertices={gskBzd} material={gskBzdMaterial} origin={commonOrigin} uSign={-1} uOffset={2 * W - H} layerName="GSK_BZD" />}
                {gskSshExt.length > 0 && <FrameSegment scaleFactor={scale} length={height} vertices={gskSshExt} material={gskSshExtMaterial} origin={commonOrigin} uSign={-1} uOffset={2 * W - H} layerName="GSK_SSH_EXT" />}
              </>
            )}
          </group>
        </group>

        {/* F200/F2XX1 Post & Sashes */}
        {isDoubleSash && (() => {
          const SW = width / 2;    // half-width in mm
          const Ws = SW * scale;   // half-width in metres

          // The SSH stile body starts sshYMin mm away from the stile reference position.
          // To make the inner stile of each sash reach the window centre (x=Ws), we extend
          // each sash by sshYMin, so its inner stile's outer edge lands exactly at x=Ws.
          const sshYMinMm = sshExt.length > 0
            ? Math.min(...sshExt.map((v: any) => v.y)) - commonOrigin.y
            : 58.7;
          const sshIntMinMm = sshInt.length > 0
            ? Math.min(...sshInt.map((v: any) => v.y)) - commonOrigin.y
            : 38.7;

          const SW_eff = isFixedMullion ? (SW + sshIntMinMm - 14) : (SW + sshYMinMm);
          const Ws_eff = SW_eff * scale;      // effective sash width in metres
          const rightSashX = W - Ws_eff;     // right sash x-offset so its right edge = W

          // Render the profiles for one rail/stile segment.
          // Main structural profiles get full CSG mitre cuts (needed for visible corners).
          // Gaskets/spacer skip CSG for performance (their corners are hidden).
          const sashSeg = (len: number, uSign: number, uOff: number) => (<>
            {bzd.length > 0 && <FrameSegment uvMode='rail' scaleFactor={scale} length={len} vertices={bzd} material={finalBzdMat} origin={commonOrigin} uSign={uSign} uOffset={uOff} layerName="BZD" />}
            {sshExt.length > 0 && <FrameSegment scaleFactor={scale} length={len} vertices={sshExt} material={finalSshExtMat} origin={commonOrigin} uSign={uSign} uOffset={uOff} layerName="SSH_EXT" />}
            {sshInt.length > 0 && <FrameSegment scaleFactor={scale} length={len} vertices={sshInt} material={finalSshIntMat} origin={commonOrigin} uSign={uSign} uOffset={uOff} layerName="SSH_INT" />}
            {spacer1.length > 0 && <FrameSegment scaleFactor={scale} length={len} vertices={spacer1} material={finalSpacerMat} origin={commonOrigin} uSign={uSign} uOffset={uOff} layerName="SPACER1" />}
            {gskSshBtm.length > 0 && <FrameSegment scaleFactor={scale} length={len} vertices={gskSshBtm} material={gskSshBtmMaterial} origin={commonOrigin} uSign={uSign} uOffset={uOff} layerName="GSK_SSH_BTM" />}
            {gskBzd.length > 0 && <FrameSegment scaleFactor={scale} length={len} vertices={gskBzd} material={gskBzdMaterial} origin={commonOrigin} uSign={uSign} uOffset={uOff} layerName="GSK_BZD" />}
            {gskSshExt.length > 0 && <FrameSegment scaleFactor={scale} length={len} vertices={gskSshExt} material={gskSshExtMaterial} origin={commonOrigin} uSign={uSign} uOffset={uOff} layerName="GSK_SSH_EXT" />}
          </>);

          const sashExtMinX = sshExt.length > 0 ? Math.min(...sshExt.map((v: any) => v.x)) : 17.27;
          const gskFrmExtMinX = gskFrmExt.length > 0 ? Math.min(...gskFrmExt.map((v: any) => v.x)) : 16.3;
          const sashZOffset = (sashExtMinX - gskFrmExtMinX - 2.0) * scale + (isFixedMullion ? 10 * scale : 0);

          // Render a complete sash frame (4 sides) at a given x offset.
          // SW_eff ensures the inner stile body reaches the window centre line.
          const renderSash = (xOffset: number) => {
            const Ww = Ws_eff;
            const isRightSash = xOffset > 0;
            
            const pivotX = isRightSash ? Ww - 50 * scale : 50 * scale;
            const pivotY = 50 * scale;
            const pivotZ = -82.0 * scale; // local to the sash Z plane

            const pivotRef = isRightSash ? rightPivotRef : leftPivotRef;
            
            const handleX = isRightSash ? 83 * scale : Ww - 60 * scale;
            const realSashHeightMm = H / scale;
            const handleY = getHandleHeightFromBottom(realSashHeightMm, typology, 0) * scale;
            const sshIntMaxX = sshInt.length > 0 ? Math.max(...sshInt.map((v: any) => v.x)) : 90;
            const handleZ = - sshIntMaxX * scale - 60 * scale;

            const state = isRightSash ? rightState : leftState;
            const setState = isRightSash ? setRightState : setLeftState;

            return (
              <group key={xOffset} position={[xOffset, 0, sashZOffset]}>
                <group position={[pivotX, pivotY, pivotZ]} name={isRightSash ? "rightPivotGroup" : "leftPivotGroup"}>
                  <group ref={pivotRef} name={isRightSash ? "rightSashPivot" : "leftSashPivot"}>
                    <group position={[-pivotX, -pivotY, -pivotZ]}>
                      {/* Bottom rail */}
                      <group rotation={[0, 0, 0]}>
                        <group rotation={[0, Math.PI / 2, 0]}>
                          {sashSeg(SW_eff, 1, 0)}
                        </group>
                      </group>
                      {/* Right stile */}
                      <group position={[Ww, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                        <group rotation={[0, Math.PI / 2, 0]}>
                          {sashSeg(height, -1, Ww)}
                        </group>
                      </group>
                      {/* Top rail */}
                      <group position={[Ww, H, 0]} rotation={[0, 0, Math.PI]}>
                        <group rotation={[0, Math.PI / 2, 0]}>
                          {sashSeg(SW_eff, 1, Ww - H)}
                        </group>
                      </group>
                      {/* Left stile */}
                      <group position={[0, H, 0]} rotation={[0, 0, -Math.PI / 2]}>
                        <group rotation={[0, Math.PI / 2, 0]}>
                          {sashSeg(height, -1, Ww - H)}
                        </group>
                      </group>
                      {/* Glass panes — centred in the effective sash width */}
                      {extBounds && (
                        <mesh
                          position={[Ww / 2, H / 2, -(((extBounds.minX + extBounds.maxX) / 2) - commonOrigin.x) * scale]}
                          material={finalGlsExtMat}
                        >
                          <boxGeometry args={[
                            (SW_eff - 2 * (extBounds.minY - commonOrigin.y)) * scale,
                            (height  - 2 * (extBounds.minY - commonOrigin.y)) * scale,
                            (extBounds.maxX - extBounds.minX) * scale,
                          ]} />
                        </mesh>
                      )}
                      {intBounds && (
                        <mesh
                          position={[Ww / 2, H / 2, -(((intBounds.minX + intBounds.maxX) / 2) - commonOrigin.x) * scale]}
                          material={finalGlsIntMat}
                        >
                          <boxGeometry args={[
                            (SW_eff - 2 * (intBounds.minY - commonOrigin.y)) * scale,
                            (height  - 2 * (intBounds.minY - commonOrigin.y)) * scale,
                            (intBounds.maxX - intBounds.minX) * scale,
                          ]} />
                        </mesh>
                      )}

                      {/* Click indicators to trigger state changes */}
                      {/* Open/Side hotspot — always shown on both sashes */}
                      <Html position={[isRightSash ? 80 * scale : Ww - 80 * scale, handleY, -89.0 * scale]} center>
                        <div
                          className="w-10 h-10 flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                          style={{ animation: 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
                          onClick={(e) => { e.stopPropagation(); setState(state === 'open_side' ? 'closed' : 'open_side'); }}
                        >
                          <div className="relative w-4 h-4 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full bg-[#d4d4d8] opacity-40 blur-[2px]" />
                            <div className="absolute w-2.5 h-2.5 rounded-full bg-[#d4d4d8] border-[1.5px] border-white shadow-sm" />
                          </div>
                        </div>
                      </Html>

                      {/* Tilt hotspot — hidden for F2MPX left sash (opens-only) */}
                      {(!isMovablePost || isRightSash) && (
                        <Html position={[isRightSash ? 80 * scale : Ww - 80 * scale, H - 75 * scale, -89.0 * scale]} center>
                          <div
                            className="w-10 h-10 flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                            style={{ animation: 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
                            onClick={(e) => { e.stopPropagation(); setState(state === 'open_tilt' ? 'closed' : 'open_tilt'); }}
                          >
                            <div className="relative w-4 h-4 flex items-center justify-center">
                              <div className="absolute inset-0 rounded-full bg-[#d4d4d8] opacity-40 blur-[2px]" />
                              <div className="absolute w-2.5 h-2.5 rounded-full bg-[#d4d4d8] border-[1.5px] border-white shadow-sm" />
                            </div>
                          </div>
                        </Html>
                      )}

                      {/* Handle Model */}
                      {(isRightSash ? clonedHandleRight : clonedHandleLeft) && (
                        <group 
                          ref={isRightSash ? rightHandleRef : leftHandleRef} 
                          position={[handleX, handleY, handleZ]} 
                          rotation={[Math.PI / 2, Math.PI, 0]}
                          scale={[0.025, 0.025, 0.025]}
                        >
                          <primitive object={isRightSash ? clonedHandleRight : clonedHandleLeft} />
                        </group>
                      )}

                    </group>
                  </group>
                </group>
              </group>
            );
          };

          return (
            <>
              {renderSash(0)}
              {renderSash(rightSashX)}

              {/* Central Post — origin.y=0 centres the post body at x=Ws */}
              {(pstExt.length > 0 || pstInt.length > 0) && (() => {
                // F2XX1 = fixed mullion: shorter, rotated 180°, offset inward
                // F2MPX = movable post: full height, no rotation flip, no Z offset
                // F200  = standard: full height, no flip, no Z offset
                const postLength = isFixedMullion ? height - 92 : height;
                const postRotation: [number, number, number] = [0, isFixedMullion ? Math.PI : 0, Math.PI / 2];
                const postPosition: [number, number, number] = [
                  Ws,
                  isFixedMullion ? 46 * scale : 0,
                  isFixedMullion ? -70 * scale : 0,
                ];
                // Material assignment:
                //   Fixed mullion (F2XX1): ext side uses int material (it faces inward)
                //   Movable post  (F2MPX): ext side uses ext material (faces the exterior)
                //   Standard      (F200) : ext side uses ext material
                const postExtMat = isFixedMullion ? finalFrmIntMat : finalFrmExtMat;
                const postIntMat = isFixedMullion ? finalFrmExtMat : finalFrmIntMat;
                return (
                  <group position={postPosition} rotation={postRotation}>
                    <group rotation={[0, Math.PI / 2, 0]}>
                      {pstExt.length > 0 && (
                        <FrameSegment 
                          skipCuts 
                          scaleFactor={scale} 
                          length={postLength} 
                          vertices={pstExt} 
                          material={postExtMat} 
                          origin={{ x: postOrigin.x, y: 0 }} 
                          uSign={-1} 
                          uOffset={Ws} 
                          layerName="PST_EXT"
                        />
                      )}
                      {pstInt.length > 0 && (
                        <FrameSegment 
                          skipCuts 
                          scaleFactor={scale} 
                          length={postLength} 
                          vertices={pstInt} 
                          material={postIntMat} 
                          origin={{ x: postOrigin.x, y: 0 }} 
                          uSign={-1} 
                          uOffset={Ws} 
                          layerName="PST_INT"
                        />
                      )}
                    </group>
                  </group>
                );
              })()}
            </>
          );
        })()}
        {/* Single Glass Panes (for F100, F103, F104) */}
        {!isDoubleSash && extBounds && (
          <mesh 
            position={[
              W / 2, 
              H / 2, 
              -(((extBounds.minX + extBounds.maxX) / 2) - commonOrigin.x) * scale
            ]}
            material={finalGlsExtMat}
          >
            <boxGeometry args={[
              (width - 2 * (extBounds.minY - commonOrigin.y)) * scale, 
              (height - 2 * (extBounds.minY - commonOrigin.y)) * scale, 
              (extBounds.maxX - extBounds.minX) * scale
            ]} />
          </mesh>
        )}
        
        {!isDoubleSash && intBounds && (
          <mesh 
            position={[
              W / 2, 
              H / 2, 
              -(((intBounds.minX + intBounds.maxX) / 2) - commonOrigin.x) * scale
            ]}
            material={finalGlsIntMat}
          >
            <boxGeometry args={[
              (width - 2 * (intBounds.minY - commonOrigin.y)) * scale, 
              (height - 2 * (intBounds.minY - commonOrigin.y)) * scale, 
              (intBounds.maxX - intBounds.minX) * scale
            ]} />
          </mesh>
        )}

        </group>
      </group>

      {/* Landscape Backdrop Plane — sits far behind the window frame */}
      {backdropTexture && (
        <mesh position={[0, H / 2, -1.5]} renderOrder={0}>
          <planeGeometry args={[20, 16]} />
          <meshBasicMaterial map={backdropTexture} toneMapped={false} depthWrite={false} />
        </mesh>
      )}

      {/* Wall Fragment (Inside-Looking-Out) — sits just behind the window frame back face at z=0 */}
      {wallTexture && (
        <mesh key={`wall-${W}-${H}`} position={[0, 0, -0.04]} renderOrder={1} castShadow receiveShadow>
          <extrudeGeometry args={[
            // Shape
            (() => {
              const shape = new THREE.Shape();
              const wallW = 8;
              const wallH = 6;
              // Center the wall around the window's vertical center (H / 2)
              shape.moveTo(-wallW / 2, -wallH / 2 + H / 2);
              shape.lineTo(wallW / 2, -wallH / 2 + H / 2);
              shape.lineTo(wallW / 2, wallH / 2 + H / 2);
              shape.lineTo(-wallW / 2, wallH / 2 + H / 2);
              shape.closePath();

              // Cutout hole centered vertically and horizontally
              const hole = new THREE.Path();
              hole.moveTo(-W / 2, 0);
              hole.lineTo(W / 2, 0);
              hole.lineTo(W / 2, H);
              hole.lineTo(-W / 2, H);
              hole.closePath();
              shape.holes.push(hole);

              return shape;
            })(),
            // Extrude settings
            {
              depth: 0.08,
              bevelEnabled: false
            }
          ]} />
          <meshStandardMaterial 
            map={wallTexture} 
            roughness={0.95} 
            metalness={0.0} 
          />
        </mesh>
      )}

    </group>
  );
};

export const ThreejsWindowEngine: React.FC<ThreejsWindowEngineProps> = (props) => {
  const { theme } = useThemeStore();
  const isLight = theme === 'light';

  const targetY = (props.height * 0.001) / 2;
  const maxDim = Math.max(props.width, props.height) * 0.001;
  const activeSceneryForCamera = props.scenery || 'studio-grey';
  const hasWallScenery = ['modern-minimalist', 'warm-nordic', 'industrial-loft', 'urban-skyline', 'suburban-garden', 'nordic-forest', 'coastal-mediterranean'].includes(activeSceneryForCamera);
  // Pull camera back further when wall scenery is active so the wall texture frames the window
  const cameraDistMult = hasWallScenery ? 2.2 : 1.35;
  const cameraZ = Math.max(1.6, maxDim * cameraDistMult);

  const controlsTarget = useMemo(() => [0, targetY, 0] as [number, number, number], [targetY]);
  const cameraPosition = useMemo(() => [0, targetY, cameraZ] as [number, number, number], [targetY, cameraZ]);

  const getEnvFiles = (scenery: string) => {
    if (props.typology === 'F100' || props.typology === 'F100T') {
      return '/assets/hdri/monochrome_studio_02_1k.exr';
    }
    switch (scenery) {
      case 'custom':
        return '/assets/hdri/lebombo_1k.hdr';
      case 'studio-grey':
        return '/assets/hdri/studio_small_03_1k.hdr';
      case 'studio-dark':
        return '/assets/hdri/dikhololo_night_1k.hdr';
      case 'modern-minimalist':
        return '/assets/hdri/lebombo_1k.hdr';
      case 'warm-nordic':
        return '/assets/hdri/st_fagans_interior_1k.hdr';
      case 'industrial-loft':
        return '/assets/hdri/empty_warehouse_01_1k.hdr';
      case 'suburban-garden':
        return '/assets/hdri/rooitou_park_1k.hdr';
      case 'nordic-forest':
        return '/assets/hdri/forest_slope_1k.hdr';
      case 'urban-skyline':
        return '/assets/hdri/venice_sunset_1k.hdr';
      case 'coastal-mediterranean':
        return '/assets/hdri/potsdamer_platz_1k.hdr';
      default:
        return '/assets/hdri/lebombo_1k.hdr';
    }
  };

  const getBgColor = (scenery: string) => {
    // F2MPX uses no HDR — always return a solid neutral studio gray
    if (props.typology === 'F2MPX') return '#b8bcc6';
    if (isLight && (scenery === 'studio-grey' || scenery === 'custom')) {
      return '#e2e8f0';
    }
    switch (scenery) {
      case 'custom':
        return '#e2e8f0';
      case 'studio-grey':
        return '#e2e8f0';
      case 'studio-dark':
        return '#111112';
      case 'modern-minimalist':
        return '#f8fafc';
      case 'warm-nordic':
        return '#2d241e';
      case 'industrial-loft':
        return '#1e1b18';
      case 'suburban-garden':
        return '#dbeafe';
      case 'nordic-forest':
        return '#1e293b';
      case 'urban-skyline':
        return '#3b0764';
      case 'coastal-mediterranean':
        return '#bae6fd';
      default:
        return '#f8fafc';
    }
  };

  const activeScenery = props.scenery || 'studio-grey';
  const controlsRef = React.useRef<any>(null);
  const [autoRotate, setAutoRotate] = React.useState(true);

  return (
    <div className="absolute inset-0 cursor-move touch-pan-y">
      <Canvas onDoubleClick={(e) => { e.stopPropagation(); controlsRef.current?.reset(); }} shadows camera={{ position: cameraPosition, fov: 45 }} gl={{ preserveDrawingBuffer: true }}>
        <AdaptiveCamera maxDim={maxDim} targetX={0} targetY={targetY} targetZ={0} angle={0} defaultRadiusMult={cameraDistMult} fov={45} zSign={1} minDistance={1.6} controlsRef={controlsRef} />
        <color attach="background" args={[getBgColor(activeScenery)]} />
        <ambientLight intensity={props.typology === 'F2MPX' ? 0.9 : 0.15} />
        <directionalLight 
          position={[5, 10, 5]} 
          intensity={props.typology === 'F2MPX' ? 1.2 : 0.4} 
          castShadow 
          shadow-mapSize-width={2048} 
          shadow-mapSize-height={2048} 
          shadow-bias={-0.0001} 
        />
        {props.typology === 'F2MPX' ? (
          /* No HDR for F2MPX — avoids async suspend/disappear. Use static fill lights only. */
          <>
            <directionalLight position={[-4, 6, -3]} intensity={0.5} />
            <directionalLight position={[0, -4, 6]}  intensity={0.25} />
          </>
        ) : (
          <Environment 
            files={getEnvFiles(activeScenery)} 
            background={
              !(props.typology === 'F100' || props.typology === 'F100T' || props.typology === 'F2XX1' || props.typology === 'F2MPX') &&
              (activeScenery === 'studio-grey' || activeScenery === 'studio-dark')
            } 
          />
        )}
        
        <WindowAssembly {...props} />
        
        <OrbitControls 
          ref={controlsRef} 
          makeDefault 
          enablePan={true} 
          enableZoom={true} 
          target={controlsTarget} 
          autoRotate={autoRotate}
          autoRotateSpeed={0.5}
          onStart={() => setAutoRotate(false)}
        />
        <ContactShadows position={[0, -0.001, 0]} opacity={0.2} scale={5} blur={2.0} far={10} />
      </Canvas>
    </div>
  );
};

useGLTF.preload('/testhandle.glb');

