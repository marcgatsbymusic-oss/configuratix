// engine/assemble.js
// Frozen assembly engine. Composes windows from DATA:
//   - cross-section geometry  -> data/profiles/*.json
//   - junction offsets        -> data/recipes/zlozenie_recipes.json
//   - rules/contract          -> contracts/assemblyRules.json
// It NEVER invents rebate/mitre/mullion numbers. Offsets are read from recipes.
// THREE is optional: geometry is computed as plain data; toThree() builds meshes
// only when a THREE namespace is injected (so this runs headless in Node too).

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ---------- catalog ----------
export function loadCatalog(root) {
  const profiles = {}, byComponent = {};
  const pdir = path.join(root, "data/profiles");
  for (const f of fs.readdirSync(pdir)) {
    if (!f.endsWith(".json")) continue;
    const p = JSON.parse(fs.readFileSync(path.join(pdir, f), "utf8"));
    profiles[p.name] = p;
    (byComponent[p.component] ??= []).push(p.name);
  }
  const recipes = JSON.parse(
    fs.readFileSync(path.join(root, "data/recipes/zlozenie_recipes.json"), "utf8"));
  const rules = JSON.parse(
    fs.readFileSync(path.join(root, "contracts/assemblyRules.json"), "utf8"));
  return { profiles, byComponent, recipes, rules };
}

// ---------- recipe matching ----------
// Find the recipe whose set of component types equals `wanted`.
export function matchRecipe(recipes, wanted) {
  const W = [...new Set(wanted)].sort().join(",");
  for (const [name, parts] of Object.entries(recipes)) {
    const s = [...new Set(parts.map(p => p.component).filter(Boolean))].sort().join(",");
    if (s === W) return { name, parts };
  }
  return null;
}

