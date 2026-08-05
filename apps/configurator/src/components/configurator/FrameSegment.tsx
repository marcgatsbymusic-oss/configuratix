import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Evaluator, Brush, SUBTRACTION, INTERSECTION } from 'three-bvh-csg';

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
  vertices?: {x: number, y: number}[];
  loops?: { closed: boolean; pts: { x: number; y: number }[] }[];
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
  /** Per-end invert overrides. When set they take priority over invertCuts for that end. */
  invertLeftCut?: boolean;
  invertRightCut?: boolean;
  /** Y-offset applied to the cut brush before rotation, in scene units.
   *  Use to shift the mitre plane for profiles whose contours are not at y=0.
   *  e.g. top horizontal uses leftCutYOffset = CAD_HEIGHT * scaleFactor to
   *  position the cut plane at World_Y = H instead of World_Y = deltaY. */
  leftCutYOffset?: number;
  rightCutYOffset?: number;
  /** Skip the expensive CSG mitre-cut operation entirely.
   *  Use this for inner sash / post segments whose corners are hidden. */
  skipCuts?: boolean;
  skipLeftCut?: boolean;
  skipRightCut?: boolean;
  /** Axis around which the CSG mitre-cut box rotates.
   *  'x' (default): horizontal segments — cut tilts in the YZ plane.
   *  'y': vertical segments — cut tilts in the XY plane for a plan-view 45° mitre. */
  cutAxis?: 'x' | 'y';
  origin?: {x: number, y: number} | null;
  scaleFactor?: number;
  uSign?: number;
  uOffset?: number;
  /** UV projection mode. Default 'triplanar'. Use 'rail' for narrow bead profiles (BZD). */
  uvMode?: UVMode;
  /** Name of the DXF layer this segment originated from, used for performance telemetry. */
  layerName?: string;
  compositeCut?: boolean;
  mitredLeft?: boolean;
  mitredRight?: boolean;
}

