const fs = require('fs');

const allProfiles = JSON.parse(fs.readFileSync('./src/data/profiles/IGLO5/IG5_iglo5_all_profiles.json'));
const z30 = JSON.parse(fs.readFileSync('./src/data/profiles/IGLO5/zlozenie_30.json'));
const z02 = JSON.parse(fs.readFileSync('./src/data/profiles/IGLO5/zlozenie_02.json'));

const gskIntRaw = allProfiles.profiles['GSK_INT'].rawVertices;

// Find peak of GSK_INT
let gPeakX = -Infinity, gPeakY = 0;
gskIntRaw.forEach(p => {
    if (p.x > gPeakX) {
        gPeakX = p.x;
        gPeakY = p.y;
    }
});
console.log('GSK_INT peak:', gPeakX, gPeakY);

// Find rebate groove peak in POST_INT (z30)
let p30PeakX = -Infinity, p30PeakY = 0;
z30.layers['POST_INT'].contours.forEach(c => {
    c.points.forEach(p => {
        // The rebate groove in POST_INT is at Y ~ 86
        if (p.y > 75 && p.y < 95) {
            if (p.x > p30PeakX) {
                p30PeakX = p.x;
                p30PeakY = p.y;
            }
        }
    });
});
console.log('POST_INT z30 rebate groove peak:', p30PeakX, p30PeakY);

// Calculate offset for z30
const dx30 = p30PeakX - gPeakX;
const dy30 = p30PeakY - gPeakY;
console.log('Offset for z30:', dx30, dy30);

// Generate GSK_POST_INT for z30
const gskPostInt30 = gskIntRaw.map(p => ({
    x: Number((p.x + dx30).toFixed(3)),
    y: Number((p.y + dy30).toFixed(3))
}));
z30.layers['GSK_POST_INT'] = {
    contours: [{ closed: true, points: gskPostInt30 }]
};
fs.writeFileSync('./src/data/profiles/IGLO5/zlozenie_30.json', JSON.stringify(z30, null, 2));
console.log('Injected GSK_POST_INT into zlozenie_30.json');

// Find rebate groove peak in FRM_INT (z02)
let p02PeakX = -Infinity, p02PeakY = 0;
z02.layers['FRM_INT'].contours.forEach(c => {
    c.points.forEach(p => {
        // The rebate groove in FRM_INT is at Y ~ 45
        if (p.y > 35 && p.y < 55) {
            if (p.x > p02PeakX) {
                p02PeakX = p.x;
                p02PeakY = p.y;
            }
        }
    });
});
console.log('FRM_INT z02 rebate groove peak:', p02PeakX, p02PeakY);

// Calculate offset for z02
const dx02 = p02PeakX - gPeakX;
const dy02 = p02PeakY - gPeakY;
console.log('Offset for z02:', dx02, dy02);

// Generate GSK_FRM_INT for z02
const gskFrmInt02 = gskIntRaw.map(p => ({
    x: Number((p.x + dx02).toFixed(3)),
    y: Number((p.y + dy02).toFixed(3))
}));
z02.layers['GSK_FRM_INT'] = {
    contours: [{ closed: true, points: gskFrmInt02 }]
};
fs.writeFileSync('./src/data/profiles/IGLO5/zlozenie_02.json', JSON.stringify(z02, null, 2));
console.log('Injected GSK_FRM_INT into zlozenie_02.json');
