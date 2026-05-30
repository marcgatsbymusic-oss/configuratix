import fs from 'fs';

const file = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG to DXF conversion tests\\IGLO 5 Drawing1.dxf";
const fileText = fs.readFileSync(file, 'utf-8');

// Find BLOCK U-002
const lines = fileText.split(/\r?\n/);
let inBlock = false;
let blockLines = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (line === "BLOCK") {
    inBlock = true;
    blockLines = [line];
  } else if (inBlock) {
    blockLines.push(line);
    if (line === "ENDBLK") {
      const nameIdx = blockLines.indexOf("U-002");
      if (nameIdx !== -1) {
        break;
      }
      inBlock = false;
    }
  }
}

console.log(`Found U-002 block lines: ${blockLines.length}`);

// Locate HATCH entity in block lines
let hatchStartIdx = -1;
for (let i = 0; i < blockLines.length; i++) {
  if (blockLines[i] === "HATCH") {
    hatchStartIdx = i;
    break;
  }
}

if (hatchStartIdx === -1) {
  console.error("Could not find HATCH entity in block U-002");
  process.exit(1);
}

// Helper to get group value
function getGroup(lines, startIdx, codeToFind) {
  for (let i = startIdx; i < lines.length; i++) {
    if (lines[i] === codeToFind) {
      return lines[i+1];
    }
  }
  return null;
}

// Parse hatch boundary edges
const edges = [];
let idx = hatchStartIdx;

// We need to parse group code 93 (number of edges) and then read each edge
let numEdges = 0;
while (idx < blockLines.length) {
  if (blockLines[idx] === "93") {
    numEdges = parseInt(blockLines[idx+1]);
    idx += 2;
    break;
  }
  idx++;
}

console.log(`Hatch has ${numEdges} edges`);

for (let e = 0; e < numEdges; e++) {
  // Read edge type (code 72)
  while (idx < blockLines.length && blockLines[idx] !== "72") {
    idx++;
  }
  if (idx >= blockLines.length) break;
  
  const edgeType = parseInt(blockLines[idx+1]);
  idx += 2;
  
  if (edgeType === 1) {
    // Line edge:
    // 10, 20 (start x, y)
    // 11, 21 (end x, y)
    let x1 = 0, y1 = 0, x2 = 0, y2 = 0;
    while (idx < blockLines.length) {
      const code = blockLines[idx];
      const val = blockLines[idx+1];
      if (code === "10") x1 = parseFloat(val);
      else if (code === "20") y1 = parseFloat(val);
      else if (code === "11") x2 = parseFloat(val);
      else if (code === "21") {
        y2 = parseFloat(val);
        idx += 2;
        break;
      }
      idx += 2;
    }
    edges.push({ type: 'line', x1, y1, x2, y2 });
  } else if (edgeType === 2) {
    // Arc edge:
    // 10, 20 (center cx, cy)
    // 40 (radius)
    // 50 (start angle in deg)
    // 51 (end angle in deg)
    // 73 (counterclockwise flag)
    let cx = 0, cy = 0, r = 0, a1 = 0, a2 = 0, ccw = 1;
    while (idx < blockLines.length) {
      const code = blockLines[idx];
      const val = blockLines[idx+1];
      if (code === "10") cx = parseFloat(val);
      else if (code === "20") cy = parseFloat(val);
      else if (code === "40") r = parseFloat(val);
      else if (code === "50") a1 = parseFloat(val);
      else if (code === "51") a2 = parseFloat(val);
      else if (code === "73") {
        ccw = parseInt(val);
        idx += 2;
        break;
      }
      idx += 2;
    }
    edges.push({ type: 'arc', cx, cy, r, a1, a2, ccw });
  } else {
    console.warn(`Unknown edge type ${edgeType} at edge ${e}`);
  }
}

console.log(`Parsed ${edges.length} edges successfully.`);

// Let's generate discretized vertices from these edges
const vertices = [];

edges.forEach((edge, eIdx) => {
  if (edge.type === 'line') {
    // Just add the start point. The endpoint will be added by the next edge's start or closed at the end.
    vertices.push({ x: edge.x1, y: edge.y1 });
  } else if (edge.type === 'arc') {
    // Sample the arc from a1 to a2
    let startAng = edge.a1;
    let endAng = edge.a2;
    const isCcw = edge.ccw === 1;
    
    // Normalize angles
    if (isCcw) {
      if (endAng < startAng) endAng += 360;
    } else {
      if (endAng > startAng) endAng -= 360;
    }
    
    const diff = endAng - startAng;
    // We want a point every ~15 degrees for gaskets (they are very small)
    const steps = Math.max(2, Math.ceil(Math.abs(diff) / 15));
    
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      const angleDeg = startAng + diff * t;
      const rad = angleDeg * Math.PI / 180;
      const x = edge.cx + edge.r * Math.cos(rad);
      const y = edge.cy + edge.r * Math.sin(rad);
      vertices.push({ x, y });
    }
  }
});

// Since the path is a closed loop, add the last point if it is not close to the first point
if (vertices.length > 0) {
  const pStart = vertices[0];
  let pEnd = null;
  const lastEdge = edges[edges.length - 1];
  if (lastEdge.type === 'line') {
    pEnd = { x: lastEdge.x2, y: lastEdge.y2 };
  } else {
    const rad = lastEdge.a2 * Math.PI / 180;
    pEnd = { x: lastEdge.cx + lastEdge.r * Math.cos(rad), y: lastEdge.cy + lastEdge.r * Math.sin(rad) };
  }
  
  const dist = Math.hypot(pEnd.x - pStart.x, pEnd.y - pStart.y);
  if (dist > 0.001) {
    vertices.push(pEnd);
  }
}

console.log(`Generated ${vertices.length} vertices for GSK_SSH_BTM.`);

// Save to scratch/u002_vertices.json
fs.writeFileSync("scratch/u002_vertices.json", JSON.stringify(vertices, null, 2));
console.log("Saved clean vertices to scratch/u002_vertices.json");
