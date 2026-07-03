const fs = require('fs');
const path = require('path');

const z02Path = path.resolve('src/data/profiles/IGLO5/zlozenie_02.json');
const z30Path = path.resolve('src/data/profiles/IGLO5/zlozenie_30.json');
const libPath = path.resolve('src/data/profiles/IGLO5/IG5_iglo5_all_profiles.json');

const z02 = JSON.parse(fs.readFileSync(z02Path, 'utf8'));
const z30 = JSON.parse(fs.readFileSync(z30Path, 'utf8'));
const lib = JSON.parse(fs.readFileSync(libPath, 'utf8'));

const gskIntRaw = lib.profiles.GSK_INT.rawVertices;

// Find peak of gasket
let gPeakX = -Infinity, gPeakY = null;
gskIntRaw.forEach(p => {
  if (p.x > gPeakX) {
    gPeakX = p.x;
    gPeakY = p.y;
  }
});

// For z30 sash (SSH_INT)
const dx30 = 79.5 - gPeakX;
const dy30 = 86.4 - gPeakY;

const gskSshInt30 = gskIntRaw.map(p => ({
  x: p.x + dx30,
  y: p.y + dy30,
  bulge: p.bulge
}));

z30.layers['GSK_SSH_INT'] = {
  contours: [{ closed: true, points: gskSshInt30 }]
};
if (z30.layers['GSK_POST_INT']) delete z30.layers['GSK_POST_INT'];

fs.writeFileSync(z30Path, JSON.stringify(z30, null, 2));


// For z02 sash (SSH_INT)
const dx02 = 79.5 - gPeakX;
const dy02 = 45.4 - gPeakY;

const gskSshInt02 = gskIntRaw.map(p => ({
  x: p.x + dx02,
  y: p.y + dy02,
  bulge: p.bulge
}));

z02.layers['GSK_SSH_INT'] = {
  contours: [{ closed: true, points: gskSshInt02 }]
};
if (z02.layers['GSK_FRM_INT']) delete z02.layers['GSK_FRM_INT'];

fs.writeFileSync(z02Path, JSON.stringify(z02, null, 2));
console.log('GSK_SSH_INT successfully injected into z02 and z30.');
