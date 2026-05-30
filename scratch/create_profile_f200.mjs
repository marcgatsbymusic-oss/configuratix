import fs from 'fs';
import DxfParser from 'dxf-parser';

// Paths
const dxfFile = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\system\\systemy Drutex\\Processed DWGs by Marc\\Iglo5_FRM_SSH_Fixed_post.dxf";
const ig5F103File = "src/data/profiles/IG5_F103.json";
const outFile = "src/data/profiles/IG5_F200.json";

// Read DXF
const fileText = fs.readFileSync(dxfFile, 'utf-8');
const parser = new DxfParser();
const dxf = parser.parseSync(fileText);

// Read IG5_F103 for the base profiles (Frame, Sash, Glass, Gaskets)
const ig5F103 = JSON.parse(fs.readFileSync(ig5F103File, 'utf-8'));
const profiles = { ...ig5F103.profiles };

function getSvgPath(vertices) {
  if (!vertices || vertices.length === 0) return "";
  let p = `M ${vertices[0].x.toFixed(4)} ${vertices[0].y.toFixed(4)} `;
  for (let i = 1; i < vertices.length; i++) {
    p += `L ${vertices[i].x.toFixed(4)} ${vertices[i].y.toFixed(4)} `;
  }
  p += 'Z';
  return p;
}

// Sutherland-Hodgman clip: keep vertices where v.x <= cutX
function clipLeft(vertices, cutX) {
  const out = [];
  for (let i = 0; i < vertices.length; i++) {
    const cur = vertices[i];
    const prv = vertices[(i + vertices.length - 1) % vertices.length];
    const curIn = cur.x <= cutX;
    const prvIn = prv.x <= cutX;
    if (curIn) {
      if (!prvIn) {
        const t = (cutX - prv.x) / (cur.x - prv.x);
        out.push({ x: cutX, y: prv.y + t * (cur.y - prv.y) });
      }
      out.push(cur);
    } else if (prvIn) {
      const t = (cutX - prv.x) / (cur.x - prv.x);
      out.push({ x: cutX, y: prv.y + t * (cur.y - prv.y) });
    }
  }
  return out;
}

// Sutherland-Hodgman clip: keep vertices where v.x >= cutX
function clipRight(vertices, cutX) {
  const out = [];
  for (let i = 0; i < vertices.length; i++) {
    const cur = vertices[i];
    const prv = vertices[(i + vertices.length - 1) % vertices.length];
    const curIn = cur.x >= cutX;
    const prvIn = prv.x >= cutX;
    if (curIn) {
      if (!prvIn) {
        const t = (cutX - prv.x) / (cur.x - prv.x);
        out.push({ x: cutX, y: prv.y + t * (cur.y - prv.y) });
      }
      out.push(cur);
    } else if (prvIn) {
      const t = (cutX - prv.x) / (cur.x - prv.x);
      out.push({ x: cutX, y: prv.y + t * (cur.y - prv.y) });
    }
  }
  return out;
}

// Extract the 50021-4 block (Post) - only the main outer shell (largest polygon)
const shapes = [];
function findPost(ent, name) {
  const currentName = name || ent.layer || '';
  if (ent.type === 'INSERT') {
    const block = dxf.blocks[ent.name];
    if (block && block.entities) {
      block.entities.forEach(c => findPost(c, ent.name));
    }
  } else if (ent.type && ent.type.includes('POLYLINE') && currentName === '50021-4') {
    shapes.push(ent.vertices);
  }
}
dxf.entities.forEach(e => findPost(e, ''));

// Pick the main shell: the polygon spanning the full width (-42 to +42)
let postPoly = null;
for (const s of shapes) {
  const xs = s.map(v => v.x);
  const span = Math.max(...xs) - Math.min(...xs);
  if (span > 70) { // Full post is ~84mm wide
    postPoly = s;
    break;
  }
}
if (!postPoly && shapes.length > 0) {
  // Fallback: pick the largest polygon by vertex count
  postPoly = shapes.reduce((best, s) => s.length > best.length ? s : best, shapes[0]);
}

