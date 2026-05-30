import fs from 'fs';

const file = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG to DXF conversion tests\\IGLO 5 Drawing1.dxf";
const fileText = fs.readFileSync(file, 'utf-8');

let idx = fileText.indexOf("skrzydło 01");
while (idx !== -1) {
  console.log(`Found "skrzydło 01" at index ${idx}`);
  const start = Math.max(0, idx - 100);
  const end = Math.min(fileText.length, idx + 4000);
  console.log(`Context:\n${fileText.substring(start, end)}\n------------------`);
  idx = fileText.indexOf("skrzydło 01", idx + 1);
}
