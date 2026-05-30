import fs from 'fs';

const file = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG to DXF conversion tests\\IGLO 5 Drawing1.dxf";
const fileText = fs.readFileSync(file, 'utf-8');

// A block definition in BLOCKS section starts with 0\nBLOCK\n and has 2\nU-002\n
// Let's find BLOCK with U-002
const blockQuery = "BLOCK\n  5\n"; // or similar, let's search for BLOCK and U-002 close to each other.

// Let's find all occurrences of "U-002" in the file
let idx = fileText.indexOf("U-002");
while (idx !== -1) {
  console.log(`Found "U-002" at index ${idx}`);
  // Let's check if there is a BLOCK or INSERT or BLOCK_RECORD nearby
  const start = Math.max(0, idx - 100);
  const end = Math.min(fileText.length, idx + 500);
  console.log(`Context:\n${fileText.substring(start, end)}\n------------------`);
  idx = fileText.indexOf("U-002", idx + 1);
}
