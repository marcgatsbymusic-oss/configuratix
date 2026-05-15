import fs from 'fs';
import DxfParser from 'dxf-parser';

// Helper to convert bulge to SVG arc (Simplified)
// A bulge is the tangent of 1/4 of the included angle for the arc.
function getSvgPathFromVertices(vertices) {
  if (!vertices || vertices.length === 0) return '';
  
  let path = `M ${vertices[0].x} ${vertices[0].y} `;
  
  for (let i = 1; i < vertices.length; i++) {
    const p1 = vertices[i-1];
    const p2 = vertices[i];
    
    if (p1.bulge) {
      // Very basic arc fallback (for precise bulge math, more logic is needed)
      // We will assume mostly straight lines for this initial test, 
      // but log if we encounter arcs.
      console.warn('Bulge (Arc) encountered. Basic straight line used as fallback for now.');
    }
    
    path += `L ${p2.x} ${p2.y} `;
  }
  
  // Close path if it's a closed polyline (often true for profile boundaries)
  path += 'Z';
  return path;
}

export function parseDxfToReact(dxfFilePath) {
  const fileText = fs.readFileSync(dxfFilePath, 'utf-8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(fileText);

  const result = {
    system: "IGLO_5",
    type: "F104",
    profiles: {}
  };

  dxf.entities.forEach(ent => {
    // Only capture our target layers for the scalable engine
    if (ent.layer === 'FRM_EXT' || ent.layer === 'FRM_INT' || ent.layer === 'BZD') {
      if (ent.type === 'LWPOLYLINE' || ent.type === 'POLYLINE') {
        const svgPath = getSvgPathFromVertices(ent.vertices);
        
        result.profiles[ent.layer] = {
          svgPath: svgPath,
          vertices: ent.vertices.map(v => ({ x: v.x, y: v.y }))
        };
      }
    }
  });

  return result;
}

// Run if called directly
if (process.argv[1] && process.argv[1].includes('dxfToReact.mjs')) {
  const file = process.argv[2] || "C:\\Users\\Shadow\\Desktop\\Isolated IGLO 5 Single Window Frame.dxf";
  const output = parseDxfToReact(file);
  const outDir = 'src/data/profiles';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(`${outDir}/IG5_F104.json`, JSON.stringify(output, null, 2));
  console.log(`Successfully generated ${outDir}/IG5_F104.json`);
}
