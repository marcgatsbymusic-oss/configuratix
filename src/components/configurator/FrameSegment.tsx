import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Evaluator, Brush, SUBTRACTION } from 'three-bvh-csg';

/**
 * uvMode controls how texture coordinates are computed on extruded profiles.
 *
 *  'triplanar' (default)
 *    Side walls: U = uOffset + uSign * pz  (along extrusion)
 *                V = px * 0.707 + py * 0.707  (diagonal X-Y blend)
 *    End caps:   U = py, V = px
 *    Good for large frame profiles where slight diagonal blending is invisible.
 *
 *  'rail'
 *    Side walls: U = uOffset + uSign * pz  (along extrusion — same)
 *                V = dominant perpendicular component based on face normal:
 *                    |nx| > |ny|  →  V = py  (X-facing face, V tracks profile Y)
 *                    |nx| ≤ |ny|  →  V = px  (Y-facing face, V tracks profile depth)
 *    End caps:   U = py, V = px  (same as triplanar)
 *    Use for narrow decorative beads (BZD) where a diagonal V blend looks wrong.
 *    Keeps grain strictly parallel to the extrusion axis on every face.
 */
export type UVMode = 'triplanar' | 'rail';

/**
 * matType controls the material preset applied to this segment.
 *  'ext'    — exterior / frame outer shell  (MeshStandard, mid roughness)
 *  'int'    — interior / sash inner shell   (MeshStandard, mid roughness)
 *  'gsk'    — gasket / seal                 (MeshStandard, very rough, no metal)
 *  'spacer' — aluminium spacer bar          (MeshStandard, moderate metal)
 *  'glass'  — glazing unit                  (MeshPhysical, transparent)
 */
export type MatType = 'ext' | 'int' | 'gsk' | 'spacer' | 'glass';

interface FrameSegmentProps {
  length: number;
  vertices: {x: number, y: number}[];
  /** R3F-native material type — drives a JSX <meshStandardMaterial> child so colors are reactive. */
  matType?: MatType;
  /** Hex color string for this segment.  Defaults vary by matType. */
  color?: string;
  /** URL to the texture image for this segment. */
  textureUrl?: string;
  /** @deprecated Pass color + matType instead. Kept for backward compat only. */
  material?: THREE.Material;
  position?: [number, number, number];
  rotation?: [number, number, number];
  invertCuts?: boolean;
  /** Skip the expensive CSG mitre-cut operation entirely.
   *  Use this for inner sash / post segments whose corners are hidden. */
  skipCuts?: boolean;
  origin?: {x: number, y: number} | null;
  scaleFactor?: number;
  uSign?: number;
  uOffset?: number;
  /** UV projection mode. Default 'triplanar'. Use 'rail' for narrow bead profiles (BZD). */
  uvMode?: UVMode;
  /** Name of the DXF layer this segment originated from, used for performance telemetry. */
  layerName?: string;
}

function applyUVs(
  geometry: THREE.BufferGeometry,
  uSign: number = 1,
  uOffset: number = 0,
  uvMode: UVMode = 'triplanar',
) {
  const posAttr  = geometry.attributes.position;
  const normAttr = geometry.attributes.normal;
  if (!posAttr || !normAttr) return;

  const count = posAttr.count;
  const uvs   = new Float32Array(count * 2);

  for (let i = 0; i < count; i++) {
    const px = posAttr.getX(i);
    const py = posAttr.getY(i);
    const pz = posAttr.getZ(i);

    const nx = normAttr.getX(i);
    const ny = normAttr.getY(i);
    const nz = normAttr.getZ(i);

    let u = 0;
    let v = 0;

    if (Math.abs(nz) > 0.707) {
      // End-cap faces (flat cross-section at each end of the extrusion, including
      // 45° mitre-cut planes): project cross-section onto Y-X plane.
      u = py;
      v = px;
    } else {
      // Side-wall faces (running along the extrusion length).
      // U is always along the extrusion (local Z axis).
      u = uOffset + uSign * pz;

      if (uvMode === 'rail') {
        // Face-normal-aware V: pick the axis that varies most on this face.
        // |nx| > |ny|  → face is roughly X-normal → profile Y varies most → V = py
        // |nx| ≤ |ny|  → face is roughly Y-normal → profile X varies most → V = px
        v = Math.abs(nx) > Math.abs(ny) ? py : px;
      } else {
        // Default triplanar: diagonal blend keeps V continuous across angled faces.
        v = px * 0.707 + py * 0.707;
      }
    }

    uvs[i * 2]     = u;
    uvs[i * 2 + 1] = v;
  }

  geometry.setAttribute('uv',  new THREE.BufferAttribute(uvs, 2));
  geometry.setAttribute('uv2', new THREE.BufferAttribute(uvs, 2));
}

