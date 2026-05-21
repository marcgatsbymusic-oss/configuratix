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

export function parseDxfToReact(dxfFilePath, type = "F104") {
  const fileText = fs.readFileSync(dxfFilePath, 'utf-8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(fileText);

  const result = {
    system: "IGLO_5",
    type: type,
    profiles: {}
  };

  const targetLayers = ['FRM_EXT', 'FRM_INT', 'BZD', 'GLS_EXT', 'GLS_INT', 'SPACER1', 'GLS', 'SSH_EXT', 'SSH_INT'];

  // Buffer to collect vertices for layers that are made of disconnected lines (like glass)
  const layerVertices = {};

  function extractEntity(ent, offsetX = 0, offsetY = 0) {
    const layerName = ent.layer.toUpperCase();
    if (targetLayers.includes(layerName)) {
      if (!layerVertices[layerName]) layerVertices[layerName] = [];
      
      if (ent.type === 'LWPOLYLINE' || ent.type === 'POLYLINE' || ent.type === 'LINE') {
        if (ent.vertices) {
          ent.vertices.forEach(v => layerVertices[layerName].push({ x: v.x + offsetX, y: v.y + offsetY }));
        }
      }
    }
  }

  dxf.entities.forEach(ent => {
    extractEntity(ent);
    
    // Check block references
    if (ent.type === 'INSERT') {
      const block = dxf.blocks[ent.name];
      if (block && block.entities) {
        block.entities.forEach(blockEnt => {
          extractEntity(blockEnt, ent.position.x || 0, ent.position.y || 0);
        });
      }
    }
  });

  // Now process the collected vertices. 
  for (const [layerName, points] of Object.entries(layerVertices)) {
    if (points.length === 0) continue;

    if (type === 'F100' && layerName === 'GLS_INT') {
      // Split GLS_INT package bounding box into outer pane (GLS_EXT), inner pane (GLS_INT) and spacer (SPACER1)
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      points.forEach(p => {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      });

      const glsExtVertices = [
        { x: minX, y: minY },
        { x: minX + 4, y: minY },
        { x: minX + 4, y: maxY },
        { x: minX, y: maxY }
      ];
      result.profiles['GLS_EXT'] = {
        svgPath: getSvgPathFromVertices(glsExtVertices),
        vertices: glsExtVertices
      };

      const glsIntVertices = [
        { x: maxX - 4, y: minY },
        { x: maxX, y: minY },
        { x: maxX, y: maxY },
        { x: maxX - 4, y: maxY }
      ];
      result.profiles['GLS_INT'] = {
        svgPath: getSvgPathFromVertices(glsIntVertices),
        vertices: glsIntVertices
      };

      const spacerVertices = [
        { x: minX + 4, y: minY },
        { x: maxX - 4, y: minY },
        { x: maxX - 4, y: minY + 14 },
        { x: minX + 4, y: minY + 14 }
      ];
      result.profiles['SPACER1'] = {
        svgPath: getSvgPathFromVertices(spacerVertices),
        vertices: spacerVertices
      };
    } else if (layerName === 'GLS_EXT' || layerName === 'GLS_INT' || layerName === 'SPACER1') {
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      points.forEach(p => {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      });
      const rectVertices = [
        { x: minX, y: minY },
        { x: maxX, y: minY },
        { x: maxX, y: maxY },
        { x: minX, y: maxY }
      ];
      result.profiles[layerName] = {
        svgPath: getSvgPathFromVertices(rectVertices),
        vertices: rectVertices
      };
    } else {
      // For frames, just use the points in order
      result.profiles[layerName] = {
        svgPath: getSvgPathFromVertices(points),
        vertices: points
      };
    }
  }

  return result;
}

// Run if called directly
if (process.argv[1] && process.argv[1].includes('dxfToReact.mjs')) {
  const file = process.argv[2] || "C:\\Users\\Shadow\\Desktop\\Isolated IGLO 5 Single Window Frame.dxf";
  
  let outName = "IG5_F104.json";
  let type = "F104";
  
  for (let i = 2; i < process.argv.length; i++) {
    if (process.argv[i] === '--out' && process.argv[i + 1]) {
      outName = process.argv[i + 1];
      i++;
    } else if (process.argv[i] === '--type' && process.argv[i + 1]) {
      type = process.argv[i + 1];
      i++;
    }
  }

  const output = parseDxfToReact(file, type);
  output.type = type;
  
  const outDir = 'src/data/profiles';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  
  const finalPath = (outName.includes('/') || outName.includes('\\')) ? outName : `${outDir}/${outName}`;
  fs.writeFileSync(finalPath, JSON.stringify(output, null, 2));
  console.log(`Successfully generated ${finalPath} with type ${type}`);
}
