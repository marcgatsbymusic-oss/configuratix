import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { PROFILES } from './f252_profiles';
import { HANDLE } from './f252_handle';

export interface F252Options {
  TopSectionHeight: number;
  BottomSectionHeight: number;
  W?: number;
  isMirrored?: boolean;
  OperableSection?: 'Top' | 'Bottom';
}

export interface F252Geometries {
  W: number;
  H: number;
  sashGroupOrigin: [number, number, number];
  frameMeshes: { geom: THREE.BufferGeometry; matKey: string }[];
  transomMeshes: { geom: THREE.BufferGeometry; matKey: string }[];
  fixedMeshes: { geom: THREE.BufferGeometry; matKey: string }[];
  sashMeshes: { geom: THREE.BufferGeometry; matKey: string }[];
  handleGripMesh: THREE.BufferGeometry | null;
  handleBaseMesh: THREE.BufferGeometry | null;
  handlePos: [number, number, number];
}

export function buildF252Geometries(opts: F252Options): F252Geometries {
  const W = opts.W || 850;
  const H = opts.TopSectionHeight + opts.BottomSectionHeight;
  
  if (opts.BottomSectionHeight < 200) {
    throw new Error('[F252] BottomSectionHeight must be >= 200mm');
  }

  // Base logic builds with Sash on Top
  const TAXIS = opts.BottomSectionHeight;
  const TFACE = 84;
  const SM = 38;
  const LAP = 28;
  const TIN = 44;
  const TR_GLZ = TAXIS - 26;
  const tTop = TAXIS + TFACE / 2;
  const tBot = TAXIS - TFACE / 2;
  const sashBot = tTop - LAP;

  const frameMeshes: { geom: THREE.BufferGeometry; matKey: string }[] = [];
  const transomMeshes: { geom: THREE.BufferGeometry; matKey: string }[] = [];
  const fixedMeshes: { geom: THREE.BufferGeometry; matKey: string }[] = [];
  const sashMeshes: { geom: THREE.BufferGeometry; matKey: string }[] = [];

  const requiredProfiles = ['FRM_EXT', 'FRM_INT', 'SSH_EXT', 'SSH_INT', 'POST_EXT', 'POST_INT'];
  for (const p of requiredProfiles) {
    if (!PROFILES[p as keyof typeof PROFILES] || PROFILES[p as keyof typeof PROFILES].length < 8) {
      throw new Error(`[F252] Profile ${p} missing or < 8 points. Validation failed.`);
    }
  }

  function triangulate(poly: number[][]) {
    try {
      const shape = new THREE.Shape();
      shape.moveTo(poly[0][0], poly[0][1]);
      for (let i = 1; i < poly.length; i++) {
        shape.lineTo(poly[i][0], poly[i][1]);
      }
      const geom = new THREE.ShapeGeometry(shape);
      const indices = geom.getIndex()?.array;
      if (indices) {
        const faces: number[][] = [];
        for (let i = 0; i < indices.length; i += 3) {
          faces.push([indices[i], indices[i+1], indices[i+2]]);
        }
        return faces;
      }
    } catch (e) {
      console.warn('Triangulation failed, using fallback', e);
    }
    const f = []; 
    for (let i = 1; i < poly.length - 1; i++) f.push([0, i, i + 1]); 
    return f;
  }

  const Z = [0,0,1], Xp = [1,0,0], Xn = [-1,0,0], Yp = [0,1,0], Yn = [0,-1,0];

  function buildMemberGeom(name: string, zStart: (r:number)=>number, zEnd: (r:number)=>number, xa: number[], ya: number[], za: number[], pos: number[]) {
    const poly = PROFILES[name as keyof typeof PROFILES]; 
    if (!poly) throw new Error('[F252] missing profile ' + name);
    const n = poly.length;
    const faces = triangulate(poly);
    const Mx = new THREE.Matrix4().makeBasis(
      new THREE.Vector3(xa[0], xa[1], xa[2]),
      new THREE.Vector3(ya[0], ya[1], ya[2]),
      new THREE.Vector3(za[0], za[1], za[2])
    );
    Mx.setPosition(new THREE.Vector3(pos[0], pos[1], pos[2]));
    const positions: number[] = [];
    const uvs: number[] = [];
    const tmp = new THREE.Vector3();
      
    const perim: number[] = [0];
    for(let i=1; i<n; i++) {
       perim.push(perim[i-1] + Math.hypot(poly[i][0]-poly[i-1][0], poly[i][1]-poly[i-1][1]));
    }

    for (let i = 0; i < n; i++) {
      const dx = poly[i][0], rev = poly[i][1];
      const u = perim[i];
      
      tmp.set(dx, rev, zStart(rev)).applyMatrix4(Mx); 
      positions.push(tmp.x, tmp.y, tmp.z);
      uvs.push(zStart(rev), u);
      
      tmp.set(dx, rev, zEnd(rev)).applyMatrix4(Mx);   
      positions.push(tmp.x, tmp.y, tmp.z);
      uvs.push(zEnd(rev), u);
    }
    const idx: number[] = [];
    const Sd = (i:number) => 2*i, Ed = (i:number) => 2*i + 1;
    for (const f of faces) {
      idx.push(Sd(f[0]), Sd(f[2]), Sd(f[1]));
      idx.push(Ed(f[0]), Ed(f[1]), Ed(f[2]));
    }
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      idx.push(Sd(i), Ed(i), Ed(j)); idx.push(Sd(i), Ed(j), Sd(j));
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    g.setIndex(idx); 
    g.computeVertexNormals();
    return g;
  }

  function mitreRing(target: typeof frameMeshes, name: string, x0: number, y0: number, x1: number, y1: number, R: number, mk: string) {
    const D = (r:number) => r - R;
    target.push({ geom: buildMemberGeom(name, r => y0 + D(r), r => y1 - D(r), Z, Xp, Yp, [x0 - R, 0, 0]), matKey: mk });
    target.push({ geom: buildMemberGeom(name, r => y0 + D(r), r => y1 - D(r), Z, Xn, Yp, [x1 + R, 0, 0]), matKey: mk });
    target.push({ geom: buildMemberGeom(name, r => x0 + D(r), r => x1 - D(r), Z, Yp, Xp, [0, y0 - R, 0]), matKey: mk });
    target.push({ geom: buildMemberGeom(name, r => x0 + D(r), r => x1 - D(r), Z, Yn, Xp, [0, y1 + R, 0]), matKey: mk });
  }

  function uRing(target: typeof frameMeshes, name: string, x0: number, y0: number, x1: number, R: number, yTop: number, mk: string) {
    const D = (r:number) => r - R;
    target.push({ geom: buildMemberGeom(name, r => x0 + D(r), r => x1 - D(r), Z, Yp, Xp, [0, y0 - R, 0]), matKey: mk });
    target.push({ geom: buildMemberGeom(name, r => y0 + D(r), r => yTop,      Z, Xp, Yp, [x0 - R, 0, 0]), matKey: mk });
    target.push({ geom: buildMemberGeom(name, r => y0 + D(r), r => yTop,      Z, Xn, Yp, [x1 + R, 0, 0]), matKey: mk });
  }

  function box(w: number, h: number, d: number, cx: number, cy: number, cz: number) {
    const g = new THREE.BoxGeometry(w, h, d);
    g.translate(cx, cy, cz);
    return g;
  }

  function ringBoxes(target: typeof frameMeshes, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, wd: number, mk: string) {
    const cz = (z0 + z1) / 2, d = z1 - z0;
    target.push({ geom: box(wd, y1 - y0, d, x0 + wd/2, (y0 + y1)/2, cz), matKey: mk });
    target.push({ geom: box(wd, y1 - y0, d, x1 - wd/2, (y0 + y1)/2, cz), matKey: mk });
    target.push({ geom: box(x1 - x0, wd, d, (x0 + x1)/2, y0 + wd/2, cz), matKey: mk });
    target.push({ geom: box(x1 - x0, wd, d, (x0 + x1)/2, y1 - wd/2, cz), matKey: mk });
  }

  // FRAME
  [['FRM_EXT','ext'],['FRM_INT','int'],['GSK_FRM','gsk']].forEach(([lp, mk]) => {
    frameMeshes.push({ geom: buildMemberGeom(lp, r => r, r => H - r, Z, Xp, Yp, [0, 0, 0]), matKey: mk });
    frameMeshes.push({ geom: buildMemberGeom(lp, r => r, r => H - r, Z, Xn, Yp, [W, 0, 0]), matKey: mk });
    frameMeshes.push({ geom: buildMemberGeom(lp, r => r, r => W - r, Z, Yp, Xp, [0, 0, 0]), matKey: mk });
    frameMeshes.push({ geom: buildMemberGeom(lp, r => r, r => W - r, Z, Yn, Xp, [0, H, 0]), matKey: mk });
  });

  // TRANSOM
  [['POST_EXT','ext'],['POST_INT','int'],['GSK_POST_A','gsk'],['GSK_POST_B','gsk']].forEach(([lp, mk]) => {
    transomMeshes.push({ geom: buildMemberGeom(lp, r => TIN, r => W - TIN, Z, Yp, Xp, [0, TAXIS - 65, 0]), matKey: mk });
  });

  // FIXED GLAZING (Bottom)
  uRing(fixedMeshes, 'BZD_FRM',     40, 40, W - 40, 40, TR_GLZ,     'int');
  uRing(fixedMeshes, 'GSK_BZD_FRM', 56, 56, W - 56, 56, TR_GLZ - 6, 'gsk');
  fixedMeshes.push({ geom: buildMemberGeom('BZD_POST',     r => TIN, r => W - TIN, Z, Yp, Xp, [0, TAXIS - 65, 0]), matKey: 'int' });
  fixedMeshes.push({ geom: buildMemberGeom('GSK_BZD_POST', r => TIN, r => W - TIN, Z, Yp, Xp, [0, TAXIS - 65, 0]), matKey: 'gsk' });
  
  fixedMeshes.push({ geom: box(W - 100, TR_GLZ - 50, 24, W/2, (50 + TR_GLZ)/2, 31), matKey: 'glass' });
  ringBoxes(fixedMeshes, 50, W - 50, 50, TR_GLZ, 23, 39, 14, 'spacer');

  // SASH (Top)
  [['SSH_EXT','ext'],['SSH_INT','int'],['GSK_SSH_EXT','gsk'],['GSK_SSH_INT','gsk']].forEach(([lp, mk]) => {
    sashMeshes.push({ geom: buildMemberGeom(lp, r => sashBot + (r - SM), r => H - r, Z, Xp, Yp, [0, 0, 0]), matKey: mk });
    sashMeshes.push({ geom: buildMemberGeom(lp, r => sashBot + (r - SM), r => H - r, Z, Xn, Yp, [W, 0, 0]), matKey: mk });
    sashMeshes.push({ geom: buildMemberGeom(lp, r => r, r => W - r, Z, Yn, Xp, [0, H, 0]), matKey: mk });
    sashMeshes.push({ geom: buildMemberGeom(lp, r => r, r => W - r, Z, Yp, Xp, [0, sashBot - SM, 0]), matKey: mk });
  });

  mitreRing(sashMeshes, 'BZD_SSH',     90,  sashBot + 52, W - 90,  H - 90,  90,  'int');
  mitreRing(sashMeshes, 'GSK_BZD_SSH', 106, sashBot + 68, W - 106, H - 106, 106, 'gsk');
  
  sashMeshes.push({ geom: box(W - 200, (H - 100) - (sashBot + 62), 24, W/2, (sashBot + 62 + H - 100)/2, 50), matKey: 'glass' });
  ringBoxes(sashMeshes, 100, W - 100, sashBot + 62, H - 100, 42, 58, 14, 'spacer');

  // HANDLE SPLIT (Base vs Grip)
  const sashMidY = (sashBot + (H - SM)) / 2;
  const gripIndices: number[] = [];
  const baseIndices: number[] = [];
  if (HANDLE.f) {
    for (let i = 0; i < HANDLE.f.length; i += 3) {
      const z1 = HANDLE.v[HANDLE.f[i]*3+2];
      const z2 = HANDLE.v[HANDLE.f[i+1]*3+2];
      const z3 = HANDLE.v[HANDLE.f[i+2]*3+2];
      if ((z1 + z2 + z3) / 3 < -40) {
        baseIndices.push(HANDLE.f[i], HANDLE.f[i+1], HANDLE.f[i+2]);
      } else {
        gripIndices.push(HANDLE.f[i], HANDLE.f[i+1], HANDLE.f[i+2]);
      }
    }
  }

  const handleGripGeom = new THREE.BufferGeometry();
  handleGripGeom.setAttribute('position', new THREE.Float32BufferAttribute(HANDLE.v, 3));
  handleGripGeom.setIndex(gripIndices);

  const handleBaseGeom = new THREE.BufferGeometry();
  handleBaseGeom.setAttribute('position', new THREE.Float32BufferAttribute(HANDLE.v, 3));
  handleBaseGeom.setIndex(baseIndices);
  
  // We apply the initial handle translation to both geometries
  const initialHandleMat = new THREE.Matrix4().makeTranslation(68 - HANDLE.baseCenX, sashMidY - HANDLE.baseCenY, 89 - HANDLE.baseBackZ);
  handleGripGeom.applyMatrix4(initialHandleMat);
  handleBaseGeom.applyMatrix4(initialHandleMat);

  const isMirrored = opts.isMirrored || false;
  const isOperableBottom = opts.OperableSection === 'Bottom';

  // Apply Global Transformations to flip/mirror everything
  function applyGlobalTransform(meshes: { geom: THREE.BufferGeometry }[], matrix: THREE.Matrix4, reverseWinding: boolean) {
    for (const m of meshes) {
      m.geom.applyMatrix4(matrix);
      if (reverseWinding) {
        const idx = m.geom.getIndex();
        if (idx) {
          const arr = idx.array;
          for (let i = 0; i < arr.length; i += 3) {
            const temp = arr[i];
            arr[i] = arr[i + 2];
            arr[i + 2] = temp;
          }
        } else {
           const pos = m.geom.getAttribute('position') as THREE.BufferAttribute;
           const arr = pos.array;
           for (let i = 0; i < arr.length; i += 9) {
              const v0x = arr[i], v0y = arr[i+1], v0z = arr[i+2];
              arr[i] = arr[i+6]; arr[i+1] = arr[i+7]; arr[i+2] = arr[i+8];
              arr[i+6] = v0x; arr[i+7] = v0y; arr[i+8] = v0z;
           }
        }
      }
      m.geom.computeVertexNormals();
    }
  }

  let reverseWinding = false;
  const transformMatrix = new THREE.Matrix4();

  if (isMirrored) {
    transformMatrix.premultiply(new THREE.Matrix4().makeScale(-1, 1, 1));
    transformMatrix.premultiply(new THREE.Matrix4().makeTranslation(W, 0, 0));
    reverseWinding = !reverseWinding;
  }

  if (isOperableBottom) {
    transformMatrix.premultiply(new THREE.Matrix4().makeScale(1, -1, 1));
    transformMatrix.premultiply(new THREE.Matrix4().makeTranslation(0, H, 0));
    reverseWinding = !reverseWinding;
  }

  if (isMirrored || isOperableBottom) {
    applyGlobalTransform(frameMeshes, transformMatrix, reverseWinding);
    applyGlobalTransform(transomMeshes, transformMatrix, reverseWinding);
    applyGlobalTransform(fixedMeshes, transformMatrix, reverseWinding);
    applyGlobalTransform(sashMeshes, transformMatrix, reverseWinding);
    
    // Handle geometries transform
    handleGripGeom.applyMatrix4(transformMatrix);
    handleBaseGeom.applyMatrix4(transformMatrix);
    if (reverseWinding) {
      [handleGripGeom, handleBaseGeom].forEach(g => {
        const idx = g.getIndex();
        if (idx) {
          const arr = idx.array;
          for (let i = 0; i < arr.length; i += 3) {
            const temp = arr[i];
            arr[i] = arr[i + 2];
            arr[i + 2] = temp;
          }
        }
      });
    }
    handleGripGeom.computeVertexNormals();
    handleBaseGeom.computeVertexNormals();
  } else {
    // If no transform, we still need normals for frame/transom
    [frameMeshes, transomMeshes, fixedMeshes, sashMeshes].forEach(arr => {
      arr.forEach(m => m.geom.computeVertexNormals());
    });
    handleGripGeom.computeVertexNormals();
    handleBaseGeom.computeVertexNormals();
  }

  // After all global geometries are fully shaped and positioned correctly in world space,
  // we identify the Hinge location and subtract it from the sash to form the sashGroupOrigin.
  let hingeX = W - 35; // Default right
  let hingeY = sashBot; // Default bottom of the top sash
  if (isMirrored) hingeX = 35;
  if (isOperableBottom) hingeY = 0;
  
  const sashGroupOrigin: [number, number, number] = [hingeX, hingeY, 70];
  const shiftMat = new THREE.Matrix4().makeTranslation(-sashGroupOrigin[0], -sashGroupOrigin[1], -sashGroupOrigin[2]);

  // Extract sash to local space around the hinge
  for (const m of sashMeshes) m.geom.applyMatrix4(shiftMat);
  
  // Extract handle to local space. Wait, handle will rotate inside sashGroup, but we want the handle to rotate around ITS OWN axis!
  // To rotate the handle around its own axis, we need to know its physical center.
  // The physical center of the handle in world space:
  let hX = 68;
  let hY = sashMidY;
  let hZ = 89;
  if (isMirrored) hX = W - hX;
  if (isOperableBottom) hY = H - hY;
  
  // The handle was shifted by global transform. Its physical center is now (hX, hY, hZ).
  // We want to mount the handle in the `sashGroup`, which has origin at `sashGroupOrigin`.
  // So the handle's position inside `sashGroup` is:
  const handlePos: [number, number, number] = [
    hX - sashGroupOrigin[0],
    hY - sashGroupOrigin[1],
    hZ - sashGroupOrigin[2]
  ];

  // We want the handle geometry to be centered at (0,0,0) locally so we can rotate it!
  // So we subtract (hX, hY, hZ) from the handle geometries.
  const handleCenterMat = new THREE.Matrix4().makeTranslation(-hX, -hY, -hZ);
  handleGripGeom.applyMatrix4(handleCenterMat);
  handleBaseGeom.applyMatrix4(handleCenterMat);

  // If we want it to always point DOWN when closed, we should rotate the GRIP 180 degrees around Z axis (locally).
  if (isOperableBottom) {
     handleGripGeom.applyMatrix4(new THREE.Matrix4().makeRotationZ(Math.PI));
  }

  return {
    W, H,
    sashGroupOrigin,
    frameMeshes,
    transomMeshes,
    fixedMeshes,
    sashMeshes,
    handleGripMesh: handleGripGeom,
    handleBaseMesh: handleBaseGeom,
    handlePos
  };
}
