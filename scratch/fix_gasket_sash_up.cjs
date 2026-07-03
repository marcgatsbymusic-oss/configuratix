const fs = require('fs');
const path = require('path');

const z02Path = path.resolve('src/data/profiles/IGLO5/zlozenie_02.json');
const z30Path = path.resolve('src/data/profiles/IGLO5/zlozenie_30.json');
const libPath = path.resolve('src/data/profiles/IGLO5/IG5_iglo5_all_profiles.json');

const z02 = JSON.parse(fs.readFileSync(z02Path, 'utf8'));
const z30 = JSON.parse(fs.readFileSync(z30Path, 'utf8'));
const lib = JSON.parse(fs.readFileSync(libPath, 'utf8'));

const gskIntRaw = lib.profiles.GSK_INT.rawVertices;
const outerLoop = gskIntRaw.slice(9, 41);

const neckX = 12.89;
const targetNeckX = 75.5;

const neckMidY = 60.5;
// The actual opening is between 82.90 and 86.10 (midpoint 84.5)
const targetMidY_z30 = 84.5;
// The actual opening is between 41.90 and 45.10 (midpoint 43.5)
const targetMidY_z02 = 43.5;

const dy30 = targetMidY_z30 - neckMidY;
const dy02 = targetMidY_z02 - neckMidY;

const gskSshInt30 = outerLoop.map(p => ({
  x: targetNeckX - (p.x - neckX),
  y: p.y + dy30,
  bulge: p.bulge ? -p.bulge : 0
}));

z30.layers['GSK_SSH_INT'] = {
  contours: [{ closed: true, points: gskSshInt30 }]
};
fs.writeFileSync(z30Path, JSON.stringify(z30, null, 2));

const gskSshInt02 = outerLoop.map(p => ({
  x: targetNeckX - (p.x - neckX),
  y: p.y + dy02,
  bulge: p.bulge ? -p.bulge : 0
}));

z02.layers['GSK_SSH_INT'] = {
  contours: [{ closed: true, points: gskSshInt02 }]
};
fs.writeFileSync(z02Path, JSON.stringify(z02, null, 2));
console.log('GSK_SSH_INT shifted UP by ~2.5mm to the actual opening.');
