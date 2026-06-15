import fs from 'fs';

const f2xx1 = JSON.parse(fs.readFileSync('src/data/profiles/IGLO5/IG5_F2XX1.json', 'utf8'));

const sshIntVerts = f2xx1.profiles.SSH_INT?.vertices || [];

console.log("SSH_INT vertices with x < 82:");
sshIntVerts.filter(v => v.x < 82).forEach(v => {
  console.log(`  x=${v.x.toFixed(2)}, y=${v.y.toFixed(2)}`);
});
