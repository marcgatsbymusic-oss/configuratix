/**
 * BBOX_225_W_MSQTO — Blind Box 225 + Mosquito (IGLO 5 / Antigravity)
 * Parametric builder: box (hollow skin) + STEP end lids + R0003-A guides
 * + roller-shutter curtain (real póro 37 slats + fixed end bar) + mosquito net.
 *
 * Geometry data (real DXF/STEP-derived profiles) lives in BBOX_225_W_MSQTO.data.json.
 *
 * Frame: x = depth (x+ exterior/street), y = height (y=0 = box bottom / frame head),
 *        z = width (0..width, extrusion axis).
 */
import * as THREE from "three";
import DATA from "./BBOX_225_W_MSQTO.data.json";

export interface BBoxColours {
  boxExterior?: string; // street face only
  boxInterior?: string; // top + bottom + inside + end lids
  guides?: string;      // R0003-A rails
  blind?: string;       // slats + fixed end bar
  mosquitoNet?: string; // screen
}

export interface BBoxOptions {
  width?: number;        // window width along z (default 1200)
  drop?: number;         // curtain/guide drop along -y (default 1200)
  blindDeployed?: boolean;   // default true
  mosquitoDeployed?: boolean; // default true
  colours?: BBoxColours;
}

export interface BBoxHandle {
  group: THREE.Group;
  materials: Record<keyof Required<BBoxColours>, THREE.MeshStandardMaterial>;
  /** 0 = fully retracted (into box), 1 = fully down */
  setBlind(t: number): void;
  setMosquito(t: number): void;
  dispose(): void;
}

type Pt = [number, number];
const toShape = (pts: Pt[]): THREE.Shape => {
  const s = new THREE.Shape();
  s.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
  s.closePath();
  return s;
};

