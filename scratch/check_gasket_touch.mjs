import fs from 'fs';

const f2xx1 = JSON.parse(fs.readFileSync('src/data/profiles/IGLO5/IG5_F2XX1.json', 'utf8'));

const sshIntVerts = f2xx1.profiles.SSH_INT?.vertices || [];
const gskSshBtmVerts = f2xx1.profiles.GSK_SSH_BTM?.vertices || [];

console.log("Checking if GSK_SSH_BTM touches SSH_INT:");
let minDist = Infinity;
let closestSsh = null;
let closestGsk = null;

for (const vSsh of sshIntVerts) {
  for (const vGsk of gskSshBtmVerts) {
    const dist = Math.hypot(vSsh.x - vGsk.x, vSsh.y - vGsk.y);
    if (dist < minDist) {
      minDist = dist;
      closestSsh = vSsh;
      closestGsk = vGsk;
    }
  }
}

console.log(`Minimum distance: ${minDist.toFixed(4)} mm`);
console.log(`Closest SSH vertex: x=${closestSsh?.x.toFixed(2)}, y=${closestSsh?.y.toFixed(2)}`);
console.log(`Closest GSK vertex: x=${closestGsk?.x.toFixed(2)}, y=${closestGsk?.y.toFixed(2)}`);
