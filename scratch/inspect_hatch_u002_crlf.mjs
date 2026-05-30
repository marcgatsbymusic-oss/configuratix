import fs from 'fs';

const file = "C:\\Users\\Shadow\\Cloud-Drive\\Web dev Drutex Product Content\\CAD Files Drutex\\DWG to DXF conversion tests\\IGLO 5 Drawing1.dxf";
const fileText = fs.readFileSync(file, 'utf-8');

// Find BLOCK U-002 and print all lines until ENDBLK
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
      // Check if this block is U-002
      const nameIdx = blockLines.indexOf("U-002");
      if (nameIdx !== -1) {
        console.log(`Found block U-002 with ${blockLines.length} lines.`);
        // Let's print out lines that contain coordinates or HATCH settings
        blockLines.forEach((l, idx) => {
          if (l === "HATCH" || l === "10" || l === "20" || l === "11" || l === "21" || l === "72" || l === "93") {
            console.log(`Line #${idx}: code="${l}", val="${blockLines[idx+1] || ''}"`);
          }
        });
        break;
      }
      inBlock = false;
    }
  }
}