// ─── Inline reactive material ─────────────────────────────────────────────────
// Rendered as JSX children so R3F's reconciler handles color prop changes natively.
function SegmentMaterial({ matType, color, textureUrl }: { matType: MatType; color?: string; textureUrl?: string }) {
  const [maps, setMaps] = React.useState<{ diffuse: THREE.Texture | null; normal: THREE.Texture | null; orm: THREE.Texture | null }>({ diffuse: null, normal: null, orm: null });

  React.useEffect(() => {
    if (textureUrl) {
      const match = textureUrl.match(/\/([^\/]+)\.(jpg|png|webp|jpeg)$/i);
      if (match) {
        let materialName = match[1].replace('-swatch', '');
        // Exceptions mapping
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
          tex.repeat.set(2, 2);
        };

        loader.load(diffusePath, (tex) => {
          configureTexture(tex, THREE.SRGBColorSpace);
          loadedDiffuse = tex;
          onTexLoad();
        }, undefined, () => onTexLoad()); // Catch error

        loader.load(normalPath, (tex) => {
          configureTexture(tex, THREE.NoColorSpace);
          loadedNormal = tex;
          onTexLoad();
        }, undefined, () => onTexLoad()); // Catch error

        loader.load(ormPath, (tex) => {
          configureTexture(tex, THREE.NoColorSpace);
          loadedORM = tex;
          onTexLoad();
        }, undefined, () => onTexLoad()); // Catch error

      } else {
        setMaps({ diffuse: null, normal: null, orm: null });
      }
    } else {
      setMaps({ diffuse: null, normal: null, orm: null });
    }
  }, [textureUrl]);

  const texture = maps.diffuse;
  const matColor = texture ? '#ffffff' : (color ?? '#e8e0d4');

  if (matType === 'glass') {
    return (
      <meshPhysicalMaterial
        color="#e0e8f0"
        metalness={0.1}
        roughness={0.05}
        transmission={0.9}
        ior={1.5}
        thickness={5 * 0.001}
        transparent
        opacity={0.8}
      />
    );
  }
  if (matType === 'gsk') {
    return (
      <meshStandardMaterial
        color={color ?? '#1c1c1c'}
        roughness={0.8}
        metalness={0.0}
      />
    );
  }
  if (matType === 'spacer') {
    return (
      <meshStandardMaterial
        color={color ?? '#4B4B4D'}
        roughness={0.5}
        metalness={0.6}
      />
    );
  }
  if (matType === 'int') {
    return (
      <meshStandardMaterial
        color={texture ? '#ffffff' : (color ?? '#f0ece6')}
        map={texture || undefined}
        normalMap={maps.normal || undefined}
        aoMap={maps.orm || undefined}
        roughnessMap={maps.orm || undefined}
        metalnessMap={maps.orm || undefined}
        roughness={texture ? 1 : 0.42}
        metalness={texture ? 1 : 0.04}
      />
    );
  }
  // default: 'ext'
  return (
    <meshStandardMaterial
      color={matColor}
      map={texture || undefined}
      normalMap={maps.normal || undefined}
      aoMap={maps.orm || undefined}
      roughnessMap={maps.orm || undefined}
      metalnessMap={maps.orm || undefined}
      roughness={texture ? 1 : 0.42}
      metalness={texture ? 1 : 0.04}
    />
  );
}

// Global geometry cache to prevent re-computing identical CSG cuts for the same lengths (e.g. 4 sides of a square window)
// Format: "layerName_length_invertCuts_skipCuts_scaleFactor_uSign_uOffset_uvMode"
const geometryCache = new Map<string, THREE.BufferGeometry>();

