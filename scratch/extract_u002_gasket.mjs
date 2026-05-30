import fs from 'fs';

const file = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG to DXF conversion tests\\IGLO 5 Drawing1.dxf";
const fileText = fs.readFileSync(file, 'utf-8');

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

// Extract vertices from HATCH boundary
const vertices = [];
let cx = null;
let cy = null;

for (let i = 0; i < blockLines.length; i++) {
  const code = blockLines[i];
  const val = blockLines[i+1] ? blockLines[i+1] : "";
  
  if (code === "10") {
    cx = parseFloat(val);
  } else if (code === "20") {
    cy = parseFloat(val);
    if (cx !== null && cy !== null) {
      vertices.push({ x: cx, y: cy });
      cx = null;
      cy = null;
    }
  }
}

console.log(`Extracted ${vertices.length} vertices for U-002:`);
vertices.forEach((v, idx) => {
  console.log(`  v[${idx}]: (${v.x.toFixed(4)}, ${v.y.toFixed(4)})`);
});

// Write to a temporary file
fs.writeFileSync("scratch/u002_vertices.json", JSON.stringify(vertices, null, 2));
