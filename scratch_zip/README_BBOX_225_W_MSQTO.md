# BBOX_225_W_MSQTO — Blind Box 225 + Mosquito

Parametric IGLO 5 roller-shutter box with integrated mosquito net, ready to drop into Antigravity.

## What's in the package

| File | Purpose |
|---|---|
| `bbox_225_w_msqto.ts` | Parametric three.js builder (default export `buildBBox225WMsqto`). Type-checks against `three` + `@types/three`. |
| `BBOX_225_W_MSQTO.data.json` | Real geometry: box outline, R0003-A guide outline, póro-37 slat, end bar, and the STEP end-lid mesh. Imported by the builder. |
| `BBOX_225_W_MSQTO.json` | High-level spec (params, materials, groove map, provenance). |
| `BBOX_225_W_MSQTO_viewer.html` | Standalone preview (colour pickers + deploy toggles) — reference/QA only. |

## Provenance

- Box + all profiles: `Blind_box_225_with_mosquito.dxf` (Drutex IGLO 5). Steel `250xxx` reinforcement excluded; internal chambers dropped (outer skin only).
- End lid: `lid_of_225m_box.step` ("Cover blind box 225mm"), tessellated, oriented (depth flipped) and fitted to the box cross-section.

## Coordinate frame

`x` = depth (`x+` = exterior / street), `y` = height (`y = 0` = box bottom / frame head), `z` = width (0…width, extrusion axis). Everything is built in millimetres.

## Usage

```ts
import buildBBox225WMsqto from "./bbox_225_w_msqto.ts";

const bbox = buildBBox225WMsqto({
  width: 1200,          // z span (default 1200)
  drop: 1200,           // curtain/guide drop along -y (default 1200)
  blindDeployed: true,
  mosquitoDeployed: true,
  colours: {            // any subset; omitted keys use defaults
    boxExterior: "#3a3f44",
    boxInterior: "#ece9e1",
    guides: "#9aa1a7",
    blind: "#c8bfa8",
    mosquitoNet: "#b7bcbf",
  },
});

scene.add(bbox.group);
```

`buildBBox225WMsqto` returns:

- `group` — a `THREE.Group` named `BBOX_225_W_MSQTO`, with named children: `box`, `lidLeft`, `lidRight`, `guideLeft`, `guideRight`, `blind` (→ `slats`, `endBar`), `mosquitoNet` (→ `screen`).
- `materials` — the five colourable `MeshStandardMaterial`s. Recolour live from the configurator: `bbox.materials.guides.color.set("#b0b7bd")`.
- `setBlind(t)` / `setMosquito(t)` — deploy state, `t` in `0…1` (0 = retracted into box, 1 = fully down). Both scale about `y = 0`.
- `dispose()` — frees geometries and materials.

## Colour model (5 pickers)

- **Box exterior** → the single street-facing face only.
- **Box interior** → top, bottom, inside walls, **and both end lids**.
- **Guides** → the two R0003-A rails.
- **Blind** → slats + fixed end bar.
- **Mosquito net** → the screen.

## Component notes

- **Box** — extruded outline (hollow skin). A face is exterior if its normal.x > 0.5, else interior; the split feeds material group 0/1.
- **End lids** — the real STEP cover, one inside each end (`z ≈ 0…2` and `z ≈ width-2…width`), interior colour.
- **Guides R0003-A** — grooves face inward to the curtain on **both** jambs. Left rail: `rotateX(90°)` then `rotationY(90°)`; right rail is the z-mirror of the left, so its groove also faces the curtain and the internal channel order stays physically correct. (Slots open −x in the raw profile — verified, not assumed.)
- **Blind** — póro-37 slats seated in the **external** (street-side) groove (`x ≈ frontX − 17`), tiled contiguously so the last slat meets the fixed end bar with no gap; slat convex face points to the street.
- **Mosquito net** — screen seated in the **internal** (room-side) groove (`x ≈ frontX − 39`), independently deployable.

## Scaling to other sizes

`width` and `drop` are free parameters — the guides, curtain tiling, end bar, net, and lids all follow. The box cross-section, guide profile, slat, end bar and lid are fixed real profiles (this is the 225 box), so only width/drop vary per opening. For other box heights, swap the profiles + lid in the data file; the builder is height-agnostic.

## Known follow-up

The STEP lid measures ~235 mm tall vs the DXF-extracted box outline at ~247 mm, so it's fitted (slightly scaled) to the box end. If the lid is the authoritative height, drive the box height from the lid instead and re-extract — the builder doesn't need to change.
