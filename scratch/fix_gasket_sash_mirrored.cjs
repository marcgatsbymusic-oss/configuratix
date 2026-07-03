const fs = require('fs');
const path = require('path');

const z02Path = path.resolve('src/data/profiles/IGLO5/zlozenie_02.json');
const z30Path = path.resolve('src/data/profiles/IGLO5/zlozenie_30.json');
const libPath = path.resolve('src/data/profiles/IGLO5/IG5_iglo5_all_profiles.json');

const z02 = JSON.parse(fs.readFileSync(z02Path, 'utf8'));
const z30 = JSON.parse(fs.readFileSync(z30Path, 'utf8'));
const lib = JSON.parse(fs.readFileSync(libPath, 'utf8'));

const gskIntRaw = lib.profiles.GSK_INT.rawVertices;

// 1. Extract only the outer loop (indices 9 to 40)
const outerLoop = gskIntRaw.slice(9, 41); // up to 40 inclusive

// 2. Constants for mirroring and translation
// The minimum X of the outer loop is 10.87
const minX = 10.87;
const anchorX = 79.5; // the back of the groove

// The midpoint of the anchor is 60.365
const anchorMidY = 60.365;
const targetMidY_z30 = 84.2;
const targetMidY_z02 = 43.2;

const dy30 = targetMidY_z30 - anchorMidY;
const dy02 = targetMidY_z02 - anchorMidY;

const gskSshInt30 = outerLoop.map(p => ({
  x: anchorX - (p.x - minX),
  y: p.y + dy30,
  bulge: p.bulge ? -p.bulge : 0
}));

z30.layers['GSK_SSH_INT'] = {
  contours: [{ closed: true, points: gskSshInt30 }]
};
fs.writeFileSync(z30Path, JSON.stringify(z30, null, 2));

const gskSshInt02 = outerLoop.map(p => ({
  x: anchorX - (p.x - minX),
  y: p.y + dy02,
  bulge: p.bulge ? -p.bulge : 0
}));

z02.layers['GSK_SSH_INT'] = {
  contours: [{ closed: true, points: gskSshInt02 }]
};
fs.writeFileSync(z02Path, JSON.stringify(z02, null, 2));
console.log('GSK_SSH_INT successfully mirrored, cleaned, and injected.');