export function applyUVs(
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

    if (Math.abs(nz) > 0.5) {
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

export function getOuterEdgeY(layerName: string): number {
  return 0; // Deprecated. Use origin.y directly instead.
}

export function buildLoftedGeometry(
  vertices: { x: number; y: number }[],
  length: number,
  scaleFactor: number,
  oy: number,
  ox: number,
  mitredLeft: boolean,
  mitredRight: boolean,
): THREE.BufferGeometry {
  const pos: number[] = [];
  const push = (x: number, y: number, z: number) => pos.push(x, y, z);
  const N = vertices.length;

  const scaledLength = length * scaleFactor;

  const mapPoint = (p: { x: number; y: number }, end: 'A' | 'B'): [number, number, number] => {
    const lx = (p.x - ox) * scaleFactor;
    const ly = (p.y - oy) * scaleFactor;
    const u = Math.max(0, (p.y - oy) * scaleFactor);
    if (end === 'A') {
      return [lx, ly, mitredLeft ? u : 0];
    } else {
      return [lx, ly, mitredRight ? scaledLength - u : scaledLength];
    }
  };

  // 1. Side walls
  for (let i = 0; i < N; i++) {
    const j = (i + 1) % N;
    const a0 = mapPoint(vertices[i], 'A');
    const a1 = mapPoint(vertices[j], 'A');
    const b0 = mapPoint(vertices[i], 'B');
    const b1 = mapPoint(vertices[j], 'B');

    push(...a0); push(...a1); push(...b1);
    push(...a0); push(...b1); push(...b0);
  }

  // 2. End caps
  const contour = vertices.map(p => new THREE.Vector2(p.x, p.y));
  const tris = THREE.ShapeUtils.triangulateShape(contour, []);
  for (const [i, j, k] of tris) {
    const aI = mapPoint(vertices[i], 'A');
    const aJ = mapPoint(vertices[j], 'A');
    const aK = mapPoint(vertices[k], 'A');

    const bI = mapPoint(vertices[i], 'B');
    const bJ = mapPoint(vertices[j], 'B');
    const bK = mapPoint(vertices[k], 'B');

    push(...aI); push(...aK); push(...aJ);
    push(...bI); push(...bJ); push(...bK);
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

function signedArea(pts: { x: number; y: number }[]): number {
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    const p1 = pts[i];
    const p2 = pts[(i + 1) % pts.length];
    s += p1.x * p2.y - p2.x * p1.y;
  }
  return s / 2;
}

function centroid(pts: { x: number; y: number }[]): [number, number] {
  let x = 0, y = 0;
  for (const p of pts) { x += p.x; y += p.y; }
  return [x / pts.length, y / pts.length];
}

function pointInPolygon(pt: [number, number], pts: { x: number; y: number }[]): boolean {
  const [px, py] = pt;
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i].x, yi = pts[i].y;
    const xj = pts[j].x, yj = pts[j].y;
    if (((yi > py) !== (yj > py)) &&
        (px < ((xj - xi) * (py - yi)) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
}

function classifyLoops(loops: { closed: boolean; pts: { x: number; y: number }[] }[]) {
  const closed = loops.map((L, i) => ({ i, pts: L.pts, closed: L.closed }))
                      .filter(L => L.closed && L.pts.length >= 3);
  if (!closed.length) return { outer: -1, holes: [] as number[] };
  let outer = closed[0];
  let best = Math.abs(signedArea(outer.pts));
  for (const c of closed) {
    const a = Math.abs(signedArea(c.pts));
    if (a > best) {
      best = a;
      outer = c;
    }
  }
  const holes = closed
    .filter(c => c.i !== outer.i && pointInPolygon(centroid(c.pts), outer.pts))
    .map(c => c.i);
  return { outer: outer.i, holes };
}

function orient(pts: { x: number; y: number }[], wantCCW: boolean): { x: number; y: number }[] {
  const ccw = signedArea(pts) > 0;
  return ccw === wantCCW ? pts.slice() : pts.slice().reverse();
}

// ─── Inline reactive material ─────────────────────────────────────────────────
// Rendered as JSX children so R3F's reconciler handles color prop changes natively.
export function SegmentMaterial({ matType, color, textureUrl }: { matType: MatType; color?: string; textureUrl?: string }) {
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
        color="#d4eaf5"
        metalness={0.1}
        roughness={0.05}
        transmission={0.92}
        ior={1.52}
        thickness={6 * 0.001}
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
      <meshPhysicalMaterial
        color={texture ? '#ffffff' : (color ?? '#f5f4f0')}
        map={texture || undefined}
        normalMap={maps.normal || undefined}
        aoMap={maps.orm || undefined}
        roughnessMap={maps.orm || undefined}
        metalnessMap={maps.orm || undefined}
        roughness={texture ? 1 : 0.3}
        metalness={texture ? 0.1 : 0.0}
        envMapIntensity={0.8}
      />
    );
  }
  // default: 'ext'
  return (
    <meshPhysicalMaterial
      color={texture ? '#ffffff' : (color ?? '#f5f4f0')}
      map={texture || undefined}
      normalMap={maps.normal || undefined}
      aoMap={maps.orm || undefined}
      roughnessMap={maps.orm || undefined}
      metalnessMap={maps.orm || undefined}
      roughness={texture ? 1 : 0.3}
      metalness={texture ? 0.1 : 0.0}
      envMapIntensity={0.8}
    />
  );
}

// Global geometry cache to prevent re-computing identical CSG cuts for the same lengths (e.g. 4 sides of a square window)
// Format: "layerName_length_invertCuts_skipCuts_scaleFactor_uSign_uOffset_uvMode"
const geometryCache = new Map<string, THREE.BufferGeometry>();

export const FrameSegment = React.memo(FrameSegmentComponent, (prev, next) => {
  return prev.layerName === next.layerName && 
         prev.length === next.length && 
         prev.matType === next.matType &&
         prev.color === next.color &&
         prev.textureUrl === next.textureUrl &&
         prev.material === next.material &&
         prev.uSign === next.uSign &&
         prev.uOffset === next.uOffset &&
         prev.skipLeftCut === next.skipLeftCut &&
         prev.skipRightCut === next.skipRightCut &&
         prev.invertCuts === next.invertCuts &&
         prev.invertLeftCut === next.invertLeftCut &&
         prev.invertRightCut === next.invertRightCut &&
         prev.leftCutYOffset === next.leftCutYOffset &&
         prev.rightCutYOffset === next.rightCutYOffset &&
         prev.cutAxis === next.cutAxis &&
         prev.compositeCut === next.compositeCut &&
         prev.mitredLeft === next.mitredLeft &&
         prev.mitredRight === next.mitredRight &&
         prev.loops === next.loops;
});

function FrameSegmentComponent({
  length,
  vertices,
  loops,
  matType,
  color,
  textureUrl,
  material,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  invertCuts = false,
  invertLeftCut,
  invertRightCut,
  leftCutYOffset = 0,
  rightCutYOffset = 0,
  skipCuts   = false,
  skipLeftCut = false,
  skipRightCut = false,
  cutAxis = 'x',
  origin     = null,
  scaleFactor = 1,
  uSign   = 1,
  uOffset = 0,
  uvMode  = 'triplanar',
  layerName,
  compositeCut = false,
  mitredLeft,
  mitredRight,
}: FrameSegmentProps) {
  console.log(`[FrameSegment Debug] layerName=${layerName || matType} skipCuts=${skipCuts} skipLeftCut=${skipLeftCut} skipRightCut=${skipRightCut} length=${length}`);
  const geometry = useMemo(() => {
    const hasLoops = loops && loops.length > 0;
    const hasVertices = vertices && vertices.length > 0;
    if (!hasLoops && !hasVertices) return new THREE.BufferGeometry();

    // Calculate bounds first so we can include them in the cache key to prevent collisions 
    // between different profiles that happen to have the same vertex count (e.g. gaskets).
    let minX =  Infinity, minY =  Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    if (hasLoops) {
      for (const L of loops!) {
        for (const v of L.pts) {
          if (v.x < minX) minX = v.x;
          if (v.y < minY) minY = v.y;
          if (v.x > maxX) maxX = v.x;
          if (v.y > maxY) maxY = v.y;
        }
      }
    } else {
      for (const v of vertices!) {
        if (v.x < minX) minX = v.x;
        if (v.y < minY) minY = v.y;
        if (v.x > maxX) maxX = v.x;
        if (v.y > maxY) maxY = v.y;
      }
    }

    // Per-end sign: invertLeftCut/invertRightCut override the global invertCuts per end
    const leftSign  = (invertLeftCut  !== undefined ? invertLeftCut  : invertCuts) ? -1 : 1;
    const rightSign = (invertRightCut !== undefined ? invertRightCut : invertCuts) ? -1 : 1;
    
    const totalVerts = hasLoops ? loops!.reduce((acc, L) => acc + L.pts.length, 0) : vertices!.length;
    const cacheKey = `${layerName || matType}_${length}_${leftSign}_${rightSign}_${cutAxis}_${skipCuts}_${skipLeftCut}_${skipRightCut}_${leftCutYOffset.toFixed(4)}_${rightCutYOffset.toFixed(4)}_${scaleFactor}_${uSign}_${uOffset}_${uvMode}_${totalVerts}_${Math.round(minX)}_${Math.round(minY)}_${Math.round(maxX)}_${Math.round(maxY)}_${compositeCut}_${mitredLeft}_${mitredRight}`;
    if (geometryCache.has(cacheKey)) {
      return geometryCache.get(cacheKey)!;
    }

    if (mitredLeft !== undefined || mitredRight !== undefined) {
      const oy = origin ? origin.y : 0;
      const ox = origin ? origin.x : 0;
      const loftVertices = hasLoops ? orient(loops!.find((_, idx) => idx === classifyLoops(loops!).outer)?.pts || [], true) : vertices!;
      const geo = buildLoftedGeometry(
        loftVertices,
        length,
        scaleFactor,
        oy,
        ox,
        !!mitredLeft,
        !!mitredRight
      );
      applyUVs(geo, uSign, uOffset, uvMode);
      geo.clearGroups();
      geo.computeBoundingBox();
      geo.computeBoundingSphere();
      geometryCache.set(cacheKey, geo);
      return geo;
    }

    const ox = origin ? origin.x : minX;
    const oy = origin ? origin.y : minY;

    const shape = new THREE.Shape();
    if (hasLoops) {
      const { outer, holes } = classifyLoops(loops!);
      if (outer >= 0) {
        const outerPts = orient(loops![outer].pts, true);
        shape.moveTo((outerPts[0].x - ox) * scaleFactor, (outerPts[0].y - oy) * scaleFactor);
        for (let i = 1; i < outerPts.length; i++) {
          shape.lineTo((outerPts[i].x - ox) * scaleFactor, (outerPts[i].y - oy) * scaleFactor);
        }
        shape.lineTo((outerPts[0].x - ox) * scaleFactor, (outerPts[0].y - oy) * scaleFactor);

        for (const h of holes) {
          const holePts = orient(loops![h].pts, false);
          const path = new THREE.Path();
          path.moveTo((holePts[0].x - ox) * scaleFactor, (holePts[0].y - oy) * scaleFactor);
          for (let i = 1; i < holePts.length; i++) {
            path.lineTo((holePts[i].x - ox) * scaleFactor, (holePts[i].y - oy) * scaleFactor);
          }
          path.lineTo((holePts[0].x - ox) * scaleFactor, (holePts[0].y - oy) * scaleFactor);
          shape.holes.push(path);
        }
      }
    } else {
      shape.moveTo((vertices![0].x - ox) * scaleFactor, (vertices![0].y - oy) * scaleFactor);
      for (let i = 1; i < vertices!.length; i++) {
        shape.lineTo((vertices![i].x - ox) * scaleFactor, (vertices![i].y - oy) * scaleFactor);
      }
      shape.lineTo((vertices![0].x - ox) * scaleFactor, (vertices![0].y - oy) * scaleFactor);
    }

    const scaledLength = length * scaleFactor;
    // Extrude extra only for the ends that are actually being cut, to ensure CSG cuts cleanly through side-walls.
    // If a cut is skipped on an end, we must not add extra geometry to that end, otherwise it will protrude.
    const leftExtra = (skipCuts || skipLeftCut) ? 0 : (200 * scaleFactor);
    const rightExtra = (skipCuts || skipRightCut) ? 0 : (200 * scaleFactor);
    const baseGeo = new THREE.ExtrudeGeometry(shape, { depth: scaledLength + leftExtra + rightExtra, bevelEnabled: false });
    if (leftExtra > 0) {
      baseGeo.translate(0, 0, -leftExtra);
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

    let result = baseBrush;

    // Left cut (z = 0 end) — uses leftSign and leftCutYOffset
    if (!skipLeftCut) {
      const leftBrush = new Brush(boxGeo);
      leftBrush.position.set(0, leftCutYOffset, 0);
      if (cutAxis === 'y') {
        leftBrush.rotation.y = (Math.PI / 4) * leftSign;
      } else {
        leftBrush.rotation.x = (Math.PI / 4) * leftSign;
      }
      leftBrush.translateZ(-boxSize / 2);
      leftBrush.updateMatrixWorld();

      if (compositeCut && cutAxis === 'x') {
        // Define standard sash boundary
        let boundary = 114;
        if (layerName?.includes('INT')) {
          boundary = 94;
        } else if (layerName?.includes('SPACER')) {
          boundary = 110;
        }
        const boundaryUnits = (boundary - oy) * scaleFactor;

        // 1. Intersect standard mitre brush with limit box covering y <= boundaryUnits
        const limitBrush = new Brush(boxGeo);
        limitBrush.position.set(0, boundaryUnits - boxSize / 2, 0);
        limitBrush.updateMatrixWorld();

        const mitreBrush = evaluator.evaluate(leftBrush, limitBrush, INTERSECTION);

        // Subtract standard mitre from result
        result = evaluator.evaluate(result, mitreBrush, SUBTRACTION);

        // 2. Subtract square box covering y > boundaryUnits and z < 56 * scaleFactor
        const squareBrush = new Brush(boxGeo);
        squareBrush.position.set(
          0,
          boundaryUnits + boxSize / 2,
          56 * scaleFactor - boxSize / 2
        );
        squareBrush.updateMatrixWorld();

        result = evaluator.evaluate(result, squareBrush, SUBTRACTION);
      } else {
        result = evaluator.evaluate(result, leftBrush, SUBTRACTION);
      }
    }

    // Right cut (z = scaledLength end) — uses rightSign and rightCutYOffset
    if (!skipRightCut) {
      const rightBrush = new Brush(boxGeo);
      rightBrush.position.set(0, rightCutYOffset, scaledLength);
      if (cutAxis === 'y') {
        rightBrush.rotation.y = (-Math.PI / 4) * rightSign;
      } else {
        rightBrush.rotation.x = (-Math.PI / 4) * rightSign;
      }
      rightBrush.translateZ(boxSize / 2);
      rightBrush.updateMatrixWorld();

      if (compositeCut && cutAxis === 'x') {
        // Define standard sash boundary
        let boundary = 114;
        if (layerName?.includes('INT')) {
          boundary = 94;
        } else if (layerName?.includes('SPACER')) {
          boundary = 110;
        }
        const boundaryUnits = (boundary - oy) * scaleFactor;

        // 1. Intersect standard mitre brush with limit box covering y <= boundaryUnits
        const limitBrush = new Brush(boxGeo);
        limitBrush.position.set(0, boundaryUnits - boxSize / 2, scaledLength);
        limitBrush.updateMatrixWorld();

        const mitreBrush = evaluator.evaluate(rightBrush, limitBrush, INTERSECTION);

        // Subtract standard mitre from result
        result = evaluator.evaluate(result, mitreBrush, SUBTRACTION);

        // 2. Subtract square box covering y > boundaryUnits and z > scaledLength - 56 * scaleFactor
        const squareBrush = new Brush(boxGeo);
        squareBrush.position.set(
          0,
          boundaryUnits + boxSize / 2,
          scaledLength - 56 * scaleFactor + boxSize / 2
        );
        squareBrush.updateMatrixWorld();

        result = evaluator.evaluate(result, squareBrush, SUBTRACTION);
      } else {
        result = evaluator.evaluate(result, rightBrush, SUBTRACTION);
      }
    }

    const geo = result.geometry;
    applyUVs(geo, uSign, uOffset, uvMode);
    geo.clearGroups();
    geo.computeBoundingBox();
    geo.computeBoundingSphere();
    
    const t1 = performance.now();
    const duration = t1 - t0;
    console.log(`[CSG Performance] ${layerName || matType || 'unknown'} segment (len: ${length}) took ${duration.toFixed(2)}ms. Vertices count: ${totalVerts}`);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('csg-performance', { detail: { duration, vertices: totalVerts, matType, layerName, length } }));
    }
    
    geometryCache.set(cacheKey, geo);
    return geo;
  }, [length, vertices, loops, invertCuts, invertLeftCut, invertRightCut, leftCutYOffset, rightCutYOffset, cutAxis, skipCuts, skipLeftCut, skipRightCut, scaleFactor, uSign, uOffset, uvMode, matType, layerName, compositeCut, mitredLeft, mitredRight]);

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
