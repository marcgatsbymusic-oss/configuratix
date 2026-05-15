---
name: dxf-to-react-converter
description: Extracts standard and bi-color window profiles from layered DXF files and converts them to scalable React SVG paths and Three.js Shapes.
---

# DXF to React Converter

This skill defines the process for parsing Drutex architectural DXF files and converting them into web-ready components for the React Configurator Engine.

## 1. Naming & Layering Convention

For the script to automatically extract Bi-Color (Bikolor) profiles, the CAD engineer must organize the DXF using the following layer names:

*   `FRM_EXT`: Exterior Frame Profile (LWPOLYLINE) - Mapped to `--color-ext`
*   `FRM_INT`: Interior Frame Profile (LWPOLYLINE) - Mapped to `--color-int`
*   `GSK_EXT`: Exterior Gasket
*   `GSK_INT`: Interior Gasket
*   `GLS`: Glass Package
*   `BZD`: Glazing Bead

## 2. Extraction Process

The `dxf-parser` node module is used to read the ASCII `.dxf` file.

1.  **Parse Layers**: Iterate through `dxf.entities` and filter by layer name.
2.  **Extract Polylines**: For `LWPOLYLINE` entities (like `FRM_EXT`), extract the vertex arrays (`ent.vertices`).
3.  **Generate SVG Paths**:
    *   Convert vertices to SVG `d` attribute strings (e.g., `M x,y L x,y ... Z`).
    *   Scale/transform coordinates so the bounding box originates at `(0,0)`.
    *   Flip the Y-axis if necessary (CAD systems often use bottom-left origin, while SVG uses top-left).
4.  **Generate Three.js Shapes**:
    *   Output the same vertices as a JSON array suitable for `new THREE.Shape()`.
    *   `moveTo(x, y)` and `lineTo(x, y)` sequences.

## 3. 9-Slice Architecture

The output must be formatted for 9-Slice scaling in the React `<SvgWindowEngine>`:
*   The raw DXF represents the **Corner** (e.g., `CTL` - Corner Top Left).
*   The engine will take this cross-section and mathematically extrude it along the straight edges (`TOP`, `BTM`, `LFT`, `RGT`).

## 4. Script Usage

Use the provided `scratch/dxfToReact.mjs` utility script to parse a DXF.

```bash
node scratch/dxfToReact.mjs "path/to/profile.dxf" --out "src/data/profiles/IG5_F104.json"
```

The resulting JSON will contain:
```json
{
  "system": "IG5",
  "type": "F104",
  "profiles": {
    "FRM_EXT": { "svgPath": "M0,0 L10,0...", "vertices": [[0,0], [10,0]] },
    "FRM_INT": { "svgPath": "M0,0 L10,0...", "vertices": [[0,0], [10,0]] }
  }
}
```