export function buildBBox225WMsqto(opts: BBoxOptions = {}): BBoxHandle {
  const WIDTH = opts.width ?? DATA.defaults.width;
  const DROP = opts.drop ?? DATA.defaults.drop;
  const PITCH = DATA.defaults.slatPitch;
  const c = opts.colours ?? {};

  const materials = {
    boxExterior: new THREE.MeshStandardMaterial({
      color: c.boxExterior ?? DATA.materials.boxExterior.default, roughness: 0.62, metalness: 0.12,
    }),
    boxInterior: new THREE.MeshStandardMaterial({
      color: c.boxInterior ?? DATA.materials.boxInterior.default, roughness: 0.85, metalness: 0.02, side: THREE.DoubleSide,
    }),
    guides: new THREE.MeshStandardMaterial({
      color: c.guides ?? DATA.materials.guides.default, roughness: 0.5, metalness: 0.12, side: THREE.DoubleSide,
    }),
    blind: new THREE.MeshStandardMaterial({
      color: c.blind ?? DATA.materials.blind.default, roughness: 0.7, metalness: 0.05,
    }),
    mosquitoNet: new THREE.MeshStandardMaterial({
      color: c.mosquitoNet ?? DATA.materials.mosquitoNet.default, roughness: 0.9, metalness: 0.0,
      transparent: true, opacity: 0.32, side: THREE.DoubleSide,
    }),
  };

  const group = new THREE.Group();
  group.name = "BBOX_225_W_MSQTO";
  const disposables: Array<{ dispose: () => void }> = [];
  const track = <T extends { dispose: () => void }>(o: T) => { disposables.push(o); return o; };

  // ---- BOX: extruded hollow skin, faces split exterior(+x) / interior ----
  const boxShape = toShape(DATA.box.outline as Pt[]);
  const boxGeo = track(new THREE.ExtrudeGeometry(boxShape, { depth: WIDTH, bevelEnabled: false }));
  boxGeo.computeVertexNormals();
  (() => {
    const pos = boxGeo.attributes.position, n = pos.count;
    boxGeo.clearGroups();
    const a = new THREE.Vector3(), b = new THREE.Vector3(), d = new THREE.Vector3(),
      e1 = new THREE.Vector3(), e2 = new THREE.Vector3(), nr = new THREE.Vector3();
    const idx: number[] = [];
    for (let i = 0; i < n; i += 3) {
      a.fromBufferAttribute(pos, i); b.fromBufferAttribute(pos, i + 1); d.fromBufferAttribute(pos, i + 2);
      e1.subVectors(b, a); e2.subVectors(d, a); nr.crossVectors(e1, e2).normalize();
      idx.push(nr.x > DATA.box.extNormalX ? 0 : 1); // 0 = exterior, 1 = interior
    }
    let s = 0;
    for (let i = 1; i <= idx.length; i++)
      if (i === idx.length || idx[i] !== idx[s]) { boxGeo.addGroup(s * 3, (i - s) * 3, idx[s]); s = i; }
  })();
  const box = new THREE.Mesh(boxGeo, [materials.boxExterior, materials.boxInterior]);
  box.name = "box"; box.castShadow = box.receiveShadow = true;
  group.add(box);
  const frontX = DATA.box.frontX;

  // ---- END LIDS: real STEP cover on both ends (interior colour) ----
  const lidGeo = track(new THREE.BufferGeometry());
  lidGeo.setAttribute("position", new THREE.Float32BufferAttribute(DATA.lid.pos as number[], 3));
  lidGeo.setIndex(DATA.lid.idx as number[]);
  lidGeo.computeVertexNormals();
  const lidA = new THREE.Mesh(lidGeo, materials.boxInterior); lidA.name = "lidLeft";
  const lidB = new THREE.Mesh(lidGeo, materials.boxInterior); lidB.name = "lidRight";
  lidB.position.z = WIDTH; lidB.scale.z = -1;
  lidA.castShadow = lidB.castShadow = lidA.receiveShadow = lidB.receiveShadow = true;
  group.add(lidA, lidB);

  // ---- GUIDES R0003-A: grooves face inward to the curtain; left built, right mirrored ----
  const buildRailLeft = (): THREE.Group => {
    const g = track(new THREE.ExtrudeGeometry(toShape(DATA.guide.outline as Pt[]), { depth: DROP, bevelEnabled: false }));
    g.rotateX(Math.PI / 2);                    // length -> down (-y); groove opens -x
    const m = new THREE.Mesh(g, materials.guides); m.castShadow = m.receiveShadow = true;
    const grp = new THREE.Group(); grp.add(m);
    grp.rotation.y = Math.PI / 2;              // groove -x -> +z (faces centre / curtain)
    grp.updateMatrixWorld(true);
    const bb = new THREE.Box3().setFromObject(grp);
    grp.position.y += 0 - bb.max.y;            // top flush under box (y=0)
    grp.position.x += frontX - bb.max.x;       // exterior flush
    grp.position.z += 6 - bb.min.z;            // left jamb
    return grp;
  };
  const railL = buildRailLeft(); railL.name = "guideLeft"; railL.updateMatrixWorld(true);
  const mir = new THREE.Group(); mir.name = "guideRight"; mir.add(buildRailLeft());
  mir.scale.z = -1; mir.position.z = WIDTH;   // mirror of left -> its groove also faces the curtain
  group.add(railL, mir);
  mir.updateMatrixWorld(true);
  const leftInnerZ = new THREE.Box3().setFromObject(railL).max.z;
  const rightInnerZ = new THREE.Box3().setFromObject(mir).min.z;

  // ---- BLIND: slats (external groove) tiled contiguously + fixed end bar (no gap) ----
  const blindGrp = new THREE.Group(); blindGrp.name = "blind"; group.add(blindGrp);
  const cZ0 = leftInnerZ - 8, cZ1 = rightInnerZ + 8, cwidth = cZ1 - cZ0; // edges tuck into grooves
  const slatX = frontX - DATA.guide.grooves.external.worldXFromFront; // external (street) groove
  const netX = frontX - DATA.guide.grooves.internal.worldXFromFront;  // internal (room) groove

  const slatGeo = track(new THREE.ExtrudeGeometry(toShape(DATA.blind.slat as Pt[]), { depth: cwidth, bevelEnabled: false }));
  slatGeo.computeBoundingBox();
  const sbb = slatGeo.boundingBox!;
  const slatTopY = DATA.blind.slatY[1];
  const ebH = DATA.blind.endbarY[1] - DATA.blind.endbarY[0];
  const nSlat = Math.round((DROP - ebH) / PITCH);
  const inst = new THREE.InstancedMesh(slatGeo, materials.blind, nSlat);
  inst.name = "slats"; inst.castShadow = inst.receiveShadow = true;
  const mtx = new THREE.Matrix4();
  for (let i = 0; i < nSlat; i++) {
    mtx.makeTranslation(slatX - (sbb.min.x + sbb.max.x) / 2, -i * PITCH - slatTopY, cZ0 - sbb.min.z);
    inst.setMatrixAt(i, mtx);
  }
  inst.instanceMatrix.needsUpdate = true;
  blindGrp.add(inst);

  const endGeo = track(new THREE.ExtrudeGeometry(toShape(DATA.blind.endbar as Pt[]), { depth: cwidth, bevelEnabled: false }));
  endGeo.computeBoundingBox();
  const ebb = endGeo.boundingBox!;
  const endbar = new THREE.Mesh(endGeo, materials.blind); endbar.name = "endBar";
  endbar.castShadow = endbar.receiveShadow = true;
  endbar.position.set(slatX - (ebb.min.x + ebb.max.x) / 2, -nSlat * PITCH - ebb.max.y, cZ0 - ebb.min.z);
  blindGrp.add(endbar);

  // ---- MOSQUITO NET: screen in the internal groove, independently deployable ----
  const netGrp = new THREE.Group(); netGrp.name = "mosquitoNet"; group.add(netGrp);
  const netGeo = track(new THREE.BoxGeometry(3, DROP - 6, cwidth - 6));
  const net = new THREE.Mesh(netGeo, materials.mosquitoNet); net.name = "screen";
  net.position.set(netX, -(DROP - 6) / 2, WIDTH / 2);
  netGrp.add(net);

  // ---- deploy state ----
  const setBlind = (t: number) => {
    blindGrp.scale.y = 1.0;
    const maxOffset = DROP + 150;
    const offsetY = (1 - t) * maxOffset;
    
    const tempMtx = new THREE.Matrix4();
    for (let i = 0; i < nSlat; i++) {
      const originalY = -i * PITCH - slatTopY;
      const currentY = originalY + offsetY;
      
      if (currentY > 0) {
        tempMtx.makeTranslation(99999, 99999, 99999);
      } else {
        tempMtx.makeTranslation(slatX - (sbb.min.x + sbb.max.x) / 2, currentY, cZ0 - sbb.min.z);
      }
      inst.setMatrixAt(i, tempMtx);
    }
    inst.instanceMatrix.needsUpdate = true;
    
    const endbarY = -nSlat * PITCH - ebb.max.y + offsetY;
    if (endbarY > 0) {
      endbar.visible = false;
    } else {
      endbar.visible = true;
      endbar.position.y = endbarY;
    }
  };

  const setMosquito = (t: number) => {
    netGrp.scale.y = Math.max(0.001, t);
  };
  setBlind(opts.blindDeployed === false ? 0.0 : 1);
  setMosquito(opts.mosquitoDeployed === false ? 0.0 : 1);

  return {
    group, materials, setBlind, setMosquito,
    dispose() {
      disposables.forEach((d) => d.dispose());
      Object.values(materials).forEach((m) => m.dispose());
    },
  };
}

export default buildBBox225WMsqto;
