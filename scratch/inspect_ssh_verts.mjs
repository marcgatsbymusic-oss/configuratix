import fs from 'fs';

const f2xx1 = JSON.parse(fs.readFileSync('src/data/profiles/IGLO5/IG5_F2XX1.json', 'utf8'));

const sshIntVerts = f2xx1.profiles.SSH_INT?.vertices || [];
const gskSshBtmVerts = f2xx1.profiles.GSK_SSH_BTM?.vertices || [];

console.log("SSH_INT vertices with y < 45:");
sshIntVerts.filter(v => v.y < 45).forEach(v => {
  console.log(`  x=${v.x.toFixed(2)}, y=${v.y.toFixed(2)}`);
});

console.log("\nGSK_SSH_BTM vertices with y < 45:");
gskSshBtmVerts.filter(v => v.y < 45).forEach(v => {
  console.log(`  x=${v.x.toFixed(2)}, y=${v.y.toFixed(2)}`);
});
