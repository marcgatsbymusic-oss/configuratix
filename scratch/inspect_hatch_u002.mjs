import fs from 'fs';

const file = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG to DXF conversion tests\\IGLO 5 Drawing1.dxf";
const fileText = fs.readFileSync(file, 'utf-8');

// We want to find block U-002 definition and parse the HATCH entity inside it.
// Let's locate "BLOCK" followed by "U-002"
const startIdx = fileText.indexOf("BLOCK\n  5\n");
// Let's find U-002 block
let searchStart = 0;
let blockContent = "";
while (true) {
  const blockIdx = fileText.indexOf("BLOCK\n", searchStart);
  if (blockIdx === -1) break;
  const nameIdx = fileText.indexOf("\n  2\nU-002\n", blockIdx);
  if (nameIdx !== -1 && nameIdx < blockIdx + 200) {
    // Found block U-002!
    const endIdx = fileText.indexOf("ENDBLK\n", blockIdx);
    blockContent = fileText.substring(blockIdx, endIdx);
    break;
  }
  searchStart = blockIdx + 6;
}

console.log("Block U-002 content length:", blockContent.length);

// Let's parse boundary vertices in the HATCH entity inside U-002
// In a HATCH entity, group code 92 indicates boundary path type.
// Group code 93 is number of edges.
// If code 72 is edge type (1 = Line, 2 = Arc, 3 = Ellipse, 4 = Spline)
// Or if it's polyline boundary, code 93 is number of vertices.
// Let's write a simple parser to print out all numbers following code 10, 20 (for points) or in boundary paths.
const lines = blockContent.split("\n");
let points = [];
for (let i = 0; i < lines.length; i++) {
  const code = lines[i].trim();
  const val = lines[i+1] ? lines[i+1].trim() : "";
  if (code === "10" || code === "20") {
    console.log(`Code ${code}: ${val}`);
  }
}