if (postPoly) {
  console.log(`Post polygon found: ${postPoly.length} pts`);
  const rawXs = postPoly.map(v => v.x);
  const rawYs = postPoly.map(v => v.y);
  console.log(`  Raw DXF - X: ${Math.min(...rawXs).toFixed(1)} to ${Math.max(...rawXs).toFixed(1)}`);
  console.log(`  Raw DXF - Y: ${Math.min(...rawYs).toFixed(1)} to ${Math.max(...rawYs).toFixed(1)}`);

  // In DXF:
  //   X axis = post width  (-42 to +42mm) - left/right across the post face
  //   Y axis = post depth  (0 to 70mm)    - front to back (exterior to interior)
  //
  // In our FrameSegment engine:
  //   profile.x = depth  (0 to 70) - maps to Z in 3D (front/back)
  //   profile.y = width  (cross-section height/width in local space)
  //
  // So we map: engineX = dxfY, engineY = dxfX
  // The engine will extrude this profile along the vertical height of the window.
  //
  // The FRM_EXT profile sits at engineY = 0..66, engineX = 0..35 (exterior half).
  // The post should match the SAME engineX range (0..35 for ext, 35..70 for int).
  // In DXF: Y=0 = exterior face, Y=70 = interior face.
  // After mapping: engineX = dxfY, so engineX=0 = exterior, engineX=70 = interior. ✅
  //
  // The post Y-width is symmetric: dxfX goes -42..+42. After mapping, engineY = -42..+42.
  // The FRM_EXT profile Y goes 0..66 (the full frame height cross-section).
  // For the post, we DON'T want the full frame height cross-section - we want the post WIDTH.
  // So we keep engineY = dxfX (the post's ±42mm width).
  //
  // But wait - the FRM_EXT commonOrigin will subtract its minY from all Y values.
  // FRM_EXT minY = 0, so no shift. Post minY = -42, which will be shifted by the commonOrigin.
  // This means the post centred at Y=0 will appear centred in the window. ✅

  const mapped = postPoly.map(v => ({ x: v.y, y: v.x }));

  // Split at the depth midpoint (35mm = halfway through 70mm profile depth)
  const cutX = 35.0;
  const pstExtVertices = clipLeft(mapped, cutX);
  const pstIntVertices = clipRight(mapped, cutX);

  console.log(`PST_EXT: ${pstExtVertices.length} pts, x: ${Math.min(...pstExtVertices.map(v=>v.x)).toFixed(1)} to ${Math.max(...pstExtVertices.map(v=>v.x)).toFixed(1)}, y: ${Math.min(...pstExtVertices.map(v=>v.y)).toFixed(1)} to ${Math.max(...pstExtVertices.map(v=>v.y)).toFixed(1)}`);
  console.log(`PST_INT: ${pstIntVertices.length} pts, x: ${Math.min(...pstIntVertices.map(v=>v.x)).toFixed(1)} to ${Math.max(...pstIntVertices.map(v=>v.x)).toFixed(1)}, y: ${Math.min(...pstIntVertices.map(v=>v.y)).toFixed(1)} to ${Math.max(...pstIntVertices.map(v=>v.y)).toFixed(1)}`);

  profiles["PST_EXT"] = { svgPath: getSvgPath(pstExtVertices), vertices: pstExtVertices };
  profiles["PST_INT"] = { svgPath: getSvgPath(pstIntVertices), vertices: pstIntVertices };
} else {
  console.error("Could not find post polygon!");
}

// Save result
const resultJson = { system: "IGLO_5", type: "F200", profiles };
fs.writeFileSync(outFile, JSON.stringify(resultJson, null, 2));
console.log(`Successfully generated: ${outFile}`);
