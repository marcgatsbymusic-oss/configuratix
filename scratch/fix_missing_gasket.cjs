const fs = require('fs');

const allProfiles = JSON.parse(fs.readFileSync('./src/data/profiles/IGLO5/IG5_iglo5_all_profiles.json'));
const z30 = JSON.parse(fs.readFileSync('./src/data/profiles/IGLO5/zlozenie_30.json'));

const gskInt = allProfiles.profiles['GSK_INT'];
console.log('GSK_INT contours:', gskInt ? gskInt.contours.length : 'missing');

// Check bounds of GSK_INT
let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
gskInt.contours.forEach(c => {
    c.points.forEach(p => {
        if(p.x < minX) minX = p.x;
        if(p.x > maxX) maxX = p.x;
        if(p.y < minY) minY = p.y;
        if(p.y > maxY) maxY = p.y;
    });
});
console.log('GSK_INT bounds:', {minX, maxX, minY, maxY});

// In z30, the POST_INT is at some position. 
// We want to find its groove. Let's find the bounding box of POST_INT to understand its position.
const postInt = z30.layers['POST_INT'];
let pMinX = Infinity, pMaxX = -Infinity, pMinY = Infinity, pMaxY = -Infinity;
postInt.contours.forEach(c => {
    c.points.forEach(p => {
        if(p.x < pMinX) pMinX = p.x;
        if(p.x > pMaxX) pMaxX = p.x;
        if(p.y < pMinY) pMinY = p.y;
        if(p.y > pMaxY) pMaxY = p.y;
    });
});
console.log('POST_INT bounds in z30:', {pMinX, pMaxX, pMinY, pMaxY});

// In IG5_iglo5_all_profiles.json, where is FRM_INT?
const frmInt = allProfiles.profiles['FRM_INT'];
let fMinX = Infinity, fMaxX = -Infinity, fMinY = Infinity, fMaxY = -Infinity;
frmInt.contours.forEach(c => {
    c.points.forEach(p => {
        if(p.x < fMinX) fMinX = p.x;
        if(p.x > fMaxX) fMaxX = p.x;
        if(p.y < fMinY) fMinY = p.y;
        if(p.y > fMaxY) fMaxY = p.y;
    });
});
console.log('FRM_INT bounds in all_profiles:', {fMinX, fMaxX, fMinY, fMaxY});
