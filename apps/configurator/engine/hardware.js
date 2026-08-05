// engine/hardware.js
// Places handles and Dreh (turn) hinges on opening sashes.
//
// The GLBs are authored at unknown/!= unit scales, so each is NORMALIZED to a
// real mm size on load, then placed by anchors computed from the sash rectangle
// and the hand. Anchor math is pure (testable in Node); only instancing needs THREE.
//
// Hand convention (configurable via cfg.handIsHingeSide):
//   hand "L" => hinges on the LEFT stile, handle on the RIGHT  (DIN-left)
//   hand "R" => hinges on the RIGHT stile, handle on the LEFT
// Flip cfg.handIsHingeSide=false if your catalogue quotes the handle side instead.

export const HARDWARE_DEFAULTS = {
  handIsHingeSide: true,
  handleLeverMm: 140,        // normalize handle longest axis to this
  hingeHeightMm: 150,        // normalize hinge tall axis to this
  hingeInsetMm: 150,         // hinge distance from sash corner
  handleHeightFrac: 0.5,     // window: handle at mid sash height
  doorHandleMm: 1050,        // door/balcony: handle height from sash bottom
  // local-axis orientation of each model — set once on screen if it points wrong
  handleFaceAxis: "z",       // model axis that should point INTO the room (+)
  hingeStileAxis: "y",       // model axis along the sash stile (vertical)
};

const HAS_HANDLE = new Set(["turn", "tiltturn", "psk", "door"]);
const HAS_TURN_HINGE = new Set(["turn", "tiltturn", "door"]); // psk slides, no dreh hinge

function sashDepth(sash) { return sash.depth ?? 60; }

// ---------- pure anchors ----------
// sash: {x,y,w,h,z, depth, stile} in window coords. Returns world-space anchors.
export function handleAnchor(sash, hand, opening, family, cfg = HARDWARE_DEFAULTS) {
  const sw = sash.stile ?? 60;
  const hingeLeft = cfg.handIsHingeSide ? hand === "L" : hand === "R";
  const lockLeft = !hingeLeft;
  const x = lockLeft ? sash.x + sw / 2 : sash.x + sash.w - sw / 2;
  const doorLike = family === "door" || family === "service_door" || family === "balcony_door";
  const y = doorLike
    ? sash.y + Math.min(cfg.doorHandleMm, sash.h - sw)
    : sash.y + sash.h * cfg.handleHeightFrac;
  const z = sash.z + sashDepth(sash);     // interior face (room side)
  return { pos: [x, y, z], facing: "interior", lockLeft };
}

export function hingeAnchors(sash, hand, opening, cfg = HARDWARE_DEFAULTS) {
  const sw = sash.stile ?? 60;
  const hingeLeft = cfg.handIsHingeSide ? hand === "L" : hand === "R";
  const x = hingeLeft ? sash.x + sw / 2 : sash.x + sash.w - sw / 2;
  const yBottom = sash.y + cfg.hingeInsetMm;
  const yTop = sash.y + sash.h - cfg.hingeInsetMm;
  const list = [
    { pos: [x, yBottom, sash.z + sashDepth(sash) * 0.5], role: "bottom" },
    { pos: [x, yTop, sash.z + sashDepth(sash) * 0.5], role: "top" },
  ];
  // tilt&turn adds a tilt arm/scissor stay at the top opposite corner (optional)
  if (opening === "tiltturn") list.push({ pos: [x, yTop, sash.z + sashDepth(sash) * 0.5], role: "tilt-stay", optional: true });
  return { hingeLeft, anchors: list };
}

// which hardware a leaf needs
export function hardwareFor(opening) {
  return { handle: HAS_HANDLE.has(opening), hinges: HAS_TURN_HINGE.has(opening) };
}

// ---------- THREE instancing ----------
function normalizeModel(obj, targetMm, axisIndex, THREE) {
  const box = new THREE.Box3().setFromObject(obj);
  const size = box.getSize(new THREE.Vector3());
  const cur = [size.x, size.y, size.z][axisIndex] || Math.max(size.x, size.y, size.z);
  const s = cur > 0 ? targetMm / cur : 1;
  obj.scale.setScalar(s);
  return obj;
}
const AX = { x: 0, y: 1, z: 2 };

// place handle on a sash. handleProto is a loaded THREE.Object3D (from GLTFLoader).
export function placeHandle(group, sash, hand, opening, family, handleProto, THREE, cfg = HARDWARE_DEFAULTS) {
  if (!hardwareFor(opening).handle) return;
  const a = handleAnchor(sash, hand, opening, family, cfg);
  const h = handleProto.clone(true);
  normalizeModel(h, cfg.handleLeverMm, AX[cfg.handleFaceAxis], THREE);
  // face into the room (+Z); mirror lever for lock side
  if (!a.lockLeft) h.scale.x *= -1;
  h.position.set(...a.pos);
  group.add(h);
}

// place Dreh hinges on a sash.
export function placeHinges(group, sash, hand, opening, hingeProto, THREE, cfg = HARDWARE_DEFAULTS) {
  if (!hardwareFor(opening).hinges) return;
  const { hingeLeft, anchors } = hingeAnchors(sash, hand, opening, cfg);
  for (const an of anchors) {
    if (an.optional && opening !== "tiltturn") continue;
    const hg = hingeProto.clone(true);
    normalizeModel(hg, cfg.hingeHeightMm, AX[cfg.hingeStileAxis], THREE);
    if (!hingeLeft) hg.scale.x *= -1;     // mirror to the right stile
    hg.position.set(...an.pos);
    group.add(hg);
  }
}
