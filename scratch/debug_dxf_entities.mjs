import fs from 'fs';
import DxfParser from 'dxf-parser';

const dxfFilePath = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\system\\systemy Drutex\\Processed DWGs by Marc\\Iglo 5_ window_horizontal with sash.dxf";

try {
  const fileText = fs.readFileSync(dxfFilePath, 'utf-8');
  const parser = new DxfParser();
  const dxf = parser.parseSync(fileText);

  console.log("Analyzing entities...");

  function getBounds(vertices) {
    if (!vertices || vertices.length === 0) return null;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    vertices.forEach(v => {
      if (v.x < minX) minX = v.x;
      if (v.x > maxX) maxX = v.x;
      if (v.y < minY) minY = v.y;
      if (v.y > maxY) maxY = v.y;
    });
    return { minX, maxX, minY, maxY };
  }

  const layerSummary = {};

  dxf.entities.forEach(ent => {
    const layer = ent.layer;
    if (!layerSummary[layer]) {
      layerSummary[layer] = [];
    }
    
    let vertices = [];
    if (ent.vertices) {
      vertices = ent.vertices;
    }
    
    layerSummary[layer].push({
      type: ent.type,
      verticesCount: vertices.length,
      bounds: getBounds(vertices)
    });
  });

  for (const [layer, entities] of Object.entries(layerSummary)) {
    console.log(`Layer: ${layer} (${entities.length} entities)`);
    entities.forEach((ent, idx) => {
      console.log(`  Ent ${idx}: Type=${ent.type}, Verts=${ent.verticesCount}, Bounds=${ent.bounds ? JSON.stringify(ent.bounds) : 'N/A'}`);
    });
  }
} catch (e) {
  console.error(e);
}
