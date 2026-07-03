const fs = require('fs');

const allProfiles = JSON.parse(fs.readFileSync('./src/data/profiles/IGLO5/IG5_iglo5_all_profiles.json'));
const z30 = JSON.parse(fs.readFileSync('./src/data/profiles/IGLO5/zlozenie_30.json'));

const gskInt = allProfiles.profiles['GSK_INT'];
const postInt = z30.layers['POST_INT'];

// Find a reference point in POST_INT.
// The groove we are looking for is on the INT side (right side, so high X).
// It's in the middle (around Y=42 to Y=55).
let maxGrooveX = -Infinity;
let grooveY = 0;
postInt.contours.forEach(c => {
    c.points.forEach(p => {
        // Look for points in the middle Y range
        if (p.y > 40 && p.y < 60) {
            if (p.x > maxGrooveX) {
                maxGrooveX = p.x;
                grooveY = p.y;
            }
        }
    });
});
console.log('POST_INT groove peak:', {x: maxGrooveX, y: grooveY});

// Let's find the corresponding peak in GSK_INT
let gskMinX = Infinity;
let gskPeakY = 0;
gskInt.contours.forEach(c => {
    c.points.forEach(p => {
        if (p.x < gskMinX) {
            gskMinX = p.x;
            gskPeakY = p.y;
        }
    });
});
console.log('GSK_INT back peak:', {x: gskMinX, y: gskPeakY});

// In all_profiles, GSK_INT snaps into FRM_INT.
const frmInt = allProfiles.profiles['FRM_INT'];
let frmMaxX = -Infinity;
let frmGrooveY = 0;
frmInt.contours.forEach(c => {
    c.points.forEach(p => {
        if (p.y > 50 && p.y < 70) {
            if (p.x > frmMaxX) {
                frmMaxX = p.x;
                frmGrooveY = p.y;
            }
        }
    });
});
console.log('FRM_INT groove peak:', {x: frmMaxX, y: frmGrooveY});