export const FrameSegment: React.FC<FrameSegmentProps> = ({
  length,
  vertices,
  matType,
  color,
  textureUrl,
  material,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  invertCuts = false,
  skipCuts   = false,
  origin     = null,
  scaleFactor = 1,
  uSign   = 1,
  uOffset = 0,
  uvMode  = 'triplanar',
  layerName,
}) => {
  const geometry = useMemo(() => {
    if (!vertices || vertices.length === 0) return new THREE.BufferGeometry();

    // Calculate bounds first so we can include them in the cache key to prevent collisions 
    // between different profiles that happen to have the same vertex count (e.g. gaskets).
    let minX =  Infinity, minY =  Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    for (const v of vertices) {
      if (v.x < minX) minX = v.x;
      if (v.y < minY) minY = v.y;
      if (v.x > maxX) maxX = v.x;
      if (v.y > maxY) maxY = v.y;
    }

    const cacheKey = `${layerName || matType}_${length}_${invertCuts}_${skipCuts}_${scaleFactor}_${uSign}_${uOffset}_${uvMode}_${vertices.length}_${Math.round(minX)}_${Math.round(minY)}`;
    if (geometryCache.has(cacheKey)) {
      return geometryCache.get(cacheKey)!;
    }

    const ox = origin ? origin.x : minX;
    const oy = origin ? origin.y : minY;

    const shape = new THREE.Shape();
    shape.moveTo((vertices[0].x - ox) * scaleFactor, (vertices[0].y - oy) * scaleFactor);
    for (let i = 1; i < vertices.length; i++) {
      shape.lineTo((vertices[i].x - ox) * scaleFactor, (vertices[i].y - oy) * scaleFactor);
    }
    shape.lineTo((vertices[0].x - ox) * scaleFactor, (vertices[0].y - oy) * scaleFactor);

    const scaledLength = length * scaleFactor;
    // Extrude extra to ensure CSG cuts cleanly through side-walls. 
    // Must be scaled by scaleFactor and large enough (200mm) to reach 
    // the 45-degree cut plane even for deeply inset profiles like sash gaskets.
    const extra = skipCuts ? 0 : (200 * scaleFactor); 
    const baseGeo = new THREE.ExtrudeGeometry(shape, { depth: scaledLength + extra * 2, bevelEnabled: false });
    if (extra > 0) {
      baseGeo.translate(0, 0, -extra);
    }

    // ── Fast path: no CSG ──────────────────────────────────────────────────
    if (skipCuts) {
      applyUVs(baseGeo, uSign, uOffset, uvMode);
      baseGeo.clearGroups();
      baseGeo.computeBoundingBox();
      baseGeo.computeBoundingSphere();
      return baseGeo;
    }

    // ── CSG mitre cuts ─────────────────────────────────────────────────────
    const t0 = performance.now();
    const widthX  = (maxX - minX) * scaleFactor;
    const heightY = (maxY - minY) * scaleFactor;
    const boxSize = Math.max(widthX, heightY, scaledLength) * 10;

    const baseBrush = new Brush(baseGeo);
    baseBrush.updateMatrixWorld();

    const evaluator = new Evaluator();
    const boxGeo    = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
    const sign      = invertCuts ? -1 : 1;

    // Left cut (z = 0 end)
    const leftBrush = new Brush(boxGeo);
    leftBrush.position.set(0, 0, 0);
    leftBrush.rotation.x = (Math.PI / 4) * sign;
    leftBrush.translateZ(-boxSize / 2);
    leftBrush.updateMatrixWorld();
    let result = evaluator.evaluate(baseBrush, leftBrush, SUBTRACTION);

    // Right cut (z = scaledLength end)
    const rightBrush = new Brush(boxGeo);
    rightBrush.position.set(0, 0, scaledLength);
    rightBrush.rotation.x = (-Math.PI / 4) * sign;
    rightBrush.translateZ(boxSize / 2);
    rightBrush.updateMatrixWorld();
    result = evaluator.evaluate(result, rightBrush, SUBTRACTION);

    const geo = result.geometry;
    applyUVs(geo, uSign, uOffset, uvMode);
    geo.clearGroups();
    geo.computeBoundingBox();
    geo.computeBoundingSphere();
    
    const t1 = performance.now();
    const duration = t1 - t0;
    console.log(`[CSG Performance] ${layerName || matType || 'unknown'} segment (len: ${length}) took ${duration.toFixed(2)}ms. Vertices count: ${vertices.length}`);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('csg-performance', { detail: { duration, vertices: vertices.length, matType, layerName, length } }));
    }
    
    geometryCache.set(cacheKey, geo);
    return geo;
  }, [length, vertices, invertCuts, skipCuts, scaleFactor, uSign, uOffset, uvMode, matType, layerName]);

  // If a legacy THREE.Material object is passed, use the old imperative path.
  if (material && !matType) {
    return (
      <mesh
        geometry={geometry}
        material={material}
        position={position}
        rotation={rotation}
        castShadow
        receiveShadow
      />
    );
  }

  // New reactive path: material rendered as R3F JSX child so color changes propagate.
  return (
    <mesh
      geometry={geometry}
      position={position}
      rotation={rotation}
      castShadow
      receiveShadow
    >
      <SegmentMaterial matType={matType ?? 'ext'} color={color} textureUrl={textureUrl} />
    </mesh>
  );
};
