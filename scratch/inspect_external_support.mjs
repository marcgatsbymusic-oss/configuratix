import fs from 'fs';

const jsonPath = 'src/data/profiles/IgloEdge/SLE201.json';
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

console.log("Keys in layers:", Object.keys(data.layers));
if (data.layers["External hidden support piece"]) {
  console.log("Found External hidden support piece!");
} else {
  console.log("Not found in layers. Maybe it's empty or named differently.");
}
// Find if the string "External hidden support piece" exists anywhere else
const str = fs.readFileSync(jsonPath, 'utf8');
let idx = 0;
while (true) {
  idx = str.indexOf("External hidden support piece", idx);
  if (idx === -1) break;
  console.log(`Found string at index ${idx}, surrounding:`, str.substring(idx - 100, idx + 100));
  idx += 1;
}
