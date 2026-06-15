import fs from 'fs';

const JSON_FILE = "C:\\Users\\Shadow\\.gemini\\antigravity\\scratch\\fantastic-octo-giggle\\src\\data\\profiles\\IgloEdge\\Door_Frame.json";

function main() {
  const data = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));
  const contours = data.layers.Door_Frame_INT?.contours;
  if (!contours || contours.length === 0) {
    console.log("Door_Frame_INT not found in json");
    return;
  }
  
  console.log("=== Door_Frame_INT Vertices ===");
  contours[0].points.forEach((p, idx) => {
    console.log(`[${idx}] (${p.x.toFixed(4)}, ${p.y.toFixed(4)})`);
  });
}

main();
