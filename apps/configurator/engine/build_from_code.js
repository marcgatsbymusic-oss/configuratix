// engine/build_from_code.js
// Resolves a window_types.json code into a build plan: every member (frame edges,
// mullions, transoms, sashes, glass) plus hardware (handles, hinges) — by walking
// the layout tree. The plan is pure data (testable in Node). buildFromCode() turns
// it into a THREE.Group using buildHollowBicolor + the hardware placers.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { handleAnchor, hingeAnchors, hardwareFor, HARDWARE_DEFAULTS } from "./hardware.js";

export function loadFullCatalog(root) {
  const types = JSON.parse(fs.readFileSync(path.join(root, "data/window_types.json"), "utf8")).types;
  return { root, types };
}

const FACE = { frame: 70, mullion: 80, transom: 80, sash: 70 };

function leafCell(rect, node, out, family) {
  const open = node.open;
  const sashLike = ["turn", "tiltturn", "door", "psk"].includes(open);
  if (sashLike) {
    out.members.push({ role: "sash", rect, open });
    const inner = inset(rect, FACE.sash);
    out.members.push({ role: "glass", rect: inner });
    const sash = { x: rect.x, y: rect.y, w: rect.w, h: rect.h, z: 20, depth: 78, stile: FACE.sash };
    const hw = hardwareFor(open);
    if (hw.handle) out.hardware.push({ type: "handle", ...handleAnchor(sash, node.hand || "R", open, family) });
    if (hw.hinges) for (const a of hingeAnchors(sash, node.hand || "R", open).anchors)
      out.hardware.push({ type: "hinge", pos: a.pos, role: a.role });
  } else {
    out.members.push({ role: open === "fixed_sash" ? "fixed_sash" : "fixed_glaze", rect });
    out.members.push({ role: "glass", rect: inset(rect, open === "fixed_sash" ? FACE.sash : 20) });
  }
}
const inset = (r, d) => ({ x: r.x + d, y: r.y + d, w: r.w - 2 * d, h: r.h - 2 * d });

function walk(node, rect, out, family) {
  if (node.open !== undefined) return leafCell(rect, node, out, family);
  if (node._review && node.fields) {           // flagged mixed-divider: row fallback
    const n = node.fields.length, w = rect.w / n;
    node.fields.forEach((f, i) => walk(f, { x: rect.x + i * w, y: rect.y, w, h: rect.h }, out, family));
    out.approxArrangement = true;
    return;
  }
  const ch = node.children, n = ch.length, at = node.at, posts = node.posts || [];
  if (node.split === "vertical") {
    let x0 = rect.x;
    for (let i = 0; i < n; i++) {
      const bx = i < n - 1 ? rect.x + at[i] * rect.w : rect.x + rect.w;
      const pf = i < n - 1 ? FACE.mullion : 0;
      const cw = (i < n - 1 ? bx - pf / 2 : rect.x + rect.w) - x0;
      walk(ch[i], { x: x0, y: rect.y, w: cw, h: rect.h }, out, family);
      if (i < n - 1) {
        out.members.push({ role: posts[i]?.post === "movable" ? "mullion_movable" : "mullion",
          rect: { x: bx - pf / 2, y: rect.y, w: pf, h: rect.h } });
        x0 = bx + pf / 2;
      }
    }
  } else { // horizontal: children top -> bottom (F1 = top)
    let yTop = rect.y + rect.h;
    for (let i = 0; i < n; i++) {
      const frac = i < n - 1 ? at[i] : 1;
      const yb = i < n - 1 ? rect.y + rect.h - frac * rect.h : rect.y;
      const pf = i < n - 1 ? FACE.transom : 0;
      const ch_top = yTop, ch_bot = (i < n - 1 ? yb + pf / 2 : rect.y);
      walk(ch[i], { x: rect.x, y: ch_bot, w: rect.w, h: ch_top - ch_bot }, out, family);
      if (i < n - 1) {
        out.members.push({ role: "transom", rect: { x: rect.x, y: yb - pf / 2, w: rect.w, h: pf } });
        yTop = yb - pf / 2;
      }
    }
  }
}

export function planFromCode(cat, code, opts = {}) {
  const t = cat.types[code];
  if (!t) throw new Error("unknown code: " + code);
  const W = opts.width ?? 1500, H = opts.height ?? 1400;
  const out = { code, name: t.name, family: t.family, outer: { w: W, h: H },
    members: [{ role: "frame", rect: { x: 0, y: 0, w: W, h: H } }], hardware: [] };
  const inner = inset({ x: 0, y: 0, w: W, h: H }, FACE.frame);
  walk(t.layout, inner, out, t.family);
  if (t._review) out.review = t._review;
  return out;
}

// ---------- THREE build (needs THREE + loaded GLB protos) ----------
export function buildFromCode(cat, code, THREE, protos, mats, opts = {}) {
  // protos: { handle, hinge } loaded GLB Object3D ; mats: { ext, int, glass }
  // (left as the integration surface; see README — uses buildHollowBicolor + placeHandle/placeHinges)
  throw new Error("wire to three_build.buildHollowBicolor + hardware.placeHandle/placeHinges");
}

// ---------- CLI: emit plans for test codes ----------
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const cat = loadFullCatalog(root);
  const tests = (process.argv[2] || "F104,F202,F300,F250,D200,P205").split(",");
  const plans = {};
  for (const c of tests) {
    try {
      const p = planFromCode(cat, c, { width: 1500, height: 1400 });
      plans[c] = p;
      const sashes = p.members.filter(m => m.role === "sash").length;
      const handles = p.hardware.filter(h => h.type === "handle").length;
      const hinges = p.hardware.filter(h => h.type === "hinge").length;
      console.log(`${c.padEnd(6)} ${p.name.slice(0,34).padEnd(34)} members=${String(p.members.length).padStart(2)} sashes=${sashes} handles=${handles} hinges=${hinges}${p.review ? "  (review)" : ""}`);
    } catch (e) { console.log(`${c}: ${e.message}`); }
  }
  fs.writeFileSync(path.join(root, "engine/_plans.json"), JSON.stringify(plans, null, 1));
  console.log("\nwrote engine/_plans.json");
}
