import * as THREE from 'three';
import { PROFILES } from '../IG5_F252/f252_profiles';

export interface F104Options {
  W: number;
  H: number;
}

export interface F104Geometries {
  W: number;
  H: number;
  frameMeshes: { geom: THREE.BufferGeometry; matKey: string }[];
  fixedMeshes: { geom: THREE.BufferGeometry; matKey: string }[];
}

export function buildIG5_F104Geometries(opts: F104Options): F104Geometries {
  const W = opts.W || 1000;
  const H = opts.H || 1000;

  const frameMeshes: { geom: THREE.BufferGeometry; matKey: string }[] = [];
  const fixedMeshes: { geom: THREE.BufferGeometry; matKey: string }[] = [];

  const requiredProfiles = ['FRM_EXT', 'FRM_INT', 'BZD_FRM', 'GSK_BZD_FRM'];
  for (const p of requiredProfiles) {
    if (!PROFILES[p as keyof typeof PROFILES] || PROFILES[p as keyof typeof PROFILES].length < 8) {
      throw new Error(`[IG5_F104] Profile ${p} missing or < 8 points. Validation failed.`);
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
    if (!poly) throw new Error('[IG5_F104] missing profile ' + name);
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

  // 1. FRAME (4 sides)
  [['FRM_EXT','ext'],['FRM_INT','int'],['GSK_FRM','gsk']].forEach(([lp, mk]) => {
    frameMeshes.push({ geom: buildMemberGeom(lp, r => r, r => H - r, Z, Xp, Yp, [0, 0, 0]), matKey: mk });
    frameMeshes.push({ geom: buildMemberGeom(lp, r => r, r => H - r, Z, Xn, Yp, [W, 0, 0]), matKey: mk });
    frameMeshes.push({ geom: buildMemberGeom(lp, r => r, r => W - r, Z, Yp, Xp, [0, 0, 0]), matKey: mk });
    frameMeshes.push({ geom: buildMemberGeom(lp, r => r, r => W - r, Z, Yn, Xp, [0, H, 0]), matKey: mk });
  });

  // 2. FIXED GLAZING (4 sides mitreRing)
  mitreRing(fixedMeshes, 'BZD_FRM',     40, 40, W - 40, H - 40, 40, 'int');
  mitreRing(fixedMeshes, 'GSK_BZD_FRM', 56, 56, W - 56, H - 56, 56, 'gsk');

  // 3. GLASS
  fixedMeshes.push({ geom: box(W - 100, H - 100, 24, W / 2, H / 2, 31), matKey: 'glass' });

  // 4. SPACER
  ringBoxes(fixedMeshes, 50, W - 50, 50, H - 50, 23, 39, 14, 'spacer');

  // Compute normals
  [frameMeshes, fixedMeshes].forEach(arr => {
    arr.forEach(m => m.geom.computeVertexNormals());
  });

  return {
    W, H,
    frameMeshes,
    fixedMeshes
  };
}
