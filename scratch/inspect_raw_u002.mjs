import fs from 'fs';

const file = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG to DXF conversion tests\\IGLO 5 Drawing1.dxf";
const fileText = fs.readFileSync(file, 'utf-8');

// Find block U-002 definition in raw text
// A block definition starts with 0\nBLOCK\n and has 2\nU-002\n
const blockStartIdx = fileText.indexOf("U-002");
if (blockStartIdx !== -1) {
  console.log("Found U-002 index:", blockStartIdx);
  // Let's print 1000 characters around this index
  const start = Math.max(0, blockStartIdx - 200);
  const end = Math.min(fileText.length, blockStartIdx + 3000);
  console.log("Raw section:\n", fileText.substring(start, end));
} else {
  console.log("U-002 not found in text");
}