// ---------- geometry placement ----------
function placeLoops(profile, offset = [0, 0], rotDeg = 0) {
  const a = (rotDeg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  return (profile.loops || []).map(L => ({
    closed: L.closed,
    pts: L.pts.map(([x, y]) => [c * x - s * y + offset[0], s * x + c * y + offset[1]]),
  }));
}

// Resolve a composed cross-section from a recipe.
// `selection` lets a spec choose which atomic profile fills each component role
// (e.g. frame: "50003 - rama 75mm"); the OFFSET always comes from the recipe.
export function resolveSection(cat, recipeName, selection = {}) {
  const parts = cat.recipes[recipeName];
  if (!parts) throw new Error(`unknown recipe: ${recipeName}`);
  const components = parts.map(part => {
    const chosen = selection[part.component] || part.ref;
    const prof = cat.profiles[chosen];
    const hasGeom = prof && (prof.loops || []).length > 0;
    return hasGeom
      ? { component: part.component, ref: prof.name, offset: part.offset,
          loops: placeLoops(prof, part.offset, part.rot || 0) }
      : { component: part.component, ref: chosen, offset: part.offset, loops: [],
          note: "no polyline geometry (ACIS REGION or unselected) — pick an atomic via selection" };
  });
  return { recipe: recipeName, components };
}

// ---------- window assembly (elevation + sweep plan) ----------
export function buildWindow(cat, spec) {
  const meta = spec.meta || {};
  const W = spec.width, H = spec.height;
  const frameFace = spec.frameFace ?? meta.frameFace ?? 34;     // from family meta.json
  const mullionFace = spec.mullionFace ?? meta.mullionFace ?? 60;

  const inner = { x: frameFace, y: frameFace, w: W - 2 * frameFace, h: H - 2 * frameFace };
  const model = {
    spec, outer: { x: 0, y: 0, w: W, h: H }, frameFace, inner,
    corners_mitre: [
      [[0, 0], [frameFace, frameFace]],
      [[W, 0], [W - frameFace, frameFace]],
      [[W, H], [W - frameFace, H - frameFace]],
      [[0, H], [frameFace, H - frameFace]],
    ],
    mullions: [], cells: [], sweeps: {},
  };

  if (spec.division === "vertical") {
    const cx = inner.x + inner.w * (spec.at ?? 0.5);
    model.mullions.push({ type: spec.mullion || "fixed",
      x: cx - mullionFace / 2, w: mullionFace, y: inner.y, h: inner.h });
    model.cells.push({ x: inner.x, y: inner.y, w: (cx - mullionFace / 2) - inner.x, h: inner.h });
    model.cells.push({ x: cx + mullionFace / 2, y: inner.y,
      w: (inner.x + inner.w) - (cx + mullionFace / 2), h: inner.h });
  } else {
    model.cells.push({ ...inner });
  }

  // Each swept element references a RECIPE (the junction). No offsets computed here.
  const glazed = spec.glazed !== false;
  model.sweeps.frameEdge = matchRecipe(cat.recipes,
    glazed ? ["frame", "sash"] : ["frame", "glass", "glazing_bead", "spacer_bridge"])?.name || null;
  if (spec.mullion)
    model.sweeps.mullion = matchRecipe(cat.recipes, ["mullion_" + spec.mullion, "sash"])?.name || null;
  return model;
}

// ---------- Three.js export (optional) ----------
// Extrudes each resolved section's outer loop along its edge length.
// Mitre at corners is a documented refinement (see engine/README.md).
export function toThree(cat, model, selection, THREE) {
  if (!THREE) throw new Error("inject a THREE namespace to build meshes");
  const group = new THREE.Group();
  const sec = model.sweeps.frameEdge && resolveSection(cat, model.sweeps.frameEdge, selection);
  if (sec) {
    const outer = sec.components.find(c => c.loops.length)?.loops[0];
    if (outer) {
      const shape = new THREE.Shape(outer.pts.map(([x, y]) => new THREE.Vector2(x, y)));
      const edges = [
        { len: model.outer.w, pos: [0, 0, 0] },
        { len: model.outer.w, pos: [0, model.outer.h, 0] },
        { len: model.outer.h, pos: [0, 0, 0] },
        { len: model.outer.h, pos: [model.outer.w, 0, 0] },
      ];
      for (const e of edges) {
        const g = new THREE.ExtrudeGeometry(shape, { depth: e.len, bevelEnabled: false });
        const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial());
        m.position.set(...e.pos);
        group.add(m);
      }
    }
  }
  return group;
}

// ---------- demo CLI: `node engine/assemble.js` ----------
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const cat = loadCatalog(root);
  const selection = {
    frame: "50003 - rama 75mm",
    sash: "50034 - skrzydło 120mm N_Z",
    mullion_movable: "50029 - słupek ruchomy",
    glazing_bead: "50924 - listwa 22mm",
    glass: "szyba 24mm",
  };

  // 1) resolve a real cross-section from a recipe (offsets read from data)
  const fs2 = await import("fs");
  const sectionRecipe = matchRecipe(cat.recipes, ["frame", "sash"]).name;
  const section = resolveSection(cat, sectionRecipe, selection);
  fs2.writeFileSync(path.join(root, "engine/_section.json"), JSON.stringify(section, null, 1));

  // 2) build a double window with a MOVABLE mullion
  const model = buildWindow(cat, {
    width: 1500, height: 1200, division: "vertical", at: 0.5,
    mullion: "movable", glazed: true,
    meta: { frameFace: 34, mullionFace: 60 },
  });
  fs2.writeFileSync(path.join(root, "engine/_model.json"), JSON.stringify(model, null, 1));

  console.log("section recipe:", section.recipe);
  for (const c of section.components)
    console.log("  ", c.component.padEnd(16), c.ref.padEnd(28), "offset", JSON.stringify(c.offset), c.note ? "(" + c.note + ")" : "loops=" + c.loops.length);
  console.log("\nwindow:", model.outer.w + "x" + model.outer.h,
    "| cells:", model.cells.length,
    "| mullion:", model.mullions[0]?.type,
    "| frameEdge recipe:", model.sweeps.frameEdge,
    "| mullion recipe:", model.sweeps.mullion);
}
